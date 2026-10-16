"""
ComplyNext - Endpoint to list all scraped circulars (grouped, not per-chunk).
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func

from src.db.database import get_db
from src.db.models import Circular, SourceSnapshot, ChangeAlert
from src.schemas.circular import CircularSummary, ChangeAlertOut, CheckUpdatesResponse
from src.auth.dependencies import get_current_user
from src.scraper.rbi_scraper import ingest_and_persist_all_sources, SOURCES
from src.monitor.change_monitor import check_for_updates
from src.api.audit_routes import log_action

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
    db: Session = Depends(get_db),
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
    log_action(
        db,
        company_id=current_user["company_id"],
        action_type="scrape",
        input_ref="RBI circular sources",
        result_summary="Circular scrape completed; corpus refreshed",
        rule_reference="rbi.org.in",
    )
    return {"message": "Scraping completed. Check /api/circulars for updated data."}

@router.post("/check-updates", response_model=CheckUpdatesResponse)
def check_updates(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Live monitor turant chalao: RBI sources dobara scrape karke content
    hash compare karo. Change mila toh ChangeAlert banao + audit me log.
    (Scheduler bhi yahi function har 12 ghante me background me chalata hai.)
    """
    new_alerts = check_for_updates(db)

    if new_alerts:
        log_action(
            db,
            company_id=current_user["company_id"],
            action_type="monitor_check",
            input_ref="RBI circular sources",
            result_summary=f"{len(new_alerts)} new circular update(s) detected",
        )

    alerts = (
        db.query(ChangeAlert).order_by(ChangeAlert.detected_at.desc()).limit(50).all()
    )
    return CheckUpdatesResponse(
        checked_sources=len(SOURCES),
        new_alerts=len(new_alerts),
        alerts=alerts,
    )


@router.get("/updates", response_model=list[ChangeAlertOut])
def list_updates(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Saare change alerts, naye se purane. RBI circulars shared regulatory
    knowledge hain (tenant-specific nahi), isliye company filter nahi.
    """
    return (
        db.query(ChangeAlert).order_by(ChangeAlert.detected_at.desc()).limit(50).all()
    )


@router.put("/updates/{alert_id}/seen")
def mark_alert_seen(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Alert ko 'padh liya' mark karo - banner se hat jayega."""
    alert = db.query(ChangeAlert).filter(ChangeAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.seen = True
    db.commit()
    return {"ok": True}
