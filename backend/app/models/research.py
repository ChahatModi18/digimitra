"""Research Evaluation Infrastructure ORM Models (A11 / C8 Architecture).

Supports versioned research studies, decoupled participant consent,
blinded consultant evaluation packets, test-retest linkages, recommendation
ablation tracking, cognitive interview logs, comprehension experiments,
and dataset snapshots with reproducibility manifests.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, TYPE_CHECKING
from sqlalchemy import (
    BigInteger,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    SmallInteger,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.assessment import Assessment
    from app.models.business import Business
    from app.models.classification_result import ClassificationResult
    from app.models.rbdl_level import RBDLLevelModel
    from app.models.user import User


class ResearchEvaluationRecord(Base):
    """Comparative research evaluation record pairing rule-based and ML classifications."""

    __tablename__ = "research_evaluation_records"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    assessment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    rule_based_classification_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("classification_results.id", ondelete="SET NULL"), nullable=True, index=True
    )
    ml_classification_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("classification_results.id", ondelete="SET NULL"), nullable=True, index=True
    )
    levels_agree: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    consultant_corrected_level: Mapped[Optional[int]] = mapped_column(
        SmallInteger, ForeignKey("rbdl_levels.id", ondelete="RESTRICT"), nullable=True, index=True
    )
    corrected_by_user_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    corrected_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    assessment: Mapped["Assessment"] = relationship("Assessment", back_populates="research_records")
    rule_based_result: Mapped[Optional["ClassificationResult"]] = relationship(
        "ClassificationResult",
        foreign_keys=[rule_based_classification_id],
        back_populates="research_rule_records",
    )
    ml_result: Mapped[Optional["ClassificationResult"]] = relationship(
        "ClassificationResult",
        foreign_keys=[ml_classification_id],
        back_populates="research_ml_records",
    )
    corrected_level_rel: Mapped[Optional["RBDLLevelModel"]] = relationship(
        "RBDLLevelModel", back_populates="research_evaluation_records"
    )
    corrector: Mapped[Optional["User"]] = relationship("User", back_populates="research_corrections")


class ResearchStudy(Base):
    """Versioned research protocol and study registry."""

    __tablename__ = "research_studies"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    study_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    protocol_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="DRAFT", nullable=False, index=True
    )  # DRAFT, PENDING_APPROVAL, APPROVED, PILOT, ACTIVE, CLOSED, ARCHIVED
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    instrument_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    rbdl_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    question_bank_version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    requirement_profile_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    recommendation_rules_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    participants: Mapped[List["ResearchParticipant"]] = relationship(
        "ResearchParticipant", back_populates="study", cascade="all, delete-orphan"
    )
    blinded_packets: Mapped[List["BlindedEvaluationPacket"]] = relationship(
        "BlindedEvaluationPacket", back_populates="study", cascade="all, delete-orphan"
    )
    experiments: Mapped[List["ResearchExperiment"]] = relationship(
        "ResearchExperiment", back_populates="study", cascade="all, delete-orphan"
    )
    snapshots: Mapped[List["ResearchDatasetSnapshot"]] = relationship(
        "ResearchDatasetSnapshot", back_populates="study", cascade="all, delete-orphan"
    )


class ResearchParticipant(Base):
    """Pseudonymized research participant with decoupled consent metadata."""

    __tablename__ = "research_participants"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    study_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("research_studies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    business_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("businesses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    participant_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    consent_status: Mapped[str] = mapped_column(
        String(30), default="PENDING", nullable=False, index=True
    )  # NOT_REQUIRED, PENDING, CONSENTED, WITHDRAWN, DECLINED
    consent_timestamp: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    consent_version: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    respondent_role: Mapped[str] = mapped_column(String(50), default="owner", nullable=False)
    withdrawal_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    study: Mapped["ResearchStudy"] = relationship("ResearchStudy", back_populates="participants")
    business: Mapped[Optional["Business"]] = relationship("Business")


class ConsultantProfile(Base):
    """Rater and domain-expert consultant qualification profile."""

    __tablename__ = "consultant_profiles"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    rater_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    professional_years_experience: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sector_specialization: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    language_capabilities_json: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    conflict_of_interest_declared: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    conflict_of_interest_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship("User")


class BlindedEvaluationPacket(Base):
    """Sanitized evaluation packet hiding calculated levels, scores, and roadmaps."""

    __tablename__ = "blinded_evaluation_packets"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    study_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("research_studies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_assessment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    packet_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    packet_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    randomized_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(
        String(30), default="UNASSIGNED", nullable=False, index=True
    )  # UNASSIGNED, ASSIGNED, COMPLETED
    assigned_consultant_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    sanitized_case_data_json: Mapped[Dict[str, Any]] = mapped_column(
        JSON, nullable=False
    )  # Contains ONLY raw operational facts and question answers
    assigned_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    study: Mapped["ResearchStudy"] = relationship("ResearchStudy", back_populates="blinded_packets")
    assessment: Mapped["Assessment"] = relationship("Assessment")
    assigned_consultant: Mapped[Optional["User"]] = relationship("User")
    evaluations: Mapped[List["ConsultantEvaluation"]] = relationship(
        "ConsultantEvaluation", back_populates="packet", cascade="all, delete-orphan"
    )


class ConsultantEvaluation(Base):
    """Independent consultant evaluation of a blinded packet."""

    __tablename__ = "consultant_evaluations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    packet_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("blinded_evaluation_packets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    consultant_user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    study_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("research_studies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assigned_rbdl_level: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    primary_gap_dimension: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    confidence_score: Mapped[int] = mapped_column(SmallInteger, default=3, nullable=False)  # 1-5
    requirement_profile_ratings_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    recommendation_ratings_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    rationales: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    review_duration_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    packet: Mapped["BlindedEvaluationPacket"] = relationship("BlindedEvaluationPacket", back_populates="evaluations")
    consultant_user: Mapped["User"] = relationship("User")
    study: Mapped["ResearchStudy"] = relationship("ResearchStudy")


class TestRetestLinkage(Base):
    """Paired baseline and retest assessments for short-interval reliability."""

    __tablename__ = "test_retest_linkages"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    study_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("research_studies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    participant_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("research_participants.id", ondelete="CASCADE"), nullable=True, index=True
    )
    baseline_assessment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    retest_assessment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    planned_interval_days: Mapped[int] = mapped_column(Integer, default=14, nullable=False)
    actual_interval_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    reassessment_reason: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    intervention_occurred: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    instrument_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    validity_status: Mapped[str] = mapped_column(
        String(30), default="PENDING_REVIEW", nullable=False, index=True
    )  # PENDING_REVIEW, VALID_FOR_RETEST, EXCLUDED
    exclusion_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    study: Mapped["ResearchStudy"] = relationship("ResearchStudy")
    participant: Mapped[Optional["ResearchParticipant"]] = relationship("ResearchParticipant")
    baseline_assessment: Mapped["Assessment"] = relationship("Assessment", foreign_keys=[baseline_assessment_id])
    retest_assessment: Mapped["Assessment"] = relationship("Assessment", foreign_keys=[retest_assessment_id])


class RecommendationAblationEvaluation(Base):
    """Blinded paired comparison between Model A (RBDL-only) and Model B (Context-Enriched)."""

    __tablename__ = "recommendation_ablation_evaluations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    study_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("research_studies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assessment_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True
    )
    evaluator_user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    presentation_order: Mapped[str] = mapped_column(
        String(30), default="MODEL_A_FIRST", nullable=False
    )  # MODEL_A_FIRST, MODEL_B_FIRST
    arm_a_recommendations_json: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, nullable=False)
    arm_b_recommendations_json: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, nullable=False)
    arm_a_ratings_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON, nullable=True
    )  # relevance, feasibility, actionability, contextual_fit, budget_fit, unnecessary_burden
    arm_b_ratings_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    preferred_arm: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # ARM_A, ARM_B, EQUAL
    evaluator_comments: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    study: Mapped["ResearchStudy"] = relationship("ResearchStudy")
    assessment: Mapped["Assessment"] = relationship("Assessment")
    evaluator: Mapped["User"] = relationship("User")


class CognitiveInterviewRecord(Base):
    """Cognitive interview and think-aloud findings for E-06 and E-11."""

    __tablename__ = "cognitive_interview_records"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    study_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("research_studies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    participant_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    language: Mapped[str] = mapped_column(String(10), default="hi", nullable=False)
    instrument_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    interview_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    interviewer_name: Mapped[str] = mapped_column(String(100), nullable=False)
    item_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    comprehension_issue: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    retrieval_issue: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    judgment_issue: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    response_issue: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    translation_drift_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    interviewer_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    resolution_status: Mapped[str] = mapped_column(
        String(30), default="OBSERVED", nullable=False, index=True
    )  # OBSERVED, ANALYZED, ACTIONABLE_PROPOSED, REJECTED
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    study: Mapped["ResearchStudy"] = relationship("ResearchStudy")


class ComprehensionStudyRecord(Base):
    """Traceability and explanation comprehension records for E-07."""

    __tablename__ = "comprehension_study_records"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    study_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("research_studies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    participant_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    displayed_traceability_version: Mapped[str] = mapped_column(String(30), default="1.0", nullable=False)
    comprehension_question_code: Mapped[str] = mapped_column(String(50), nullable=False)
    expected_answer: Mapped[str] = mapped_column(Text, nullable=False)
    participant_answer: Mapped[str] = mapped_column(Text, nullable=False)
    is_correct: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    task_completion_time_seconds: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    usability_rating: Mapped[Optional[int]] = mapped_column(SmallInteger, nullable=True)  # 1 to 5
    sus_responses_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    study: Mapped["ResearchStudy"] = relationship("ResearchStudy")


class ResearchExperiment(Base):
    """Experiment registration and execution record for E-01 through E-12."""

    __tablename__ = "research_experiments"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    study_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("research_studies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    experiment_code: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True
    )  # E-01, E-02, E-03, ..., E-12
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    protocol_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    experiment_type: Mapped[str] = mapped_column(String(50), nullable=False)
    parameters_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    analysis_method: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    status: Mapped[str] = mapped_column(
        String(30), default="CONFIGURED", nullable=False, index=True
    )  # CONFIGURED, RUNNING, COMPLETED, ARCHIVED
    analyst_user_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    execution_timestamp: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    code_commit_hash: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    result_artifact_uri: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    output_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    metrics_summary_json: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    study: Mapped["ResearchStudy"] = relationship("ResearchStudy", back_populates="experiments")
    analyst: Mapped[Optional["User"]] = relationship("User")


class ResearchDatasetSnapshot(Base):
    """Immutable point-in-time research dataset snapshot."""

    __tablename__ = "research_dataset_snapshots"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    study_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("research_studies.id", ondelete="CASCADE"), nullable=False, index=True
    )
    snapshot_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    dataset_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    source_population_description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    record_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    anonymization_status: Mapped[str] = mapped_column(
        String(30), default="PSEUDONYMIZED", nullable=False, index=True
    )  # RAW_RESEARCH, PSEUDONYMIZED, K_ANONYMIZED
    k_anonymity_achieved: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    instrument_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    rbdl_version: Mapped[str] = mapped_column(String(20), default="1.0", nullable=False)
    recommendation_version: Mapped[str] = mapped_column(String(50), default="1.0", nullable=False)
    code_commit_hash: Mapped[str] = mapped_column(String(50), nullable=False)
    checksum_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    storage_path: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        String(30), default="DRAFT", nullable=False, index=True
    )  # DRAFT, APPROVED, LOCKED, SUPERSEDED
    created_by_user_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    study: Mapped["ResearchStudy"] = relationship("ResearchStudy", back_populates="snapshots")
    creator: Mapped[Optional["User"]] = relationship("User")


class ReproducibilityManifestRecord(Base):
    """Archived reproducibility environment and calculation manifest."""

    __tablename__ = "reproducibility_manifests"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True, index=True)
    study_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("research_studies.id", ondelete="SET NULL"), nullable=True, index=True
    )
    manifest_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    git_commit_hash: Mapped[str] = mapped_column(String(50), nullable=False)
    application_version: Mapped[str] = mapped_column(String(50), nullable=False)
    migration_version: Mapped[str] = mapped_column(String(50), nullable=False)
    python_version: Mapped[str] = mapped_column(String(50), nullable=False)
    platform: Mapped[str] = mapped_column(String(100), nullable=False)
    database_dialect: Mapped[str] = mapped_column(String(30), nullable=False)
    dependency_versions_json: Mapped[Optional[Dict[str, str]]] = mapped_column(JSON, nullable=True)
    instrument_versions_json: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    random_seed: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    manifest_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    study: Mapped[Optional["ResearchStudy"]] = relationship("ResearchStudy")
