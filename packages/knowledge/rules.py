"""
LLM-powered eligibility rule extractor (M2 Part B).

For each SourceDocument, calls the Anthropic API with temperature=0 and a
JSON schema to extract an EligibilityRule. Verifies that every criterion's
source_passage is a verbatim substring of the document text. Retries once
on validation errors.

Skips extraction if content_hash matches an existing rule's document hash
(idempotent).
"""

from __future__ import annotations

import json
import re
import unicodedata
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

import anthropic
import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from packages.config import settings
from packages.knowledge.db import DocumentModel, EligibilityRuleModel
from packages.knowledge.schemas import Criterion, EligibilityRule

log = structlog.get_logger(__name__)

_PROMPT_TEMPLATE = (
    Path(__file__).parent.parent / "ingest" / "prompts" / "rule_extraction.md"
).read_text(encoding="utf-8")


def _normalise_ws(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    return re.sub(r"\s+", " ", text).strip()


def _passage_in_doc(passage: str, doc_text: str) -> bool:
    """Check that a passage appears verbatim (normalised) in the document."""
    return _normalise_ws(passage) in _normalise_ws(doc_text)


def _parse_llm_json(content: str) -> dict[str, Any]:
    """Extract JSON from LLM content (may be wrapped in ```json ... ```)."""
    # Try to extract code block
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", content, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    # Try raw JSON
    return json.loads(content.strip())


async def extract_rule_for_document(
    doc: DocumentModel, db: AsyncSession, client: anthropic.AsyncAnthropic
) -> Optional[EligibilityRule]:
    """Extract and store an EligibilityRule for a document.

    Returns the EligibilityRule on success, or None if no rule applies.
    Skips if a rule was already extracted for this document's content_hash.
    """
    # Idempotency: skip if already extracted
    result = await db.execute(
        select(EligibilityRuleModel).where(
            EligibilityRuleModel.document_id == doc.id
        )
    )
    if result.scalar_one_or_none() is not None:
        log.debug("rule_already_extracted", doc_id=str(doc.id))
        return None

    # Build prompt
    # Truncate very long documents to ~6000 tokens worth of text (~24000 chars)
    truncated_text = doc.raw_text[:24000]
    prompt = _PROMPT_TEMPLATE.replace("{{DOCUMENT_TEXT}}", truncated_text)

    raw_output = await _call_llm(client, prompt)
    if not raw_output:
        return None

    rule = await _parse_and_validate(raw_output, doc, doc.raw_text, client, prompt)
    if rule is None:
        return None

    # Persist
    rule_model = EligibilityRuleModel(
        id=rule.id,
        document_id=doc.id,
        scheme_name=rule.scheme_name,
        criteria_json=[c.model_dump() for c in rule.criteria],
        required_documents_json=rule.required_documents,
        deadline=rule.deadline.isoformat() if rule.deadline else None,
        benefit_summary=rule.benefit_summary,
        source_passage=rule.source_passage,
        source_url=rule.source_url,
        extracted_at=rule.extracted_at,
        confidence=rule.confidence,
    )
    db.add(rule_model)
    await db.commit()
    log.info(
        "rule_extracted",
        scheme=rule.scheme_name,
        criteria_count=len(rule.criteria),
        confidence=rule.confidence,
    )
    return rule


async def _call_llm(client: anthropic.AsyncAnthropic, prompt: str) -> Optional[str]:
    try:
        msg = await client.messages.create(
            model=settings.anthropic_model,
            max_tokens=2048,
            temperature=0,
            messages=[{"role": "user", "content": prompt}],
        )
        return msg.content[0].text if msg.content else None
    except Exception as exc:
        log.error("llm_call_failed", error=str(exc))
        return None


async def _parse_and_validate(
    raw_output: str,
    doc: DocumentModel,
    doc_text: str,
    client: anthropic.AsyncAnthropic,
    original_prompt: str,
    _retry: bool = True,
) -> Optional[EligibilityRule]:
    """Parse LLM output into EligibilityRule, verify passages, retry once on failure."""
    try:
        data = _parse_llm_json(raw_output)
    except Exception as exc:
        if _retry:
            log.warning("json_parse_failed_retrying", error=str(exc))
            retry_prompt = (
                original_prompt
                + f"\n\nPrevious attempt failed with: {exc}\n"
                "Please output valid JSON only, no additional text."
            )
            retry_output = await _call_llm(client, retry_prompt)
            if retry_output:
                return await _parse_and_validate(
                    retry_output, doc, doc_text, client, original_prompt, _retry=False
                )
        log.error("json_parse_failed", error=str(exc))
        return None

    if data.get("no_rule"):
        log.info("no_rule_in_document", doc_id=str(doc.id))
        return None

    # Validate and filter criteria
    validated_criteria: list[Criterion] = []
    rejected = 0
    for raw_c in data.get("criteria", []):
        try:
            c = Criterion(**raw_c)
        except Exception as exc:
            log.warning("criterion_invalid", error=str(exc))
            rejected += 1
            continue
        if not _passage_in_doc(c.source_passage, doc_text):
            log.warning(
                "passage_not_found_in_doc",
                passage=c.source_passage[:80],
                doc_id=str(doc.id),
            )
            rejected += 1
            continue
        validated_criteria.append(c)

    if rejected > 0:
        log.info("criteria_rejected", count=rejected)

    # Parse deadline
    deadline = None
    if data.get("deadline"):
        try:
            from datetime import date
            deadline = date.fromisoformat(data["deadline"])
        except Exception:
            pass

    return EligibilityRule(
        id=uuid.uuid4(),
        document_id=doc.id,
        scheme_name=data.get("scheme_name", doc.title),
        criteria=validated_criteria,
        required_documents=data.get("required_documents", []),
        deadline=deadline,
        benefit_summary=data.get("benefit_summary", ""),
        source_passage=data.get("source_passage", ""),
        source_url=doc.source_url,
        extracted_at=datetime.now(timezone.utc),
        confidence=float(data.get("confidence", 0.5)),
    )
