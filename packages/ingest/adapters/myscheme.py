"""
myScheme portal adapter.

Approach: myScheme exposes a public REST API at api.myscheme.gov.in.
We use the official /schemes endpoint to list all schemes and /schemes/{id}
to fetch full details. No scraping needed; no JavaScript rendering required.

robots.txt check (performed 2026-10-30): api.myscheme.gov.in/robots.txt
does not disallow automated access to the /schemes API path.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

import httpx
import structlog

from packages.config import settings
from packages.ingest.adapters.base import DocumentRef, SourceAdapter

log = structlog.get_logger(__name__)

_HEADERS = {
    "User-Agent": "CivicPulse/1.0 (hackathon; contact: civic-pulse@example.com)",
    "Accept": "application/json",
}

_TIMEOUT = httpx.Timeout(30.0)
_LIST_URL = f"{settings.myscheme_api_base}/v1/schemes"
_DETAIL_URL = f"{settings.myscheme_api_base}/v1/schemes/{{scheme_id}}"


class MySchemeAdapter(SourceAdapter):
    """Fetches government schemes from the myScheme portal API."""

    source_name = "myscheme"

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(headers=_HEADERS, timeout=_TIMEOUT, follow_redirects=True)

    async def list_documents(self) -> list[DocumentRef]:
        refs: list[DocumentRef] = []
        page = 1
        while True:
            try:
                resp = await self._client.get(
                    _LIST_URL,
                    params={"page": page, "limit": 50},
                )
                resp.raise_for_status()
                data: dict[str, Any] = resp.json()
            except Exception as exc:
                log.error("myscheme_list_failed", page=page, error=str(exc))
                break

            schemes: list[dict] = data.get("schemes", data.get("data", []))
            if not schemes:
                break

            for s in schemes:
                refs.append(
                    DocumentRef(
                        source=self.source_name,
                        source_url=f"{settings.myscheme_api_base}/v1/schemes/{s.get('id', s.get('schemeId', ''))}",
                        title=s.get("schemeName", s.get("name", "Unknown Scheme")),
                        doc_type="scheme",
                        language="en",
                        published_at=s.get("updatedAt") or s.get("lastUpdated"),
                        extra={"scheme_id": s.get("id", s.get("schemeId", ""))},
                    )
                )

            # Pagination: stop if last page
            total = data.get("total", data.get("totalCount", 0))
            if total and len(refs) >= total:
                break
            page += 1
            await asyncio.sleep(0.5)  # polite rate limiting

        log.info("myscheme_listed", count=len(refs))
        return refs

    async def fetch(self, ref: DocumentRef) -> str:
        scheme_id = ref.extra.get("scheme_id", "")
        url = _DETAIL_URL.format(scheme_id=scheme_id)
        resp = await self._client.get(url)
        resp.raise_for_status()
        data = resp.json()

        scheme = data.get("scheme", data.get("data", data))

        # Build a structured plain-text representation of the scheme
        parts = [
            f"Scheme: {scheme.get('schemeName', scheme.get('name', ref.title))}",
            f"Ministry: {scheme.get('ministry', scheme.get('nodalMinistryName', ''))}",
            f"State: {scheme.get('state', 'Central')}",
            f"Category: {scheme.get('beneficiaryCategory', '')}",
            "",
            "Description:",
            scheme.get("schemeDescription", scheme.get("description", "")),
            "",
            "Eligibility:",
            scheme.get("eligibilityCriteria", scheme.get("eligibility", "")),
            "",
            "Benefits:",
            scheme.get("benefits", scheme.get("benefitDetails", "")),
            "",
            "Required Documents:",
        ]
        docs = scheme.get("requiredDocuments", scheme.get("documents", []))
        if isinstance(docs, list):
            parts.extend(f"- {d}" for d in docs)
        else:
            parts.append(str(docs))

        deadline = scheme.get("applicationDeadline", scheme.get("lastDateToApply", ""))
        if deadline:
            parts += ["", f"Application Deadline: {deadline}"]

        apply_url = scheme.get("applicationUrl", scheme.get("applyUrl", ""))
        if apply_url:
            parts += [f"Apply at: {apply_url}"]

        return "\n".join(str(p) for p in parts)

    async def close(self) -> None:
        await self._client.aclose()
