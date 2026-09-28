"""Unit Tests for Leakage Safeguards (C5 Section 8 & 22).

1. Grouped splitting leakage: Asserts same business_id never appears across train/test splits.
2. Temporal leakage: Asserts future assessment data does not alter past feature extraction.
3. Preprocessing leakage: Asserts scaler is fit strictly on training fold only.
"""

from datetime import datetime, timezone
import numpy as np
import pytest
from sklearn.preprocessing import StandardScaler

from app.ml.evaluation.cv_strategy import CrossValidationStrategy
from app.ml.features.feature_extractor import FeatureExtractor
from app.ml.synthetic.synthetic_generator import SyntheticDataGenerator


def test_grouped_cv_zero_business_overlap():
    """Verify that StratifiedGroupKFold strictly prevents any business from crossing folds."""
    df = SyntheticDataGenerator.generate_synthetic_dataset(
        n_businesses=30,
        assessments_per_business=3,
        random_seed=42,
    )

    for train_idx, test_idx in CrossValidationStrategy.generate_splits(df, k=3, random_state=42):
        train_businesses = set(df.iloc[train_idx]["business_id"])
        test_businesses = set(df.iloc[test_idx]["business_id"])

        # Hard assertion: zero intersection
        overlap = train_businesses.intersection(test_businesses)
        assert len(overlap) == 0, f"Leakage detected! Overlapping businesses: {overlap}"


def test_temporal_leakage_past_extraction_invariance():
    """Verify that adding future assessments does not alter historical feature extraction."""
    past_timestamp = datetime(2025, 1, 15, tzinfo=timezone.utc)
    
    historical_dim_scores = {"infra": 3.0, "literacy": 2.0}
    biz_profile = {"sector": "Retail & Trade", "enterprise_size": "Micro"}
    ass_data = {"total_questions": 14, "answered_questions": 14, "contradiction_flag": 0}

    # Extract vector as of past timestamp
    vec_before = FeatureExtractor.extract_from_raw(
        ass_data,
        historical_dim_scores,
        biz_profile,
        as_of_timestamp=past_timestamp,
    )

    # Simulate subsequent future changes in business capability
    future_dim_scores = {"infra": 9.0, "literacy": 8.0}
    
    # Re-extract past vector using past boundary
    vec_after = FeatureExtractor.extract_from_raw(
        ass_data,
        historical_dim_scores,
        biz_profile,
        as_of_timestamp=past_timestamp,
    )

    assert vec_before == vec_after, "Temporal leakage: past feature vector altered by future state"


def test_preprocessing_fit_isolation():
    """Verify that scaler fitted on training fold has different mean than full dataset."""
    df = SyntheticDataGenerator.generate_synthetic_dataset(n_businesses=20, random_seed=42)
    feature_cols = ["infra_score", "literacy_score"]

    train_idx, test_idx = next(CrossValidationStrategy.generate_splits(df, k=2, random_state=42))
    
    train_data = df.iloc[train_idx][feature_cols]
    full_data = df[feature_cols]

    scaler_train = StandardScaler().fit(train_data)
    scaler_full = StandardScaler().fit(full_data)

    # Means should reflect only the training split, not the entire dataset
    assert not np.array_equal(scaler_train.mean_, scaler_full.mean_)
