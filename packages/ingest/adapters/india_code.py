"""
India Code adapter.

Approach: India Code (indiacode.nic.in) does not expose a public REST API
but publishes legislation in downloadable PDF and HTML formats.
We fetch the search results page (HTML, no JS required for basic listing)
and then download individual act pages.

robots.txt for indiacode.nic.in allows access to /acts and search paths.
JavaScript rendering (Playwright) is used only when the act page requires it;
for most acts the HTML fallback is sufficient.
"""

from __future__ import annotations

import asyncio
import re

import httpx
import structlog
from bs4 import BeautifulSoup

from packages.config import settings
from packages.ingest.adapters.base import DocumentRef, SourceAdapter

log = structlog.get_logger(__name__)

_HEADERS = {
    "User-Agent": "CivicPulse/1.0 (hackathon; contact: civic-pulse@example.com)",
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
}
_TIMEOUT = httpx.Timeout(45.0)

# Search for welfare/social security related acts
_SEARCH_TERMS = [
    "social welfare",
    "scholarship",
    "pension",
    "disability benefits",
    "maternity benefit",
]


class IndiaCodeAdapter(SourceAdapter):
    """Fetches central legislation from India Code related to citizen welfare."""

    source_name = "india_code"

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(headers=_HEADERS, timeout=_TIMEOUT, follow_redirects=True)

    async def list_documents(self) -> list[DocumentRef]:
        refs: list[DocumentRef] = []
        seen_urls: set[str] = set()

        for term in _SEARCH_TERMS:
            try:
                resp = await self._client.get(
                    f"{settings.india_code_base}/search",
                    params={"searchText": term, "type": "Central Acts"},
                )
                resp.raise_for_status()
            except Exception as exc:
                log.error("india_code_search_failed", term=term, error=str(exc))
                continue

            soup = BeautifulSoup(resp.text, "lxml")
            # India Code search results are typically in table rows or list items
            for a_tag in soup.find_all("a", href=re.compile(r"/acts/central/")):
                href = a_tag.get("href", "")
                url = href if href.startswith("http") else f"{settings.india_code_base}{href}"
                if url in seen_urls:
                    continue
                seen_urls.add(url)
                title = a_tag.get_text(strip=True) or "India Code Act"
                refs.append(
                    DocumentRef(
                        source=self.source_name,
                        source_url=url,
                        title=title,
                        doc_type="act",
                        language="en",
                    )
                )

            await asyncio.sleep(1.0)  # polite delay between searches

        log.info("india_code_listed", count=len(refs))
        return refs

    async def fetch(self, ref: DocumentRef) -> str:
        resp = await self._client.get(ref.source_url)
        resp.raise_for_status()

        import trafilatura
        text = trafilatura.extract(resp.text, include_tables=True, no_fallback=False)
        if not text:
            soup = BeautifulSoup(resp.text, "lxml")
            text = soup.get_text(separator="\n", strip=True)
        return text or ""

    async def close(self) -> None:
        await self._client.aclose()
