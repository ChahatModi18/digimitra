"""Integration tests for authentication security, RBAC enforcement, cross-tenant isolation, and SQL injection safety."""

import random
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.rbdl.seeder import seed_all_a3_data


@pytest.mark.asyncio
async def test_unauthenticated_requests_return_401(client: AsyncClient):
    """Verify that accessing protected endpoints without Bearer token returns 401 Unauthorized."""
    # 1. Business endpoint
    res_biz = await client.get("/api/v1/businesses")
    assert res_biz.status_code == 401

    # 2. Start Assessment endpoint
    res_ass = await client.post("/api/v1/assessments", json={"business_id": 1})
    assert res_ass.status_code == 401

    # 3. Recommendations endpoint
    res_rec = await client.get("/api/v1/recommendations/business/1")
    assert res_rec.status_code == 401

    # 4. Roadmap endpoint
    res_rm = await client.get("/api/v1/roadmap/business/1")
    assert res_rm.status_code == 401


@pytest.mark.asyncio
async def test_cross_user_tenant_isolation(client: AsyncClient, db_session: AsyncSession):
    """Verify that User B cannot read or modify User A's businesses or assessment data."""
    await seed_all_a3_data(db_session)

    suffix_a = random.randint(10000000, 99999999)
    suffix_b = random.randint(10000000, 99999999)

    # 1. Register User A and Business A
    email_a = f"user_a_{suffix_a}@example.com"
    await client.post(
        "/api/v1/auth/register",
        json={"email": email_a, "full_name": "User Alpha", "phone_number": f"91{suffix_a}"[:10], "password": "Password123!"},
    )
    login_a = await client.post("/api/v1/auth/login", json={"email": email_a, "password": "Password123!"})
    token_a = login_a.json()["data"]["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    biz_a_res = await client.post(
        "/api/v1/businesses",
        headers=headers_a,
        json={"name": "Alpha Traders", "sector": "Retail & Trade", "enterprise_size": "Micro", "city": "Jaipur", "state": "Rajasthan"},
    )
    biz_a_id = biz_a_res.json()["data"]["id"]

    # 2. Register User B
    email_b = f"user_b_{suffix_b}@example.com"
    await client.post(
        "/api/v1/auth/register",
        json={"email": email_b, "full_name": "User Beta", "phone_number": f"92{suffix_b}"[:10], "password": "Password123!"},
    )
    login_b = await client.post("/api/v1/auth/login", json={"email": email_b, "password": "Password123!"})
    token_b = login_b.json()["data"]["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # 3. User B tries to view Business A -> 404 / 403
    unauth_biz_get = await client.get(f"/api/v1/businesses/{biz_a_id}", headers=headers_b)
    assert unauth_biz_get.status_code in [403, 404]

    # 4. User B tries to start assessment for Business A -> 403 / 404
    unauth_ass_start = await client.post(
        "/api/v1/assessments",
        headers=headers_b,
        json={"business_id": biz_a_id},
    )
    assert unauth_ass_start.status_code in [403, 404]


@pytest.mark.asyncio
async def test_rbac_diagnostics_endpoint_protection(client: AsyncClient, db_session: AsyncSession):
    """Verify that diagnostic and audit endpoints require ADMIN or RESEARCHER role."""
    await seed_all_a3_data(db_session)

    suffix = random.randint(10000000, 99999999)
    email = f"regular_msme_{suffix}@example.com"

    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "full_name": "Regular MSME", "phone_number": f"93{suffix}"[:10], "password": "Password123!"},
    )
    login_res = await client.post("/api/v1/auth/login", json={"email": email, "password": "Password123!"})
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Regular business owner tries to access research diagnostic endpoints
    res_drift = await client.get("/api/v1/research/diagnostics/drift", headers=headers)
    assert res_drift.status_code == 403

    res_sens = await client.get("/api/v1/research/diagnostics/sensitivity", headers=headers)
    assert res_sens.status_code == 403

    res_kanon = await client.get("/api/v1/research/diagnostics/k-anonymity", headers=headers)
    assert res_kanon.status_code == 403


@pytest.mark.asyncio
async def test_sql_injection_payload_safety(client: AsyncClient, db_session: AsyncSession):
    """Verify that dangerous SQL characters and payloads are safely parameterized by SQLAlchemy ORM."""
    await seed_all_a3_data(db_session)

    suffix = random.randint(10000000, 99999999)
    email = f"sqli_test_{suffix}@example.com"

    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "full_name": "SQLi Test", "phone_number": f"94{suffix}"[:10], "password": "Password123!"},
    )
    login_res = await client.post("/api/v1/auth/login", json={"email": email, "password": "Password123!"})
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Register business with classic SQL injection payload strings
    sqli_payload_name = "O'Reilly Store; DROP TABLE businesses; --"
    biz_res = await client.post(
        "/api/v1/businesses",
        headers=headers,
        json={
            "name": sqli_payload_name,
            "sector": "Retail & Trade",
            "enterprise_size": "Micro",
            "city": "Jaipur'; DELETE FROM users; --",
            "state": "Rajasthan",
        },
    )
    assert biz_res.status_code == 201
    biz_id = biz_res.json()["data"]["id"]

    # Retrieve business and verify exact literal string stored without corruption or syntax error
    get_res = await client.get(f"/api/v1/businesses/{biz_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["name"] == sqli_payload_name
