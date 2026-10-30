"""
Data.gov.in adapter.

Approach: Data.gov.in provides an official Open Government Data API.
We use the /resource endpoint (JSON) which does not require JavaScript.
An API key (DATA_GOV_IN_API_KEY) is required for authenticated calls;
the API is free to obtain at https://data.gov.in/user/register.

robots.txt for data.gov.in allows API access paths.
"""

from __future__ import annotations

import asyncio
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

# Resource IDs for welfare/scheme-related datasets on data.gov.in
# These are stable resource IDs for government scheme datasets
_RESOURCE_IDS = [
    "6176ee09-3d56-4a3b-8115-21841576b2f6",  # PM schemes for farmers
    "9ef84268-d588-465a-a308-a864a43d0070",  # MGNREGS state-wise data
]


class DataGovInAdapter(SourceAdapter):
    """Fetches welfare scheme datasets from data.gov.in open data API."""

    source_name = "data_gov_in"

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(headers=_HEADERS, timeout=_TIMEOUT, follow_redirects=True)
        self._api_key = settings.data_gov_in_api_key or ""

    async def list_documents(self) -> list[DocumentRef]:
        refs: list[DocumentRef] = []
        for resource_id in _RESOURCE_IDS:
            refs.append(
                DocumentRef(
                    source=self.source_name,
                    source_url=f"{settings.data_gov_in_base}/resource/{resource_id}",
                    title=f"data.gov.in dataset {resource_id}",
                    doc_type="notification",
                    language="en",
                    extra={"resource_id": resource_id},
                )
            )
        return refs

    async def fetch(self, ref: DocumentRef) -> str:
        resource_id = ref.extra.get("resource_id", "")
        params: dict[str, Any] = {"resource_id": resource_id, "limit": 100, "format": "json"}
        if self._api_key:
            params["api-key"] = self._api_key

        resp = await self._client.get(
            f"{settings.data_gov_in_base}/resource/{resource_id}",
            params=params,
        )
        resp.raise_for_status()
        data = resp.json()

        records = data.get("records", data.get("data", []))
        if not records:
            return f"No records found for resource {resource_id}"

        # Convert records to plain text
        lines = [f"Dataset: {ref.title}", f"Source: {ref.source_url}", ""]
        for rec in records[:50]:
            lines.append(" | ".join(f"{k}: {v}" for k, v in rec.items() if v))
        return "\n".join(lines)

    async def close(self) -> None:
        await self._client.aclose()
