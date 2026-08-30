import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Feedback(Base):
    __tablename__ = "feedback"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    experience: Mapped[str | None] = mapped_column(Text)
    difficulties: Mapped[str | None] = mapped_column(Text)
    suggestions: Mapped[str | None] = mapped_column(Text)
    educational_value: Mapped[str | None] = mapped_column(Text)
    ratings: Mapped[Any | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(UTC)
    )
