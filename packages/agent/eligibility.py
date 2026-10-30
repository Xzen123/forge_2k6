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
    if profile_val is None and field == "other":
        profile_val = profile.other.get(str(threshold))

    if profile_val is None:
        return "unknown"

    try:
        if op == "eq":
            return "pass" if str(profile_val).lower() == str(threshold).lower() else "fail"
        elif op == "neq":
            return "pass" if str(profile_val).lower() != str(threshold).lower() else "fail"
        elif op == "lt":
            return "pass" if float(profile_val) < float(threshold) else "fail"
        elif op == "lte":
            return "pass" if float(profile_val) <= float(threshold) else "fail"
        elif op == "gt":
            return "pass" if float(profile_val) > float(threshold) else "fail"
        elif op == "gte":
            return "pass" if float(profile_val) >= float(threshold) else "fail"
        elif op == "in":
            vals = [str(v).lower() for v in threshold] if isinstance(threshold, list) else [str(threshold).lower()]
            return "pass" if str(profile_val).lower() in vals else "fail"
        elif op == "not_in":
            vals = [str(v).lower() for v in threshold] if isinstance(threshold, list) else [str(threshold).lower()]
            return "pass" if str(profile_val).lower() not in vals else "fail"
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
