"""Question Bank and Option ORM Models."""

from typing import Optional
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Question(Base, TimestampMixin):
    """Dynamic assessment questionnaire item."""

    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # e.g., 'Q_PAY_01'
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # Operations, Payments, Online Presence, Finance, Analytics
    rbdl_target_level: Mapped[int] = mapped_column(Integer, nullable=False, default=1)  # 0, 1, 2, 3
    text_en: Mapped[str] = mapped_column(Text, nullable=False)
    text_hi: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(String(50), default="single_choice", nullable=False)  # single_choice, multiple_choice, boolean, rating
    weight: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    options: Mapped[list["QuestionOption"]] = relationship("QuestionOption", back_populates="question", cascade="all, delete-orphan", order_by="QuestionOption.display_order")


class QuestionOption(Base, TimestampMixin):
    """Selectable options for a question."""

    __tablename__ = "question_options"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    option_key: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., 'yes', 'no', 'upi_only'
    text_en: Mapped[str] = mapped_column(String(255), nullable=False)
    text_hi: Mapped[str] = mapped_column(String(255), nullable=False)
    score_value: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    question: Mapped["Question"] = relationship("Question", back_populates="options")
