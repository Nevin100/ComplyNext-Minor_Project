"""
ComplyNext - Password hashing and JWT token utilities.

These functions are the building blocks that the signup/login routes
will call. Keeping them here means the actual route code stays clean
and focused on request/response handling, not crypto details.
"""

import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from jose import jwt
from passlib.context import CryptContext

load_dotenv()  # reads the .env file into environment variables

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24   # tokens valid for 24 hours

# bcrypt is the hashing algorithm - it's slow BY DESIGN, which makes
# brute-forcing stolen password hashes much harder.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Converts a plain password into a one-way bcrypt hash for storage."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Checks a login attempt's password against the stored hash.
    Note: we never reverse the hash - we hash the input again and compare.
    """
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(user_id: int, company_id: int) -> str:
    """
    Builds a JWT that encodes WHO the user is and WHICH company they
    belong to. Every protected endpoint will decode this token to know
    which company's data to filter by - this is the actual mechanism
    behind multi-tenant data isolation.
    """
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),       # "subject" - standard JWT field for the user identity
        "company_id": company_id,
        "exp": expire,             # standard JWT expiry field
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """
    Reverses create_access_token - used by protected routes to extract
    user_id/company_id from an incoming request's token.
    Raises an exception automatically if the token is invalid or expired.
    """
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])