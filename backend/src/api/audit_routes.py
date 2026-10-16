"""
ComplyNext - Explainable Audit Trail endpoints.

Design: log_action() helper ko routes apne kaam ke BAAD call karte hain.
Logging decision logic se alag hai - taaki audit likhna kabhi business
logic ko na tode. PDF export reportlab se hai (pure-Python, koi system
dependency nahi).
"""

import io
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from src.db.database import get_db
from src.db.models import AuditLog, Company
from src.schemas.audit_logs import AuditLogOut
from src.auth.dependencies import get_current_user

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

router = APIRouter(prefix="/api/audit", tags=["audit"])


def log_action(
    db: Session,
    company_id: int,
    action_type: str,
    result_summary: str,
    input_ref: str | None = None,
    rule_reference: str | None = None,
    citation_url: str | None = None,
) -> AuditLog:
    """
    Audit trail me ek entry likho. Har route jo koi 'decision' leta hai
    (classify, gap analysis, scrape) isko call karega.
    """
    entry = AuditLog(
        company_id=company_id,
        action_type=action_type,
        input_ref=input_ref,
        result_summary=result_summary,
        rule_reference=rule_reference,
        citation_url=citation_url,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def _query_logs(db: Session, company_id: int, limit: int = 200) -> list[AuditLog]:
    """Company-scoped logs, naye se purane - company_id hamesha token se."""
    return (
        db.query(AuditLog)
        .filter(AuditLog.company_id == company_id)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .all()
    )


@router.get("", response_model=list[AuditLogOut])
def list_audit_logs(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Logged-in company ka audit trail."""
    return _query_logs(db, current_user["company_id"])


def build_audit_pdf(company_name: str, logs: list[AuditLog]) -> bytes:
    """Audit logs se formal PDF compliance report banao."""

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("ComplyNext &mdash; Compliance Audit Report", styles["Title"]))
    story.append(Paragraph(f"Entity: {company_name}", styles["Normal"]))
    story.append(
        Paragraph(
            f"Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
            styles["Normal"],
        )
    )
    story.append(Spacer(1, 18))

    header = ["Timestamp (UTC)", "Action", "Input", "Result", "Reference"]
    rows = [header]
    for log in logs:
        ts = log.created_at.strftime("%Y-%m-%d %H:%M") if log.created_at else "--"
        rows.append(
            [ts, log.action_type, log.input_ref or "--", log.result_summary, log.rule_reference or "--"]
        )

    # Paragraph me lapetne se lambi text table se bahar nahi niklegi
    table_data = [[Paragraph(str(c), styles["Normal"]) for c in row] for row in rows]
    table = Table(table_data, colWidths=[70, 70, 90, 150, 110], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 18))
    story.append(
        Paragraph(
            "This report is system-generated from the ComplyNext audit trail. "
            "Every entry is timestamped and traceable to its source circular or rule.",
            styles["Normal"],
        )
    )

    doc.build(story)
    return buf.getvalue()


@router.get("/export")
def export_audit_report(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Poora audit trail formal PDF report ke roop me download karo."""
    company = db.query(Company).filter(Company.id == current_user["company_id"]).first()
    logs = _query_logs(db, current_user["company_id"])
    pdf_bytes = build_audit_pdf(company.name if company else "Unknown", logs)
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=complynext_audit_report.pdf"},
    )
