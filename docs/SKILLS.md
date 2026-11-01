# 🛠️ Civic Pulse — Agent Skills Catalog

This document tracks the verified agent skills installed in the workspace from [`@rmyndharis/antigravity-skills`](https://github.com/rmyndharis/antigravity-skills) to support the development, hardening, and verification of the Civic Pulse system.

---

## Skills & Module Alignment Table

| Skill Name | Supported Module(s) | Purpose & Rationale |
|---|---|---|
| **`python-development-python-scaffold`** | **M0** (Repo, Infra, Contracts) | Guidance on modern Python monorepo structure, package boundaries, and strict type checking setups. |
| **`uv-package-manager`** | **M0** (Infra) & **M9** (CI/CD) | Best practices for fast dependency resolution, lockfiles, and deterministic environment management. |
| **`github-actions-templates`** | **M0** & **M9** (CI/CD, Testing) | Standardized CI/CD workflow templates for automated linting (ruff), type checking (mypy), and pytest runs. |
| **`fastapi-pro`** | **M7** (Backend API & Streaming) | High-performance async API patterns, SSE streaming responses, Pydantic v2 validation, and middleware. |
| **`async-python-patterns`** | **M1** (Ingestion), **M4** (Agent), **M7** (API) | Non-blocking asyncio patterns, polite concurrent HTTP fetching, circuit breakers, and task cancellation. |
| **`python-pro`** | **Cross-Module** (M0 – M10) | Modern Python 3.11+ idioms, protocol typing, resource management, and clean code principles. |
| **`rag-implementation`** | **M3** (Knowledge Store & Retrieval) | Chunking strategies, pgvector embeddings, hybrid reciprocal rank fusion (RRF), and grounded retrieval. |
| **`prompt-engineering-patterns`** | **M2** (Rule Extraction), **M4** (Agent Graph) | Structured reasoning, few-shot examples, zero-shot chain-of-thought, and prompt hardening against drift. |
| **`security-auditor`** | **M5** (Guardrails & Failure Matrix) | PII detection and redaction (Aadhaar, PAN, phone), prompt-injection mitigation, and OWASP standards. |
| **`nextjs-app-router-patterns`** | **M8** (Web Frontend) | Next.js App Router architecture, Server Components, client-side streaming consumption, and UI state management. |
| **`typescript-pro`** | **M8** (Web Frontend) | Strict TypeScript interfaces for SSE streaming events, citations, claims, and typed API clients. |
| **`unit-testing-test-generate`** | **M5** & **M9** (Testing & Verification) | Strategies for edge-case coverage, deterministic engine assertions, and failure matrix test generation. |
| **`e2e-testing-patterns`** | **M8** & **M9** (Testing & Deployment) | Playwright UI automation patterns for verifying voice recording, citation drawers, and mobile layouts. |
| **`c4-architecture-c4-architecture`** | **M0** & **M10** (Submission Assets) | Architectural documentation patterns (Context, Container, Component, Code) for system diagrams and judging sheets. |
| **`api-design-principles`** | **M7** (Backend API & Streaming) | RESTful API design standards, error envelope specifications, versioning, and developer ergonomics. |

---

## Skills Governance & Safety Policy

All installed skills are governed by the **SKILLS POLICY** defined in the project master prompt (`AGENTS.md`):

1. **Advisory Guidance Only**: Skills serve strictly as reference patterns and best practices; they never execute autonomous destructive actions.
2. **Hard Rules Precedence**: The Civic Pulse **HARD RULES** and **SHARED CONTRACTS** strictly override any pattern in any skill:
   - **No Dummy / Mock Data**: App code must NEVER use synthetic schemes, mock databases, or fake numbers. All runtime answers come from live official government data.
   - **Shared Pydantic Models**: All modules strictly utilize the shared contracts from `/packages/knowledge/schemas.py`.
   - **No Unauthorized Terminal Commands**: Skills recommending automated terminal commands or infrastructure mutations are reviewed and executed only with human oversight.
