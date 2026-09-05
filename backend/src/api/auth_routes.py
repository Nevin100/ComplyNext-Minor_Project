"""
ComplyNext - Signup and Login API routes.

These are grouped under an APIRouter (instead of directly on `app`)
so main.py can cleanly "include" this whole group under a common
prefix like /auth - keeps route organization clean as the API grows.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.db.database import get_db
from src.db.models import Company, User
from src.schemas.auth import CompanySignup, UserLogin, Token
from src.auth.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(payload: CompanySignup, db: Session = Depends(get_db)):
    """
    Creates a new company AND its first admin user in one request.
    This is the entry point for a new tenant onto the platform.
    """
    # Prevent duplicate accounts - one email can only belong to one company.
    existing_user = db.query(User).filter(User.email == payload.admin_email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Step 1: create the tenant (Company row).
    new_company = Company(name=payload.company_name)
    db.add(new_company)
    db.flush()   # flush (not commit) so new_company.id is generated but not yet permanent

    # Step 2: create the first user, linked to that company, password hashed.
    new_user = User(
        email=payload.admin_email,
        hashed_password=hash_password(payload.admin_password),
        company_id=new_company.id,
    )
    db.add(new_user)
    db.commit()

    return {"message": "Company and admin user created successfully", "company_id": new_company.id}


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Verifies email/password and issues a JWT containing company_id -
    every future request from this user will carry that company_id
    with it, which is what enforces data isolation.
    """
    user = db.query(User).filter(User.email == payload.email).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token(user_id=user.id, company_id=user.company_id)
    return Token(access_token=access_token)