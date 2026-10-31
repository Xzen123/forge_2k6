import asyncio
import json
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from packages.agent.graph import _llm_call

sys.stdout.reconfigure(encoding="utf-8")

prompt = """You are the official National Public Information dynamic scheme crawler for Indian digital governance.
Given the citizen query: 'I am a 21-year-old female student in Kerala with annual family income 1.5 lakh'
Retrieve real official government schemes available for this citizen from official government portals (e.g., dcescholarship.kerala.gov.in, scholarships.gov.in).

Return valid JSON list of schemes matching this exact schema:
[
  {
    "scheme_name": "<official statutory scheme name>",
    "source_url": "<official government .gov.in or .nic.in url>",
    "source_passage": "<statutory notification excerpt with exact criteria, income limit, and benefit>",
    "text": "<official notification text summary>",
    "criteria": [
      {"field": "state", "operator": "eq", "value": "Kerala", "source_passage": "<quote>"},
      {"field": "gender", "operator": "eq", "value": "female", "source_passage": "<quote>"},
      {"field": "income_annual", "operator": "lte", "value": 150000, "source_passage": "<quote>"},
      {"field": "education", "operator": "in", "value": ["student", "college", "undergraduate"], "source_passage": "<quote>"}
    ],
    "required_documents": ["<doc1>", "<doc2>"],
    "benefit_summary": "<exact amount and benefit>",
    "metadata": {"state": "Kerala", "gender": "female", "domain": "education", "source": "pib", "source_url": "<official url>"}
  }
]
"""

async def test():
    raw = await _llm_call(None, prompt, temperature=0, json_mode=True)
    print("STATUS: RAW RECEIVED (len =", len(raw), ")")
    try:
        data = json.loads(raw)
        print("PARSED JSON ARRAY, ITEMS COUNT:", len(data))
        for item in data:
            print("  * Scheme:", item.get("scheme_name"))
            print("    URL:", item.get("source_url"))
            print("    Benefit:", item.get("benefit_summary"))
            print("    Criteria Count:", len(item.get("criteria", [])))
    except Exception as exc:
        print("PARSE ERROR:", exc)
        print(raw[:400])

if __name__ == "__main__":
    asyncio.run(test())
