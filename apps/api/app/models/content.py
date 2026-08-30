import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class FAQ(Base):
    __tablename__ = "faqs"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(100))
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    question: Mapped[str] = mapped_column(Text)
    options: Mapped[list[str]] = mapped_column(JSONB)
    correct_answer: Mapped[int] = mapped_column(Integer)
    explanation: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(100))
    type: Mapped[str] = mapped_column(String(40), default="multiple-choice")
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )


class DragDropQuestion(Base):
    __tablename__ = "drag_drop_questions"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)
    items: Mapped[list[str]] = mapped_column(JSONB)
    categories: Mapped[list[str]] = mapped_column(JSONB)
    correct_mappings: Mapped[dict[str, str]] = mapped_column(JSONB)
    explanation: Mapped[str | None] = mapped_column(Text)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    score: Mapped[int] = mapped_column(Integer)
    total_questions: Mapped[int] = mapped_column(Integer)
    answers: Mapped[Any] = mapped_column(JSONB)
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
