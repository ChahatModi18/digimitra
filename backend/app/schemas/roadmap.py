"""Roadmap and Progress Tracking Schemas."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.recommendation import RecommendationRead


class RoadmapItemBase(BaseModel):
    phase: str
    sequence_order: int
    title: str
    description: str
    status: str = "not_started"


class RoadmapItemUpdate(BaseModel):
    status: Optional[str] = Field(None, pattern="^(not_started|in_progress|completed|skipped)$")
    notes: Optional[str] = None


class RoadmapItemRead(RoadmapItemBase):
    id: int
    roadmap_id: int
    recommendation_id: Optional[int]
    recommendation: Optional[RecommendationRead] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RoadmapRead(BaseModel):
    id: int
    business_id: int
    current_rbdl_level: int
    target_rbdl_level: int
    status: str
    items: List[RoadmapItemRead] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
