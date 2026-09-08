"""
ComplyNext - Reusable FastAPI dependency to extract the current user's
identity from a JWT token.

Using HTTPBearer (not OAuth2PasswordBearer) because our /auth/login
endpoint accepts JSON (email/password), not an OAuth2 form login -
HTTPBearer just expects a raw token in the Authorization header,
which matches how our frontend will actually send it.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from src.auth.security import decode_access_token

security_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
) -> dict:
    """
    Runs automatically before any route that depends on it.
    Extracts the token from "Authorization: Bearer <token>", decodes it,
    and returns {user_id, company_id} - or raises 401 if invalid/expired.
    """
    token = credentials.credentials   # this pulls out just the raw token string

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        company_id = payload.get("company_id")
        if user_id is None or company_id is None:
            raise credentials_exception
        return {"user_id": int(user_id), "company_id": company_id}
    except JWTError:
        raise credentials_exception