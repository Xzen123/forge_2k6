"""
PIB (Press Information Bureau) RSS adapter.

Approach: PIB publishes an official RSS 2.0 feed at the configured URL.
We parse the RSS feed (no scraping needed, no JavaScript) using feedparser,
then fetch each article's HTML page to extract the full press release text.

robots.txt for pib.gov.in allows crawling of press release pages.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

import feedparser
import httpx
import structlog
from packages.config import settings
from packages.ingest.adapters.base import DocumentRef, SourceAdapter
from packages.ingest.parse.parsers import parse_html

log = structlog.get_logger(__name__)

_HEADERS = {
    "User-Agent": "CivicPulse/1.0 (hackathon; contact: civic-pulse@example.com)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}
_TIMEOUT = httpx.Timeout(30.0)


class PIBAdapter(SourceAdapter):
    """Fetches government press releases from the PIB RSS feed."""

    source_name = "pib"

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(headers=_HEADERS, timeout=_TIMEOUT, follow_redirects=True)

    async def list_documents(self) -> list[DocumentRef]:
        try:
            resp = await self._client.get(settings.pib_rss_url)
            resp.raise_for_status()
            feed = feedparser.parse(resp.text)
        except Exception as exc:
            log.error("pib_rss_fetch_failed", error=str(exc))
            return []

        refs: list[DocumentRef] = []
        for entry in feed.entries:
            published_at: str | None = None
            if hasattr(entry, "published"):
                try:
                    published_at = parsedate_to_datetime(entry.published).isoformat()
                except Exception:
                    published_at = None

            refs.append(
                DocumentRef(
                    source=self.source_name,
                    source_url=entry.get("link", ""),
                    title=entry.get("title", "PIB Press Release"),
                    doc_type="notification",
                    language="en",
                    published_at=published_at,
                )
            )

        log.info("pib_listed", count=len(refs))
        return refs

    async def fetch(self, ref: DocumentRef) -> str:
        resp = await self._client.get(ref.source_url)
        resp.raise_for_status()

        parsed = parse_html(resp.text)
        return parsed.clean_text

    async def close(self) -> None:
        await self._client.aclose()
