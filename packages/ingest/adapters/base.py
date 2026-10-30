"""
Abstract interface for source adapters.

Every data source must implement SourceAdapter with two methods:
  - list_documents()  → list of lightweight DocumentRef
  - fetch(ref)        → SourceDocument

This interface is also the circuit-breaker boundary.
"""

from __future__ import annotations

import abc
import asyncio
import time
from dataclasses import dataclass, field
from typing import Optional

import structlog

log = structlog.get_logger(__name__)


@dataclass
class DocumentRef:
    """Lightweight reference to a document before full fetching."""

    source: str
    source_url: str
    title: str
    doc_type: str  # scheme | notification | act | circular
    language: str = "en"
    published_at: Optional[str] = None  # ISO datetime string or None
    extra: dict = field(default_factory=dict)


class SourceAdapter(abc.ABC):
    """Base class every source adapter must extend."""

    source_name: str  # must be set by subclass

    @abc.abstractmethod
    async def list_documents(self) -> list[DocumentRef]:
        """Return a list of document references from this source."""

    @abc.abstractmethod
    async def fetch(self, ref: DocumentRef) -> str:
        """Fetch and return the full raw text for a DocumentRef."""


# ---------------------------------------------------------------------------
# Circuit breaker (per adapter)
# ---------------------------------------------------------------------------


class CircuitBreaker:
    """Simple per-source circuit breaker.

    States: CLOSED (normal) → OPEN (too many failures) → HALF_OPEN (retry).
    """

    def __init__(self, threshold: int, cooldown_seconds: int) -> None:
        self.threshold = threshold
        self.cooldown_seconds = cooldown_seconds
        self._failures = 0
        self._opened_at: Optional[float] = None

    @property
    def is_open(self) -> bool:
        if self._opened_at is None:
            return False
        elapsed = time.monotonic() - self._opened_at
        if elapsed >= self.cooldown_seconds:
            # enter HALF_OPEN — allow one probe
            return False
        return True

    def record_success(self) -> None:
        self._failures = 0
        self._opened_at = None

    def record_failure(self) -> None:
        self._failures += 1
        if self._failures >= self.threshold:
            if self._opened_at is None:
                log.warning("circuit_breaker_opened", failures=self._failures)
            self._opened_at = time.monotonic()
