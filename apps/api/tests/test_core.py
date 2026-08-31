from unittest.mock import MagicMock
from uuid import uuid4

import pytest
from fastapi import HTTPException, Response
from pydantic import ValidationError
from starlette.requests import Request

from app.api import deps
from app.core import rate_limit
from app.core.config import Settings
from app.core.rate_limit import InMemoryRateLimiter
from app.core.security import set_auth_cookies
from app.models.content import DragDropQuestion, QuizQuestion
from app.schemas.common import AttemptIn, DragDropBase, FeedbackIn, MCQBase
from app.services.quiz import score_attempt


def test_postgres_urls_select_psycopg_driver() -> None:
    settings = Settings(
        _env_file=None,
        database_url="postgresql://user:password@example.test/db?sslmode=require",
        jwt_secret="x" * 32,
    )
    assert settings.sqlalchemy_database_url.startswith("postgresql+psycopg://")
    assert settings.sqlalchemy_migration_url == settings.sqlalchemy_database_url


def test_production_runtime_rejects_default_secret_and_sqlite() -> None:
    settings = Settings(_env_file=None, environment="production")
    with pytest.raises(ValueError, match="PostgreSQL"):
        settings.validate_for_runtime()


def test_schema_validators_reject_invalid_assessment_payloads() -> None:
    with pytest.raises(ValidationError):
        MCQBase(question="OSI", options=[""], correct_answer=0)
    with pytest.raises(ValidationError):
        DragDropBase(
            title="Layers",
            items=["TCP"],
            categories=["Transport"],
            correct_mappings={"UDP": "Transport"},
        )
    with pytest.raises(ValidationError):
        AttemptIn(score=2, total_questions=1, answers=[])
    with pytest.raises(ValidationError):
        FeedbackIn()


def test_rate_limiter_enforces_window_limit() -> None:
    limiter = InMemoryRateLimiter(limit=2, window_seconds=60)
    assert limiter.allow("client")
    assert limiter.allow("client")
    assert not limiter.allow("client")
    limiter.reset("client")
    assert limiter.allow("client")
    assert limiter.allow("other-client")


def test_settings_accept_upstash_rest_credentials() -> None:
    settings = Settings(
        _env_file=None,
        environment="production",
        database_url="postgresql://user:password@example.test/db",
        jwt_secret="x" * 32,
        admin_password="a" * 16,
        cors_origins="https://osi.example.com",
        auth_cookie_samesite="none",
        auth_cookie_secure=True,
        upstash_redis_rest_url="https://example-upstash.upstash.io",
        upstash_redis_rest_token="secret-token",
        rate_limit_backend="redis",
    )
    settings.validate_for_runtime()
    assert settings.rate_limit_configured
    assert settings.upstash_redis_rest_token is not None
    assert settings.upstash_redis_rest_token.get_secret_value() == "secret-token"


def test_upstash_rate_limiter_uses_atomic_eval(monkeypatch: pytest.MonkeyPatch) -> None:
    calls: list[tuple[str, list[str], list[str]]] = []

    class FakeUpstashClient:
        def __init__(self, **kwargs: object) -> None:
            assert kwargs["url"] == "https://example-upstash.upstash.io"
            assert kwargs["token"] == "secret-token"

        def eval(self, script: str, *, keys: list[str], args: list[str]) -> int:
            calls.append((script, keys, args))
            return 1

        def delete(self, key: str) -> int:
            assert key.startswith("osi:rate-limit:")
            return 1

    monkeypatch.setattr(rate_limit, "UpstashRedis", FakeUpstashClient)
    limiter = rate_limit.UpstashRateLimiter(
        "https://example-upstash.upstash.io", "secret-token", limit=5, window_seconds=60
    )

    assert limiter.allow("client")
    limiter.reset("client")
    assert len(calls) == 1
    script, keys, args = calls[0]
    assert "INCR" in script and "EXPIRE" in script
    assert keys == ["osi:rate-limit:5:60:client"]
    assert args == ["60"]


def test_server_scores_submitted_answers() -> None:
    mcq_id = uuid4()
    drag_id = uuid4()
    mcq = QuizQuestion(id=mcq_id, question="OSI", options=["A", "B"], correct_answer=1)
    drag = DragDropQuestion(
        id=drag_id,
        title="Layers",
        items=["TCP"],
        categories=["Transport"],
        correct_mappings={"TCP": "Transport"},
    )
    db = MagicMock()
    db.scalars.side_effect = [[mcq], [drag]]
    score, total = score_attempt({str(mcq_id): 1, str(drag_id): {"TCP": "Transport"}}, db)
    assert (score, total) == (2, 2)


def test_cookie_and_csrf_contract() -> None:
    response = Response()
    set_auth_cookies(response, "signed-token")
    cookies = "\n".join(response.headers.getlist("set-cookie"))
    assert "HttpOnly" in cookies
    assert "osi_csrf_token=" in cookies

    settings = Settings(_env_file=None, auth_cookie_samesite="lax")
    original = deps.get_settings
    deps.get_settings = lambda: settings  # type: ignore[assignment]
    try:
        valid = Request(
            {
                "type": "http",
                "headers": [(b"cookie", b"osi_csrf_token=test"), (b"x-csrf-token", b"test")],
            }
        )
        deps.require_csrf(valid)
        invalid = Request({"type": "http", "headers": [(b"cookie", b"osi_csrf_token=test")]})
        with pytest.raises(HTTPException, match="CSRF"):
            deps.require_csrf(invalid)
    finally:
        deps.get_settings = original  # type: ignore[assignment]
