from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import current_admin, require_csrf
from app.core.rate_limit import login_limiter
from app.core.security import (
    clear_auth_cookies,
    create_access_token,
    set_auth_cookies,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginIn, LoginOut, UserOut, VerifyOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginOut)
def login(
    request: Request, response: Response, payload: LoginIn, db: Session = Depends(get_db)
) -> LoginOut:
    # The limiter is intentionally keyed by the forwarded client address in Render.
    # Replace with a shared store before running more than one worker.
    forwarded_for = request.headers.get("x-forwarded-for", "")
    client_ip = forwarded_for.split(",", 1)[0].strip() or (
        request.client.host if request.client else "unknown"
    )
    if not login_limiter.allow(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later.",
            headers={"Retry-After": "900"},
        )
    user = db.scalar(select(User).where(User.username == payload.username.strip()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    login_limiter.reset(client_ip)
    set_auth_cookies(response, create_access_token(user.username))
    return LoginOut(user=UserOut.model_validate(user))


@router.post(
    "/logout", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_csrf)]
)
def logout(response: Response) -> None:
    clear_auth_cookies(response)


@router.get("/verify", response_model=VerifyOut)
def verify(user: User = Depends(current_admin)) -> VerifyOut:
    return VerifyOut(valid=True, user=UserOut.model_validate(user))
