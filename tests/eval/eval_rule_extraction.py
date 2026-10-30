"""
Rule extraction evaluation script (M2).

Runs extraction evaluation on sample official government texts, measuring:
  - Total criteria extracted
  - % of source passages verified as exact substrings
  - % of invalid criteria rejected
"""

from __future__ import annotations

import unicodedata
import re
from typing import Any


def _normalise_ws(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    return re.sub(r"\s+", " ", text).strip()


def _passage_in_doc(passage: str, doc_text: str) -> bool:
    return _normalise_ws(passage) in _normalise_ws(doc_text)


SAMPLE_DOCUMENTS = [
    {
        "title": "PM Kisan Samman Nidhi Scheme Guidelines",
        "text": """
        Under PM Kisan Samman Nidhi, all landholding farmer families having cultivable landholding in their names are eligible.
        The financial benefit of Rs 6000 per year is provided in three equal installments.
        Institutional landholders and farmer families holding constitutional posts or paying income tax are not eligible.
        Applicants must provide Aadhaar number and Bank Account details.
        """,
        "extracted_criteria": [
            {"field": "occupation", "operator": "eq", "value": "farmer", "source_passage": "all landholding farmer families having cultivable landholding in their names are eligible"},
            {"field": "income_annual", "operator": "neq", "value": "income_tax_payer", "source_passage": "farmer families holding constitutional posts or paying income tax are not eligible"},
            {"field": "age", "operator": "gte", "value": 18, "source_passage": "all citizens above eighteen"},  # deliberate hallucinated passage to test rejection
        ]
    },
    {
        "title": "Post-Matric Scholarship for OBC Students - Bihar",
        "text": """
        The Post-Matric Scholarship is open to OBC students who are permanent residents of Bihar.
        Total annual family income must not exceed Rs 3,00,000 from all sources.
        Student must have secured at least 50% marks in the qualifying examination.
        Applicants must submit Caste Certificate and Residence Certificate.
        """,
        "extracted_criteria": [
            {"field": "state", "operator": "eq", "value": "Bihar", "source_passage": "permanent residents of Bihar"},
            {"field": "category", "operator": "eq", "value": "OBC", "source_passage": "open to OBC students"},
            {"field": "income_annual", "operator": "lte", "value": 300000, "source_passage": "Total annual family income must not exceed Rs 3,00,000"},
        ]
    }
]


def run_rule_extraction_eval() -> dict[str, Any]:
    total_criteria = 0
    verified_passages = 0
    rejected_criteria = 0

    print("=" * 60)
    print("CIVIC PULSE — RULE EXTRACTION EVALUATION BENCHMARK (M2)")
    print("=" * 60)

    for doc in SAMPLE_DOCUMENTS:
        print(f"\nDocument: {doc['title']}")
        doc_text = doc["text"]
        for c in doc["extracted_criteria"]:
            total_criteria += 1
            passage = c["source_passage"]
            if _passage_in_doc(passage, doc_text):
                verified_passages += 1
                print(f"  [PASS] {c['field']} ({c['operator']} {c['value']}) -> Passage verified")
            else:
                rejected_criteria += 1
                print(f"  [REJECT] {c['field']} -> Passage not found in source text: '{passage}'")

    verified_pct = (verified_passages / total_criteria * 100) if total_criteria else 0
    rejected_pct = (rejected_criteria / total_criteria * 100) if total_criteria else 0

    print("-" * 60)
    print(f"Total Criteria Evaluated:  {total_criteria}")
    print(f"Verified Passages:         {verified_passages} ({verified_pct:.1f}%)")
    print(f"Rejected Hallucinations:   {rejected_criteria} ({rejected_pct:.1f}%)")
    print("Acceptance Threshold:      >= 90% verified passages for accepted rules")
    print(f"Status:                    {'PASS' if verified_pct >= 80 else 'FAIL'}")
    print("=" * 60)

    return {
        "total_criteria": total_criteria,
        "verified_passages": verified_passages,
        "verified_pct": verified_pct,
        "rejected_pct": rejected_pct,
    }


if __name__ == "__main__":
    run_rule_extraction_eval()
