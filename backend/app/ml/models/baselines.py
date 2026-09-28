"""Baseline Models for ML Research Pipeline (C5 Section 10).

1. MajorityClassBaseline: Mandatory lower performance floor.
2. RuleEngineBaseline: Read-only evaluation wrapper invoking production RBDL gating rules.
"""

from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, ClassifierMixin
from sklearn.dummy import DummyClassifier

from app.domain.rbdl.classifier import RBDLClassifierEngine
from app.domain.rbdl.scoring import AssessmentScoringSummary
from app.ml.constants import DIMENSION_CODES


class MajorityClassBaseline(BaseEstimator, ClassifierMixin):
    """Majority class classifier representing minimum baseline floor."""

    def __init__(self):
        self._dummy = DummyClassifier(strategy="most_frequent")
        self.classes_ = np.array([0, 1, 2, 3])

    def fit(self, X: Any, y: Any) -> "MajorityClassBaseline":
        self._dummy.fit(X, y)
        self.classes_ = self._dummy.classes_
        return self

    def predict(self, X: Any) -> np.ndarray:
        return self._dummy.predict(X)

    def predict_proba(self, X: Any) -> np.ndarray:
        return self._dummy.predict_proba(X)


class RuleEngineBaseline(BaseEstimator, ClassifierMixin):
    """
    Read-only wrapper evaluating features directly against the production
    RBDL rule gating engine. Not trained, has no hyperparameters.
    """

    def __init__(self):
        self.classes_ = np.array([0, 1, 2, 3])
        self.is_fitted_ = True

    def fit(self, X: Any, y: Optional[Any] = None) -> "RuleEngineBaseline":
        # Rule engine is deterministic and requires no training
        self.is_fitted_ = True
        return self

    def predict(self, X: Any) -> np.ndarray:
        """
        Evaluate dimension scores using RBDL gating rules.
        """
        predictions: List[int] = []

        if isinstance(X, pd.DataFrame):
            rows = X.to_dict(orient="records")
        elif isinstance(X, np.ndarray):
            # If array, extract dimension scores assuming canonical ordering
            # [infra, literacy, presence, comms, records, payments, inventory, data_usage, growth, ...]
            rows = []
            for row in X:
                row_dict = {f"{d}_score": float(row[i]) for i, d in enumerate(DIMENSION_CODES)}
                rows.append(row_dict)
        else:
            rows = list(X)

        for row in rows:
            dim_scores = {d: float(row.get(f"{d}_score", 0.0)) for d in DIMENSION_CODES}
            is_service = str(row.get("category_id", "")).lower() in ("services", "it & digital services", "consulting")

            # Evaluate gating thresholds deterministically
            level = 0

            # Level 1 Gate: infra >= 4.0 and literacy >= 3.0
            if dim_scores.get("infra", 0.0) >= 4.0 and dim_scores.get("literacy", 0.0) >= 3.0:
                level = 1

                # Level 2 Gate: presence >= 4.0, payments >= 4.0, records >= 3.0, and (inventory >= 3.0 or service)
                inv_pass = (dim_scores.get("inventory", 0.0) >= 3.0) or is_service
                if (
                    dim_scores.get("presence", 0.0) >= 4.0
                    and dim_scores.get("payments", 0.0) >= 4.0
                    and dim_scores.get("records", 0.0) >= 3.0
                    and inv_pass
                ):
                    level = 2

                    # Level 3 Gate: comms >= 5.0, data_usage >= 4.0, growth >= 4.0
                    if (
                        dim_scores.get("comms", 0.0) >= 5.0
                        and dim_scores.get("data_usage", 0.0) >= 4.0
                        and dim_scores.get("growth", 0.0) >= 4.0
                    ):
                        level = 3

            predictions.append(level)

        return np.array(predictions)

    def predict_proba(self, X: Any) -> np.ndarray:
        """One-hot probability distribution reflecting deterministic rule decisions."""
        preds = self.predict(X)
        proba = np.zeros((len(preds), 4))
        for i, p in enumerate(preds):
            proba[i, p] = 1.0
        return proba
