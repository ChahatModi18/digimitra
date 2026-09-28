"""Business Requirement Profile ORM Model (Research Instrument V1).

Captures contextual requirements, constraints, goals, pain points, budget tier,
and existing tool inventory without altering core capability assessment (RBDL V1).
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, TYPE_CHECKING
from sqlalchemy import (
    BigInteger,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.assessment import Assessment
    from app.models.business import Business
    from app.models.user import User


class RequirementProfile(Base, TimestampMixin):
    """Contextual business requirement profile attached to an assessment session."""

    __tablename__ = "requirement_profiles"
    __table_args__ = (
        UniqueConstraint("assessment_id", name="uq_requirement_profile_assessment"),
        Index("idx_req_profile_business", "business_id"),
        Index("idx_req_profile_version", "profile_version"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    assessment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    business_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("businesses.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    profile_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    
    # Contextual variables (Controlled research instrument V1)
    business_goal: Mapped[str] = mapped_column(String(50), nullable=False)
    primary_pain_point: Mapped[str] = mapped_column(String(50), nullable=False)
    urgency: Mapped[str] = mapped_column(String(30), nullable=False)
    budget_tier: Mapped[str] = mapped_column(String(30), nullable=False)
    existing_tools: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    preferred_solution_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    created_by: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="requirement_profile")
    business: Mapped["Business"] = relationship("Business")
    creator_user: Mapped[Optional["User"]] = relationship("User")
