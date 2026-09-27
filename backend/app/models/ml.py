"""ML Models and ML Predictions ORM Models (C2 Entity 2.19 & 2.20)."""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, Optional, List, TYPE_CHECKING
from sqlalchemy import (
    BigInteger,
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    JSON,
    Numeric,
    SmallInteger,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.rbdl_level import RBDLLevelModel
    from app.models.assessment import Assessment
    from app.models.classification_result import ClassificationResult


class MLModel(Base):
    """Catalog of trained machine learning classification models."""

    __tablename__ = "ml_models"
    __table_args__ = (
        UniqueConstraint("model_name", "version", name="uq_model_name_version"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(30), nullable=False)
    algorithm: Mapped[str] = mapped_column(String(100), nullable=False)
    training_dataset_ref: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    hyperparameters_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    metrics_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    artifact_path: Mapped[str] = mapped_column(String(500), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    trained_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    classification_results: Mapped[List["ClassificationResult"]] = relationship(
        "ClassificationResult", back_populates="ml_model"
    )
    predictions: Mapped[List["MLPrediction"]] = relationship("MLPrediction", back_populates="ml_model")


class MLPrediction(Base):
    """Historical record of an ML model prediction on an assessment."""

    __tablename__ = "ml_predictions"
    __table_args__ = (
        CheckConstraint(
            "confidence_score >= 0 AND confidence_score <= 1",
            name="chk_ml_confidence_range",
        ),
        Index("idx_ml_predictions_assessment", "assessment_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    assessment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    ml_model_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("ml_models.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    classification_result_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("classification_results.id", ondelete="SET NULL"), nullable=True, index=True
    )
    predicted_rbdl_level: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("rbdl_levels.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    confidence_score: Mapped[Decimal] = mapped_column(Numeric(4, 3), nullable=False)
    feature_snapshot_json: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    predicted_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="ml_predictions")
    ml_model: Mapped["MLModel"] = relationship("MLModel", back_populates="predictions")
    classification_result: Mapped[Optional["ClassificationResult"]] = relationship(
        "ClassificationResult", back_populates="ml_predictions"
    )
    rbdl_level_rel: Mapped["RBDLLevelModel"] = relationship("RBDLLevelModel", back_populates="ml_predictions")
