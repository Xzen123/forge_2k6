"""
Guardrails for Civic Pulse (M5).

1. Input guardrails: off-topic, empty, too long, prompt injection detection.
2. PII detection and redaction before logging.
3. Output guardrails: disclaimer injection.
4. Rate limiting utilities.
"""

from __future__ import annotations

import re
from typing import Optional

import structlog

log = structlog.get_logger(__name__)

# ---------------------------------------------------------------------------
# PII patterns (for redaction before logging / sending to 3rd parties)
# ---------------------------------------------------------------------------

_PII_PATTERNS = [
    (re.compile(r"\b[2-9]\d{3}\s?\d{4}\s?\d{4}\b"), "AADHAAR_REDACTED"),       # Aadhaar
    (re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"), "PAN_REDACTED"),                  # PAN
    (re.compile(r"\b[6-9]\d{9}\b"), "PHONE_REDACTED"),                            # Indian mobile
    (re.compile(r"\b\d{9,18}\b"), "BANK_REDACTED"),                               # bank account (rough)
]

# ---------------------------------------------------------------------------
# Prompt injection patterns
# ---------------------------------------------------------------------------

_INJECTION_PATTERNS = [
    re.compile(p, re.IGNORECASE)
    for p in [
        r"ignore\s+(all\s+)?previous\s+instructions",
        r"you\s+are\s+now",
        r"disregard\s+(all\s+)?prior",
        r"act\s+as\s+if\s+you",
        r"new\s+system\s+prompt",
        r"jailbreak",
        r"DAN\s+mode",
    ]
]

# ---------------------------------------------------------------------------
# Off-topic patterns (not civic/scheme related)
# ---------------------------------------------------------------------------

_OFF_TOPIC_PATTERNS = [
    re.compile(p, re.IGNORECASE)
    for p in [
        r"\b(cook|recipe|film|movie|cricket|sports|game|joke|love|poem|song)\b",
        r"\b(stock|share\s+market|forex|bitcoin|crypto)\b",
    ]
]

_MAX_INPUT_CHARS = 2000


class InputGuardrailError(ValueError):
    """Raised when input is rejected by guardrails."""
    pass


def check_input(text: str) -> str:
    """Validate and sanitise user input. Returns cleaned text or raises InputGuardrailError."""
    if not text or not text.strip():
        raise InputGuardrailError("empty_input")

    if len(text) > _MAX_INPUT_CHARS:
        raise InputGuardrailError("input_too_long")

    for pattern in _INJECTION_PATTERNS:
        if pattern.search(text):
            log.warning("prompt_injection_detected", snippet=text[:60])
            raise InputGuardrailError("prompt_injection")

    for pattern in _OFF_TOPIC_PATTERNS:
        if pattern.search(text):
            raise InputGuardrailError("off_topic")

    return text.strip()


def redact_pii(text: str) -> str:
    """Redact known PII patterns from text before logging or sending to APIs."""
    for pattern, replacement in _PII_PATTERNS:
        text = pattern.sub(replacement, text)
    return text


def add_disclaimer(answer: str) -> str:
    """Append the standard informational disclaimer to an answer if not already present."""
    disclaimer = (
        "\n\n⚠️ **यह सूचनात्मक है / This is informational only.** "
        "Please verify eligibility and apply through the official government portal. "
        "The official portal is the final authority."
    )
    if "informational" in answer.lower() or "official portal" in answer.lower():
        return answer
    return answer + disclaimer


# ---------------------------------------------------------------------------
# User-friendly error messages (per language)
# ---------------------------------------------------------------------------

_ERROR_MESSAGES: dict[str, dict[str, str]] = {
    "empty_input": {
        "en": "Please type or speak your question.",
        "hi": "कृपया अपना प्रश्न टाइप करें या बोलें।",
        "bn": "অনুগ্রহ করে আপনার প্রশ্ন টাইপ করুন বা বলুন।",
    },
    "input_too_long": {
        "en": "Your message is too long. Please keep it under 2000 characters.",
        "hi": "आपका संदेश बहुत लंबा है। कृपया 2000 अक्षरों से कम रखें।",
        "bn": "আপনার বার্তা অনেক দীর্ঘ। অনুগ্রহ করে ২০০০ অক্ষরের মধ্যে রাখুন।",
    },
    "prompt_injection": {
        "en": "I can only help with government scheme information. Please ask about schemes or policies.",
        "hi": "मैं केवल सरकारी योजनाओं की जानकारी दे सकता हूं।",
        "bn": "আমি শুধুমাত্র সরকারি প্রকল্পের তথ্য দিতে পারি।",
    },
    "off_topic": {
        "en": "I can only help with government schemes, policies, and eligibility. Please ask about those.",
        "hi": "मैं केवल सरकारी योजनाओं और पात्रता के बारे में बता सकता हूं।",
        "bn": "আমি শুধুমাত্র সরকারি প্রকল্প ও যোগ্যতা সম্পর্কে সাহায্য করতে পারি।",
    },
    "source_stale": {
        "en": "Our data source is temporarily unavailable. Showing last known information.",
        "hi": "डेटा स्रोत अस्थायी रूप से अनुपलब्ध है। पिछली ज्ञात जानकारी दिखाई जा रही है।",
        "bn": "তথ্য উৎস সাময়িকভাবে অনুপলব্ধ। শেষ পরিচিত তথ্য দেখানো হচ্ছে।",
    },
    "db_unavailable": {
        "en": "Our database is temporarily unavailable. Please try again in a moment.",
        "hi": "डेटाबेस अस्थायी रूप से अनुपलब्ध है। कृपया थोड़ी देर बाद पुनः प्रयास करें।",
        "bn": "ডেটাবেস সাময়িকভাবে অনুপলব্ধ। একটু পরে আবার চেষ্টা করুন।",
    },
    "llm_unavailable": {
        "en": "AI service is temporarily unavailable. Please try again shortly.",
        "hi": "AI सेवा अस्थायी रूप से अनुपलब्ध है।",
        "bn": "AI পরিষেবা সাময়িকভাবে অনুপলব্ধ।",
    },
    "stt_failure": {
        "en": "Could not understand the audio. Please type your question instead.",
        "hi": "ऑडियो समझ में नहीं आया। कृपया अपना प्रश्न टाइप करें।",
        "bn": "অডিও বোঝা যায়নি। অনুগ্রহ করে প্রশ্নটি টাইপ করুন।",
    },
    "unsupported_language": {
        "en": "This language is not supported yet. Answering in English.",
        "hi": "यह भाषा अभी समर्थित नहीं है। अंग्रेज़ी में उत्तर दिया जा रहा है।",
        "bn": "এই ভাষা এখনও সমর্থিত নয়। ইংরেজিতে উত্তর দেওয়া হচ্ছে।",
    },
    "expired_deadline": {
        "en": "The application deadline for this scheme has passed. Check the official portal for updates.",
        "hi": "इस योजना की आवेदन समय सीमा समाप्त हो गई है।",
        "bn": "এই প্রকল্পের আবেদনের সময়সীমা শেষ হয়ে গেছে।",
    },
    "no_source": {
        "en": "No official source was found for your query. Please check government portals directly.",
        "hi": "आपकी query के लिए कोई आधिकारिक स्रोत नहीं मिला।",
        "bn": "আপনার প্রশ্নের জন্য কোনো সরকারি সূত্র পাওয়া যায়নি।",
    },
}


def get_error_message(error_key: str, lang: str = "en") -> str:
    """Return a localised, user-friendly error message. Never exposes stack traces."""
    messages = _ERROR_MESSAGES.get(error_key, {})
    return messages.get(lang, messages.get("en", "An error occurred. Please try again."))
