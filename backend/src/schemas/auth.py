"""
ComplyNext - Pydantic schemas for authentication endpoints.

These define the SHAPE of API requests/responses - separate from the
SQLAlchemy models (which define the DB table shape). This separation
matters because we NEVER want to accidentally return hashed_password
in an API response - schemas control exactly what goes out.
"""

from pydantic import BaseModel, EmailStr


class CompanySignup(BaseModel):
    """
    Used when a new company registers on ComplyNext for the first time.
    This creates BOTH a Company row and its first admin User row.
    """
    company_name: str
    admin_email: EmailStr
    admin_password: str


class UserLogin(BaseModel):
    """Used for the /login endpoint - just email + password."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """
    What the /login endpoint returns on success.
    access_token is the JWT the frontend will store and send with
    future requests (in the Authorization header).
    """
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    """
    Safe representation of a user to send back in responses -
    notice hashed_password is NOT here, only safe fields.
    """
    id: int
    email: str
    company_id: int

    class Config:
        from_attributes = True   # allows creating this from a SQLAlchemy model directly