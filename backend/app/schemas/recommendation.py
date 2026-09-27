"""Recommendation Schemas."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class RecommendationRead(BaseModel):
    id: int
    code: str
    category: str
    target_rbdl_level: int
    title_en: str
    title_hi: str
    description_en: str
    description_hi: str
    action_steps_en: Optional[List[str]] = None
    action_steps_hi: Optional[List[str]] = None
    cost_tier: str
    impact_tier: str
    estimated_days: int
    prerequisites: List[str] = []
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
