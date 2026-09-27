"""Integration tests for user registration, login, and business creation."""

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
async def test_create_and_get_business(client: AsyncClient):
    # First create a user to own the business
    reg_payload = {
        "email": "retailer@example.in",
        "password": "Password123!",
        "full_name": "Suresh Patel",
        "role": "business_owner",
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    # Create business
    biz_payload = {
        "name": "Patel Kirana & General Store",
        "sector": "Retail",
        "enterprise_size": "Micro",
        "state": "Gujarat",
        "city": "Ahmedabad",
        "pincode": "380001",
        "description": "Local neighborhood grocery store",
        "primary_language": "hi",
    }
    biz_resp = await client.post("/api/v1/businesses", json=biz_payload)
    assert biz_resp.status_code == 201
    biz_data = biz_resp.json()
    assert biz_data["success"] is True
    biz_id = biz_data["data"]["id"]
    assert biz_data["data"]["name"] == "Patel Kirana & General Store"

    # Fetch business by ID
    get_resp = await client.get(f"/api/v1/businesses/{biz_id}")
    assert get_resp.status_code == 200
    get_data = get_resp.json()
    assert get_data["data"]["id"] == biz_id
    assert get_data["data"]["sector"] == "Retail"
