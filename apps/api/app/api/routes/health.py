from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db.session import get_db

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "timestamp": datetime.now(UTC).isoformat()}


@router.get("/ready")
def readiness(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ready", "timestamp": datetime.now(UTC).isoformat()}
