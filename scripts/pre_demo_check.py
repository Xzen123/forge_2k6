"""
Civic Pulse — Pre-Demo Checklist Script (M9).

Verifies readiness before live hackathon demonstrations:
  1. Environment & configuration
  2. Data ingestion source adapters
  3. Deterministic eligibility engine
  4. Guardrails & PII redaction
  5. Multilingual translation & glossary integrity
  6. Frontend build readiness

Usage:
    python scripts/pre_demo_check.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

# Ensure project root in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

os.environ.setdefault("ANTHROPIC_API_KEY", "test-anthropic-key")
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/civic_pulse_test")
os.environ.setdefault("SARVAM_API_KEY", "test-sarvam-key")
os.environ.setdefault("API_ADMIN_TOKEN", "demo-admin-token")

from packages.agent.eligibility import check_eligibility
from packages.agent.guardrails.guardrails import (
    InputGuardrailError,
    add_disclaimer,
    check_input,
    get_error_message,
    redact_pii,
)
from packages.ingest.pipeline import _ADAPTERS
from packages.knowledge.schemas import Criterion, EligibilityRule, UserProfile
from packages.lang.voice import _protect_glossary, _restore_glossary, detect_language
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def run_checklist() -> bool:
    print("=" * 65)
    print("CIVIC PULSE -- PRE-DEMO OPERATIONAL READINESS CHECKLIST")
    print("=" * 65)
    checks: list[tuple[str, bool, str]] = []

    # 1. Config & Environment
    try:
        from packages.config import settings
        checks.append(("Configuration & Settings Load", True, f"Env: {settings.environment}"))
    except Exception as e:
        checks.append(("Configuration & Settings Load", False, str(e)))

    # 2. Ingestion Adapters
    try:
        adapters = list(_ADAPTERS.keys())
        expected = ["myscheme", "pib", "data_gov_in", "india_code"]
        all_present = all(k in adapters for k in expected)
        checks.append(("Ingestion Adapters Initialized", all_present, f"Sources: {', '.join(adapters)}"))
    except Exception as e:
        checks.append(("Ingestion Adapters Initialized", False, str(e)))

    # 3. Deterministic Eligibility Engine
    try:
        import uuid
        from datetime import datetime, timezone
        rule = EligibilityRule(
            id=uuid.uuid4(),
            document_id=uuid.uuid4(),
            scheme_name="Pre-Demo Test Scheme",
            criteria=[
                Criterion(field="age", operator="lte", value=30, source_passage="under 30"),
                Criterion(field="state", operator="eq", value="Bihar", source_passage="state of Bihar"),
            ],
            required_documents=["Aadhaar"],
            deadline=None,
            benefit_summary="Demo benefit",
            source_passage="Demo passage",
            source_url="https://demo.gov.in",
            extracted_at=datetime.now(timezone.utc),
            confidence=1.0,
        )
        res = check_eligibility(rule, UserProfile(age=24, state="Bihar"))
        passed = res.status == "eligible" and len(res.passed) == 2
        checks.append(("Deterministic Eligibility Engine", passed, f"Status: {res.status}"))
    except Exception as e:
        checks.append(("Deterministic Eligibility Engine", False, str(e)))

    # 4. Guardrails & PII Redaction
    try:
        clean = check_input("Valid citizen query for scholarships.")
        pii_cleaned = redact_pii("Aadhaar 2345 6789 0123 and phone 9876543210")
        has_redaction = "AADHAAR_REDACTED" in pii_cleaned and "PHONE_REDACTED" in pii_cleaned
        checks.append(("Input Guardrails & PII Redaction", bool(clean and has_redaction), "Redacted Aadhaar & Phone"))
    except Exception as e:
        checks.append(("Input Guardrails & PII Redaction", False, str(e)))

    # 5. Multilingual & Glossary Protection
    try:
        txt = "PM-KISAN scheme requires Aadhaar and PAN."
        prot, reps = _protect_glossary(txt)
        restored = _restore_glossary(prot, reps)
        lang_hi = detect_language("यह योजना किसके लिए है?")
        passed = restored == txt and lang_hi == "hi"
        checks.append(("Multilingual Glossary & Language Detection", passed, f"Protected {len(reps)} terms, detected Hindi"))
    except Exception as e:
        checks.append(("Multilingual Glossary & Language Detection", False, str(e)))

    # 6. Frontend Build Verification
    web_dir = Path(__file__).resolve().parents[1] / "apps" / "web"
    page_file = web_dir / "app" / "page.tsx"
    layout_file = web_dir / "app" / "layout.tsx"
    checks.append(("Frontend Next.js Pages Ready", page_file.exists() and layout_file.exists(), f"Path: {web_dir}"))

    # Print summary table
    all_pass = True
    print("\n{:<45} {:<10} {:<30}".format("CHECK", "STATUS", "DETAILS"))
    print("-" * 85)
    for name, status, details in checks:
        status_str = "PASS [OK]" if status else "FAIL [X]"
        if not status:
            all_pass = False
        print(f"{name:<45} {status_str:<10} {details:<30}")

    print("=" * 85)
    print(f"OVERALL PRE-DEMO STATUS: {'ALL CHECKS PASSED - READY FOR DEMO' if all_pass else 'SOME CHECKS FAILED'}")
    print("=" * 85)
    return all_pass


if __name__ == "__main__":
    success = run_checklist()
    sys.exit(0 if success else 1)
