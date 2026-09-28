"""Unit Tests for Preprocessing Pipeline (C5 Section 9 & 22)."""

import pandas as pd
from app.ml.preprocessing.pipeline_factory import PipelineFactory
from app.ml.synthetic.synthetic_generator import SyntheticDataGenerator


def test_preprocessing_ordinal_and_onehot_modes():
    """Verify ColumnTransformer supports both ordinal and onehot business size encoding."""
    df = SyntheticDataGenerator.generate_synthetic_dataset(n_businesses=10, random_seed=42)

    # 1. Test Ordinal encoding
    preprocessor_ord = PipelineFactory.create_preprocessor(business_size_encoding="ordinal")
    X_ord = preprocessor_ord.fit_transform(df)
    assert X_ord.shape[0] == len(df)

    # 2. Test One-Hot encoding
    preprocessor_oh = PipelineFactory.create_preprocessor(business_size_encoding="onehot")
    X_oh = preprocessor_oh.fit_transform(df)
    assert X_oh.shape[0] == len(df)
    # One-hot should have more columns than ordinal
    assert X_oh.shape[1] > X_ord.shape[1]


def test_preprocessing_unseen_category_handling():
    """Verify that unseen category during inference does not crash pipeline."""
    df_train = SyntheticDataGenerator.generate_synthetic_dataset(n_businesses=10, random_seed=42)
    preprocessor = PipelineFactory.create_preprocessor(category_min_frequency=0.1)
    preprocessor.fit(df_train)

    # Create test sample with completely novel unseen category
    df_test = df_train.copy().iloc[0:1]
    df_test["category_id"] = "Exotic Aerospace MSME Unseen Sector"

    # Should transform cleanly without throwing ValueError
    X_test = preprocessor.transform(df_test)
    assert X_test.shape[0] == 1
