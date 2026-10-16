"""
ComplyNext FastAPI backend.

This file's only job right now is to expose the NPA rule engine
(src/rules_engine/npa_engine.py) as an HTTP endpoint, so the Next.js
frontend can fetch classification results over the network.
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from src.rules_engine.npa_engine import LoanAccount, AccountType, run_batch, RULE_REF
from src.api.auth_routes import router as auth_router
from src.db.database import get_db
from src.db.models import LoanAccount as DBLoanAccount
from src.auth.dependencies import get_current_user
from src.embeddings.vector_store import semantic_search

from src.schemas.search import CircularSearchResult
from src.api.loan_routes import router as loan_router
from src.api.company_routes import router as company_router
from src.api.circular_routes import router as circular_router
from src.api.policy_routes import router as policy_router
from src.api.audit_routes import router as audit_router, log_action

from apscheduler.schedulers.background import BackgroundScheduler
from src.db.database import SessionLocal
from src.monitor.change_monitor import check_for_updates

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
app.include_router(loan_router)
app.include_router(company_router)
app.include_router(circular_router)
app.include_router(policy_router)
app.include_router(audit_router)

_scheduler = BackgroundScheduler()


def _scheduled_circular_check():
    """Har 12 ghante me RBI sources me badlaav check karo (background)."""
    db = SessionLocal()
    try:
        check_for_updates(db)
    except Exception as e:
        print(f"[SCHEDULER] circular check failed: {e}")
    finally:
        db.close()


@app.on_event("startup")
def _start_background_jobs():
    _scheduler.add_job(_scheduled_circular_check, "interval", hours=12)
    _scheduler.start()
    print("[SCHEDULER] circular change monitor started (every 12h)")


@app.on_event("shutdown")
def _stop_background_jobs():
    _scheduler.shutdown(wait=False)


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
    mismatched = sum(1 for r in results if r.is_misclassified)
    log_action(
    db,
    company_id=current_user["company_id"],
    action_type="classification",
    input_ref=f"{len(results)} loan accounts",
    result_summary=f"{mismatched} of {len(results)} accounts misclassified in existing records",
    rule_reference=RULE_REF,
)

    return [r.__dict__ for r in results]

@app.get("/api/search-circulars", response_model=list[CircularSearchResult])
def search_circulars(
    query: str,
    current_user: dict = Depends(get_current_user),
):
    """
    RAG retrieval endpoint - takes a natural language question about
    RBI regulations and returns the most semantically relevant circular
    chunks, with source citations. This is the retrieval half of the
    Policy Gap Detection pipeline (the comparison/generation half comes
    in Phase 3 with the LangGraph agent).

    Not filtered by company_id - RBI circulars are shared regulatory
    knowledge, not tenant-specific data, so every logged-in user can
    query the same knowledge base.
    """
    results = semantic_search(query, top_k=3)

    return [
        CircularSearchResult(
            source_name=meta["source_name"],
            source_url=meta["source_url"],
            chunk_index=meta["chunk_index"],
            text=doc,
        )
        for doc, meta in zip(results["documents"][0], results["metadatas"][0])
    ]