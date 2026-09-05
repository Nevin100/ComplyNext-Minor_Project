"""
ComplyNext FastAPI backend.

This file's only job right now is to expose the NPA rule engine
(src/rules_engine/npa_engine.py) as an HTTP endpoint, so the Next.js
frontend can fetch classification results over the network.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.rules_engine.npa_engine import LoanAccount, AccountType, run_batch

app = FastAPI(title="ComplyNext API")

# Allow the Next.js dev server (different port) to call this API.
# Without this, the browser blocks the request as a CORS violation.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Same sample accounts as the test script - reused here so the API
# has something to return. In Phase 2's later days this will be replaced
# by accounts parsed from an uploaded CSV instead of being hardcoded.
SAMPLE_ACCOUNTS = [
    LoanAccount("LN001", "Ramesh Traders", AccountType.TERM_LOAN, 0, 250000, "Standard"),
    LoanAccount("LN002", "Sunita Enterprises", AccountType.TERM_LOAN, 22, 180000, "Standard"),
    LoanAccount("LN003", "Verma Textiles", AccountType.TERM_LOAN, 45, 500000, "SMA-1"),
    LoanAccount("LN004", "Global Auto Spares", AccountType.TERM_LOAN, 75, 320000, "SMA-1"),
    LoanAccount("LN005", "Krishna Dairy Farm", AccountType.TERM_LOAN, 95, 150000, "SMA-2"),
    LoanAccount("LN006", "Om Sai Constructions", AccountType.TERM_LOAN, 120, 900000, "NPA"),
    LoanAccount("LN007", "Metro Cash & Carry", AccountType.REVOLVING, 65, 700000, "SMA-1"),
]


@app.get("/")
def health_check():
    """Simple endpoint to confirm the server is alive."""
    return {"status": "ComplyNext API running"}


@app.get("/api/classify")
def get_classifications():
    """
    Runs the rule engine on the sample accounts and returns results as JSON.
    r.__dict__ converts each ClassificationResult dataclass into a plain
    dict, because FastAPI needs plain dicts/lists to serialize as JSON.
    """
    results = run_batch(SAMPLE_ACCOUNTS)
    return [r.__dict__ for r in results]