"""
ComplyNext - Reusable FastAPI dependency to extract the current user's
identity from a JWT token. Any protected route can just add
`current_user: dict = Depends(get_current_user)` as a parameter, and
FastAPI will automatically run this check before the route's own code runs.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError

from src.auth.security import decode_access_token

# This tells FastAPI's auto-docs (/docs) that clients should send the
# token via "Authorization: Bearer <token>" header, and it points to
# our /login route as the place to obtain that token.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """
    Runs automatically before any route that depends on it.
    Decodes the JWT and returns {user_id, company_id} - or raises a
    401 error if the token is missing, invalid, or expired.
    """
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