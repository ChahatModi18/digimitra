"""Roadmap and RoadmapTask ORM Models (C2 Entity 2.16 & 2.17)."""

from datetime import datetime, date, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import (
    BigInteger,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    SmallInteger,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.business import Business
    from app.models.classification_result import ClassificationResult
    from app.models.recommendation import Recommendation
    from app.models.progress_log import ProgressLog


class Roadmap(Base):
    """Phased digital transformation roadmap for a business."""

    __tablename__ = "roadmaps"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    business_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("businesses.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    classification_result_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("classification_results.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("active", "superseded", "completed", name="roadmap_status_enum"),
        default="active",
        nullable=False,
    )
    generated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Backward compatibility alias for items
    @property
    def items(self) -> List["RoadmapTask"]:
        return self.tasks

    # Relationships
    business: Mapped["Business"] = relationship("Business", back_populates="roadmaps")
    classification_result: Mapped["ClassificationResult"] = relationship(
        "ClassificationResult", back_populates="roadmaps"
    )
    tasks: Mapped[List["RoadmapTask"]] = relationship(
        "RoadmapTask",
        back_populates="roadmap",
        cascade="all, delete-orphan",
        order_by="RoadmapTask.sequence_order",
    )


class RoadmapTask(Base, TimestampMixin):
    """An individual actionable task in a digitalization roadmap."""

    __tablename__ = "roadmap_tasks"
    __table_args__ = (
        Index("idx_roadmap_tasks_roadmap_status", "roadmap_id", "status"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    roadmap_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False, index=True
    )
    recommendation_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("recommendations.id", ondelete="SET NULL"), nullable=True, index=True
    )
    title_en: Mapped[str] = mapped_column(String(255), nullable=False)
    title_hi: Mapped[str] = mapped_column(String(255), nullable=False)
    description_en: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    description_hi: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    phase_number: Mapped[int] = mapped_column(SmallInteger, default=1, nullable=False)
    sequence_order: Mapped[int] = mapped_column(SmallInteger, default=0, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("pending", "in_progress", "completed", "skipped", name="roadmap_task_status_enum"),
        default="pending",
        nullable=False,
    )
    skip_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    due_date_estimate: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Relationships
    roadmap: Mapped["Roadmap"] = relationship("Roadmap", back_populates="tasks")
    recommendation: Mapped[Optional["Recommendation"]] = relationship("Recommendation", back_populates="roadmap_tasks")
    progress_logs: Mapped[List["ProgressLog"]] = relationship(
        "ProgressLog", back_populates="roadmap_task", cascade="all, delete-orphan"
    )


# Alias for backwards compatibility if referenced elsewhere
RoadmapItem = RoadmapTask

