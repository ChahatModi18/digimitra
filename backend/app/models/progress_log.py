"""Progress Log ORM Model (C2 Entity 2.18)."""

from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from sqlalchemy import (
    BigInteger,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.roadmap import RoadmapTask
    from app.models.business import Business
    from app.models.user import User


class ProgressLog(Base):
    """Append-only log recording progress changes and notes on roadmap tasks."""

    __tablename__ = "progress_logs"
    __table_args__ = (
        Index("idx_progress_logs_business_logged", "business_id", "logged_at"),
    )

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    roadmap_task_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("roadmap_tasks.id", ondelete="CASCADE"), nullable=False, index=True
    )
    business_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("businesses.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    previous_status: Mapped[Optional[str]] = mapped_column(
        Enum("pending", "in_progress", "completed", "skipped", name="progress_log_prev_status_enum"),
        nullable=True,
    )
    new_status: Mapped[str] = mapped_column(
        Enum("pending", "in_progress", "completed", "skipped", name="progress_log_new_status_enum"),
        nullable=False,
    )
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    logged_by_user_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    logged_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    roadmap_task: Mapped["RoadmapTask"] = relationship("RoadmapTask", back_populates="progress_logs")
    business: Mapped["Business"] = relationship("Business", back_populates="progress_logs")
    logged_by_user: Mapped[Optional["User"]] = relationship("User", back_populates="progress_logs")
