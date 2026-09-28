"""Unit Tests for Experiment Tracking (C5 Section 15 & 22)."""

import pytest
from app.ml.experiment.experiment_tracker import ExperimentTracker
from app.ml.constants import STAGE_1_DISCLAIMER


def test_experiment_tracker_record_creation():
    """Verify experiment run record structure and aggregate statistics."""
    cv_metrics = [
        {"fold": 1, "macro_f1": 0.80, "accuracy": 0.85, "quadratic_weighted_kappa": 0.75, "mean_absolute_error_ordinal": 0.15},
        {"fold": 2, "macro_f1": 0.90, "accuracy": 0.95, "quadratic_weighted_kappa": 0.85, "mean_absolute_error_ordinal": 0.05},
    ]

    record = ExperimentTracker.create_run_record(
        model_name="test_logistic_regression",
        model_version="1.0.0",
        algorithm="logistic_regression",
        hyperparameters={"C": 1.0},
        dataset_content_hash="abc123hash",
        ruleset_versions_used=[1],
        random_seed=42,
        cv_fold_metrics=cv_metrics,
        stage="stage_1",
    )

    assert record["model_name"] == "test_logistic_regression"
    assert record["algorithm"] == "logistic_regression"
    assert record["random_seed"] == 42
    assert record["disclaimer"] == STAGE_1_DISCLAIMER
    assert "library_versions" in record
    assert "scikit-learn" in record["library_versions"]

    # Verify aggregate metrics
    agg = record["aggregate_metrics"]
    assert agg["macro_f1_mean"] == pytest.approx(0.85)
    assert agg["accuracy_mean"] == pytest.approx(0.90)
    assert agg["num_folds"] == 2

