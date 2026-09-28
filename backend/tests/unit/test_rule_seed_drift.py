"""Unit tests for Rule, Seed, and Database Drift Checker (Safeguard I-02)."""

import pytest
from app.domain.rbdl.drift_checker import DriftChecker
from app.domain.rbdl.question_bank_v1 import QUESTIONS_V1, QUESTION_BANK_VERSION
from app.domain.rbdl.rules_v1 import RULES_V1, RULESET_VERSION


@pytest.mark.asyncio
async def test_drift_checker_in_sync(db_session):
    """Verify that canonical question bank and ruleset match the active database schema."""
    result = await DriftChecker.check_database_drift(db_session)
    assert result["has_drift"] is False, f"Drift detected: {result['mismatches']}"
    assert result["status"] == "IN_SYNC"
    assert result["checked_counts"]["canonical_questions"] == 14
    assert result["checked_counts"]["canonical_rules"] == 3
