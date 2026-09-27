"""Unit and integration tests for Progress Tracking and Reassessment Comparison."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.rbdl.seeder import seed_all_a3_data


@pytest.mark.asyncio
async def test_progress_tracking_task_lifecycle_and_comparison(client: AsyncClient, db_session: AsyncSession):
    """Test full progress tracking, task status updates, repeated updates, history, and comparison."""
    # 0. Seed database domain data
    await seed_all_a3_data(db_session)

    import random
    suffix = random.randint(100000, 999999)
    user_email = f"msme_progress_{suffix}@example.com"
    phone = f"91{suffix}"[:10]

    # 1. Register and login
    reg_res = await client.post(
        "/api/v1/auth/register",
        json={"email": user_email, "full_name": "Deepak Electronics", "phone_number": phone, "password": "Password123!"},
    )
    assert reg_res.status_code == 201

    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": user_email, "password": "Password123!"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Register Business
    biz_res = await client.post(
        "/api/v1/businesses",
        headers=headers,
        json={
            "name": "Deepak Electronics",
            "sector": "Retail & Trade",
            "enterprise_size": "Micro",
            "city": "Jaipur",
            "state": "Rajasthan",
            "pincode": "302001",
        },
    )
    assert biz_res.status_code == 201
    biz_id = biz_res.json()["data"]["id"]

    # 3. Complete Assessment 1 (Baseline - Level 0)
    start_1 = await client.post(
        "/api/v1/assessments",
        headers=headers,
        json={"business_id": biz_id, "language_used": "en"},
    )
    assert start_1.status_code == 201
    ass_1_id = start_1.json()["data"]["id"]

    q1_res = await client.get(f"/api/v1/assessments/{ass_1_id}/questions", headers=headers)
    questions_1 = q1_res.json()["data"]["questions"]
    answers_1 = []
    for q in questions_1:
        if q["question_type"] in ("single_choice", "boolean"):
            lowest = min(q["options"], key=lambda o: o["score_value"])
            answers_1.append({"question_id": q["id"], "selected_option_id": lowest["id"]})
        elif q["question_type"] == "multi_choice":
            none_opt = next((o for o in q["options"] if "NONE" in o["option_code"].upper()), q["options"][0])
            answers_1.append({"question_id": q["id"], "selected_option_ids": [none_opt["id"]]})

    await client.put(f"/api/v1/assessments/{ass_1_id}/answers", headers=headers, json={"answers": answers_1})
    sub_1 = await client.post(f"/api/v1/assessments/{ass_1_id}/submit", headers=headers)
    assert sub_1.status_code == 200
    assert sub_1.json()["data"]["rbdl_level"] == 0

    # 4. Verify Active Roadmap and Progress Summary
    rm_res = await client.get(f"/api/v1/roadmap/business/{biz_id}", headers=headers)
    assert rm_res.status_code == 200
    rm_data = rm_res.json()["data"]
    assert rm_data["version"] == 1
    assert rm_data["completed_tasks"] == 0
    assert rm_data["total_tasks"] > 0
    assert rm_data["completion_percentage"] == 0.0

    # Test Progress Summary endpoint
    prog_res = await client.get(f"/api/v1/roadmap/business/{biz_id}/progress", headers=headers)
    assert prog_res.status_code == 200
    prog_data = prog_res.json()["data"]
    assert prog_data["total_tasks"] == rm_data["total_tasks"]
    assert prog_data["completed_tasks"] == 0
    assert prog_data["pending_tasks"] == rm_data["total_tasks"]

    # 5. Test Task State Transitions & Repeated Updates
    task_1 = rm_data["all_tasks"][0]
    task_1_id = task_1["id"]

    # Transition: pending -> in_progress
    patch_1 = await client.patch(
        f"/api/v1/roadmap/tasks/{task_1_id}/status",
        headers=headers,
        json={"status": "in_progress"},
    )
    assert patch_1.status_code == 200
    assert patch_1.json()["data"]["status"] == "in_progress"

    # Transition: in_progress -> completed
    patch_2 = await client.patch(
        f"/api/v1/roadmap/tasks/{task_1_id}/status",
        headers=headers,
        json={"status": "completed"},
    )
    assert patch_2.status_code == 200
    p2_data = patch_2.json()["data"]
    assert p2_data["status"] == "completed"
    assert p2_data["completed_at"] is not None

    # Transition: completed -> skipped (with reason)
    patch_3 = await client.patch(
        f"/api/v1/roadmap/tasks/{task_1_id}/status",
        headers=headers,
        json={"status": "skipped", "skip_reason": "Not needed currently"},
    )
    assert patch_3.status_code == 200
    assert patch_3.json()["data"]["status"] == "skipped"
    assert patch_3.json()["data"]["skip_reason"] == "Not needed currently"

    # Transition back to completed
    patch_4 = await client.patch(
        f"/api/v1/roadmap/tasks/{task_1_id}/status",
        headers=headers,
        json={"status": "completed"},
    )
    assert patch_4.status_code == 200
    assert patch_4.json()["data"]["status"] == "completed"

    # Complete second task if available
    if len(rm_data["all_tasks"]) > 1:
        task_2_id = rm_data["all_tasks"][1]["id"]
        await client.patch(
            f"/api/v1/roadmap/tasks/{task_2_id}/status",
            headers=headers,
            json={"status": "completed"},
        )

    # Verify progress summary updated
    prog_res_2 = await client.get(f"/api/v1/roadmap/business/{biz_id}/progress", headers=headers)
    assert prog_res_2.status_code == 200
    prog_2 = prog_res_2.json()["data"]
    assert prog_2["completed_tasks"] >= 1
    assert prog_2["completion_percentage"] > 0.0
    assert prog_2["is_ready_for_reassessment"] is True

    # 6. Reassessment: Assessment 2 (Improved - Level 1)
    start_2 = await client.post(
        "/api/v1/assessments",
        headers=headers,
        json={"business_id": biz_id, "previous_assessment_id": ass_1_id},
    )
    assert start_2.status_code == 201
    ass_2_id = start_2.json()["data"]["id"]

    q2_res = await client.get(f"/api/v1/assessments/{ass_2_id}/questions", headers=headers)
    questions_2 = q2_res.json()["data"]["questions"]
    answers_2 = []
    for q in questions_2:
        if q["dimension_code"] in ("infra", "literacy"):
            highest = max(q["options"], key=lambda o: o["score_value"])
            answers_2.append({"question_id": q["id"], "selected_option_id": highest["id"]})
        elif q["question_type"] in ("single_choice", "boolean"):
            lowest = min(q["options"], key=lambda o: o["score_value"])
            answers_2.append({"question_id": q["id"], "selected_option_id": lowest["id"]})
        elif q["question_type"] == "multi_choice":
            none_opt = next((o for o in q["options"] if "NONE" in o["option_code"].upper()), q["options"][0])
            answers_2.append({"question_id": q["id"], "selected_option_ids": [none_opt["id"]]})

    await client.put(f"/api/v1/assessments/{ass_2_id}/answers", headers=headers, json={"answers": answers_2})
    sub_2 = await client.post(f"/api/v1/assessments/{ass_2_id}/submit", headers=headers)
    assert sub_2.status_code == 200
    assert sub_2.json()["data"]["rbdl_level"] == 1

    # 7. Check Assessment History Timeline
    ass_hist_res = await client.get(f"/api/v1/assessments/business/{biz_id}/history", headers=headers)
    assert ass_hist_res.status_code == 200
    ass_history = ass_hist_res.json()["data"]
    assert len(ass_history) >= 2
    ass_ids = [h["id"] for h in ass_history]
    assert ass_1_id in ass_ids and ass_2_id in ass_ids

    # 8. Compare Assessments
    comp_res = await client.get(
        f"/api/v1/assessments/business/{biz_id}/compare?current_assessment_id={ass_2_id}&previous_assessment_id={ass_1_id}",
        headers=headers,
    )
    assert comp_res.status_code == 200
    comp_data = comp_res.json()["data"]
    assert comp_data["business_id"] == biz_id
    assert comp_data["previous_assessment_id"] == ass_1_id
    assert comp_data["previous_rbdl_level"] == 0
    assert comp_data["current_assessment_id"] == ass_2_id
    assert comp_data["current_rbdl_level"] == 1
    assert comp_data["level_change"] == 1
    assert comp_data["composite_score_delta"] > 0
    assert len(comp_data["dimension_comparisons"]) == 9
    assert comp_data["completed_tasks_count"] >= 1
    assert "guarantee or prove real-world business revenue" in comp_data["disclaimer_en"]

    # 9. Verify Historical Roadmap Retrieval by ID
    hist_rm_res = await client.get(f"/api/v1/roadmap/business/{biz_id}/history", headers=headers)
    assert hist_rm_res.status_code == 200
    histories = hist_rm_res.json()["data"]
    assert len(histories) >= 2
    rm_1_id = next(h["id"] for h in histories if h["version"] == 1)

    rm_1_detail = await client.get(f"/api/v1/roadmap/{rm_1_id}", headers=headers)
    assert rm_1_detail.status_code == 200
    assert rm_1_detail.json()["data"]["version"] == 1
    assert rm_1_detail.json()["data"]["status"] == "superseded"

    # 10. Security & Permitted Data Boundary Checks
    unauth_user_suffix = random.randint(100000, 999999)
    reg_unauth = await client.post(
        "/api/v1/auth/register",
        json={"email": f"unauth_{unauth_user_suffix}@example.com", "full_name": "Unauth User", "phone_number": f"90{unauth_user_suffix}"[:10], "password": "Password123!"},
    )
    assert reg_unauth.status_code == 201
    login_unauth = await client.post(
        "/api/v1/auth/login",
        json={"email": f"unauth_{unauth_user_suffix}@example.com", "password": "Password123!"},
    )
    unauth_token = login_unauth.json()["data"]["access_token"]
    unauth_headers = {"Authorization": f"Bearer {unauth_token}"}

    # Unauthorized access to User A's progress summary -> 403 / 404
    bad_prog = await client.get(f"/api/v1/roadmap/business/{biz_id}/progress", headers=unauth_headers)
    assert bad_prog.status_code in (403, 404)

    # Unauthorized access to User A's assessment comparison -> 403 / 404
    bad_comp = await client.get(f"/api/v1/assessments/business/{biz_id}/compare", headers=unauth_headers)
    assert bad_comp.status_code in (403, 404)

    # Unauthorized task update -> 403 / 404
    bad_patch = await client.patch(
        f"/api/v1/roadmap/tasks/{task_1_id}/status",
        headers=unauth_headers,
        json={"status": "completed"},
    )
    assert bad_patch.status_code in (403, 404)
