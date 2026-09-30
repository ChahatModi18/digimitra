"""Synthetic Dataset Builder and CLI Orchestrator.

Orchestrates generation of comprehensive synthetic MSME datasets.
Outputs dataset metadata, structured records, and provides DataFrame exports
for ML feature extraction and training.
"""

import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
import sys
from typing import Dict, List, Any, Optional
import pandas as pd

from app.ml.synthetic.synthetic_business_generator import SyntheticBusinessGenerator
from app.ml.synthetic.synthetic_assessment_generator import SyntheticAssessmentGenerator
from app.ml.synthetic.synthetic_requirement_generator import SyntheticRequirementGenerator
from app.ml.synthetic.synthetic_recommendation_generator import SyntheticRecommendationGenerator
from app.ml.synthetic.synthetic_validation import SyntheticDataValidator

DATASET_SCHEMA_VERSION = "2.0.0"


class SyntheticDatasetBuilder:
    """End-to-end synthetic dataset generator and exporter."""

    def __init__(self, seed: int = 42):
        self.seed = seed
        self.biz_gen = SyntheticBusinessGenerator(seed=seed)
        self.ass_gen = SyntheticAssessmentGenerator(seed=seed + 1)
        self.req_gen = SyntheticRequirementGenerator(seed=seed + 2)

    def build_dataset(
        self,
        count: int = 5000,
        language: str = "en",
        sector: Optional[str] = None,
        category: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate complete synthetic dataset with business, assessment, requirement,
        and recommendation data.
        """
        records: List[Dict[str, Any]] = []

        for i in range(1, count + 1):
            # Target tier cycle to ensure balanced representation across all 4 levels
            target_tier = (i % 4)

            biz = self.biz_gen.generate_business(
                business_id=i,
                target_capability_tier=target_tier,
                preferred_sector=sector,
                preferred_category=category,
            )

            ass = self.ass_gen.generate_assessment_for_business(biz, language=language)
            req = self.req_gen.generate_requirement_profile(biz, ass)
            recs = SyntheticRecommendationGenerator.generate_recommendations_and_roadmap(biz, ass, req)

            record = {
                "business": biz,
                "assessment": ass,
                "requirement_profile": req,
                "recommendation_summary": recs,
            }
            records.append(record)

        # Validate dataset
        val_report = SyntheticDataValidator.validate_dataset(records)

        # Generate metadata
        dataset_str = json.dumps([r["business"]["synthetic_business_id"] for r in records])
        checksum = hashlib.sha256(dataset_str.encode("utf-8")).hexdigest()
        dataset_id = f"SYN-DS-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{checksum[:8]}"

        metadata = {
            "dataset_id": dataset_id,
            "generation_version": "A11_PROD_DEV_V1",
            "schema_version": DATASET_SCHEMA_VERSION,
            "seed": self.seed,
            "record_count": count,
            "language": language,
            "filter_sector": sector,
            "filter_category": category,
            "generation_timestamp": datetime.now(timezone.utc).isoformat(),
            "checksum_sha256": checksum,
            "validation": val_report,
        }

        return {
            "metadata": metadata,
            "records": records,
        }

    @classmethod
    def to_dataframe(cls, dataset: Dict[str, Any]) -> pd.DataFrame:
        """
        Flattens synthetic records into a canonical feature DataFrame suitable
        for scikit-learn ML training and evaluation.
        """
        rows = []
        for rec in dataset["records"]:
            biz = rec["business"]
            ass = rec["assessment"]
            req = rec["requirement_profile"]

            row = {
                "business_id": biz["synthetic_business_id"],
                "sector": biz["sector_code"],
                "category": biz["category_code"],
                "subcategory": biz["subcategory_code"],
                "business_size": biz["business_size"],
                "years_in_operation": biz["years_operating"],
                "location_level": biz["location_level"],
                "digital_literacy": biz["digital_literacy"],
                "internet_access": 1 if biz["internet_access"] else 0,
                "smartphone_access": 1 if biz["smartphone_access"] else 0,
                "computer_access": 1 if biz["computer_access"] else 0,
                "budget_tier": req["budget_tier"],
                "urgency": req["urgency"],
                "preferred_solution": req["preferred_solution"],
                "num_goals": len(req.get("goals", [])),
                "num_pain_points": len(req.get("pain_points", [])),
                "num_existing_tools": len(req.get("existing_tools", [])),
            }

            # 9 Dimension Scores from assessment
            for dim, score in ass.get("dimension_scores", {}).items():
                row[f"{dim}_score"] = score

            # Targets
            row["composite_score"] = ass.get("composite_score", 0.0)
            row["rbdl_level"] = ass.get("rbdl_level", 0)
            row["target_rbdl_level"] = rec.get("recommendation_summary", {}).get("target_rbdl_level", 1)

            rows.append(row)

        return pd.DataFrame(rows)


def main():
    parser = argparse.ArgumentParser(description="DigiMitra Synthetic Dataset Builder")
    parser.add_argument("--count", type=int, default=1000, help="Number of records to generate (default: 1000)")
    parser.add_argument("--seed", type=int, default=42, help="Deterministic random seed (default: 42)")
    parser.add_argument("--language", type=str, default="en", help="Language: 'en' or 'hi'")
    parser.add_argument("--sector", type=str, default=None, help="Optional sector filter")
    parser.add_argument("--category", type=str, default=None, help="Optional category filter")
    parser.add_argument("--output", type=str, default=None, help="Output JSON path")

    args = parser.parse_args()

    print(f"Building {args.count} synthetic records (seed={args.seed})...")
    builder = SyntheticDatasetBuilder(seed=args.seed)
    dataset = builder.build_dataset(
        count=args.count,
        language=args.language,
        sector=args.sector,
        category=args.category,
    )

    meta = dataset["metadata"]
    print("Generation Complete!")
    print(f"Dataset ID: {meta['dataset_id']}")
    print(f"Total Records: {meta['record_count']}")
    print(f"Validation Status: {'PASS' if meta['validation']['is_valid'] else 'FAIL'}")
    print(f"RBDL Distribution: {meta['validation']['rbdl_level_distribution']}")
    print(f"Sector Counts: {meta['validation']['sector_distribution']}")

    if args.output:
        os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(dataset, f, indent=2, ensure_ascii=False)
        print(f"Saved dataset to {args.output}")


if __name__ == "__main__":
    main()
