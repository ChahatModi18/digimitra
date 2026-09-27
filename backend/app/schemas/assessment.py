"""Assessment, Question Bank, Answer, Scoring, and Classification Schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class QuestionOptionRead(BaseModel):
    """Option choice item within a question."""

    id: int
    question_id: int
    option_code: str
    label_en: str
    label_hi: str
    score_value: float
    display_order: int

    model_config = ConfigDict(from_attributes=True)


class QuestionRead(BaseModel):
    """Questionnaire item definition with localized text and available options."""

    id: int
    question_code: str
    dimension_code: str
    question_text_en: str
    question_text_hi: str
    question_type: str
    applies_to_business_size: Optional[str] = None
    display_order: int
    version: int
    is_active: bool
    options: List[QuestionOptionRead] = []

    model_config = ConfigDict(from_attributes=True)


class AssessmentAnswerItem(BaseModel):
    """Payload representing an answer to a single question."""

    question_id: int
    question_code: Optional[str] = None
    selected_option_id: Optional[int] = None
    selected_option_ids: Optional[List[int]] = None  # for multi-choice questions
    numeric_answer: Optional[float] = None
    text_answer: Optional[str] = None
    is_na: Optional[bool] = False  # Explicit Not Applicable


class AssessmentAnswerSave(BaseModel):
    """Batch answers save request."""

    answers: List[AssessmentAnswerItem]
    language_used: Optional[str] = "en"


# Alias for backward compatibility
AssessmentSubmit = AssessmentAnswerSave


class AssessmentAnswerRead(BaseModel):
    """Read representation of an assessment answer."""

    id: int
    assessment_id: int
    question_id: int
    question_code: Optional[str] = None
    selected_option_id: Optional[int] = None
    selected_option_ids: Optional[List[int]] = None
    numeric_answer: Optional[float] = None
    text_answer: Optional[str] = None
    is_na: bool = False
    answered_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AssessmentStart(BaseModel):
    """Payload to initiate a new assessment session for a business."""

    business_id: int
    language_used: Optional[str] = "en"
    previous_assessment_id: Optional[int] = None


class AssessmentScoreRead(BaseModel):
    """Per-dimension score detail."""

    dimension_code: str
    dimension_name_en: str
    dimension_name_hi: str
    raw_score: float
    max_possible_score: float
    dimension_score: float  # Normalized 0-10
    weight: float
    answered_count: int = 0
    na_count: int = 0
    missing_count: int = 0


class AssessmentScoresResponse(BaseModel):
    """Scores response for an assessment session."""

    assessment_id: int
    composite_score: float  # 0.0 - 10.0 weighted composite
    dimension_scores: List[AssessmentScoreRead]
    is_complete: bool


class ClassificationEvidenceRead(BaseModel):
    """Snapshotted explainability evidence trace for a rule."""

    id: Optional[int] = None
    rule_id: int
    rule_code: Optional[str] = None
    rule_name: Optional[str] = None
    rule_version_snapshot: int
    fired_order: int
    condition_snapshot_json: Dict[str, Any]
    matched_answers_snapshot_json: Dict[str, Any]
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ClassificationResultRead(BaseModel):
    """Complete classification output response."""

    id: Optional[int] = None
    assessment_id: int
    method: str = "rule_based"
    rbdl_level: int
    level_name_en: str
    level_name_hi: str
    ruleset_version: Optional[int] = 1
    is_primary: bool = True
    classified_at: Optional[datetime] = None
    composite_score: float
    dimension_scores: Dict[str, float]
    certainty_tier: str
    certainty_reasons: List[str] = []
    contradictions: List[Dict[str, Any]] = []
    satisfied_requirements: List[Dict[str, Any]] = []
    blocking_requirements: List[Dict[str, Any]] = []
    category_exemptions: List[str] = []
    explanation_summary_en: str
    explanation_summary_hi: str
    evidence_traces: List[ClassificationEvidenceRead] = []

    model_config = ConfigDict(from_attributes=True)


class AssessmentHistoryItemRead(BaseModel):
    """Summary item representing a past or present assessment in business history."""

    id: int
    business_id: int
    question_bank_version: int
    language_used: str
    status: str
    rbdl_level: Optional[int] = None
    level_name_en: Optional[str] = None
    level_name_hi: Optional[str] = None
    composite_score: Optional[float] = None
    certainty_tier: Optional[str] = None
    started_at: datetime
    submitted_at: Optional[datetime] = None
    previous_assessment_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class DimensionComparisonRead(BaseModel):
    """Comparative delta analysis for a single digital dimension between two assessments."""

    dimension_code: str
    dimension_name_en: str
    dimension_name_hi: str
    previous_score: float
    current_score: float
    score_delta: float
    percentage_change: float
    status: str  # "improved", "declined", "maintained"


class AssessmentComparisonRead(BaseModel):
    """Comprehensive comparison between two assessment sessions for a business."""

    business_id: int
    business_name: str
    previous_assessment_id: int
    previous_submitted_at: Optional[datetime] = None
    previous_rbdl_level: int
    previous_level_name_en: str
    previous_level_name_hi: str
    previous_composite_score: float
    current_assessment_id: int
    current_submitted_at: Optional[datetime] = None
    current_rbdl_level: int
    current_level_name_en: str
    current_level_name_hi: str
    current_composite_score: float
    composite_score_delta: float
    level_change: int  # e.g. +1, 0, -1
    dimension_comparisons: List[DimensionComparisonRead]
    completed_tasks_count: int
    completed_task_titles_en: List[str] = []
    completed_task_titles_hi: List[str] = []
    disclaimer_en: str = (
        "Note: Score improvements reflect self-reported capability increases on the DigiMitra "
        "readiness framework and do not guarantee or prove real-world business revenue or commercial success."
    )
    disclaimer_hi: str = (
        "नोट: स्कोर में सुधार डिजिटल तत्परता रूपरेखा पर स्व-रिपोर्ट की गई क्षमताओं में वृद्धि को दर्शाता है "
        "और यह वास्तविक दुनिया के व्यावसायिक राजस्व या वाणिज्यिक सफलता की गारंटी या प्रमाण नहीं देता है।"
    )


class AssessmentRead(BaseModel):
    """Assessment session entity detail."""

    id: int
    business_id: int
    previous_assessment_id: Optional[int] = None
    question_bank_version: int
    language_used: str
    status: str
    started_at: datetime
    submitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AssessmentWithQuestionsRead(BaseModel):
    """Assessment session bundled with questions, options, and existing answers."""

    assessment: AssessmentRead
    questions: List[QuestionRead]
    answers: List[AssessmentAnswerRead] = []


