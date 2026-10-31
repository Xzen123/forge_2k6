"""
Civic Pulse — centralised configuration loaded from environment variables.

Usage
-----
    from packages.config import settings

All env vars must be present (or have a default) before import.
Missing required vars raise a clear error at startup, never inside a request.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- LLM -----------------------------------------------------------
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-3.8-flash"
    gemini_api_base: str = "https://generativelanguage.googleapis.com/v1beta"
    llm_provider: str = "gemini"

    anthropic_api_key: Optional[str] = None
    anthropic_model: str = "claude-3-5-sonnet-20241022"
    anthropic_model_fallback: str = "claude-3-haiku-20240307"

    # --- Database ------------------------------------------------------
    database_url: str  # e.g. postgresql+asyncpg://user:pass@host/dbname
    database_pool_size: int = 10
    database_max_overflow: int = 20

    # --- Embeddings ----------------------------------------------------
    embedding_model: str = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
    embedding_batch_size: int = 32

    # --- Speech / Translation (Sarvam AI) ------------------------------
    sarvam_api_key: str
    sarvam_api_base: str = "https://api.sarvam.ai"
    sarvam_stt_model: str = "saaras:v3"
    sarvam_tts_model: str = "bulbul:v3"
    sarvam_translate_model: str = "mayura:v1"

    # --- Sources -------------------------------------------------------
    myscheme_api_base: str = "https://api.myscheme.gov.in"
    pib_rss_url: str = "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3"
    india_code_base: str = "https://www.indiacode.nic.in"
    data_gov_in_base: str = "https://api.data.gov.in"
    data_gov_in_api_key: Optional[str] = None

    # --- Ingestion scheduler -------------------------------------------
    ingest_interval_minutes: int = 60
    ingest_max_retries: int = 3
    ingest_backoff_base: float = 2.0          # seconds
    ingest_circuit_breaker_threshold: int = 5  # consecutive failures
    ingest_circuit_breaker_cooldown: int = 300  # seconds

    # --- Retrieval -----------------------------------------------------
    retrieval_k: int = 20
    retrieval_rerank_top: int = 5
    retrieval_score_threshold: float = 0.35
    retrieval_latency_target_ms: int = 1000

    # --- Agent ---------------------------------------------------------
    agent_max_retries: int = 2
    agent_compose_max_claim_fail_ratio: float = 0.5
    agent_token_budget_per_session: int = 20_000

    # --- Languages supported -------------------------------------------
    supported_languages: list[str] = ["en", "hi", "bn"]

    # --- Langfuse observability ----------------------------------------
    langfuse_public_key: Optional[str] = None
    langfuse_secret_key: Optional[str] = None
    langfuse_host: str = "https://cloud.langfuse.com"

    # --- API -----------------------------------------------------------
    api_frontend_origin: str = "http://localhost:3000"
    api_admin_token: str = "change-me-in-production"
    api_rate_limit_per_minute: int = 30

    # --- TTS cache -----------------------------------------------------
    tts_cache_dir: str = "/tmp/civic_pulse_tts_cache"

    # --- Environment ---------------------------------------------------
    environment: str = "development"
    log_level: str = "INFO"


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the singleton Settings instance. Fails fast if vars are missing."""
    return Settings()


# Convenience alias used throughout the codebase
settings = get_settings()
