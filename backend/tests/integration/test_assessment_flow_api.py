"""Integration tests for DigiMitra Phase A3 End-to-End Assessment and Classification API on MySQL."""

from datetime import datetime
import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.assessment import Assessment, AssessmentScore
from app.models.classification_result import ClassificationResult, ClassificationEvidence
from app.models.business_category import BusinessCategory
from app.models.business import Business
from app.models.user import User


@pytest.mark.asyncio
async def test_full_assessment_flow_authenticated(client: AsyncClient, db_session: AsyncSession):
    """End-to-end test: Register user -> Register business -> Start assessment -> Answer questions -> Submit -> Verify scores & classification."""
    timestamp = int(datetime.now().timestamp())

    # 1. Register and Login User
    user_email = f"msme_eval_{timestamp}@example.in"
    password = "SecurePassword123!"
    reg_resp = await client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Kavita Rao",
            "email": user_email,
            "password": password,
            "role": "business_owner",
        },
    )
    assert reg_resp.status_code == 201

    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": user_email, "password": password},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Register Business
    cat_res = await db_session.execute(select(BusinessCategory).limit(1))
    cat = cat_res.scalar_one_or_none()
    cat_id = cat.id if cat else 1

    biz_resp = await client.post(
        "/api/v1/businesses",
        headers=headers,
        json={
            "name": "Rao Handloom & Fabrics",
            "sector": "Manufacturing & Handicrafts",
            "enterprise_size": "Micro",
            "state": "Telangana",
            "city": "Hyderabad",
        },
    )
    assert biz_resp.status_code == 201
    business_id = biz_resp.json()["data"]["id"]

    # 3. Start Assessment Session
    start_resp = await client.post(
        "/api/v1/assessments",
        headers=headers,
        json={"business_id": business_id, "language_used": "hi"},
    )
    assert start_resp.status_code == 201
    assessment_id = start_resp.json()["data"]["id"]
    assert start_resp.json()["data"]["status"] == "in_progress"

    # 4. Fetch Question Bank
    q_resp = await client.get(
        f"/api/v1/assessments/{assessment_id}/questions",
        headers=headers,
    )
    assert q_resp.status_code == 200
    questions_data = q_resp.json()["data"]["questions"]
    assert len(questions_data) >= 14

    # 5. Build Answers for all 14 questions (targeting Level 2 Operational Digitalization)
    answers_payload = []
    for q in questions_data:
        q_id = q["id"]
        q_code = q["question_code"]
        q_type = q["question_type"]
        options = q["options"]

        if q_type == "multi_choice":
            # Select positive options (e.g. Google Business + WhatsApp)
            pos_opts = [opt["id"] for opt in options if "NONE" not in opt["option_code"].upper()]
            answers_payload.append({
                "question_id": q_id,
                "selected_option_ids": pos_opts[:2],
            })
        elif q_type == "boolean":
            # Choose YES option (index 0)
            answers_payload.append({
                "question_id": q_id,
                "selected_option_id": options[0]["id"],
            })
        else:
            # Choose a high-scoring option
            answers_payload.append({
                "question_id": q_id,
                "selected_option_id": options[0]["id"],
            })

    save_resp = await client.put(
        f"/api/v1/assessments/{assessment_id}/answers",
        headers=headers,
        json={"answers": answers_payload, "language_used": "en"},
    )
    assert save_resp.status_code == 200
    assert len(save_resp.json()["data"]) == len(questions_data)

    # 6. Submit Assessment and Trigger Classification Engine
    submit_resp = await client.post(
        f"/api/v1/assessments/{assessment_id}/submit",
        headers=headers,
    )
    assert submit_resp.status_code == 200
    submit_data = submit_resp.json()["data"]

    assert "rbdl_level" in submit_data
    assert submit_data["rbdl_level"] in (1, 2, 3)
    assert "composite_score" in submit_data
    assert submit_data["composite_score"] > 0
    assert "certainty_tier" in submit_data
    assert "explanation_summary_en" in submit_data
    assert len(submit_data["evidence_traces"]) > 0

    # 7. Verify Scores Endpoint
    scores_resp = await client.get(
        f"/api/v1/assessments/{assessment_id}/scores",
        headers=headers,
    )
    assert scores_resp.status_code == 200
    scores_data = scores_resp.json()["data"]
    assert len(scores_data["dimension_scores"]) == 9
    assert scores_data["composite_score"] == submit_data["composite_score"]

    # 8. Verify Classification Endpoint
    class_resp = await client.get(
        f"/api/v1/assessments/{assessment_id}/classification",
        headers=headers,
    )
    assert class_resp.status_code == 200
    class_data = class_resp.json()["data"]
    assert class_data["rbdl_level"] == submit_data["rbdl_level"]
    assert len(class_data["evidence_traces"]) > 0


@pytest.mark.asyncio
async def test_assessment_ownership_security(client: AsyncClient, db_session: AsyncSession):
    """Verify User B cannot view or modify User A's assessment."""
    timestamp = int(datetime.now().timestamp())

    # Create User A & Business
    user_a_email = f"user_a_{timestamp}@example.in"
    password = "Password123!"
    await client.post(
        "/api/v1/auth/register",
        json={"full_name": "User Alpha", "email": user_a_email, "password": password},
    )
    login_a_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": user_a_email, "password": password},
    )
    token_a = login_a_resp.json()["data"]["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    biz_a_resp = await client.post(
        "/api/v1/businesses",
        headers=headers_a,
        json={"name": "Alpha Corp", "sector": "Retail", "enterprise_size": "Micro", "state": "Delhi", "city": "New Delhi"},
    )
    assert biz_a_resp.status_code == 201
    biz_a_id = biz_a_resp.json()["data"]["id"]

    assess_a_resp = await client.post(
        "/api/v1/assessments",
        headers=headers_a,
        json={"business_id": biz_a_id},
    )
    assess_a_id = assess_a_resp.json()["data"]["id"]

    # Create User B
    user_b_email = f"user_b_{timestamp}@example.in"
    await client.post(
        "/api/v1/auth/register",
        json={"full_name": "User Beta", "email": user_b_email, "password": password},
    )
    login_b_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": user_b_email, "password": password},
    )
    token_b = login_b_resp.json()["data"]["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User B attempts to access User A's assessment -> 403 Forbidden
    unauth_resp = await client.get(
        f"/api/v1/assessments/{assess_a_id}",
        headers=headers_b,
    )
    assert unauth_resp.status_code == 403
