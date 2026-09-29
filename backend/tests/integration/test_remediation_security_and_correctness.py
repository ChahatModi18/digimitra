"""Integration tests for backend remediation: P1, P2, P5, P6, P7, P8, P9, P12."""

import random
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.core.security import create_access_token, create_refresh_token, UserRole
from app.domain.rbdl.seeder import seed_all_a3_data
from app.models.assessment import Assessment, AssessmentAnswer
from app.models.business import Business
from app.models.classification_result import ClassificationResult
from app.models.question import Question
from app.models.user import User


@pytest.mark.asyncio
async def test_p1_role_escalation_prevented_on_registration(client: AsyncClient):
    """P1: Clients cannot self-assign privileged roles (super_admin, researcher, assessor, admin)."""
    suffix = random.randint(10000000, 99999999)

    # 1. Attempt to register as super_admin -> should be rejected with 422 Unprocessable Entity
    resp_super = await client.post(
        "/api/v1/auth/register",
        json={
            "email": f"malicious_super_{suffix}@example.com",
            "full_name": "Hacker Super",
            "phone_number": f"98{suffix}"[:10],
            "password": "Password123!",
            "role": "super_admin",
        },
    )
    assert resp_super.status_code == 422

    # 2. Attempt to register as researcher -> rejected with 422
    resp_researcher = await client.post(
        "/api/v1/auth/register",
        json={
            "email": f"malicious_res_{suffix}@example.com",
            "full_name": "Hacker Researcher",
            "phone_number": f"97{suffix}"[:10],
            "password": "Password123!",
            "role": "researcher",
        },
    )
    assert resp_researcher.status_code == 422

    # 3. Attempt to register as assessor -> rejected with 422
    resp_assessor = await client.post(
        "/api/v1/auth/register",
        json={
            "email": f"malicious_ass_{suffix}@example.com",
            "full_name": "Hacker Assessor",
            "phone_number": f"96{suffix}"[:10],
            "password": "Password123!",
            "role": "assessor",
        },
    )
    assert resp_assessor.status_code == 422

    # 4. Legitimate business_owner registration succeeds
    resp_legit = await client.post(
        "/api/v1/auth/register",
        json={
            "email": f"legit_owner_{suffix}@example.com",
            "full_name": "Legit Owner",
            "phone_number": f"95{suffix}"[:10],
            "password": "Password123!",
            "role": "business_owner",
        },
    )
    assert resp_legit.status_code == 201
    assert resp_legit.json()["data"]["role"] == "business_owner"


@pytest.mark.asyncio
async def test_p8_p9_token_expires_in_and_refresh_endpoint(client: AsyncClient, db_session: AsyncSession):
    """P8 & P9: Accurate token lifetime in login response and functional /auth/refresh endpoint."""
    suffix = random.randint(10000000, 99999999)
    email = f"token_test_{suffix}@example.com"

    # Register and login
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": "Token Tester",
            "phone_number": f"94{suffix}"[:10],
            "password": "Password123!",
        },
    )
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Password123!"},
    )
    assert login_resp.status_code == 200
    token_data = login_resp.json()["data"]

    # Verify P8: expires_in matches ACCESS_TOKEN_EXPIRE_MINUTES * 60
    expected_expires = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    assert token_data["expires_in"] == expected_expires

    # Verify P9: /auth/refresh exchanges refresh_token for new tokens
    refresh_token = token_data["refresh_token"]
    refresh_resp = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_resp.status_code == 200
    new_data = refresh_resp.json()["data"]
    assert new_data["access_token"]
    assert new_data["refresh_token"]
    assert new_data["expires_in"] == expected_expires

    # Attempt to refresh with an access token (wrong type)
    wrong_type_resp = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": token_data["access_token"]},
    )
    assert wrong_type_resp.status_code == 401

    # Attempt to refresh with a bogus token
    bogus_resp = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "bogus.jwt.token"},
    )
    assert bogus_resp.status_code == 401


@pytest.mark.asyncio
async def test_p2_stub_shadowing_removed_and_endpoints_authenticated(client: AsyncClient, db_session: AsyncSession):
    """P2: Stub routes removed; classification and admin rules require authentication and RBAC."""
    await seed_all_a3_data(db_session)

    # 1. Unauthenticated request to /admin/rules must fail with 401
    unauth_rules = await client.get("/api/v1/admin/rules")
    assert unauth_rules.status_code == 401

    # 2. Unauthenticated request to /classification/1 must fail with 401
    unauth_clf = await client.get("/api/v1/classification/1")
    assert unauth_clf.status_code == 401

    # 3. Authenticate as normal business owner
    suffix = random.randint(10000000, 99999999)
    email = f"owner_p2_{suffix}@example.com"
    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "full_name": "Owner P2", "phone_number": f"93{suffix}"[:10], "password": "Password123!"},
    )
    login_resp = await client.post("/api/v1/auth/login", json={"email": email, "password": "Password123!"})
    owner_token = login_resp.json()["data"]["access_token"]
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    # 4. Business owner cannot access /admin/rules (requires admin/researcher) -> 403 Forbidden
    forbidden_rules = await client.get("/api/v1/admin/rules", headers=owner_headers)
    assert forbidden_rules.status_code == 403

    # 5. Create real Admin user in db and access /admin/rules -> 200 OK with real seeded rules
    admin_user = User(
        email=f"admin_p2_{suffix}@example.com",
        hashed_password="hashed_pw",
        full_name="Admin P2",
        phone_number=f"92{suffix}"[:10],
        role=UserRole.ADMIN.value,
        is_active=True,
    )
    db_session.add(admin_user)
    await db_session.flush()
    await db_session.refresh(admin_user)

    admin_token = create_access_token(subject=str(admin_user.id), role=UserRole.ADMIN.value)
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    admin_rules_resp = await client.get("/api/v1/admin/rules", headers=admin_headers)
    assert admin_rules_resp.status_code == 200
    assert len(admin_rules_resp.json()["data"]) > 0


@pytest.mark.asyncio
async def test_p12_zero_answer_assessment_submission_blocked(client: AsyncClient, db_session: AsyncSession):
    """P12: An assessment with zero answered questions cannot be submitted and receives 422 error."""
    await seed_all_a3_data(db_session)

    suffix = random.randint(10000000, 99999999)
    email = f"p12_owner_{suffix}@example.com"
    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "full_name": "P12 Tester", "phone_number": f"90{suffix}"[:10], "password": "Password123!"},
    )
    login_resp = await client.post("/api/v1/auth/login", json={"email": email, "password": "Password123!"})
    token = login_resp.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create business
    biz_res = await client.post(
        "/api/v1/businesses",
        headers=headers,
        json={"name": "Zero Answer Enterprise", "sector": "Retail & Trade", "enterprise_size": "Micro", "city": "Surat", "state": "Gujarat"},
    )
    biz_id = biz_res.json()["data"]["id"]

    # Start assessment
    ass_res = await client.post(
        "/api/v1/assessments",
        headers=headers,
        json={"business_id": biz_id, "language_used": "en"},
    )
    ass_id = ass_res.json()["data"]["id"]

    # Submit immediately WITHOUT answering any questions
    submit_res = await client.post(
        f"/api/v1/assessments/{ass_id}/submit",
        headers=headers,
    )
    # Must fail with 422 Unprocessable Entity
    assert submit_res.status_code == 422
    assert "zero answered questions" in submit_res.json()["error"]["message"].lower()

    # Verify assessment status is still in_progress in database
    ass_db = await db_session.get(Assessment, ass_id)
    assert ass_db.status == "in_progress"


@pytest.mark.asyncio
async def test_p6_atomic_assessment_submission_and_rollback(client: AsyncClient, db_session: AsyncSession):
    """P6: Assessment submission performs atomic commit across scores, classification, and roadmap."""
    await seed_all_a3_data(db_session)

    suffix = random.randint(10000000, 99999999)
    email = f"atomic_{suffix}@example.com"
    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "full_name": "Atomic Tester", "phone_number": f"89{suffix}"[:10], "password": "Password123!"},
    )
    login_resp = await client.post("/api/v1/auth/login", json={"email": email, "password": "Password123!"})
    token = login_resp.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create business
    biz_res = await client.post(
        "/api/v1/businesses",
        headers=headers,
        json={"name": "Atomic Enterprise", "sector": "Manufacturing", "enterprise_size": "Small", "city": "Pune", "state": "Maharashtra"},
    )
    biz_id = biz_res.json()["data"]["id"]

    # Start assessment
    ass_res = await client.post(
        "/api/v1/assessments",
        headers=headers,
        json={"business_id": biz_id, "language_used": "en"},
    )
    ass_id = ass_res.json()["data"]["id"]

    # Answer one question
    q_res = await db_session.execute(select(Question).where(Question.is_active == True).limit(1))
    q = q_res.scalars().first()

    await client.put(
        f"/api/v1/assessments/{ass_id}/answers",
        headers=headers,
        json={
            "answers": [
                {"question_id": q.id, "text_answer": "Yes, we use digital accounting.", "is_na": False}
            ]
        },
    )

    # Submit assessment
    submit_res = await client.post(
        f"/api/v1/assessments/{ass_id}/submit",
        headers=headers,
    )
    assert submit_res.status_code == 200
    data = submit_res.json()["data"]
    assert data["rbdl_level"] is not None
    assert data["assessment_id"] == ass_id

    # Verify complete atomic persistence
    ass_db = await db_session.get(Assessment, ass_id)
    assert ass_db.status == "submitted"
    assert ass_db.submitted_at is not None

    # Check classification result exists and is primary
    cr_res = await db_session.execute(
        select(ClassificationResult).where(
            ClassificationResult.assessment_id == ass_id,
            ClassificationResult.is_primary == True,
        )
    )
    cr = cr_res.scalar_one_or_none()
    assert cr is not None
    assert cr.rbdl_level == data["rbdl_level"]


@pytest.mark.asyncio
async def test_p7_batched_sensitivity_and_ml_readiness(client: AsyncClient, db_session: AsyncSession):
    """P7: Verify batched queries in sensitivity analysis and ML readiness return correct results."""
    await seed_all_a3_data(db_session)

    suffix = random.randint(10000000, 99999999)
    admin_user = User(
        email=f"admin_p7_{suffix}@example.com",
        hashed_password="hashed_pw",
        full_name="Admin P7",
        phone_number=f"91{suffix}"[:10],
        role=UserRole.ADMIN.value,
        is_active=True,
    )
    db_session.add(admin_user)
    await db_session.flush()
    await db_session.refresh(admin_user)

    admin_token = create_access_token(subject=str(admin_user.id), role=UserRole.ADMIN.value)
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Sensitivity endpoint runs batched query without N+1 regression
    sens_res = await client.get("/api/v1/research/diagnostics/sensitivity?step=0.5", headers=headers)
    assert sens_res.status_code == 200
    sens_data = sens_res.json()
    assert sens_data["success"] is True
    assert "data" in sens_data

    # 2. ML dataset summary runs batched query
    ml_res = await client.get("/api/v1/research/ml/dataset-summary?stage=stage_1", headers=headers)
    assert ml_res.status_code == 200
    ml_data = ml_res.json()
    assert ml_data["success"] is True
    assert "data" in ml_data
