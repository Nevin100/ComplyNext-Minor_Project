"""
ComplyNext - Policy Gap Detection multi-agent graph (LangGraph).

Teen agents, synopsis ke design ke hisaab se:
  1. retriever - deterministic: ChromaDB RBI corpus pe semantic_search
     (koi LLM nahi - sasta, tez, hallucination-free)
  2. comparer   - LLM: har clause ka verdict JSON me
     (COMPLIANT / GAP / OUTDATED)
  3. explainer  - LLM (sirf flagged clauses ke liye): human-readable
     explanation + citation; COMPLIANT walo ke liye deterministic one-liner

Graph isliye, ek bada prompt isliye nahi: har stage independently
testable hai, retrieval deterministic rehta hai, aur clauses pe loop
explicit + auditable hai.
"""

import os
import json
from typing import TypedDict, List, Dict, Any

from langgraph.graph import StateGraph, END
from groq import Groq

from src.embeddings.vector_store import semantic_search

GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

# Demo guard: bahut badi policy pe free tier na jal jaye
MAX_CLAUSES = 25


def _groq() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY not set - backend/.env me add karo")
    return Groq(api_key=api_key)


def split_into_clauses(text: str) -> List[str]:
    """
    Policy text ko blank lines pe todo - har paragraph ek 'clause'.
    Bahut chhote tukde (headings wagera) hata do.
    """
    parts = [p.strip() for p in text.replace("\r\n", "\n").split("\n\n")]
    clauses = [p for p in parts if len(p) >= 40]
    return clauses[:MAX_CLAUSES]


class GapState(TypedDict):
    """Graph ka shared state - har node iska kuch hissa update karta hai."""
    clauses: List[str]
    index: int                        # abhi kaunsa clause process ho raha hai
    retrieved: List[Dict[str, Any]]    # current clause ke RBI chunks
    verdict: Dict[str, Any]           # comparer ka JSON verdict
    findings: List[Dict[str, Any]]     # ab tak ke final results


# ---------------- Agent 1: retriever (no LLM) ----------------
def retriever_node(state: GapState) -> Dict[str, Any]:
    clause = state["clauses"][state["index"]]
    results = semantic_search(clause, top_k=3)
    docs = results["documents"][0]
    metas = results["metadatas"][0]
    retrieved = [
        {
            "text": d,
            "source_name": m["source_name"],
            "source_url": m["source_url"],
            "chunk_index": m["chunk_index"],
        }
        for d, m in zip(docs, metas)
    ]
    return {"retrieved": retrieved}


# ---------------- Agent 2: comparer (LLM -> JSON verdict) ----------------
COMPARE_SYSTEM = """You are a banking compliance analyst. Compare an internal policy clause against RBI regulatory excerpts.
Return ONLY valid JSON, no other text:
{"status": "COMPLIANT" | "GAP" | "OUTDATED", "matched_chunk": <0-based index into the excerpts below, or -1 if none match>, "reason": "<one line>"}
- COMPLIANT: the clause satisfies the regulation.
- GAP: the clause contradicts the regulation or misses a required provision.
- OUTDATED: the clause follows an older or superseded rule."""


def comparer_node(state: GapState) -> Dict[str, Any]:
    clause = state["clauses"][state["index"]]
    excerpts = "\n\n".join(
        f"[{i}] ({r['source_name']} chunk {r['chunk_index']}): {r['text'][:1200]}"
        for i, r in enumerate(state["retrieved"])
    )
    client = _groq()
    resp = client.chat.completions.create(
        model=GROQ_MODEL,
        response_format={"type": "json_object"},
        temperature=0,
        messages=[
            {"role": "system", "content": COMPARE_SYSTEM},
            {"role": "user", "content": f"POLICY CLAUSE:\n{clause}\n\nRBI EXCERPTS:\n{excerpts}"},
        ],
    )
    verdict = json.loads(resp.choices[0].message.content)
    return {"verdict": verdict}


# ---------------- Agent 3: explainer ----------------
EXPLAIN_SYSTEM = """You are writing for a bank compliance officer. Given the policy clause, the RBI excerpt and the verdict, write a 2-3 sentence plain-English explanation: what the policy says, what RBI requires, and what must change. Cite the RBI source by name. Return ONLY valid JSON: {"explanation": "..."}"""


def explainer_node(state: GapState) -> Dict[str, Any]:
    verdict = state["verdict"]
    clause = state["clauses"][state["index"]]
    status = verdict.get("status", "GAP")
    idx = verdict.get("matched_chunk", -1)
    retrieved = state["retrieved"]
    chunk = retrieved[idx] if 0 <= idx < len(retrieved) else (retrieved[0] if retrieved else None)

    if status == "COMPLIANT" or chunk is None:
        # COMPLIANT pe LLM call waste nahi - deterministic one-liner kaafi
        if chunk:
            explanation = f"Clause aligns with {chunk['source_name']} (chunk #{chunk['chunk_index']})."
        else:
            explanation = "No relevant RBI clause retrieved; marked for manual review."
    else:
        client = _groq()
        resp = client.chat.completions.create(
            model=GROQ_MODEL,
            response_format={"type": "json_object"},
            temperature=0.2,
            messages=[
                {"role": "system", "content": EXPLAIN_SYSTEM},
                {
                    "role": "user",
                    "content": (
                        f"VERDICT: {status}\nREASON: {verdict.get('reason', '')}\n\n"
                        f"POLICY CLAUSE:\n{clause}\n\n"
                        f"RBI EXCERPT ({chunk['source_name']}):\n{chunk['text'][:1500]}"
                    ),
                },
            ],
        )
        explanation = json.loads(resp.choices[0].message.content).get(
            "explanation", verdict.get("reason", "")
        )

    finding = {
        "policy_clause": clause,
        "status": status,
        "explanation": explanation,
        "rbi_source_name": chunk["source_name"] if chunk else None,
        "rbi_source_url": chunk["source_url"] if chunk else None,
        "rbi_chunk_index": chunk["chunk_index"] if chunk else None,
    }
    return {"findings": state["findings"] + [finding], "index": state["index"] + 1}


def _route(state: GapState) -> str:
    """Aur clauses bache hain? Haan -> wapas retriever, nahi -> END."""
    return "retriever" if state["index"] < len(state["clauses"]) else END


def build_gap_graph():
    graph = StateGraph(GapState)
    graph.add_node("retriever", retriever_node)
    graph.add_node("comparer", comparer_node)
    graph.add_node("explainer", explainer_node)
    graph.set_entry_point("retriever")
    graph.add_edge("retriever", "comparer")
    graph.add_edge("comparer", "explainer")
    graph.add_conditional_edges("explainer", _route, {"retriever": "retriever", END: END})
    return graph.compile()


def analyze_policy_text(policy_text: str) -> List[Dict[str, Any]]:
    """
    Route layer isko call karega: text in, findings list out.
    Graph khud DB ko nahi chhuta - persistence route ki zimmedari hai.
    """
    clauses = split_into_clauses(policy_text)
    if not clauses:
        return []
    app = build_gap_graph()
    final = app.invoke(
        {"clauses": clauses, "index": 0, "retrieved": [], "verdict": {}, "findings": []}
    )
    return final["findings"]
