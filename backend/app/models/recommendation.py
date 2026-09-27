"""Recommendation Catalog and Business Recommendation ORM Models (C2 Entity 2.11 & 2.15)."""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, Optional, List, TYPE_CHECKING
from sqlalchemy import (
    BigInteger,
    Boolean,
    Enum,
    ForeignKey,
    Index,
    Integer,
    JSON,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    DateTime,
)
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.rbdl_level import RBDLLevelModel
    from app.models.business import Business
    from app.models.rule import RuleRecommendation
    from app.models.classification_result import ClassificationResult
    from app.models.roadmap import RoadmapTask


class Recommendation(Base, TimestampMixin):
    """Catalog of actionable digitalization recommendations."""

    __tablename__ = "recommendations"
    __table_args__ = (
        Index("idx_recommendations_active_level", "is_active", "target_rbdl_level"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    recommendation_code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    title_en: Mapped[str] = mapped_column(String(255), nullable=False)
    title_hi: Mapped[str] = mapped_column(String(255), nullable=False)
    description_en: Mapped[str] = mapped_column(Text, nullable=False)
    description_hi: Mapped[str] = mapped_column(Text, nullable=False)
    target_rbdl_level: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("rbdl_levels.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    dimension_code: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    estimated_cost_level: Mapped[str] = mapped_column(
        Enum("low", "medium", "high", name="cost_level_enum"),
        default="low",
        nullable=False,
    )
    estimated_effort_level: Mapped[str] = mapped_column(
        Enum("low", "medium", "high", name="effort_level_enum"),
        default="low",
        nullable=False,
    )
    impact_level: Mapped[str] = mapped_column(
        Enum("low", "medium", "high", name="impact_level_enum"),
        default="medium",
        nullable=False,
    )
    prerequisite_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    reason_template_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reason_template_hi: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    default_priority: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Backward compatibility hybrid property for code
    @hybrid_property
    def code(self) -> str:
        return self.recommendation_code

    @code.setter
    def code(self, value: str) -> None:
        self.recommendation_code = value

    @code.expression
    def code(cls):
        return cls.recommendation_code

    # Relationships
    rbdl_level_rel: Mapped["RBDLLevelModel"] = relationship("RBDLLevelModel", back_populates="recommendations")
    rule_recommendations: Mapped[List["RuleRecommendation"]] = relationship(
        "RuleRecommendation", back_populates="recommendation", cascade="all, delete-orphan"
    )
    business_recommendations: Mapped[List["BusinessRecommendation"]] = relationship(
        "BusinessRecommendation", back_populates="recommendation"
    )
    roadmap_tasks: Mapped[List["RoadmapTask"]] = relationship("RoadmapTask", back_populates="recommendation")


class BusinessRecommendation(Base):
    """Instance of a recommendation assigned to a business from a classification run."""

    __tablename__ = "business_recommendations"
    __table_args__ = (
        UniqueConstraint("classification_result_id", "recommendation_id", name="uq_business_rec"),
        Index("idx_business_recommendations_business_status", "business_id", "status"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    business_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("businesses.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    classification_result_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("classification_results.id", ondelete="CASCADE"), nullable=False, index=True
    )
    recommendation_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("recommendations.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    rank_order: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    priority_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(5, 2), nullable=True)
    impact_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(4, 2), nullable=True)
    feasibility_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(4, 2), nullable=True)
    cost_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(4, 2), nullable=True)
    readiness_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(4, 2), nullable=True)
    reason_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reason_hi: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    evidence_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("suggested", "accepted", "dismissed", name="business_rec_status_enum"),
        default="suggested",
        nullable=False,
    )
    generated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    business: Mapped["Business"] = relationship("Business", back_populates="business_recommendations")
    classification_result: Mapped["ClassificationResult"] = relationship(
        "ClassificationResult", back_populates="business_recommendations"
    )
    recommendation: Mapped["Recommendation"] = relationship(
        "Recommendation", back_populates="business_recommendations"
    )
