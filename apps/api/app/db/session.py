from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()
engine_kwargs = {
    "pool_pre_ping": True,
    "pool_recycle": settings.database_pool_recycle_seconds,
}
if not settings.database_url.startswith("sqlite"):
    engine_kwargs.update(
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
    )
engine = create_engine(settings.sqlalchemy_database_url, **engine_kwargs)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
