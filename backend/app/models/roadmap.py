"""Roadmap and RoadmapItem ORM Models."""

from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin


class Roadmap(Base, TimestampMixin):
    """Phased digital transformation roadmap for a business."""

    __tablename__ = "roadmaps"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    business_id: Mapped[int] = mapped_column(ForeignKey("businesses.id", ondelete="CASCADE"), nullable=False, index=True)
    current_rbdl_level: Mapped[int] = mapped_column(Integer, nullable=False)
    target_rbdl_level: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)  # active, completed, superseded

    # Relationships
    business: Mapped["Business"] = relationship("Business", back_populates="roadmaps")
    items: Mapped[list["RoadmapItem"]] = relationship("RoadmapItem", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapItem.sequence_order")


class RoadmapItem(Base, TimestampMixin):
    """An individual actionable task in a digitalization roadmap."""

    __tablename__ = "roadmap_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    roadmap_id: Mapped[int] = mapped_column(ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    recommendation_id: Mapped[Optional[int]] = mapped_column(ForeignKey("recommendations.id", ondelete="SET NULL"), nullable=True)
    phase: Mapped[str] = mapped_column(String(50), default="Phase 1 - Immediate", nullable=False)  # Immediate (0-30d), Short-term (30-90d), Medium-term (90-180d)
    sequence_order: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="not_started", nullable=False)  # not_started, in_progress, completed, skipped
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    roadmap: Mapped["Roadmap"] = relationship("Roadmap", back_populates="items")
    recommendation: Mapped[Optional["Recommendation"]] = relationship("Recommendation")
    progress_logs: Mapped[list["ProgressLog"]] = relationship("ProgressLog", back_populates="roadmap_item", cascade="all, delete-orphan")
