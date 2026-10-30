"""
Shared Pydantic v2 contracts for Civic Pulse.

All modules MUST import from this file — never redefine these models.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Core document / knowledge models
# ---------------------------------------------------------------------------


class SourceDocument(BaseModel):
    """A raw document fetched from a live official source."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    source: str = Field(..., description="Symbolic source name, e.g. 'myscheme' or 'pib'")
    source_url: str = Field(..., description="Canonical URL of the document")
    title: str
    doc_type: Literal["scheme", "notification", "act", "circular"]
    language: str = Field(..., description="BCP-47 language code, e.g. 'en' or 'hi'")
    raw_text: str = Field(..., description="Full extracted text of the document")
    fetched_at: datetime = Field(..., description="UTC timestamp when the document was fetched")
    content_hash: str = Field(..., description="SHA-256 hex digest of the normalised text")
    published_at: Optional[datetime] = Field(
        None, description="Publication date from the source, if available"
    )


class Chunk(BaseModel):
    """A text chunk derived from a SourceDocument, with an embedding vector."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    document_id: uuid.UUID
    text: str
    embedding: list[float] = Field(default_factory=list)
    page_or_section: Optional[str] = None
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Filterable fields: state, category, ministry, doc_type, published_at, etc.",
    )


# ---------------------------------------------------------------------------
# Eligibility rule models
# ---------------------------------------------------------------------------

CriterionField = Literal[
    "age",
    "income_annual",
    "state",
    "category",
    "gender",
    "occupation",
    "education",
    "disability",
    "land_holding",
    "other",
]

CriterionOperator = Literal["eq", "neq", "lt", "lte", "gt", "gte", "in", "not_in", "between"]


class Criterion(BaseModel):
    """A single eligibility rule criterion extracted from an official document."""

    field: CriterionField
    operator: CriterionOperator
    value: Any
    source_passage: str = Field(
        ..., description="Exact verbatim passage from the source document supporting this criterion"
    )


class EligibilityRule(BaseModel):
    """Structured eligibility rules extracted from a SourceDocument."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    document_id: uuid.UUID
    scheme_name: str
    criteria: list[Criterion]
    required_documents: list[str] = Field(default_factory=list)
    deadline: Optional[date] = None
    benefit_summary: str
    source_passage: str = Field(
        ..., description="Passage from the source document describing the overall benefit"
    )
    source_url: str
    extracted_at: datetime
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence of extraction (0–1)")


# ---------------------------------------------------------------------------
# User profile
# ---------------------------------------------------------------------------


class UserProfile(BaseModel):
    """Demographic/situational profile collected from the user during a session.

    All fields are Optional; missing fields are represented as None, never guessed.
    """

    age: Optional[int] = None
    income_annual: Optional[float] = None
    state: Optional[str] = None
    category: Optional[str] = None  # e.g. "OBC", "SC", "ST", "General"
    gender: Optional[str] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    disability: Optional[bool] = None
    land_holding: Optional[float] = None  # in acres
    language: str = Field("en", description="User's preferred BCP-47 language code")
    other: dict[str, Any] = Field(
        default_factory=dict, description="Extra fields that don't fit the standard schema"
    )


# ---------------------------------------------------------------------------
# Citation / claim models
# ---------------------------------------------------------------------------


class Citation(BaseModel):
    """A verifiable reference to a passage in a live official document."""

    url: str
    quote: str = Field(..., max_length=200, description="Verbatim quote of ≤ 25 words")
    fetched_at: datetime


class Claim(BaseModel):
    """A factual statement made by the agent, with its supporting citations."""

    text: str
    citations: list[Citation]
    verified: bool = False


# ---------------------------------------------------------------------------
# Eligibility result
# ---------------------------------------------------------------------------

EligibilityStatus = Literal["eligible", "not_eligible", "needs_info"]


class EligibilityResult(BaseModel):
    """Result of checking a single EligibilityRule against a UserProfile."""

    scheme_name: str
    status: EligibilityStatus
    passed: list[Criterion] = Field(default_factory=list)
    failed: list[Criterion] = Field(default_factory=list)
    unknown: list[Criterion] = Field(default_factory=list)
    required_documents: list[str] = Field(default_factory=list)
    deadline: Optional[date] = None
    citations: list[Citation] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Observability
# ---------------------------------------------------------------------------


class TraceEvent(BaseModel):
    """A single step event recorded during an agent run."""

    step: str
    tool: Optional[str] = None
    input_summary: str
    output_summary: str
    latency_ms: int
    ok: bool
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# LangGraph agent state
# ---------------------------------------------------------------------------


class AgentState(BaseModel):
    """The mutable state object passed between nodes in the LangGraph agent graph."""

    session_id: str
    raw_input: str = ""
    detected_language: str = "en"
    profile: UserProfile = Field(default_factory=UserProfile)
    missing_fields: list[str] = Field(default_factory=list)
    retrieved_chunks: list[Chunk] = Field(default_factory=list)
    candidate_rules: list[EligibilityRule] = Field(default_factory=list)
    results: list[EligibilityResult] = Field(default_factory=list)
    claims: list[Claim] = Field(default_factory=list)
    final_answer: str = ""
    trace: list[TraceEvent] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    retry_count: int = 0
    audio_url: Optional[str] = None
