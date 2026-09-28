"""Unit Tests for Real Data Readiness Gate (C5 Section 20 & 22)."""

import pandas as pd
from app.ml.dataset.readiness_check import ReadinessCheck
from app.ml.synthetic.synthetic_generator import SyntheticDataGenerator


def test_readiness_check_insufficient_on_empty_or_small():
    """Verify readiness check reports insufficient when data is missing classes or too small."""
    # 1. Empty dataset
    df_empty = pd.DataFrame()
    res_empty = ReadinessCheck.evaluate_readiness(df_empty, stage="stage_1")
    assert res_empty["status"] == "insufficient"
    assert res_empty["cv_feasibility"]["feasible"] is False

    # 2. Dataset missing Level 3 and having only 1 business in Level 2
    df_imbalanced = pd.DataFrame([
        {"assessment_id": 1, "business_id": 101, "target_level": 0},
        {"assessment_id": 2, "business_id": 102, "target_level": 0},
        {"assessment_id": 3, "business_id": 103, "target_level": 1},
        {"assessment_id": 4, "business_id": 104, "target_level": 1},
        {"assessment_id": 5, "business_id": 105, "target_level": 2},
    ])
    res_imb = ReadinessCheck.evaluate_readiness(df_imbalanced, stage="stage_1")
    assert res_imb["status"] == "insufficient"
    assert 3 in res_imb["missing_classes"]
    assert "insufficient" in res_imb["explanation"].lower()


def test_readiness_check_ready_on_sufficient_synthetic():
    """Verify readiness check reports ready on a balanced dataset with sufficient businesses."""
    df_sufficient = SyntheticDataGenerator.generate_synthetic_dataset(
        n_businesses=50,
        assessments_per_business=2,
        random_seed=42,
    )
    res = ReadinessCheck.evaluate_readiness(df_sufficient, stage="stage_1")

    assert res["status"] == "ready"
    assert res["cv_feasibility"]["feasible"] is True
    assert len(res["missing_classes"]) == 0
    assert res["total_assessments"] == 100
