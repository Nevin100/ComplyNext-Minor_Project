"""
ComplyNext - Company profile endpoints (GET, PATCH, DELETE).

No POST here - company creation happens via /auth/signup (which creates
the company AND its first admin user together). A separate POST here
would be redundant and confusing (two ways to create a company).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.database import get_db
from src.db.models import Company, User, LoanAccount
from src.schemas.company import CompanyUpdate, CompanyOut
from src.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/company", tags=["company"])

@router.get("/me", response_model=CompanyOut)
def get_my_company(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Returns the logged-in user's own company profile, with counts of
    its users and loan accounts (computed on the fly, not stored)."""
    company = db.query(Company).filter(Company.id == current_user["company_id"]).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    total_users = db.query(User).filter(User.company_id == company.id).count()
    total_loan_accounts = db.query(LoanAccount).filter(LoanAccount.company_id == company.id).count()

    return CompanyOut(
        id=company.id,
        name=company.name,
        created_at=company.created_at,
        total_users=total_users,
        total_loan_accounts=total_loan_accounts,
    )

@router.patch("/me", response_model=CompanyOut)
def update_my_company(
    payload: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Updates the logged-in user's own company - e.g. renaming it."""
    company = db.query(Company).filter(Company.id == current_user["company_id"]).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)

    db.commit()
    db.refresh(company)

    total_users = db.query(User).filter(User.company_id == company.id).count()
    total_loan_accounts = db.query(LoanAccount).filter(LoanAccount.company_id == company.id).count()

    return CompanyOut(
        id=company.id,
        name=company.name,
        created_at=company.created_at,
        total_users=total_users,
        total_loan_accounts=total_loan_accounts,
    )

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_company(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Deletes the logged-in user's company AND all its dependent data
    (users, loan accounts) - a cascade delete done manually here since
    we're not using DB-level cascade rules. Deleting a company but
    leaving orphaned users/loan_accounts behind would corrupt the data.
    """
    company = db.query(Company).filter(Company.id == current_user["company_id"]).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    # Delete dependent records first (children before parent).
    db.query(LoanAccount).filter(LoanAccount.company_id == company.id).delete()
    db.query(User).filter(User.company_id == company.id).delete()
    db.delete(company)
    db.commit()
    return None