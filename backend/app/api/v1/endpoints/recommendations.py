"""Recommendations API Endpoints (Claude C4)."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.recommendation import BusinessRecommendationsResponse
from app.schemas.roadmap import RoadmapRead
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("/business/{business_id}", response_model=APIResponse[BusinessRecommendationsResponse])
async def get_business_recommendations(
    business_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve ranked recommendations with explainable reasons for a business."""
    result = await RecommendationService.get_recommendations_for_business(
        db=db,
        business_id=business_id,
        user_id=current_user.id,
    )
    return APIResponse(
        success=True,
        message="Ranked recommendations retrieved successfully.",
        data=result,
    )


@router.post("/generate/{assessment_id}", response_model=APIResponse[RoadmapRead], status_code=status.HTTP_201_CREATED)
async def generate_recommendations_and_roadmap(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate recommendations and a phased roadmap for a completed assessment."""
    roadmap = await RecommendationService.generate_recommendations_and_roadmap(
        db=db,
        assessment_id=assessment_id,
        user_id=current_user.id,
    )
    return APIResponse(
        success=True,
        message=f"Recommendations and Phased Roadmap v{roadmap.version} generated successfully.",
        data=roadmap,
    )
