"""Question Bank and Option ORM Models (C2 Entity 2.5 & 2.6)."""

from typing import Optional, List, TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import Boolean, Enum, ForeignKey, Integer, Numeric, SmallInteger, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.assessment import AssessmentAnswer


class Question(Base, TimestampMixin):
    """Bilingual assessment questionnaire item."""

    __tablename__ = "questions"
    __table_args__ = (
        UniqueConstraint("question_code", "version", name="uq_question_code_version"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    question_code: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    dimension_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    question_text_en: Mapped[str] = mapped_column(Text, nullable=False)
    question_text_hi: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(
        Enum("single_choice", "multi_choice", "boolean", "numeric", "text", name="question_type_enum"),
        nullable=False,
    )
    applies_to_business_size: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    display_order: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    options: Mapped[List["QuestionOption"]] = relationship(
        "QuestionOption",
        back_populates="question",
        cascade="all, delete-orphan",
        order_by="QuestionOption.display_order",
    )
    answers: Mapped[List["AssessmentAnswer"]] = relationship("AssessmentAnswer", back_populates="question")


class QuestionOption(Base):
    """Selectable options for a choice-based question."""

    __tablename__ = "question_options"
    __table_args__ = (
        UniqueConstraint("question_id", "option_code", name="uq_question_option"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    question_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    option_code: Mapped[str] = mapped_column(String(50), nullable=False)
    label_en: Mapped[str] = mapped_column(String(255), nullable=False)
    label_hi: Mapped[str] = mapped_column(String(255), nullable=False)
    score_value: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=Decimal("0.00"), nullable=False)
    display_order: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)

    # Relationships
    question: Mapped["Question"] = relationship("Question", back_populates="options")
    selected_answers: Mapped[List["AssessmentAnswer"]] = relationship(
        "AssessmentAnswer", back_populates="selected_option"
    )
