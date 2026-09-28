"""Unit Tests for ML vs Rule Comparison (C5 Section 14)."""

import numpy as np
from app.ml.comparison.ml_vs_rule import MLVsRuleComparator
from app.ml.constants import ML_VS_RULE_DISCLAIMER


def test_ml_vs_rule_comparison_standard():
    """Verify standard agreement calculation and confusion matrix structure."""
    rule_levels = [0, 1, 2, 3, 1, 2]
    ml_levels = [0, 1, 2, 2, 1, 2]  # 5/6 agreement

    res = MLVsRuleComparator.compare_predictions(rule_levels, ml_levels)

    assert res["total_comparisons"] == 6
    assert round(res["agreement_rate"], 3) == round(5 / 6, 3)
    assert 0.0 <= res["cohen_kappa_unweighted"] <= 1.0
    assert len(res["confusion_matrix"]) == 4
    assert len(res["confusion_matrix"][0]) == 4
    assert res["disclaimer"] == ML_VS_RULE_DISCLAIMER


def test_ml_vs_rule_comparison_empty():
    """Verify empty input handling returns 0 without crashing."""
    res = MLVsRuleComparator.compare_predictions([], [])

    assert res["total_comparisons"] == 0
    assert res["agreement_rate"] == 0.0
    assert res["cohen_kappa_unweighted"] == 0.0
    assert res["confusion_matrix"] == [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
    assert res["disclaimer"] == ML_VS_RULE_DISCLAIMER


def test_ml_vs_rule_comparison_perfect_agreement():
    """Verify Cohen Kappa is 1.0 on perfect agreement."""
    rule_levels = [0, 1, 2, 3]
    ml_levels = [0, 1, 2, 3]

    res = MLVsRuleComparator.compare_predictions(rule_levels, ml_levels)

    assert res["total_comparisons"] == 4
    assert res["agreement_rate"] == 1.0
    assert res["cohen_kappa_unweighted"] == 1.0
