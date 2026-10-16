"""
ComplyNext - Evaluation script (mid-term report objective #4).

Part A: NPA rule engine vs 25 hand-labelled accounts (RBI IRACP thresholds)
        -> accuracy (deterministic hai, 100% expect karte hain).
Part B: PGD multi-agent vs 6 planted-gap policy clauses
        -> 'flag vs no-flag' pe accuracy / precision / recall.

Chalao:  cd backend  ->  python -m src.eval.evaluate
Chahiye: GROQ_API_KEY (.env me) + populated ChromaDB (pehle scrape chala lo).
Output: terminal tables + backend/eval_results.json (final report me chipkane ke liye).
"""

import json
import os
from datetime import datetime, timezone

from src.rules_engine.npa_engine import LoanAccount, AccountType, run_batch

# ------------------------------------------------------------------
# Part A ground truth: (account_id, account_type, dpd, expected_label)
# Boundaries specially covered: 0/30/31/60/61/90/91 dono account types pe.
# Source: RBI Master Circular - IRACP Norms (Oct 1, 2021).
# ------------------------------------------------------------------
RULE_ENGINE_CASES = [
    # term loans
    ("T001", "term_loan", 0, "Standard"),
    ("T002", "term_loan", 1, "SMA-0"),
    ("T003", "term_loan", 15, "SMA-0"),
    ("T004", "term_loan", 30, "SMA-0"),     # boundary
    ("T005", "term_loan", 31, "SMA-1"),     # boundary
    ("T006", "term_loan", 45, "SMA-1"),
    ("T007", "term_loan", 60, "SMA-1"),     # boundary
    ("T008", "term_loan", 61, "SMA-2"),     # boundary
    ("T009", "term_loan", 75, "SMA-2"),
    ("T010", "term_loan", 90, "SMA-2"),     # boundary
    ("T011", "term_loan", 91, "NPA"),       # boundary
    ("T012", "term_loan", 120, "NPA"),
    ("T013", "term_loan", 365, "NPA"),
    # revolving (cash credit / OD) - NOTE: SMA-0 exists nahi karta isme
    ("R001", "revolving", 0, "Standard"),
    ("R002", "revolving", 10, "Standard"),
    ("R003", "revolving", 30, "Standard"),  # boundary
    ("R004", "revolving", 31, "SMA-1"),     # boundary
    ("R005", "revolving", 45, "SMA-1"),
    ("R006", "revolving", 60, "SMA-1"),     # boundary
    ("R007", "revolving", 61, "SMA-2"),     # boundary
    ("R008", "revolving", 75, "SMA-2"),
    ("R009", "revolving", 90, "SMA-2"),     # boundary
    ("R010", "revolving", 91, "NPA"),       # boundary
    ("R011", "revolving", 150, "NPA"),
    ("R012", "revolving", 5, "Standard"),
]

# ------------------------------------------------------------------
# Part B ground truth: planted gaps wali policy clauses.
# expected = "GAP" (dhyan chahiye) ya "COMPLIANT" (sab theek).
# NOTE: evaluation binary hai (flag vs no-flag) - GAP vs OUTDATED ka
# farak fuzzy hai, isliye dono ko 'flagged' me ginte hain.
# ------------------------------------------------------------------
PGD_CASES = [
    {
        "text": "Our bank classifies a term loan account as NPA only after the account remains overdue for 120 days.",
        "expected": "GAP",  # RBI: 90 days pe NPA
    },
    {
        "text": "A term loan that is overdue by 45 days is classified as SMA-1.",
        "expected": "COMPLIANT",  # 31-60 = SMA-1, sahi hai
    },
    {
        "text": "Cash credit accounts are flagged as SMA-1 as soon as the outstanding stays above the sanctioned limit for 10 days.",
        "expected": "GAP",  # revolving: 30 din tak Standard
    },
    {
        "text": "Revolving credit facilities that remain over their sanctioned limit for more than 90 days are classified as NPA.",
        "expected": "COMPLIANT",  # sahi hai
    },
    {
        "text": "Every new customer must complete full KYC verification, including identity and address proof, before the account is opened.",
        "expected": "COMPLIANT",  # KYC master direction ke hisaab se sahi
    },
    {
        "text": "Our bank does not require address proof for opening a savings account.",
        "expected": "GAP",  # KYC me address proof mandatory hai
    },
]

FLAGGED = {"GAP", "OUTDATED"}


def evaluate_rule_engine() -> dict:
    """Part A: deterministic engine ki accuracy."""
    print("=" * 64)
    print("PART A - NPA Rule Engine  (25 hand-labelled accounts)")
    print("=" * 64)

    accounts = [
        LoanAccount(aid, f"Borrower-{aid}", AccountType(atype), dpd, 100000.0)
        for aid, atype, dpd, _ in RULE_ENGINE_CASES
    ]
    expected = [exp for _, _, _, exp in RULE_ENGINE_CASES]
    results = run_batch(accounts)

    correct = 0
    print(f"{'ID':<6}{'Type':<10}{'DPD':<6}{'Expected':<10}{'Got':<10}Result")
    print("-" * 64)
    for (aid, atype, dpd, exp), r in zip(RULE_ENGINE_CASES, results):
        ok = r.computed_classification == exp
        correct += ok
        print(f"{aid:<6}{atype:<10}{dpd:<6}{exp:<10}{r.computed_classification:<10}{'OK' if ok else 'WRONG'}")

    accuracy = correct / len(RULE_ENGINE_CASES)
    print("-" * 64)
    print(f"Accuracy: {correct}/{len(RULE_ENGINE_CASES)} = {accuracy:.1%}")
    return {"total": len(RULE_ENGINE_CASES), "correct": correct, "accuracy": round(accuracy, 4)}


def evaluate_pgd() -> dict:
    """Part B: PGD agent ki precision/recall (binary: flagged vs not)."""
    print()
    print("=" * 64)
    print("PART B - Policy Gap Detection agent  (6 planted-gap clauses)")
    print("=" * 64)

    if not os.getenv("GROQ_API_KEY"):
        print("SKIPPED: GROQ_API_KEY nahi mila (.env me add karo).")
        return {"skipped": True}

    from src.agents.gap_graph import analyze_policy_text

    tp = fp = tn = fn = 0
    print(f"{'Clause':<46}{'Expected':<11}{'Predicted':<11}Result")
    print("-" * 64)
    for i, case in enumerate(PGD_CASES, 1):
        findings = analyze_policy_text(case["text"])
        pred = findings[0]["status"] if findings else "ERROR"
        exp, pred_flag, exp_flag = case["expected"], pred in FLAGGED, case["expected"] in FLAGGED

        if exp_flag and pred_flag:
            tp += 1; mark = "TP"
        elif not exp_flag and not pred_flag:
            tn += 1; mark = "TN"
        elif not exp_flag and pred_flag:
            fp += 1; mark = "FP"
        else:
            fn += 1; mark = "FN"

        print(f"{i}. {case['text'][:42]:<43}{exp:<11}{pred:<11}{mark}")

    total = tp + tn + fp + fn
    accuracy = (tp + tn) / total if total else 0
    precision = tp / (tp + fp) if (tp + fp) else 0
    recall = tp / (tp + fn) if (tp + fn) else 0
    print("-" * 64)
    print(f"TP={tp}  TN={tn}  FP={fp}  FN={fn}")
    print(f"Accuracy:  {accuracy:.1%}")
    print(f"Precision: {precision:.1%}  (flagged me se kitne sahi the)")
    print(f"Recall:    {recall:.1%}  (asal gaps me se kitne pakde)")
    return {
        "total": total, "tp": tp, "tn": tn, "fp": fp, "fn": fn,
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
    }


if __name__ == "__main__":
    out = {
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
        "rule_engine": evaluate_rule_engine(),
        "pgd": evaluate_pgd(),
    }
    path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "eval_results.json")
    with open(path, "w") as f:
        json.dump(out, f, indent=2)
    print()
    print(f"Results saved -> {path}  (final report me table banane ke kaam ayega)")
