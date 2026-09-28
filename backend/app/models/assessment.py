"""Assessment, Answer, and Dimension Score ORM Models (C2 Entity 2.7, 2.8, 2.9)."""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.question import Question, QuestionOption
    from app.models.classification_result import ClassificationResult
    from app.models.ml import MLPrediction
    from app.models.research import ResearchEvaluationRecord
    from app.models.consultant_label import ConsultantBlindLabel


class Assessment(Base, TimestampMixin):
    """An immutable, append-only assessment session completed for a business."""

    __tablename__ = "assessments"
    __table_args__ = (
        Index("idx_assessments_business_started", "business_id", "started_at"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    business_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("businesses.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    previous_assessment_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("assessments.id", ondelete="SET NULL"), nullable=True, index=True
    )
    question_bank_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    language_used: Mapped[str] = mapped_column(
        Enum("en", "hi", name="assessment_language_enum"),
        default="en",
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        Enum("in_progress", "submitted", "abandoned", name="assessment_status_enum"),
        default="in_progress",
        nullable=False,
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Assessment Respondent Metadata & Administration (I-03, I-04)
    administration_mode: Mapped[Optional[str]] = mapped_column(
        Enum("self", "consultant_assisted", name="assessment_admin_mode_enum"),
        nullable=True,
        default="self",
    )
    respondent_role: Mapped[Optional[str]] = mapped_column(
        Enum("owner", "family", "employee", "other", name="assessment_respondent_role_enum"),
        nullable=True,
        default="owner",
    )
    reassessment_reason: Mapped[Optional[str]] = mapped_column(
        Enum("scheduled", "retest_no_intervention", "post_intervention", name="assessment_reassessment_reason_enum"),
        nullable=True,
    )

    # Relationships
    business: Mapped["Business"] = relationship("Business", back_populates="assessments")
    previous_assessment: Mapped[Optional["Assessment"]] = relationship(
        "Assessment", remote_side=[id], back_populates="subsequent_assessments"
    )
    subsequent_assessments: Mapped[List["Assessment"]] = relationship(
        "Assessment", back_populates="previous_assessment"
    )
    answers: Mapped[List["AssessmentAnswer"]] = relationship(
        "AssessmentAnswer", back_populates="assessment", cascade="all, delete-orphan"
    )
    scores: Mapped[List["AssessmentScore"]] = relationship(
        "AssessmentScore", back_populates="assessment", cascade="all, delete-orphan"
    )
    classification_results: Mapped[List["ClassificationResult"]] = relationship(
        "ClassificationResult", back_populates="assessment", cascade="all, delete-orphan"
    )
    ml_predictions: Mapped[List["MLPrediction"]] = relationship(
        "MLPrediction", back_populates="assessment", cascade="all, delete-orphan"
    )
    research_records: Mapped[List["ResearchEvaluationRecord"]] = relationship(
        "ResearchEvaluationRecord", back_populates="assessment", cascade="all, delete-orphan"
    )
    consultant_labels: Mapped[List["ConsultantBlindLabel"]] = relationship(
        "ConsultantBlindLabel", back_populates="assessment", cascade="all, delete-orphan"
    )


class AssessmentAnswer(Base):
    """Raw response to an individual question in an assessment."""

    __tablename__ = "assessment_answers"
    __table_args__ = (
        UniqueConstraint("assessment_id", "question_id", name="uq_answer_assessment_question"),
        Index("idx_assessment_answers_assessment", "assessment_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    assessment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("questions.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    selected_option_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("question_options.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    numeric_answer: Mapped[Optional[Decimal]] = mapped_column(Numeric(10, 2), nullable=True)
    text_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    answered_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="answers")
    question: Mapped["Question"] = relationship("Question", back_populates="answers")
    selected_option: Mapped[Optional["QuestionOption"]] = relationship(
        "QuestionOption", back_populates="selected_answers"
    )


class AssessmentScore(Base):
    """Computed per-dimension score for an assessment session."""

    __tablename__ = "assessment_scores"
    __table_args__ = (
        UniqueConstraint("assessment_id", "dimension_code", name="uq_score_assessment_dimension"),
        CheckConstraint("raw_score >= 0 AND raw_score <= max_possible_score", name="chk_score_range"),
        Index("idx_assessment_scores_assessment", "assessment_id"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    assessment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    dimension_code: Mapped[str] = mapped_column(String(50), nullable=False)
    raw_score: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    max_possible_score: Mapped[Decimal] = mapped_column(Numeric(6, 2), nullable=False)
    computed_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="scores")
