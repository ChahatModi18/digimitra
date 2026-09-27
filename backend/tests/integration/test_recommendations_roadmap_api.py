"""Integration tests for DigiMitra Phase A4: Recommendations, Phased Roadmap API, Versioning, and Security."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.rbdl.seeder import seed_all_a3_data


@pytest.mark.asyncio
async def test_recommendations_and_roadmap_api_lifecycle(client: AsyncClient, db_session: AsyncSession):
    """End-to-end integration test:
    1. Register user and business.
    2. Complete and submit assessment (Level 0).
    3. Auto-generated recommendations (targeting Level 1) and Phased Roadmap v1.
    4. Fetch recommendations and verify priority scoring and bilingual reasons.
    5. Update task status to in_progress and completed.
    6. Complete reassessment -> verify Roadmap v2 generated, v1 superseded, and history list.
    7. Verify cross-user ownership isolation.
    """
    # 0. Ensure domain data is seeded
    await seed_all_a3_data(db_session)

    import random
    unique_suffix = random.randint(10000000, 99999999)
    # 1. Register and Login User A
    user_a_email = f"msme_c4_a_{unique_suffix}@example.com"
    phone_a = f"98{unique_suffix}"[:10]
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={"email": user_a_email, "full_name": "Ramesh Retail", "phone_number": phone_a, "password": "Password123!"},
    )
    assert reg_res.status_code == 201
    login_a_res = await client.post(
        "/api/v1/auth/login",
        json={"email": user_a_email, "password": "Password123!"},
    )
    assert login_a_res.status_code == 200
    token_a = login_a_res.json()["data"]["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register Business A (Retail)
    biz_res = await client.post(
        "/api/v1/businesses",
        headers=headers_a,
        json={
            "name": "Ramesh General Store",
            "sector": "Retail & Trade",
            "enterprise_size": "Micro",
            "city": "Lucknow",
            "state": "Uttar Pradesh",
            "pincode": "226001",
        },
    )
    assert biz_res.status_code == 201
    business_id = biz_res.json()["data"]["id"]

    # 2. Start Assessment 1
    start_res = await client.post(
        "/api/v1/assessments",
        headers=headers_a,
        json={"business_id": business_id, "language_used": "en"},
    )
    assert start_res.status_code == 201
    assessment_1_id = start_res.json()["data"]["id"]

    # Answer questions with low digital scores (Level 0)
    q_res = await client.get(f"/api/v1/assessments/{assessment_1_id}/questions", headers=headers_a)
    questions = q_res.json()["data"]["questions"]

    answers_payload = []
    for q in questions:
        if q["question_type"] == "single_choice":
            # Pick the lowest score option (e.g. "No" or cash only)
            lowest_opt = min(q["options"], key=lambda o: o["score_value"])
            answers_payload.append({"question_id": q["id"], "selected_option_id": lowest_opt["id"]})
        elif q["question_type"] == "boolean":
            lowest_opt = min(q["options"], key=lambda o: o["score_value"])
            answers_payload.append({"question_id": q["id"], "selected_option_id": lowest_opt["id"]})
        elif q["question_type"] == "multi_choice":
            none_opt = next((o for o in q["options"] if "NONE" in o["option_code"].upper()), q["options"][0])
            answers_payload.append({"question_id": q["id"], "selected_option_ids": [none_opt["id"]]})

    await client.put(
        f"/api/v1/assessments/{assessment_1_id}/answers",
        headers=headers_a,
        json={"language_used": "en", "answers": answers_payload},
    )

    # Submit Assessment 1 (Classified as Level 0)
    sub_res = await client.post(f"/api/v1/assessments/{assessment_1_id}/submit", headers=headers_a)
    assert sub_res.status_code == 200
    assert sub_res.json()["data"]["rbdl_level"] == 0

    # 3. Retrieve Active Roadmap
    rm_res = await client.get(f"/api/v1/roadmap/business/{business_id}", headers=headers_a)
    assert rm_res.status_code == 200
    roadmap_data = rm_res.json()["data"]
    assert roadmap_data["version"] == 1
    assert roadmap_data["status"] == "active"
    assert roadmap_data["current_rbdl_level"] == 0
    assert roadmap_data["total_tasks"] > 0
    assert len(roadmap_data["all_tasks"]) > 0

    first_task = roadmap_data["all_tasks"][0]
    assert first_task["status"] == "pending"
    assert len(first_task["title_en"]) > 0
    assert len(first_task["title_hi"]) > 0

    # 4. Retrieve Ranked Recommendations
    rec_res = await client.get(f"/api/v1/recommendations/business/{business_id}", headers=headers_a)
    assert rec_res.status_code == 200
    recs_data = rec_res.json()["data"]
    assert recs_data["total_recommendations"] > 0
    first_rec = recs_data["recommendations"][0]
    assert first_rec["priority_score"] is not None
    assert first_rec["impact_score"] is not None
    assert len(first_rec["reason_en"]) > 0
    assert len(first_rec["reason_hi"]) > 0
    # Level 0 business must only receive target Level 1 recommendations
    for r in recs_data["recommendations"]:
        assert r["target_rbdl_level"] == 1

    # 5. Update Task Status
    task_id = first_task["id"]
    patch_res = await client.patch(
        f"/api/v1/roadmap/tasks/{task_id}/status",
        headers=headers_a,
        json={"status": "completed"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["status"] == "completed"

    # 6. Reassessment Versioning: Start Assessment 2 for Business A
    start_2_res = await client.post(
        "/api/v1/assessments",
        headers=headers_a,
        json={"business_id": business_id, "language_used": "en", "previous_assessment_id": assessment_1_id},
    )
    assert start_2_res.status_code == 201
    assessment_2_id = start_2_res.json()["data"]["id"]

    # Provide Level 1 passing answers for assessment 2 (smartphones and literacy)
    q2_res = await client.get(f"/api/v1/assessments/{assessment_2_id}/questions", headers=headers_a)
    questions_2 = q2_res.json()["data"]["questions"]
    answers_2_payload = []
    for q in questions_2:
        if q["dimension_code"] in ("infra", "literacy"):
            highest_opt = max(q["options"], key=lambda o: o["score_value"])
            answers_2_payload.append({"question_id": q["id"], "selected_option_id": highest_opt["id"]})
        elif q["question_type"] == "single_choice":
            lowest_opt = min(q["options"], key=lambda o: o["score_value"])
            answers_2_payload.append({"question_id": q["id"], "selected_option_id": lowest_opt["id"]})
        elif q["question_type"] == "boolean":
            lowest_opt = min(q["options"], key=lambda o: o["score_value"])
            answers_2_payload.append({"question_id": q["id"], "selected_option_id": lowest_opt["id"]})
        elif q["question_type"] == "multi_choice":
            none_opt = next((o for o in q["options"] if "NONE" in o["option_code"].upper()), q["options"][0])
            answers_2_payload.append({"question_id": q["id"], "selected_option_ids": [none_opt["id"]]})

    await client.put(
        f"/api/v1/assessments/{assessment_2_id}/answers",
        headers=headers_a,
        json={"language_used": "en", "answers": answers_2_payload},
    )

    # Submit Assessment 2 (Classified as Level 1)
    sub_2_res = await client.post(f"/api/v1/assessments/{assessment_2_id}/submit", headers=headers_a)
    assert sub_2_res.status_code == 200
    assert sub_2_res.json()["data"]["rbdl_level"] == 1

    # Verify new Roadmap is Version 2, active, and targets Level 2
    rm_2_res = await client.get(f"/api/v1/roadmap/business/{business_id}", headers=headers_a)
    assert rm_2_res.status_code == 200
    rm_2_data = rm_2_res.json()["data"]
    assert rm_2_data["version"] == 2
    assert rm_2_data["status"] == "active"
    assert rm_2_data["current_rbdl_level"] == 1
    assert rm_2_data["target_rbdl_level"] == 2

    # Verify Roadmap History List contains v1 and v2
    hist_res = await client.get(f"/api/v1/roadmap/business/{business_id}/history", headers=headers_a)
    assert hist_res.status_code == 200
    history = hist_res.json()["data"]
    assert len(history) == 2
    versions = [h["version"] for h in history]
    assert 1 in versions and 2 in versions

    # 7. Cross-Business Security Isolation: Register User B
    user_b_email = f"msme_c4_b_{unique_suffix}@example.com"
    phone_b = f"97{unique_suffix}"[:10]
    reg_b_res = await client.post(
        "/api/v1/auth/register",
        json={"email": user_b_email, "full_name": "Sita Services", "phone_number": phone_b, "password": "Password123!"},
    )
    assert reg_b_res.status_code == 201
    login_b_res = await client.post(
        "/api/v1/auth/login",
        json={"email": user_b_email, "password": "Password123!"},
    )
    assert login_b_res.status_code == 200
    token_b = login_b_res.json()["data"]["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User B attempting to read User A's roadmap or recommendations should fail (404/403)
    unauth_rm = await client.get(f"/api/v1/roadmap/business/{business_id}", headers=headers_b)
    assert unauth_rm.status_code in (403, 404)

    unauth_rec = await client.get(f"/api/v1/recommendations/business/{business_id}", headers=headers_b)
    assert unauth_rec.status_code in (403, 404)

