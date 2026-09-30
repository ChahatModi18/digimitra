"""Extended Unit Tests for Synthetic Dataset Pipeline."""

import pytest
from app.ml.synthetic.synthetic_dataset_builder import SyntheticDatasetBuilder
from app.ml.synthetic.synthetic_validation import SyntheticDataValidator


from app.domain.taxonomy.categories import SECTORS


def test_synthetic_dataset_generation_and_balance():
    builder = SyntheticDatasetBuilder(seed=42)
    dataset = builder.build_dataset(count=60)
    records = dataset["records"]
    assert len(records) == 60

    # Ensure all 4 RBDL levels are represented
    rbdl_levels = {r["assessment"]["rbdl_level"] for r in records}
    assert 0 in rbdl_levels
    assert 1 in rbdl_levels
    assert 2 in rbdl_levels
    assert 3 in rbdl_levels

    # Ensure all records have business, assessment, requirement, recommendations, and roadmap
    for r in records:
        assert "business" in r
        assert "assessment" in r
        assert "requirement_profile" in r
        assert "recommendation_summary" in r
        assert r["business"]["sector_code"] in SECTORS


def test_synthetic_validator_clean_pass():
    builder = SyntheticDatasetBuilder(seed=123)
    dataset = builder.build_dataset(count=30)
    for r in dataset["records"]:
        errors = SyntheticDataValidator.validate_record(r)
        assert len(errors) == 0, f"Validation errors found: {errors}"


def test_synthetic_validator_catches_impossible_states():
    # Corrupt a record to have no internet but active website
    corrupted_record = {
        "business": {
            "synthetic_business_id": "SYNTH_CORRUPT_001",
            "sector_code": "RETAIL",
            "category_code": "RET_GROCERY",
            "internet_access": False,
            "website_status": "active_ecommerce",  # Impossible without internet
        },
        "assessment": {
            "rbdl_level": 0,
            "dimension_scores": {"infra": 0.0, "records": 0.0, "payments": 0.0, "presence": 0.0},
            "answers": {},
        },
        "requirement_profile": {
            "budget_tier": "B1_LOW",
        },
        "recommendations": [],
        "roadmap": {"total_milestones": 0},
    }

    errors = SyntheticDataValidator.validate_record(corrupted_record)
    assert len(errors) >= 1
    assert any("internet" in e.lower() for e in errors)


def test_synthetic_dataframe_export():
    builder = SyntheticDatasetBuilder(seed=999)
    dataset = builder.build_dataset(count=20)
    df = builder.to_dataframe(dataset)

    assert len(df) == 20
    expected_cols = [
        "business_id",
        "sector",
        "category",
        "business_size",
        "rbdl_level",
        "target_rbdl_level",
    ]
    for col in expected_cols:
        assert col in df.columns

