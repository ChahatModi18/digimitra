"""ML Model Registry & Artifact Management (C5 Section 15 & 16).

Manages model serialization, artifact paths, and metadata persistence in ml_models.
Enforces structural isolation: never writes to classification_results.
"""

import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import joblib
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.ml import MLModel, MLPrediction


class ModelRegistry:
    """Manages model cataloging, serialization, and prediction tracking."""

    def __init__(self, artifact_base_dir: str = "data/ml_artifacts"):
        self.artifact_base_dir = artifact_base_dir
        os.makedirs(self.artifact_base_dir, exist_ok=True)

    def save_artifact(self, pipeline: Any, model_name: str, version: str) -> str:
        """Serializes pipeline object to disk and returns artifact path."""
        filename = f"{model_name}_{version}.joblib"
        path = os.path.join(self.artifact_base_dir, filename)
        joblib.dump(pipeline, path)
        return path

    def load_artifact(self, artifact_path: str) -> Any:
        """Loads serialized pipeline object from disk."""
        if not os.path.exists(artifact_path):
            raise FileNotFoundError(f"Model artifact not found at: {artifact_path}")
        return joblib.load(artifact_path)

    async def register_model(
        self,
        db: AsyncSession,
        model_name: str,
        version: str,
        algorithm: str,
        artifact_path: str,
        hyperparameters: Dict[str, Any],
        metrics: Dict[str, Any],
        dataset_content_hash: str,
        ruleset_version_used: List[int],
        code_commit_hash: Optional[str] = None,
        random_seed: Optional[int] = 42,
        is_active: bool = False,
    ) -> MLModel:
        """
        Persists a trained model record in ml_models.
        """
        ml_model = MLModel(
            model_name=model_name,
            version=version,
            algorithm=algorithm,
            artifact_path=artifact_path,
            hyperparameters_json=hyperparameters,
            metrics_json=metrics,
            dataset_content_hash=dataset_content_hash,
            ruleset_version_used=ruleset_version_used,
            code_commit_hash=code_commit_hash,
            random_seed=random_seed,
            is_active=is_active,
            trained_at=datetime.now(timezone.utc),
        )
        db.add(ml_model)
        await db.commit()
        await db.refresh(ml_model)
        return ml_model

    async def record_prediction(
        self,
        db: AsyncSession,
        assessment_id: int,
        ml_model_id: int,
        predicted_rbdl_level: int,
        confidence_score: float,
        feature_snapshot: Dict[str, Any],
    ) -> MLPrediction:
        """
        Records a research prediction in ml_predictions.
        Never writes to classification_results.
        """
        pred = MLPrediction(
            assessment_id=assessment_id,
            ml_model_id=ml_model_id,
            predicted_rbdl_level=predicted_rbdl_level,
            confidence_score=round(float(confidence_score), 3),
            feature_snapshot_json=feature_snapshot,
            predicted_at=datetime.now(timezone.utc),
        )
        db.add(pred)
        await db.commit()
        await db.refresh(pred)
        return pred
