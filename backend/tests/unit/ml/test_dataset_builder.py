"""Unit Tests for Dataset Builder & Quality Filtering (C5 Section 6 & 22)."""

from app.ml.dataset.quality_filter import QualityFilter
from app.ml.dataset.dataset_builder import DatasetBuilder


def test_quality_filter_exclusions():
    """Verify quality filter properly drops non-submitted and low-completion records."""
    filter_obj = QualityFilter(min_completion_ratio=0.5, allow_contradictions=False)

    records = [
        # Valid
        {"assessment_id": 1, "status": "submitted", "completion_ratio": 1.0, "contradiction_flag": 0, "target_level": 1},
        # Not submitted (in_progress) -> excluded
        {"assessment_id": 2, "status": "in_progress", "completion_ratio": 1.0, "contradiction_flag": 0, "target_level": 1},
        # Below completion threshold (< 0.5) -> excluded
        {"assessment_id": 3, "status": "submitted", "completion_ratio": 0.2, "contradiction_flag": 0, "target_level": 1},
        # Unresolved contradiction -> excluded
        {"assessment_id": 4, "status": "submitted", "completion_ratio": 1.0, "contradiction_flag": 1, "target_level": 2},
        # Missing label -> excluded
        {"assessment_id": 5, "status": "submitted", "completion_ratio": 1.0, "contradiction_flag": 0, "target_level": None},
    ]

    eligible, exclusions = filter_obj.filter_records(records)
    assert len(eligible) == 1
    assert eligible[0]["assessment_id"] == 1
    assert exclusions["not_submitted"] == 1
    assert exclusions["below_completion_threshold"] == 1
    assert exclusions["unresolved_contradiction"] == 1
    assert exclusions["missing_label"] == 1


def test_dataset_builder_manifest_and_hashing():
    """Verify dataset builder creates consistent DataFrame and cryptographic hash."""
    builder = DatasetBuilder()

    records = [
        {
            "assessment_id": 101,
            "business_id": 1,
            "status": "submitted",
            "scores_by_dimension": {"infra": 5.0, "literacy": 4.0},
            "business_profile": {"sector": "Retail & Trade", "enterprise_size": "Micro"},
            "target_level": 1,
            "ruleset_version": 1,
            "contradiction_flag": 0,
            "answered_questions": 14,
            "total_questions": 14,
        },
        {
            "assessment_id": 102,
            "business_id": 2,
            "status": "submitted",
            "scores_by_dimension": {"infra": 2.0, "literacy": 1.0},
            "business_profile": {"sector": "Manufacturing", "enterprise_size": "Small"},
            "target_level": 0,
            "ruleset_version": 1,
            "contradiction_flag": 0,
            "answered_questions": 14,
            "total_questions": 14,
        },
    ]

    df, manifest = builder.build_from_records(records, stage="stage_1")

    assert len(df) == 2
    assert "target_level" in df.columns
    assert "business_id" in df.columns
    assert manifest.total_assessments_considered == 2
    assert manifest.eligible_after_filtering == 2
    assert manifest.class_distribution["0"] == 1
    assert manifest.class_distribution["1"] == 1
    assert len(manifest.dataset_content_hash) == 64  # SHA256 hex string
