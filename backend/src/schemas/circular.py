"""
ComplyNext - Schema for the circulars listing endpoint.
"""

from datetime import datetime
from pydantic import BaseModel


class CircularSummary(BaseModel):
    """
    One row per UNIQUE circular (not per chunk) - shows the source name,
    url, how many chunks it was split into, and when it was scraped.
    This is what powers the 'circulars list with upload date' page.
    """
    source_name: str
    source_url: str
    total_chunks: int
    scraped_at: datetime | None