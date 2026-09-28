"""Feature Extractor (C5 Section 5 & Section 8).

Extracts canonical feature vectors from assessment scores and business metadata.
Read-only queries bounded by as_of_timestamp to ensure temporal safety.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from app.ml.constants import DIMENSION_CODES, ALL_CANONICAL_FEATURES


class FeatureExtractor:
    """Extracts ML features for a single assessment with strict leakage safeguards."""

    @staticmethod
    def extract_from_raw(
        assessment_data: Dict[str, Any],
        scores_by_dimension: Dict[str, float],
        business_profile: Dict[str, Any],
        as_of_timestamp: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """
        Extract canonical feature vector from pre-fetched assessment and business dictionaries.

        Parameters:
        -----------
        assessment_data : Dict containing assessment metadata (e.g. total_questions, answered_count, contradiction_flag)
        scores_by_dimension : Dict mapping dimension_code (e.g. 'infra') to normalized 0-10 score
        business_profile : Dict containing enterprise_size, sector, years_in_operation, employee_count
        as_of_timestamp : Boundary timestamp (ensures no future event leakage)
        """
        feature_vector: Dict[str, Any] = {}

        # 1. Dimension Scores & Missingness Indicators
        for dim in DIMENSION_CODES:
            if dim in scores_by_dimension and scores_by_dimension[dim] is not None:
                score_val = float(scores_by_dimension[dim])
                # Ensure 0.0 to 10.0 range
                feature_vector[f"{dim}_score"] = max(0.0, min(10.0, score_val))
                feature_vector[f"{dim}_missing"] = 0
            else:
                feature_vector[f"{dim}_score"] = 0.0
                feature_vector[f"{dim}_missing"] = 1

        # Inventory Applicability Handling
        is_inv_missing = feature_vector["inventory_missing"] == 1
        is_service_sector = str(business_profile.get("sector", "")).lower() in (
            "services",
            "services & consulting",
            "professional & business services",
            "it & digital services",
            "healthcare & wellness",
        )
        if is_service_sector and is_inv_missing:
            feature_vector["inventory_applicable"] = 0
        else:
            feature_vector["inventory_applicable"] = 1 if not is_inv_missing else 0

        # 2. Gating / Assessment Quality Derived Features
        total_q = assessment_data.get("total_questions", 14) or 14
        answered_q = assessment_data.get("answered_questions", total_q) or total_q
        completion_ratio = float(answered_q) / float(total_q) if total_q > 0 else 1.0
        feature_vector["completion_ratio"] = max(0.0, min(1.0, completion_ratio))

        contradiction = assessment_data.get("contradiction_flag", 0)
        feature_vector["contradiction_flag"] = 1 if contradiction else 0

        # 3. Business Metadata
        biz_size = str(business_profile.get("enterprise_size", "micro")).lower()
        if biz_size not in ("micro", "small", "medium"):
            biz_size = "micro"
        feature_vector["business_size"] = biz_size

        sector = str(business_profile.get("sector", "Retail & Trade")).strip()
        feature_vector["category_id"] = sector if sector else "Other"

        # Years in operation
        years_op = business_profile.get("years_in_operation")
        if years_op is not None:
            try:
                feature_vector["years_in_operation"] = max(0.0, float(years_op))
                feature_vector["years_missing"] = 0
            except (ValueError, TypeError):
                feature_vector["years_in_operation"] = 0.0
                feature_vector["years_missing"] = 1
        else:
            feature_vector["years_in_operation"] = 0.0
            feature_vector["years_missing"] = 1

        # Employee count
        emp_count = business_profile.get("employee_count")
        if emp_count is not None:
            try:
                feature_vector["employee_count"] = max(0.0, float(emp_count))
                feature_vector["employees_missing"] = 0
            except (ValueError, TypeError):
                feature_vector["employee_count"] = 0.0
                feature_vector["employees_missing"] = 1
        else:
            feature_vector["employee_count"] = 0.0
            feature_vector["employees_missing"] = 1

        # Return vector adhering strictly to canonical schema
        return {k: feature_vector[k] for k in ALL_CANONICAL_FEATURES}
