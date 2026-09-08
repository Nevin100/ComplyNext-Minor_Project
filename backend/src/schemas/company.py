"""
ComplyNext - Pydantic schemas for company profile endpoints.
"""

from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class CompanyUpdate(BaseModel):
    """Only the name can be updated - everything else is system-managed."""
    name: Optional[str] = None

class CompanyOut(BaseModel):
    """Company profile shown to the logged-in user, with some derived stats."""
    id: int
    name: str
    created_at: Optional[datetime]
    total_users: int
    total_loan_accounts: int

    class Config:
        from_attributes = True