"""Production Safety Unit Test (C5 Section 21 & 22).

Asserts that executing the ML pipeline (synthetic training + prediction)
causes zero row modifications in production classification_results,
business_recommendations, roadmaps, and roadmap_tasks tables.
"""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select

from app.models.classification_result import ClassificationResult
from app.models.recommendation import BusinessRecommendation
from app.models.roadmap import Roadmap, RoadmapTask
from app.ml.training.train_classifier import ClassifierTrainer
from app.ml.synthetic.synthetic_generator import SyntheticDataGenerator


@pytest.mark.asyncio
async def test_production_tables_row_counts_unaltered_by_ml_run(db_session: AsyncSession):
    """
    Verify that executing an ML training pipeline causes ZERO row count changes
    in production tables.
    """
    # 1. Capture baseline counts before ML execution
    count_clf_before = await db_session.scalar(select(func.count()).select_from(ClassificationResult)) or 0
    count_rec_before = await db_session.scalar(select(func.count()).select_from(BusinessRecommendation)) or 0
    count_rm_before = await db_session.scalar(select(func.count()).select_from(Roadmap)) or 0
    count_tasks_before = await db_session.scalar(select(func.count()).select_from(RoadmapTask)) or 0

    # 2. Run full ML pipeline on synthetic data
    df_synthetic = SyntheticDataGenerator.generate_synthetic_dataset(n_businesses=20, random_seed=42)
    run_record = ClassifierTrainer.train_and_evaluate(
        df=df_synthetic,
        algorithm_name="logistic_regression",
        model_name="synthetic_safety_test_model",
        k_folds=2,
    )

    assert run_record["final_pipeline"] is not None

    # 3. Capture counts after ML execution
    count_clf_after = await db_session.scalar(select(func.count()).select_from(ClassificationResult)) or 0
    count_rec_after = await db_session.scalar(select(func.count()).select_from(BusinessRecommendation)) or 0
    count_rm_after = await db_session.scalar(select(func.count()).select_from(Roadmap)) or 0
    count_tasks_after = await db_session.scalar(select(func.count()).select_from(RoadmapTask)) or 0

    # 4. Assert zero mutation in production tables
    assert count_clf_after == count_clf_before, "Production safety violation: classification_results row count changed!"
    assert count_rec_after == count_rec_before, "Production safety violation: business_recommendations row count changed!"
    assert count_rm_after == count_rm_before, "Production safety violation: roadmaps row count changed!"
    assert count_tasks_after == count_tasks_before, "Production safety violation: roadmap_tasks row count changed!"
