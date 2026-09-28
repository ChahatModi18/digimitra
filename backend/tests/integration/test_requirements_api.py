"""Integration tests for DigiMitra Requirement Profile V1 & Research Instruments API."""

import pytest
import random
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.rbdl.seeder import seed_all_a3_data


@pytest.mark.asyncio
async def test_requirements_taxonomies_and_experiments_api(client: AsyncClient, db_session: AsyncSession):
    """Test public discovery endpoints for controlled research taxonomies and planned experiments."""
    # 1. Taxonomies endpoint
    res = await client.get("/api/v1/requirements/taxonomies")
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["framework_version"] == "RBDL_V1"
    assert data["requirement_profile_version"] == 1
    assert "Proposed research instrument" in data["research_status_disclosure"]
    assert "B0_FREE" in data["budget_tiers"]
    assert "G1_CUSTOMER_REACH" in data["business_goals"]
    assert "P1_FIND_CONTACT" in data["pain_points"]
    assert "U1_NOT_URGENT" in data["urgency_tiers"]
    assert "TOOL_UPI_QR" in data["existing_tools"]

    # 2. Experiments registry endpoint
    exp_res = await client.get("/api/v1/requirements/experiments")
    assert exp_res.status_code == 200
    exps = exp_res.json()["data"]
    assert len(exps) == 12
    assert exps[0]["code"] == "E-01"
    assert exps[11]["code"] == "E-12"


@pytest.mark.asyncio
async def test_requirement_profile_and_recommendation_traceability_lifecycle(
    client: AsyncClient, db_session: AsyncSession
):
    """End-to-end integration test:
    1. Register user & business.
    2. Start assessment.
    3. Save requirement profile (Goal G1, Pain P1, Urgency U4, Budget B0_FREE, Tools [TOOL_UPI_QR]).
    4. Save answers & submit assessment.
    5. Fetch recommendations -> verify feasibility_status, budget_fit, and traceability_json are populated.
    6. Record blind consultant evaluation on RBDL level, requirement profile, and recommendation appropriateness.
    """
    await seed_all_a3_data(db_session)

    unique_suffix = random.randint(10000000, 99999999)
    user_email = f"msme_req_{unique_suffix}@example.com"
    phone = f"97{unique_suffix}"[:10]

    # Register & Login
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={"email": user_email, "full_name": "Kavita Fabrics", "phone_number": phone, "password": "Password123!"},
    )
    assert reg_res.status_code == 201

    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": user_email, "password": "Password123!"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Register Business
    biz_res = await client.post(
        "/api/v1/businesses",
        headers=headers,
        json={
            "name": "Kavita Handlooms",
            "sector": "Retail & Trade",
            "enterprise_size": "Micro",
            "city": "Varanasi",
            "state": "Uttar Pradesh",
            "pincode": "221001",
        },
    )
    assert biz_res.status_code == 201
    biz_id = biz_res.json()["data"]["id"]

    # Start Assessment
    start_res = await client.post(
        "/api/v1/assessments",
        headers=headers,
        json={"business_id": biz_id, "language_used": "en"},
    )
    assert start_res.status_code == 201
    assessment_id = start_res.json()["data"]["id"]

    # Save Requirement Profile
    prof_payload = {
        "assessment_id": assessment_id,
        "business_id": biz_id,
        "business_goal": "G1_CUSTOMER_REACH",
        "primary_pain_point": "P1_FIND_CONTACT",
        "urgency": "U4_IMMEDIATE",
        "budget_tier": "B0_FREE",
        "existing_tools": ["TOOL_UPI_QR"],
        "preferred_solution_type": "mobile_first",
    }
    save_prof_res = await client.post(
        "/api/v1/requirements/profile",
        headers=headers,
        json=prof_payload,
    )
    assert save_prof_res.status_code == 201
    prof_data = save_prof_res.json()["data"]
    assert prof_data["business_goal"] == "G1_CUSTOMER_REACH"
    assert prof_data["budget_tier"] == "B0_FREE"
    assert prof_data["profile_version"] == 1

    # Fetch Saved Requirement Profile
    get_prof_res = await client.get(
        f"/api/v1/requirements/profile/{assessment_id}",
        headers=headers,
    )
    assert get_prof_res.status_code == 200
    assert get_prof_res.json()["data"]["primary_pain_point"] == "P1_FIND_CONTACT"

    # Fetch questions and answer them
    q_res = await client.get(f"/api/v1/assessments/{assessment_id}/questions", headers=headers)
    questions = q_res.json()["data"]["questions"]
    assert len(questions) > 0

    answers = []
    for q in questions:
        # Choose first available option
        opt_id = q["options"][0]["id"]
        answers.append({
            "question_id": q["id"],
            "selected_option_id": opt_id,
            "selected_option_ids": [opt_id],
            "is_na": False,
        })

    # Save answers
    save_ans_res = await client.put(
        f"/api/v1/assessments/{assessment_id}/answers",
        headers=headers,
        json={"answers": answers, "language_used": "en"},
    )
    assert save_ans_res.status_code == 200

    # Submit assessment
    sub_res = await client.post(
        f"/api/v1/assessments/{assessment_id}/submit",
        headers=headers,
    )
    assert sub_res.status_code == 200

    # Fetch recommendations and check budget feasibility and traceability
    rec_res = await client.get(
        f"/api/v1/recommendations/business/{biz_id}",
        headers=headers,
    )
    assert rec_res.status_code == 200
    recs = rec_res.json()["data"]["recommendations"]
    assert len(recs) > 0

    for r in recs:
        assert "feasibility_status" in r
        assert r["feasibility_status"] in [
            "FEASIBLE_NOW",
            "LOWER_COST_ALTERNATIVE",
            "DEFER_DUE_TO_BUDGET",
            "ALREADY_HAVE",
            "ELIGIBLE",
        ]
        assert "traceability_json" in r
        if r["traceability_json"]:
            assert "step_1_assessment" in r["traceability_json"]
            assert "step_3_business_context" in r["traceability_json"]
            assert r["traceability_json"]["step_3_business_context"]["budget_tier"] == "B0_FREE"

    # Submit Blind Consultant Evaluation
    eval_payload = {
        "assessment_id": assessment_id,
        "labeled_rbdl_level": 1,
        "labeled_business_goal": "G1_CUSTOMER_REACH",
        "labeled_primary_pain_point": "P1_FIND_CONTACT",
        "labeled_budget_tier": "B0_FREE",
        "labeled_urgency": "U4_IMMEDIATE",
        "rationales": "Business has basic mobile presence, needs structured discoverability.",
        "recommendation_ratings": {
            "REC-PRES-01": {"appropriate": True, "notes": "Highly relevant for Varanasi local reach"},
        },
    }
    eval_res = await client.post(
        "/api/v1/requirements/consultant-evaluations",
        headers=headers,
        json=eval_payload,
    )
    assert eval_res.status_code == 201
    eval_data = eval_res.json()["data"]
    assert eval_data["labeled_rbdl_level"] == 1
    assert eval_data["labeled_budget_tier"] == "B0_FREE"

    # List Consultant Evaluations
    list_eval_res = await client.get(
        f"/api/v1/requirements/consultant-evaluations?assessment_id={assessment_id}",
        headers=headers,
    )
    assert list_eval_res.status_code == 200
    assert len(list_eval_res.json()["data"]) >= 1
