"""
ComplyNext - Policy document upload + gap analysis endpoints.

Company isolation: company_id hamesha JWT se aata hai - ek company
sirf apni hi policies upload/analyze kar sakti hai.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from src.db.database import get_db
from src.db.models import PolicyDocument, GapFinding
from src.schemas.policy import PolicyDocumentOut, GapFindingOut, AnalyzeResponse
from src.auth.dependencies import get_current_user
from src.agents.gap_graph import analyze_policy_text
from src.api.audit_routes import log_action

router = APIRouter(prefix="/api/policies", tags=["policies"])


def _extract_text(filename: str, raw: bytes) -> str:
    """PDF ya TXT se plain text nikalo."""
    name = (filename or "").lower()
    if name.endswith(".txt"):
        return raw.decode("utf-8", errors="ignore")
    if name.endswith(".pdf"):
        from pypdf import PdfReader
        import io
        reader = PdfReader(io.BytesIO(raw))
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Only .txt and .pdf files are supported",
    )


def _get_owned_policy_or_404(policy_id: int, company_id: int, db: Session) -> PolicyDocument:
    doc = (
        db.query(PolicyDocument)
        .filter(PolicyDocument.id == policy_id, PolicyDocument.company_id == company_id)
        .first()
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")
    return doc


@router.post("/upload", response_model=PolicyDocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_policy(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Policy document upload (.txt/.pdf) - text extract karke DB me store."""
    raw = await file.read()
    if not raw.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file")
    text = _extract_text(file.filename or "policy.txt", raw)
    if len(text.strip()) < 40:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract enough text from the file",
        )
    doc = PolicyDocument(
        company_id=current_user["company_id"],
        filename=file.filename,
        file_text=text,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("", response_model=list[PolicyDocumentOut])
def list_policies(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Logged-in company ki saari uploaded policies."""
    return (
        db.query(PolicyDocument)
        .filter(PolicyDocument.company_id == current_user["company_id"])
        .order_by(PolicyDocument.uploaded_at.desc())
        .all()
    )


@router.post("/{policy_id}/analyze", response_model=AnalyzeResponse)
def analyze_policy(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    LangGraph multi-agent analysis chalao aur findings DB me save karo.
    Dobara chalane pe purani findings replace ho jati hain (idempotent).
    """
    doc = _get_owned_policy_or_404(policy_id, current_user["company_id"], db)

    findings = analyze_policy_text(doc.file_text)

    db.query(GapFinding).filter(GapFinding.policy_id == doc.id).delete()
    rows = [GapFinding(policy_id=doc.id, **f) for f in findings]
    db.add_all(rows)
    db.commit()
    
    gaps = sum(1 for f in findings if f["status"] in ("GAP", "OUTDATED"))
    log_action(
    db,
    company_id=current_user["company_id"],
    action_type="gap_analysis",
    input_ref=doc.filename,
    result_summary=f"{gaps} gap(s) found in {len(findings)} policy clauses",
    rule_reference="RBI Master Circulars (RAG corpus)",
    )

    return AnalyzeResponse(
        policy_id=doc.id,
        total_clauses=len(findings),
        gaps_found=gaps,
        findings=[GapFindingOut.model_validate(r) for r in rows],
    )


@router.get("/{policy_id}/findings", response_model=list[GapFindingOut])
def get_findings(
    policy_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Kisi policy ki saved findings wapas lao (bina dobara analyze kiye)."""
    doc = _get_owned_policy_or_404(policy_id, current_user["company_id"], db)
    return db.query(GapFinding).filter(GapFinding.policy_id == doc.id).all()
