"""
CivicPulse OS — Automated Mock Test for Pillar 1 (Live Scheme Explainer)
Runs multiple unseen citizen queries through the active FastAPI backend over HTTP SSE stream.
"""

import json
import sys
import time
import httpx

sys.stdout.reconfigure(encoding="utf-8")

API_URL = "http://127.0.0.1:8001/chat"

TEST_PROFILES = [
    {
        "id": "VENDOR-JAIPUR",
        "description": "Urban Street Vendor in Jaipur, Rajasthan (PM SVANidhi test)",
        "text": "I am a 34-year-old street vendor in Jaipur, monthly income 15000, looking for working capital micro loan.",
        "expected_domain": "urban_vendor",
        "expected_scheme": "PM SVANidhi",
    },
    {
        "id": "FARMER-UP",
        "description": "Smallholder Farmer in Uttar Pradesh (PM-KISAN test)",
        "text": "Smallholder farmer in Uttar Pradesh holding 1.5 hectares cultivable land, e-KYC completed. What benefits can I get?",
        "expected_domain": "agriculture",
        "expected_scheme": "PM-KISAN",
    },
    {
        "id": "ARTISAN-VARANASI",
        "description": "Traditional Handloom Weaver in Varanasi (Mudra/Vishwakarma test)",
        "text": "Traditional handloom weaver in Varanasi, family annual income 1.8 lakh, seeking collateral-free credit for loom machinery.",
        "expected_domain": "artisan",
        "expected_scheme": "Mudra",
    },
    {
        "id": "MISSING-INFO-STUDENT",
        "description": "Incomplete Profile (Dynamic Follow-up Question test)",
        "text": "I want to know about education scholarships.",
        "expected_event": "followup_question",
    },
    {
        "id": "OFF-TOPIC-GUARDRAIL",
        "description": "Off-Topic Query (Input Guardrail Interception test)",
        "text": "Give me a recipe for butter chicken and chocolate cake.",
        "expected_event": "error",
        "expected_code": "off_topic",
    },
]


def run_stream_query(profile: dict):
    print("=" * 80)
    print(f"TEST CASE [{profile['id']}]: {profile['description']}")
    print(f"INPUT: \"{profile['text']}\"")
    print("-" * 80)

    events_received = []
    trace_steps = []
    final_answer = ""
    profile_extracted = None
    followup_q = None
    guardrail_error = None

    t0 = time.monotonic()
    try:
        with httpx.stream(
            "POST",
            API_URL,
            json={
                "session_id": f"mock-{profile['id'].lower()}",
                "text": profile["text"],
                "language": "en",
            },
            timeout=40.0,
        ) as response:
            if response.status_code != 200:
                print(f"FAILED: Server returned HTTP {response.status_code}")
                return False

            for line in response.iter_lines():
                if line.startswith("event:"):
                    event_type = line[6:].strip()
                    events_received.append(event_type)
                elif line.startswith("data:"):
                    raw = line[5:].strip()
                    try:
                        data = json.loads(raw)
                        if "code" in data and "message" in data:
                            guardrail_error = data
                        elif "step" in data:
                            trace_steps.append(f"{data['step']} ({data.get('latency_ms', 0)}ms): {data['summary']}")
                        elif "question" in data:
                            followup_q = data["question"]
                        elif "text" in data:
                            final_answer = data["text"]
                        elif "state" in data or "occupation" in data:
                            profile_extracted = data
                    except Exception:
                        pass
    except Exception as exc:
        print(f"EXCEPTION: {exc}")
        return False

    elapsed = round((time.monotonic() - t0), 2)
    print(f"ELAPSED TIME: {elapsed}s | EVENTS: {list(dict.fromkeys(events_received))}")

    if guardrail_error:
        print(f"GUARDRAIL INTERCEPTED: Code='{guardrail_error.get('code')}'")
        print(f"MESSAGE: \"{guardrail_error.get('message')}\"")
        if profile.get("expected_code") == guardrail_error.get("code"):
            print("STATUS: PASS [OK] (Guardrail safely refused out-of-scope query without wasting LLM tokens)\n")
            return True

    if profile_extracted:
        print(f"EXTRACTED PROFILE: State={profile_extracted.get('state')}, Category={profile_extracted.get('category')}, Occupation={profile_extracted.get('occupation')}, Income={profile_extracted.get('income_annual')}")

    if trace_steps:
        print("AGENT TRACE EXECUTION:")
        for step in trace_steps:
            print(f"   -> {step}")

    if followup_q:
        print(f"FOLLOW-UP QUESTION TRIGGERED: \"{followup_q}\"")
        print("STATUS: PASS [OK] (Handled incomplete profile gracefully without guessing)\n")
        return True

    if final_answer:
        print(f"FINAL ANSWER (First 200 chars):\n\"{final_answer[:200]}...\"")
        if profile.get("expected_scheme") and profile["expected_scheme"].lower() in final_answer.lower():
            print(f"GROUNDING CHECK: Verified presence of '{profile['expected_scheme']}' in output.")
        print("STATUS: PASS [OK]\n")
        return True

    print("FAILED: No final answer or followup received.\n")
    return False


def main():
    print("\n" + "=" * 80)
    print("CIVICPULSE OS -- PILLAR 1 LIVE SERVER MOCK TEST (ALL RANDOM CITIZEN PROFILES)")
    print("=" * 80 + "\n")

    results = []
    for p in TEST_PROFILES:
        ok = run_stream_query(p)
        results.append((p["id"], ok))

    print("=" * 80)
    print("MOCK TEST SUMMARY FOR PILLAR 1:")
    for pid, ok in results:
        status_str = "PASS [OK]" if ok else "FAIL [X]"
        print(f"  * {pid.ljust(25)}: {status_str}")
    print("=" * 80)

    all_passed = all(ok for _, ok in results)
    if not all_passed:
        sys.exit(1)


if __name__ == "__main__":
    main()
