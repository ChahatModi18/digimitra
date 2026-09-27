"""Assessment and Answer ORM Models."""

from datetime import datetime, timezone
from typing import Any, Dict, Optional
from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Assessment(Base, TimestampMixin):
    """An immutable, append-only assessment session completed for a business."""

    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default="completed", nullable=False)  # in_progress, completed, archived
    question_bank_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    answers_payload: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)  # JSON representation of all answers
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    business: Mapped["Business"] = relationship("Business", back_populates="assessments")
    classification_results: Mapped[list["ClassificationResult"]] = relationship(
        "ClassificationResult", back_populates="assessment", cascade="all, delete-orphan"
    )
