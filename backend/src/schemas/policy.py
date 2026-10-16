"""
ComplyNext - Pydantic schemas for policy upload + gap analysis endpoints.
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PolicyDocumentOut(BaseModel):
    """Upload ke baad client ko wapas - DB-generated id ke saath."""
    id: int
    filename: str
    uploaded_at: datetime

    class Config:
        from_attributes = True


class GapFindingOut(BaseModel):
    """Ek clause ka verdict - citation fields ke saath."""
    id: int
    policy_clause: str
    status: str
    explanation: str
    rbi_source_name: Optional[str] = None
    rbi_source_url: Optional[str] = None
    rbi_chunk_index: Optional[int] = None

    class Config:
        from_attributes = True


class AnalyzeResponse(BaseModel):
    """POST /analyze ka response - summary + saari findings ek saath."""
    policy_id: int
    total_clauses: int
    gaps_found: int
    findings: List[GapFindingOut]
