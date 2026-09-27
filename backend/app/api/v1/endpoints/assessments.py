"""Assessment and RBDL Classification API Endpoints (Claude C3)."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.assessment import (
    AssessmentAnswerRead,
    AssessmentAnswerSave,
    AssessmentRead,
    AssessmentScoresResponse,
    AssessmentStart,
    AssessmentWithQuestionsRead,
    ClassificationResultRead,
)
from app.schemas.common import APIResponse
from app.services.assessment_service import AssessmentService

router = APIRouter(prefix="/assessments", tags=["Assessments"])


@router.post("", response_model=APIResponse[AssessmentRead], status_code=status.HTTP_201_CREATED)
async def start_assessment(
    payload: AssessmentStart,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Start a new digital readiness assessment session for a business or resume active draft."""
    assessment = await AssessmentService.start_assessment(
        db=db,
        business_id=payload.business_id,
        user_id=current_user.id,
        language_used=payload.language_used or "en",
        previous_assessment_id=payload.previous_assessment_id,
    )
    return APIResponse(
        success=True,
        message="Assessment session ready.",
        data=assessment,
    )


@router.get("/{assessment_id}", response_model=APIResponse[AssessmentRead])
async def get_assessment(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve details and status for an assessment session."""
    assessment, _ = await AssessmentService.verify_assessment_ownership(
        db=db, assessment_id=assessment_id, user_id=current_user.id
    )
    return APIResponse(
        success=True,
        data=AssessmentRead.model_validate(assessment),
    )


@router.get("/{assessment_id}/questions", response_model=APIResponse[AssessmentWithQuestionsRead])
async def get_assessment_questions(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve localized question bank items and currently saved responses for an assessment."""
    result = await AssessmentService.get_assessment_with_questions(
        db=db, assessment_id=assessment_id, user_id=current_user.id
    )
    return APIResponse(
        success=True,
        data=result,
    )


@router.put("/{assessment_id}/answers", response_model=APIResponse[List[AssessmentAnswerRead]])
async def save_answers(
    assessment_id: int,
    payload: AssessmentAnswerSave,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save draft or updated answers for an in-progress assessment session."""
    saved_answers = await AssessmentService.save_answers(
        db=db,
        assessment_id=assessment_id,
        answers_in=payload,
        user_id=current_user.id,
    )
    return APIResponse(
        success=True,
        message="Answers saved successfully.",
        data=saved_answers,
    )


@router.post("/{assessment_id}/submit", response_model=APIResponse[ClassificationResultRead])
async def submit_assessment(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit assessment, calculate dimension & composite scores, run RBDL classifier, and record explainability evidence."""
    classification_result = await AssessmentService.submit_assessment(
        db=db,
        assessment_id=assessment_id,
        user_id=current_user.id,
    )
    return APIResponse(
        success=True,
        message=f"Assessment submitted. Business classified at RBDL Level {classification_result.rbdl_level}.",
        data=classification_result,
    )


@router.get("/{assessment_id}/scores", response_model=APIResponse[AssessmentScoresResponse])
async def get_assessment_scores(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve computed 9-dimension scores (0-10) and weighted composite score."""
    scores = await AssessmentService.get_scores(
        db=db,
        assessment_id=assessment_id,
        user_id=current_user.id,
    )
    return APIResponse(
        success=True,
        data=scores,
    )


@router.get("/{assessment_id}/classification", response_model=APIResponse[ClassificationResultRead])
async def get_assessment_classification(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve primary RBDL classification outcome, certainty rating, and explainability evidence trail."""
    classification_result = await AssessmentService.get_classification(
        db=db,
        assessment_id=assessment_id,
        user_id=current_user.id,
    )
    return APIResponse(
        success=True,
        data=classification_result,
    )
