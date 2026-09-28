"""Unit Tests for Feature Extraction & Schema (C5 Section 5 & 22)."""

from datetime import datetime, timezone
from app.ml.constants import DIMENSION_CODES, ALL_CANONICAL_FEATURES
from app.ml.features.feature_extractor import FeatureExtractor
from app.ml.features.feature_schema import get_feature_schema


def test_feature_schema_completeness():
    """Verify that canonical schema contains all 9 dimensions and metadata."""
    schema = get_feature_schema()
    assert schema["total_feature_count"] == len(ALL_CANONICAL_FEATURES)
    for dim in DIMENSION_CODES:
        assert f"{dim}_score" in schema["numeric_scores"]
        assert f"{dim}_missing" in schema["missing_indicators"]
    assert "business_size" in schema["categorical_features"]
    assert "category_id" in schema["categorical_features"]


def test_feature_extraction_normal_case():
    """Verify feature vector extraction with complete dimension scores."""
    dim_scores = {d: 6.5 for d in DIMENSION_CODES}
    biz_profile = {
        "sector": "Retail & Trade",
        "enterprise_size": "Small",
        "years_in_operation": 5.0,
        "employee_count": 8.0,
    }
    ass_data = {
        "total_questions": 14,
        "answered_questions": 14,
        "contradiction_flag": 0,
    }

    vec = FeatureExtractor.extract_from_raw(ass_data, dim_scores, biz_profile)

    assert len(vec) == len(ALL_CANONICAL_FEATURES)
    assert vec["infra_score"] == 6.5
    assert vec["infra_missing"] == 0
    assert vec["inventory_applicable"] == 1
    assert vec["completion_ratio"] == 1.0
    assert vec["contradiction_flag"] == 0
    assert vec["business_size"] == "small"
    assert vec["category_id"] == "Retail & Trade"
    assert vec["years_in_operation"] == 5.0
    assert vec["years_missing"] == 0
    assert vec["employee_count"] == 8.0
    assert vec["employees_missing"] == 0


def test_feature_extraction_missing_values_treatment():
    """Verify missing score indicators and optional field imputation."""
    # Only infra provided, others missing
    dim_scores = {"infra": 4.0}
    biz_profile = {
        "sector": "Services & Consulting",
        "enterprise_size": "Micro",
        "years_in_operation": None,
        "employee_count": None,
    }
    ass_data = {
        "total_questions": 14,
        "answered_questions": 7,
        "contradiction_flag": 1,
    }

    vec = FeatureExtractor.extract_from_raw(ass_data, dim_scores, biz_profile)

    assert vec["infra_score"] == 4.0
    assert vec["infra_missing"] == 0
    assert vec["literacy_score"] == 0.0
    assert vec["literacy_missing"] == 1
    # Services sector with missing inventory score should have inventory_applicable = 0
    assert vec["inventory_applicable"] == 0
    assert vec["completion_ratio"] == 0.5
    assert vec["contradiction_flag"] == 1
    assert vec["years_in_operation"] == 0.0
    assert vec["years_missing"] == 1
    assert vec["employee_count"] == 0.0
    assert vec["employees_missing"] == 1
