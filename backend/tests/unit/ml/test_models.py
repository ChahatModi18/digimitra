"""Unit Tests for Candidate & Baseline Models (C5 Section 10 & 22)."""

import numpy as np
from app.ml.models.baselines import MajorityClassBaseline, RuleEngineBaseline
from app.ml.models.candidates import create_logistic_regression, create_decision_tree, create_random_forest
from app.ml.preprocessing.pipeline_factory import PipelineFactory
from app.ml.synthetic.synthetic_generator import SyntheticDataGenerator


def test_majority_class_baseline():
    """Verify MajorityClassBaseline always predicts the most frequent class."""
    df = SyntheticDataGenerator.generate_synthetic_dataset(n_businesses=15, random_seed=42)
    X = df.drop(columns=["target_level"])
    y = df["target_level"].values

    model = MajorityClassBaseline()
    model.fit(X, y)
    preds = model.predict(X)

    most_frequent = np.bincount(y).argmax()
    assert np.all(preds == most_frequent)


def test_rule_engine_baseline_wrapper():
    """Verify RuleEngineBaseline evaluates deterministic rules without training."""
    df = SyntheticDataGenerator.generate_synthetic_dataset(n_businesses=15, random_seed=42)
    model = RuleEngineBaseline()
    model.fit(df)  # No-op fit
    preds = model.predict(df)

    # In synthetic data, target_level was generated using the rule engine, so they should match 100%
    assert np.array_equal(preds, df["target_level"].values)


def test_candidate_models_end_to_end_on_synthetic():
    """Verify LogisticRegression, DecisionTree, and RandomForest fit and predict successfully."""
    df = SyntheticDataGenerator.generate_synthetic_dataset(n_businesses=20, random_seed=42)
    X = df.drop(columns=["target_level"])
    y = df["target_level"].values

    candidates = [
        ("logistic_regression", create_logistic_regression(random_state=42)),
        ("decision_tree", create_decision_tree(max_depth=4, random_state=42)),
        ("random_forest", create_random_forest(n_estimators=10, random_state=42)),
    ]

    for name, clf in candidates:
        pipeline = PipelineFactory.create_pipeline(clf)
        pipeline.fit(X, y)
        preds = pipeline.predict(X)

        assert len(preds) == len(df)
        assert set(preds).issubset({0, 1, 2, 3})
