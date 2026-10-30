"""
Document parsers: HTML, PDF (with OCR fallback), and text normalisation.

Outputs:
  - clean_text: main body text
  - sections: list of (heading, content) tuples for chunking
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from typing import Optional

import structlog

log = structlog.get_logger(__name__)


@dataclass
class ParsedDocument:
    clean_text: str
    sections: list[tuple[str, str]] = field(default_factory=list)  # (heading, body)
    language: str = "en"
    page_count: int = 0


def _normalise(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # collapse multiple whitespace / newlines
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def _detect_language(text: str) -> str:
    try:
        from langdetect import detect
        return detect(text[:2000]) or "en"
    except Exception:
        return "en"


def _extract_sections(text: str) -> list[tuple[str, str]]:
    """Split text into (heading, body) pairs using Markdown-style or ALL-CAPS headings."""
    sections: list[tuple[str, str]] = []
    current_heading = ""
    current_body_lines: list[str] = []

    for line in text.splitlines():
        stripped = line.strip()
        # Match Markdown headings or ALL-CAPS lines as section headers
        if re.match(r"^#{1,4}\s+\S", stripped) or (
            len(stripped) > 5
            and stripped.isupper()
            and len(stripped) < 120
        ):
            body = "\n".join(current_body_lines).strip()
            if current_heading or body:
                sections.append((current_heading, body))
            current_heading = stripped.lstrip("# ").strip()
            current_body_lines = []
        else:
            current_body_lines.append(line)

    body = "\n".join(current_body_lines).strip()
    if current_heading or body:
        sections.append((current_heading, body))

    return sections


def parse_html(html: str) -> ParsedDocument:
    """Extract main content from HTML using trafilatura, fallback to BS4 or HTMLParser."""
    text = None
    try:
        import trafilatura
        text = trafilatura.extract(html, include_tables=True, include_comments=False)
    except Exception:
        text = None

    if not text:
        try:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(html, "html.parser")
            for tag in soup(["script", "style", "nav", "header", "footer"]):
                tag.decompose()
            text = soup.get_text(separator="\n", strip=True)
        except Exception:
            try:
                from html.parser import HTMLParser

                class _SimpleHTMLTextExtractor(HTMLParser):
                    def __init__(self):
                        super().__init__()
                        self.text_parts: list[str] = []
                        self._ignore = False

                    def handle_starttag(self, tag, attrs):
                        if tag in ("script", "style", "nav", "header", "footer"):
                            self._ignore = True

                    def handle_endtag(self, tag):
                        if tag in ("script", "style", "nav", "header", "footer"):
                            self._ignore = False

                    def handle_data(self, data):
                        if not self._ignore:
                            self.text_parts.append(data)

                extractor = _SimpleHTMLTextExtractor()
                extractor.feed(html)
                text = "\n".join(extractor.text_parts)
            except Exception as exc:
                log.error("html_parse_failed", error=str(exc))
                text = ""

    text = _normalise(text or "")
    return ParsedDocument(
        clean_text=text,
        sections=_extract_sections(text),
        language=_detect_language(text),
    )


def parse_pdf(pdf_bytes: bytes, ocr_langs: str = "eng+hin+ben") -> ParsedDocument:
    """Extract text from PDF; fall back to Tesseract OCR for image-heavy pages."""
    try:
        import fitz  # PyMuPDF
    except ImportError:
        log.error("pymupdf_not_installed")
        return ParsedDocument(clean_text="")

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    all_text_parts: list[str] = []
    page_count = len(doc)

    for page_num, page in enumerate(doc, start=1):
        text = page.get_text("text")
        if len(text.strip()) < 50:
            # Sparse text — try OCR
            text = _ocr_page(page, ocr_langs, page_num)
        all_text_parts.append(f"[Page {page_num}]\n{text}")

    full_text = _normalise("\n\n".join(all_text_parts))
    return ParsedDocument(
        clean_text=full_text,
        sections=_extract_sections(full_text),
        language=_detect_language(full_text),
        page_count=page_count,
    )


def _ocr_page(page, ocr_langs: str, page_num: int) -> str:
    """Rasterise a PyMuPDF page and run Tesseract OCR."""
    try:
        import pytesseract
        from PIL import Image
        import io

        pix = page.get_pixmap(dpi=200)
        img_bytes = pix.tobytes("png")
        img = Image.open(io.BytesIO(img_bytes))
        config = f"--oem 3 --psm 6 -l {ocr_langs}"
        text = pytesseract.image_to_string(img, config=config)
        return text
    except Exception as exc:
        log.warning("ocr_failed", page=page_num, error=str(exc))
        return ""


def parse_text(raw: str) -> ParsedDocument:
    """Minimal parser for already-text documents."""
    text = _normalise(raw)
    return ParsedDocument(
        clean_text=text,
        sections=_extract_sections(text),
        language=_detect_language(text),
    )
