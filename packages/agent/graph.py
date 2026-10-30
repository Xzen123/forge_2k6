"""
Civic Pulse — LangGraph Agent Graph (M4).

Graph nodes:
  intake → (ask_followup | retrieve) → eligibility → (needs_info | compose)
         → verify → (respond | compose_retry | fail_safe)

Every node is an async function that receives and returns AgentState.
"""

from __future__ import annotations

import json
import re
import time
import unicodedata
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal, Optional

import anthropic
import structlog
from langgraph.graph import END, StateGraph
from sqlalchemy.ext.asyncio import AsyncSession

from packages.config import settings
from packages.knowledge.schemas import (
    AgentState,
    Citation,
    Claim,
    Criterion,
    EligibilityResult,
    EligibilityRule,
    TraceEvent,
    UserProfile,
)
from packages.knowledge.store import get_rules_for_documents, search
from packages.agent.eligibility import check_eligibility, _evaluate_criterion

log = structlog.get_logger(__name__)

# ---------------------------------------------------------------------------
# Prompt loading
# ---------------------------------------------------------------------------

_PROMPTS_DIR = Path(__file__).parent / "prompts"


def _load_prompt(name: str) -> str:
    return (_PROMPTS_DIR / f"{name}.md").read_text(encoding="utf-8")


_INTAKE_PROMPT = _load_prompt("intake")
_COMPOSE_PROMPT = _load_prompt("compose")
_VERIFY_PROMPT = _load_prompt("verify")

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _normalise(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    return re.sub(r"\s+", " ", text).strip()


def _trace(state: AgentState, step: str, tool: Optional[str], inp: str, out: str,
           latency_ms: int, ok: bool) -> AgentState:
    state.trace.append(
        TraceEvent(step=step, tool=tool, input_summary=inp, output_summary=out,
                   latency_ms=latency_ms, ok=ok, timestamp=_now())
    )
    return state


def _parse_json(text: str) -> dict[str, Any]:
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    return json.loads(text.strip())


async def _llm_call(client: anthropic.AsyncAnthropic, prompt: str, temperature: float = 0) -> str:
    msg = await client.messages.create(
        model=settings.anthropic_model,
        max_tokens=2048,
        temperature=temperature,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text if msg.content else ""


# ---------------------------------------------------------------------------
# Eligibility engine (deterministic, no LLM)
# ---------------------------------------------------------------------------


# Eligibility engine functions imported from packages.agent.eligibility


# ---------------------------------------------------------------------------
# Agent nodes
# ---------------------------------------------------------------------------


class AgentGraph:
    """Builds and compiles the LangGraph agent graph."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    # --- Node: intake ---

    async def intake(self, state: AgentState) -> AgentState:
        t0 = time.monotonic()
        prompt = _INTAKE_PROMPT.replace("{{USER_MESSAGE}}", state.raw_input)
        try:
            raw = await _llm_call(self._client, prompt, temperature=0)
            data = _parse_json(raw)
        except Exception as exc:
            state.errors.append(f"intake parse error: {exc}")
            return _trace(state, "intake", "llm", state.raw_input[:80],
                          "parse error", int((time.monotonic() - t0) * 1000), ok=False)

        # Update profile
        p = state.profile
        if data.get("age") is not None:
            p.age = int(data["age"])
        if data.get("income_annual") is not None:
            p.income_annual = float(data["income_annual"])
        for field in ("state", "category", "gender", "occupation", "education"):
            if data.get(field) is not None:
                setattr(p, field, data[field])
        if data.get("disability") is not None:
            p.disability = bool(data["disability"])
        if data.get("land_holding") is not None:
            p.land_holding = float(data["land_holding"])

        state.detected_language = data.get("detected_language", "en")
        p.language = state.detected_language
        state.profile = p

        # Determine missing fields that would affect retrieval
        needed = ["age", "income_annual", "state", "category"]
        state.missing_fields = [f for f in needed if getattr(p, f) is None]

        return _trace(state, "intake", "llm", state.raw_input[:80],
                      f"profile extracted, missing={state.missing_fields}",
                      int((time.monotonic() - t0) * 1000), ok=True)

    # --- Node: ask_followup ---

    async def ask_followup(self, state: AgentState) -> AgentState:
        field = state.missing_fields[0]
        question_map = {
            "age": {"en": "How old are you?", "hi": "आपकी उम्र क्या है?", "bn": "আপনার বয়স কত?"},
            "income_annual": {"en": "What is your approximate annual family income (in rupees)?",
                              "hi": "आपकी परिवार की वार्षिक आय लगभग कितनी है (रुपये में)?",
                              "bn": "আপনার পরিবারের বার্ষিক আয় কত (টাকায়)?"},
            "state": {"en": "Which state do you live in?",
                      "hi": "आप किस राज्य में रहते हैं?",
                      "bn": "আপনি কোন রাজ্যে থাকেন?"},
            "category": {"en": "What is your social category? (General / OBC / SC / ST / EWS)",
                         "hi": "आपकी जाति श्रेणी क्या है? (सामान्य / OBC / SC / ST / EWS)",
                         "bn": "আপনার সামাজিক বিভাগ কী? (General / OBC / SC / ST / EWS)"},
        }
        lang = state.detected_language if state.detected_language in ("en", "hi", "bn") else "en"
        question = question_map.get(field, {}).get(lang, f"Please provide your {field}.")
        state.final_answer = question
        return _trace(state, "ask_followup", None, field, question[:80], 0, ok=True)

    # --- Node: retrieve ---

    async def retrieve(self, state: AgentState) -> AgentState:
        t0 = time.monotonic()
        p = state.profile

        # Build query string from profile
        query_parts = [state.raw_input]
        if p.state:
            query_parts.append(p.state)
        if p.category:
            query_parts.append(p.category)
        if p.occupation:
            query_parts.append(p.occupation)
        query = " ".join(query_parts)

        filters: dict = {}
        if p.state:
            filters["state"] = p.state

        try:
            chunks, no_relevant = await search(query, self._db, filters=filters, k=settings.retrieval_k)
        except Exception as exc:
            state.errors.append(f"retrieval error: {exc}")
            chunks, no_relevant = [], True
            log.error("retrieval_failed", error=str(exc))

        state.retrieved_chunks = chunks

        if not no_relevant and chunks:
            doc_ids = list({c.document_id for c in chunks})
            try:
                rules = await get_rules_for_documents(doc_ids, self._db)
                state.candidate_rules = rules
            except Exception as exc:
                state.errors.append(f"rules fetch error: {exc}")
                state.candidate_rules = []

        latency_ms = int((time.monotonic() - t0) * 1000)
        return _trace(state, "retrieve", "pgvector+fts", query[:80],
                      f"chunks={len(chunks)}, no_relevant={no_relevant}, rules={len(state.candidate_rules)}",
                      latency_ms, ok=not no_relevant)

    # --- Node: eligibility ---

    async def eligibility(self, state: AgentState) -> AgentState:
        t0 = time.monotonic()
        results = [check_eligibility(rule, state.profile) for rule in state.candidate_rules]
        state.results = results

        # Collect fields that are still unknown across all rules
        all_unknown = {c.field for r in results for c in r.unknown}
        state.missing_fields = list(all_unknown)

        return _trace(state, "eligibility", None,
                      f"{len(state.candidate_rules)} rules",
                      f"{sum(1 for r in results if r.status == 'eligible')} eligible",
                      int((time.monotonic() - t0) * 1000), ok=True)

    # --- Node: compose ---

    async def compose(self, state: AgentState) -> AgentState:
        t0 = time.monotonic()

        results_txt = "\n".join(
            f"- {r.scheme_name}: {r.status}, passed={len(r.passed)}, failed={len(r.failed)}, unknown={len(r.unknown)}"
            for r in state.results
        ) or "No schemes found."

        passages_txt = "\n".join(
            f"[{i}] (from {c.metadata.get('source_url', 'unknown')}) {c.text[:300]}"
            for i, c in enumerate(state.retrieved_chunks[:10])
        )

        prompt = (
            _COMPOSE_PROMPT
            .replace("{{ELIGIBILITY_RESULTS}}", results_txt)
            .replace("{{RETRIEVED_PASSAGES}}", passages_txt)
            .replace("{{USER_QUESTION}}", state.raw_input)
            .replace("{{USER_LANGUAGE}}", state.detected_language)
        )

        try:
            raw = await _llm_call(self._client, prompt, temperature=0.3)
            data = _parse_json(raw)
        except Exception as exc:
            state.errors.append(f"compose error: {exc}")
            state.final_answer = "I'm having trouble generating an answer right now. Please try again."
            return _trace(state, "compose", "llm", "compose", "error",
                          int((time.monotonic() - t0) * 1000), ok=False)

        # Build Claim objects with citations from retrieved chunks
        claims: list[Claim] = []
        for raw_claim in data.get("claims", []):
            citation_indices: list[int] = raw_claim.get("citation_indices", [])
            citations: list[Citation] = []
            for idx in citation_indices:
                if idx < len(state.retrieved_chunks):
                    chunk = state.retrieved_chunks[idx]
                    citations.append(Citation(
                        url=chunk.metadata.get("source_url", ""),
                        quote=chunk.text[:150],
                        fetched_at=_now(),
                    ))
            claims.append(Claim(
                text=raw_claim.get("text", ""),
                citations=citations,
                verified=False,
            ))

        state.claims = claims
        state.final_answer = data.get("answer_text", "")
        return _trace(state, "compose", "llm", "compose",
                      f"{len(claims)} claims written",
                      int((time.monotonic() - t0) * 1000), ok=True)

    # --- Node: verify ---

    async def verify(self, state: AgentState) -> AgentState:
        t0 = time.monotonic()
        verified_claims: list[Claim] = []
        failed = 0

        for claim in state.claims:
            claim_verified = False
            for citation in claim.citations:
                # 1. String match: quote must appear in a retrieved chunk
                quote_found = any(
                    _normalise(citation.quote) in _normalise(c.text)
                    for c in state.retrieved_chunks
                )
                if not quote_found:
                    continue

                # 2. LLM entailment check
                passage = next(
                    (c.text for c in state.retrieved_chunks
                     if _normalise(citation.quote) in _normalise(c.text)),
                    citation.quote,
                )
                prompt = (
                    _VERIFY_PROMPT
                    .replace("{{CLAIM}}", claim.text)
                    .replace("{{PASSAGE}}", passage[:500])
                )
                try:
                    raw = await _llm_call(self._client, prompt, temperature=0)
                    data = _parse_json(raw)
                    if data.get("entailed"):
                        claim_verified = True
                        break
                except Exception:
                    pass

            if claim_verified:
                claim.verified = True
                verified_claims.append(claim)
            else:
                failed += 1
                log.warning("claim_dropped", claim=claim.text[:80])

        state.claims = verified_claims

        # If too many claims dropped, consider a retry
        total = len(state.claims) + failed
        fail_ratio = failed / total if total > 0 else 0

        if fail_ratio > settings.agent_compose_max_claim_fail_ratio and state.retry_count == 0:
            state.retry_count += 1
            log.warning("too_many_claims_dropped_will_retry", ratio=fail_ratio)

        return _trace(state, "verify", "llm",
                      f"{total} claims",
                      f"{len(verified_claims)} verified, {failed} dropped",
                      int((time.monotonic() - t0) * 1000),
                      ok=len(verified_claims) > 0)

    # --- Node: respond ---

    async def respond(self, state: AgentState) -> AgentState:
        if not state.claims:
            state.final_answer = (
                "I could not verify any claims with official sources for your query. "
                "Please check the official government portals directly. "
                "⚠️ This is informational only."
            )
        # final_answer is already set by compose; claims are the verified subset
        return _trace(state, "respond", None, "", state.final_answer[:80], 0, ok=True)

    # --- Routing ---

    def _route_intake(self, state: AgentState) -> str:
        if state.missing_fields and state.retry_count == 0:
            return "ask_followup"
        return "retrieve"

    def _route_retrieve(self, state: AgentState) -> str:
        if not state.retrieved_chunks:
            return "no_source"
        return "eligibility"

    def _route_eligibility(self, state: AgentState) -> str:
        has_needs_info = any(r.status == "needs_info" for r in state.results)
        if has_needs_info and state.missing_fields and state.retry_count < settings.agent_max_retries:
            return "ask_followup"
        return "compose"

    def _route_verify(self, state: AgentState) -> str:
        fail_ratio_exceeded = (
            state.retry_count > 0
            and len(state.claims) == 0
        )
        if fail_ratio_exceeded:
            return "fail_safe"
        if state.retry_count == 1:
            return "compose"
        return "respond"

    async def _no_source(self, state: AgentState) -> AgentState:
        lang = state.detected_language
        messages = {
            "en": "No official source found for your query. Please check government portals directly.",
            "hi": "आपकी query के लिए कोई आधिकारिक स्रोत नहीं मिला। कृपया सरकारी पोर्टल देखें।",
            "bn": "আপনার প্রশ্নের জন্য কোনো সরকারি সূত্র পাওয়া যায়নি। সরাসরি সরকারি পোর্টাল দেখুন।",
        }
        state.final_answer = messages.get(lang, messages["en"])
        return _trace(state, "no_source", None, "", state.final_answer[:80], 0, ok=False)

    async def _fail_safe(self, state: AgentState) -> AgentState:
        state.final_answer = (
            "I was unable to produce a verified answer at this time. "
            "Please try again later or visit the official government portal. "
            "⚠️ This is informational only."
        )
        return _trace(state, "fail_safe", None, "", state.final_answer[:80], 0, ok=False)

    # --- Compile ---

    def compile(self):
        g = StateGraph(AgentState)

        g.add_node("intake", self.intake)
        g.add_node("ask_followup", self.ask_followup)
        g.add_node("retrieve", self.retrieve)
        g.add_node("eligibility", self.eligibility)
        g.add_node("compose", self.compose)
        g.add_node("verify", self.verify)
        g.add_node("respond", self.respond)
        g.add_node("no_source", self._no_source)
        g.add_node("fail_safe", self._fail_safe)

        g.set_entry_point("intake")

        g.add_conditional_edges("intake", self._route_intake, {
            "ask_followup": "ask_followup",
            "retrieve": "retrieve",
        })
        g.add_edge("ask_followup", END)

        g.add_conditional_edges("retrieve", self._route_retrieve, {
            "eligibility": "eligibility",
            "no_source": "no_source",
        })
        g.add_edge("no_source", END)

        g.add_conditional_edges("eligibility", self._route_eligibility, {
            "ask_followup": "ask_followup",
            "compose": "compose",
        })

        g.add_edge("compose", "verify")

        g.add_conditional_edges("verify", self._route_verify, {
            "respond": "respond",
            "compose": "compose",
            "fail_safe": "fail_safe",
        })

        g.add_edge("respond", END)
        g.add_edge("fail_safe", END)

        return g.compile()


def build_graph(db: AsyncSession):
    """Factory used by the API layer."""
    return AgentGraph(db).compile()
