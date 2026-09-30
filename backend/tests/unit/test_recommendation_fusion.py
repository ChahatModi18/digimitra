"""Unit Tests for RecommendationFusionService."""

import pytest
from app.services.recommendation_fusion_service import RecommendationFusionService


def test_fusion_preserves_c4_invariants():
    dim_scores = {
        "infra": 3.0,
        "literacy": 3.0,
        "presence": 1.0,
        "comms": 2.0,
        "records": 1.0,
        "payments": 1.0,
        "inventory": 1.0,
        "data_usage": 1.0,
        "growth": 1.0,
    }
    biz = {
        "sector_code": "RETAIL",
        "enterprise_size": "Micro",
        "business_type": "Kirana Store",
    }
    req = {
        "budget_tier": "B1_LOW",
        "monthly_budget_inr": 500,
        "primary_goal": "Increase Sales",
    }

    # ML advisory scores attempt to boost a recommendation and include an uncataloged fake recommendation
    ml_scores = {
        "REC_UPI_PAYMENTS": 0.99,
        "FAKE_UNAUTHORIZED_REC": 1.0,
    }

    result = RecommendationFusionService.fuse_recommendations(
        dimension_scores=dim_scores,
        current_level=1,
        business_profile=biz,
        requirement_profile=req,
        ml_advisory_scores=ml_scores,
    )

    recs = result["recommendations"]
    assert len(recs) > 0

    # 1. Fake unauthorized recommendation was never injected
    codes = [r["recommendation_code"] for r in recs]
    assert "FAKE_UNAUTHORIZED_REC" not in codes

    # 2. Invariants preserved
    assert result["fusion_metadata"]["deterministic_weight"] == 0.80
    assert result["fusion_metadata"]["ml_weight"] == 0.20
    assert result["phased_roadmap"] is not None


def test_fusion_fallback_without_ml_scores():
    dim_scores = {
        "infra": 5.0,
        "literacy": 4.0,
        "presence": 3.0,
        "comms": 3.0,
        "records": 2.0,
        "payments": 4.0,
        "inventory": 2.0,
        "data_usage": 2.0,
        "growth": 1.0,
    }
    biz = {
        "sector_code": "FOOD_BEV",
        "enterprise_size": "Micro",
    }

    # None ml scores -> safe fallback
    result = RecommendationFusionService.fuse_recommendations(
        dimension_scores=dim_scores,
        current_level=1,
        business_profile=biz,
        requirement_profile=None,
        ml_advisory_scores=None,
    )

    assert result["fusion_metadata"]["ml_applied"] is False
    assert result["fusion_metadata"]["ml_weight"] == 0.0
    assert len(result["recommendations"]) > 0

