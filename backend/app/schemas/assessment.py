"""Assessment and Question Bank Schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class QuestionOptionRead(BaseModel):
    id: int
    option_key: str
    text_en: str
    text_hi: str
    score_value: int
    display_order: int

    model_config = ConfigDict(from_attributes=True)


class QuestionRead(BaseModel):
    id: int
    code: str
    category: str
    rbdl_target_level: int
    text_en: str
    text_hi: str
    question_type: str
    weight: int
    version: str
    display_order: int
    options: List[QuestionOptionRead] = []

    model_config = ConfigDict(from_attributes=True)


class AssessmentSubmit(BaseModel):
    """Answers submitted for an assessment."""
    answers: Dict[str, Any] = Field(..., description="Mapping of question code to selected answer key or value")
    question_bank_version: str = Field(default="1.0")


class AssessmentRead(BaseModel):
    id: int
    business_id: int
    status: str
    question_bank_version: str
    answers_payload: Dict[str, Any]
    submitted_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
