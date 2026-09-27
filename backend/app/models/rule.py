"""Rule ORM Model for RBDL Classification Engine."""

from typing import Any, Dict, List
from sqlalchemy import JSON, Boolean, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin


class Rule(Base, TimestampMixin):
    """Declarative, versioned rule for evaluating business digitalization readiness."""

    __tablename__ = "rules"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # e.g., 'R_RBDL_L1_PAY'
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    rbdl_level_target: Mapped[int] = mapped_column(Integer, nullable=False)  # 0, 1, 2, 3
    condition_expression: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)  # Safe JSON Logic structure
    triggered_recommendations: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)  # List of recommendation codes
    priority: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)
    created_by: Mapped[str] = mapped_column(String(100), default="system", nullable=False)
