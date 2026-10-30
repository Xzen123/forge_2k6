"""
SQLAlchemy ORM models and async DB session for Civic Pulse.

All tables are defined here; Alembic auto-generates migrations from this metadata.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from packages.config import settings

# ---------------------------------------------------------------------------
# Engine + session factory
# ---------------------------------------------------------------------------

engine = create_async_engine(
    settings.database_url,
    pool_size=settings.database_pool_size,
    max_overflow=settings.database_max_overflow,
    echo=settings.environment == "development",
)

AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    engine, expire_on_commit=False
)


async def get_db() -> AsyncSession:  # type: ignore[override]
    """FastAPI dependency that yields a database session."""
    async with AsyncSessionLocal() as session:
        yield session


# ---------------------------------------------------------------------------
# Base
# ---------------------------------------------------------------------------


class Base(DeclarativeBase):
    pass


# ---------------------------------------------------------------------------
# ORM Tables
# ---------------------------------------------------------------------------


class DocumentModel(Base):
    """Persisted SourceDocument records."""

    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    source_url: Mapped[str] = mapped_column(Text, nullable=False)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    doc_type: Mapped[str] = mapped_column(String(32), nullable=False)
    language: Mapped[str] = mapped_column(String(16), nullable=False)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    is_latest: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    chunks: Mapped[list[ChunkModel]] = relationship("ChunkModel", back_populates="document")
    eligibility_rules: Mapped[list[EligibilityRuleModel]] = relationship(
        "EligibilityRuleModel", back_populates="document"
    )


class ChunkModel(Base):
    """Text chunks with pgvector embeddings."""

    __tablename__ = "chunks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[Optional[list[float]]] = mapped_column(Vector(768))  # mpnet dim
    page_or_section: Mapped[Optional[str]] = mapped_column(String(256))
    metadata_: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    content_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)

    document: Mapped[DocumentModel] = relationship("DocumentModel", back_populates="chunks")


class EligibilityRuleModel(Base):
    """Structured eligibility rules extracted by the LLM."""

    __tablename__ = "eligibility_rules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    scheme_name: Mapped[str] = mapped_column(Text, nullable=False)
    criteria_json: Mapped[dict] = mapped_column("criteria", JSON, default=list)
    required_documents_json: Mapped[dict] = mapped_column("required_documents", JSON, default=list)
    deadline: Mapped[Optional[str]] = mapped_column(String(32))  # ISO date string
    benefit_summary: Mapped[str] = mapped_column(Text, nullable=False)
    source_passage: Mapped[str] = mapped_column(Text, nullable=False)
    source_url: Mapped[str] = mapped_column(Text, nullable=False)
    extracted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)

    document: Mapped[DocumentModel] = relationship("DocumentModel", back_populates="eligibility_rules")


class IngestionRunModel(Base):
    """Audit log for each ingestion run."""

    __tablename__ = "ingestion_runs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    docs_seen: Mapped[int] = mapped_column(Integer, default=0)
    docs_new: Mapped[int] = mapped_column(Integer, default=0)
    docs_changed: Mapped[int] = mapped_column(Integer, default=0)
    errors: Mapped[int] = mapped_column(Integer, default=0)
    success: Mapped[bool] = mapped_column(Boolean, default=False)
    error_detail: Mapped[Optional[str]] = mapped_column(Text)


class AuditLogModel(Base):
    """Audit events — e.g. document_changed — stored for the /changes feed."""

    __tablename__ = "audit_log"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    document_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True))
    payload: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )


class SessionModel(Base):
    """Persistent chat sessions storing profile and turn history."""

    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    profile_json: Mapped[dict] = mapped_column("profile", JSON, default=dict)
    history_json: Mapped[list] = mapped_column("history", JSON, default=list)
    language: Mapped[str] = mapped_column(String(16), default="en")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
