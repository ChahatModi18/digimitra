"""End-to-End Synthetic Pipeline Integration Test (C5 Section 22).

Executes the entire research pipeline on in-memory synthetic data:
- Preprocessing
- Stratified grouped cross-validation
- Candidate models (LogisticRegression, DecisionTree, RandomForest)
- Metric aggregation (Macro-F1, Quadratic Weighted Kappa, etc.)
- Explainability extraction
- ML vs rule comparison
- Artifact and persistence safety validation
"""

import pytest
from app.ml.comparison.ml_vs_rule import MLVsRuleComparator
from app.ml.synthetic.synthetic_generator import SyntheticDataGenerator
from app.ml.training.train_classifier import ClassifierTrainer


def test_full_synthetic_pipeline_e2e():
    """Verify end-to-end execution of the research ML pipeline across candidate algorithms."""
    # 1. Generate synthetic in-memory dataset
    df = SyntheticDataGenerator.generate_synthetic_dataset(
        n_businesses=40,
        assessments_per_business=2,
        random_seed=42,
    )
    assert len(df) == 80
    assert "target_level" in df.columns

    # 2. Test candidate algorithms
    algorithms = ["logistic_regression", "decision_tree", "random_forest"]

    for algo in algorithms:
        run_record = ClassifierTrainer.train_and_evaluate(
            df=df,
            algorithm_name=algo,
            model_name=f"synthetic_test_{algo}",
            k_folds=3,
            random_seed=42,
        )

        assert run_record["algorithm"] == algo
        assert "aggregate_metrics" in run_record
        assert "macro_f1_mean" in run_record["aggregate_metrics"]
        assert "quadratic_weighted_kappa_mean" in run_record["aggregate_metrics"]
        assert len(run_record["cv_fold_metrics"]) == 3

        # Verify explainability artifact
        assert "explainability_artifact" in run_record
        assert run_record["explainability_artifact"]["type"] != "unsupported_explainer"

        # Verify predictions vs rule engine comparison
        pipeline = run_record["final_pipeline"]
        feature_cols = [c for c in df.columns if c not in ("assessment_id", "business_id", "ruleset_version", "target_level")]
        ml_preds = pipeline.predict(df[feature_cols])

        comp = MLVsRuleComparator.compare_predictions(
            rule_levels=df["target_level"].values,
            ml_levels=ml_preds,
        )

        assert comp["total_comparisons"] == len(df)
        assert 0.0 <= comp["agreement_rate"] <= 1.0
        assert "disclaimer" in comp
