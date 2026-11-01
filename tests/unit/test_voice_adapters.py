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


def test_clean_text_for_speech_extracts_direct_solution_not_problem():
    text = (
        "Your profile as a 15-year-old daily wage construction laborer across India with annual family income ₹600,000 "
        "matches distinct policy channels: statutory public welfare and development programs. "
        "Because welfare guidelines enforce specific criteria for domicile and community classifications, "
        "your verified statutory entitlements are structured below based on official government notifications.\n\n"
        "### Scheme Mapping by Course & Scenario\n"
        "| Scholarship / Welfare Scheme | Managing Body | Eligibility Match | Financial & In-Kind Benefits |\n"
        "|---|---|---|---|\n"
        "| BOCW Social Security Scheme | Ministry of Labour & Employment | Construction worker | Tool purchase grant of ₹5,000, disability cover up to ₹2 Lakh |\n"
        "| Ayushman Bharat (PM-JAY) | National Health Authority | SECC deprivation criteria | Free hospital treatment up to ₹5 Lakh per family per year |\n\n"
        "### Step-by-Step Action Plan\n"
        "1. Register on the official portal at https://eshram.gov.in with your Aadhaar and bank account.\n"
    )
    from packages.lang.voice import clean_text_for_speech
    cleaned = clean_text_for_speech(text)

    # Must NOT echo the demographic problem statement or preamble
    assert "matches distinct policy channels" not in cleaned.lower()
    assert "your profile as a 15-year-old" not in cleaned.lower()
    assert "because welfare guidelines enforce" not in cleaned.lower()

    # MUST contain the direct solution and benefits
    assert "Direct Solution:" in cleaned
    assert "BOCW Social Security Scheme" in cleaned
    assert "Ayushman Bharat" in cleaned
    assert "eshram.gov.in" in cleaned


def test_chunk_text_for_translation():
    from packages.lang.voice import _chunk_text_for_translation
    long_doc = "Paragraph one with detailed guidelines.\n\n" * 25
    assert len(long_doc) > 1000
    chunks = _chunk_text_for_translation(long_doc, max_chars=800)
    assert len(chunks) >= 2
    for c in chunks:
        assert len(c) <= 800
