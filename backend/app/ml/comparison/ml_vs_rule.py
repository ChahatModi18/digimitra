"""ML vs Rule Engine Comparison (C5 Section 14).

Computes inter-method agreement rate, unweighted Cohen's Kappa, and
confusion matrix between ML predictions and the production rule engine.

Always binds the mandatory disclaimer string.
"""

from typing import Any, Dict, List, Optional, Union
import numpy as np
from sklearn.metrics import accuracy_score, cohen_kappa_score, confusion_matrix

from app.ml.constants import ML_VS_RULE_DISCLAIMER


class MLVsRuleComparator:
    """Evaluates methodological agreement between ML models and rule engine."""

    @staticmethod
    def compare_predictions(
        rule_levels: Union[List[int], np.ndarray],
        ml_levels: Union[List[int], np.ndarray],
        assessment_ids: Optional[List[int]] = None,
    ) -> Dict[str, Any]:
        """
        Computes pairwise agreement metrics between rule-based and ML outputs.

        Parameters:
        -----------
        rule_levels : List/Array of rule-based RBDL level integers (0-3)
        ml_levels : List/Array of ML predicted RBDL level integers (0-3)
        assessment_ids : Optional list of assessment IDs for per-record tracking
        """
        rule_arr = np.array(rule_levels, dtype=int)
        ml_arr = np.array(ml_levels, dtype=int)

        if len(rule_arr) == 0 or len(ml_arr) == 0:
            return {
                "total_comparisons": 0,
                "agreement_rate": 0.0,
                "cohen_kappa_unweighted": 0.0,
                "confusion_matrix": [[0] * 4 for _ in range(4)],
                "disclaimer": ML_VS_RULE_DISCLAIMER,
            }

        agreement_rate = float(accuracy_score(rule_arr, ml_arr))

        labels = [0, 1, 2, 3]
        try:
            kappa = float(cohen_kappa_score(rule_arr, ml_arr, labels=labels, weights=None))
            if np.isnan(kappa):
                kappa = 1.0 if np.array_equal(rule_arr, ml_arr) else 0.0
        except Exception:
            kappa = 0.0

        # Confusion matrix: Rows = Rule Level, Columns = ML Level
        cm = confusion_matrix(rule_arr, ml_arr, labels=labels).tolist()

        return {
            "total_comparisons": len(rule_arr),
            "agreement_rate": agreement_rate,
            "cohen_kappa_unweighted": kappa,
            "confusion_matrix": cm,
            "disclaimer": ML_VS_RULE_DISCLAIMER,
        }
