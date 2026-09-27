"""Roadmap and Task Progress API Endpoints (Claude C4)."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.roadmap import (
    RoadmapRead,
    RoadmapSummaryRead,
    RoadmapTaskRead,
    RoadmapTaskStatusUpdate,
)
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])


@router.get("/business/{business_id}", response_model=APIResponse[RoadmapRead])
async def get_active_roadmap(
    business_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve active phased digital transformation roadmap and tasks for a business."""
    roadmap = await RecommendationService.get_roadmap_for_business(
        db=db,
        business_id=business_id,
        user_id=current_user.id,
    )
    return APIResponse(
        success=True,
        message="Active roadmap retrieved successfully.",
        data=roadmap,
    )


@router.get("/business/{business_id}/history", response_model=APIResponse[List[RoadmapSummaryRead]])
async def get_roadmap_history(
    business_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve history of all roadmap versions generated for a business."""
    history = await RecommendationService.get_roadmap_history(
        db=db,
        business_id=business_id,
        user_id=current_user.id,
    )
    return APIResponse(
        success=True,
        message="Roadmap version history retrieved successfully.",
        data=history,
    )


@router.patch("/tasks/{task_id}/status", response_model=APIResponse[RoadmapTaskRead])
async def update_task_status(
    task_id: int,
    payload: RoadmapTaskStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update roadmap task execution status (pending, in_progress, completed, skipped)."""
    updated_task = await RecommendationService.update_task_status(
        db=db,
        task_id=task_id,
        status_in=payload,
        user_id=current_user.id,
    )
    return APIResponse(
        success=True,
        message=f"Task status updated to '{updated_task.status}'.",
        data=updated_task,
    )
