"""Unit Tests for Evaluation Metrics (C5 Section 12 & 22)."""

import numpy as np
from app.ml.evaluation.metrics import compute_metrics


def test_metrics_calculation_standard_case():
    """Verify metrics calculation for multi-class classification."""
    y_true = [0, 1, 2, 3, 0, 1, 2, 3]
    y_pred = [0, 1, 2, 3, 0, 1, 1, 3]  # 7/8 correct

    res = compute_metrics(y_true, y_pred)

    assert res["accuracy"] == 0.875
    assert 0.0 <= res["macro_f1"] <= 1.0
    assert 0.0 <= res["weighted_f1"] <= 1.0
    assert res["mean_absolute_error_ordinal"] == 0.125
    assert 0.0 <= res["quadratic_weighted_kappa"] <= 1.0
    assert len(res["confusion_matrix"]) == 4
    assert len(res["confusion_matrix"][0]) == 4
    assert "Level 0" in res["per_class"]
    assert "Level 3" in res["per_class"]


def test_metrics_missing_class_edge_case():
    """Verify metrics computation gracefully handles missing classes in ground truth without crashing."""
    y_true = [0, 1, 0, 1]  # Levels 2 and 3 completely absent
    y_pred = [0, 1, 0, 0]

    res = compute_metrics(y_true, y_pred)

    assert res["accuracy"] == 0.75
    assert "macro_f1" in res
    assert "quadratic_weighted_kappa" in res
    assert res["per_class"]["Level 2"]["support"] == 0
    assert res["per_class"]["Level 3"]["support"] == 0
