"""Unit Tests for Discovery Service and Category Mappings (A8)."""

import pytest
from app.domain.discovery.categories import (
    DISCOVERY_CATEGORIES,
    DISCOVERY_CATEGORY_MAP,
    get_suggested_categories_for_dimensions,
)
from app.domain.discovery.provider_adapter import (
    DeterministicMockProvider,
    EmptyFallbackProvider,
    get_discovery_provider,
)
from app.domain.discovery.discovery_service import DiscoveryService
from app.schemas.discovery import ServiceSearchQuery


def test_discovery_categories_completeness():
    """Verify all 8 canonical discovery categories are present and populated."""
    assert len(DISCOVERY_CATEGORIES) == 8
    expected_cats = [
        "payments",
        "accounting",
        "website",
        "marketing",
        "training",
        "msme_support",
        "infrastructure",
        "security",
    ]
    for cat_id in expected_cats:
        assert cat_id in DISCOVERY_CATEGORY_MAP
        cat = DISCOVERY_CATEGORY_MAP[cat_id]
        assert cat.name_en
        assert cat.name_hi
        assert cat.description_en
        assert cat.description_hi
        assert cat.icon_name
        assert len(cat.relevant_dimensions) > 0


def test_suggested_categories_from_dimensions():
    """Verify mapping from weak assessment dimensions to discovery categories."""
    weak = ["payments", "presence"]
    suggested = get_suggested_categories_for_dimensions(weak)
    assert "payments" in suggested
    assert "website" in suggested or "marketing" in suggested


def test_empty_fallback_provider():
    """Verify production default provider returns empty state with zero fabricated data."""
    provider = EmptyFallbackProvider()
    query = ServiceSearchQuery(category="payments", state="Rajasthan")
    items, total, status, msg_en, msg_hi = provider.search_services(query)

    assert total == 0
    assert len(items) == 0
    assert status == "empty_unconfigured"
    assert "District Industries Centre" in msg_en
    assert "जिला उद्योग केंद्र" in msg_hi


def test_deterministic_mock_provider_filtering():
    """Verify deterministic mock provider filters correctly in test mode."""
    provider = DeterministicMockProvider()

    # 1. Filter by category
    q_cat = ServiceSearchQuery(category="payments")
    items, total, _, _, _ = provider.search_services(q_cat)
    assert total >= 1
    for item in items:
        assert item.category_id == "payments"
        assert item.is_mock_data is True

    # 2. Filter by search term
    q_search = ServiceSearchQuery(search_term="bookkeeping")
    items, total, _, _, _ = provider.search_services(q_search)
    assert total >= 1
    assert items[0].category_id == "accounting"

    # 3. Filter by state
    q_state = ServiceSearchQuery(state="Maharashtra")
    items, total, _, _, _ = provider.search_services(q_state)
    assert total >= 1
    assert "Maharashtra" in items[0].state


@pytest.mark.asyncio
async def test_discovery_service_orchestrator():
    """Verify discovery service methods."""
    service = DiscoveryService()

    # Category list
    cats = service.get_categories()
    assert len(cats) == 8

    # Category by ID
    cat = service.get_category_by_id("payments")
    assert cat is not None
    assert cat.id == "payments"

    # Empty search
    res = await service.search_services(ServiceSearchQuery(), use_test_mock=False)
    assert res.total_count == 0
    assert res.provider_status == "empty_unconfigured"

    # Mock search
    res_mock = await service.search_services(ServiceSearchQuery(category="website"), use_test_mock=True)
    assert res_mock.total_count >= 1
    assert res_mock.provider_status == "mock_test"
    assert res_mock.items[0].category_id == "website"
