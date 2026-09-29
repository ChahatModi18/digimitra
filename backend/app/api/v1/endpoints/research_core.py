"""Core Research Evaluation REST API Endpoints (A11 / C8 Architecture).

Provides authenticated endpoints for research studies, participant consent,
blinded consultant evaluations, test-retest reliability, recommendation ablation,
cognitive interviews, comprehension experiments, snapshots, manifests, and exports.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import UserRole
from app.dependencies import get_db, require_roles
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.research import (
    BlindedPacketCreate,
    BlindedPacketRead,
    CognitiveInterviewCreate,
    CognitiveInterviewRead,
    ComprehensionStudyCreate,
    ComprehensionStudyRead,
    ConsentUpdatePayload,
    ConsultantEvaluationCreate,
    ConsultantEvaluationRead,
    ConsultantProfileCreate,
    ConsultantProfileRead,
    RecommendationAblationCreate,
    RecommendationAblationRead,
    ReproducibilityManifestRecordRead,
    ResearchDatasetSnapshotCreate,
    ResearchDatasetSnapshotRead,
    ResearchExperimentCreate,
    ResearchExperimentRead,
    ResearchExportRequest,
    ResearchExportSummary,
    ResearchParticipantCreate,
    ResearchParticipantRead,
    ResearchStudyCreate,
    ResearchStudyRead,
    ResearchStudyUpdate,
    TestRetestLinkageCreate,
    TestRetestLinkageRead,
    TestRetestValidityUpdate,
)
from app.services.research_service import ResearchService

router = APIRouter(prefix="/research", tags=["Research Infrastructure"])


# ---------------------------------------------------------------------------
# Phase 2: Research Studies
# ---------------------------------------------------------------------------

@router.post("/studies", response_model=APIResponse[ResearchStudyRead], status_code=status.HTTP_201_CREATED, summary="Create Research Protocol Study")
async def create_study(
    payload: ResearchStudyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    study = await ResearchService.create_study(db, payload)
    return APIResponse(success=True, message="Research study created in DRAFT status.", data=study)


@router.get("/studies", response_model=APIResponse[List[ResearchStudyRead]], summary="List Research Studies")
async def list_studies(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER, UserRole.CONSULTANT])),
):
    studies = await ResearchService.list_studies(db)
    return APIResponse(success=True, message="Research studies retrieved.", data=studies)


@router.get("/studies/{study_id}", response_model=APIResponse[ResearchStudyRead], summary="Get Research Study Details")
async def get_study(
    study_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER, UserRole.CONSULTANT])),
):
    study = await ResearchService.get_study(db, study_id)
    return APIResponse(success=True, message="Research study retrieved.", data=study)


@router.patch("/studies/{study_id}", response_model=APIResponse[ResearchStudyRead], summary="Update Research Study Status / Metadata")
async def update_study(
    study_id: int,
    payload: ResearchStudyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    study = await ResearchService.update_study(db, study_id, payload)
    return APIResponse(success=True, message="Research study updated.", data=study)


# ---------------------------------------------------------------------------
# Phase 3: Participants & Consent
# ---------------------------------------------------------------------------

@router.post("/participants", response_model=APIResponse[ResearchParticipantRead], status_code=status.HTTP_201_CREATED, summary="Register Research Participant")
async def register_participant(
    payload: ResearchParticipantCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    participant = await ResearchService.register_participant(db, payload)
    return APIResponse(success=True, message="Research participant registered.", data=participant)


@router.get("/studies/{study_id}/participants", response_model=APIResponse[List[ResearchParticipantRead]], summary="List Participants in Study")
async def list_participants(
    study_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    participants = await ResearchService.list_participants(db, study_id)
    return APIResponse(success=True, message="Participants retrieved.", data=participants)


@router.patch("/participants/{participant_id}/consent", response_model=APIResponse[ResearchParticipantRead], summary="Update Participant Consent Status")
async def update_participant_consent(
    participant_id: int,
    payload: ConsentUpdatePayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    participant = await ResearchService.update_participant_consent(db, participant_id, payload)
    return APIResponse(success=True, message="Participant consent status updated.", data=participant)


# ---------------------------------------------------------------------------
# Phase 4: Consultant Profiles
# ---------------------------------------------------------------------------

@router.post("/consultants", response_model=APIResponse[ConsultantProfileRead], status_code=status.HTTP_201_CREATED, summary="Register Consultant / Rater Profile")
async def create_consultant_profile(
    payload: ConsultantProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    profile = await ResearchService.create_consultant_profile(db, payload)
    return APIResponse(success=True, message="Consultant profile created.", data=profile)


@router.get("/consultants", response_model=APIResponse[List[ConsultantProfileRead]], summary="List Consultant Rater Profiles")
async def list_consultant_profiles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    profiles = await ResearchService.list_consultant_profiles(db)
    return APIResponse(success=True, message="Consultant profiles retrieved.", data=profiles)


# ---------------------------------------------------------------------------
# Phase 5 & 7: Blinded Evaluation Cases
# ---------------------------------------------------------------------------

@router.post("/blinded-cases", response_model=APIResponse[BlindedPacketRead], status_code=status.HTTP_201_CREATED, summary="Create Blinded Evaluation Case Packet")
async def create_blinded_packet(
    payload: BlindedPacketCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    packet = await ResearchService.create_blinded_packet(db, payload)
    return APIResponse(success=True, message="Blinded case packet created.", data=packet)


@router.get("/studies/{study_id}/blinded-cases", response_model=APIResponse[List[BlindedPacketRead]], summary="List Blinded Packets for Study")
async def list_blinded_packets(
    study_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER, UserRole.CONSULTANT])),
):
    packets = await ResearchService.list_blinded_packets(db, study_id, current_user)
    return APIResponse(success=True, message="Blinded evaluation packets retrieved.", data=packets)


@router.get("/blinded-cases/{packet_id}", response_model=APIResponse[BlindedPacketRead], summary="Get Sanitized Blinded Case Packet")
async def get_blinded_packet(
    packet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER, UserRole.CONSULTANT])),
):
    packet = await ResearchService.get_blinded_packet_for_consultant(db, packet_id, current_user)
    return APIResponse(success=True, message="Blinded packet retrieved (system outputs strictly hidden).", data=packet)


# ---------------------------------------------------------------------------
# Phase 6: Consultant Evaluation
# ---------------------------------------------------------------------------

@router.post("/evaluations", response_model=APIResponse[ConsultantEvaluationRead], status_code=status.HTTP_201_CREATED, summary="Submit Independent Blind Consultant Evaluation")
async def submit_consultant_evaluation(
    payload: ConsultantEvaluationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER, UserRole.CONSULTANT])),
):
    eval_record = await ResearchService.submit_consultant_evaluation(db, payload, current_user)
    return APIResponse(success=True, message="Consultant evaluation recorded.", data=eval_record)


# ---------------------------------------------------------------------------
# Phase 8: Test-Retest Linkages
# ---------------------------------------------------------------------------

@router.post("/test-retest", response_model=APIResponse[TestRetestLinkageRead], status_code=status.HTTP_201_CREATED, summary="Create Test-Retest Assessment Linkage")
async def create_test_retest_linkage(
    payload: TestRetestLinkageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    linkage = await ResearchService.create_test_retest_linkage(db, payload)
    return APIResponse(success=True, message="Test-retest linkage registered.", data=linkage)


@router.patch("/test-retest/{linkage_id}/validity", response_model=APIResponse[TestRetestLinkageRead], summary="Update Test-Retest Validity Status")
async def update_test_retest_validity(
    linkage_id: int,
    payload: TestRetestValidityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    linkage = await ResearchService.update_test_retest_validity(db, linkage_id, payload)
    return APIResponse(success=True, message="Test-retest validity status updated.", data=linkage)


@router.get("/studies/{study_id}/test-retest", response_model=APIResponse[List[TestRetestLinkageRead]], summary="List Test-Retest Linkages in Study")
async def list_test_retest_linkages(
    study_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    linkages = await ResearchService.list_test_retest_linkages(db, study_id)
    return APIResponse(success=True, message="Test-retest linkages retrieved.", data=linkages)


# ---------------------------------------------------------------------------
# Phase 9: Recommendation Ablation
# ---------------------------------------------------------------------------

@router.post("/ablation/generate", response_model=APIResponse[RecommendationAblationRead], status_code=status.HTTP_201_CREATED, summary="Generate Paired Recommendation Ablation Case")
async def generate_ablation_pair(
    study_id: int = Query(...),
    assessment_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    ablation = await ResearchService.generate_ablation_pair(db, study_id, assessment_id, current_user.id)
    return APIResponse(success=True, message="Recommendation ablation pair generated.", data=ablation)


@router.post("/ablation/{ablation_id}/rate", response_model=APIResponse[RecommendationAblationRead], summary="Submit Ablation Preference Rating")
async def submit_ablation_rating(
    ablation_id: int,
    payload: RecommendationAblationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER, UserRole.CONSULTANT])),
):
    ablation = await ResearchService.submit_ablation_rating(db, ablation_id, payload, current_user.id)
    return APIResponse(success=True, message="Ablation evaluation rating recorded.", data=ablation)


# ---------------------------------------------------------------------------
# Phase 10 & 11: Cognitive Interviews & Language Validation
# ---------------------------------------------------------------------------

@router.post("/cognitive-interviews", response_model=APIResponse[CognitiveInterviewRead], status_code=status.HTTP_201_CREATED, summary="Log Cognitive Interview Observation")
async def record_cognitive_interview(
    payload: CognitiveInterviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    record = await ResearchService.record_cognitive_interview(db, payload)
    return APIResponse(success=True, message="Cognitive interview record logged.", data=record)


@router.get("/studies/{study_id}/cognitive-interviews", response_model=APIResponse[List[CognitiveInterviewRead]], summary="List Cognitive Interview Logs")
async def list_cognitive_interviews(
    study_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    records = await ResearchService.list_cognitive_interviews(db, study_id)
    return APIResponse(success=True, message="Cognitive interview logs retrieved.", data=records)


# ---------------------------------------------------------------------------
# Phase 12: Comprehension Experiments
# ---------------------------------------------------------------------------

@router.post("/comprehension", response_model=APIResponse[ComprehensionStudyRead], status_code=status.HTTP_201_CREATED, summary="Log Comprehension Study Record")
async def record_comprehension_experiment(
    payload: ComprehensionStudyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    record = await ResearchService.record_comprehension_experiment(db, payload)
    return APIResponse(success=True, message="Comprehension study record logged.", data=record)


@router.get("/studies/{study_id}/comprehension", response_model=APIResponse[List[ComprehensionStudyRead]], summary="List Comprehension Study Records")
async def list_comprehension_records(
    study_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    records = await ResearchService.list_comprehension_records(db, study_id)
    return APIResponse(success=True, message="Comprehension study records retrieved.", data=records)


# ---------------------------------------------------------------------------
# Phase 13 & 17: Research Experiments (E-01 to E-12)
# ---------------------------------------------------------------------------

@router.post("/experiments", response_model=APIResponse[ResearchExperimentRead], status_code=status.HTTP_201_CREATED, summary="Register Research Experiment (E-01 to E-12)")
async def register_experiment(
    payload: ResearchExperimentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    exp = await ResearchService.register_experiment(db, payload, current_user.id)
    return APIResponse(success=True, message=f"Research experiment {payload.experiment_code} registered.", data=exp)


@router.get("/studies/{study_id}/experiments", response_model=APIResponse[List[ResearchExperimentRead]], summary="List Experiments in Study")
async def list_experiments(
    study_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    exps = await ResearchService.list_experiments(db, study_id)
    return APIResponse(success=True, message="Research experiments retrieved.", data=exps)


# ---------------------------------------------------------------------------
# Phase 14: Dataset Snapshots
# ---------------------------------------------------------------------------

@router.post("/snapshots", response_model=APIResponse[ResearchDatasetSnapshotRead], status_code=status.HTTP_201_CREATED, summary="Create Point-in-Time Dataset Snapshot")
async def create_dataset_snapshot(
    payload: ResearchDatasetSnapshotCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    snapshot = await ResearchService.create_dataset_snapshot(db, payload, current_user.id)
    return APIResponse(success=True, message="Research dataset snapshot created.", data=snapshot)


@router.get("/studies/{study_id}/snapshots", response_model=APIResponse[List[ResearchDatasetSnapshotRead]], summary="List Dataset Snapshots for Study")
async def list_snapshots(
    study_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    snapshots = await ResearchService.list_snapshots(db, study_id)
    return APIResponse(success=True, message="Dataset snapshots retrieved.", data=snapshots)


# ---------------------------------------------------------------------------
# Phase 15: Reproducibility Manifests
# ---------------------------------------------------------------------------

@router.post("/manifests", response_model=APIResponse[ReproducibilityManifestRecordRead], status_code=status.HTTP_201_CREATED, summary="Snapshot & Archive Reproducibility Manifest")
async def snapshot_reproducibility_manifest(
    study_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    manifest_rec = await ResearchService.snapshot_reproducibility_manifest(db, study_id)
    return APIResponse(success=True, message="Reproducibility manifest archived.", data=manifest_rec)


# ---------------------------------------------------------------------------
# Phase 16: Research Export & Privacy Pipeline
# ---------------------------------------------------------------------------

@router.post("/exports", response_model=APIResponse[ResearchExportSummary], summary="Generate Sanitized k-Anonymous Research Export")
async def export_anonymized_dataset(
    payload: ResearchExportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    summary = await ResearchService.export_anonymized_dataset(db, payload)
    return APIResponse(success=True, message="Research dataset export generated with privacy controls.", data=summary)
