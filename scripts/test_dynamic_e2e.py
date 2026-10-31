import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from packages.agent.graph import build_graph
from packages.knowledge.schemas import AgentState, UserProfile

sys.stdout.reconfigure(encoding="utf-8")

async def test_query(prompt: str):
    print("=" * 80)
    print(f"QUERY: {prompt}")
    print("=" * 80)
    
    graph = build_graph(db=None)
    state = AgentState(
        session_id="test-session-" + prompt[:10].replace(" ", "_"),
        raw_input=prompt,
        detected_language="en",
        profile=UserProfile(),
    )
    
    final_state = state
    async for event in graph.astream(state, stream_mode="updates"):
        for node_name, raw_node_state in event.items():
            node_state = AgentState(**raw_node_state) if isinstance(raw_node_state, dict) else raw_node_state
            final_state = node_state
            if node_state.trace:
                last = node_state.trace[-1]
                print(f"  [NODE: {node_name}] {last.tool or 'logic'} ({last.latency_ms}ms) -> {last.output_summary}")
    
    print("\nEXTRACTED PROFILE:")
    print(f"  State: {final_state.profile.state}")
    print(f"  Gender: {final_state.profile.gender}")
    print(f"  Age: {final_state.profile.age}")
    print(f"  Category: {final_state.profile.category}")
    print(f"  Income: ₹{final_state.profile.income_annual}")
    print(f"  Occupation: {final_state.profile.occupation}")
    
    print("\nRESULTS COUNT:", len(final_state.results))
    for r in final_state.results:
        print(f"  - {r.scheme_name}: {r.status} (Passed: {len(r.passed)}, Failed: {len(r.failed)})")
    
    print("\nCITATIONS GROUNDED COUNT:", len(final_state.claims))
    for i, c in enumerate(final_state.claims):
        print(f"  [{i}] Claim: {c.text}")
        for cit in c.citations:
            print(f"      Source URL: {cit.url}")
            print(f"      Quoted Passage: {cit.quote[:100]}...")
    
    print("\nFINAL ANSWER:")
    print(final_state.final_answer)
    print("=" * 80 + "\n")

async def main():
    # 1. User's exact prompt (Bihar, 22-year female OBC student, 2 lakh income)
    await test_query("I am a 22-year female student in Bihar, annual family income 2 lakh.. obc")
    
    # 2. Kerala query (dynamically fetched at runtime, never hardcoded)
    await test_query("I am a 21-year-old female student in Kerala with annual family income 1.5 lakh")

if __name__ == "__main__":
    asyncio.run(main())

