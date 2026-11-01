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
    "ta": "ta-IN",
    "te": "te-IN",
    "mr": "mr-IN",
    "gu": "gu-IN",
    "kn": "kn-IN",
    "ml": "ml-IN",
    "pa": "pa-IN",
    "od": "od-IN",
    "or": "od-IN",
    "as": "as-IN",
    "ur": "ur-IN",
    "mai": "hi-IN",
    "doi": "hi-IN",
    "kok": "mr-IN",
    "ne": "ne-NP",
    "sat": "bn-IN",
    "ks": "hi-IN",
    "mni": "bn-IN",
    "brx": "as-IN",
    "sd": "hi-IN",
    "sa": "hi-IN",
}

# Terms that must never be machine-translated (scheme names, numbers, etc.)
_GLOSSARY_PATTERNS = [
    "PM-KISAN", "PMJAY", "MGNREGS", "PMAY", "NSP",
    "PAN", "Aadhaar", "OBC", "SC", "ST", "EWS",
]

_TTS_MEM_CACHE: dict[str, bytes] = {}
_TRANSLATE_MEM_CACHE: dict[str, str] = {}


def clean_text_for_speech(text: str, max_chars: int = 420) -> str:
    """Extracts an authoritative, solution-oriented spoken script from rich markdown.
    Prioritizes concrete schemes, financial allowances, and direct application steps.
    Strictly filters out demographic problem-statement echoes and bureaucratic preambles.
    """
    import re
    if not text or not text.strip():
        return ""

    # 1. Parse Scheme Mapping Table Rows: | Scheme | Body | Criteria | Benefits |
    table_schemes: list[tuple[str, str]] = []
    for line in text.splitlines():
        line_s = line.strip()
        if line_s.startswith("|") and not re.match(r"^\|[\s\-:|]+\|$", line_s):
            parts = [p.strip().replace("**", "").replace("*", "") for p in line_s.split("|") if p.strip()]
            if len(parts) >= 2:
                s_name = parts[0]
                s_ben = parts[-1]
                # Filter out table header rows
                if any(h in s_name.lower() for h in ["scheme", "scholarship", "welfare program", "managing body"]) and any(h in s_ben.lower() for h in ["benefit", "financial", "in-kind"]):
                    continue
                if s_name and s_ben and len(s_name) > 3:
                    table_schemes.append((s_name, s_ben))

    # 2. Parse Bulleted Direct Solutions: • [**]Scheme[**]: Benefit
    bullet_schemes: list[tuple[str, str]] = []
    for line in text.splitlines():
        line_s = line.strip()
        m = re.search(r"^[•\*\-\d\.]+\s+(?:\*\*)?([^*:\n]+?)(?:\*\*)?[:\s—\-]+(.+)", line_s)
        if m:
            s_name = m.group(1).strip()
            s_ben = m.group(2).strip()
            if not any(x in s_name.lower() for x in ["primary benefit", "one scheme", "aadhaar", "inside bureaucracy", "step", "portal", "collect", "submit", "alternative"]):
                bullet_schemes.append((s_name, s_ben))

    # 3. Look for Official Application Portal in the text
    portal_match = re.search(r"(?:https?://)?([a-zA-Z0-9\.\-]+\.(?:gov\.in|nic\.in))", text, re.IGNORECASE)
    portal_name = portal_match.group(1) if portal_match else "the official government portal"

    # If we extracted concrete schemes from table or bullets, construct the solution script
    target_schemes = table_schemes or bullet_schemes
    if target_schemes:
        speech_parts = []
        top_scheme, top_benefit = target_schemes[0]
        top_benefit = re.sub(r"\[CITATION:\d+\]", "", top_benefit).strip()
        speech_parts.append(f"Direct Solution: You qualify for {top_scheme}, providing {top_benefit}.")

        if len(target_schemes) > 1:
            second_scheme, second_benefit = target_schemes[1]
            second_benefit = re.sub(r"\[CITATION:\d+\]", "", second_benefit).strip()
            speech_parts.append(f"You can also access {second_scheme} for {second_benefit}.")

        speech_parts.append(f"To claim these benefits, apply online at {portal_name} with your required documents and Aadhaar-seeded bank account.")
        candidate_speech = " ".join(speech_parts)
        if len(candidate_speech) <= max_chars:
            return candidate_speech
        else:
            return candidate_speech[:max_chars].rsplit(".", 1)[0] + "."

    # 4. Fallback for free-form text: aggressively filter out demographic problem descriptions
    lines = []
    for line in text.splitlines():
        line_s = line.strip()
        if line_s.startswith("|") or line_s.startswith("### Scheme Mapping") or "Managing Body" in line_s:
            continue
        lines.append(line)
    clean = "\n".join(lines)
    clean = re.sub(r"\[CITATION:\d+\]", "", clean)
    clean = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", clean)
    clean = re.sub(r"[*_#`~]", "", clean)
    clean = re.sub(r"⚠️.*", "", clean)
    clean = re.sub(r"\s+", " ", clean).strip()

    sentences = re.split(r"(?<=[।.!?])\s+", clean)
    banned_preamble_words = [
        "matches distinct policy channels",
        "your profile as",
        "based on your profile",
        "because welfare guidelines",
        "welfare guidelines enforce",
        "structured below based on",
        "detailed notification clauses",
        "executive strategic synthesis",
        "inside bureaucracy",
        "statutory public welfare and development programs",
    ]
    meaningful = [
        s for s in sentences
        if not any(bw in s.lower() for bw in banned_preamble_words)
        and len(s.strip()) > 15
    ]

    solution_sentences = [
        s for s in meaningful
        if any(kw in s.lower() for kw in ["qualify", "eligible", "benefit", "allowance", "stipend", "reimbursement", "pension", "apply", "portal", "registration", "dbt", "₹", "rs"])
    ]
    selected = solution_sentences if solution_sentences else meaningful

    shortened = ""
    for s in selected:
        if len(shortened) + len(s) + 1 <= max_chars:
            shortened += (" " if shortened else "") + s
        else:
            break

    if shortened:
        return f"Direct Solution: {shortened}"

    return "Direct Solution: You are eligible for verified statutory welfare and financial assistance. Please review the scheme guidelines and apply on the official portal."


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
    """Ultra-fast regional text-to-speech using Sarvam AI bulbul model, with RAM & disk caching."""

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(timeout=httpx.Timeout(20.0))
        self._cache_dir = Path(settings.tts_cache_dir)
        try:
            self._cache_dir.mkdir(parents=True, exist_ok=True)
        except Exception:
            pass

    def _cache_path(self, text: str, language: str) -> Path:
        key = hashlib.sha256(f"{language}:{text}".encode()).hexdigest()
        return self._cache_dir / f"{key}.wav"

    async def synthesize(self, text: str, language: str, clean: bool = True) -> bytes:
        if not text or not text.strip():
            return b""

        spoken_text = clean_text_for_speech(text) if clean else text.strip()
        lang_code = _LANG_CODE_MAP.get(language.lower(), "hi-IN")

        # 1. RAM Cache check (< 1ms)
        cache_key = f"{lang_code}:{spoken_text}"
        if cache_key in _TTS_MEM_CACHE:
            return _TTS_MEM_CACHE[cache_key]

        # 2. Disk Cache check (< 5ms)
        cache_path = self._cache_path(spoken_text, lang_code)
        if cache_path.exists():
            try:
                data = cache_path.read_bytes()
                _TTS_MEM_CACHE[cache_key] = data
                return data
            except Exception:
                pass

        # 3. Call Sarvam AI live API
        try:
            resp = await self._client.post(
                f"{settings.sarvam_api_base}/text-to-speech",
                headers={
                    "api-subscription-key": settings.sarvam_api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "inputs": [spoken_text],
                    "target_language_code": lang_code,
                    "speaker": "priya",
                    "model": settings.sarvam_tts_model,
                    "enable_preprocessing": True,
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                import base64
                audios = data.get("audios", [])
                if audios:
                    audio_bytes = base64.b64decode(audios[0])
                    _TTS_MEM_CACHE[cache_key] = audio_bytes
                    try:
                        cache_path.write_bytes(audio_bytes)
                    except Exception:
                        pass
                    return audio_bytes
            else:
                log.error("sarvam_tts_api_error", status_code=resp.status_code, text=resp.text[:200])
        except Exception as exc:
            log.error("sarvam_tts_failed", error=str(exc))

        return b""

    async def close(self) -> None:
        await self._client.aclose()


class SarvamTranslator(TranslatorProvider):
    """Translation using Sarvam AI mayura model with glossary protection and auto-chunking for long advisories."""

    def __init__(self) -> None:
        self._client = httpx.AsyncClient(timeout=_TIMEOUT)

    async def _translate_single_chunk(self, chunk: str, source_code: str, target_code: str) -> str:
        if not chunk.strip():
            return chunk
        try:
            resp = await self._client.post(
                f"{settings.sarvam_api_base}/translate",
                headers={"api-subscription-key": settings.sarvam_api_key,
                         "Content-Type": "application/json"},
                json={
                    "input": chunk,
                    "source_language_code": source_code,
                    "target_language_code": target_code,
                    "model": settings.sarvam_translate_model,
                    "enable_preprocessing": False,
                },
            )
            resp.raise_for_status()
            return resp.json().get("translated_text", chunk)
        except Exception as exc:
            log.warning("sarvam_single_chunk_translate_failed", error=str(exc))
            return chunk

    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        if source_lang == target_lang or not text or not text.strip():
            return text

        cache_key = f"{source_lang}:{target_lang}:{text}"
        if cache_key in _TRANSLATE_MEM_CACHE:
            return _TRANSLATE_MEM_CACHE[cache_key]

        # Protect glossary terms by substituting placeholders
        protected, replacements = _protect_glossary(text)

        source_code = _LANG_CODE_MAP.get(source_lang, "en-IN")
        target_code = _LANG_CODE_MAP.get(target_lang, "hi-IN")

        try:
            if len(protected) <= 850:
                translated = await self._translate_single_chunk(protected, source_code, target_code)
            else:
                import asyncio
                chunks = _chunk_text_for_translation(protected, max_chars=800)
                translated_chunks = await asyncio.gather(
                    *[self._translate_single_chunk(c, source_code, target_code) for c in chunks]
                )
                translated = "\n\n".join(translated_chunks)
        except Exception as exc:
            log.error("sarvam_translate_failed", error=str(exc))
            return text  # fallback: return original

        # Restore glossary terms
        result = _restore_glossary(translated, replacements)
        _TRANSLATE_MEM_CACHE[cache_key] = result
        return result

    async def close(self) -> None:
        await self._client.aclose()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _chunk_text_for_translation(text: str, max_chars: int = 800) -> list[str]:
    """Split long markdown advisory into <= 800 character blocks for Sarvam Mayura translation."""
    paragraphs = text.split("\n\n")
    chunks: list[str] = []
    current = ""
    for p in paragraphs:
        if len(current) + len(p) + 2 <= max_chars:
            current += ("\n\n" if current else "") + p
        else:
            if current:
                chunks.append(current)
            if len(p) <= max_chars:
                current = p
            else:
                lines = p.split("\n")
                current = ""
                for line in lines:
                    if len(current) + len(line) + 1 <= max_chars:
                        current += ("\n" if current else "") + line
                    else:
                        if current:
                            chunks.append(current)
                        current = line
    if current:
        chunks.append(current)
    return chunks or [text]


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
