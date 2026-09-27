"""Integration tests for health-check and diagnostics endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "DigiMitra API"
    assert data["status"] == "operational"
    assert "docs" in data
    assert "health" in data


@pytest.mark.asyncio
async def test_top_level_health(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "digimitra-backend"


@pytest.mark.asyncio
async def test_api_v1_health_detailed(client: AsyncClient):
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "uptime_seconds" in data
    assert "components" in data
    assert "database" in data["components"]
    assert data["components"]["database"]["status"] == "healthy"
    assert data["components"]["database"]["details"]["connected"] is True
    assert "i18n" in data["components"]
    assert "system_info" in data
