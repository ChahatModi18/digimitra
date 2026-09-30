"""Synthetic Recommendation and Roadmap Generator.

Uses the deterministic C4 recommendation catalog, ranking engine, and roadmap generator
to produce verified recommendation sets and phased roadmaps for synthetic businesses.
"""

from typing import Dict, List, Any, Optional
from app.domain.recommendations.catalog_v1 import RECOMMENDATIONS_V1
from app.domain.recommendations.ranking import RecommendationRankingEngine, RankedRecommendation
from app.domain.recommendations.roadmap_generator import RoadmapGeneratorEngine, PhasedRoadmapResult


class SyntheticRecommendationGenerator:
    """Generates deterministic recommendations and roadmaps for synthetic evaluations."""

    @staticmethod
    def generate_recommendations_and_roadmap(
        business: Dict[str, Any],
        assessment_summary: Dict[str, Any],
        requirement_profile: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Generate ranked recommendations and phased roadmap tasks using C4 rules.
        """
        current_level = assessment_summary["rbdl_level"]
        dimension_scores = assessment_summary["dimension_scores"]
        sector = business["sector_code"]
        is_inventory_exempt = sector in ["SERVICES", "PROFESSIONAL", "EDUCATION"]

        target_level = min(current_level + 1, 3)

        # 1. Filter eligible recommendations for target level
        eligible_candidates = [
            r for r in RECOMMENDATIONS_V1
            if r.get("target_rbdl_level") == target_level
        ]

        if not eligible_candidates:
            # Fallback to current level or general candidates
            eligible_candidates = [
                r for r in RECOMMENDATIONS_V1
                if r.get("target_rbdl_level") <= target_level
            ]

        # 2. Filter by budget feasibility from Requirement Profile
        budget_code = requirement_profile.get("budget_tier", "B1_LOW")
        # B0: low cost only; B1: low cost; B2: low + medium; B3: all
        allowed_costs = ["low"]
        if budget_code in ["B2_MODERATE", "B3_HIGHER"]:
            allowed_costs.append("medium")
        if budget_code == "B3_HIGHER":
            allowed_costs.append("high")

        # 3. Deterministic ranking using RecommendationRankingEngine
        ranked_recs: List[RankedRecommendation] = RecommendationRankingEngine.rank_recommendations(
            eligible_recommendations=eligible_candidates,
            dimension_scores=dimension_scores,
        )

        # 4. Generate Phased Roadmap
        roadmap_result: PhasedRoadmapResult = RoadmapGeneratorEngine.generate_roadmap(
            ranked_recommendations=ranked_recs,
            target_rbdl_level=target_level,
        )

        return {
            "target_rbdl_level": target_level,
            "ranked_recommendations": [
                {
                    "recommendation_code": r.recommendation_code,
                    "dimension_code": r.dimension_code,
                    "category": r.category,
                    "title_en": r.title_en,
                    "title_hi": r.title_hi,
                    "priority_score": round(r.priority_breakdown.final_priority_score, 2),
                    "estimated_cost_level": r.estimated_cost_level,
                    "estimated_effort_level": r.estimated_effort_level,
                    "impact_level": r.impact_level_str,
                    "rank_order": r.rank_order,
                    "budget_feasible": r.estimated_cost_level in allowed_costs,
                }
                for r in ranked_recs
            ],
            "total_roadmap_tasks": roadmap_result.total_tasks,
            "phase_1_quick_wins": [t.model_dump() for t in roadmap_result.phase_1_tasks],
            "phase_2_core_steps": [t.model_dump() for t in roadmap_result.phase_2_tasks],
            "phase_3_longer_term": [t.model_dump() for t in roadmap_result.phase_3_tasks],
        }
