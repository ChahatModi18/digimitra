"""Requirement Profile & Research Instrument Endpoints (Version 1)."""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies import get_current_user
from app.domain.requirements.constants_v1 import RESEARCH_EXPERIMENTS
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.requirement_profile import (
    ConsultantLabelCreate,
    ConsultantLabelRead,
    RequirementProfileCreate,
    RequirementProfileRead,
    RequirementTaxonomiesResponse,
)
from app.services.requirement_profile_service import RequirementProfileService

router = APIRouter(prefix="/requirements", tags=["Requirements & Research Instruments"])


@router.get("/taxonomies", response_model=APIResponse[RequirementTaxonomiesResponse])
async def get_requirement_taxonomies():
    """Retrieve controlled research instrument taxonomies (Goals, Pain Points, Urgency, Budget, Tools) in EN & HI."""
    taxonomies = RequirementProfileService.get_taxonomies()
    return APIResponse(
        success=True,
        message="Requirement taxonomies retrieved successfully (Proposed Research Instrument V1).",
        data=taxonomies,
    )


@router.get("/experiments", response_model=APIResponse[List[Dict[str, Any]]])
async def get_research_experiments():
    """Retrieve registry of planned research experiments (E-01 through E-12)."""
    return APIResponse(
        success=True,
        message="Research experiment registry retrieved.",
        data=RESEARCH_EXPERIMENTS,
    )


@router.post("/profile", response_model=APIResponse[RequirementProfileRead], status_code=status.HTTP_201_CREATED)
async def save_requirement_profile(
    payload: RequirementProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save or update the contextual business requirement profile for an assessment session."""
    saved_profile = await RequirementProfileService.save_or_update_profile(
        db=db,
        payload=payload,
        user_id=current_user.id,
    )
    return APIResponse(
        success=True,
        message="Business requirement profile saved successfully.",
        data=saved_profile,
    )


@router.get("/profile/{assessment_id}", response_model=APIResponse[Optional[RequirementProfileRead]])
async def get_requirement_profile(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve contextual business requirement profile for an assessment session."""
    profile = await RequirementProfileService.get_profile_by_assessment(
        db=db,
        assessment_id=assessment_id,
        user_id=current_user.id,
    )
    return APIResponse(
        success=True,
        message="Requirement profile retrieved." if profile else "No requirement profile found for this assessment.",
        data=profile,
    )


@router.post("/consultant-evaluations", response_model=APIResponse[ConsultantLabelRead], status_code=status.HTTP_201_CREATED)
async def submit_consultant_evaluation(
    payload: ConsultantLabelCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit independent blind expert evaluation on RBDL level, requirement profile, and recommendation appropriateness."""
    result = await RequirementProfileService.submit_consultant_evaluation(
        db=db,
        payload=payload,
        consultant_user_id=current_user.id,
    )
    return APIResponse(
        success=True,
        message="Consultant blind evaluation recorded successfully.",
        data=result,
    )


@router.get("/consultant-evaluations", response_model=APIResponse[List[ConsultantLabelRead]])
async def list_consultant_evaluations(
    assessment_id: Optional[int] = Query(None, description="Optional assessment ID filter"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List blind consultant evaluation records for research inter-rater reliability analysis."""
    evaluations = await RequirementProfileService.list_consultant_evaluations(
        db=db,
        assessment_id=assessment_id,
    )
    return APIResponse(
        success=True,
        message="Consultant evaluation records retrieved.",
        data=evaluations,
    )
