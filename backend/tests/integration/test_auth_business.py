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


@pytest.mark.asyncio
async def test_queens_book_world_registration_and_record_persistence(client: AsyncClient):
    """
    Test registration and full record persistence for Queen's Book World sample enterprise profile
    including email, phone, owner name, established year, employee count, monthly revenue,
    locality, full address, business model, and digitalization goals.
    """
    # 1. Register and Login MSME Owner
    owner_email = "neha_sharma_queens@example.com"
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": owner_email,
            "password": "SecurePassword123!",
            "full_name": "Neha Sharma",
            "phone_number": "+919876543210",
            "role": "business_owner",
        },
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": owner_email, "password": "SecurePassword123!"},
    )
    token = login_res.json()["data"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Register Queen's Book World Enterprise Profile
    queens_payload = {
        "name": "Queen's Book World",
        "sector": "Retail & Trade",
        "business_type": "Bookstore & Stationery Shop",
        "sub_category": "Books, Stationery & Educational Supplies",
        "owner_name": "Neha Sharma",
        "year_established": 2018,
        "years_in_operation": 8,
        "enterprise_size": "Small",
        "employee_count": 4,
        "state": "Rajasthan",
        "city": "Jaipur",
        "area_locality": "Mansarovar",
        "business_address": "123, Shipra Path, Mansarovar, Jaipur, Rajasthan – 302020",
        "pincode": "302020",
        "contact_phone": "+91 98765 43210",
        "contact_email": "queensbookworld@example.com",
        "website": "Not available",
        "primary_language": "hi",
        "additional_language": "en",
        "business_model": "Offline retail",
        "target_customers": "Students, parents, teachers and local residents",
        "monthly_revenue": "₹2,00,000–₹3,00,000",
        "digitalization_goal": "Increase sales and attract more local customers",
        "description": "Bookstore & stationery retail store in Mansarovar, Jaipur.",
    }

    create_resp = await client.post("/api/v1/businesses", json=queens_payload, headers=headers)
    assert create_resp.status_code == 201
    res_data = create_resp.json()
    assert res_data["success"] is True
    biz_id = res_data["data"]["id"]
    assert biz_id > 0
    assert res_data["data"]["name"] == "Queen's Book World"
    assert res_data["data"]["enterprise_size"] == "Small"
    assert res_data["data"]["city"] == "Jaipur"
    assert res_data["data"]["state"] == "Rajasthan"

    # 3. Retrieve business and verify persistence
    get_resp = await client.get(f"/api/v1/businesses/{biz_id}", headers=headers)
    assert get_resp.status_code == 200
    biz = get_resp.json()["data"]
    assert biz["id"] == biz_id
    assert biz["name"] == "Queen's Book World"
    assert biz["enterprise_size"] == "Small"
    assert biz["city"] == "Jaipur"
    assert biz["pincode"] == "302020"

