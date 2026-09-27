"""Assessment Question Bank and Submission Endpoints."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.question import Question
from app.schemas.assessment import AssessmentRead, AssessmentSubmit, QuestionRead
from app.schemas.common import APIResponse

router = APIRouter(prefix="/assessments", tags=["Assessments"])


@router.get("/questions", response_model=APIResponse[List[QuestionRead]])
async def get_active_questions(lang: str = "en", db: AsyncSession = Depends(get_db)):
    """Fetch active digital readiness assessment questions."""
    result = await db.execute(
        select(Question).where(Question.is_active == True).order_by(Question.display_order.asc())
    )
    questions = result.scalars().all()
    return APIResponse(
        success=True,
        data=[QuestionRead.model_validate(q) for q in questions],
    )


@router.post("/{business_id}/submit", response_model=APIResponse[AssessmentRead], status_code=status.HTTP_201_CREATED)
async def submit_assessment(
    business_id: int,
    assessment_in: AssessmentSubmit,
    db: AsyncSession = Depends(get_db),
):
    """Submit questionnaire responses for a business."""
    # Placeholder for Phase 2 assessment persistence & classification trigger
    return APIResponse(
        success=True,
        message="Assessment submitted successfully (Phase 0 foundation placeholder).",
        data=None,
    )
