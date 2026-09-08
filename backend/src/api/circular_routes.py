"""
ComplyNext - Endpoint to list all scraped circulars (grouped, not per-chunk).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func

from src.db.database import get_db
from src.db.models import Circular
from src.schemas.circular import CircularSummary
from src.auth.dependencies import get_current_user
from src.scraper.rbi_scraper import ingest_and_persist_all_sources

router = APIRouter(prefix="/api/circulars", tags=["circulars"])

@router.get("", response_model=list[CircularSummary])
def list_circulars(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Groups the circulars table by source_name, so the response has one
    entry per circular document (not per chunk) - counts how many chunks
    each has and shows the earliest scrape timestamp for that source.
    """
    results = (
        db.query(
            Circular.source_name,
            Circular.source_url,
            sql_func.count(Circular.id).label("total_chunks"),
            sql_func.min(Circular.scraped_at).label("scraped_at"),
        )
        .group_by(Circular.source_name, Circular.source_url)
        .all()
    )

    return [
        CircularSummary(
            source_name=r.source_name,
            source_url=r.source_url,
            total_chunks=r.total_chunks,
            scraped_at=r.scraped_at,
        )
        for r in results
    ]

@router.post("/scrape", status_code=202)
def trigger_scrape(
    current_user: dict = Depends(get_current_user),
):
    """
    Triggers the RBI scraper on-demand from the UI, instead of requiring
    a manual terminal command. Runs synchronously (the request waits for
    scraping to finish) - acceptable for a small, fixed set of sources
    like ours; a production system with many sources would move this to
    a background job queue (e.g. Celery) so the request returns instantly.
    """
    ingest_and_persist_all_sources()
    return {"message": "Scraping completed. Check /api/circulars for updated data."}