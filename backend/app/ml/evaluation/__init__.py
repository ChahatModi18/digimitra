"""Evaluation package."""

from app.ml.evaluation.metrics import compute_metrics
from app.ml.evaluation.cv_strategy import CrossValidationStrategy

__all__ = ["compute_metrics", "CrossValidationStrategy"]
