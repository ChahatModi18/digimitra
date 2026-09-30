"""Unit Tests for Learning Flashcards and Government Initiatives Domain Models."""

import pytest
from app.domain.learning.flashcards import (
    FLASHCARDS_CATALOG,
    get_all_flashcards,
    get_flashcards_by_level,
    get_flashcard_for_recommendation,
    get_flashcard_by_id,
)
from app.domain.government.initiatives import (
    GOVERNMENT_INITIATIVES_CATALOG,
    get_all_initiatives,
    get_initiative_by_code,
    get_initiatives_for_business,
)


def test_flashcards_catalog_integrity_and_12_attributes():
    cards = get_all_flashcards()
    assert len(cards) >= 6

    level_3_cards = [c for c in cards if c.target_level == 3]
    assert len(level_3_cards) >= 4  # Advanced Analytics, CRM, ONDC, Cybersecurity

    for c in cards:
        # Verify 12 mandatory attributes exist and are non-empty
        assert c.card_id
        assert c.topic
        assert c.title_en and c.title_hi
        assert c.what_is_it_en and c.what_is_it_hi
        assert c.why_matters_en and c.why_matters_hi
        assert c.who_needs_it_en and c.who_needs_it_hi
        assert c.when_to_adopt_en and c.when_to_adopt_hi
        assert len(c.prerequisites_en) > 0 and len(c.prerequisites_hi) > 0
        assert c.complexity in ["Low", "Medium", "High"]
        assert len(c.implementation_steps_en) > 0 and len(c.implementation_steps_hi) > 0
        assert len(c.common_mistakes_en) > 0 and len(c.common_mistakes_hi) > 0
        assert c.expected_benefit_en and c.expected_benefit_hi
        assert len(c.what_to_measure_en) > 0 and len(c.what_to_measure_hi) > 0
        assert c.low_cost_alternative_en and c.low_cost_alternative_hi
        assert c.next_action_en and c.next_action_hi


def test_flashcard_filtering_by_level_and_id():
    l1 = get_flashcards_by_level(1)
    assert all(c.target_level == 1 for c in l1)

    l2 = get_flashcards_by_level(2)
    assert all(c.target_level == 2 for c in l2)

    l3 = get_flashcards_by_level(3)
    assert all(c.target_level == 3 for c in l3)

    card = get_flashcard_by_id("CARD-L3-ANALYTICS")
    assert card is not None
    assert "Analytics" in card.topic or "Dashboards" in card.topic


def test_government_initiatives_catalog_integrity():
    initiatives = get_all_initiatives()
    assert len(initiatives) >= 8

    codes = {init.initiative_code for init in initiatives}
    expected_codes = {
        "GOV-UDYAM",
        "GOV-ZED",
        "GOV-TREDS",
        "GOV-GEM",
        "GOV-ONDC",
        "GOV-CGTMSE",
        "GOV-VISHWAKARMA",
        "GOV-RAJ-MLUPY",
    }
    assert expected_codes.issubset(codes)

    for init in initiatives:
        assert init.official_source_url.startswith("https://")
        assert "official portal" in init.disclaimer.lower() or "eligibility" in init.disclaimer.lower() or "guarantee" in init.disclaimer.lower()
        assert init.verification_status == "VERIFIED_OFFICIAL"


def test_government_initiatives_filtering_by_state_and_sector():
    # Rajasthan business gets national + Rajasthan MLUPY
    raj_inits = get_initiatives_for_business(state="Rajasthan", sector="Manufacturing & Engineering", current_level=1)
    raj_codes = {i.initiative_code for i in raj_inits}
    assert "GOV-RAJ-MLUPY" in raj_codes
    assert "GOV-UDYAM" in raj_codes

    # Maharashtra business gets national schemes but NOT Rajasthan MLUPY
    mh_inits = get_initiatives_for_business(state="Maharashtra", sector="Retail & Trade", current_level=1)
    mh_codes = {i.initiative_code for i in mh_inits}
    assert "GOV-RAJ-MLUPY" not in mh_codes
    assert "GOV-UDYAM" in mh_codes

