"""Progress Log ORM Model for tracking roadmap milestones."""

from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base


class ProgressLog(Base):
    """Log entry recording progress changes and notes on roadmap tasks."""

    __tablename__ = "progress_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    roadmap_item_id: Mapped[int] = mapped_column(ForeignKey("roadmap_items.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_status: Mapped[str] = mapped_column(String(50), nullable=False)
    new_status: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    logged_by_user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    logged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    roadmap_item: Mapped["RoadmapItem"] = relationship("RoadmapItem", back_populates="progress_logs")
