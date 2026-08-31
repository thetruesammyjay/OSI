from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

API_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    environment: Literal["development", "test", "staging", "production"] = "development"
    database_url: str = "sqlite+pysqlite:///:memory:"
    migration_database_url: str | None = None
    jwt_secret: str = "development-only-change-me-please-32-chars"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = Field(default=1440, gt=0, le=10_080)
    jwt_issuer: str = "osi-api"
    auth_cookie_name: str = "osi_access_token"
    csrf_cookie_name: str = "osi_csrf_token"
    auth_cookie_samesite: Literal["lax", "strict", "none"] | None = None
    auth_cookie_secure: bool | None = None
    admin_username: str = "admin"
    admin_password: str | None = None
    cors_origins: str = "http://localhost:3000"
    log_level: str = "INFO"
    # Legacy TCP Redis URL. Keep it as a compatibility fallback while Upstash
    # REST credentials are the preferred production configuration.
    redis_url: str | None = None
    upstash_redis_rest_url: str | None = None
    upstash_redis_rest_token: SecretStr | None = None
    rate_limit_backend: Literal["auto", "memory", "redis"] = "auto"
    database_pool_size: int = Field(default=5, ge=1, le=20)
    database_max_overflow: int = Field(default=5, ge=0, le=20)
    database_pool_recycle_seconds: int = Field(default=1800, ge=60, le=86400)
    model_config = SettingsConfigDict(env_file=API_ROOT / ".env", extra="ignore")

    @field_validator("jwt_secret")
    @classmethod
    def validate_secret(cls, value: str) -> str:
        if len(value) < 32:
            raise ValueError("JWT_SECRET must be at least 32 characters")
        return value

    def validate_for_runtime(self) -> None:
        if self.environment == "production":
            if self.database_url.startswith("sqlite"):
                raise ValueError("DATABASE_URL must point to PostgreSQL in production")
            if self.jwt_secret.startswith("development-only"):
                raise ValueError("JWT_SECRET must be replaced in production")
            if not self.admin_password or len(self.admin_password) < 12:
                raise ValueError("ADMIN_PASSWORD must be at least 12 characters in production")
            if not self.cors_origin_list or "*" in self.cors_origin_list:
                raise ValueError("CORS_ORIGINS must contain explicit origins in production")
            if self.cookie_samesite != "none":
                raise ValueError("AUTH_COOKIE_SAMESITE must be 'none' for cross-origin production")
            if self.auth_cookie_secure is False:
                raise ValueError("AUTH_COOKIE_SECURE cannot be false in production")
            if self.rate_limit_backend == "redis" and not self.rate_limit_configured:
                raise ValueError(
                    "Configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN "
                    "(or legacy REDIS_URL) when RATE_LIMIT_BACKEND=redis"
                )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def cookie_secure(self) -> bool:
        return (
            self.auth_cookie_secure
            if self.auth_cookie_secure is not None
            else self.environment == "production"
        )

    @property
    def cookie_samesite(self) -> Literal["lax", "strict", "none"]:
        if self.auth_cookie_samesite is not None:
            return self.auth_cookie_samesite
        return "none" if self.environment == "production" else "lax"

    @property
    def rate_limit_configured(self) -> bool:
        return bool(
            self.redis_url
            or (self.upstash_redis_rest_url and self.upstash_redis_rest_token)
        )

    @property
    def sqlalchemy_database_url(self) -> str:
        """Return a SQLAlchemy URL with the psycopg 3 driver selected."""
        if self.database_url.startswith("postgres://"):
            return "postgresql+psycopg://" + self.database_url.removeprefix("postgres://")
        if self.database_url.startswith("postgresql://"):
            return "postgresql+psycopg://" + self.database_url.removeprefix("postgresql://")
        return self.database_url

    @property
    def sqlalchemy_migration_url(self) -> str:
        url = self.migration_database_url or self.database_url
        if url.startswith("postgres://"):
            return "postgresql+psycopg://" + url.removeprefix("postgres://")
        if url.startswith("postgresql://"):
            return "postgresql+psycopg://" + url.removeprefix("postgresql://")
        return url


@lru_cache
def get_settings() -> Settings:
    return Settings()
