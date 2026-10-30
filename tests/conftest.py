import os
import pytest

# Ensure required environment variables exist during testing
os.environ.setdefault("ANTHROPIC_API_KEY", "test-anthropic-key")
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/civic_pulse_test")
os.environ.setdefault("SARVAM_API_KEY", "test-sarvam-key")
os.environ.setdefault("API_ADMIN_TOKEN", "test-admin-token")
os.environ.setdefault("TTS_CACHE_DIR", "./tts_cache_test")
