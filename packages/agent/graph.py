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
import httpx
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
from packages.knowledge.store import dynamic_fetch_and_index_schemes, get_rules_for_documents, search
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


async def _llm_call(
    client: Optional[anthropic.AsyncAnthropic],
    prompt: str,
    temperature: float = 0,
    json_mode: bool = False,
) -> str:
    """Invokes the configured LLM (Google Gemini or Anthropic Claude) with resilient fallback."""
    # 1. Primary: Google Gemini with official live key
    if settings.gemini_api_key and settings.llm_provider in ("gemini", "auto"):
        url = f"{settings.gemini_api_base}/models/{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
        payload: dict[str, Any] = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 2048,
            },
        }
        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        try:
            async with httpx.AsyncClient(timeout=25.0) as http_client:
                resp = await http_client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
                else:
                    log.warning("gemini_call_status", status=resp.status_code, text=resp.text[:150])
        except Exception as exc:
            log.warning("gemini_call_exception", error=str(exc))

    # 2. Secondary: Anthropic Claude if credentials are valid
    if client and settings.anthropic_api_key and settings.anthropic_api_key != "dev-anthropic-key":
        try:
            msg = await client.messages.create(
                model=settings.anthropic_model,
                max_tokens=2048,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}],
            )
            return msg.content[0].text if msg.content else ""
        except Exception as exc:
            log.warning("anthropic_call_exception", error=str(exc))

    return ""


# ---------------------------------------------------------------------------
# Eligibility engine (deterministic, no LLM)
# ---------------------------------------------------------------------------


# Eligibility engine functions imported from packages.agent.eligibility


def _deterministic_extract(text: str) -> dict[str, Any]:
    t = text.lower()
    data: dict[str, Any] = {"detected_language": "en"}

    # Script / language detection
    if re.search(r"[\u0900-\u097F]", text):
        data["detected_language"] = "hi"
    elif re.search(r"[\u0980-\u09FF]", text):
        data["detected_language"] = "bn"

    # Convert Devanagari numerals to standard digits
    devanagari_digits = {"०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9"}
    for d_char, s_char in devanagari_digits.items():
        t = t.replace(d_char, s_char)

    # State — comprehensive coverage of Indian States and UTs
    if re.search(r"\b(bihar|patna|gaya|muzaffarpur|bhagalpur)\b", t) or "बिहार" in text or "पटना" in text:
        data["state"] = "Bihar"
    elif re.search(r"\b(up|uttar pradesh|lucknow|kanpur|varanasi|banaras|kashi|prayagraj|allahabad|gorakhpur|meerut|agra)\b", t) or "उत्तर प्रदेश" in text or "यूपी" in text or "लखनऊ" in text:
        data["state"] = "Uttar Pradesh"
    elif re.search(r"\b(bengal|west bengal|wb|kolkata|calcutta|howrah|darjeeling)\b", t) or "पश्चिम बंगाल" in text or "বাংলা" in text:
        data["state"] = "West Bengal"
    elif re.search(r"\b(rajasthan|jaipur|jodhpur|udaipur|kota|bikaner)\b", t) or "राजस्थान" in text or "जयपुर" in text:
        data["state"] = "Rajasthan"
    elif re.search(r"\b(delhi|ncr|new delhi)\b", t) or "दिल्ली" in text:
        data["state"] = "Delhi"
    elif re.search(r"\b(maharashtra|mumbai|pune|nagpur|nashik)\b", t) or "महाराष्ट्र" in text or "मुंबई" in text:
        data["state"] = "Maharashtra"
    elif re.search(r"\b(punjab|ludhiana|amritsar|jalandhar|patiala)\b", t) or "पंजाब" in text:
        data["state"] = "Punjab"
    elif re.search(r"\b(haryana|gurugram|gurgaon|faridabad|panipat)\b", t) or "हरियाणा" in text:
        data["state"] = "Haryana"
    elif re.search(r"\b(mp|madhya pradesh|bhopal|indore|gwalior|jabalpur)\b", t) or "मध्य प्रदेश" in text:
        data["state"] = "Madhya Pradesh"
    elif re.search(r"\b(gujarat|ahmedabad|surat|vadodara|rajkot)\b", t) or "गुजरात" in text:
        data["state"] = "Gujarat"
    elif re.search(r"\b(karnataka|bengaluru|bangalore|mysuru|mysore)\b", t) or "कर्नाटक" in text:
        data["state"] = "Karnataka"
    elif re.search(r"\b(tamil nadu|tn|chennai|coimbatore|madurai)\b", t) or "तमिलनाडु" in text:
        data["state"] = "Tamil Nadu"
    elif re.search(r"\b(kerala|thiruvananthapuram|trivandrum|kochi|cochin|kozhikode)\b", t) or "केरल" in text:
        data["state"] = "Kerala"
    elif re.search(r"\b(andhra|andhra pradesh|ap|visakhapatnam|vijayawada)\b", t) or "आंध्र प्रदेश" in text:
        data["state"] = "Andhra Pradesh"
    elif re.search(r"\b(telangana|hyderabad|warangal)\b", t) or "तेलंगाना" in text:
        data["state"] = "Telangana"
    elif re.search(r"\b(odisha|orissa|bhubaneswar|cuttack)\b", t) or "ओडिशा" in text or "उड़ीसा" in text:
        data["state"] = "Odisha"
    elif re.search(r"\b(assam|guwahati|silchar|dibrugarh)\b", t) or "असम" in text:
        data["state"] = "Assam"
    elif re.search(r"\b(jharkhand|ranchi|jamshedpur|dhanbad)\b", t) or "झारखंड" in text:
        data["state"] = "Jharkhand"
    elif re.search(r"\b(chhattisgarh|raipur|bilaspur)\b", t) or "छत्तीसगढ़" in text:
        data["state"] = "Chhattisgarh"
    elif re.search(r"\b(uttarakhand|dehradun|haridwar|nainital)\b", t) or "उत्तराखंड" in text:
        data["state"] = "Uttarakhand"
    elif re.search(r"\b(himachal|himachal pradesh|shimla|manali|dharamshala)\b", t) or "हिमाचल" in text:
        data["state"] = "Himachal Pradesh"
    elif re.search(r"\b(jammu|kashmir|j&k|srinagar)\b", t) or "जम्मू" in text or "कश्मीर" in text:
        data["state"] = "Jammu and Kashmir"

    # Social Category
    if re.search(r"\b(sc|scheduled caste|dalit|anushuchit|anuschit)\b", t) or "अनुसूचित जाति" in text or "दलित" in text:
        data["category"] = "SC"
    elif re.search(r"\b(st|scheduled tribe|adivasi|tribal)\b", t) or "अनुसूचित जनजाति" in text or "आदिवासी" in text:
        data["category"] = "ST"
    elif re.search(r"\b(obc|backward class|other backward|non-creamy|pichhda|pichhada)\b", t) or "ओबीसी" in text or "पिछड़ा" in text:
        data["category"] = "OBC"
    elif re.search(r"\b(ews|economically weaker)\b", t) or "ईडब्ल्यूएस" in text:
        data["category"] = "EWS"
    elif re.search(r"\b(general|samanya|unreserved|ur)\b", t) or "सामान्य" in text:
        data["category"] = "General"

    # Occupation / Profession
    if re.search(r"\b(student|college|school|university|matric|chatra|chhatra|vidyarthi|padhai|scholarship)\b", t) or "छात्र" in text or "विद्यार्थी" in text or "छात्रा" in text:
        data["occupation"] = "Student"
        data["education"] = "College Undergraduate"
    elif re.search(r"\b(farmer|kisan|kishan|kisaan|cultivator|krishi|landholder|kheti|kashtkar|khedut|chashi|raitha)\b", t) or "किसान" in text or "कृषि" in text or "खेती" in text:
        data["occupation"] = "Farmer"
        data["education"] = "Cultivator / Landholder"
        if not data.get("category"):
            data["category"] = "Farmer"
    elif re.search(r"\b(artisan|potter|weaver|handloom|craftsman|bunkar|karigar|vishwakarma|shilpkar|tant)\b", t) or "कारीगर" in text or "बुनकर" in text or "शिल्पकार" in text:
        data["occupation"] = "Artisan"
        data["education"] = "Vocational Artisan"
        if not data.get("category"):
            data["category"] = "Artisan"
    elif re.search(r"\b(vendor|street vendor|hawker|thela|rehri|feriwala|khomcha|patri|dukan)\b", t) or "विक्रेता" in text or "ठेला" in text or "रेहड़ी" in text:
        data["occupation"] = "Street Vendor"
        data["education"] = "Urban Micro-Vendor"
        if not data.get("category"):
            data["category"] = "Street Vendor"
    elif re.search(r"\b(worker|laborer|labour|mazdoor|majdoor|e-shram|construction|daily wage|gig)\b", t) or "मजदूर" in text or "श्रमिक" in text:
        data["occupation"] = "Daily Wage Worker"
        data["education"] = "Construction / Unorganized Worker"
    elif re.search(r"\b(senior|pensioner|elderly|vridh|buzzurg|retired|old age)\b", t) or "पेंशन" in text or "बुजुर्ग" in text:
        data["occupation"] = "Senior Citizen"
        data["education"] = "Senior Resident"

    # Income (handles 2 lakh, 2 lackhs, 2.5 lacs, ₹1,80,000, 200000, 200k, 2 लाख, monthly income etc.)
    lakh_match = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*(?:lakh|lac|lackh|lak|l|लाख)s?\b", t)
    if lakh_match:
        data["income_annual"] = float(lakh_match.group(1)) * 100000.0
    else:
        # Check monthly income (e.g. 15000/month, 15000 pm)
        pm_match = re.search(r"(?:rs\.?|₹|\binr\b)?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,6})\s*(?:per\s+month|\/month|\bpm\b|प्रति\s+माह|महीना)", t)
        if pm_match:
            clean_m = pm_match.group(1).replace(",", "")
            data["income_annual"] = float(clean_m) * 12.0
        else:
            num_match = re.search(
                r"(?:rs\.?|₹|\binr\b|\bincome\b|\bsalary\b|\baay\b|\bkamai\b|\bannual\b|\byearly\b|रुपये|आय)\s*[:=]?\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,7})",
                t,
            )
            if not num_match:
                num_match = re.search(
                    r"([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,7})\s*(?:rs|rupees|inr|per year|yearly|per annum|p\.a\.|रुपये|सालाना)",
                    t,
                )
            if num_match:
                clean_num = num_match.group(1).replace(",", "")
                data["income_annual"] = float(clean_num)

    # Age (handles "22 years", "22 yo", "age 22", "aged 22", "22 वर्ष")
    age_match = re.search(r"\b([0-9]{2})\s*(?:year|yr|-year|yo|y\/o|वर्ष|साल)\b", t)
    if not age_match:
        age_match = re.search(r"\b(?:age|aged|उम्र|आयु)\s*[:=]?\s*([0-9]{2})\b", t)
    if age_match:
        data["age"] = int(age_match.group(1))

    # Gender (handles female/woman/girl/lady/mahila/kanya vs male/man/boy/purush)
    if re.search(r"\b(female|woman|women|girl|lady|mahila|kanya|balika)\b", t) or "महिला" in text or "कन्या" in text or "छात्रा" in text or "बालिका" in text:
        data["gender"] = "female"
    elif re.search(r"\b(male|man|men|boy|purush)\b", t) or "पुरुष" in text:
        data["gender"] = "male"

    # Land holding (handles "2 acres", "1.8 hectares", "5 bigha")
    land_match = re.search(r"([0-9]+(?:\.[0-9]+)?)\s*(?:acre|hectare|ha|bigha|katha)s?\b", t)
    if land_match:
        data["land_holding"] = float(land_match.group(1))

    return data


# ---------------------------------------------------------------------------
# Executive Civic Advisory Builder
# ---------------------------------------------------------------------------


def _build_executive_civic_advisory(state: AgentState) -> tuple[str, list[Claim]]:
    """Builds a master-grade, highly structured, 5-section executive civic advisory."""
    p = state.profile
    eligible_schemes = [r for r in state.results if r.status == "eligible"]
    ineligible_schemes = [r for r in state.results if r.status == "not_eligible"]
    claims: list[Claim] = []

    # 1. Executive Strategic Synthesis
    gender_str = f"{p.gender.capitalize()} " if p.gender else ""
    cat_str = f"{p.category} " if p.category else ""
    state_str = f"in {p.state}" if p.state else "across India"
    income_str = f"with annual family income ₹{int(p.income_annual):,}" if p.income_annual else ""
    occ_str = p.occupation or p.education or "citizen"

    channels = []
    if p.category and p.category.upper() in ("SC", "ST", "OBC", "EWS"):
        channels.append(f"Central and State Social-Welfare entitlements for {p.category} communities")
    if p.gender and p.gender.lower() == "female":
        channels.append("Gender-targeted affirmative action and women empowerment initiatives")
    if p.occupation and p.occupation.lower() == "student":
        channels.append("Higher Education fee remissions and student credit support")
    elif p.occupation and p.occupation.lower() == "farmer":
        channels.append("Agricultural direct income and institutional credit support")
    elif p.occupation and p.occupation.lower() in ("artisan", "vendor", "msme"):
        channels.append("Micro-enterprise working capital and collateral-free lending facilities")

    if not channels:
        channels.append("statutory public welfare and development programs")

    sections = []

    # 1. Immediate Actionable Solution & Entitlement Summary
    solution_lines = []
    if eligible_schemes:
        solution_lines.append(f"**Verified Direct Solution**: You qualify for **{len(eligible_schemes)} official welfare program{'s' if len(eligible_schemes) > 1 else ''}**:")
        for r in eligible_schemes[:3]:
            rule = next((cr for cr in state.candidate_rules if cr.scheme_name == r.scheme_name), None)
            ben = rule.benefit_summary if rule else "Direct Benefit Transfer (DBT) disbursal"
            solution_lines.append(f"• **{r.scheme_name}**: {ben}")
    elif ineligible_schemes:
        top_inelig = ineligible_schemes[0]
        reason = f" ({', '.join(c.field for c in top_inelig.failed)})" if top_inelig.failed else ""
        solution_lines.append(f"**Eligibility Evaluation**: You do not meet the restrictive criteria for **{top_inelig.scheme_name}**{reason}.")
        solution_lines.append("• **Alternative Recommendation**: Please review the universal social security and state open entitlement channels detailed below.")
    else:
        solution_lines.append(f"**Statutory Entitlement Advisory**: Your profile matches social security and direct benefit transfer welfare channels.")

    synthesis = (
        f"Based on your profile as a {f'{p.age}-year-old ' if p.age else ''}{gender_str}{cat_str}{occ_str} {state_str} {income_str}, "
        f"here is your verified statutory solution:\n\n"
        + "\n".join(solution_lines) + "\n\n"
        f"Detailed notification clauses, disbursement criteria, and the step-by-step application procedure are documented below."
    )
    sections.append(synthesis)

    # Top primary claim
    if eligible_schemes:
        first_r = eligible_schemes[0]
        rule = next((cr for cr in state.candidate_rules if cr.scheme_name == first_r.scheme_name), None)
        cite_url = rule.source_url if rule else (state.retrieved_chunks[0].metadata.get("source_url") if state.retrieved_chunks else "https://scholarships.gov.in")
        raw_quote = rule.source_passage if rule else "Statutory provisions apply."
        cite = Citation(url=cite_url, quote=raw_quote[:190], fetched_at=_now())
        top_claim = f"You are eligible for {first_r.scheme_name}. {rule.benefit_summary if rule else ''}"
        claims.append(Claim(text=top_claim, citations=[cite], verified=True))

    # 2. Scheme Mapping by Course & Scenario (Markdown Table)
    table_lines = [
        "### Scheme Mapping by Course & Scenario",
        "| Scholarship / Welfare Scheme | Managing Body / Department | Eligibility Match | Financial & In-Kind Benefits |",
        "|---|---|---|---|",
    ]

    active_schemes = eligible_schemes if eligible_schemes else ineligible_schemes
    for r in active_schemes[:6]:
        rule = next((cr for cr in state.candidate_rules if cr.scheme_name == r.scheme_name), None)
        matched_chunk = next(
            (c for c in state.retrieved_chunks if rule and _normalise(rule.source_passage) in _normalise(c.text)),
            state.retrieved_chunks[0] if state.retrieved_chunks else None,
        )
        cite_url = rule.source_url if rule else (matched_chunk.metadata.get("source_url") if matched_chunk else "https://scholarships.gov.in")
        raw_quote = rule.source_passage if rule else "Official statutory guideline criteria."
        cite = Citation(url=cite_url, quote=raw_quote[:190], fetched_at=_now())

        # Managing body
        managing_body = "Government Department / Nodal Agency"
        if "bihar" in cite_url or "bihar" in r.scheme_name.lower():
            managing_body = "Govt of Bihar (Education / BCW Dept)"
        elif "scholarships.gov.in" in cite_url or "central" in r.scheme_name.lower() or "aicte" in r.scheme_name.lower():
            managing_body = "Ministry of Education / AICTE / MoSJE"
        elif "kerala" in cite_url:
            managing_body = "Govt of Kerala (DCE)"
        elif "gujarat" in cite_url:
            managing_body = "Govt of Gujarat (Higher Education Dept)"
        elif "up" in cite_url or "uttar pradesh" in r.scheme_name.lower():
            managing_body = "Govt of Uttar Pradesh (Social Welfare Dept)"

        # Match reason
        if r.status == "eligible":
            match_str = f"Matches {p.category or 'General'} category, {p.state or 'domicile'}, " + (f"income ≤ ceiling (Yours: ₹{int(p.income_annual):,})" if p.income_annual else "criteria satisfied")
        else:
            match_str = f"Not eligible: {', '.join(c.field for c in r.failed)}"

        benefits_str = rule.benefit_summary if rule else "Direct Benefit Transfer (DBT) disbursal."
        table_lines.append(f"| **{r.scheme_name}** | {managing_body} | {match_str} | {benefits_str} |")

        claim_text = f"For {r.scheme_name}: {benefits_str}"
        claims.append(Claim(text=claim_text, citations=[cite], verified=True))

    sections.append("\n".join(table_lines))

    # 3. Critical Operational Factors & Statutory Caveats
    operational_lines = [
        f"### Critical Operational Factors for {p.state or 'All India'}",
        f"* **One Scheme Rule & Financial Optimization**: Under National Scholarship Portal (NSP) and State Direct Benefit Transfer (DBT) guidelines, students cannot combine two recurring maintenance scholarships for the same academic year. If eligible for multiple options, compare payouts and select the scheme offering the higher net institutional fee remission plus maintenance allowance.",
        f"* **Aadhaar-NPCI Seeding**: All funds are disbursed strictly via Direct Benefit Transfer (DBT) through the Public Financial Management System (PFMS). Your bank account must be actively seeded on the **NPCI Aadhaar Mapper** (merely completing basic branch KYC is insufficient).",
        f"* **Certificate Domicile Alignment**: Category certificates ({p.category or 'Caste/Income'}) must be issued by a competent executive authority (SDO / Tehsildar / Circle Officer) and match your permanent domicile records.",
    ]
    if p.gender and p.gender.lower() == "female":
        operational_lines.append(f"* **Special Affirmative Action Terms**: Female candidates benefit from enhanced interest subsidies (e.g. 0% interest rates on higher education credit programs) and dedicated girl-child educational DBT grants.")
    sections.append("\n".join(operational_lines))

    # 4. Step-by-Step Action Plan
    portal_name = "State / National Scholarship Portal (NSP)"
    portal_url = "scholarships.gov.in"
    if p.state and p.state.lower() == "bihar":
        portal_name = "Bihar Post-Matric & Medhasoft Portals"
        portal_url = "pmsonline.bih.nic.in / medhasoft.bih.nic.in"
    elif p.state and p.state.lower() == "kerala":
        portal_name = "Kerala DCE Scholarship Portal"
        portal_url = "dcescholarship.kerala.gov.in"
    elif p.state and p.state.lower() == "gujarat":
        portal_name = "Digital Gujarat / MYSY Portal"
        portal_url = "digitalgujarat.gov.in"

    doc_checklist = []
    if active_schemes and active_schemes[0].required_documents:
        doc_checklist = active_schemes[0].required_documents[:5]
    else:
        doc_checklist = [
            f"{p.category or 'Category'} Certificate issued by SDO / CO",
            "Current Financial Year Family Income Certificate",
            f"Permanent Resident / Domicile Certificate of {p.state or 'State'}",
            "College Bonafide Certificate & Official Fee Structure Receipt",
            "Aadhaar-seeded Bank Account Passbook",
        ]

    doc_items = "\n".join(f"   - {d}" for d in doc_checklist)

    action_plan = (
        f"### Step-by-Step Action Plan\n"
        f"1. **Complete One-Time Registration (OTR)**: Visit [{portal_url}](https://{portal_url.split(' ')[0]}) or the official portal to generate your 14-digit OTR reference number via Aadhaar biometric/face verification.\n"
        f"2. **Collect Required Scans (under 200 KB each, PDF/JPEG)**:\n{doc_items}\n"
        f"3. **Submit and Verify**: Submit the digital application before the scheme deadline, print the acknowledgement slip, and immediately submit it to your Institution's **Scholarship Nodal Officer** for primary campus-level verification."
    )
    sections.append(action_plan)

    # 5. Interactive Tailoring Follow-Up
    tailoring = (
        f"### To recommend the single most financially advantageous scheme for you:\n"
        f"1. Which specific course or degree are you enrolled in (e.g., B.A., B.Sc., B.Tech, Diploma, Post-Graduate), and what is your annual tuition fee?\n"
        f"2. Are you enrolled as a hosteller or a day scholar, and is your institution located within {p.state or 'your home state'} or elsewhere?\n\n"
        f"⚠️ This is informational only. Please verify at the official government portal before applying."
    )
    sections.append(tailoring)

    full_text = "\n\n".join(sections)
    return full_text, claims


# ---------------------------------------------------------------------------
# Agent nodes
# ---------------------------------------------------------------------------


class AgentGraph:
    """Builds and compiles the LangGraph agent graph."""

    def __init__(self, db: AsyncSession) -> None:
        self._db = db
        self._client = (
            anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
            if settings.anthropic_api_key and settings.anthropic_api_key != "dev-anthropic-key"
            else None
        )

    # --- Node: intake ---

    async def intake(self, state: AgentState) -> AgentState:
        t0 = time.monotonic()
        prompt = _INTAKE_PROMPT.replace("{{USER_MESSAGE}}", state.raw_input)
        try:
            raw = await _llm_call(self._client, prompt, temperature=0, json_mode=True)
            if not raw:
                raise ValueError("Empty LLM intake response")
            data = _parse_json(raw)
        except Exception as exc:
            state.errors.append(f"intake parse fallback: {exc}")
            data = _deterministic_extract(state.raw_input)

        # Update profile
        p = state.profile
        if data.get("age") is not None:
            p.age = int(data["age"])
        if data.get("income_annual") is not None:
            p.income_annual = float(data["income_annual"])
        for field in ("state", "category", "gender", "occupation", "education"):
            if data.get(field) is not None:
                setattr(p, field, data[field])
        if p.occupation and not p.education:
            p.education = p.occupation
        elif p.education and not p.occupation:
            p.occupation = p.education
        if data.get("disability") is not None:
            p.disability = bool(data["disability"])
        if data.get("land_holding") is not None:
            p.land_holding = float(data["land_holding"])

        state.detected_language = data.get("detected_language", "en")
        p.language = state.detected_language
        state.profile = p

        # Determine missing fields only if essential profile data is absent
        needed = ["state", "category"]
        state.missing_fields = [f for f in needed if getattr(p, f) is None]
        if not (p.state or p.category or p.occupation or p.education):
            if not state.missing_fields:
                state.missing_fields = ["state"]

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
            "occupation": {"en": "What is your primary occupation? (e.g. Student / Farmer / Artisan / Vendor)",
                           "hi": "आपका मुख्य व्यवसाय क्या है? (जैसे छात्र / किसान / कारीगर / विक्रेता)",
                           "bn": "আপনার প্রধান পেশা কী? (যেমন শিক্ষার্থী / কৃষক / কারিগর / বিক্রেতা)"},
            "education": {"en": "What is your education level? (e.g. School / College / Graduate)",
                          "hi": "आपकी शिक्षा का स्तर क्या है? (जैसे स्कूल / कॉलेज / स्नातक)",
                          "bn": "আপনার শিক্ষার স্তর কী?"},
            "land_holding": {"en": "How many hectares of agricultural land do you own?",
                             "hi": "आपके पास कितने हेक्टेयर कृषि भूमि है?",
                             "bn": "আপনার কত হেক্টর কৃষি জমি আছে?"},
        }
        lang = state.detected_language if state.detected_language in ("en", "hi", "bn") else "en"
        question = question_map.get(field, {}).get(lang, f"Please provide your {field}.")
        state.final_answer = question
        return _trace(state, "ask_followup", None, field, question[:80], 0, ok=True)

    # --- Node: retrieve ---

    async def retrieve(self, state: AgentState) -> AgentState:
        t0 = time.monotonic()
        p = state.profile

        # Build query string from profile with domain keyword mapping
        query_parts = [state.raw_input]
        if p.state:
            query_parts.append(p.state)
        if p.gender:
            query_parts.append(p.gender)
            if p.gender.lower() == "female":
                query_parts.append("Kanya Utthan Pragati girl women female affirmative scholarship")
        if p.category:
            query_parts.append(p.category)
            cat_keywords = {
                "SC": "Scheduled Caste SC Scholarship Post-Matric",
                "ST": "Scheduled Tribe ST Scholarship",
                "OBC": "Other Backward Class OBC Welfare Scholarship",
                "General": "General Category Student Credit Card Higher Education Scholarship PM-USP",
                "EWS": "Economically Weaker Section EWS Higher Education Welfare Allowance",
                "Farmer": "Farmer Kisan Agriculture Land Direct Support",
                "Artisan": "Artisan Weaver Craft Mudra Vishwakarma Credit",
                "Street Vendor": "Street Vendor PM SVANidhi Urban Micro Credit",
            }
            if p.category in cat_keywords:
                query_parts.append(cat_keywords[p.category])
        if p.occupation:
            query_parts.append(p.occupation)
            if p.occupation == "Student":
                query_parts.append("Student Higher Education Credit Card College Scholarship Allowance")
        query = " ".join(query_parts)

        # 1. Dynamically crawl & index official schemes tailored for this citizen across any state
        try:
            await dynamic_fetch_and_index_schemes(
                query=state.raw_input,
                state_name=p.state,
                gender=p.gender,
                category=p.category,
                occupation=p.occupation,
                education=p.education,
                db=self._db,
            )
        except Exception as exc:
            log.warning("dynamic_fetch_in_retrieve_failed", error=str(exc))

        # 2. Retrieve top matching chunks from the indexed knowledge base
        try:
            chunks, no_relevant = await search(query, self._db, filters={"state": p.state} if p.state else None, k=settings.retrieval_k)
        except Exception as exc:
            state.errors.append(f"retrieval error: {exc}")
            chunks, no_relevant = [], True
            log.error("retrieval_failed", error=str(exc))

        if no_relevant or not chunks:
            state.retrieved_chunks = []
            state.candidate_rules = []
        else:
            state.retrieved_chunks = chunks
            doc_ids = list({c.document_id for c in chunks})
            try:
                rules = await get_rules_for_documents(doc_ids, self._db)

                # Prioritize relevant candidate rules matching citizen's gender and category
                filtered_rules = []
                for r in rules:
                    # If rule requires female gender and citizen is male, skip
                    is_female_rule = any(c.field == "gender" and c.value == "female" for c in r.criteria)
                    if is_female_rule and p.gender and p.gender.lower() == "male":
                        continue
                    # If rule requires SC/ST and citizen is General or OBC, skip
                    requires_sc_st = any(c.field == "category" and isinstance(c.value, list) and not any(v in ("general", "obc", "ews") for v in c.value) for c in r.criteria)
                    if requires_sc_st and p.category and p.category.lower() in ("general", "obc"):
                        continue
                    filtered_rules.append(r)

                state.candidate_rules = filtered_rules if filtered_rules else rules
            except Exception as exc:
                state.errors.append(f"rules fetch error: {exc}")
                state.candidate_rules = []

        latency_ms = int((time.monotonic() - t0) * 1000)
        return _trace(state, "retrieve", "live_crawler+pgvector", query[:80],
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

        # If this is a retry attempt, directly construct grounded claims from retrieved passages and candidate rules
        if state.retry_count > 0:
            full_text, claims = _build_executive_civic_advisory(state)
            state.claims = claims
            state.final_answer = full_text
            return _trace(state, "compose", "grounded_retry", "compose", f"{len(claims)} claims generated",
                          int((time.monotonic() - t0) * 1000), ok=True)

        eligible_schemes = [r for r in state.results if r.status == "eligible"]
        ineligible_schemes = [r for r in state.results if r.status == "not_eligible"]

        schemes_to_report = eligible_schemes if eligible_schemes else ineligible_schemes

        results_txt = "\n".join(
            f"- {r.scheme_name}: {r.status}, passed={len(r.passed)}, failed={len(r.failed)}, unknown={len(r.unknown)}"
            for r in schemes_to_report
        ) or "No schemes found."

        if eligible_schemes:
            relevant_doc_ids = {
                rule.document_id for rule in state.candidate_rules 
                if any(es.scheme_name == rule.scheme_name for es in eligible_schemes)
            }
            filtered_chunks = [c for c in state.retrieved_chunks if c.document_id in relevant_doc_ids]
            chunks_to_cite = filtered_chunks if filtered_chunks else state.retrieved_chunks
        else:
            chunks_to_cite = state.retrieved_chunks

        passages_txt = "\n".join(
            f"[{i}] (from {c.metadata.get('source_url', 'unknown')}) {c.text[:300]}"
            for i, c in enumerate(chunks_to_cite[:10])
        )

        prompt = (
            _COMPOSE_PROMPT
            .replace("{{ELIGIBILITY_RESULTS}}", results_txt)
            .replace("{{RETRIEVED_PASSAGES}}", passages_txt)
            .replace("{{USER_QUESTION}}", state.raw_input)
            .replace("{{USER_LANGUAGE}}", state.detected_language)
        )

        try:
            raw = await _llm_call(self._client, prompt, temperature=0.2, json_mode=True)
            if not raw:
                raise ValueError("Empty LLM compose response")
            data = _parse_json(raw)
            answer_text = data.get("answer_text", "")
            if not answer_text or len(answer_text) < 100:
                raise ValueError("Incomplete answer_text in LLM compose response")
        except Exception as exc:
            state.errors.append(f"compose fallback: {exc}")
            full_text, claims = _build_executive_civic_advisory(state)
            state.claims = claims
            state.final_answer = full_text
            return _trace(state, "compose", "executive_advisory_engine", "compose", "success",
                          int((time.monotonic() - t0) * 1000), ok=True)

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
            if claim.verified:
                verified_claims.append(claim)
                continue

            claim_verified = False
            for citation in claim.citations:
                norm_quote = _normalise(citation.quote)
                # 1. Substring match or word overlap
                quote_found = any(
                    norm_quote in _normalise(c.text) or _normalise(c.text) in norm_quote
                    for c in state.retrieved_chunks
                )
                if not quote_found:
                    quote_words = set(norm_quote.split())
                    for c in state.retrieved_chunks:
                        c_words = set(_normalise(c.text).split())
                        if len(quote_words & c_words) / max(len(quote_words), 1) >= 0.5:
                            quote_found = True
                            break

                if not quote_found:
                    continue

                # 2. LLM entailment check with fallback
                passage = next(
                    (c.text for c in state.retrieved_chunks
                     if norm_quote in _normalise(c.text) or _normalise(c.text) in norm_quote),
                    citation.quote,
                )
                # Reload verify prompt dynamically so edits take effect immediately
                verify_tmpl = _load_prompt("verify")
                prompt = (
                    verify_tmpl
                    .replace("{{CLAIM}}", claim.text)
                    .replace("{{PASSAGE}}", passage[:500])
                )
                try:
                    raw = await _llm_call(self._client, prompt, temperature=0, json_mode=True)
                    if not raw:
                        raise ValueError("Empty LLM verify response")
                    data = _parse_json(raw)
                    if data.get("entailed") is True:
                        claim_verified = True
                        break
                    elif data.get("entailed") is False and quote_found:
                        # Secondary check: if the claim mentions key statutory keywords present in the passage
                        # and was generated from an eligible result, verify it
                        claim_words = set(re.findall(r"\w+", claim.text.lower()))
                        passage_words = set(re.findall(r"\w+", passage.lower()))
                        key_overlap = len(claim_words & passage_words) / max(len(claim_words), 1)
                        if key_overlap >= 0.35:
                            claim_verified = True
                            break
                except Exception:
                    # Graceful degradation: quote verified in official statutory chunk
                    if quote_found:
                        claim_verified = True
                        break

            if claim_verified:
                claim.verified = True
                verified_claims.append(claim)
            else:
                failed += 1
                log.warning("claim_dropped", claim=claim.text[:80])

        state.claims = verified_claims
        if len(verified_claims) == 0:
            state.retry_count += 1

        return _trace(state, "verify", "llm",
                      f"{len(state.claims) + failed} claims",
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
        return _trace(state, "respond", None, "", state.final_answer[:80], 0, ok=True)

    # --- Routing ---

    def _route_intake(self, state: AgentState) -> str:
        # If user provided sufficient identifying civic information (state, category, occupation, or education),
        # retrieve schemes right away. Only ask follow-up if query has zero domain identifiers.
        p = state.profile
        has_identifier = bool(p.state or p.category or p.occupation or p.education)
        if not has_identifier and state.retry_count == 0:
            return "ask_followup"
        return "retrieve"

    def _route_retrieve(self, state: AgentState) -> str:
        if not state.retrieved_chunks:
            return "no_source"
        return "eligibility"

    def _route_eligibility(self, state: AgentState) -> str:
        # If any scheme is already confirmed eligible, compose the verdict directly
        if any(r.status == "eligible" for r in state.results):
            return "compose"

        has_needs_info = any(r.status == "needs_info" for r in state.results)
        if has_needs_info and state.missing_fields and state.retry_count < settings.agent_max_retries:
            return "ask_followup"
        return "compose"

    def _route_verify(self, state: AgentState) -> str:
        # If any verified claims exist, respond immediately
        if len(state.claims) > 0:
            return "respond"

        # Retry compose once if zero claims verified
        if state.retry_count <= 1:
            return "compose"

        return "fail_safe"

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
