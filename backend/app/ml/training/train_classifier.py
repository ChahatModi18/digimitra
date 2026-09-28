"""ML Classification Training & Evaluation Orchestrator (C5 Section 4 & 23).

Coordinates end-to-end research model training:
1. Validates dataset feasibility via readiness/CV checks
2. Preprocesses features strictly within each training fold (leakage prevention)
3. Evaluates candidates across StratifiedGroupKFold splits
4. Aggregates metrics and extracts model explainability
5. Records experiment provenance and returns structured results
"""

from typing import Any, Dict, List, Optional, Tuple
import pandas as pd
import numpy as np

from app.ml.constants import ALL_CANONICAL_FEATURES, STAGE_1_DISCLAIMER
from app.ml.evaluation.cv_strategy import CrossValidationStrategy
from app.ml.evaluation.metrics import compute_metrics
from app.ml.experiment.experiment_tracker import ExperimentTracker
from app.ml.explainability.explainers import ModelExplainer
from app.ml.models.candidates import MODEL_FACTORIES, create_logistic_regression
from app.ml.preprocessing.pipeline_factory import PipelineFactory


class ClassifierTrainer:
    """Orchestrates cross-validated training, evaluation, and provenance logging."""

    @classmethod
    def train_and_evaluate(
        cls,
        df: pd.DataFrame,
        algorithm_name: str = "logistic_regression",
        model_name: Optional[str] = None,
        model_version: str = "1.0.0",
        hyperparameters: Optional[Dict[str, Any]] = None,
        k_folds: int = 5,
        random_seed: int = 42,
        business_size_encoding: str = "ordinal",
        stage: str = "stage_1",
        dataset_content_hash: str = "in_memory_synthetic",
        ruleset_versions_used: Optional[List[int]] = None,
    ) -> Dict[str, Any]:
        """
        Executes cross-validated training and returns a complete experiment record.

        Parameters:
        -----------
        df : DataFrame containing canonical features, 'target_level', and 'business_id'
        algorithm_name : 'logistic_regression', 'decision_tree', or 'random_forest'
        model_name : Human-readable identifier (defaults to algorithm_name)
        model_version : Semantic version string
        hyperparameters : Dict of algorithm hyperparameters
        k_folds : Desired cross-validation folds
        random_seed : PRNG seed
        business_size_encoding : 'ordinal' or 'onehot'
        stage : 'stage_1' or 'stage_2'
        """
        model_id = model_name or f"{algorithm_name}_v1"
        params = hyperparameters or {}
        ruleset_vers = ruleset_versions_used or [1]

        # 1. Verify CV Feasibility
        feasibility = CrossValidationStrategy.assess_cv_feasibility(df, requested_k=k_folds)
        if not feasibility["feasible"]:
            raise ValueError(
                f"Cannot train classifier: Dataset is infeasible for cross-validation. "
                f"Reason: {feasibility['reason_if_infeasible']}"
            )

        actual_k = feasibility["recommended_k"]

        # 2. Instantiate Model Factory
        if algorithm_name not in MODEL_FACTORIES:
            raise ValueError(f"Unknown algorithm '{algorithm_name}'. Available: {list(MODEL_FACTORIES.keys())}")

        factory_fn = MODEL_FACTORIES[algorithm_name]

        # 3. Execute StratifiedGroupKFold Cross-Validation (Leakage-Free)
        cv_fold_metrics: List[Dict[str, Any]] = []
        feature_cols = [col for col in ALL_CANONICAL_FEATURES if col in df.columns]

        for fold_idx, (train_idx, test_idx) in enumerate(
            CrossValidationStrategy.generate_splits(df, k=actual_k, random_state=random_seed)
        ):
            train_df = df.iloc[train_idx]
            test_df = df.iloc[test_idx]

            X_train = train_df[feature_cols]
            y_train = train_df["target_level"].values
            X_test = test_df[feature_cols]
            y_test = test_df["target_level"].values

            # Construct unfitted pipeline for this fold
            base_model = factory_fn(random_state=random_seed, **params)
            pipeline = PipelineFactory.create_pipeline(
                classifier=base_model,
                business_size_encoding=business_size_encoding,
            )

            # Fit ONLY on training fold (Section 8 Preprocessing Leakage Guard)
            pipeline.fit(X_train, y_train)

            # Evaluate on test fold
            y_pred = pipeline.predict(X_test)
            fold_metrics = compute_metrics(y_test, y_pred)
            fold_metrics["fold"] = fold_idx + 1
            fold_metrics["train_size"] = len(train_df)
            fold_metrics["test_size"] = len(test_df)
            cv_fold_metrics.append(fold_metrics)

        # 4. Train Final Model on Full Dataset for Artifact/Explainability
        final_model = factory_fn(random_state=random_seed, **params)
        final_pipeline = PipelineFactory.create_pipeline(
            classifier=final_model,
            business_size_encoding=business_size_encoding,
        )
        final_pipeline.fit(df[feature_cols], df["target_level"].values)

        # 5. Extract Explainability Artifact
        classifier_step = final_pipeline.named_steps["classifier"]
        explainer_output = ModelExplainer.explain_model(classifier_step, feature_names=feature_cols)

        # 6. Build Experiment Run Record
        run_record = ExperimentTracker.create_run_record(
            model_name=model_id,
            model_version=model_version,
            algorithm=algorithm_name,
            hyperparameters=params,
            dataset_content_hash=dataset_content_hash,
            ruleset_versions_used=ruleset_vers,
            random_seed=random_seed,
            cv_fold_metrics=cv_fold_metrics,
            stage=stage,
            explainability_artifact=explainer_output,
        )

        run_record["final_pipeline"] = final_pipeline
        return run_record
