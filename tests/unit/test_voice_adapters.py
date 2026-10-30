"""
Unit tests for multilingual voice adapters (M6).
"""

from __future__ import annotations

import pytest
from packages.lang.voice import (
    _chunk_text_for_tts,
    _protect_glossary,
    _restore_glossary,
    detect_language,
)


def test_glossary_protection_and_restoration():
    text = "Eligible beneficiaries under PM-KISAN must present Aadhaar and PAN cards. OBC category applies."
    protected, replacements = _protect_glossary(text)

    assert "PM-KISAN" not in protected
    assert "Aadhaar" not in protected
    assert "PAN" not in protected
    assert "OBC" not in protected
    assert len(replacements) >= 4

    restored = _restore_glossary(protected, replacements)
    assert restored == text


def test_tts_chunk_boundaries():
    text = "First sentence here. Second sentence starts now! Third sentence is exciting? Fourth sentence finishes."
    chunks = _chunk_text_for_tts(text, max_chars=40)
    assert len(chunks) >= 3
    # Verify no sentence words were lost
    for word in ["First", "Second", "Third", "Fourth"]:
        assert any(word in c for c in chunks)


def test_detect_language_regional():
    hi = "मेरी उम्र 22 वर्ष है और मैं बिहार से हूँ।"
    bn = "আমার বয়স ২২ বছর এবং আমি পশ্চিমবঙ্গের বাসিন্দা।"
    assert detect_language(hi) == "hi"
    assert detect_language(bn) == "bn"
