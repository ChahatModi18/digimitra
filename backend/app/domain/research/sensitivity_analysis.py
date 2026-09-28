"""Threshold Sensitivity Analysis Utility (Safeguard I-05).

DISCLAIMER:
===========================================================
RESEARCH SENSITIVITY ANALYSIS — NOT PRODUCTION CLASSIFICATION
===========================================================
This utility provides read-only perturbation analysis on RBDL gating thresholds.
It DOES NOT alter production rules, database rules, or real-world classification logic.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class GatePerturbationResult(BaseModel):
    """Perturbation outcome for a single gating requirement."""

    dimension_code: str
    gate_name: str
    original_threshold: float
    perturbed_threshold: float
    perturbation_step: float
    total_evaluated_records: int
    unaffected_count: int
    promoted_count: int
    demoted_count: int
    level_transitions: Dict[str, int]  # e.g., "0->1": 2, "1->2": 1


class SensitivityReport(BaseModel):
    """Full sensitivity analysis report."""

    disclaimer: str = "RESEARCH SENSITIVITY ANALYSIS — NOT PRODUCTION CLASSIFICATION"
    total_records: int
    dataset_description: str
    evaluations: List[GatePerturbationResult]


class ThresholdSensitivityAnalyzer:
    """Read-only evaluator that simulates gate threshold perturbations."""

    GATES = [
        # (gate_name, dimension_code, default_threshold, target_level)
        ("Level 1: Digital Infrastructure", "infra", 4.0, 1),
        ("Level 1: Digital Literacy", "literacy", 3.0, 1),
        ("Level 2: Online Presence", "presence", 4.0, 2),
        ("Level 2: Customer Communication", "comms", 3.0, 2),
        ("Level 2: Financial Tracking (Records/Payments)", "records", 4.0, 2),
        ("Level 2: Inventory Management", "inventory", 3.0, 2),
        ("Level 3: Payment Systems", "payments", 6.0, 3),
        ("Level 3: Accounting Records", "records", 6.0, 3),
        ("Level 3: Data-Driven Decision Usage", "data_usage", 5.0, 3),
        ("Level 3: Digital Growth Readiness", "growth", 4.0, 3),
    ]

    @classmethod
    def analyze_dataset(
        cls,
        assessment_scores_list: List[Dict[str, float]],
        perturbation_step: float = 0.5,
    ) -> SensitivityReport:
        """Run perturbation analysis across a collection of dimension score maps."""
        total = len(assessment_scores_list)
        evaluations: List[GatePerturbationResult] = []

        for gate_name, dim_code, base_thresh, target_lvl in cls.GATES:
            for step_multiplier in (-1.0, 1.0):
                delta = perturbation_step * step_multiplier
                perturbed_thresh = round(base_thresh + delta, 2)

                promoted = 0
                demoted = 0
                unaffected = 0
                transitions: Dict[str, int] = {}

                for score_map in assessment_scores_list:
                    score = score_map.get(dim_code, 0.0)
                    base_passed = score >= base_thresh
                    perturbed_passed = score >= perturbed_thresh

                    if base_passed == perturbed_passed:
                        unaffected += 1
                    elif not base_passed and perturbed_passed:
                        promoted += 1
                        trans_key = f"{target_lvl - 1}->{target_lvl}"
                        transitions[trans_key] = transitions.get(trans_key, 0) + 1
                    elif base_passed and not perturbed_passed:
                        demoted += 1
                        trans_key = f"{target_lvl}->{target_lvl - 1}"
                        transitions[trans_key] = transitions.get(trans_key, 0) + 1

                evaluations.append(
                    GatePerturbationResult(
                        dimension_code=dim_code,
                        gate_name=gate_name,
                        original_threshold=base_thresh,
                        perturbed_threshold=perturbed_thresh,
                        perturbation_step=delta,
                        total_evaluated_records=total,
                        unaffected_count=unaffected,
                        promoted_count=promoted,
                        demoted_count=demoted,
                        level_transitions=transitions,
                    )
                )

        dataset_desc = (
            f"Empirical dataset containing {total} submitted assessment records."
            if total > 0
            else "No empirical submitted records available in database; sensitivity evaluation empty."
        )

        return SensitivityReport(
            total_records=total,
            dataset_description=dataset_desc,
            evaluations=evaluations,
        )
