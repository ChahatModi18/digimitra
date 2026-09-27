"""Recommendation Catalog ORM Model."""

from typing import List, Optional
from sqlalchemy import JSON, Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin


class Recommendation(Base, TimestampMixin):
    """Catalog of actionable digitalization recommendations."""

    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # e.g., 'REC_UPI_01'
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # Payments, Accounting, Inventory, CRM, Marketing, Security
    target_rbdl_level: Mapped[int] = mapped_column(Integer, nullable=False)  # 1, 2, 3
    title_en: Mapped[str] = mapped_column(String(255), nullable=False)
    title_hi: Mapped[str] = mapped_column(String(255), nullable=False)
    description_en: Mapped[str] = mapped_column(Text, nullable=False)
    description_hi: Mapped[str] = mapped_column(Text, nullable=False)
    action_steps_en: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    action_steps_hi: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    cost_tier: Mapped[str] = mapped_column(String(20), default="low", nullable=False)  # free, low, medium, high
    impact_tier: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)  # low, medium, high
    estimated_days: Mapped[int] = mapped_column(Integer, default=7, nullable=False)
    prerequisites: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
