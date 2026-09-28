"""Experiment Tracking and Provenance Recording (C5 Section 15).

Captures immutable, reproducible records of all training runs, cross-validation
folds, library environments, and cryptographic dataset hashes.
"""

import subprocess
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
import sklearn

from app.ml.constants import STAGE_1_DISCLAIMER


class ExperimentTracker:
    """Records full experiment execution metadata and aggregate cross-validation statistics."""

    @staticmethod
    def get_git_commit_hash() -> Optional[str]:
        """Attempts to retrieve the current git HEAD commit hash."""
        try:
            res = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                capture_output=True,
                text=True,
                timeout=2,
            )
            if res.returncode == 0:
                return res.stdout.strip()
        except Exception:
            pass
        return None

    @classmethod
    def create_run_record(
        cls,
        model_name: str,
        model_version: str,
        algorithm: str,
        hyperparameters: Dict[str, Any],
        dataset_content_hash: str,
        ruleset_versions_used: List[int],
        random_seed: int,
        cv_fold_metrics: List[Dict[str, Any]],
        stage: str = "stage_1",
        run_id: Optional[str] = None,
        explainability_artifact: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Builds a comprehensive experiment run record.
        """
        run_uuid = run_id or str(uuid.uuid4())
        commit_hash = cls.get_git_commit_hash()

        # Compute aggregate metrics (mean & std) across folds
        macro_f1_scores = [f["macro_f1"] for f in cv_fold_metrics if "macro_f1" in f]
        accuracy_scores = [f["accuracy"] for f in cv_fold_metrics if "accuracy" in f]
        kappa_scores = [f["quadratic_weighted_kappa"] for f in cv_fold_metrics if "quadratic_weighted_kappa" in f]
        mae_scores = [f["mean_absolute_error_ordinal"] for f in cv_fold_metrics if "mean_absolute_error_ordinal" in f]

        aggregate_metrics = {
            "macro_f1_mean": float(np.mean(macro_f1_scores)) if macro_f1_scores else 0.0,
            "macro_f1_std": float(np.std(macro_f1_scores)) if macro_f1_scores else 0.0,
            "accuracy_mean": float(np.mean(accuracy_scores)) if accuracy_scores else 0.0,
            "accuracy_std": float(np.std(accuracy_scores)) if accuracy_scores else 0.0,
            "quadratic_weighted_kappa_mean": float(np.mean(kappa_scores)) if kappa_scores else 0.0,
            "quadratic_weighted_kappa_std": float(np.std(kappa_scores)) if kappa_scores else 0.0,
            "mean_absolute_error_ordinal_mean": float(np.mean(mae_scores)) if mae_scores else 0.0,
            "mean_absolute_error_ordinal_std": float(np.std(mae_scores)) if mae_scores else 0.0,
            "num_folds": len(cv_fold_metrics),
        }

        record = {
            "run_id": run_uuid,
            "model_name": model_name,
            "model_version": model_version,
            "algorithm": algorithm,
            "stage": stage,
            "hyperparameters": hyperparameters,
            "dataset_content_hash": dataset_content_hash,
            "ruleset_version_used": ruleset_versions_used,
            "code_commit_hash": commit_hash,
            "random_seed": random_seed,
            "library_versions": {
                "scikit-learn": sklearn.__version__,
                "pandas": pd.__version__,
                "numpy": np.__version__,
            },
            "cv_fold_metrics": cv_fold_metrics,
            "aggregate_metrics": aggregate_metrics,
            "explainability_artifact": explainability_artifact or {},
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "disclaimer": STAGE_1_DISCLAIMER if stage == "stage_1" else None,
        }

        return record
