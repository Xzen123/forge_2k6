"""
Unit tests for document parsers (M2 Part A).
"""

from __future__ import annotations

import pytest
from packages.ingest.parse.parsers import _detect_language, _extract_sections, _normalise, parse_html


def test_normalise_whitespace():
    raw = "  This   is    a\n\n\n\ntest\t\tof whitespace.  "
    clean = _normalise(raw)
    assert clean == "This is a\n\ntest of whitespace."


def test_extract_sections_markdown_headings():
    doc = """
# Introduction
This is the introduction section.

# Eligibility Criteria
Must be an Indian citizen.
Age must be between 18 and 35.

# Documents Required
Aadhaar card, income certificate.
"""
    sections = _extract_sections(doc)
    assert len(sections) == 3
    headings = [h for h, _ in sections]
    assert "Introduction" in headings
    assert "Eligibility Criteria" in headings
    assert "Documents Required" in headings


def test_detect_language_hindi_and_english():
    en_text = "This scheme provides financial assistance to farmers across all states."
    hi_text = "यह योजना देश भर के किसानों को वित्तीय सहायता प्रदान करती है।"
    assert _detect_language(en_text) == "en"
    assert _detect_language(hi_text) == "hi"


def test_parse_html_basic():
    html = """
    <!DOCTYPE html>
    <html>
      <head><title>PM Kisan Scheme</title></head>
      <body>
        <nav><a href="/">Home</a></nav>
        <main>
          <h1>PM Kisan Samman Nidhi</h1>
          <p>Eligible small and marginal farmers receive financial benefit of Rs 6000 per year.</p>
        </main>
        <footer>Copyright 2026</footer>
      </body>
    </html>
    """
    parsed = parse_html(html)
    assert "PM Kisan" in parsed.clean_text
    assert "6000" in parsed.clean_text
    assert parsed.language == "en"
