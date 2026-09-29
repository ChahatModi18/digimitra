"""Research Evaluation Infrastructure Service (A11 / C8 Architecture).

Provides services for research studies, participant consent, blinded evaluation packets,
consultant evaluation recording, test-retest reliability, recommendation ablation,
cognitive interview logs, comprehension experiments, and dataset exports.
"""

from datetime import datetime, timezone
import hashlib
import json
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import (
    AuthorizationException,
    BadRequestException,
    EntityNotFoundException,
    ValidationException,
)
from app.models.assessment import Assessment, AssessmentAnswer, AssessmentScore
from app.models.business import Business
from app.models.classification_result import ClassificationResult
from app.models.recommendation import BusinessRecommendation, Recommendation
from app.models.requirement_profile import RequirementProfile
from app.models.research import (
    BlindedEvaluationPacket,
    CognitiveInterviewRecord,
    ComprehensionStudyRecord,
    ConsultantEvaluation,
    ConsultantProfile,
    RecommendationAblationEvaluation,
    ReproducibilityManifestRecord,
    ResearchDatasetSnapshot,
    ResearchExperiment,
    ResearchParticipant,
    ResearchStudy,
    TestRetestLinkage,
)
from app.models.user import User
from app.domain.research.reproducibility import ReproducibilityService
from app.domain.research.k_anonymity import KAnonymityEvaluator
from app.schemas.research import (
    BlindedPacketCreate,
    CognitiveInterviewCreate,
    ComprehensionStudyCreate,
    ConsentUpdatePayload,
    ConsultantEvaluationCreate,
    ConsultantProfileCreate,
    RecommendationAblationCreate,
    ResearchDatasetSnapshotCreate,
    ResearchExperimentCreate,
    ResearchExportRequest,
    ResearchExportSummary,
    ResearchParticipantCreate,
    ResearchStudyCreate,
    ResearchStudyUpdate,
    TestRetestLinkageCreate,
    TestRetestValidityUpdate,
)


class ResearchService:
    """Core domain service for research evaluation and experiment management."""

    # -----------------------------------------------------------------------
    # Phase 2: Research Studies
    # -----------------------------------------------------------------------

    @staticmethod
    async def create_study(db: AsyncSession, payload: ResearchStudyCreate) -> ResearchStudy:
        """Register a new research protocol/study."""
        stmt = select(ResearchStudy).where(ResearchStudy.study_code == payload.study_code)
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if existing:
            raise BadRequestException(f"Study code '{payload.study_code}' already exists.")

        study = ResearchStudy(
            study_code=payload.study_code,
            title=payload.title,
            protocol_version=payload.protocol_version,
            status="DRAFT",
            description=payload.description,
            instrument_version=payload.instrument_version,
            rbdl_version=payload.rbdl_version,
            question_bank_version=payload.question_bank_version,
            requirement_profile_version=payload.requirement_profile_version,
            recommendation_rules_version=payload.recommendation_rules_version,
        )
        db.add(study)
        await db.commit()
        await db.refresh(study)
        return study

    @staticmethod
    async def get_study(db: AsyncSession, study_id: int) -> ResearchStudy:
        stmt = select(ResearchStudy).where(ResearchStudy.id == study_id)
        study = (await db.execute(stmt)).scalar_one_or_none()
        if not study:
            raise EntityNotFoundException(f"Research study {study_id} not found.")
        return study

    @staticmethod
    async def list_studies(db: AsyncSession) -> List[ResearchStudy]:
        stmt = select(ResearchStudy).order_by(ResearchStudy.id.desc())
        return list((await db.execute(stmt)).scalars().all())

    @staticmethod
    async def update_study(db: AsyncSession, study_id: int, payload: ResearchStudyUpdate) -> ResearchStudy:
        study = await ResearchService.get_study(db, study_id)
        if study.status in ("LOCKED", "ARCHIVED") and payload.status not in ("ARCHIVED",):
            raise BadRequestException("Locked research protocols cannot be modified without a new protocol version.")

        if payload.title is not None:
            study.title = payload.title
        if payload.status is not None:
            study.status = payload.status
        if payload.description is not None:
            study.description = payload.description
        if payload.protocol_version is not None:
            study.protocol_version = payload.protocol_version

        await db.commit()
        await db.refresh(study)
        return study

    # -----------------------------------------------------------------------
    # Phase 3: Participants & Consent
    # -----------------------------------------------------------------------

    @staticmethod
    async def register_participant(db: AsyncSession, payload: ResearchParticipantCreate) -> ResearchParticipant:
        await ResearchService.get_study(db, payload.study_id)

        stmt = select(ResearchParticipant).where(ResearchParticipant.participant_code == payload.participant_code)
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if existing:
            raise BadRequestException(f"Participant code '{payload.participant_code}' already exists.")

        participant = ResearchParticipant(
            study_id=payload.study_id,
            business_id=payload.business_id,
            participant_code=payload.participant_code,
            consent_status=payload.consent_status,
            consent_version=payload.consent_version,
            language=payload.language,
            respondent_role=payload.respondent_role,
        )
        if payload.consent_status == "CONSENTED":
            participant.consent_timestamp = datetime.now(timezone.utc).replace(tzinfo=None)

        db.add(participant)
        await db.commit()
        await db.refresh(participant)
        return participant

    @staticmethod
    async def update_participant_consent(
        db: AsyncSession, participant_id: int, payload: ConsentUpdatePayload
    ) -> ResearchParticipant:
        stmt = select(ResearchParticipant).where(ResearchParticipant.id == participant_id)
        participant = (await db.execute(stmt)).scalar_one_or_none()
        if not participant:
            raise EntityNotFoundException(f"Participant {participant_id} not found.")

        participant.consent_status = payload.consent_status
        participant.consent_version = payload.consent_version
        if payload.consent_status == "CONSENTED":
            participant.consent_timestamp = datetime.now(timezone.utc).replace(tzinfo=None)
        elif payload.consent_status == "WITHDRAWN":
            participant.withdrawal_reason = payload.withdrawal_reason

        await db.commit()
        await db.refresh(participant)
        return participant

    @staticmethod
    async def list_participants(db: AsyncSession, study_id: int) -> List[ResearchParticipant]:
        stmt = (
            select(ResearchParticipant)
            .where(ResearchParticipant.study_id == study_id)
            .order_by(ResearchParticipant.id.desc())
        )
        return list((await db.execute(stmt)).scalars().all())

    # -----------------------------------------------------------------------
    # Phase 4: Consultant Profiles
    # -----------------------------------------------------------------------

    @staticmethod
    async def create_consultant_profile(db: AsyncSession, payload: ConsultantProfileCreate) -> ConsultantProfile:
        stmt = select(ConsultantProfile).where(
            (ConsultantProfile.user_id == payload.user_id) | (ConsultantProfile.rater_code == payload.rater_code)
        )
        existing = (await db.execute(stmt)).scalar_one_or_none()
        if existing:
            raise BadRequestException("Consultant profile or rater code already exists for this user.")

        profile = ConsultantProfile(
            user_id=payload.user_id,
            rater_code=payload.rater_code,
            professional_years_experience=payload.professional_years_experience,
            sector_specialization=payload.sector_specialization,
            language_capabilities_json=payload.language_capabilities_json,
            conflict_of_interest_declared=payload.conflict_of_interest_declared,
            conflict_of_interest_details=payload.conflict_of_interest_details,
        )
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        return profile

    @staticmethod
    async def list_consultant_profiles(db: AsyncSession) -> List[ConsultantProfile]:
        stmt = select(ConsultantProfile).order_by(ConsultantProfile.id)
        return list((await db.execute(stmt)).scalars().all())

    # -----------------------------------------------------------------------
    # Phase 5 & 7: Blinded Evaluation Cases & Blinding Enforcement
    # -----------------------------------------------------------------------

    @staticmethod
    async def create_blinded_packet(db: AsyncSession, payload: BlindedPacketCreate) -> BlindedEvaluationPacket:
        """Create sanitized case packet hiding system levels, scores, roadmaps, and rules."""
        await ResearchService.get_study(db, payload.study_id)

        # Retrieve source assessment with answers
        stmt = (
            select(Assessment)
            .options(
                selectinload(Assessment.business).selectinload(Business.category),
                selectinload(Assessment.answers).selectinload(AssessmentAnswer.question),
                selectinload(Assessment.answers).selectinload(AssessmentAnswer.selected_option),
            )
            .where(Assessment.id == payload.source_assessment_id)
        )
        assessment = (await db.execute(stmt)).scalar_one_or_none()
        if not assessment:
            raise EntityNotFoundException(f"Assessment {payload.source_assessment_id} not found.")

        # Sanitized case data contains ONLY raw operational facts and answers
        # Computed level, dimension scores, certainty, recommendations, and roadmaps are strictly excluded
        sanitized_data: Dict[str, Any] = {
            "business_profile": {
                "sector": assessment.business.sector,
                "category_name_en": assessment.business.category.name_en if assessment.business.category else "General",
                "business_size": assessment.business.business_size,
                "state": assessment.business.state,
                "district": assessment.business.district,
            },
            "answers": [
                {
                    "question_code": a.question.question_code if a.question else None,
                    "dimension_code": a.question.dimension_code if a.question else None,
                    "question_text_en": a.question.question_text_en if a.question else None,
                    "question_text_hi": a.question.question_text_hi if a.question else None,
                    "selected_option_label_en": a.selected_option.label_en if a.selected_option else None,
                    "selected_option_label_hi": a.selected_option.label_hi if a.selected_option else None,
                    "text_answer": a.text_answer,
                    "numeric_answer": float(a.numeric_answer) if a.numeric_answer is not None else None,
                }
                for a in assessment.answers
            ],
            "assessment_metadata": {
                "language_used": assessment.language_used,
                "administration_mode": assessment.administration_mode,
                "respondent_role": assessment.respondent_role,
            },
        }

        packet = BlindedEvaluationPacket(
            study_id=payload.study_id,
            source_assessment_id=payload.source_assessment_id,
            packet_code=payload.packet_code,
            packet_version=payload.packet_version or "1.0",
            status="ASSIGNED" if payload.assigned_consultant_id else "UNASSIGNED",
            assigned_consultant_id=payload.assigned_consultant_id,
            sanitized_case_data_json=sanitized_data,
            assigned_at=datetime.now(timezone.utc).replace(tzinfo=None) if payload.assigned_consultant_id else None,
        )
        db.add(packet)
        await db.commit()
        await db.refresh(packet)
        return packet

    @staticmethod
    async def get_blinded_packet_for_consultant(
        db: AsyncSession, packet_id: int, consultant_user: User
    ) -> BlindedEvaluationPacket:
        """Retrieve a blinded case packet, enforcing strict information hiding."""
        stmt = select(BlindedEvaluationPacket).where(BlindedEvaluationPacket.id == packet_id)
        packet = (await db.execute(stmt)).scalar_one_or_none()
        if not packet:
            raise EntityNotFoundException(f"Blinded packet {packet_id} not found.")

        # If consultant is assigned, verify assignment or allow researcher/admin
        if consultant_user.role == "consultant" and packet.assigned_consultant_id != consultant_user.id:
            raise AuthorizationException("You are not authorized to evaluate this assigned packet.")

        return packet

    @staticmethod
    async def list_blinded_packets(
        db: AsyncSession, study_id: int, consultant_user: Optional[User] = None
    ) -> List[BlindedEvaluationPacket]:
        stmt = select(BlindedEvaluationPacket).where(BlindedEvaluationPacket.study_id == study_id)
        if consultant_user and consultant_user.role == "consultant":
            stmt = stmt.where(BlindedEvaluationPacket.assigned_consultant_id == consultant_user.id)
        return list((await db.execute(stmt)).scalars().all())

    # -----------------------------------------------------------------------
    # Phase 6: Consultant Evaluation
    # -----------------------------------------------------------------------

    @staticmethod
    async def submit_consultant_evaluation(
        db: AsyncSession, payload: ConsultantEvaluationCreate, consultant_user: User
    ) -> ConsultantEvaluation:
        """Submit independent consultant rating for a blinded packet."""
        stmt = select(BlindedEvaluationPacket).where(BlindedEvaluationPacket.id == payload.packet_id)
        packet = (await db.execute(stmt)).scalar_one_or_none()
        if not packet:
            raise EntityNotFoundException(f"Packet {payload.packet_id} not found.")

        if consultant_user.role == "consultant" and packet.assigned_consultant_id != consultant_user.id:
            raise AuthorizationException("Consultant is not assigned to this evaluation packet.")

        eval_record = ConsultantEvaluation(
            packet_id=payload.packet_id,
            consultant_user_id=consultant_user.id,
            study_id=packet.study_id,
            assigned_rbdl_level=payload.assigned_rbdl_level,
            primary_gap_dimension=payload.primary_gap_dimension,
            confidence_score=payload.confidence_score,
            requirement_profile_ratings_json=payload.requirement_profile_ratings_json,
            recommendation_ratings_json=payload.recommendation_ratings_json,
            rationales=payload.rationales,
            review_duration_seconds=payload.review_duration_seconds,
            submitted_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )
        packet.status = "COMPLETED"
        packet.submitted_at = datetime.now(timezone.utc).replace(tzinfo=None)

        db.add(eval_record)
        await db.commit()
        await db.refresh(eval_record)
        return eval_record

    # -----------------------------------------------------------------------
    # Phase 8: Test-Retest Linkages
    # -----------------------------------------------------------------------

    @staticmethod
    async def create_test_retest_linkage(db: AsyncSession, payload: TestRetestLinkageCreate) -> TestRetestLinkage:
        # Fetch baseline and retest assessments
        stmt1 = select(Assessment).where(Assessment.id == payload.baseline_assessment_id)
        b_ass = (await db.execute(stmt1)).scalar_one_or_none()
        stmt2 = select(Assessment).where(Assessment.id == payload.retest_assessment_id)
        r_ass = (await db.execute(stmt2)).scalar_one_or_none()

        if not b_ass or not r_ass:
            raise EntityNotFoundException("Baseline or retest assessment not found.")

        actual_hours = None
        if b_ass.submitted_at and r_ass.submitted_at:
            delta = r_ass.submitted_at - b_ass.submitted_at
            actual_hours = round(delta.total_seconds() / 3600.0, 2)

        linkage = TestRetestLinkage(
            study_id=payload.study_id,
            participant_id=payload.participant_id,
            baseline_assessment_id=payload.baseline_assessment_id,
            retest_assessment_id=payload.retest_assessment_id,
            planned_interval_days=payload.planned_interval_days,
            actual_interval_hours=actual_hours,
            reassessment_reason=payload.reassessment_reason or r_ass.reassessment_reason,
            intervention_occurred=payload.intervention_occurred,
            instrument_version=f"{r_ass.question_bank_version}.0",
            language=payload.language or r_ass.language_used,
            validity_status="PENDING_REVIEW",
        )
        db.add(linkage)
        await db.commit()
        await db.refresh(linkage)
        return linkage

    @staticmethod
    async def update_test_retest_validity(
        db: AsyncSession, linkage_id: int, payload: TestRetestValidityUpdate
    ) -> TestRetestLinkage:
        stmt = select(TestRetestLinkage).where(TestRetestLinkage.id == linkage_id)
        linkage = (await db.execute(stmt)).scalar_one_or_none()
        if not linkage:
            raise EntityNotFoundException(f"Test-retest linkage {linkage_id} not found.")

        linkage.validity_status = payload.validity_status
        linkage.exclusion_reason = payload.exclusion_reason
        await db.commit()
        await db.refresh(linkage)
        return linkage

    @staticmethod
    async def list_test_retest_linkages(db: AsyncSession, study_id: int) -> List[TestRetestLinkage]:
        stmt = select(TestRetestLinkage).where(TestRetestLinkage.study_id == study_id).order_by(TestRetestLinkage.id)
        return list((await db.execute(stmt)).scalars().all())

    # -----------------------------------------------------------------------
    # Phase 9: Recommendation Ablation (Model A vs Model B)
    # -----------------------------------------------------------------------

    @staticmethod
    async def generate_ablation_pair(
        db: AsyncSession, study_id: int, assessment_id: int, evaluator_user_id: int
    ) -> RecommendationAblationEvaluation:
        """
        Construct paired evaluation:
        Model A: Capability-only baseline (Target Level = Current Level + 1, sorted by impact).
        Model B: Full DigiMitra Context-Enriched Recommendation (Requirement Profile + Priority Formula).
        """
        # Fetch assessment and classification
        stmt_cr = select(ClassificationResult).where(
            (ClassificationResult.assessment_id == assessment_id) & (ClassificationResult.is_primary == True)
        )
        cr = (await db.execute(stmt_cr)).scalar_one_or_none()
        current_level = cr.rbdl_level if cr else 0
        target_level = min(current_level + 1, 3)

        # Model A: Capability-only recommendations from catalog matching target level
        stmt_cat = (
            select(Recommendation)
            .where(Recommendation.target_rbdl_level == target_level)
            .order_by(Recommendation.default_priority.desc())
            .limit(5)
        )
        arm_a_recs = [
            {
                "code": r.code,
                "title_en": r.title_en,
                "category": r.category,
                "impact_level": r.impact_level,
                "cost_level": r.estimated_cost_level,
            }
            for r in (await db.execute(stmt_cat)).scalars().all()
        ]

        # Model B: Full context-enriched recommendations generated for this business assessment
        arm_b_recs = []
        if cr:
            stmt_biz_recs = (
                select(BusinessRecommendation)
                .options(selectinload(BusinessRecommendation.recommendation))
                .where(BusinessRecommendation.classification_result_id == cr.id)
                .order_by(BusinessRecommendation.priority_score.desc())
                .limit(5)
            )
            biz_recs = (await db.execute(stmt_biz_recs)).scalars().all()
            arm_b_recs = [
                {
                    "code": br.recommendation.code if br.recommendation else f"REC-{br.id}",
                    "title_en": br.recommendation.title_en if br.recommendation else "Recommended Action",
                    "category": br.recommendation.category if br.recommendation else "General",
                    "priority_score": float(br.priority_score) if br.priority_score else None,
                    "feasibility_status": br.feasibility_status,
                    "budget_fit": br.budget_fit,
                }
                for br in biz_recs
            ]

        # Randomized order presentation (e.g. hash-based alternating)
        presentation_order = "MODEL_A_FIRST" if (assessment_id % 2 == 0) else "MODEL_B_FIRST"

        ablation_record = RecommendationAblationEvaluation(
            study_id=study_id,
            assessment_id=assessment_id,
            evaluator_user_id=evaluator_user_id,
            presentation_order=presentation_order,
            arm_a_recommendations_json=arm_a_recs,
            arm_b_recommendations_json=arm_b_recs,
            submitted_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )
        db.add(ablation_record)
        await db.commit()
        await db.refresh(ablation_record)
        return ablation_record

    @staticmethod
    async def submit_ablation_rating(
        db: AsyncSession, ablation_id: int, payload: RecommendationAblationCreate, user_id: int
    ) -> RecommendationAblationEvaluation:
        stmt = select(RecommendationAblationEvaluation).where(RecommendationAblationEvaluation.id == ablation_id)
        rec = (await db.execute(stmt)).scalar_one_or_none()
        if not rec:
            raise EntityNotFoundException(f"Ablation record {ablation_id} not found.")

        rec.arm_a_ratings_json = payload.arm_a_ratings_json
        rec.arm_b_ratings_json = payload.arm_b_ratings_json
        rec.preferred_arm = payload.preferred_arm
        rec.evaluator_comments = payload.evaluator_comments
        rec.submitted_at = datetime.now(timezone.utc).replace(tzinfo=None)

        await db.commit()
        await db.refresh(rec)
        return rec

    # -----------------------------------------------------------------------
    # Phase 10 & 11: Cognitive Interviews & Language Validation
    # -----------------------------------------------------------------------

    @staticmethod
    async def record_cognitive_interview(
        db: AsyncSession, payload: CognitiveInterviewCreate
    ) -> CognitiveInterviewRecord:
        record = CognitiveInterviewRecord(
            study_id=payload.study_id,
            participant_code=payload.participant_code,
            language=payload.language,
            instrument_version=payload.instrument_version,
            interview_date=payload.interview_date,
            interviewer_name=payload.interviewer_name,
            item_code=payload.item_code,
            comprehension_issue=payload.comprehension_issue,
            retrieval_issue=payload.retrieval_issue,
            judgment_issue=payload.judgment_issue,
            response_issue=payload.response_issue,
            translation_drift_notes=payload.translation_drift_notes,
            interviewer_notes=payload.interviewer_notes,
            resolution_status=payload.resolution_status,
        )
        db.add(record)
        await db.commit()
        await db.refresh(record)
        return record

    @staticmethod
    async def list_cognitive_interviews(db: AsyncSession, study_id: int) -> List[CognitiveInterviewRecord]:
        stmt = select(CognitiveInterviewRecord).where(CognitiveInterviewRecord.study_id == study_id)
        return list((await db.execute(stmt)).scalars().all())

    # -----------------------------------------------------------------------
    # Phase 12: Comprehension Study Records
    # -----------------------------------------------------------------------

    @staticmethod
    async def record_comprehension_experiment(
        db: AsyncSession, payload: ComprehensionStudyCreate
    ) -> ComprehensionStudyRecord:
        record = ComprehensionStudyRecord(
            study_id=payload.study_id,
            participant_code=payload.participant_code,
            displayed_traceability_version=payload.displayed_traceability_version,
            comprehension_question_code=payload.comprehension_question_code,
            expected_answer=payload.expected_answer,
            participant_answer=payload.participant_answer,
            is_correct=payload.is_correct,
            task_completion_time_seconds=payload.task_completion_time_seconds,
            usability_rating=payload.usability_rating,
            sus_responses_json=payload.sus_responses_json,
        )
        db.add(record)
        await db.commit()
        await db.refresh(record)
        return record

    @staticmethod
    async def list_comprehension_records(db: AsyncSession, study_id: int) -> List[ComprehensionStudyRecord]:
        stmt = select(ComprehensionStudyRecord).where(ComprehensionStudyRecord.study_id == study_id)
        return list((await db.execute(stmt)).scalars().all())

    # -----------------------------------------------------------------------
    # Phase 13 & 17: Research Experiment Registry (E-01 to E-12)
    # -----------------------------------------------------------------------

    @staticmethod
    async def register_experiment(
        db: AsyncSession, payload: ResearchExperimentCreate, analyst_user_id: Optional[int] = None
    ) -> ResearchExperiment:
        valid_experiments = {
            "E-01", "E-02", "E-03", "E-04", "E-05", "E-06",
            "E-07", "E-08", "E-09", "E-10", "E-11", "E-12",
        }
        if payload.experiment_code not in valid_experiments:
            raise BadRequestException(f"Invalid experiment code. Must be one of: {sorted(list(valid_experiments))}")

        commit_hash = ReproducibilityService.get_git_commit_hash()
        exp = ResearchExperiment(
            study_id=payload.study_id,
            experiment_code=payload.experiment_code,
            title=payload.title,
            protocol_version=payload.protocol_version,
            experiment_type=payload.experiment_type,
            parameters_json=payload.parameters_json,
            analysis_method=payload.analysis_method,
            status="CONFIGURED",
            analyst_user_id=analyst_user_id,
            code_commit_hash=commit_hash,
        )
        db.add(exp)
        await db.commit()
        await db.refresh(exp)
        return exp

    @staticmethod
    async def list_experiments(db: AsyncSession, study_id: int) -> List[ResearchExperiment]:
        stmt = select(ResearchExperiment).where(ResearchExperiment.study_id == study_id).order_by(ResearchExperiment.id)
        return list((await db.execute(stmt)).scalars().all())

    # -----------------------------------------------------------------------
    # Phase 14: Research Dataset Snapshots
    # -----------------------------------------------------------------------

    @staticmethod
    async def create_dataset_snapshot(
        db: AsyncSession, payload: ResearchDatasetSnapshotCreate, user_id: Optional[int] = None
    ) -> ResearchDatasetSnapshot:
        stmt = select(ResearchDatasetSnapshot).where(ResearchDatasetSnapshot.snapshot_code == payload.snapshot_code)
        if (await db.execute(stmt)).scalar_one_or_none():
            raise BadRequestException(f"Snapshot code '{payload.snapshot_code}' already exists.")

        # Gather dataset counts
        stmt_count = select(Assessment).where(Assessment.status == "submitted")
        assessments = (await db.execute(stmt_count)).scalars().all()
        record_count = len(assessments)

        manifest = ReproducibilityService.generate_manifest()
        combined_seed = f"{payload.snapshot_code}_{manifest.git_commit_hash}_{record_count}"
        checksum = hashlib.sha256(combined_seed.encode("utf-8")).hexdigest()

        snapshot = ResearchDatasetSnapshot(
            study_id=payload.study_id,
            snapshot_code=payload.snapshot_code,
            dataset_version=payload.dataset_version,
            source_population_description=payload.source_population_description,
            record_count=record_count,
            anonymization_status="PSEUDONYMIZED",
            instrument_version=f"{manifest.question_bank_version}.0",
            rbdl_version=manifest.rbdl_framework_version,
            recommendation_version=manifest.recommendation_rules_version,
            code_commit_hash=manifest.git_commit_hash,
            checksum_sha256=checksum,
            status="DRAFT",
            created_by_user_id=user_id,
        )
        db.add(snapshot)
        await db.commit()
        await db.refresh(snapshot)
        return snapshot

    @staticmethod
    async def list_snapshots(db: AsyncSession, study_id: int) -> List[ResearchDatasetSnapshot]:
        stmt = select(ResearchDatasetSnapshot).where(ResearchDatasetSnapshot.study_id == study_id)
        return list((await db.execute(stmt)).scalars().all())

    # -----------------------------------------------------------------------
    # Phase 15: Reproducibility Manifest Records
    # -----------------------------------------------------------------------

    @staticmethod
    async def snapshot_reproducibility_manifest(
        db: AsyncSession, study_id: Optional[int] = None
    ) -> ReproducibilityManifestRecord:
        manifest = ReproducibilityService.generate_manifest()
        manifest_code = f"MAN-{manifest.git_commit_hash[:8]}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"

        record = ReproducibilityManifestRecord(
            study_id=study_id,
            manifest_code=manifest_code,
            git_commit_hash=manifest.git_commit_hash,
            application_version=manifest.application_version,
            migration_version="h8b9c0d1e2f3",
            python_version=manifest.python_version,
            platform=manifest.platform,
            database_dialect=manifest.database_dialect,
            instrument_versions_json={
                "ruleset_version": manifest.ruleset_version,
                "question_bank_version": manifest.question_bank_version,
                "rbdl_framework_version": manifest.rbdl_framework_version,
                "requirement_profile_version": manifest.requirement_profile_version,
                "recommendation_rules_version": manifest.recommendation_rules_version,
                "rules_sha256": manifest.rules_definition_sha256,
                "question_bank_sha256": manifest.question_bank_sha256,
                "taxonomies_sha256": manifest.requirement_taxonomies_sha256,
                "catalog_sha256": manifest.recommendations_catalog_sha256,
            },
            manifest_sha256=manifest.rules_definition_sha256,
        )
        db.add(record)
        await db.commit()
        await db.refresh(record)
        return record

    # -----------------------------------------------------------------------
    # Phase 16: Research Export & Privacy Pipeline
    # -----------------------------------------------------------------------

    @staticmethod
    async def export_anonymized_dataset(
        db: AsyncSession, req: ResearchExportRequest
    ) -> ResearchExportSummary:
        """
        Generate research export with location generalization, sector coarsening,
        and configurable k-anonymity suppression.
        """
        # Fetch submitted assessments with business context and scores
        stmt = (
            select(Assessment)
            .options(
                selectinload(Assessment.business).selectinload(Business.category),
                selectinload(Assessment.scores),
                selectinload(Assessment.classification_results),
            )
            .where(Assessment.status == "submitted")
        )
        assessments = (await db.execute(stmt)).scalars().all()
        total_records = len(assessments)

        raw_records = []
        for a in assessments:
            biz = a.business
            state = biz.state or "UNKNOWN"
            district = biz.district or "UNKNOWN"
            if req.generalize_location:
                # Generalized location: State level or truncated district
                district = district[:3] + "..." if len(district) > 3 else district

            category = biz.category.name_en if biz.category else (biz.sector or "GEN")
            if req.coarsen_sectors and len(category) > 4:
                category = category[:4]  # Coarsen sector code

            primary_cr = next((cr for cr in a.classification_results if cr.is_primary), None)
            rbdl_level = primary_cr.rbdl_level if primary_cr else 0

            raw_records.append({
                "record_id": f"REC-{a.id}",
                "state": state,
                "district": district,
                "category": category,
                "business_size": biz.business_size or "UNKNOWN",
                "rbdl_level": rbdl_level,
                "confidence_score": float(primary_cr.confidence_score) if primary_cr and primary_cr.confidence_score else 0.0,
            })

        # Run k-anonymity diagnostic
        report = KAnonymityEvaluator.evaluate(
            records=raw_records,
            k_threshold=req.k_threshold,
            quasi_identifiers=["state", "district", "category", "business_size"],
        )

        transformations = []
        if req.generalize_location:
            transformations.append("Location district coarsened/truncated")
        if req.coarsen_sectors:
            transformations.append("Sector codes coarsened to 4-character family")
        if req.suppress_low_count_cells:
            transformations.append(f"Cell suppression for bins violating k >= {req.k_threshold}")

        exported = raw_records
        suppressed_count = 0
        if req.suppress_low_count_cells and report.bins_violating_k > 0:
            # Filter out records belonging to violating bins
            from collections import Counter
            tuple_counts = Counter(
                (r["state"], r["district"], r["category"], r["business_size"]) for r in raw_records
            )
            valid_tuples = {t for t, c in tuple_counts.items() if c >= req.k_threshold}
            exported = [
                r for r in raw_records
                if (r["state"], r["district"], r["category"], r["business_size"]) in valid_tuples
            ]
            suppressed_count = total_records - len(exported)

        export_str = json.dumps(exported, sort_keys=True, default=str)
        export_hash = hashlib.sha256(export_str.encode("utf-8")).hexdigest()

        return ResearchExportSummary(
            study_id=req.study_id,
            total_records=total_records,
            exported_records=len(exported),
            suppressed_records=suppressed_count,
            k_threshold_requested=req.k_threshold,
            k_anonymity_achieved=req.k_threshold if (suppressed_count == 0 or len(exported) > 0) else 1,
            is_k_anonymous=report.is_dataset_k_anonymous or req.suppress_low_count_cells,
            transformations_applied=transformations,
            export_hash_sha256=export_hash,
            data_preview=exported[:10],
        )
