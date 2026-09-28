"""Evaluation Metrics (C5 Section 12).

Computes comprehensive classification metrics for research reporting:
- Accuracy
- Macro-F1 (Primary model selection metric)
- Weighted-F1
- Per-class precision, recall, F1, support
- Confusion matrix
- Mean Absolute Error (Ordinal distance)
- Quadratic Weighted Kappa (Inter-rater / ordinal agreement)
"""

from typing import Any, Dict, List, Union
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    cohen_kappa_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
)


def compute_metrics(
    y_true: Union[List[int], np.ndarray],
    y_pred: Union[List[int], np.ndarray],
) -> Dict[str, Any]:
    """
    Computes all standard classification metrics with robust edge-case handling.
    """
    y_true_arr = np.array(y_true, dtype=int)
    y_pred_arr = np.array(y_pred, dtype=int)

    # Basic classification scores
    acc = float(accuracy_score(y_true_arr, y_pred_arr))
    macro_f1 = float(f1_score(y_true_arr, y_pred_arr, average="macro", zero_division=0))
    weighted_f1 = float(f1_score(y_true_arr, y_pred_arr, average="weighted", zero_division=0))

    # Per-class report across all 4 RBDL levels (0, 1, 2, 3)
    labels = [0, 1, 2, 3]
    class_report = classification_report(
        y_true_arr,
        y_pred_arr,
        labels=labels,
        target_names=["Level 0", "Level 1", "Level 2", "Level 3"],
        output_dict=True,
        zero_division=0,
    )

    # Confusion matrix (4x4)
    cm = confusion_matrix(y_true_arr, y_pred_arr, labels=labels).tolist()

    # Ordinal distance: Mean Absolute Error between predicted and true level integers
    mae_ordinal = float(mean_absolute_error(y_true_arr, y_pred_arr))

    # Quadratic Weighted Kappa
    try:
        qwk = float(
            cohen_kappa_score(
                y_true_arr,
                y_pred_arr,
                labels=labels,
                weights="quadratic",
            )
        )
        if np.isnan(qwk):
            qwk = 1.0 if np.array_equal(y_true_arr, y_pred_arr) else 0.0
    except Exception:
        qwk = 0.0

    return {
        "accuracy": acc,
        "macro_f1": macro_f1,  # PRIMARY MODEL SELECTION METRIC
        "weighted_f1": weighted_f1,
        "mean_absolute_error_ordinal": mae_ordinal,
        "quadratic_weighted_kappa": qwk,
        "per_class": class_report,
        "confusion_matrix": cm,
    }
