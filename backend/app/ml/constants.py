"""ML Research Module Constants & Disclaimers (C5 Specification)."""

from typing import List

STAGE_1_DISCLAIMER: str = (
    "Stage 1: trained against rule-engine output, not independent ground truth. "
    "Not evidence of real-world predictive validity."
)

ML_VS_RULE_DISCLAIMER: str = (
    "Agreement measures similarity between two systems, not correctness of either. "
    "See Stage 2 comparison for accuracy against consultant-corrected ground truth."
)

SYNTHETIC_DATA_LABEL: str = "SYNTHETIC — PIPELINE TEST ONLY"

DIMENSION_CODES: List[str] = [
    "infra",
    "literacy",
    "presence",
    "comms",
    "records",
    "payments",
    "inventory",
    "data_usage",
    "growth",
]

# Canonical feature lists
NUMERIC_SCORE_FEATURES: List[str] = [f"{d}_score" for d in DIMENSION_CODES]

NUMERIC_METADATA_FEATURES: List[str] = [
    "completion_ratio",
    "contradiction_flag",
    "years_in_operation",
    "employee_count",
]

MISSING_INDICATOR_FEATURES: List[str] = [f"{d}_missing" for d in DIMENSION_CODES] + [
    "inventory_applicable",
    "years_missing",
    "employees_missing",
]

CATEGORICAL_FEATURES: List[str] = [
    "business_size",
    "category_id",
]

ALL_CANONICAL_FEATURES: List[str] = (
    NUMERIC_SCORE_FEATURES
    + NUMERIC_METADATA_FEATURES
    + MISSING_INDICATOR_FEATURES
    + CATEGORICAL_FEATURES
)
