from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.content import DragDropQuestion, QuizQuestion


def score_attempt(answers: dict[str, Any], db: Session) -> tuple[int, int]:
    """Calculate a quiz score from persisted answer keys, never from client totals."""
    try:
        question_ids = [UUID(question_id) for question_id in answers]
    except ValueError as exc:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, "answers contain an invalid question id"
        ) from exc

    mcqs = {
        question.id: question
        for question in db.scalars(select(QuizQuestion).where(QuizQuestion.id.in_(question_ids)))
    }
    drag_drop = {
        question.id: question
        for question in db.scalars(
            select(DragDropQuestion).where(DragDropQuestion.id.in_(question_ids))
        )
    }
    if len(mcqs) + len(drag_drop) != len(question_ids):
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, "answers contain an unknown question id"
        )

    correct = 0
    for question_id, answer in zip(question_ids, answers.values(), strict=True):
        if question_id in mcqs:
            question = mcqs[question_id]
            if (
                isinstance(answer, int)
                and not isinstance(answer, bool)
                and answer == question.correct_answer
            ):
                correct += 1
        else:
            drag_question = drag_drop[question_id]
            if isinstance(answer, dict) and answer == drag_question.correct_mappings:
                correct += 1
    return correct, len(question_ids)
