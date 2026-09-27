"""Classification Result and Explainability Evidence ORM Models (C2 Entity 2.13 & 2.14)."""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, Optional, List, TYPE_CHECKING
from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    JSON,
    Numeric,
    SmallInteger,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.rbdl_level import RBDLLevelModel
    from app.models.assessment import Assessment
    from app.models.rule import Rule
    from app.models.recommendation import BusinessRecommendation
    from app.models.roadmap import Roadmap
    from app.models.ml import MLModel, MLPrediction
    from app.models.research import ResearchEvaluationRecord


class ClassificationResult(Base):
    """Immutable record of an individual classification run (rule-based or ML)."""

    __tablename__ = "classification_results"
    __table_args__ = (
        CheckConstraint(
            "confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)",
            name="chk_confidence_range",
        ),
        Index("idx_classification_results_assessment_primary", "assessment_id", "is_primary"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    assessment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    method: Mapped[str] = mapped_column(
        Enum("rule_based", "ml", name="classification_method_enum"),
        nullable=False,
    )
    rbdl_level: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("rbdl_levels.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    confidence_score: Mapped[Optional[Decimal]] = mapped_column(Numeric(4, 3), nullable=True)
    ruleset_version: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    ml_model_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("ml_models.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    classified_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="classification_results")
    rbdl_level_rel: Mapped["RBDLLevelModel"] = relationship(
        "RBDLLevelModel", back_populates="classification_results"
    )
    ml_model: Mapped[Optional["MLModel"]] = relationship("MLModel", back_populates="classification_results")
    evidence_traces: Mapped[List["ClassificationEvidence"]] = relationship(
        "ClassificationEvidence", back_populates="classification_result", cascade="all, delete-orphan"
    )
    business_recommendations: Mapped[List["BusinessRecommendation"]] = relationship(
        "BusinessRecommendation", back_populates="classification_result", cascade="all, delete-orphan"
    )
    roadmaps: Mapped[List["Roadmap"]] = relationship("Roadmap", back_populates="classification_result")
    ml_predictions: Mapped[List["MLPrediction"]] = relationship(
        "MLPrediction", back_populates="classification_result"
    )
    research_rule_records: Mapped[List["ResearchEvaluationRecord"]] = relationship(
        "ResearchEvaluationRecord",
        foreign_keys="ResearchEvaluationRecord.rule_based_classification_id",
        back_populates="rule_based_result",
    )
    research_ml_records: Mapped[List["ResearchEvaluationRecord"]] = relationship(
        "ResearchEvaluationRecord",
        foreign_keys="ResearchEvaluationRecord.ml_classification_id",
        back_populates="ml_result",
    )


class ClassificationEvidence(Base):
    """Explainability snapshot of a rule that fired during classification."""

    __tablename__ = "classification_evidence"
    __table_args__ = (
        Index("idx_classification_evidence_result", "classification_result_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    classification_result_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("classification_results.id", ondelete="CASCADE"), nullable=False, index=True
    )
    rule_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("rules.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    rule_version_snapshot: Mapped[int] = mapped_column(Integer, nullable=False)
    condition_snapshot_json: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    fired_order: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    matched_answers_snapshot_json: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    classification_result: Mapped["ClassificationResult"] = relationship(
        "ClassificationResult", back_populates="evidence_traces"
    )
    rule: Mapped["Rule"] = relationship("Rule", back_populates="evidence_traces")
