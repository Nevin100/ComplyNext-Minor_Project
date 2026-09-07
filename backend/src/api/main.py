"""
ComplyNext FastAPI backend.

This file's only job right now is to expose the NPA rule engine
(src/rules_engine/npa_engine.py) as an HTTP endpoint, so the Next.js
frontend can fetch classification results over the network.
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from src.rules_engine.npa_engine import LoanAccount, AccountType, run_batch
from src.api.auth_routes import router as auth_router
from src.db.database import get_db
from src.db.models import LoanAccount as DBLoanAccount
from src.auth.dependencies import get_current_user

app = FastAPI(title="ComplyNext API")

# Allow the Next.js dev server (different port) to call this API.
# Without this, the browser blocks the request as a CORS violation.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

@app.get("/")
def health_check():
    """Simple endpoint to confirm the server is alive."""
    return {"status": "ComplyNext API running"}


@app.get("/api/classify")
def get_classifications(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Protected endpoint - requires a valid JWT (Authorization: Bearer <token>).
    Fetches ONLY the loan accounts belonging to the logged-in user's company -
    this filter is the entire mechanism behind multi-tenant data isolation.
    """

    db_accounts = (
        db.query(DBLoanAccount)
        .filter(DBLoanAccount.company_id == current_user["company_id"])
        .all()
    )

    accounts_for_engine = [
        LoanAccount(
            account_id=acc.account_id,
            borrower_name=acc.borrower_name,
            account_type=AccountType(acc.account_type),
            days_past_due=acc.days_past_due,
            outstanding_amount=acc.outstanding_amount,
            existing_classification=acc.existing_classification,
        )
        for acc in db_accounts
    ]

    results = run_batch(accounts_for_engine)
    return [r.__dict__ for r in results]