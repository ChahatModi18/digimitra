"""Cross-Validation Strategy & Leakage Guard (C5 Section 8 & 11).

Enforces StratifiedGroupKFold with groups=business_id.
Includes hard assertions preventing cross-fold business leakage.
"""

from typing import Any, Dict, Generator, List, Tuple
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedGroupKFold


class CrossValidationStrategy:
    """Manages group-stratified splitting and cross-validation feasibility."""

    @staticmethod
    def assess_cv_feasibility(df: pd.DataFrame, requested_k: int = 5) -> Dict[str, Any]:
        """
        Assesses whether the dataset can support stratified grouped cross-validation.
        """
        if len(df) == 0:
            return {
                "feasible": False,
                "requested_k": requested_k,
                "recommended_k": 0,
                "min_class_count": 0,
                "distinct_business_groups": 0,
                "reason_if_infeasible": "Dataset contains 0 samples.",
            }

        class_counts = df["target_level"].value_counts().to_dict()
        distinct_biz_per_class: Dict[int, int] = {}
        for lvl in range(4):
            sub = df[df["target_level"] == lvl]
            distinct_biz_per_class[lvl] = sub["business_id"].nunique() if len(sub) > 0 else 0

        min_biz = min(distinct_biz_per_class.values()) if distinct_biz_per_class else 0
        total_biz = df["business_id"].nunique() if "business_id" in df.columns else len(df)

        recommended_k = min(requested_k, min_biz)
        feasible = recommended_k >= 2 and all(v >= 2 for v in distinct_biz_per_class.values())

        reason = None
        if not feasible:
            missing = [k for k, v in distinct_biz_per_class.items() if v == 0]
            too_few = [k for k, v in distinct_biz_per_class.items() if 0 < v < 2]
            parts = []
            if missing:
                parts.append(f"Classes {missing} have 0 instances")
            if too_few:
                parts.append(f"Classes {too_few} have <2 distinct businesses")
            reason = "; ".join(parts) if parts else f"Cannot form at least 2 folds (min distinct businesses per class is {min_biz})."

        return {
            "feasible": feasible,
            "requested_k": requested_k,
            "recommended_k": max(0, recommended_k),
            "min_class_count": min_biz,
            "distinct_business_groups": total_biz,
            "reason_if_infeasible": reason,
        }

    @staticmethod
    def generate_splits(
        df: pd.DataFrame,
        k: int = 5,
        random_state: int = 42,
    ) -> Generator[Tuple[np.ndarray, np.ndarray], None, None]:
        """
        Yields (train_indices, test_indices) using StratifiedGroupKFold.
        Includes a hard assertion that train and test splits share zero businesses.
        """
        X = df.drop(columns=["target_level"]) if "target_level" in df.columns else df
        y = df["target_level"] if "target_level" in df.columns else np.zeros(len(df))
        groups = df["business_id"] if "business_id" in df.columns else np.arange(len(df))

        sgkf = StratifiedGroupKFold(n_splits=k, shuffle=True, random_state=random_state)

        for fold_idx, (train_idx, test_idx) in enumerate(sgkf.split(X, y, groups=groups)):
            # Mandatory hard assertion: zero business overlap between train and test
            train_biz = set(df.iloc[train_idx]["business_id"])
            test_biz = set(df.iloc[test_idx]["business_id"])
            overlap = train_biz.intersection(test_biz)

            if overlap:
                raise ValueError(
                    f"CRITICAL LEAKAGE DETECTED in Fold {fold_idx}: "
                    f"{len(overlap)} business_id(s) appeared in both train and test splits! Overlapping IDs: {overlap}"
                )

            yield train_idx, test_idx
