"""
Multilingual voice adapters (M6) — Sarvam AI provider.

Interfaces:
  - STT: audio bytes → text, detected language, confidence
  - TTS: text → audio bytes (cached by text hash)
  - Translator: text → translated text (with glossary protection)
  - Language detection

Fallback: on Sarvam AI failure, STT falls back to asking user to type;
TTS falls back to text-only response.
"""

from __future__ import annotations

import abc
import hashlib
import os
from pathlib import Path
from typing import Optional

import httpx
import structlog

from packages.config import settings

log = structlog.get_logger(__name__)

_SARVAM_HEADERS = {
    "api-subscription-key": settings.sarvam_api_key,
    "Content-Type": "application/json",
}
_TIMEOUT = httpx.Timeout(30.0)

_LANG_CODE_MAP = {
    "hi": "hi-IN",
    "bn": "bn-IN",
    "en": "en-IN",
}

# Terms that must never be machine-translated (scheme names, numbers, etc.)
_GLOSSARY_PATTERNS = [
    "PM-KISAN", "PMJAY", "MGNREGS", "PMAY", "NSP",
    "PAN", "Aadhaar", "OBC", "SC", "ST", "EWS",
]


# ---------------------------------------------------------------------------
# Abstract interfaces
# ---------------------------------------------------------------------------


class STTProvider(abc.ABC):
    @abc.abstractmethod
    async def transcribe(self, audio_bytes: bytes, mime_type: str = "audio/webm") -> dict:
        """Return {"text": str, "language": str, "confidence": float}"""


class TTSProvider(abc.ABC):
    @abc.abstractmethod
    async def synthesize(self, text: str, language: str) -> bytes:
        """Return audio bytes (wav/mp3)."""


class TranslatorProvider(abc.ABC):
    @abc.abstractmethod
    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        """Translate text, preserving glossary terms."""


# ---------------------------------------------------------------------------
# Sarvam AI implementations
# ---------------------------------------------------------------------------


class SarvamSTT(STTProvider):
    """Speech-to-text using Sarvam AI saarika model."""

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(timeout=_TIMEOUT)

    async def transcribe(self, audio_bytes: bytes, mime_type: str = "audio/webm") -> dict:
        try:
            resp = await self._client.post(
                f"{settings.sarvam_api_base}/speech-to-text",
                headers={"api-subscription-key": settings.sarvam_api_key},
                files={"file": ("audio.webm", audio_bytes, mime_type)},
                data={"model": settings.sarvam_stt_model, "language_code": "unknown"},
            )
            resp.raise_for_status()
            data = resp.json()
            return {
                "text": data.get("transcript", ""),
                "language": data.get("language_code", "en-IN").split("-")[0],
                "confidence": data.get("confidence", 1.0),
            }
        except Exception as exc:
            log.error("sarvam_stt_failed", error=str(exc))
            return {"text": "", "language": "en", "confidence": 0.0, "error": str(exc)}

    async def close(self) -> None:
        await self._client.aclose()


class SarvamTTS(TTSProvider):
    """Text-to-speech using Sarvam AI bulbul model, with disk cache."""

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(timeout=httpx.Timeout(60.0))
        self._cache_dir = Path(settings.tts_cache_dir)
        self._cache_dir.mkdir(parents=True, exist_ok=True)

    def _cache_path(self, text: str, language: str) -> Path:
        key = hashlib.sha256(f"{language}:{text}".encode()).hexdigest()
        return self._cache_dir / f"{key}.wav"

    async def synthesize(self, text: str, language: str) -> bytes:
        cache_path = self._cache_path(text, language)
        if cache_path.exists():
            return cache_path.read_bytes()

        lang_code = _LANG_CODE_MAP.get(language, "en-IN")
        # Chunk long text (Sarvam typically handles up to ~500 chars per call)
        chunks = _chunk_text_for_tts(text, max_chars=450)
        audio_parts = []

        for chunk in chunks:
            try:
                resp = await self._client.post(
                    f"{settings.sarvam_api_base}/text-to-speech",
                    headers={"api-subscription-key": settings.sarvam_api_key,
                             "Content-Type": "application/json"},
                    json={
                        "inputs": [chunk],
                        "target_language_code": lang_code,
                        "speaker": "meera",
                        "model": settings.sarvam_tts_model,
                        "enable_preprocessing": True,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                # Sarvam returns base64-encoded audio in audios[0]
                import base64
                audio_b64 = data.get("audios", [""])[0]
                audio_parts.append(base64.b64decode(audio_b64))
            except Exception as exc:
                log.error("sarvam_tts_chunk_failed", error=str(exc))

        if not audio_parts:
            return b""

        combined = b"".join(audio_parts)
        cache_path.write_bytes(combined)
        return combined

    async def close(self) -> None:
        await self._client.aclose()


class SarvamTranslator(TranslatorProvider):
    """Translation using Sarvam AI mayura model with glossary protection."""

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(timeout=_TIMEOUT)

    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        if source_lang == target_lang:
            return text

        # Protect glossary terms by substituting placeholders
        protected, replacements = _protect_glossary(text)

        source_code = _LANG_CODE_MAP.get(source_lang, "en-IN")
        target_code = _LANG_CODE_MAP.get(target_lang, "hi-IN")

        try:
            resp = await self._client.post(
                f"{settings.sarvam_api_base}/translate",
                headers={"api-subscription-key": settings.sarvam_api_key,
                         "Content-Type": "application/json"},
                json={
                    "input": protected,
                    "source_language_code": source_code,
                    "target_language_code": target_code,
                    "model": settings.sarvam_translate_model,
                    "enable_preprocessing": False,
                },
            )
            resp.raise_for_status()
            translated = resp.json().get("translated_text", protected)
        except Exception as exc:
            log.error("sarvam_translate_failed", error=str(exc))
            return text  # fallback: return original

        # Restore glossary terms
        return _restore_glossary(translated, replacements)

    async def close(self) -> None:
        await self._client.aclose()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _chunk_text_for_tts(text: str, max_chars: int = 450) -> list[str]:
    """Split text into chunks at sentence boundaries."""
    import re
    sentences = re.split(r"(?<=[।.!?])\s+", text)
    chunks = []
    current = ""
    for s in sentences:
        if len(current) + len(s) + 1 <= max_chars:
            current += (" " if current else "") + s
        else:
            if current:
                chunks.append(current)
            current = s
    if current:
        chunks.append(current)
    return chunks or [text[:max_chars]]


def _protect_glossary(text: str) -> tuple[str, dict[str, str]]:
    """Replace glossary terms with stable placeholders before translation."""
    replacements: dict[str, str] = {}
    for i, term in enumerate(_GLOSSARY_PATTERNS):
        placeholder = f"__GLOSSARY_{i}__"
        if term in text:
            replacements[placeholder] = term
            text = text.replace(term, placeholder)
    return text, replacements


def _restore_glossary(text: str, replacements: dict[str, str]) -> str:
    for placeholder, original in replacements.items():
        text = text.replace(placeholder, original)
    return text


def detect_language(text: str) -> str:
    """Detect language using langdetect; fall back to 'en'."""
    try:
        from langdetect import detect
        code = detect(text[:500])
        # Map to supported languages
        if code in settings.supported_languages:
            return code
        # Fuzzy match: langdetect may return 'zh-cn' etc.
        for supported in settings.supported_languages:
            if code.startswith(supported):
                return supported
        return "en"
    except Exception:
        return "en"


# ---------------------------------------------------------------------------
# Smoke test
# ---------------------------------------------------------------------------


async def smoke_test_all_languages() -> dict[str, bool]:
    """Run a quick TTS round-trip for each supported language. Returns pass/fail per lang."""
    tts = SarvamTTS()
    results = {}
    test_phrases = {
        "en": "This is a test of the government scheme system.",
        "hi": "यह सरकारी योजना प्रणाली का परीक्षण है।",
        "bn": "এটি সরকারি প্রকল্প সিস্টেমের একটি পরীক্ষা।",
    }
    for lang in settings.supported_languages:
        phrase = test_phrases.get(lang, test_phrases["en"])
        audio = await tts.synthesize(phrase, lang)
        results[lang] = len(audio) > 0
        log.info("smoke_test", lang=lang, passed=results[lang])
    await tts.close()
    return results
