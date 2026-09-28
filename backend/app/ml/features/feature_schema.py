"""Canonical Feature Schema Specification (C5 Section 5).

Single source of truth for ML feature definitions, datatypes,
transformations, ranges, missing-value policies, and leakage guards.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from app.ml.constants import (
    DIMENSION_CODES,
    NUMERIC_SCORE_FEATURES,
    NUMERIC_METADATA_FEATURES,
    MISSING_INDICATOR_FEATURES,
    CATEGORICAL_FEATURES,
    ALL_CANONICAL_FEATURES,
)


class FeatureDefinition(BaseModel):
    """Metadata specification for a single feature in the ML pipeline."""

    name: str
    source_table: str
    source_field: str
    datatype: str  # 'float', 'int', 'categorical', 'binary'
    transformation: str  # 'StandardScaler', 'OneHotEncoder', 'OrdinalEncoder', 'Passthrough'
    valid_range: Optional[str] = None
    missing_value_treatment: str
    stage_1_applicable: bool = True
    stage_2_applicable: bool = True
    leakage_risk: str = "None"


CANONICAL_FEATURE_DEFINITIONS: Dict[str, FeatureDefinition] = {
    # 1. Dimension Scores (0–10)
    **{
        f"{d}_score": FeatureDefinition(
            name=f"{d}_score",
            source_table="assessment_scores",
            source_field="raw_score",
            datatype="float",
            transformation="StandardScaler (fit in-fold)",
            valid_range="0.0 - 10.0",
            missing_value_treatment=f"Explicit {d}_missing indicator (0/1); score defaults to 0.0 before scaler",
        )
        for d in DIMENSION_CODES
    },
    # 2. Derived Gating & Assessment Quality Metrics
    "completion_ratio": FeatureDefinition(
        name="completion_ratio",
        source_table="assessments",
        source_field="derived",
        datatype="float",
        transformation="Passthrough",
        valid_range="0.0 - 1.0",
        missing_value_treatment="N/A - always computable from assessment answer count",
    ),
    "contradiction_flag": FeatureDefinition(
        name="contradiction_flag",
        source_table="assessments",
        source_field="derived",
        datatype="int",
        transformation="Passthrough",
        valid_range="{0, 1}",
        missing_value_treatment="N/A - 0 if consistent, 1 if inconsistency detected",
    ),
    # 3. Missingness & Applicability Indicators
    **{
        f"{d}_missing": FeatureDefinition(
            name=f"{d}_missing",
            source_table="assessment_scores",
            source_field="derived",
            datatype="binary",
            transformation="Passthrough",
            valid_range="{0, 1}",
            missing_value_treatment="1 if dimension had no answered questions, else 0",
        )
        for d in DIMENSION_CODES
    },
    "inventory_applicable": FeatureDefinition(
        name="inventory_applicable",
        source_table="assessment_scores",
        source_field="derived",
        datatype="binary",
        transformation="Passthrough",
        valid_range="{0, 1}",
        missing_value_treatment="0 if enterprise has no inventory (e.g. pure service/consulting), 1 if applicable",
    ),
    "years_missing": FeatureDefinition(
        name="years_missing",
        source_table="businesses",
        source_field="derived",
        datatype="binary",
        transformation="Passthrough",
        valid_range="{0, 1}",
        missing_value_treatment="1 if years_in_operation is NULL, else 0",
    ),
    "employees_missing": FeatureDefinition(
        name="employees_missing",
        source_table="businesses",
        source_field="derived",
        datatype="binary",
        transformation="Passthrough",
        valid_range="{0, 1}",
        missing_value_treatment="1 if employee_count is NULL, else 0",
    ),
    # 4. Business Profile Metadata
    "business_size": FeatureDefinition(
        name="business_size",
        source_table="businesses",
        source_field="enterprise_size",
        datatype="categorical",
        transformation="Configurable (OrdinalEncoder {micro:0, small:1, medium:2} or OneHotEncoder)",
        valid_range="{'micro', 'small', 'medium'}",
        missing_value_treatment="Mandatory field in database; fallback to 'micro' if missing",
    ),
    "category_id": FeatureDefinition(
        name="category_id",
        source_table="businesses",
        source_field="sector",
        datatype="categorical",
        transformation="OneHotEncoder (min_frequency=0.05 rare grouping, handle_unknown='ignore')",
        valid_range="discrete string categories",
        missing_value_treatment="Mandatory field in database; fallback to 'Other'",
    ),
    "years_in_operation": FeatureDefinition(
        name="years_in_operation",
        source_table="businesses",
        source_field="years_in_operation / age",
        datatype="float",
        transformation="StandardScaler (fit in-fold)",
        valid_range="0.0 - 100.0",
        missing_value_treatment="Imputed to 0.0 with years_missing=1 indicator",
    ),
    "employee_count": FeatureDefinition(
        name="employee_count",
        source_table="businesses",
        source_field="employee_count / staff_size",
        datatype="float",
        transformation="StandardScaler (fit in-fold)",
        valid_range="0.0 - 500.0",
        missing_value_treatment="Imputed to 0.0 with employees_missing=1 indicator",
    ),
}


def get_feature_schema() -> Dict[str, Any]:
    """Return serialized feature schema manifest."""
    return {
        "numeric_scores": NUMERIC_SCORE_FEATURES,
        "numeric_metadata": NUMERIC_METADATA_FEATURES,
        "missing_indicators": MISSING_INDICATOR_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "all_features": ALL_CANONICAL_FEATURES,
        "total_feature_count": len(ALL_CANONICAL_FEATURES),
        "excluded_features": [
            "business_recommendations.* (downstream leakage risk)",
            "roadmaps.* (downstream leakage risk)",
            "roadmap_tasks.* (downstream leakage risk)",
            "progress_logs.* (downstream leakage risk)",
            "raw_question_answers.* (deferred to prevent small-N overfitting)",
            "free_text_fields.* (out of scope for tabular MVP)",
        ],
    }
