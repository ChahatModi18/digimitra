"""Roadmap and Task Tracking Schemas (Claude C4)."""

from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RoadmapTaskStatusUpdate(BaseModel):
    """Payload to update roadmap task status."""

    status: str = Field(..., pattern="^(pending|in_progress|completed|skipped)$")
    skip_reason: Optional[str] = None


class RoadmapTaskRead(BaseModel):
    """Individual actionable roadmap task schema."""

    id: int
    roadmap_id: int
    recommendation_id: Optional[int] = None
    recommendation_code: Optional[str] = None
    title_en: str
    title_hi: str
    description_en: Optional[str] = None
    description_hi: Optional[str] = None
    phase_number: int
    phase_name_en: str = "Quick Wins"
    phase_name_hi: str = "त्वरित परिणाम"
    sequence_order: int
    status: str
    skip_reason: Optional[str] = None
    due_date_estimate: Optional[date] = None
    estimated_cost_level: Optional[str] = "low"
    estimated_effort_level: Optional[str] = "low"
    impact_level: Optional[str] = "high"
    priority_score: Optional[float] = None
    reason_en: Optional[str] = None
    reason_hi: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PhasedRoadmapGroup(BaseModel):
    """Group of tasks in a roadmap phase."""

    phase_number: int
    phase_name_en: str
    phase_name_hi: str
    total_tasks: int
    tasks: List[RoadmapTaskRead]


class RoadmapRead(BaseModel):
    """Complete phased digital transformation roadmap schema."""

    id: int
    business_id: int
    classification_result_id: int
    version: int
    status: str
    current_rbdl_level: int
    target_rbdl_level: int
    total_tasks: int
    completed_tasks: int
    phase_1: PhasedRoadmapGroup
    phase_2: PhasedRoadmapGroup
    phase_3: PhasedRoadmapGroup
    all_tasks: List[RoadmapTaskRead]
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RoadmapSummaryRead(BaseModel):
    """Summary item for roadmap version history list."""

    id: int
    business_id: int
    version: int
    status: str
    total_tasks: int
    completed_tasks: int
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Backwards compatibility aliases
RoadmapItemRead = RoadmapTaskRead
RoadmapItemUpdate = RoadmapTaskStatusUpdate

