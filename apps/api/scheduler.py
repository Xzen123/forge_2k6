"""
APScheduler-based background scheduler for periodic ingestion.

Run as: python -m apps.api.scheduler
"""

from __future__ import annotations

import asyncio
import signal
import sys

import structlog
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from packages.config import settings
from packages.ingest.pipeline import IngestPipeline, _ADAPTERS
from packages.knowledge.db import AsyncSessionLocal

log = structlog.get_logger(__name__)


async def run_all_sources() -> None:
    """Scheduled task: ingest all sources."""
    async with AsyncSessionLocal() as db:
        pipeline = IngestPipeline(db)
        log.info("scheduled_ingest_starting")
        await pipeline.run_all()
        log.info("scheduled_ingest_complete")


def main() -> None:
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        run_all_sources,
        "interval",
        minutes=settings.ingest_interval_minutes,
        id="ingest_all",
        replace_existing=True,
        max_instances=1,
    )
    scheduler.start()
    log.info(
        "scheduler_started",
        interval_minutes=settings.ingest_interval_minutes,
        sources=list(_ADAPTERS),
    )

    loop = asyncio.get_event_loop()

    def _shutdown(signum, frame):
        log.info("scheduler_shutting_down")
        scheduler.shutdown(wait=False)
        loop.stop()
        sys.exit(0)

    signal.signal(signal.SIGTERM, _shutdown)
    signal.signal(signal.SIGINT, _shutdown)

    # Run initial ingestion on startup
    loop.run_until_complete(run_all_sources())
    loop.run_forever()


if __name__ == "__main__":
    main()
