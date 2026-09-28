"""Synthetic Dataset Generator for Pipeline Correctness Testing (C5 Section 19).

Generates in-memory pandas DataFrames ONLY.
Never touches production assessment or business database tables.
Labels are computed via real rule engine gating logic for realistic class structure.
"""

from typing import List, Optional
import numpy as np
import pandas as pd

from app.ml.constants import DIMENSION_CODES, ALL_CANONICAL_FEATURES, SYNTHETIC_DATA_LABEL
from app.ml.models.baselines import RuleEngineBaseline


class SyntheticDataGenerator:
    """Generates clean, realistic in-memory test data for pipeline validation."""

    @staticmethod
    def generate_synthetic_dataset(
        n_businesses: int = 40,
        assessments_per_business: int = 2,
        random_seed: int = 42,
        missingness_rate: float = 0.05,
    ) -> pd.DataFrame:
        """
        Generates synthetic assessment dataset with realistic feature correlations and RBDL labels.

        Parameters:
        -----------
        n_businesses : Number of unique synthetic MSME businesses
        assessments_per_business : Assessments per business (tests grouped splitting)
        random_seed : PRNG seed for deterministic reproducibility
        missingness_rate : Probability of optional fields (years_in_operation, etc.) being missing
        """
        rng = np.random.RandomState(random_seed)
        sectors = [
            "Retail & Trade",
            "Manufacturing",
            "Food & Hospitality",
            "Services & Consulting",
            "Textile & Garments",
            "Healthcare & Wellness",
        ]
        sizes = ["micro", "small", "medium"]

        rows = []
        assessment_counter = 1000

        for biz_idx in range(1, n_businesses + 1):
            biz_id = 10000 + biz_idx
            sector = rng.choice(sectors)
            biz_size = rng.choice(sizes, p=[0.7, 0.2, 0.1])
            
            # Base readiness capability of this business (0.0 to 1.0)
            base_capability = rng.beta(2, 2)

            for ass_num in range(assessments_per_business):
                assessment_id = assessment_counter
                assessment_counter += 1

                # Slight evolution/improvement on subsequent assessments
                eval_capability = min(1.0, base_capability + (ass_num * rng.uniform(0.0, 0.15)))

                row: dict = {
                    "assessment_id": assessment_id,
                    "business_id": biz_id,
                    "ruleset_version": 1,
                    "business_size": biz_size,
                    "category_id": sector,
                }

                # Generate 9 dimension scores (0.0 to 10.0) based on capability with realistic correlations
                for dim in DIMENSION_CODES:
                    noise = rng.normal(0, 1.2)
                    raw_val = (eval_capability * 10.0) + noise
                    score = max(0.0, min(10.0, round(raw_val, 1)))

                    # Missing indicator
                    is_missing = 1 if (rng.rand() < missingness_rate and dim in ("records", "inventory")) else 0
                    row[f"{dim}_score"] = 0.0 if is_missing else score
                    row[f"{dim}_missing"] = is_missing

                # Inventory applicability
                is_service = sector in ("Services & Consulting", "Healthcare & Wellness")
                row["inventory_applicable"] = 0 if is_service else 1

                # Quality metrics
                row["completion_ratio"] = 1.0
                row["contradiction_flag"] = 0

                # Business metadata
                has_years = rng.rand() > missingness_rate
                row["years_in_operation"] = float(rng.randint(1, 30)) if has_years else 0.0
                row["years_missing"] = 0 if has_years else 1

                has_emp = rng.rand() > missingness_rate
                row["employee_count"] = float(rng.randint(1, 50)) if has_emp else 0.0
                row["employees_missing"] = 0 if has_emp else 1

                rows.append(row)

        df = pd.DataFrame(rows)

        # Compute deterministic RBDL level labels using production RuleEngineBaseline
        rule_engine = RuleEngineBaseline()
        df["target_level"] = rule_engine.predict(df)

        # Attach mandatory synthetic metadata attribute
        df.attrs["source"] = SYNTHETIC_DATA_LABEL
        df.attrs["synthetic"] = True
        df.attrs["random_seed"] = random_seed

        return df
