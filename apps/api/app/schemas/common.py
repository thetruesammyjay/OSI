from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class FAQBase(BaseModel):
    question: str = Field(min_length=1, max_length=500)
    answer: str = Field(min_length=1, max_length=10_000)
    category: str | None = Field(default=None, max_length=100)
    order_index: int = Field(default=0, ge=0)


class FAQCreate(FAQBase):
    pass


class FAQOut(FAQBase, ORMModel):
    id: UUID
    created_at: datetime
    updated_at: datetime


class MCQBase(BaseModel):
    question: str = Field(min_length=1, max_length=2_000)
    options: list[str] = Field(min_length=2, max_length=8)
    correct_answer: int = Field(ge=0)
    explanation: str | None = Field(default=None, max_length=10_000)
    category: str | None = Field(default=None, max_length=100)
    type: str = "multiple-choice"
    order_index: int = Field(default=0, ge=0)

    @model_validator(mode="after")
    def validate_answer(self) -> "MCQBase":
        if any(not option.strip() for option in self.options) or self.correct_answer >= len(
            self.options
        ):
            raise ValueError("correct_answer must reference a non-empty option")
        return self


class MCQOut(MCQBase, ORMModel):
    id: UUID
    created_at: datetime
    updated_at: datetime


class DragDropBase(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    description: str | None = Field(default=None, max_length=5_000)
    items: list[str] = Field(min_length=1, max_length=50)
    categories: list[str] = Field(min_length=1, max_length=50)
    correct_mappings: dict[str, str]
    explanation: str | None = Field(default=None, max_length=10_000)
    order_index: int = Field(default=0, ge=0)

    @model_validator(mode="after")
    def validate_mappings(self) -> "DragDropBase":
        if len(set(self.items)) != len(self.items) or len(set(self.categories)) != len(
            self.categories
        ):
            raise ValueError("items and categories must be unique")
        if set(self.correct_mappings) != set(self.items):
            raise ValueError("every item must have exactly one mapping")
        if not set(self.correct_mappings.values()).issubset(set(self.categories)):
            raise ValueError("mappings must reference existing categories")
        return self


class DragDropOut(DragDropBase, ORMModel):
    id: UUID
    created_at: datetime
    updated_at: datetime


class AttemptIn(BaseModel):
    user_id: UUID | None = None
    answers: dict[str, Any] = Field(min_length=1, max_length=50)
    # Kept as optional input fields for old clients; the API ignores them and scores answers.
    score: int | None = Field(default=None, ge=0)
    total_questions: int | None = Field(default=None, gt=0)


class AttemptOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID | None
    score: int
    total_questions: int
    answers: dict[str, Any]
    completed_at: datetime


class FeedbackIn(BaseModel):
    experience: str | None = Field(default=None, max_length=10_000)
    difficulties: str | None = Field(default=None, max_length=10_000)
    suggestions: str | None = Field(default=None, max_length=10_000)
    educational_value: str | None = Field(default=None, max_length=10_000)
    ratings: dict[str, int] | None = None

    @model_validator(mode="after")
    def validate_feedback(self) -> "FeedbackIn":
        if not any(
            (
                self.experience,
                self.difficulties,
                self.suggestions,
                self.educational_value,
                self.ratings,
            )
        ):
            raise ValueError("at least one feedback field is required")
        if self.ratings and any(value < 1 or value > 5 for value in self.ratings.values()):
            raise ValueError("ratings must be between 1 and 5")
        return self


class FeedbackOut(BaseModel):
    accepted: bool = True
