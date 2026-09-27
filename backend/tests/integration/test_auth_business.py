"""Integration tests for user registration, JWT login, and business CRUD endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_and_login_flow(client: AsyncClient):
    # 1. Register User
    reg_payload = {
        "email": "msme_owner@example.in",
        "password": "SecurePassword123!",
        "full_name": "Ramesh Sharma",
        "phone_number": "+919876543210",
        "role": "business_owner",
    }
    reg_resp = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert reg_data["success"] is True
    assert reg_data["data"]["email"] == "msme_owner@example.in"

    # 2. Login
    login_payload = {
        "email": "msme_owner@example.in",
        "password": "SecurePassword123!",
    }
    login_resp = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert login_data["success"] is True
    assert "access_token" in login_data["data"]
    assert login_data["data"]["user"]["email"] == "msme_owner@example.in"


@pytest.mark.asyncio
async def test_business_registration_authenticated_slice(client: AsyncClient):
    # 1. Register and Login User 1
    user1_email = "owner1@enterprise.in"
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": user1_email,
            "password": "Password123!",
            "full_name": "Suresh Patel",
            "role": "business_owner",
        },
    )
    login1_res = await client.post(
        "/api/v1/auth/login",
        json={"email": user1_email, "password": "Password123!"},
    )
    token1 = login1_res.json()["data"]["access_token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # 2. Test Unauthenticated Business Creation -> 401
    biz_payload = {
        "name": "Patel Kirana & General Store",
        "sector": "Retail",
        "enterprise_size": "Micro",
        "state": "Gujarat",
        "city": "Ahmedabad",
        "pincode": "380001",
        "description": "Local grocery store",
        "primary_language": "hi",
    }
    unauth_resp = await client.post("/api/v1/businesses", json=biz_payload)
    assert unauth_resp.status_code == 401

    # 3. Test Authenticated Business Creation -> 201 Created
    auth_resp = await client.post("/api/v1/businesses", json=biz_payload, headers=headers1)
    assert auth_resp.status_code == 201
    biz_data = auth_resp.json()
    assert biz_data["success"] is True
    biz_id = biz_data["data"]["id"]
    assert biz_id > 0
    assert biz_data["data"]["name"] == "Patel Kirana & General Store"
    assert biz_data["data"]["enterprise_size"] == "Micro"

    # 4. Test Fetch Business by ID -> 200 OK
    get_resp = await client.get(f"/api/v1/businesses/{biz_id}", headers=headers1)
    assert get_resp.status_code == 200
    assert get_resp.json()["data"]["id"] == biz_id
    assert get_resp.json()["data"]["city"] == "Ahmedabad"

    # 5. Test List Businesses -> 200 OK with array
    list_resp = await client.get("/api/v1/businesses", headers=headers1)
    assert list_resp.status_code == 200
    list_data = list_resp.json()["data"]
    assert len(list_data) == 1
    assert list_data[0]["id"] == biz_id

    # 6. Register User 2 and verify isolation -> 403 Forbidden
    user2_email = "owner2@enterprise.in"
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": user2_email,
            "password": "Password123!",
            "full_name": "Anita Verma",
            "role": "business_owner",
        },
    )
    login2_res = await client.post(
        "/api/v1/auth/login",
        json={"email": user2_email, "password": "Password123!"},
    )
    token2 = login2_res.json()["data"]["access_token"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    forbidden_resp = await client.get(f"/api/v1/businesses/{biz_id}", headers=headers2)
    assert forbidden_resp.status_code == 403
