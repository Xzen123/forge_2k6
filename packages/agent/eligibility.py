"""
Deterministic eligibility engine (M4 Node 3).

Evaluates Criterion rules against UserProfile using pure Python logic (no LLM).
"""

from __future__ import annotations

from typing import Literal

from packages.knowledge.schemas import (
    Criterion,
    EligibilityResult,
    EligibilityRule,
    UserProfile,
)


def _evaluate_criterion(
    criterion: Criterion, profile: UserProfile
) -> Literal["pass", "fail", "unknown"]:
    """Evaluate a single Criterion against a UserProfile without any LLM."""
    field = criterion.field
    op = criterion.operator
    threshold = criterion.value

    # Get profile value — use .other dict for custom fields
    profile_val = getattr(profile, field, None)
    if profile_val is None and field == "education" and profile.occupation:
        profile_val = profile.occupation
    elif profile_val is None and field == "occupation" and profile.education:
        profile_val = profile.education
    if profile_val is None and field == "other":
        profile_val = profile.other.get(str(threshold))

    if profile_val is None:
        return "unknown"

    try:
        # Normalize numeric strings with currency signs or commas
        if op in ("lt", "lte", "gt", "gte", "between"):
            if isinstance(profile_val, str):
                profile_val = float(profile_val.replace("₹", "").replace(",", "").strip())
            else:
                profile_val = float(profile_val)

        if op == "eq":
            pval = str(profile_val).lower().strip()
            tval = str(threshold).lower().strip()
            return "pass" if (pval == tval or tval in pval or pval in tval) else "fail"
        elif op == "neq":
            pval = str(profile_val).lower().strip()
            tval = str(threshold).lower().strip()
            return "pass" if pval != tval and tval not in pval else "fail"
        elif op == "lt":
            return "pass" if float(profile_val) < float(threshold) else "fail"
        elif op == "lte":
            return "pass" if float(profile_val) <= float(threshold) else "fail"
        elif op == "gt":
            return "pass" if float(profile_val) > float(threshold) else "fail"
        elif op == "gte":
            return "pass" if float(profile_val) >= float(threshold) else "fail"
        elif op == "in":
            vals = [str(v).lower().strip() for v in threshold] if isinstance(threshold, list) else [str(threshold).lower().strip()]
            pval = str(profile_val).lower().strip()
            return "pass" if (pval in vals or any(v in pval or pval in v for v in vals)) else "fail"
        elif op == "not_in":
            vals = [str(v).lower().strip() for v in threshold] if isinstance(threshold, list) else [str(threshold).lower().strip()]
            pval = str(profile_val).lower().strip()
            return "pass" if (pval not in vals and not any(v in pval for v in vals)) else "fail"
        elif op == "between":
            lo, hi = float(threshold[0]), float(threshold[1])
            return "pass" if lo <= float(profile_val) <= hi else "fail"
    except (TypeError, ValueError, IndexError):
        return "unknown"
    return "unknown"


def check_eligibility(rule: EligibilityRule, profile: UserProfile) -> EligibilityResult:
    """Check a candidate EligibilityRule against a UserProfile."""
    passed: list[Criterion] = []
    failed: list[Criterion] = []
    unknown: list[Criterion] = []

    for c in rule.criteria:
        verdict = _evaluate_criterion(c, profile)
        if verdict == "pass":
            passed.append(c)
        elif verdict == "fail":
            failed.append(c)
        else:
            unknown.append(c)

    if failed:
        status = "not_eligible"
    elif unknown:
        status = "needs_info"
    else:
        status = "eligible"

    return EligibilityResult(
        scheme_name=rule.scheme_name,
        status=status,
        passed=passed,
        failed=failed,
        unknown=unknown,
        required_documents=rule.required_documents,
        deadline=rule.deadline,
    )
