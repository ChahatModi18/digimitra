"""Dataset Builder (C5 Section 6).

Constructs structured pandas DataFrames and cryptographic manifests
from assessment, score, and profile records.
"""

import hashlib
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
import pandas as pd

from app.ml.constants import ALL_CANONICAL_FEATURES
from app.ml.dataset.quality_filter import QualityFilter
from app.ml.features.feature_extractor import FeatureExtractor


class DatasetManifest:
    """Metadata manifest capturing data provenance and class distributions."""

    def __init__(
        self,
        dataset_content_hash: str,
        built_at: str,
        stage: str,
        ruleset_versions_included: List[int],
        total_assessments_considered: int,
        eligible_after_filtering: int,
        excluded_counts_by_reason: Dict[str, int],
        class_distribution: Dict[str, int],
        distinct_business_count: int,
    ):
        self.dataset_content_hash = dataset_content_hash
        self.built_at = built_at
        self.stage = stage
        self.ruleset_versions_included = ruleset_versions_included
        self.total_assessments_considered = total_assessments_considered
        self.eligible_after_filtering = eligible_after_filtering
        self.excluded_counts_by_reason = excluded_counts_by_reason
        self.class_distribution = class_distribution
        self.distinct_business_count = distinct_business_count

    def to_dict(self) -> Dict[str, Any]:
        return {
            "dataset_content_hash": self.dataset_content_hash,
            "built_at": self.built_at,
            "stage": self.stage,
            "ruleset_versions_included": self.ruleset_versions_included,
            "total_assessments_considered": self.total_assessments_considered,
            "eligible_after_filtering": self.eligible_after_filtering,
            "excluded_counts_by_reason": self.excluded_counts_by_reason,
            "class_distribution": self.class_distribution,
            "distinct_business_count": self.distinct_business_count,
        }


class DatasetBuilder:
    """Extracts, filters, and constructs reproducible dataset tables and manifests."""

    def __init__(self, quality_filter: Optional[QualityFilter] = None):
        self.quality_filter = quality_filter or QualityFilter()

    def build_from_records(
        self,
        raw_assessment_records: List[Dict[str, Any]],
        stage: str = "stage_1",
    ) -> Tuple[pd.DataFrame, DatasetManifest]:
        """
        Builds a DataFrame and manifest from raw input records.

        Each record expected to contain:
        - 'assessment_id': int
        - 'business_id': int
        - 'status': str
        - 'submitted_at': datetime/str
        - 'scores_by_dimension': dict
        - 'business_profile': dict
        - 'target_level': int (0, 1, 2, 3)
        - 'ruleset_version': int
        - 'contradiction_flag': int
        - 'answered_questions': int
        - 'total_questions': int
        """
        total_considered = len(raw_assessment_records)
        eligible_records, exclusion_counts = self.quality_filter.filter_records(raw_assessment_records)

        rows: List[Dict[str, Any]] = []
        ruleset_versions_set = set()
        class_distribution: Dict[str, int] = {"0": 0, "1": 0, "2": 0, "3": 0}
        distinct_business_ids = set()

        for rec in eligible_records:
            feat_vec = FeatureExtractor.extract_from_raw(
                assessment_data={
                    "total_questions": rec.get("total_questions", 14),
                    "answered_questions": rec.get("answered_questions", 14),
                    "contradiction_flag": rec.get("contradiction_flag", 0),
                },
                scores_by_dimension=rec.get("scores_by_dimension", {}),
                business_profile=rec.get("business_profile", {}),
                as_of_timestamp=rec.get("submitted_at"),
            )

            target_lvl = int(rec["target_level"])
            ruleset_ver = int(rec.get("ruleset_version", 1))
            ruleset_versions_set.add(ruleset_ver)

            lvl_str = str(target_lvl)
            if lvl_str in class_distribution:
                class_distribution[lvl_str] += 1
            else:
                class_distribution[lvl_str] = 1

            distinct_business_ids.add(rec["business_id"])

            row_data = {
                "assessment_id": rec["assessment_id"],
                "business_id": rec["business_id"],
                "ruleset_version": ruleset_ver,
                "target_level": target_lvl,
                **feat_vec,
            }
            rows.append(row_data)

        df = pd.DataFrame(rows) if rows else pd.DataFrame(columns=["assessment_id", "business_id", "target_level", "ruleset_version"] + ALL_CANONICAL_FEATURES)

        # Cryptographic dataset content hash
        sorted_ids = sorted([str(r["assessment_id"]) for r in eligible_records])
        hash_payload = f"stage:{stage}|rulesets:{sorted(list(ruleset_versions_set))}|ids:{','.join(sorted_ids)}"
        dataset_content_hash = hashlib.sha256(hash_payload.encode("utf-8")).hexdigest()

        manifest = DatasetManifest(
            dataset_content_hash=dataset_content_hash,
            built_at=datetime.now(timezone.utc).isoformat(),
            stage=stage,
            ruleset_versions_included=sorted(list(ruleset_versions_set)),
            total_assessments_considered=total_considered,
            eligible_after_filtering=len(eligible_records),
            excluded_counts_by_reason=exclusion_counts,
            class_distribution=class_distribution,
            distinct_business_count=len(distinct_business_ids),
        )

        return df, manifest
