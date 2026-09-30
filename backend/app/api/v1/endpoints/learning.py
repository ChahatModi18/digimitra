"""Learning Flashcards REST Endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Query, status
from pydantic import BaseModel

from app.schemas.common import APIResponse
from app.core.exceptions import EntityNotFoundException
from app.domain.learning.flashcards import (
    FLASHCARDS_CATALOG,
    LearningFlashcard,
    get_all_flashcards,
    get_flashcards_by_level,
    get_flashcard_for_recommendation,
    get_flashcard_by_id,
)

router = APIRouter(prefix="/learning/flashcards", tags=["Learning"])


class FlashcardDTO(BaseModel):
    card_id: str
    recommendation_code: Optional[str]
    target_level: int
    topic: str
    title_en: str
    title_hi: str
    what_is_it_en: str
    what_is_it_hi: str
    why_matters_en: str
    why_matters_hi: str
    who_needs_it_en: str
    who_needs_it_hi: str
    when_to_adopt_en: str
    when_to_adopt_hi: str
    prerequisites_en: List[str]
    prerequisites_hi: List[str]
    complexity: str
    implementation_steps_en: List[str]
    implementation_steps_hi: List[str]
    common_mistakes_en: List[str]
    common_mistakes_hi: List[str]
    expected_benefit_en: str
    expected_benefit_hi: str
    what_to_measure_en: List[str]
    what_to_measure_hi: List[str]
    low_cost_alternative_en: str
    low_cost_alternative_hi: str
    next_action_en: str
    next_action_hi: str


def _to_dto(c: LearningFlashcard) -> FlashcardDTO:
    return FlashcardDTO(
        card_id=c.card_id,
        recommendation_code=c.recommendation_code,
        target_level=c.target_level,
        topic=c.topic,
        title_en=c.title_en,
        title_hi=c.title_hi,
        what_is_it_en=c.what_is_it_en,
        what_is_it_hi=c.what_is_it_hi,
        why_matters_en=c.why_matters_en,
        why_matters_hi=c.why_matters_hi,
        who_needs_it_en=c.who_needs_it_en,
        who_needs_it_hi=c.who_needs_it_hi,
        when_to_adopt_en=c.when_to_adopt_en,
        when_to_adopt_hi=c.when_to_adopt_hi,
        prerequisites_en=c.prerequisites_en,
        prerequisites_hi=c.prerequisites_hi,
        complexity=c.complexity,
        implementation_steps_en=c.implementation_steps_en,
        implementation_steps_hi=c.implementation_steps_hi,
        common_mistakes_en=c.common_mistakes_en,
        common_mistakes_hi=c.common_mistakes_hi,
        expected_benefit_en=c.expected_benefit_en,
        expected_benefit_hi=c.expected_benefit_hi,
        what_to_measure_en=c.what_to_measure_en,
        what_to_measure_hi=c.what_to_measure_hi,
        low_cost_alternative_en=c.low_cost_alternative_en,
        low_cost_alternative_hi=c.low_cost_alternative_hi,
        next_action_en=c.next_action_en,
        next_action_hi=c.next_action_hi,
    )


@router.get("", response_model=APIResponse[List[FlashcardDTO]])
async def list_flashcards(
    level: Optional[int] = Query(None, description="Filter flashcards by target level (1, 2, or 3)"),
):
    """Retrieve structured learning flashcards with optional level filter."""
    if level is not None:
        cards = get_flashcards_by_level(level)
    else:
        cards = get_all_flashcards()

    return APIResponse(
        success=True,
        data=[_to_dto(c) for c in cards],
    )


@router.get("/recommendation/{rec_code}", response_model=APIResponse[Optional[FlashcardDTO]])
async def get_flashcard_by_recommendation(rec_code: str):
    """Retrieve learning flashcard corresponding to a specific recommendation code."""
    card = get_flashcard_for_recommendation(rec_code)
    return APIResponse(
        success=True,
        data=_to_dto(card) if card else None,
    )


@router.get("/{card_id}", response_model=APIResponse[FlashcardDTO])
async def get_flashcard(card_id: str):
    """Retrieve single learning flashcard by ID."""
    card = get_flashcard_by_id(card_id)
    if not card:
        raise EntityNotFoundException("LearningFlashcard", card_id)
    return APIResponse(
        success=True,
        data=_to_dto(card),
    )
