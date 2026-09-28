"""Requirement Profile Service (Research Instrument V1).

Manages business requirement profiles, controlled taxonomies, and blind consultant evaluations.
"""

from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.requirements.constants_v1 import (
    BUDGET_TIERS_V1,
    BUSINESS_GOALS_V1,
    EXISTING_TOOLS_V1,
    PAIN_POINTS_V1,
    RBDL_FRAMEWORK_VERSION,
    RECOMMENDATION_RULES_VERSION,
    REQUIREMENT_PROFILE_CODE,
    REQUIREMENT_PROFILE_VERSION,
    RESEARCH_EXPERIMENTS,
    RESEARCH_STATUS_DISCLOSURE,
    URGENCY_TIERS_V1,
)
from app.models.assessment import Assessment
from app.models.business import Business
from app.models.consultant_label import ConsultantBlindLabel
from app.models.requirement_profile import RequirementProfile
from app.schemas.requirement_profile import (
    ConsultantLabelCreate,
    ConsultantLabelRead,
    RequirementProfileCreate,
    RequirementProfileRead,
    RequirementTaxonomiesResponse,
)

logger = logging.getLogger(__name__)


class RequirementProfileService:
    """Service layer for business requirement profiling and consultant evaluations."""

    @classmethod
    def get_taxonomies(cls) -> RequirementTaxonomiesResponse:
        """Return controlled research taxonomies with bilingual descriptors (Version 1)."""
        return RequirementTaxonomiesResponse(
            framework_version=RBDL_FRAMEWORK_VERSION,
            requirement_profile_version=REQUIREMENT_PROFILE_VERSION,
            research_status_disclosure=RESEARCH_STATUS_DISCLOSURE,
            business_goals=BUSINESS_GOALS_V1,
            pain_points=PAIN_POINTS_V1,
            urgency_tiers=URGENCY_TIERS_V1,
            budget_tiers=BUDGET_TIERS_V1,
            existing_tools=EXISTING_TOOLS_V1,
        )

    @classmethod
    async def save_or_update_profile(
        cls,
        db: AsyncSession,
        payload: RequirementProfileCreate,
        user_id: int,
    ) -> RequirementProfileRead:
        """Save or update contextual requirement profile for an assessment session."""
        # Verify assessment exists and user has ownership
        stmt = (
            select(Assessment)
            .options(selectinload(Assessment.business))
            .where(Assessment.id == payload.assessment_id)
        )
        res = await db.execute(stmt)
        assessment = res.scalar_one_or_none()

        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Assessment ID {payload.assessment_id} not found.",
            )

        if assessment.business.owner_user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not own this business assessment.",
            )

        # Validate controlled category inputs
        if payload.business_goal not in BUSINESS_GOALS_V1:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid business_goal '{payload.business_goal}'. Must be one of {list(BUSINESS_GOALS_V1.keys())}.",
            )
        if payload.primary_pain_point not in PAIN_POINTS_V1:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid primary_pain_point '{payload.primary_pain_point}'. Must be one of {list(PAIN_POINTS_V1.keys())}.",
            )
        if payload.urgency not in URGENCY_TIERS_V1:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid urgency '{payload.urgency}'. Must be one of {list(URGENCY_TIERS_V1.keys())}.",
            )
        if payload.budget_tier not in BUDGET_TIERS_V1:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Invalid budget_tier '{payload.budget_tier}'. Must be one of {list(BUDGET_TIERS_V1.keys())}.",
            )

        # Check for existing profile
        prof_res = await db.execute(
            select(RequirementProfile).where(RequirementProfile.assessment_id == payload.assessment_id)
        )
        profile = prof_res.scalar_one_or_none()

        if profile:
            profile.business_goal = payload.business_goal
            profile.primary_pain_point = payload.primary_pain_point
            profile.urgency = payload.urgency
            profile.budget_tier = payload.budget_tier
            profile.existing_tools = payload.existing_tools
            profile.preferred_solution_type = payload.preferred_solution_type
            profile.profile_version = REQUIREMENT_PROFILE_VERSION
            profile.created_by = user_id
        else:
            profile = RequirementProfile(
                assessment_id=payload.assessment_id,
                business_id=assessment.business_id,
                profile_version=REQUIREMENT_PROFILE_VERSION,
                business_goal=payload.business_goal,
                primary_pain_point=payload.primary_pain_point,
                urgency=payload.urgency,
                budget_tier=payload.budget_tier,
                existing_tools=payload.existing_tools,
                preferred_solution_type=payload.preferred_solution_type,
                created_by=user_id,
            )
            db.add(profile)

        await db.commit()
        await db.refresh(profile)

        logger.info(
            f"Saved RequirementProfile ID {profile.id} for Assessment {payload.assessment_id} (Goal: {payload.business_goal}, Budget: {payload.budget_tier})"
        )
        return RequirementProfileRead.model_validate(profile)

    @classmethod
    async def get_profile_by_assessment(
        cls,
        db: AsyncSession,
        assessment_id: int,
        user_id: int,
    ) -> Optional[RequirementProfileRead]:
        """Retrieve requirement profile for an assessment session."""
        stmt = (
            select(RequirementProfile)
            .join(Assessment, RequirementProfile.assessment_id == Assessment.id)
            .join(Business, Assessment.business_id == Business.id)
            .where(
                RequirementProfile.assessment_id == assessment_id,
                Business.owner_user_id == user_id,
            )
        )
        res = await db.execute(stmt)
        profile = res.scalar_one_or_none()
        if not profile:
            return None
        return RequirementProfileRead.model_validate(profile)

    @classmethod
    async def submit_consultant_evaluation(
        cls,
        db: AsyncSession,
        payload: ConsultantLabelCreate,
        consultant_user_id: int,
    ) -> ConsultantLabelRead:
        """Record blind expert evaluation (RBDL level, requirement profile, recommendation ratings)."""
        # Ensure assessment exists
        a_res = await db.execute(select(Assessment).where(Assessment.id == payload.assessment_id))
        assessment = a_res.scalar_one_or_none()
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Assessment ID {payload.assessment_id} not found.",
            )

        # Check if consultant already submitted a label for this assessment
        existing_res = await db.execute(
            select(ConsultantBlindLabel).where(
                ConsultantBlindLabel.assessment_id == payload.assessment_id,
                ConsultantBlindLabel.consultant_user_id == consultant_user_id,
            )
        )
        existing = existing_res.scalar_one_or_none()

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        if existing:
            existing.labeled_rbdl_level = payload.labeled_rbdl_level
            existing.labeled_business_goal = payload.labeled_business_goal
            existing.labeled_primary_pain_point = payload.labeled_primary_pain_point
            existing.labeled_budget_tier = payload.labeled_budget_tier
            existing.labeled_urgency = payload.labeled_urgency
            existing.rationales = payload.rationales
            existing.recommendation_ratings_json = payload.recommendation_ratings
            existing.labeled_at = now
            label = existing
        else:
            label = ConsultantBlindLabel(
                assessment_id=payload.assessment_id,
                consultant_user_id=consultant_user_id,
                labeled_rbdl_level=payload.labeled_rbdl_level,
                labeled_business_goal=payload.labeled_business_goal,
                labeled_primary_pain_point=payload.labeled_primary_pain_point,
                labeled_budget_tier=payload.labeled_budget_tier,
                labeled_urgency=payload.labeled_urgency,
                labeling_protocol_version="1.0",
                rationales=payload.rationales,
                recommendation_ratings_json=payload.recommendation_ratings,
                labeled_at=now,
                created_at=now,
            )
            db.add(label)

        await db.commit()
        await db.refresh(label)

        logger.info(
            f"Consultant {consultant_user_id} recorded blind label for Assessment {payload.assessment_id} (Level: {payload.labeled_rbdl_level})"
        )
        return ConsultantLabelRead.model_validate(label)

    @classmethod
    async def list_consultant_evaluations(
        cls,
        db: AsyncSession,
        assessment_id: Optional[int] = None,
    ) -> List[ConsultantLabelRead]:
        """List blind consultant labels for research evaluation and agreement analysis."""
        stmt = select(ConsultantBlindLabel).order_by(desc(ConsultantBlindLabel.labeled_at))
        if assessment_id:
            stmt = stmt.where(ConsultantBlindLabel.assessment_id == assessment_id)
        res = await db.execute(stmt)
        labels = res.scalars().all()
        return [ConsultantLabelRead.model_validate(l) for l in labels]
