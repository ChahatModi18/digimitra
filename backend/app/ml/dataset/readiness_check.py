"""Real Data Readiness Gate (C5 Section 20).

Mandatory safety check: verifies whether empirical dataset volume, class
representation, and business group distribution are sufficient for reliable
cross-validation and model training.

If insufficient, reports the exact reason and prevents premature model training.
"""

from typing import Any, Dict, List, Optional
import pandas as pd


class ReadinessCheck:
    """Evaluates empirical dataset sufficiency for ML training."""

    @staticmethod
    def evaluate_readiness(
        df: pd.DataFrame,
        stage: str = "stage_1",
        requested_k: int = 5,
        min_samples_per_class: int = 2,
    ) -> Dict[str, Any]:
        """
        Evaluates training readiness.

        Parameters:
        -----------
        df : DataFrame containing 'target_level' and 'business_id'
        stage : 'stage_1' or 'stage_2'
        requested_k : Desired number of cross-validation folds
        min_samples_per_class : Minimum distinct business instances required per class for minimal k=2 CV
        """
        total_records = len(df)
        if total_records == 0:
            return {
                "status": "insufficient",
                "stage": stage,
                "total_assessments": 0,
                "eligible_after_filtering": 0,
                "class_distribution": {"0": 0, "1": 0, "2": 0, "3": 0},
                "missing_classes": [0, 1, 2, 3],
                "distinct_business_count": 0,
                "cv_feasibility": {
                    "feasible": False,
                    "requested_k": requested_k,
                    "recommended_k": 0,
                    "min_class_count": 0,
                    "distinct_business_groups": 0,
                    "reason_if_infeasible": "Dataset is empty (0 eligible assessment records).",
                },
                "explanation": (
                    f"Insufficient research data for ML training in {stage}: "
                    "0 eligible assessment records found. At least 2 distinct businesses per class "
                    "are required for minimal cross-validation."
                ),
            }

        # Calculate class counts and business counts per class
        class_counts = df["target_level"].value_counts().to_dict()
        class_dist = {str(i): int(class_counts.get(i, 0)) for i in range(4)}
        missing_classes = [i for i in range(4) if class_dist[str(i)] == 0]

        # Calculate distinct businesses per class
        distinct_biz_per_class: Dict[int, int] = {}
        for lvl in range(4):
            sub_df = df[df["target_level"] == lvl]
            distinct_biz_per_class[lvl] = sub_df["business_id"].nunique() if len(sub_df) > 0 else 0

        min_biz_count_across_classes = min(distinct_biz_per_class.values()) if distinct_biz_per_class else 0
        total_distinct_businesses = df["business_id"].nunique() if "business_id" in df.columns else total_records

        # Feasibility calculation
        # A stratified grouped fold requires each class to have at least k distinct businesses
        recommended_k = min(requested_k, min_biz_count_across_classes)
        cv_feasible = recommended_k >= 2 and len(missing_classes) == 0

        if not cv_feasible:
            reasons = []
            if missing_classes:
                reasons.append(f"Classes {missing_classes} have 0 examples.")
            if min_biz_count_across_classes < 2:
                reasons.append(
                    f"Smallest class has only {min_biz_count_across_classes} distinct business(es); "
                    "at least 2 distinct businesses per class are required for minimal 2-fold grouped CV."
                )

            explanation = (
                f"Insufficient real research data for reliable ML training ({stage}): "
                + " ".join(reasons)
            )

            return {
                "status": "insufficient",
                "stage": stage,
                "total_assessments": total_records,
                "eligible_after_filtering": total_records,
                "class_distribution": class_dist,
                "missing_classes": missing_classes,
                "distinct_business_count": total_distinct_businesses,
                "cv_feasibility": {
                    "feasible": False,
                    "requested_k": requested_k,
                    "recommended_k": max(0, recommended_k),
                    "min_class_count": min_biz_count_across_classes,
                    "distinct_business_groups": total_distinct_businesses,
                    "reason_if_infeasible": "; ".join(reasons),
                },
                "explanation": explanation,
            }

        # If data is sufficient
        return {
            "status": "ready",
            "stage": stage,
            "total_assessments": total_records,
            "eligible_after_filtering": total_records,
            "class_distribution": class_dist,
            "missing_classes": [],
            "distinct_business_count": total_distinct_businesses,
            "cv_feasibility": {
                "feasible": True,
                "requested_k": requested_k,
                "recommended_k": recommended_k,
                "min_class_count": min_biz_count_across_classes,
                "distinct_business_groups": total_distinct_businesses,
                "reason_if_infeasible": None,
            },
            "explanation": (
                f"Dataset satisfies research readiness criteria for {stage} with {total_records} "
                f"assessments across {total_distinct_businesses} businesses and support for {recommended_k}-fold CV."
            ),
        }
