"""Integration tests for Learning Flashcards, Government Initiatives, and Business Taxonomy APIs."""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_business_taxonomy_and_categories():
    response = client.get("/api/v1/businesses/categories/taxonomy")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "taxonomy" in data["data"]
    assert len(data["data"]["taxonomy"]) >= 11

    # Check flat categories list
    flat_res = client.get("/api/v1/businesses/categories")
    assert flat_res.status_code == 200
    flat_data = flat_res.json()
    assert flat_data["success"] is True
    assert len(flat_data["data"]) >= 49


def test_get_learning_flashcards_api():
    response = client.get("/api/v1/learning/flashcards")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    cards = data["data"]
    assert len(cards) >= 6

    # Test level filter
    lvl3_res = client.get("/api/v1/learning/flashcards?level=3")
    assert lvl3_res.status_code == 200
    lvl3_cards = lvl3_res.json()["data"]
    assert all(c["target_level"] == 3 for c in lvl3_cards)

    # Test get by card_id
    detail_res = client.get("/api/v1/learning/flashcards/CARD-L3-ANALYTICS")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()["data"]
    assert detail_data["card_id"] == "CARD-L3-ANALYTICS"
    assert "Analytics" in detail_data["topic"] or "Dashboards" in detail_data["topic"]


def test_get_government_initiatives_api():
    response = client.get("/api/v1/government/initiatives")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    initiatives = data["data"]
    assert len(initiatives) >= 8

    # Filter for Rajasthan
    raj_res = client.get("/api/v1/government/initiatives?state=Rajasthan")
    assert raj_res.status_code == 200
    raj_data = raj_res.json()["data"]
    codes = {i["initiative_code"] for i in raj_data}
    assert "GOV-RAJ-MLUPY" in codes

    # Filter for another state (e.g., Gujarat)
    gj_res = client.get("/api/v1/government/initiatives?state=Gujarat")
    assert gj_res.status_code == 200
    gj_data = gj_res.json()["data"]
    gj_codes = {i["initiative_code"] for i in gj_data}
    assert "GOV-RAJ-MLUPY" not in gj_codes

    # Detail endpoint
    detail_res = client.get("/api/v1/government/initiatives/GOV-UDYAM")
    assert detail_res.status_code == 200
    assert detail_res.json()["data"]["initiative_code"] == "GOV-UDYAM"

