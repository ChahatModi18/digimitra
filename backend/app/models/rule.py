"""Rule and RuleRecommendation Junction ORM Models (C2 Entity 2.10 & 2.12)."""

from typing import Any, Dict, Optional, List, TYPE_CHECKING
from sqlalchemy import (
    BigInteger,
    Boolean,
    ForeignKey,
    Index,
    Integer,
    JSON,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.rbdl_level import RBDLLevelModel
    from app.models.user import User
    from app.models.recommendation import Recommendation
    from app.models.classification_result import ClassificationEvidence


class RuleRecommendation(Base):
    """Junction table mapping rules to recommended actions (M:N)."""

    __tablename__ = "rule_recommendations"

    rule_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("rules.id", ondelete="CASCADE"), primary_key=True
    )
    recommendation_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("recommendations.id", ondelete="CASCADE"), primary_key=True
    )

    # Relationships
    rule: Mapped["Rule"] = relationship("Rule", back_populates="rule_recommendations")
    recommendation: Mapped["Recommendation"] = relationship(
        "Recommendation", back_populates="rule_recommendations"
    )


class Rule(Base, TimestampMixin):
    """Declarative, versioned rule for evaluating business digitalization readiness."""

    __tablename__ = "rules"
    __table_args__ = (
        UniqueConstraint("rule_code", "version", name="uq_rule_code_version"),
        Index("idx_rules_active_priority", "is_active", "priority"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    rule_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    condition_json: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    target_rbdl_level: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("rbdl_levels.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    priority: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)
    rationale: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_by: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )

    # Backward compatibility hybrid property for code
    @hybrid_property
    def code(self) -> str:
        return self.rule_code

    @code.setter
    def code(self, value: str) -> None:
        self.rule_code = value

    @code.expression
    def code(cls):
        return cls.rule_code

    @property
    def condition_expression(self) -> Dict[str, Any]:
        return self.condition_json

    @condition_expression.setter
    def condition_expression(self, value: Dict[str, Any]) -> None:
        self.condition_json = value

    # Relationships
    rbdl_level_rel: Mapped["RBDLLevelModel"] = relationship("RBDLLevelModel", back_populates="rules")
    creator: Mapped[Optional["User"]] = relationship("User", back_populates="rules_created")
    rule_recommendations: Mapped[List["RuleRecommendation"]] = relationship(
        "RuleRecommendation", back_populates="rule", cascade="all, delete-orphan"
    )
    evidence_traces: Mapped[List["ClassificationEvidence"]] = relationship(
        "ClassificationEvidence", back_populates="rule"
    )
