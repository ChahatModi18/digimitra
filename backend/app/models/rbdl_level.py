"""RBDL Levels Reference ORM Model (C2 Entity 2.1)."""

from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.rule import Rule
    from app.models.recommendation import Recommendation
    from app.models.classification_result import ClassificationResult
    from app.models.ml import MLPrediction
    from app.models.research import ResearchEvaluationRecord


class RBDLLevelModel(Base):
    """Reference table for RBDL Maturity Levels (0 to 3)."""

    __tablename__ = "rbdl_levels"

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=False)  # 0, 1, 2, 3
    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    name_en: Mapped[str] = mapped_column(String(100), nullable=False)
    name_hi: Mapped[str] = mapped_column(String(100), nullable=False)
    description_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description_hi: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    rules: Mapped[List["Rule"]] = relationship("Rule", back_populates="rbdl_level_rel")
    recommendations: Mapped[List["Recommendation"]] = relationship("Recommendation", back_populates="rbdl_level_rel")
    classification_results: Mapped[List["ClassificationResult"]] = relationship(
        "ClassificationResult", back_populates="rbdl_level_rel"
    )
    ml_predictions: Mapped[List["MLPrediction"]] = relationship("MLPrediction", back_populates="rbdl_level_rel")
    research_evaluation_records: Mapped[List["ResearchEvaluationRecord"]] = relationship(
        "ResearchEvaluationRecord", back_populates="corrected_level_rel"
    )
