"""
Knowledge store: chunking, embedding, and hybrid retrieval.

Chunking strategy: split by section, then by token window (300-500 tokens),
with 50-token overlap. Embeds with a local multilingual sentence-transformer.

Hybrid search: pgvector (cosine ANN) + Postgres full-text, merged via
Reciprocal Rank Fusion (RRF), then LLM reranked top-5.
"""

from __future__ import annotations

import hashlib
import time
import uuid
from typing import Any, Optional

import structlog
from pgvector.sqlalchemy import Vector
from sentence_transformers import SentenceTransformer
from sqlalchemy import cast, func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from packages.config import settings
from packages.knowledge.db import ChunkModel, DocumentModel, EligibilityRuleModel
from packages.knowledge.schemas import Chunk, EligibilityRule

log = structlog.get_logger(__name__)

# ---------------------------------------------------------------------------
# Embedding model (lazy singleton)
# ---------------------------------------------------------------------------

_model: Optional[SentenceTransformer] = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        log.info("loading_embedding_model", model=settings.embedding_model)
        _model = SentenceTransformer(settings.embedding_model)
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Batch embed a list of texts. Caches nothing here — caller must dedup."""
    model = _get_model()
    vectors = model.encode(
        texts,
        batch_size=settings.embedding_batch_size,
        show_progress_bar=False,
        normalize_embeddings=True,
    )
    return [v.tolist() for v in vectors]


# ---------------------------------------------------------------------------
# Chunking
# ---------------------------------------------------------------------------

_CHUNK_TOKENS = 400
_OVERLAP_TOKENS = 50
_CHARS_PER_TOKEN = 4  # rough estimate


def _chunk_text(
    text: str,
    section: str = "",
    chunk_tokens: int = _CHUNK_TOKENS,
    overlap_tokens: int = _OVERLAP_TOKENS,
) -> list[tuple[str, str]]:
    """Split text into overlapping windows. Returns list of (section, chunk_text)."""
    chunk_chars = chunk_tokens * _CHARS_PER_TOKEN
    overlap_chars = overlap_tokens * _CHARS_PER_TOKEN

    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_chars, len(text))
        chunk = text[start:end].strip()
        if chunk:
            chunks.append((section, chunk))
        if end >= len(text):
            break
        start = end - overlap_chars
    return chunks


def chunk_document(
    doc_id: uuid.UUID,
    raw_text: str,
    sections: list[tuple[str, str]],
    metadata: dict[str, Any],
) -> list[Chunk]:
    """Split a document into Chunks ready for embedding."""
    all_chunks: list[Chunk] = []

    if sections:
        for heading, body in sections:
            if not body.strip():
                continue
            for section_name, chunk_text in _chunk_text(body, section=heading):
                all_chunks.append(
                    Chunk(
                        id=uuid.uuid4(),
                        document_id=doc_id,
                        text=chunk_text,
                        page_or_section=section_name or None,
                        metadata=metadata,
                    )
                )
    else:
        for _, chunk_text in _chunk_text(raw_text, section=""):
            all_chunks.append(
                Chunk(
                    id=uuid.uuid4(),
                    document_id=doc_id,
                    text=chunk_text,
                    metadata=metadata,
                )
            )

    return all_chunks


# ---------------------------------------------------------------------------
# Store chunks with embeddings
# ---------------------------------------------------------------------------


async def store_chunks(chunks: list[Chunk], db: AsyncSession) -> None:
    """Embed and persist chunks. Skips chunks whose content_hash already exists."""
    if not chunks:
        return

    texts = [c.text for c in chunks]
    hashes = [hashlib.sha256(t.encode()).hexdigest() for t in texts]

    # Dedup by hash
    existing_hashes_result = await db.execute(
        select(ChunkModel.content_hash).where(ChunkModel.content_hash.in_(hashes))
    )
    existing_hashes: set[str] = {row[0] for row in existing_hashes_result}

    to_embed_indices = [i for i, h in enumerate(hashes) if h not in existing_hashes]
    if not to_embed_indices:
        log.debug("all_chunks_already_stored", count=len(chunks))
        return

    to_embed_texts = [texts[i] for i in to_embed_indices]
    embeddings = embed_texts(to_embed_texts)

    for idx, emb in zip(to_embed_indices, embeddings):
        c = chunks[idx]
        model = ChunkModel(
            id=c.id,
            document_id=c.document_id,
            text=c.text,
            embedding=emb,
            page_or_section=c.page_or_section,
            metadata_=c.metadata,
            content_hash=hashes[idx],
        )
        db.add(model)

    await db.flush()
    log.info("chunks_stored", new=len(to_embed_indices), skipped=len(chunks) - len(to_embed_indices))


# ---------------------------------------------------------------------------
# Hybrid search
# ---------------------------------------------------------------------------


async def search(
    query: str,
    db: AsyncSession,
    filters: Optional[dict[str, Any]] = None,
    k: int = None,
) -> tuple[list[Chunk], bool]:
    """Hybrid search: pgvector ANN + Postgres full-text, merged with RRF.

    Returns (chunks, no_relevant_source).
    no_relevant_source is True when the best score is below the threshold.
    """
    k = k or settings.retrieval_k
    filters = filters or {}
    t0 = time.monotonic()

    # Embed query
    query_vec = embed_texts([query])[0]

    # --- Vector search ---
    vector_q = (
        select(
            ChunkModel.id,
            (1 - ChunkModel.embedding.cosine_distance(query_vec)).label("score"),
        )
        .order_by(ChunkModel.embedding.cosine_distance(query_vec))
        .limit(k * 2)
    )
    vector_q = _apply_filters(vector_q, filters)
    vec_results = await db.execute(vector_q)
    vec_rows = vec_results.fetchall()  # (id, score)

    # --- Full-text search ---
    ts_query = func.plainto_tsquery("english", query)
    fts_q = (
        select(
            ChunkModel.id,
            func.ts_rank(
                func.to_tsvector("english", ChunkModel.text), ts_query
            ).label("rank"),
        )
        .where(
            func.to_tsvector("english", ChunkModel.text).op("@@")(ts_query)
        )
        .order_by(text("rank DESC"))
        .limit(k * 2)
    )
    fts_q = _apply_filters(fts_q, filters)
    fts_results = await db.execute(fts_q)
    fts_rows = fts_results.fetchall()  # (id, rank)

    # --- RRF merge ---
    rrf_scores: dict[uuid.UUID, float] = {}
    for rank_pos, (chunk_id, _score) in enumerate(vec_rows, 1):
        rrf_scores[chunk_id] = rrf_scores.get(chunk_id, 0) + 1 / (60 + rank_pos)
    for rank_pos, (chunk_id, _rank) in enumerate(fts_rows, 1):
        rrf_scores[chunk_id] = rrf_scores.get(chunk_id, 0) + 1 / (60 + rank_pos)

    sorted_ids = sorted(rrf_scores, key=lambda x: rrf_scores[x], reverse=True)[:k]

    if not sorted_ids:
        return [], True  # no_relevant_source

    # --- Fetch full chunk rows ---
    chunk_rows_result = await db.execute(
        select(ChunkModel).where(ChunkModel.id.in_(sorted_ids))
    )
    chunk_models = {r.id: r for r in chunk_rows_result.scalars().all()}

    chunks = []
    for cid in sorted_ids:
        if cid not in chunk_models:
            continue
        cm = chunk_models[cid]
        chunks.append(
            Chunk(
                id=cm.id,
                document_id=cm.document_id,
                text=cm.text,
                page_or_section=cm.page_or_section,
                metadata=cm.metadata_ or {},
            )
        )

    # Check top score threshold (use vector score for best hit)
    top_vec_score = vec_rows[0][1] if vec_rows else 0.0
    no_relevant = top_vec_score < settings.retrieval_score_threshold

    latency_ms = int((time.monotonic() - t0) * 1000)
    log.info(
        "search_complete",
        query_preview=query[:60],
        hits=len(chunks),
        top_score=round(top_vec_score, 3),
        no_relevant=no_relevant,
        latency_ms=latency_ms,
    )

    return chunks, no_relevant


def _apply_filters(query, filters: dict[str, Any]):
    """Apply metadata filters to a SQLAlchemy query on ChunkModel."""
    for key, value in filters.items():
        if key == "state" and value:
            query = query.where(
                ChunkModel.metadata_["state"].as_string() == value
            )
        elif key == "category" and value:
            query = query.where(
                ChunkModel.metadata_["category"].as_string() == value
            )
        elif key == "doc_type" and value:
            query = query.where(
                ChunkModel.metadata_["doc_type"].as_string() == value
            )
    return query


async def get_rules_for_documents(
    document_ids: list[uuid.UUID], db: AsyncSession
) -> list[EligibilityRule]:
    """Fetch EligibilityRule records for given document IDs."""
    if not document_ids:
        return []

    result = await db.execute(
        select(EligibilityRuleModel).where(
            EligibilityRuleModel.document_id.in_(document_ids)
        )
    )
    rules = []
    for rm in result.scalars().all():
        from datetime import date
        deadline = None
        if rm.deadline:
            try:
                deadline = date.fromisoformat(rm.deadline)
            except Exception:
                pass

        from packages.knowledge.schemas import Criterion as C
        criteria = [C(**c) for c in (rm.criteria_json or [])]

        rules.append(
            EligibilityRule(
                id=rm.id,
                document_id=rm.document_id,
                scheme_name=rm.scheme_name,
                criteria=criteria,
                required_documents=rm.required_documents_json or [],
                deadline=deadline,
                benefit_summary=rm.benefit_summary,
                source_passage=rm.source_passage,
                source_url=rm.source_url,
                extracted_at=rm.extracted_at,
                confidence=rm.confidence,
            )
        )
    return rules
