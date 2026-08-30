import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, VerifyMismatchError
from fastapi import Response

from app.core.config import get_settings

password_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password_hash, password)
    except (VerifyMismatchError, VerificationError):
        return False


def create_access_token(subject: str) -> str:
    settings = get_settings()
    expires = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    claims = {"sub": subject, "iss": settings.jwt_issuer, "exp": expires}
    return jwt.encode(claims, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def set_auth_cookies(response: Response, access_token: str) -> None:
    settings = get_settings()
    max_age = settings.access_token_expire_minutes * 60
    response.set_cookie(
        settings.auth_cookie_name,
        access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
        max_age=max_age,
    )
    response.set_cookie(
        settings.csrf_cookie_name,
        secrets.token_urlsafe(32),
        httponly=False,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        path="/",
        max_age=max_age,
    )


def clear_auth_cookies(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(settings.auth_cookie_name, path="/")
    response.delete_cookie(settings.csrf_cookie_name, path="/")


def decode_access_token(token: str) -> dict[str, Any]:
    settings = get_settings()
    return jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=[settings.jwt_algorithm],
        issuer=settings.jwt_issuer,
        options={"require": ["sub", "iss", "exp"]},
    )
