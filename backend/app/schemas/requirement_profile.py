"""Requirement Profile and Consultant Evaluation Pydantic Schemas (Research Instrument V1)."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RequirementProfileBase(BaseModel):
    """Base contextual requirement profile fields."""

    business_goal: str = Field(..., description="Primary business goal (G1..G10)")
    primary_pain_point: str = Field(..., description="Primary business pain point (P1..P10)")
    urgency: str = Field(..., description="Urgency tier (U1..U4)")
    budget_tier: str = Field(..., description="Budget tier (B0..B3)")
    existing_tools: Optional[List[str]] = Field(
        default=None, description="List of currently used digital tools"
    )
    preferred_solution_type: Optional[str] = Field(
        default=None, description="Preferred solution delivery mode (e.g. mobile_first, diy)"
    )


class RequirementProfileCreate(RequirementProfileBase):
    """Payload for submitting or updating a requirement profile."""

    assessment_id: int
    business_id: Optional[int] = None


class RequirementProfileRead(RequirementProfileBase):
    """Read representation of a persisted RequirementProfile."""

    id: int
    assessment_id: int
    business_id: int
    profile_version: int = 1
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class RequirementTaxonomiesResponse(BaseModel):
    """Controlled research instrument taxonomies (Version 1)."""

    framework_version: str = "RBDL_V1"
    requirement_profile_version: int = 1
    research_status_disclosure: str
    business_goals: Dict[str, Any]
    pain_points: Dict[str, Any]
    urgency_tiers: Dict[str, Any]
    budget_tiers: Dict[str, Any]
    existing_tools: Dict[str, Any]


class ConsultantLabelCreate(BaseModel):
    """Payload for independent blind consultant evaluation (A: RBDL level, B: requirement profile, C: recommendation appropriateness)."""

    assessment_id: int
    labeled_rbdl_level: int = Field(..., ge=0, le=3, description="Blind evaluated RBDL level (0-3)")
    labeled_business_goal: Optional[str] = Field(None, description="Blind assessed business goal (G1..G10)")
    labeled_primary_pain_point: Optional[str] = Field(None, description="Blind assessed pain point (P1..P10)")
    labeled_budget_tier: Optional[str] = Field(None, description="Blind assessed budget tier (B0..B3)")
    labeled_urgency: Optional[str] = Field(None, description="Blind assessed urgency (U1..U4)")
    rationales: Optional[str] = Field(None, description="Qualitative justification and clinical notes")
    recommendation_ratings: Optional[Dict[str, Any]] = Field(
        None, description="Expert ratings on recommendation appropriateness"
    )


class ConsultantLabelRead(BaseModel):
    """Read schema for submitted consultant blind label."""

    id: int
    assessment_id: int
    consultant_user_id: int
    labeled_rbdl_level: int
    labeled_business_goal: Optional[str] = None
    labeled_primary_pain_point: Optional[str] = None
    labeled_budget_tier: Optional[str] = None
    labeled_urgency: Optional[str] = None
    labeling_protocol_version: str
    rationales: Optional[str] = None
    recommendation_ratings_json: Optional[Dict[str, Any]] = None
    labeled_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
