"""Recommendation Schemas (Claude C4)."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class PriorityScoreBreakdownSchema(BaseModel):
    """Explainable priority score breakdown."""

    impact_level: int
    feasibility_level: int
    cost_level: int
    readiness_alignment: float
    impact_component: float
    feasibility_component: float
    cost_component: float
    readiness_component: float
    final_priority_score: float


class RecommendationRead(BaseModel):
    """Catalog recommendation schema."""

    id: int
    recommendation_code: str
    dimension_code: Optional[str] = None
    category: Optional[str] = None
    target_rbdl_level: int
    title_en: str
    title_hi: str
    description_en: str
    description_hi: str
    estimated_cost_level: str
    estimated_effort_level: str
    impact_level: str
    default_priority: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class BusinessRecommendationRead(BaseModel):
    """Generated business recommendation instance with ranking and explainable reason."""

    id: int
    business_id: int
    classification_result_id: int
    recommendation_id: int
    recommendation_code: str
    dimension_code: Optional[str] = None
    category: Optional[str] = None
    target_rbdl_level: int
    title_en: str
    title_hi: str
    description_en: str
    description_hi: str
    rank_order: int
    priority_score: Optional[float] = None
    impact_score: Optional[float] = None
    feasibility_score: Optional[float] = None
    cost_score: Optional[float] = None
    readiness_score: Optional[float] = None
    estimated_cost_level: str
    estimated_effort_level: str
    impact_level: str
    reason_en: Optional[str] = None
    reason_hi: Optional[str] = None
    evidence_json: Optional[Dict[str, Any]] = None
    status: str
    generated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BusinessRecommendationsResponse(BaseModel):
    """Response containing ranked recommendations for a business."""

    business_id: int
    assessment_id: int
    current_rbdl_level: int
    target_rbdl_level: int
    total_recommendations: int
    recommendations: List[BusinessRecommendationRead]
