"""Business Category ORM Model (C2 Entity 2.3)."""

from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.business import Business


class BusinessCategory(Base, TimestampMixin):
    """Hierarchical business category / sector taxonomy."""

    __tablename__ = "business_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    parent_category_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("business_categories.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    name_en: Mapped[str] = mapped_column(String(100), nullable=False)
    name_hi: Mapped[str] = mapped_column(String(100), nullable=False)
    description_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description_hi: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Self-referencing hierarchy
    parent_category: Mapped[Optional["BusinessCategory"]] = relationship(
        "BusinessCategory", remote_side=[id], back_populates="subcategories"
    )
    subcategories: Mapped[List["BusinessCategory"]] = relationship(
        "BusinessCategory", back_populates="parent_category"
    )

    # Relationships
    businesses: Mapped[List["Business"]] = relationship("Business", back_populates="category")
