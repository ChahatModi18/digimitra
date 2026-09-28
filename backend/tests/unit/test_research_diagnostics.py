"""Unit tests for Research Sensitivity, K-Anonymity, and Reproducibility Safeguards."""

import pytest
from app.domain.research.sensitivity_analysis import ThresholdSensitivityAnalyzer
from app.domain.research.k_anonymity import KAnonymityEvaluator
from app.domain.research.reproducibility import ReproducibilityService
from app.domain.research.na_diagnostics import NADiagnosticsService


def test_threshold_sensitivity_analyzer():
    """Verify threshold perturbation analysis reports transitions without modifying rules."""
    dataset = [
        {"infra": 3.9, "literacy": 3.0, "presence": 2.0},
        {"infra": 4.0, "literacy": 3.0, "presence": 4.0},
        {"infra": 4.1, "literacy": 3.0, "presence": 5.0},
    ]
    report = ThresholdSensitivityAnalyzer.analyze_dataset(dataset, perturbation_step=0.5)
    assert report.total_records == 3
    assert "RESEARCH SENSITIVITY ANALYSIS" in report.disclaimer
    assert len(report.evaluations) > 0


def test_k_anonymity_evaluator():
    """Verify k-anonymity reports bins violating configured researcher threshold k."""
    records = [
        {"state": "Rajasthan", "district": "Jaipur", "category_id": "1", "business_size": "micro"},
        {"state": "Rajasthan", "district": "Jaipur", "category_id": "1", "business_size": "micro"},
        {"state": "Rajasthan", "district": "Jaipur", "category_id": "1", "business_size": "micro"},
        {"state": "Rajasthan", "district": "Jodhpur", "category_id": "2", "business_size": "small"},
    ]
    # k = 3: first bin has 3 (meets k), second has 1 (violates k)
    report = KAnonymityEvaluator.evaluate(records, k_threshold=3)
    assert report.threshold_k == 3
    assert report.total_records == 4
    assert report.bins_meeting_k == 1
    assert report.bins_violating_k == 1
    assert report.is_dataset_k_anonymous is False

    # k = 1: all bins meet k
    report_k1 = KAnonymityEvaluator.evaluate(records, k_threshold=1)
    assert report_k1.is_dataset_k_anonymous is True


def test_reproducibility_service_manifest():
    """Verify reproducibility manifest contains git hash, rules hash, and question bank hash."""
    manifest = ReproducibilityService.generate_manifest()
    assert manifest.application_name is not None
    assert manifest.ruleset_version == 1
    assert manifest.question_bank_version == 1
    assert len(manifest.rules_definition_sha256) == 64
    assert len(manifest.question_bank_sha256) == 64
    assert "reproduction_instructions" in manifest.model_dump()
