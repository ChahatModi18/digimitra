"""Classification Result ORM Model."""

from typing import Any, Dict, Optional
from sqlalchemy import JSON, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class ClassificationResult(Base, TimestampMixin):
    """Immutable record of an RBDL classification evaluation on an assessment."""

    __tablename__ = "classification_results"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    assessment_id: Mapped[int] = mapped_column(ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    rbdl_level: Mapped[int] = mapped_column(Integer, nullable=False)  # 0, 1, 2, 3
    method: Mapped[str] = mapped_column(String(50), default="rule_based", nullable=False)  # rule_based, ml, hybrid, manual_override
    evidence_trace: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)  # Full rule firing audit trail
    confidence_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    model_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relationships
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="classification_results")
