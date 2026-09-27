"""Business ORM Model."""

from typing import Optional
from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Business(Base, TimestampMixin):
    """Business profile registered by an MSME owner or consultant."""

    __tablename__ = "businesses"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    sector: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # e.g., Retail, Manufacturing, Services, F&B
    enterprise_size: Mapped[str] = mapped_column(String(50), nullable=False)  # Micro, Small, Medium
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    pincode: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    primary_language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="businesses")
    assessments: Mapped[list["Assessment"]] = relationship("Assessment", back_populates="business", cascade="all, delete-orphan")
    roadmaps: Mapped[list["Roadmap"]] = relationship("Roadmap", back_populates="business", cascade="all, delete-orphan")
