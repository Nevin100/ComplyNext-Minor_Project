"""
ComplyNext - Schema for the RAG semantic search endpoint response.
"""

from pydantic import BaseModel

class CircularSearchResult(BaseModel):
    """One retrieved chunk, with enough metadata to trace it back to
    its source circular - this is what powers citation/explainability."""
    source_name: str
    source_url: str
    chunk_index: int
    text: str