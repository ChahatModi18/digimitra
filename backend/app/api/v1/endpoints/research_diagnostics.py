"""Research Diagnostics, Audit, Privacy, and Consultant Blind-Labeling Endpoints.

Safeguards Implemented:
- I-02: Rule/Seed Drift Audit
- I-05: Threshold Sensitivity Analysis (Read-Only)
- I-06: Research Export Re-Identification Diagnostic (k-anonymity)
- I-07: Blind Consultant-Labeling Boundary & Persist
- I-11: Reproducible Release Support
- C-05: N/A Usage Rates Diagnostic

Strictly restricted to Admin and Researcher roles.
"""

from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, status, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import UserRole
from app.dependencies import get_db, require_roles
from app.models.user import User
from app.models.assessment import Assessment, AssessmentAnswer, AssessmentScore
from app.models.business import Business
from app.models.classification_result import ClassificationResult
from app.models.consultant_label import ConsultantBlindLabel
from app.domain.rbdl.drift_checker import DriftChecker
from app.domain.research.sensitivity_analysis import ThresholdSensitivityAnalyzer, SensitivityReport
from app.domain.research.k_anonymity import KAnonymityEvaluator, KAnonymityReport
from app.domain.research.reproducibility import ReproducibilityService, ReproducibilityManifest
from app.domain.research.na_diagnostics import NADiagnosticsService, NADiagnosticsReport
from app.schemas.assessment import ConsultantBlindLabelCreate, ConsultantBlindLabelRead
from app.schemas.common import APIResponse

router = APIRouter(prefix="/research/diagnostics", tags=["Research Diagnostics & Privacy"])


@router.get("/drift", summary="Rule & Question Bank Database Drift Audit (I-02)")
async def get_drift_audit(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
) -> APIResponse[Dict[str, Any]]:
    """Verify synchronization between canonical Python rule/question definitions and DB."""
    result = await DriftChecker.check_database_drift(db)
    return APIResponse(
        success=True,
        message="Drift check completed." if not result["has_drift"] else "Drift detected between definitions and database.",
        data=result,
    )


@router.get("/sensitivity", summary="RBDL Gate Threshold Sensitivity Analysis (I-05)")
async def get_threshold_sensitivity(
    step: float = Query(0.5, ge=0.1, le=2.0, description="Perturbation step magnitude"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
) -> APIResponse[SensitivityReport]:
    """Execute read-only threshold perturbation analysis across submitted assessment scores."""
    # Gather submitted scores
    stmt = (
        select(Assessment.id)
        .where(Assessment.status == "submitted")
    )
    res = await db.execute(stmt)
    ass_ids = res.scalars().all()

    score_maps: List[Dict[str, float]] = []
    for a_id in ass_ids:
        scores_res = await db.execute(
            select(AssessmentScore).where(AssessmentScore.assessment_id == a_id)
        )
        s_map = {s.dimension_code: float(s.raw_score) for s in scores_res.scalars().all()}
        if s_map:
            score_maps.append(s_map)

    report = ThresholdSensitivityAnalyzer.analyze_dataset(
        assessment_scores_list=score_maps,
        perturbation_step=step,
    )
    return APIResponse(
        success=True,
        message="Threshold sensitivity analysis completed.",
        data=report,
    )


@router.get("/k-anonymity", summary="Research Export Re-Identification Diagnostic (I-06)")
async def get_k_anonymity_diagnostic(
    k: int = Query(5, ge=2, le=50, description="threshold supplied/configured by researcher"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
) -> APIResponse[KAnonymityReport]:
    """Inspect quasi-identifier frequency bins for research dataset export privacy."""
    stmt = select(Business)
    res = await db.execute(stmt)
    businesses = res.scalars().all()

    records = [
        {
            "state": b.state or "UNKNOWN",
            "district": b.district or "UNKNOWN",
            "category_id": b.category_id or "UNKNOWN",
            "business_size": b.business_size or "UNKNOWN",
        }
        for b in businesses
    ]

    report = KAnonymityEvaluator.evaluate(
        records=records,
        k_threshold=k,
    )
    return APIResponse(
        success=True,
        message="K-anonymity diagnostic evaluation completed.",
        data=report,
    )


@router.get("/na-rates", summary="N/A Usage Distribution Analytics (C-05)")
async def get_na_rate_diagnostics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
) -> APIResponse[NADiagnosticsReport]:
    """Retrieve N/A frequencies by question and dimension across submitted assessments."""
    report = await NADiagnosticsService.get_na_diagnostics(db)
    return APIResponse(
        success=True,
        message="N/A diagnostics retrieved successfully.",
        data=report,
    )


@router.get("/reproducibility", summary="Reproducibility Environment Manifest (I-11)")
async def get_reproducibility_manifest(
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
) -> APIResponse[ReproducibilityManifest]:
    """Retrieve complete environment and ruleset manifest for reproducible publication."""
    manifest = ReproducibilityService.generate_manifest()
    return APIResponse(
        success=True,
        message="Reproducibility manifest generated.",
        data=manifest,
    )


# ----------------------------------------------------------------------
# Consultant Blind Labeling Endpoints (I-07)
# ----------------------------------------------------------------------

@router.get("/consultant/blind-assessments", summary="Retrieve Blind Assessments for Consultant Labeling (I-07)")
async def get_blind_assessments_for_consultant(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
) -> APIResponse[List[Dict[str, Any]]]:
    """
    Returns submitted assessments for consultant review WITHOUT exposing:
    - Production RBDL level
    - Classification certainty tier
    - Rule evidence traces
    - Recommendations / Roadmaps
    """
    stmt = (
        select(Assessment)
        .options(
            selectinload(Assessment.business).selectinload(Business.category),
            selectinload(Assessment.answers).selectinload(AssessmentAnswer.question),
            selectinload(Assessment.answers).selectinload(AssessmentAnswer.selected_option),
            selectinload(Assessment.consultant_labels),
        )
        .where(Assessment.status == "submitted")
        .order_by(Assessment.id)
    )
    res = await db.execute(stmt)
    assessments = res.scalars().all()

    blind_data = []
    for ass in assessments:
        # Check if current consultant has already labeled
        existing_label = next((lbl for lbl in ass.consultant_labels if lbl.consultant_user_id == current_user.id), None)

        blind_data.append({
            "assessment_id": ass.id,
            "business_id": ass.business_id,
            "business_profile": {
                "category_name": ass.business.category.name_en if ass.business.category else "General",
                "sector": ass.business.sector,
                "business_size": ass.business.business_size,
                "state": ass.business.state,
                "district": ass.business.district,
            },
            "answers": [
                {
                    "question_code": a.question.question_code if a.question else None,
                    "dimension_code": a.question.dimension_code if a.question else None,
                    "question_text_en": a.question.question_text_en if a.question else None,
                    "selected_option_label_en": a.selected_option.label_en if a.selected_option else None,
                    "text_answer": a.text_answer,
                    "numeric_answer": float(a.numeric_answer) if a.numeric_answer is not None else None,
                }
                for a in ass.answers
            ],
            "has_consultant_labeled": existing_label is not None,
            "submitted_at": ass.submitted_at,
        })

    return APIResponse(
        success=True,
        message="Blind assessment list retrieved (production rule results omitted).",
        data=blind_data,
    )


@router.post("/consultant/labels", response_model=APIResponse[ConsultantBlindLabelRead], status_code=status.HTTP_201_CREATED, summary="Submit Independent Blind Consultant Rating (I-07)")
async def submit_consultant_blind_label(
    payload: ConsultantBlindLabelCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    """
    Submits an independent, blind RBDL rating from an expert / consultant.
    Persisted independently without modifying production rules or data.
    """
    ass_res = await db.execute(select(Assessment).where(Assessment.id == payload.assessment_id))
    ass = ass_res.scalar_one_or_none()
    if not ass:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Assessment {payload.assessment_id} not found.")

    blind_label = ConsultantBlindLabel(
        assessment_id=payload.assessment_id,
        consultant_user_id=current_user.id,
        labeled_rbdl_level=payload.labeled_rbdl_level,
        labeling_protocol_version=payload.labeling_protocol_version or "1.0",
        rationales=payload.rationales,
        labeled_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    db.add(blind_label)
    await db.commit()
    await db.refresh(blind_label)

    return APIResponse(
        success=True,
        message="Independent consultant blind label recorded.",
        data=ConsultantBlindLabelRead.model_validate(blind_label),
    )


@router.get("/consultant/comparison", summary="Compare Blind Consultant Labels vs Rule Engine (I-07)")
async def get_consultant_comparison(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
) -> APIResponse[List[Dict[str, Any]]]:
    """
    Research-only evaluation comparison between independent consultant labels
    and primary rule-based classification results.
    """
    stmt = (
        select(ConsultantBlindLabel, ClassificationResult)
        .join(Assessment, ConsultantBlindLabel.assessment_id == Assessment.id)
        .outerjoin(
            ClassificationResult,
            (ClassificationResult.assessment_id == Assessment.id) & (ClassificationResult.is_primary == True),
        )
    )
    res = await db.execute(stmt)
    rows = res.all()

    comparisons = []
    for lbl, cr in rows:
        comparisons.append({
            "assessment_id": lbl.assessment_id,
            "consultant_user_id": lbl.consultant_user_id,
            "consultant_level": lbl.labeled_rbdl_level,
            "rule_based_level": cr.rbdl_level if cr else None,
            "is_concordant": (lbl.labeled_rbdl_level == cr.rbdl_level) if cr else False,
            "level_delta": (lbl.labeled_rbdl_level - cr.rbdl_level) if cr else None,
            "labeling_protocol_version": lbl.labeling_protocol_version,
            "rationales": lbl.rationales,
            "labeled_at": lbl.labeled_at,
        })

    return APIResponse(
        success=True,
        message="Consultant vs Rule Engine comparison retrieved.",
        data=comparisons,
    )
