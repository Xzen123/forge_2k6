"""
Ingestion pipeline — orchestrates fetching, hashing, change detection,
and storage of SourceDocument records.

Usage:
    from packages.ingest.pipeline import IngestPipeline
    pipeline = IngestPipeline(db_session)
    await pipeline.run_source("myscheme")
"""

from __future__ import annotations

import asyncio
import hashlib
import uuid
from datetime import datetime, timezone
from typing import Optional

import structlog
from tenacity import (
    AsyncRetrying,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential_jitter,
)
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from packages.config import settings
from packages.ingest.adapters.base import CircuitBreaker, DocumentRef, SourceAdapter
from packages.ingest.adapters.myscheme import MySchemeAdapter
from packages.ingest.adapters.pib import PIBAdapter
from packages.ingest.adapters.data_gov_in import DataGovInAdapter
from packages.ingest.adapters.india_code import IndiaCodeAdapter
from packages.knowledge.db import AuditLogModel, DocumentModel, IngestionRunModel
from packages.knowledge.schemas import SourceDocument

log = structlog.get_logger(__name__)

_ADAPTERS: dict[str, type[SourceAdapter]] = {
    "myscheme": MySchemeAdapter,
    "pib": PIBAdapter,
    "data_gov_in": DataGovInAdapter,
    "india_code": IndiaCodeAdapter,
}

_circuit_breakers: dict[str, CircuitBreaker] = {
    name: CircuitBreaker(
        threshold=settings.ingest_circuit_breaker_threshold,
        cooldown_seconds=settings.ingest_circuit_breaker_cooldown,
    )
    for name in _ADAPTERS
}


def _normalise_text(text: str) -> str:
    """Normalise whitespace and unicode for consistent hashing."""
    import unicodedata
    text = unicodedata.normalize("NFKC", text)
    return " ".join(text.split())


def _hash(text: str) -> str:
    return hashlib.sha256(_normalise_text(text).encode("utf-8")).hexdigest()


def _text_diff_summary(old: str, new: str) -> str:
    """Return a brief summary of what changed between two texts (first diverging region)."""
    old_words = old.split()[:100]
    new_words = new.split()[:100]
    import difflib
    matcher = difflib.SequenceMatcher(None, old_words, new_words)
    opcodes = [op for op in matcher.get_opcodes() if op[0] != "equal"]
    if not opcodes:
        return "minor whitespace changes"
    op, i1, i2, j1, j2 = opcodes[0]
    old_snippet = " ".join(old_words[i1:i2])
    new_snippet = " ".join(new_words[j1:j2])
    return f"Changed: «{old_snippet}» → «{new_snippet}» (and possibly more)"


class IngestPipeline:
    """Runs the full ingestion pipeline for one or all sources."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db

    async def run_source(self, source_name: str) -> IngestionRunModel:
        """Run ingestion for a single source. Returns the IngestionRunModel."""
        if source_name not in _ADAPTERS:
            raise ValueError(f"Unknown source: {source_name!r}. Available: {list(_ADAPTERS)}")

        cb = _circuit_breakers[source_name]
        if cb.is_open:
            log.warning("circuit_breaker_open_skipping", source=source_name)
            run = IngestionRunModel(
                id=uuid.uuid4(),
                source=source_name,
                started_at=datetime.now(timezone.utc),
                ended_at=datetime.now(timezone.utc),
                success=False,
                error_detail="Circuit breaker open — source skipped during cooldown.",
            )
            self._db.add(run)
            await self._db.commit()
            return run

        adapter: SourceAdapter = _ADAPTERS[source_name]()
        run = IngestionRunModel(
            id=uuid.uuid4(),
            source=source_name,
            started_at=datetime.now(timezone.utc),
        )
        self._db.add(run)
        await self._db.flush()

        docs_seen = docs_new = docs_changed = errors = 0

        try:
            refs = await self._list_with_retry(adapter)
            docs_seen = len(refs)

            for ref in refs:
                try:
                    await self._process_ref(adapter, ref, run.id, lambda: None)
                    # Count new/changed via side effects in _process_ref
                except Exception as exc:
                    errors += 1
                    log.error(
                        "ingest_ref_failed",
                        source=source_name,
                        url=ref.source_url,
                        error=str(exc),
                    )

            # Re-query run stats
            result = await self._db.execute(
                select(IngestionRunModel).where(IngestionRunModel.id == run.id)
            )
            run = result.scalar_one()
            run.docs_seen = docs_seen
            run.ended_at = datetime.now(timezone.utc)
            run.success = True
            cb.record_success()

        except Exception as exc:
            log.error("ingest_source_failed", source=source_name, error=str(exc))
            run.ended_at = datetime.now(timezone.utc)
            run.success = False
            run.error_detail = str(exc)
            cb.record_failure()

        finally:
            await adapter.close()
            await self._db.commit()

        return run

    async def _list_with_retry(self, adapter: SourceAdapter) -> list[DocumentRef]:
        async for attempt in AsyncRetrying(
            stop=stop_after_attempt(settings.ingest_max_retries),
            wait=wait_exponential_jitter(
                initial=settings.ingest_backoff_base, max=60, jitter=5
            ),
            retry=retry_if_exception_type(Exception),
            reraise=True,
        ):
            with attempt:
                return await adapter.list_documents()
        return []  # unreachable

    async def _process_ref(
        self, adapter: SourceAdapter, ref: DocumentRef, run_id: uuid.UUID, _counter_cb
    ) -> None:
        """Fetch one document, detect changes, and store."""
        # Fetch with retry
        raw_text = ""
        async for attempt in AsyncRetrying(
            stop=stop_after_attempt(settings.ingest_max_retries),
            wait=wait_exponential_jitter(
                initial=settings.ingest_backoff_base, max=60, jitter=5
            ),
            reraise=True,
        ):
            with attempt:
                raw_text = await adapter.fetch(ref)

        if not raw_text or not raw_text.strip():
            log.warning("empty_document", url=ref.source_url)
            return

        new_hash = _hash(raw_text)

        # Look for existing latest document with same URL
        result = await self._db.execute(
            select(DocumentModel).where(
                DocumentModel.source_url == ref.source_url,
                DocumentModel.is_latest.is_(True),
            )
        )
        existing: Optional[DocumentModel] = result.scalar_one_or_none()

        if existing is not None:
            if existing.content_hash == new_hash:
                # No change — idempotent, skip
                log.debug("no_change", url=ref.source_url)
                return
            # Content changed — archive old, store new, emit audit event
            existing.is_latest = False
            diff = _text_diff_summary(existing.raw_text, raw_text)
            audit_event = AuditLogModel(
                id=uuid.uuid4(),
                event_type="document_changed",
                source=ref.source,
                document_id=existing.id,
                payload={
                    "old_hash": existing.content_hash,
                    "new_hash": new_hash,
                    "diff_summary": diff,
                    "url": ref.source_url,
                },
                created_at=datetime.now(timezone.utc),
            )
            self._db.add(audit_event)
            log.info("document_changed", url=ref.source_url, diff=diff)

        # Parse published_at
        published_at: Optional[datetime] = None
        if ref.published_at:
            try:
                from datetime import datetime as dt
                published_at = dt.fromisoformat(ref.published_at.replace("Z", "+00:00"))
            except Exception:
                pass

        doc = DocumentModel(
            id=uuid.uuid4(),
            source=ref.source,
            source_url=ref.source_url,
            title=ref.title,
            doc_type=ref.doc_type,
            language=ref.language,
            raw_text=raw_text,
            fetched_at=datetime.now(timezone.utc),
            content_hash=new_hash,
            published_at=published_at,
            is_latest=True,
        )
        self._db.add(doc)
        await self._db.flush()
        log.info("document_stored", source=ref.source, url=ref.source_url, is_new=existing is None)

    async def run_all(self) -> list[IngestionRunModel]:
        """Run ingestion for every registered source."""
        runs = []
        for name in _ADAPTERS:
            run = await self.run_source(name)
            runs.append(run)
        return runs
