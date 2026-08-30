from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.rate_limit import feedback_limiter
from app.db.session import get_db
from app.models.feedback import Feedback
from app.schemas.common import FeedbackIn, FeedbackOut

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackOut, status_code=201)
def submit_feedback(
    request: Request, payload: FeedbackIn, db: Session = Depends(get_db)
) -> FeedbackOut:
    forwarded_for = request.headers.get("x-forwarded-for", "")
    client_ip = forwarded_for.split(",", 1)[0].strip() or (
        request.client.host if request.client else "unknown"
    )
    if not feedback_limiter.allow(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many feedback submissions. Please try again later.",
            headers={"Retry-After": "3600"},
        )
    item = Feedback(**payload.model_dump())
    db.add(item)
    db.commit()
    return FeedbackOut()
