# 🇮🇳 Civic Pulse — Pitch Deck Outline (M10)

> **Theme**: Digital Governance, Public Information & Civic Inclusion  
> **Tagline**: *"Know your rights, find your schemes — cited, verified, in your language."*  
> **Format**: 7 Slides with comprehensive Speaker Notes

---

## Slide 1: Title & The Mission

### Slide Content:
- **Project**: **Civic Pulse**
- **Subtitle**: An Agentic Scheme & Policy Assistant for Indian Citizens and MSMEs
- **Core Value Proposition**: Live Government Data • Deterministic Eligibility • 100% Verifiable Citations • Multilingual Text & Voice
- **Team**: 4-person Engineering Team (Agent & API Lead, Ingestion Lead, Frontend & Voice Lead, Deployment & Reliability Lead)

### 🎙️ Speaker Notes:
> *"Good morning judges. Over ₹3 Lakh Crore of government welfare benefits go unclaimed every single year in India. Not because citizens don’t qualify, but because finding schemes is an overwhelming maze of scattered portals, complex bureaucratic legalese, and changing notifications. We built **Civic Pulse** to solve this: an agentic assistant that speaks the citizen’s language, fetches live government data, verifies eligibility rule-by-rule without hallucinating, and backs every single claim with an official source quote and link."*

---

## Slide 2: The Problem & Real-World Reality

### Slide Content:
- **1,000+ Portals & Circulars**: Schemes are fragmented across central ministries, state portals, and gazette notifications.
- **Silent Rule Changes**: Eligibility criteria and deadlines change without alerts, leaving citizens unaware.
- **The Language & Literacy Barrier**: 90%+ of Indian citizens do not read official English gazettes; they need voice in Hindi, Bengali, or their regional dialect.
- **The Danger of Generic Chatbots**: Standard LLMs hallucinate scheme amounts, invent deadlines, and offer invalid legal advice that misleads vulnerable citizens.

### 🎙️ Speaker Notes:
> *"If a 22-year-old student from rural Bihar asks ChatGPT about scholarships, it will often hallucinate outdated income cutoffs or nonexistent application portals. That isn't just an inconvenience — it can cost a student their education or a small farmer their livelihood. We established three hard rules for Civic Pulse: zero dummy data, zero LLM guessing on eligibility numbers, and zero unverified claims."*

---

## Slide 3: The Civic Pulse Solution

### Slide Content:
1. **Multilingual Voice & Text**: Citizen speaks or types naturally in Hindi, Bengali, or English.
2. **Deterministic Eligibility Engine**: Evaluates criteria rule-by-rule in pure Python (`age <= 25`, `income <= 300,000`) — never asks an LLM to guess math or eligibility.
3. **Targeted Follow-Up Dialogue**: If critical criteria are unknown, the system asks one clear question in the user's language rather than making assumptions.
4. **100% Cited User Claims**: Every claim in the final answer is linked to an official portal passage and URL.
5. **Real-Time Notification Monitoring**: Continuous ingestion detects revised schemes and displays live updates with change diffs.

### 🎙️ Speaker Notes:
> *"Civic Pulse is an intelligent partner. When a citizen says: 'I am a 22-year-old OBC student from Bihar', Civic Pulse identifies the missing facts — family income — and asks ONE direct follow-up question in Hindi. Once answered, our deterministic engine calculates eligibility instantly and generates an answer where every sentence is tied to an official citation."*

---

## Slide 4: Technical Architecture & Core Innovations

### Slide Content:
- **LangGraph State Graph**: Explicit state transitions: `intake` ➔ `retrieve` ➔ `eligibility` ➔ `compose` ➔ `verify` ➔ `respond`.
- **Hybrid Retrieval**: Postgres + pgvector vector similarity fused with Full-Text Keyword Search via Reciprocal Rank Fusion (RRF).
- **Verbatim Passage Verification (M2)**: During rule extraction, the system verifies that every criterion passage is a verbatim substring of the official document; hallucinated criteria are rejected.
- **Entailment & Citation Verifier (M4)**: The LLM verifier checks that generated claims are strictly entailed by the cited passage; ungrounded claims are dropped automatically.
- **Change Detection Pipeline (M1)**: Content-hashing (SHA-256) detects modified circulars, generating diff summaries in the audit log.

### 🎙️ Speaker Notes:
> *"Here is how we control hallucinations technically. Notice our two-tier verification: First, when our crawler extracts eligibility rules from official portals, it verifies the quote is a verbatim substring of the actual document text. Second, when the agent composes an answer, our verifier node checks that every claim is logically entailed by the official passage. If a claim cannot be verified, it is purged. We never soften an unsupported claim; we discard it."*

---

## Slide 5: Live Data & Resiliency (The Failure Matrix)

### Slide Content:
- **Live Official Sources**: myScheme REST API, Press Information Bureau (PIB) RSS feed, Data.gov.in Open API, India Code Acts.
- **Hardened Guardrails**:
  - PII Detection & Redaction: Aadhaar, PAN, and mobile numbers redacted before logging or tracing.
  - Prompt Injection Defense: Treats fetched documents and user inputs strictly as inert data.
- **Resilient Fallbacks**:
  - Source Down ➔ Serves last verified data with visible `Stale: true` badge and timestamp.
  - STT Failure ➔ Graceful prompt to type.
  - Speech Unavailable ➔ Clean fallback to text-only answer.

### 🎙️ Speaker Notes:
> *"In public infrastructure, graceful degradation is essential. If PIB or myScheme experiences downtime, Civic Pulse doesn't crash or display a stack trace. It delivers the last verified snapshot with a clear stale badge, warning the citizen that the live source is temporarily unavailable. We tested all 9 failure modes in our automated test harness, and all 9 pass cleanly."*

---

## Slide 6: Future Roadmap & Portal Pre-fill (S1)

### Slide Content:
- **Phase 1 (Completed at Hackathon)**: Core agent graph, live ingestion from 4 sources, deterministic eligibility engine, Sarvam AI voice integration, and Next.js frontend with live reasoning traces.
- **Phase 2 (Portal Pre-fill Agent — S1)**: Using Playwright to navigate official state portals and pre-fill applications from the citizen's profile, stopping securely before CAPTCHA/OTP.
- **Phase 3 (Nationwide Scale)**: Expansion to all 22 scheduled Indian languages using Bhashini and Sarvam AI, with WhatsApp and IVR telephone voice bridges for rural accessibility.

### 🎙️ Speaker Notes:
> *"Looking forward, our architecture is built to support official portal pre-filling. Using headless automation, Civic Pulse can open the application form on the government portal, pre-populate verified profile details, and pause cleanly before OTP and final submission, handing control back to the citizen. This bridges the last mile from discovery to actual enrollment."*

---

## Slide 7: Conclusion & Demo

### Slide Content:
- **Summary**: Transparent, verified, and accessible digital governance.
- **Tech Stack**: Python, FastAPI, LangGraph, Anthropic Claude, Postgres + pgvector, Next.js, Sarvam AI.
- **Repo & Documentation**: Fully tested (36/36 unit/guardrail tests passing), production-ready Docker deployment.
- **Let's see it live!**

### 🎙️ Speaker Notes:
> *"Civic Pulse empowers citizens with verified knowledge and clear access to their rights. Let's switch to the live demonstration to see a real regional-language voice interaction and live source verification in action. Thank you!"*
