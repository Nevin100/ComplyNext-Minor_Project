"""
ComplyNext - Pydantic schemas for loan account CRUD endpoints.
"""

from pydantic import BaseModel
from typing import Optional


class LoanAccountCreate(BaseModel):
    """
    Shape of data needed to create ONE loan account.
    Notice there's no company_id here - we deliberately don't let the
    client specify it; the server always takes it from the logged-in
    user's token, so no company can create records under another
    company's name.
    """
    account_id: str
    borrower_name: str
    account_type: str          # "term_loan" or "revolving"
    days_past_due: int
    outstanding_amount: float
    existing_classification: Optional[str] = None


class LoanAccountUpdate(BaseModel):
    """
    Same fields, but all optional - lets the client update just the
    fields they want to change (a "partial update" / PATCH-style shape,
    even though we'll expose it under PUT for simplicity here).
    """
    borrower_name: Optional[str] = None
    account_type: Optional[str] = None
    days_past_due: Optional[int] = None
    outstanding_amount: Optional[float] = None
    existing_classification: Optional[str] = None


class LoanAccountOut(BaseModel):
    """What we send back to the client - includes the DB-generated id."""
    id: int
    account_id: str
    borrower_name: str
    account_type: str
    days_past_due: int
    outstanding_amount: float
    existing_classification: Optional[str]

    class Config:
        from_attributes = True   # allows building this directly from a SQLAlchemy row