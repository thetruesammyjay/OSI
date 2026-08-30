from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import current_admin, require_csrf
from app.db.session import get_db
from app.models.content import DragDropQuestion, QuizAttempt, QuizQuestion
from app.models.user import User
from app.schemas.common import AttemptIn, AttemptOut, DragDropBase, DragDropOut, MCQBase, MCQOut
from app.services.quiz import score_attempt

router = APIRouter(prefix="/quiz", tags=["quiz"])


@router.get("/questions", response_model=list[MCQOut])
def list_questions(db: Session = Depends(get_db)) -> list[QuizQuestion]:
    return list(
        db.scalars(
            select(QuizQuestion)
            .where(QuizQuestion.type == "multiple-choice")
            .order_by(QuizQuestion.order_index)
        )
    )


@router.get("/drag-drop", response_model=list[DragDropOut])
def list_drag_drop(db: Session = Depends(get_db)) -> list[DragDropQuestion]:
    return list(db.scalars(select(DragDropQuestion).order_by(DragDropQuestion.order_index)))


@router.post("/attempt", response_model=AttemptOut)
def submit_attempt(payload: AttemptIn, db: Session = Depends(get_db)) -> QuizAttempt:
    score, total_questions = score_attempt(payload.answers, db)
    attempt = QuizAttempt(
        user_id=None,
        score=score,
        total_questions=total_questions,
        answers=payload.answers,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)
    return attempt


@router.post("/questions", response_model=MCQOut, dependencies=[Depends(require_csrf)])
def create_question(
    payload: MCQBase, db: Session = Depends(get_db), _: User = Depends(current_admin)
) -> QuizQuestion:
    item = QuizQuestion(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/questions/{item_id}", response_model=MCQOut, dependencies=[Depends(require_csrf)])
def update_question(
    item_id: UUID, payload: MCQBase, db: Session = Depends(get_db), _: User = Depends(current_admin)
) -> QuizQuestion:
    item = db.get(QuizQuestion, item_id)
    if not item:
        raise HTTPException(404, "Question not found")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/questions/{item_id}", dependencies=[Depends(require_csrf)])
def delete_question(
    item_id: UUID, db: Session = Depends(get_db), _: User = Depends(current_admin)
) -> dict[str, bool]:
    item = db.get(QuizQuestion, item_id)
    if not item:
        raise HTTPException(404, "Question not found")
    db.delete(item)
    db.commit()
    return {"deleted": True}


@router.post("/drag-drop", response_model=DragDropOut, dependencies=[Depends(require_csrf)])
def create_drag_drop(
    payload: DragDropBase, db: Session = Depends(get_db), _: User = Depends(current_admin)
) -> DragDropQuestion:
    item = DragDropQuestion(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put(
    "/drag-drop/{item_id}", response_model=DragDropOut, dependencies=[Depends(require_csrf)]
)
def update_drag_drop(
    item_id: UUID,
    payload: DragDropBase,
    db: Session = Depends(get_db),
    _: User = Depends(current_admin),
) -> DragDropQuestion:
    item = db.get(DragDropQuestion, item_id)
    if not item:
        raise HTTPException(404, "Question not found")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/drag-drop/{item_id}", dependencies=[Depends(require_csrf)])
def delete_drag_drop(
    item_id: UUID, db: Session = Depends(get_db), _: User = Depends(current_admin)
) -> dict[str, bool]:
    item = db.get(DragDropQuestion, item_id)
    if not item:
        raise HTTPException(404, "Question not found")
    db.delete(item)
    db.commit()
    return {"deleted": True}
