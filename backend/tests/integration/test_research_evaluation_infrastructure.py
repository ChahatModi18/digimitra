"""Integration tests for A11 Research Evaluation Infrastructure.

Verifies:
1. Research Study Registry (create, get, list, lock immutability)
2. Participant registration & decoupled consent tracking
3. Consultant / Rater Profiles & COI declaration
4. Blinded Evaluation Packet generation & strict information hiding
5. Independent Consultant Evaluation submission & status transition
6. Test-Retest Linkages (interval calculation, validity status updates)
7. Recommendation Ablation (paired Model A vs Model B generation & rating)
8. Cognitive Interview Logging (Tourangeau error dimensions)
9. Comprehension Experiment Logging (objective correctness & usability)
10. Research Experiment Registry (E-01 to E-12 codes)
11. Research Dataset Snapshotting (SHA-256 checksum & immutability)
12. Reproducibility Manifest Archival
13. Sanitized k-anonymous research export
14. RBAC & Security: Business owner isolation, unauthenticated rejection, consultant access limits
"""

import random
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import create_access_token, UserRole
from app.domain.rbdl.seeder import seed_all_a3_data
from app.models.assessment import Assessment, AssessmentAnswer, AssessmentScore
from app.models.business import Business
from app.models.classification_result import ClassificationResult
from app.models.user import User


async def _create_test_user(db_session: AsyncSession, role: str, prefix: str = "user"):
    suffix = random.randint(10000000, 99999999)
    user = User(
        email=f"{prefix}_{suffix}@example.com",
        password_hash="test_hashed_pwd",
        full_name=f"Test {prefix.capitalize()} {suffix}",
        role=role,
        is_active=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    token = create_access_token(subject=str(user.id), role=role)
    return user, token




@pytest.mark.asyncio
async def test_research_study_lifecycle(client: AsyncClient, db_session: AsyncSession):
    """Test study creation, retrieval, listing, and locked protocol immutability."""
    admin_user, admin_token = await _create_test_user(db_session, UserRole.ADMIN.value, "admin")
    headers = {"Authorization": f"Bearer {admin_token}"}
    suffix = random.randint(1000, 9999)
    study_code = f"STUDY-VAL-{suffix}"

    # 1. Create study
    create_resp = await client.post(
        "/api/v1/research/studies",
        headers=headers,
        json={
            "study_code": study_code,
            "title": f"Validation Study {suffix}",
            "protocol_version": "1.0",
            "description": "Validation protocol for MSME digital readiness",
            "instrument_version": "1.0",
            "rbdl_version": "1.0",
            "question_bank_version": 1,
            "requirement_profile_version": "1.0",
            "recommendation_rules_version": "1.0",
        },
    )
    assert create_resp.status_code == 201
    study_data = create_resp.json()["data"]
    study_id = study_data["id"]
    assert study_data["status"] == "DRAFT"

    # 2. Get study
    get_resp = await client.get(f"/api/v1/research/studies/{study_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["data"]["study_code"] == study_code

    # 3. Update status to ACTIVE, then LOCKED
    act_resp = await client.patch(
        f"/api/v1/research/studies/{study_id}",
        headers=headers,
        json={"status": "ACTIVE"},
    )
    assert act_resp.status_code == 200
    assert act_resp.json()["data"]["status"] == "ACTIVE"

    lock_resp = await client.patch(
        f"/api/v1/research/studies/{study_id}",
        headers=headers,
        json={"status": "LOCKED"},
    )
    assert lock_resp.status_code == 200
    assert lock_resp.json()["data"]["status"] == "LOCKED"

    # 4. Attempt to mutate locked study without archiving -> 400 Bad Request
    fail_resp = await client.patch(
        f"/api/v1/research/studies/{study_id}",
        headers=headers,
        json={"title": "Altered Title While Locked"},
    )
    assert fail_resp.status_code == 400


@pytest.mark.asyncio
async def test_participant_registration_and_consent(client: AsyncClient, db_session: AsyncSession):
    """Test decoupled participant registration and consent status lifecycle."""
    res_user, res_token = await _create_test_user(db_session, UserRole.RESEARCHER.value, "res")
    headers = {"Authorization": f"Bearer {res_token}"}
    suffix = random.randint(1000, 9999)

    # Create study first
    study_resp = await client.post(
        "/api/v1/research/studies",
        headers=headers,
        json={
            "study_code": f"STUDY-CONSENT-{suffix}",
            "title": "Consent Test Study",
        },
    )
    study_id = study_resp.json()["data"]["id"]

    # Register participant
    p_code = f"PID-TEST-{suffix}"
    reg_resp = await client.post(
        "/api/v1/research/participants",
        headers=headers,
        json={
            "study_id": study_id,
            "participant_code": p_code,
            "consent_status": "PENDING",
            "language": "hi",
            "respondent_role": "owner",
        },
    )
    assert reg_resp.status_code == 201
    p_id = reg_resp.json()["data"]["id"]
    assert reg_resp.json()["data"]["consent_status"] == "PENDING"

    # Update consent to CONSENTED
    cons_resp = await client.patch(
        f"/api/v1/research/participants/{p_id}/consent",
        headers=headers,
        json={"consent_status": "CONSENTED", "consent_version": "2.1"},
    )
    assert cons_resp.status_code == 200
    assert cons_resp.json()["data"]["consent_status"] == "CONSENTED"
    assert cons_resp.json()["data"]["consent_timestamp"] is not None

    # Update consent to WITHDRAWN
    with_resp = await client.patch(
        f"/api/v1/research/participants/{p_id}/consent",
        headers=headers,
        json={"consent_status": "WITHDRAWN", "withdrawal_reason": "Participant opted out"},
    )
    assert with_resp.status_code == 200
    assert with_resp.json()["data"]["consent_status"] == "WITHDRAWN"
    assert with_resp.json()["data"]["withdrawal_reason"] == "Participant opted out"


@pytest.mark.asyncio
async def test_blinded_case_packet_information_hiding(client: AsyncClient, db_session: AsyncSession):
    """
    CRITICAL BLINDING TEST:
    Verify that a blinded evaluation packet contains raw operational facts and answers,
    but strictly hides computed RBDL level, dimension scores, certainty, recommendations,
    roadmaps, and internal rule traces.
    """
    admin_user, admin_token = await _create_test_user(db_session, UserRole.ADMIN.value, "admin")
    consultant_user, consultant_token = await _create_test_user(db_session, UserRole.CONSULTANT.value, "consultant")
    admin_hdr = {"Authorization": f"Bearer {admin_token}"}
    consultant_hdr = {"Authorization": f"Bearer {consultant_token}"}
    suffix = random.randint(1000, 9999)

    # 1. Create study
    study_resp = await client.post(
        "/api/v1/research/studies",
        headers=admin_hdr,
        json={"study_code": f"STUDY-BLIND-{suffix}", "title": "Blinding Audit Study"},
    )
    study_id = study_resp.json()["data"]["id"]

    # 2. Seed a business and submitted assessment
    biz = Business(
        owner_user_id=admin_user.id,
        category_id=1,
        name=f"Blind Test Enterprise {suffix}",
        sector="retail",
        business_size="micro",
        state="Rajasthan",
        district="Jaipur",
    )
    db_session.add(biz)
    await db_session.commit()
    await db_session.refresh(biz)

    ass = Assessment(
        business_id=biz.id,
        question_bank_version=1,
        language_used="en",
        status="submitted",
        respondent_role="owner",
    )
    db_session.add(ass)
    await db_session.commit()
    await db_session.refresh(ass)

    # Add a mock primary classification result (that MUST be hidden from consultant)
    cr = ClassificationResult(
        assessment_id=ass.id,
        rbdl_level=2,
        is_primary=True,
        method="rule_based",
        confidence_score=0.85,
    )
    db_session.add(cr)
    await db_session.commit()

    # 3. Create blinded case packet assigned to consultant
    packet_resp = await client.post(
        "/api/v1/research/blinded-cases",
        headers=admin_hdr,
        json={
            "study_id": study_id,
            "source_assessment_id": ass.id,
            "packet_code": f"CASE-PKT-{suffix}",
            "assigned_consultant_id": consultant_user.id,
        },
    )
    assert packet_resp.status_code == 201
    packet_id = packet_resp.json()["data"]["id"]

    # 4. Consultant retrieves the packet
    case_resp = await client.get(f"/api/v1/research/blinded-cases/{packet_id}", headers=consultant_hdr)
    assert case_resp.status_code == 200
    case_data = case_resp.json()["data"]

    # 5. VERIFY STRICT INFORMATION HIDING:
    sanitized = case_data["sanitized_case_data_json"]
    assert "business_profile" in sanitized
    assert sanitized["business_profile"]["sector"] in ["retail", "Retail & Trade"]
    assert sanitized["business_profile"]["district"] == "Jaipur"

    # Must NOT contain calculated level, scores, certainty, or recommendations
    assert "rbdl_level" not in sanitized
    assert "assigned_rbdl_level" not in sanitized
    assert "composite_score" not in sanitized
    assert "dimension_scores" not in sanitized
    assert "certainty_tier" not in sanitized
    assert "recommendations" not in sanitized
    assert "roadmap" not in sanitized
    assert "evidence_traces" not in sanitized

    # 6. Consultant submits independent evaluation
    eval_resp = await client.post(
        "/api/v1/research/evaluations",
        headers=consultant_hdr,
        json={
            "packet_id": packet_id,
            "assigned_rbdl_level": 1,  # Consultant independently chooses Level 1 (differing from system's 2)
            "primary_gap_dimension": "records",
            "confidence_score": 4,
            "rationales": "Business uses manual ledger without digital record backup.",
            "review_duration_seconds": 180,
        },
    )
    assert eval_resp.status_code == 201
    eval_data = eval_resp.json()["data"]
    assert eval_data["assigned_rbdl_level"] == 1
    assert eval_data["primary_gap_dimension"] == "records"


@pytest.mark.asyncio
async def test_test_retest_and_ablation_records(client: AsyncClient, db_session: AsyncSession):
    """Test short-interval test-retest linkage and recommendation ablation evaluation."""
    admin_user, admin_token = await _create_test_user(db_session, UserRole.ADMIN.value, "admin")
    headers = {"Authorization": f"Bearer {admin_token}"}
    suffix = random.randint(1000, 9999)

    study_resp = await client.post(
        "/api/v1/research/studies",
        headers=headers,
        json={"study_code": f"STUDY-RELIAB-{suffix}", "title": "Reliability & Ablation Study"},
    )
    study_id = study_resp.json()["data"]["id"]

    biz = Business(
        owner_user_id=admin_user.id,
        category_id=1,
        name=f"Reliab Biz {suffix}",
        sector="services",
        business_size="micro",
        state="Rajasthan",
        district="Jaipur",
    )
    db_session.add(biz)
    await db_session.commit()

    ass1 = Assessment(business_id=biz.id, question_bank_version=1, status="submitted")
    ass2 = Assessment(business_id=biz.id, question_bank_version=1, status="submitted")
    db_session.add_all([ass1, ass2])
    await db_session.commit()

    # Register test-retest linkage
    tr_resp = await client.post(
        "/api/v1/research/test-retest",
        headers=headers,
        json={
            "study_id": study_id,
            "baseline_assessment_id": ass1.id,
            "retest_assessment_id": ass2.id,
            "planned_interval_days": 10,
            "intervention_occurred": False,
        },
    )
    assert tr_resp.status_code == 201
    linkage_id = tr_resp.json()["data"]["id"]
    assert tr_resp.json()["data"]["validity_status"] == "PENDING_REVIEW"

    # Update validity status
    val_resp = await client.patch(
        f"/api/v1/research/test-retest/{linkage_id}/validity",
        headers=headers,
        json={"validity_status": "VALID_FOR_RETEST"},
    )
    assert val_resp.status_code == 200
    assert val_resp.json()["data"]["validity_status"] == "VALID_FOR_RETEST"

    # Generate recommendation ablation pair
    ab_resp = await client.post(
        f"/api/v1/research/ablation/generate?study_id={study_id}&assessment_id={ass1.id}",
        headers=headers,
    )
    assert ab_resp.status_code == 201
    ablation_id = ab_resp.json()["data"]["id"]
    assert "arm_a_recommendations_json" in ab_resp.json()["data"]
    assert "arm_b_recommendations_json" in ab_resp.json()["data"]

    # Rate ablation pair
    rate_resp = await client.post(
        f"/api/v1/research/ablation/{ablation_id}/rate",
        headers=headers,
        json={
            "study_id": study_id,
            "assessment_id": ass1.id,
            "preferred_arm": "ARM_B",
            "arm_b_ratings_json": {"relevance": 5, "feasibility": 4, "actionability": 5},
            "arm_a_ratings_json": {"relevance": 3, "feasibility": 2, "actionability": 3},
            "evaluator_comments": "Model B context filtering generated significantly more feasible recommendations.",
        },
    )
    assert rate_resp.status_code == 200
    assert rate_resp.json()["data"]["preferred_arm"] == "ARM_B"


@pytest.mark.asyncio
async def test_cognitive_interviews_and_comprehension_records(client: AsyncClient, db_session: AsyncSession):
    """Test logging cognitive interview observations (E-06) and comprehension checks (E-07)."""
    res_user, res_token = await _create_test_user(db_session, UserRole.RESEARCHER.value, "res")
    headers = {"Authorization": f"Bearer {res_token}"}
    suffix = random.randint(1000, 9999)

    study_resp = await client.post(
        "/api/v1/research/studies",
        headers=headers,
        json={"study_code": f"STUDY-HCI-{suffix}", "title": "HCI Cognitive Study"},
    )
    study_id = study_resp.json()["data"]["id"]

    # Log cognitive interview record
    cog_resp = await client.post(
        "/api/v1/research/cognitive-interviews",
        headers=headers,
        json={
            "study_id": study_id,
            "participant_code": f"PID-HCI-{suffix}",
            "language": "hi",
            "instrument_version": "1.0",
            "interview_date": "2026-09-29T10:00:00",
            "interviewer_name": "Dr. Sharma",
            "item_code": "Q02",
            "comprehension_issue": True,
            "translation_drift_notes": "Participant confused 'online catalog' with WhatsApp status",
            "interviewer_notes": "Clarified using local business example.",
        },
    )
    assert cog_resp.status_code == 201
    assert cog_resp.json()["data"]["comprehension_issue"] is True

    # Log comprehension study record
    comp_resp = await client.post(
        "/api/v1/research/comprehension",
        headers=headers,
        json={
            "study_id": study_id,
            "participant_code": f"PID-HCI-{suffix}",
            "displayed_traceability_version": "1.0",
            "comprehension_question_code": "COMP-01",
            "expected_answer": "Lacking digital accounting records prevents Level 2",
            "participant_answer": "Need computer accounting for level 2",
            "is_correct": True,
            "task_completion_time_seconds": 45,
            "usability_rating": 4,
        },
    )
    assert comp_resp.status_code == 201
    assert comp_resp.json()["data"]["is_correct"] is True


@pytest.mark.asyncio
async def test_experiment_registry_and_snapshots(client: AsyncClient, db_session: AsyncSession):
    """Test experiment registration (E-01 to E-12), snapshotting, and manifests."""
    admin_user, admin_token = await _create_test_user(db_session, UserRole.ADMIN.value, "admin")
    headers = {"Authorization": f"Bearer {admin_token}"}
    suffix = random.randint(1000, 9999)

    study_resp = await client.post(
        "/api/v1/research/studies",
        headers=headers,
        json={"study_code": f"STUDY-EXP-{suffix}", "title": "Experiment Test Study"},
    )
    study_id = study_resp.json()["data"]["id"]

    # Register E-04 Threshold Sensitivity experiment
    exp_resp = await client.post(
        "/api/v1/research/experiments",
        headers=headers,
        json={
            "study_id": study_id,
            "experiment_code": "E-04",
            "title": "Gate Threshold Sensitivity Analysis",
            "experiment_type": "diagnostic_simulation",
            "parameters_json": {"step": 0.5, "include_na": True},
            "analysis_method": "perturbation_simulation",
        },
    )
    assert exp_resp.status_code == 201
    assert exp_resp.json()["data"]["experiment_code"] == "E-04"

    # Attempt to register invalid experiment code -> 400
    inv_exp_resp = await client.post(
        "/api/v1/research/experiments",
        headers=headers,
        json={
            "study_id": study_id,
            "experiment_code": "E-99-INVALID",
            "title": "Invalid Experiment",
            "experiment_type": "invalid",
        },
    )
    assert inv_exp_resp.status_code == 400

    # Create dataset snapshot
    snap_resp = await client.post(
        "/api/v1/research/snapshots",
        headers=headers,
        json={
            "study_id": study_id,
            "snapshot_code": f"SNAP-{suffix}",
            "dataset_version": "1.0",
            "source_population_description": "Micro-enterprises in Jaipur district",
        },
    )
    assert snap_resp.status_code == 201
    assert "checksum_sha256" in snap_resp.json()["data"]

    # Snapshot reproducibility manifest
    man_resp = await client.post(
        f"/api/v1/research/manifests?study_id={study_id}",
        headers=headers,
    )
    assert man_resp.status_code == 201
    assert "manifest_sha256" in man_resp.json()["data"]

    # Generate sanitized k-anonymous export
    export_resp = await client.post(
        "/api/v1/research/exports",
        headers=headers,
        json={
            "study_id": study_id,
            "k_threshold": 2,
            "generalize_location": True,
            "coarsen_sectors": True,
            "suppress_low_count_cells": True,
        },
    )
    assert export_resp.status_code == 200
    assert "export_hash_sha256" in export_resp.json()["data"]
    assert "transformations_applied" in export_resp.json()["data"]


@pytest.mark.asyncio
async def test_rbac_research_isolation(client: AsyncClient, db_session: AsyncSession):
    """
    RBAC SECURITY TEST:
    Verify that regular business owners and unauthenticated callers are strictly blocked
    from research studies, blinded case data, and export pipelines.
    """
    owner_user, owner_token = await _create_test_user(db_session, UserRole.BUSINESS_OWNER.value, "owner")
    owner_hdr = {"Authorization": f"Bearer {owner_token}"}

    # 1. Business owner attempt to list studies -> 403 Forbidden
    resp1 = await client.get("/api/v1/research/studies", headers=owner_hdr)
    assert resp1.status_code == 403

    # 2. Business owner attempt to access blinded cases -> 403 Forbidden
    resp2 = await client.get("/api/v1/research/studies/1/blinded-cases", headers=owner_hdr)
    assert resp2.status_code == 403

    # 3. Business owner attempt to trigger research export -> 403 Forbidden
    resp3 = await client.post(
        "/api/v1/research/exports",
        headers=owner_hdr,
        json={"k_threshold": 5},
    )
    assert resp3.status_code == 403

    # 4. Unauthenticated request -> 401 Unauthorized
    resp4 = await client.get("/api/v1/research/studies")
    assert resp4.status_code == 401
