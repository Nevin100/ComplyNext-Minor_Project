"""
ComplyNext - Pydantic schemas for the audit trail endpoints.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AuditLogOut(BaseModel):
    """Audit trail ki ek entry - frontend table aur PDF dono isi pe chalte hain."""
    id: int
    action_type: str
    input_ref: Optional[str] = None
    result_summary: str
    rule_reference: Optional[str] = None
    citation_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
