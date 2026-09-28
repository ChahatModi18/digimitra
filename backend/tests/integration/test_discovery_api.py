"""Integration Tests for Discovery API Endpoints (A8)."""

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_get_categories_endpoint():
    """Verify GET /api/v1/explore/categories returns the full 8-category taxonomy."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/explore/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 8
        ids = [cat["id"] for cat in data]
        assert "payments" in ids
        assert "accounting" in ids
        assert "website" in ids
        assert "marketing" in ids
        assert "training" in ids
        assert "msme_support" in ids
        assert "infrastructure" in ids
        assert "security" in ids


@pytest.mark.asyncio
async def test_search_services_empty_unconfigured_default():
    """Verify GET /api/v1/explore/services defaults to clean empty state without external provider."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/explore/services?category=payments")
        assert response.status_code == 200
        data = response.json()
        assert data["total_count"] == 0
        assert data["items"] == []
        assert data["provider_status"] == "empty_unconfigured"
        assert "District Industries Centre" in data["provider_message_en"]


@pytest.mark.asyncio
async def test_search_services_mock_test_mode():
    """Verify GET /api/v1/explore/services with test_mock=true returns deterministic mock data."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/v1/explore/services?category=payments&test_mock=true")
        assert response.status_code == 200
        data = response.json()
        assert data["total_count"] >= 1
        assert data["provider_status"] == "mock_test"
        item = data["items"][0]
        assert item["category_id"] == "payments"
        assert item["is_mock_data"] is True
        assert "[MOCK — TEST ONLY]" in item["name"]


@pytest.mark.asyncio
async def test_get_service_by_id_endpoint():
    """Verify GET /api/v1/explore/services/{id} endpoint behavior."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Existing mock item
        res = await client.get("/api/v1/explore/services/mock-pay-01?test_mock=true")
        assert res.status_code == 200
        data = res.json()
        assert data["id"] == "mock-pay-01"

        # Non-existent item
        res_404 = await client.get("/api/v1/explore/services/non-existent-id?test_mock=true")
        assert res_404.status_code == 404
