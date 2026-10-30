"""Initial migration: create all Civic Pulse tables with pgvector extension."""

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "documents",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("source", sa.String(64), nullable=False, index=True),
        sa.Column("source_url", sa.Text, nullable=False),
        sa.Column("title", sa.Text, nullable=False),
        sa.Column("doc_type", sa.String(32), nullable=False),
        sa.Column("language", sa.String(16), nullable=False),
        sa.Column("raw_text", sa.Text, nullable=False),
        sa.Column("fetched_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("content_hash", sa.String(64), nullable=False, index=True),
        sa.Column("published_at", sa.DateTime(timezone=True)),
        sa.Column("is_latest", sa.Boolean, default=True, nullable=False),
    )

    op.create_table(
        "chunks",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "document_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("documents.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("text", sa.Text, nullable=False),
        sa.Column("embedding", Vector(768)),
        sa.Column("page_or_section", sa.String(256)),
        sa.Column("metadata", sa.JSON, default={}),
        sa.Column("content_hash", sa.String(64), nullable=False, index=True),
    )

    op.create_table(
        "eligibility_rules",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "document_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("documents.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("scheme_name", sa.Text, nullable=False),
        sa.Column("criteria", sa.JSON, default=[]),
        sa.Column("required_documents", sa.JSON, default=[]),
        sa.Column("deadline", sa.String(32)),
        sa.Column("benefit_summary", sa.Text, nullable=False),
        sa.Column("source_passage", sa.Text, nullable=False),
        sa.Column("source_url", sa.Text, nullable=False),
        sa.Column("extracted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("confidence", sa.Float, nullable=False),
    )

    op.create_table(
        "ingestion_runs",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("source", sa.String(64), nullable=False, index=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ended_at", sa.DateTime(timezone=True)),
        sa.Column("docs_seen", sa.Integer, default=0),
        sa.Column("docs_new", sa.Integer, default=0),
        sa.Column("docs_changed", sa.Integer, default=0),
        sa.Column("errors", sa.Integer, default=0),
        sa.Column("success", sa.Boolean, default=False),
        sa.Column("error_detail", sa.Text),
    )

    op.create_table(
        "audit_log",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("event_type", sa.String(64), nullable=False, index=True),
        sa.Column("source", sa.String(64), nullable=False, index=True),
        sa.Column("document_id", sa.dialects.postgresql.UUID(as_uuid=True)),
        sa.Column("payload", sa.JSON, default={}),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "sessions",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("profile", sa.JSON, default={}),
        sa.Column("history", sa.JSON, default=[]),
        sa.Column("language", sa.String(16), default="en"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Vector index for ANN search
    op.execute(
        "CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON chunks "
        "USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
    )


def downgrade() -> None:
    op.drop_table("sessions")
    op.drop_table("audit_log")
    op.drop_table("ingestion_runs")
    op.drop_table("eligibility_rules")
    op.drop_table("chunks")
    op.drop_table("documents")
    op.execute("DROP EXTENSION IF EXISTS vector")
