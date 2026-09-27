"""Deterministic Priority Scoring and Ranking Engine (Claude C4).

Pure Python implementation without database dependencies.
Calculates priority_score using:
  priority_score = (impact_weight * impact_level)
                 + (feasibility_weight * feasibility_level)
                 - (cost_weight * cost_level)
                 + (readiness_weight * readiness_alignment)
"""

from typing import Any, Dict, List
from pydantic import BaseModel


class PriorityScoreBreakdown(BaseModel):
    """Explainable components of a recommendation's priority score."""

    impact_level: int          # 1, 2, 3
    feasibility_level: int     # 1, 2, 3 (inverse of effort)
    cost_level: int            # 1, 2, 3
    readiness_alignment: float # 1.0, 2.0, 3.0
    impact_component: float    # impact_weight * impact_level
    feasibility_component: float
    cost_component: float
    readiness_component: float
    final_priority_score: float


class RankedRecommendation(BaseModel):
    """Ranked recommendation ready for roadmap assignment."""

    recommendation_code: str
    target_rbdl_level: int
    dimension_code: str
    category: str
    title_en: str
    title_hi: str
    description_en: str
    description_hi: str
    estimated_cost_level: str
    estimated_effort_level: str
    impact_level_str: str
    priority_breakdown: PriorityScoreBreakdown
    rank_order: int = 0
    reason_en: str = ""
    reason_hi: str = ""


class RecommendationRankingEngine:
    """Configurable, deterministic priority ranking engine."""

    # Default research weights per Claude C4
    IMPACT_WEIGHT: float = 0.4
    FEASIBILITY_WEIGHT: float = 0.2
    COST_WEIGHT: float = 0.1
    READINESS_WEIGHT: float = 0.3

    EFFORT_TO_FEASIBILITY: Dict[str, int] = {
        "low": 3,
        "medium": 2,
        "high": 1,
    }

    COST_MAP: Dict[str, int] = {
        "low": 1,
        "medium": 2,
        "high": 3,
    }

    IMPACT_MAP: Dict[str, int] = {
        "low": 1,
        "medium": 2,
        "high": 3,
    }

    # Target level dimension thresholds per Claude C3
    TARGET_THRESHOLDS: Dict[int, Dict[str, float]] = {
        1: {"infra": 4.0, "literacy": 3.0, "payments": 3.0},
        2: {"presence": 4.0, "comms": 3.0, "records": 4.0, "payments": 4.0, "inventory": 3.0},
        3: {"payments": 6.0, "records": 6.0, "data_usage": 5.0, "growth": 4.0},
    }

    @classmethod
    def calculate_priority_score(
        cls,
        recommendation: Dict[str, Any],
        dimension_scores: Dict[str, float],
    ) -> PriorityScoreBreakdown:
        """Calculate deterministic priority score and explainable components."""
        impact_str = str(recommendation.get("impact_level", "medium")).lower()
        effort_str = str(recommendation.get("estimated_effort_level", "low")).lower()
        cost_str = str(recommendation.get("estimated_cost_level", "low")).lower()
        dim_code = recommendation.get("dimension_code", "")
        target_level = recommendation.get("target_rbdl_level", 1)

        impact_lvl = cls.IMPACT_MAP.get(impact_str, 2)
        feasibility_lvl = cls.EFFORT_TO_FEASIBILITY.get(effort_str, 3)
        cost_lvl = cls.COST_MAP.get(cost_str, 1)

        # Compute Readiness Alignment (1.0 to 3.0)
        readiness = cls._calculate_readiness_alignment(
            dim_code=dim_code,
            target_level=target_level,
            dimension_scores=dimension_scores,
        )

        impact_comp = round(cls.IMPACT_WEIGHT * impact_lvl, 3)
        feasibility_comp = round(cls.FEASIBILITY_WEIGHT * feasibility_lvl, 3)
        cost_comp = round(cls.COST_WEIGHT * cost_lvl, 3)
        readiness_comp = round(cls.READINESS_WEIGHT * readiness, 3)

        final_score = round(impact_comp + feasibility_comp - cost_comp + readiness_comp, 2)

        return PriorityScoreBreakdown(
            impact_level=impact_lvl,
            feasibility_level=feasibility_lvl,
            cost_level=cost_lvl,
            readiness_alignment=readiness,
            impact_component=impact_comp,
            feasibility_component=feasibility_comp,
            cost_component=cost_comp,
            readiness_component=readiness_comp,
            final_priority_score=final_score,
        )

    @classmethod
    def rank_recommendations(
        cls,
        eligible_recommendations: List[Dict[str, Any]],
        dimension_scores: Dict[str, float],
    ) -> List[RankedRecommendation]:
        """Rank eligible recommendations in descending order of priority_score."""
        scored_items: List[RankedRecommendation] = []

        for rec in eligible_recommendations:
            breakdown = cls.calculate_priority_score(rec, dimension_scores)
            scored_items.append(
                RankedRecommendation(
                    recommendation_code=rec.get("recommendation_code", ""),
                    target_rbdl_level=rec.get("target_rbdl_level", 1),
                    dimension_code=rec.get("dimension_code", ""),
                    category=rec.get("category", ""),
                    title_en=rec.get("title_en", ""),
                    title_hi=rec.get("title_hi", ""),
                    description_en=rec.get("description_en", ""),
                    description_hi=rec.get("description_hi", ""),
                    estimated_cost_level=rec.get("estimated_cost_level", "low"),
                    estimated_effort_level=rec.get("estimated_effort_level", "low"),
                    impact_level_str=rec.get("impact_level", "medium"),
                    priority_breakdown=breakdown,
                    reason_en=rec.get("reason_en", ""),
                    reason_hi=rec.get("reason_hi", ""),
                )
            )

        # Sort deterministically: priority_score desc, then impact desc, then default_priority asc, then code asc
        scored_items.sort(
            key=lambda x: (
                -x.priority_breakdown.final_priority_score,
                -x.priority_breakdown.impact_level,
                x.recommendation_code,
            )
        )

        # Assign 1-indexed rank_order
        for idx, item in enumerate(scored_items, start=1):
            item.rank_order = idx

        return scored_items

    @classmethod
    def _calculate_readiness_alignment(
        cls,
        dim_code: str,
        target_level: int,
        dimension_scores: Dict[str, float],
    ) -> float:
        """Compute readiness alignment score (1.0, 2.0, or 3.0) based on distance to requirement."""
        score = dimension_scores.get(dim_code, 0.0)
        target_req = cls.TARGET_THRESHOLDS.get(target_level, {}).get(dim_code, 4.0)

        gap = max(0.0, target_req - score)
        if gap <= 1.0:
            return 3.0  # High readiness / close to threshold
        elif gap <= 2.5:
            return 2.0  # Moderate readiness
        else:
            return 1.0  # Lower readiness
