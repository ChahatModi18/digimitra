"""Consultant Blind Labeling ORM Model (Safeguard I-07).

Enables independent expert / consultant validation labels without exposing
production rule engine results or ML predictions prior to submission.
"""

from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Index,
    SmallInteger,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.assessment import Assessment
    from app.models.user import User
    from app.models.rbdl_level import RBDLLevelModel


class ConsultantBlindLabel(Base):
    """Independent consultant RBDL rating provided blindly for research calibration."""

    __tablename__ = "consultant_blind_labels"
    __table_args__ = (
        Index("idx_blind_labels_assessment", "assessment_id"),
        Index("idx_blind_labels_consultant", "consultant_user_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    assessment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    consultant_user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    labeled_rbdl_level: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("rbdl_levels.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    labeling_protocol_version: Mapped[str] = mapped_column(
        String(20), default="1.0", nullable=False
    )
    rationales: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    labeled_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="consultant_labels")
    consultant_user: Mapped["User"] = relationship("User")
    rbdl_level_rel: Mapped["RBDLLevelModel"] = relationship("RBDLLevelModel")
