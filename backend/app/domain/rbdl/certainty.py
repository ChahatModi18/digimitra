"""Qualitative Certainty Tier Evaluation for RBDL Assessments (Claude C3).

NOTE: Certainty tier is a qualitative assessment reliability indicator. It is NOT
an ML probability / confidence score, and must not be presented as a pseudo-statistical % value.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel

from app.domain.rbdl.contradictions import ContradictionRecord


class CertaintyTier(str, Enum):
    """Qualitative classification certainty rating."""

    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class CertaintyEvaluationResult(BaseModel):
    """Detailed certainty tier determination with rationale."""

    certainty_tier: CertaintyTier
    reasons: List[str]
    is_complete: bool
    contradiction_count: int
    boundary_proximity_detected: bool
    near_threshold_dimensions: List[Dict[str, Any]] = []


class CertaintyEvaluator:
    """Evaluates qualitative result reliability based on completeness, consistency, and score proximity."""

    # Gating thresholds by dimension for boundary proximity checks (1.0 point window)
    RELEVANT_THRESHOLDS: Dict[str, List[float]] = {
        "infra": [4.0],
        "literacy": [3.0],
        "presence": [4.0],
        "comms": [3.0],
        "records": [4.0, 6.0],
        "payments": [4.0, 6.0],
        "inventory": [3.0],
        "data_usage": [5.0],
        "growth": [4.0],
    }

    @classmethod
    def evaluate_certainty(
        cls,
        dimension_scores: Dict[str, float],
        is_complete: bool,
        contradictions: List[ContradictionRecord],
        target_level: int,
    ) -> CertaintyEvaluationResult:
        """Evaluate qualitative certainty tier for the assessment outcome."""
        reasons: List[str] = []
        near_threshold_dimensions: List[Dict[str, Any]] = []

        # 1. Check for LOW certainty triggers: Incompleteness or Contradictions
        has_contradictions = len(contradictions) > 0
        if not is_complete:
            reasons.append("Assessment is incomplete (one or more gating questions were skipped).")
        if has_contradictions:
            for c in contradictions:
                reasons.append(f"Contradiction detected: {c.name}")

        if not is_complete or has_contradictions:
            return CertaintyEvaluationResult(
                certainty_tier=CertaintyTier.LOW,
                reasons=reasons,
                is_complete=is_complete,
                contradiction_count=len(contradictions),
                boundary_proximity_detected=False,
                near_threshold_dimensions=[],
            )

        # 2. Check for MEDIUM certainty triggers: Score within 1.0 point of relevant gating thresholds
        for dim_code, thresholds in cls.RELEVANT_THRESHOLDS.items():
            score = dimension_scores.get(dim_code, 0.0)
            for thresh in thresholds:
                diff = abs(score - thresh)
                if diff <= 1.0:
                    near_threshold_dimensions.append({
                        "dimension_code": dim_code,
                        "dimension_score": score,
                        "gating_threshold": thresh,
                        "delta": round(diff, 2),
                    })
                    reasons.append(
                        f"Dimension '{dim_code}' score ({score}) is within 1.0 point of threshold ({thresh})."
                    )

        if near_threshold_dimensions:
            return CertaintyEvaluationResult(
                certainty_tier=CertaintyTier.MEDIUM,
                reasons=reasons,
                is_complete=True,
                contradiction_count=0,
                boundary_proximity_detected=True,
                near_threshold_dimensions=near_threshold_dimensions,
            )

        # 3. HIGH Certainty
        reasons.append("All gating questions answered cleanly without contradictions or boundary ambiguities.")
        return CertaintyEvaluationResult(
            certainty_tier=CertaintyTier.HIGH,
            reasons=reasons,
            is_complete=True,
            contradiction_count=0,
            boundary_proximity_detected=False,
            near_threshold_dimensions=[],
        )
