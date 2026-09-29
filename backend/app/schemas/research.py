"""Pydantic Schemas for Research Evaluation Infrastructure (A11 / C8)."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Research Study Schemas (Phase 2 & 19)
# ---------------------------------------------------------------------------

class ResearchStudyBase(BaseModel):
    study_code: str = Field(..., max_length=50, description="Unique research study identifier")
    title: str = Field(..., max_length=255, description="Full descriptive title of research study")
    protocol_version: str = Field(default="1.0", max_length=20)
    description: Optional[str] = None
    instrument_version: str = Field(default="1.0", max_length=20)
    rbdl_version: str = Field(default="1.0", max_length=20)
    question_bank_version: int = Field(default=1)
    requirement_profile_version: str = Field(default="1.0", max_length=20)
    recommendation_rules_version: str = Field(default="1.0", max_length=20)


class ResearchStudyCreate(ResearchStudyBase):
    pass


class ResearchStudyUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None  # DRAFT, PENDING_APPROVAL, APPROVED, PILOT, ACTIVE, CLOSED, ARCHIVED
    description: Optional[str] = None
    protocol_version: Optional[str] = None


class ResearchStudyRead(ResearchStudyBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Research Participant & Consent Schemas (Phase 3)
# ---------------------------------------------------------------------------

class ResearchParticipantCreate(BaseModel):
    study_id: int
    business_id: Optional[int] = None
    participant_code: str = Field(..., max_length=50, description="Pseudonymous participant code e.g. PID-IND-001")
    consent_status: str = Field(default="PENDING", max_length=30)
    consent_version: Optional[str] = None
    language: str = Field(default="en", max_length=10)
    respondent_role: str = Field(default="owner", max_length=50)


class ConsentUpdatePayload(BaseModel):
    consent_status: str = Field(..., max_length=30)  # CONSENTED, WITHDRAWN, DECLINED
    consent_version: Optional[str] = "1.0"
    withdrawal_reason: Optional[str] = None


class ResearchParticipantRead(BaseModel):
    id: int
    study_id: int
    business_id: Optional[int] = None
    participant_code: str
    consent_status: str
    consent_timestamp: Optional[datetime] = None
    consent_version: Optional[str] = None
    language: str
    respondent_role: str
    withdrawal_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Consultant / Rater Schemas (Phase 4)
# ---------------------------------------------------------------------------

class ConsultantProfileCreate(BaseModel):
    user_id: int
    rater_code: str = Field(..., max_length=50, description="Unique rater code e.g. EXP-001")
    professional_years_experience: int = Field(default=0, ge=0)
    sector_specialization: Optional[str] = None
    language_capabilities_json: Optional[List[str]] = None
    conflict_of_interest_declared: bool = False
    conflict_of_interest_details: Optional[str] = None


class ConsultantProfileRead(BaseModel):
    id: int
    user_id: int
    rater_code: str
    professional_years_experience: int
    sector_specialization: Optional[str] = None
    language_capabilities_json: Optional[List[str]] = None
    is_active: bool
    conflict_of_interest_declared: bool
    conflict_of_interest_details: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Blinded Evaluation Case Schemas (Phase 5 & 7)
# ---------------------------------------------------------------------------

class BlindedPacketCreate(BaseModel):
    study_id: int
    source_assessment_id: int
    packet_code: str = Field(..., max_length=50)
    packet_version: Optional[str] = "1.0"
    assigned_consultant_id: Optional[int] = None


class BlindedPacketRead(BaseModel):
    id: int
    study_id: int
    source_assessment_id: int
    packet_code: str
    packet_version: str
    randomized_order: int
    status: str
    assigned_consultant_id: Optional[int] = None
    sanitized_case_data_json: Dict[str, Any]
    assigned_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Consultant Evaluation Schemas (Phase 6)
# ---------------------------------------------------------------------------

class ConsultantEvaluationCreate(BaseModel):
    packet_id: int
    assigned_rbdl_level: int = Field(..., ge=0, le=4, description="Independent RBDL Level (0 to 4)")
    primary_gap_dimension: Optional[str] = Field(None, max_length=50)
    confidence_score: int = Field(default=3, ge=1, le=5)
    requirement_profile_ratings_json: Optional[Dict[str, Any]] = None
    recommendation_ratings_json: Optional[Dict[str, Any]] = None
    rationales: Optional[str] = None
    review_duration_seconds: Optional[int] = None


class ConsultantEvaluationRead(BaseModel):
    id: int
    packet_id: int
    consultant_user_id: int
    study_id: int
    assigned_rbdl_level: int
    primary_gap_dimension: Optional[str] = None
    confidence_score: int
    requirement_profile_ratings_json: Optional[Dict[str, Any]] = None
    recommendation_ratings_json: Optional[Dict[str, Any]] = None
    rationales: Optional[str] = None
    review_duration_seconds: Optional[int] = None
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Test-Retest Schemas (Phase 8)
# ---------------------------------------------------------------------------

class TestRetestLinkageCreate(BaseModel):
    study_id: int
    participant_id: Optional[int] = None
    baseline_assessment_id: int
    retest_assessment_id: int
    planned_interval_days: int = Field(default=14, ge=1)
    reassessment_reason: Optional[str] = None
    intervention_occurred: bool = False
    language: str = Field(default="en", max_length=10)


class TestRetestValidityUpdate(BaseModel):
    validity_status: str = Field(..., max_length=30)  # PENDING_REVIEW, VALID_FOR_RETEST, EXCLUDED
    exclusion_reason: Optional[str] = None


class TestRetestLinkageRead(BaseModel):
    id: int
    study_id: int
    participant_id: Optional[int] = None
    baseline_assessment_id: int
    retest_assessment_id: int
    planned_interval_days: int
    actual_interval_hours: Optional[float] = None
    reassessment_reason: Optional[str] = None
    intervention_occurred: bool
    instrument_version: str
    language: str
    validity_status: str
    exclusion_reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Recommendation Ablation Schemas (Phase 9)
# ---------------------------------------------------------------------------

class RecommendationAblationCreate(BaseModel):
    study_id: int
    assessment_id: int
    presentation_order: str = Field(default="MODEL_A_FIRST", max_length=30)
    arm_a_ratings_json: Optional[Dict[str, Any]] = None
    arm_b_ratings_json: Optional[Dict[str, Any]] = None
    preferred_arm: Optional[str] = None  # ARM_A, ARM_B, EQUAL
    evaluator_comments: Optional[str] = None


class RecommendationAblationRead(BaseModel):
    id: int
    study_id: int
    assessment_id: int
    evaluator_user_id: int
    presentation_order: str
    arm_a_recommendations_json: List[Dict[str, Any]]
    arm_b_recommendations_json: List[Dict[str, Any]]
    arm_a_ratings_json: Optional[Dict[str, Any]] = None
    arm_b_ratings_json: Optional[Dict[str, Any]] = None
    preferred_arm: Optional[str] = None
    evaluator_comments: Optional[str] = None
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Cognitive Interview & Language Validation Schemas (Phase 10 & 11)
# ---------------------------------------------------------------------------

class CognitiveInterviewCreate(BaseModel):
    study_id: int
    participant_code: str = Field(..., max_length=50)
    language: str = Field(default="hi", max_length=10)
    instrument_version: str = Field(default="1.0", max_length=20)
    interview_date: datetime
    interviewer_name: str = Field(..., max_length=100)
    item_code: str = Field(..., max_length=50)
    comprehension_issue: bool = False
    retrieval_issue: bool = False
    judgment_issue: bool = False
    response_issue: bool = False
    translation_drift_notes: Optional[str] = None
    interviewer_notes: Optional[str] = None
    resolution_status: str = Field(default="OBSERVED", max_length=30)


class CognitiveInterviewRead(CognitiveInterviewCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Comprehension Study Schemas (Phase 12)
# ---------------------------------------------------------------------------

class ComprehensionStudyCreate(BaseModel):
    study_id: int
    participant_code: str = Field(..., max_length=50)
    displayed_traceability_version: str = Field(default="1.0", max_length=30)
    comprehension_question_code: str = Field(..., max_length=50)
    expected_answer: str
    participant_answer: str
    is_correct: bool = False
    task_completion_time_seconds: Optional[int] = None
    usability_rating: Optional[int] = Field(None, ge=1, le=5)
    sus_responses_json: Optional[Dict[str, Any]] = None


class ComprehensionStudyRead(ComprehensionStudyCreate):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Research Experiment Schemas (Phase 13, 17, 18)
# ---------------------------------------------------------------------------

class ResearchExperimentCreate(BaseModel):
    study_id: int
    experiment_code: str = Field(..., max_length=50)  # E-01 to E-12
    title: str = Field(..., max_length=255)
    protocol_version: str = Field(default="1.0", max_length=20)
    experiment_type: str = Field(..., max_length=50)
    parameters_json: Optional[Dict[str, Any]] = None
    analysis_method: Optional[str] = None


class ResearchExperimentRead(ResearchExperimentCreate):
    id: int
    status: str
    analyst_user_id: Optional[int] = None
    execution_timestamp: Optional[datetime] = None
    code_commit_hash: Optional[str] = None
    result_artifact_uri: Optional[str] = None
    output_hash: Optional[str] = None
    metrics_summary_json: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Dataset Snapshot Schemas (Phase 14)
# ---------------------------------------------------------------------------

class ResearchDatasetSnapshotCreate(BaseModel):
    study_id: int
    snapshot_code: str = Field(..., max_length=50)
    dataset_version: str = Field(default="1.0", max_length=20)
    source_population_description: Optional[str] = None


class ResearchDatasetSnapshotRead(BaseModel):
    id: int
    study_id: int
    snapshot_code: str
    dataset_version: str
    source_population_description: Optional[str] = None
    record_count: int
    anonymization_status: str
    k_anonymity_achieved: Optional[int] = None
    instrument_version: str
    rbdl_version: str
    recommendation_version: str
    code_commit_hash: str
    checksum_sha256: str
    storage_path: Optional[str] = None
    status: str
    created_by_user_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Reproducibility Manifest Schemas (Phase 15)
# ---------------------------------------------------------------------------

class ReproducibilityManifestRecordRead(BaseModel):
    id: int
    study_id: Optional[int] = None
    manifest_code: str
    git_commit_hash: str
    application_version: str
    migration_version: str
    python_version: str
    platform: str
    database_dialect: str
    dependency_versions_json: Optional[Dict[str, str]] = None
    instrument_versions_json: Dict[str, Any]
    random_seed: Optional[int] = None
    manifest_sha256: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Research Export / Privacy Schemas (Phase 16)
# ---------------------------------------------------------------------------

class ResearchExportRequest(BaseModel):
    study_id: Optional[int] = None
    k_threshold: int = Field(default=5, ge=2, le=50, description="Configurable k threshold")
    generalize_location: bool = Field(default=True, description="Truncate pincode/district")
    coarsen_sectors: bool = Field(default=True, description="Coarsen to 2-digit groups")
    suppress_low_count_cells: bool = Field(default=True, description="Suppress bins where count < k")


class ResearchExportSummary(BaseModel):
    study_id: Optional[int] = None
    total_records: int
    exported_records: int
    suppressed_records: int
    k_threshold_requested: int
    k_anonymity_achieved: int
    is_k_anonymous: bool
    transformations_applied: List[str]
    export_hash_sha256: str
    data_preview: List[Dict[str, Any]]
