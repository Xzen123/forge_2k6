# 🎯 Civic Pulse — Judging Q&A & Architecture Ownership Sheet (M10)

This reference sheet prepares each team member for judge inquiries, covering module ownership, technical deep dives, and defense against tough questions.

---

## 1. Team Roles & Code Ownership

| Member Role | Package / Subsystem Owned | Key Files |
|---|---|---|
| **Member 1: Agent & Architecture Lead** | LangGraph Agent & State Transitions | `packages/agent/graph.py`, `packages/agent/eligibility.py`, `packages/agent/prompts/` |
| **Member 2: Data Ingestion & Storage Lead** | Crawlers, Hashing, Hybrid Search & pgvector | `packages/ingest/pipeline.py`, `packages/ingest/adapters/`, `packages/knowledge/store.py`, `db.py` |
| **Member 3: Frontend & Voice Lead** | Next.js UI, Streaming SSE, Sarvam Voice Adapters | `apps/web/components/ChatInterface.tsx`, `SourcesPanel.tsx`, `packages/lang/voice.py` |
| **Member 4: Reliability, Guardrails & Security Lead** | Input/Output Guardrails, PII Redaction, CI/CD | `packages/agent/guardrails/guardrails.py`, `tests/`, `.github/workflows/ci.yml`, `scripts/` |

---

## 2. Hard Questions & Definitive Answers

### Q1: "Why did you build an agentic system instead of just using a standard RAG chatbot or ChatGPT?"
**Answer**:
> *"Standard RAG and plain chatbots fail catastrophically in government policy for three reasons:*
> 1. **Incomplete Profiles**: A citizen rarely volunteers their age, caste, state, and exact annual income in a single prompt. A plain chatbot either guesses, hallucinates, or gives a generic 10-page text dump. Our LangGraph state graph explicitly identifies missing criteria and asks a targeted follow-up before evaluating eligibility.
> 2. **Math & Rule Hallucination**: LLMs are notoriously unreliable at deterministic relational comparisons (e.g. `is 2,80,000 <= 2,50,000?`). In Civic Pulse, the LLM NEVER evaluates eligibility. Our rule engine executes in pure Python using deterministic logic.
> 3. **Unsupported Assertions**: Plain RAG can produce answers with subtle hallucinations. Our two-tier verification rejects unverified criteria at ingestion time and drops unentailed claims at inference time."*

---

### Q2: "How do you prove you are using live government data and not hardcoded sample data?"
**Answer**:
> *"We strictly adhere to the no-dummy-data rule:*
> 1. **Public Live Panel**: In our UI, the 'Official Sources' sidebar pulls directly from our `GET /sources` endpoint, displaying real-time timestamps (`fetched_at`), active document counts, and live status for myScheme, PIB, Data.gov.in, and India Code.
> 2. **Audit Log & Change Detection**: In `packages/ingest/pipeline.py`, each document is SHA-256 hashed. When an official notice is updated upstream, our pipeline detects the hash mismatch, stores the new revision, and writes a `document_changed` diff directly to the audit log.
> 3. **Verifiable Citations**: Every claim in the UI has a clickable citation that opens the exact official portal URL, showing the fetched passage."*

---

### Q3: "How do you prevent hallucinations in user answers?"
**Answer**:
> *"We use a **Two-Tier Verification Barrier**:
> - **Tier 1 (Ingestion Verification - M2)**: When our rule extractor extracts criteria from a circular, `_passage_in_doc()` verifies that the cited text is a verbatim substring of the raw document text. If an LLM extractor hallucinates a passage, that criterion is instantly rejected.
> - **Tier 2 (Inference Entailment Check - M4)**: In the LangGraph `verify` node, every generated claim is evaluated against the cited passage. If a claim is not logically entailed by the quote, it is deleted from the final response. We drop unsupported claims rather than softening them."*

---

### Q4: "How does the system protect citizen privacy (PII)?"
**Answer**:
> *"Indian citizens often inadvertently paste sensitive personal identifiers into civic chat windows. In `packages/agent/guardrails/guardrails.py`, we implement regex-based detection and redaction for:
> - **Aadhaar Numbers**: `[2-9]\d{3} \d{4} \d{4}` ➔ Redacted to `[AADHAAR_REDACTED]`
> - **PAN Numbers**: `[A-Z]{5}[0-9]{4}[A-Z]` ➔ Redacted to `[PAN_REDACTED]`
> - **Indian Mobile Numbers**: `[6-9]\d{9}` ➔ Redacted to `[PHONE_REDACTED]`
> - **Bank Account Numbers**: `\d{9,18}` ➔ Redacted to `[BANK_REDACTED]`
>
> Redaction occurs BEFORE any data is passed to the LLM, logged to structlog, or written to database traces."*

---

### Q5: "What happens when an official source or external API goes down?"
**Answer**:
> *"We built and tested a 9-point failure matrix:
> - **Source Downtime**: Protected by a per-source Circuit Breaker (`threshold=5`, `cooldown=300s`). The system continues serving the last verified snapshot from Postgres, displaying a clear `⚠️ Stale data` badge with the last successful timestamp.
> - **Speech Service Outage**: If Sarvam STT fails or audio is noisy, the system asks the citizen to type. If TTS fails, it delivers the text response seamlessly without crashing.
> - **Zero Stack Traces**: All unhandled exceptions are caught by our FastAPI global exception handler, returning localized, citizen-friendly explanations in Hindi, Bengali, or English."*

---

### Q6: "How do you scale this system to millions of citizens across India?"
**Answer**:
> *"The system is architected for horizontal scalability:
> 1. **Stateless API Tier**: FastAPI runs asynchronously with connection pooling via SQLAlchemy + asyncpg.
> 2. **Decoupled Ingestion**: Background crawling runs on an independent APScheduler daemon, never blocking user queries.
> 3. **Hybrid Search Optimization**: pgvector utilizes IVFFlat/HNSW indexing, combining vector similarity with Postgres tsvector full-text indices.
> 4. **Caching**: TTS audio is cached on disk by text-hash, so identical queries (e.g. scheme benefit summaries) never re-call external speech APIs.
> 5. **Lightweight Edge Deployment**: The frontend is built on Next.js 16 with Turbopack, deployable to Vercel or edge CDNs across Indian regions."*
