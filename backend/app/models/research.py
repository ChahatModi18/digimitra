"""Research Evaluation Records ORM Model (C2 Entity 2.21)."""

from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    SmallInteger,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.assessment import Assessment
    from app.models.classification_result import ClassificationResult
    from app.models.rbdl_level import RBDLLevelModel
    from app.models.user import User


class ResearchEvaluationRecord(Base):
    """Comparative research evaluation record pairing rule-based and ML classifications."""

    __tablename__ = "research_evaluation_records"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    assessment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    rule_based_classification_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("classification_results.id", ondelete="SET NULL"), nullable=True, index=True
    )
    ml_classification_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("classification_results.id", ondelete="SET NULL"), nullable=True, index=True
    )
    levels_agree: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    consultant_corrected_level: Mapped[Optional[int]] = mapped_column(
        SmallInteger, ForeignKey("rbdl_levels.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    corrected_by_user_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    corrected_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="research_records")
    rule_based_result: Mapped[Optional["ClassificationResult"]] = relationship(
        "ClassificationResult",
        foreign_keys=[rule_based_classification_id],
        back_populates="research_rule_records",
    )
    ml_result: Mapped[Optional["ClassificationResult"]] = relationship(
        "ClassificationResult",
        foreign_keys=[ml_classification_id],
        back_populates="research_ml_records",
    )
    corrected_level_rel: Mapped[Optional["RBDLLevelModel"]] = relationship(
        "RBDLLevelModel", back_populates="research_evaluation_records"
    )
    corrector: Mapped[Optional["User"]] = relationship("User", back_populates="research_corrections")
