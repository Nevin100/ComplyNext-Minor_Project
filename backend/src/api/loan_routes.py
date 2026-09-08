"""
ComplyNext - CRUD endpoints for loan accounts.

Every endpoint enforces multi-tenant isolation: company_id always comes
from the logged-in user's JWT token, never from the client's request body
or URL - this prevents one company from creating, viewing, editing, or
deleting another company's records.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.database import get_db
from src.db.models import LoanAccount as DBLoanAccount
from src.schemas.loan import LoanAccountCreate, LoanAccountUpdate, LoanAccountOut
from src.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/loan-accounts", tags=["loan-accounts"])


def get_owned_account_or_404(account_db_id: int, company_id: int, db: Session) -> DBLoanAccount:
    """
    Shared helper: fetches a loan account by its DB id, but ONLY if it
    belongs to the current company. Used by get/update/delete so the
    ownership check logic lives in one place instead of being repeated
    three times.
    """
    account = (
        db.query(DBLoanAccount)
        .filter(DBLoanAccount.id == account_db_id, DBLoanAccount.company_id == company_id)
        .first()
    )
    if not account:
        # 404, not 403 - we don't want to reveal that an account with
        # this id exists at all if it belongs to another company.
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan account not found")
    return account


@router.get("", response_model=list[LoanAccountOut])
def list_loan_accounts(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Returns all raw loan account records for the logged-in company (no classification applied here - that's what /api/classify is for)."""
    return (
        db.query(DBLoanAccount)
        .filter(DBLoanAccount.company_id == current_user["company_id"])
        .all()
    )


@router.post("", response_model=LoanAccountOut, status_code=status.HTTP_201_CREATED)
def create_loan_account(
    payload: LoanAccountCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Creates a single loan account - used by the 'single record' upload page."""
    new_account = DBLoanAccount(
        **payload.model_dump(),
        company_id=current_user["company_id"],   # always from token, never from client
    )
    db.add(new_account)
    db.commit()
    db.refresh(new_account)   # populates new_account.id from the DB after insert
    return new_account


@router.post("/bulk", response_model=list[LoanAccountOut], status_code=status.HTTP_201_CREATED)
def create_loan_accounts_bulk(
    payload: list[LoanAccountCreate],
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Creates multiple loan accounts at once - used by the 'bulk/CSV upload' page."""
    new_accounts = [
        DBLoanAccount(**item.model_dump(), company_id=current_user["company_id"])
        for item in payload
    ]
    db.add_all(new_accounts)
    db.commit()
    for acc in new_accounts:
        db.refresh(acc)
    return new_accounts


@router.put("/{account_db_id}", response_model=LoanAccountOut)
def update_loan_account(
    account_db_id: int,
    payload: LoanAccountUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Updates fields on an existing loan account (only the fields the client actually sent)."""
    account = get_owned_account_or_404(account_db_id, current_user["company_id"], db)

    # exclude_unset=True means: only include fields the client actually
    # sent in the request - so partial updates don't overwrite untouched
    # fields with None.
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account, field, value)

    db.commit()
    db.refresh(account)
    return account


@router.delete("/{account_db_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_loan_account(
    account_db_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Deletes a loan account owned by the current company."""
    account = get_owned_account_or_404(account_db_id, current_user["company_id"], db)
    db.delete(account)
    db.commit()
    return None