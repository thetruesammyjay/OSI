import secrets

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User


def current_admin(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    token = request.cookies.get(get_settings().auth_cookie_name)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    try:
        subject = decode_access_token(token).get("sub")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from exc
    if not isinstance(subject, str) or not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.scalar(select(User).where(User.username == subject))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return user


def require_csrf(request: Request) -> None:
    """Protect cookie-authenticated mutations from cross-site request forgery."""
    settings = get_settings()
    cookie_token = request.cookies.get(settings.csrf_cookie_name)
    header_token = request.headers.get("x-csrf-token")
    if (
        not cookie_token
        or not header_token
        or not secrets.compare_digest(cookie_token, header_token)
    ):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF validation failed")
