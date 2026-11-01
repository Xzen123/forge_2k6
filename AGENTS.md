# Civic Pulse: Scheme & Policy Agent — Master Prompt & Agent Instructions

You are a senior engineer on a 4-person hackathon team building "Civic Pulse", an agentic Scheme & Policy assistant for Indian citizens and small businesses.
Theme: Civic Pulse, Digital Governance & Public Information.

## PRODUCT
A citizen speaks or types their situation in their own language
(example: "I'm a 22-year-old OBC student in Bihar, family income 3 lakh").
The system plans and executes multiple steps: retrieves relevant government
schemes and notifications from LIVE official sources, checks eligibility rule by
rule, asks follow-up questions for missing facts, verifies every claim against a
source passage, then answers in plain regional language (text + voice) with a
citation link for every claim. It refuses to answer when no official source
supports a claim. It also monitors sources and reports changed notifications.

## HARD RULES (violating any of these means disqualification or lost points)
1. **NO DUMMY DATA**. No hardcoded JSON of schemes, no mock datasets, no fake numbers
   in app logic. All answers must come from data fetched at runtime from live
   official sources (PIB, India Code, myScheme, Data.gov.in) and
   stored with source_url, fetched_at, content_hash. Unit tests may use small
   fixtures, but they live only under `/tests` and are never imported by app code.
2. **NO PRE-RECORDED OR FAKED DEMOS**. Everything shown must run live.
3. Core logic, models and agent workflows are written during the hackathon.
   Open-source libraries and SDKs are fine.
4. Every claim in a user-facing answer must carry a citation (url + quoted
   passage + fetched_at). Unsupported claims are dropped, not softened.
5. The app must degrade gracefully: source down, empty retrieval, vague input,
   off-topic input, unsupported language, API quota errors. Never crash, never
   show a stack trace to the user.
6. Code must be modular, typed, documented and explainable by every team member.
   Prefer simple, readable code over clever code.

## TECH STACK
- Backend: Python 3.11+, FastAPI, Pydantic v2, httpx, APScheduler, SQLAlchemy
- Agent: LangGraph (state graph), Anthropic API for the LLM
  (models read from env vars, never hardcoded names in logic)
- Store: Postgres with pgvector (single DB for vectors, rules, audit log)
- Ingestion: httpx, Playwright (JS pages), trafilatura/BeautifulSoup,
  PyMuPDF + Tesseract (PDF/OCR)
- Speech/translation: Sarvam AI for Indian-language STT, TTS, translation
- Frontend: Next.js 16 + Tailwind CSS
- Observability: structured JSON logging, Langfuse
- Deploy: Vercel (frontend), Render / Fly.io (backend + scheduler), managed Postgres
- Languages supported at launch: Hindi, English, Bengali

## REPO LAYOUT
- `/apps/api`: FastAPI service
- `/apps/web`: Next.js frontend
- `/packages/ingest`: crawlers, parsers, change detection
- `/packages/knowledge`: schemas, DB access, embeddings, retrieval
- `/packages/agent`: LangGraph nodes, prompts, guardrails
- `/packages/lang`: STT, TTS, translation adapters
- `/tests`: unit + integration tests (fixtures allowed here only)
- `/docs`: architecture diagram, README assets, demo script
- `/infra`: docker-compose.yml, deployment config, .env.example

## SHARED CONTRACTS
All modules must strictly use the Pydantic models defined in `/packages/knowledge/schemas.py`:
- `SourceDocument`: id, source, source_url, title, doc_type, language, raw_text, fetched_at, content_hash, published_at
- `Chunk`: id, document_id, text, embedding, page_or_section, metadata
- `EligibilityRule`: id, document_id, scheme_name, criteria, required_documents, deadline, benefit_summary, source_passage, source_url, extracted_at, confidence
- `Criterion`: field, operator, value, source_passage
- `UserProfile`: optional fields mirroring Criterion.field names + language. Missing fields are None, never guessed.
- `Citation`: url, quote (<= 25 words), fetched_at
- `Claim`: text, citations, verified
- `EligibilityResult`: scheme_name, status, passed, failed, unknown, required_documents, deadline, citations
- `AgentState`: session_id, raw_input, detected_language, profile, missing_fields, retrieved_chunks, candidate_rules, results, claims, final_answer, trace, errors, retry_count
- `TraceEvent`: step, tool, input_summary, output_summary, latency_ms, ok, timestamp

## SKILLS POLICY
- Installed skills are general best-practice guidance only.
- The HARD RULES and SHARED CONTRACTS above always override any skill.
- Never generate sample data, mock datasets, or hardcoded schemes in app code,
  even if a skill's template does.
- Use the exact Pydantic models from /packages/knowledge/schemas.py.
- Prefer simple, readable code that every team member can explain.
- Activate skills per module as listed in /docs/SKILLS.md.
