"""Safe Recommendation Fusion Service.

Combines the deterministic C4 recommendation engine with advisory ML ranking
under strict architectural guardrails.

Architectural Invariants:
1. Authoritative Guardrail: The deterministic C4 rule engine alone determines
   eligibility, prerequisite gating, and budget feasibility.
2. Non-Authoritative ML: Machine learning predictions act strictly as advisory
   re-ranking signals within the pre-approved set of eligible recommendations.
3. Inviolable Constraints:
   - ML cannot recommend an ineligible action.
   - ML cannot bypass prerequisite dependencies.
   - ML cannot override budget feasibility states (e.g. DEFER_DUE_TO_BUDGET).
   - ML cannot bypass the RBDL level ceiling.
   - ML cannot invent recommendations outside the canonical catalog.
"""

from typing import Dict, List, Any, Optional
from app.domain.recommendations.catalog_v1 import RECOMMENDATIONS_V1
from app.domain.recommendations.ranking import RecommendationRankingEngine, RankedRecommendation
from app.domain.recommendations.roadmap_generator import RoadmapGeneratorEngine, PhasedRoadmapResult
from app.domain.requirements.constants_v1 import FeasibilityStatus, BUDGET_TIERS_V1


class RecommendationFusionService:
    """Safe fusion of deterministic C4 recommendations with advisory ML weighting."""

    # Fusion weighting: 80% deterministic rule authority, 20% advisory ML signal
    DETERMINISTIC_WEIGHT: float = 0.80
    ML_ADVISORY_WEIGHT: float = 0.20

    @classmethod
    def fuse_recommendations(
        cls,
        dimension_scores: Dict[str, float],
        current_level: int,
        business_profile: Dict[str, Any],
        requirement_profile: Optional[Dict[str, Any]] = None,
        ml_advisory_scores: Optional[Dict[str, float]] = None,
    ) -> Dict[str, Any]:
        """
        Produce a fused recommendation set and phased roadmap.
        
        Parameters:
        -----------
        dimension_scores : Dict of 9 dimension scores (0.0 to 10.0)
        current_level : Current verified RBDL level (0, 1, 2, or 3)
        business_profile : Enterprise metadata (sector, size, category)
        requirement_profile : Optional Requirement Profile V1 (budget, goals, tools)
        ml_advisory_scores : Optional dict of recommendation_code -> advisory priority (0.0 to 10.0)
        """
        sector = business_profile.get("sector_code") or business_profile.get("sector", "RETAIL")
        is_inventory_exempt = sector in ["SERVICES", "PROFESSIONAL", "EDUCATION"]
        target_level = min(current_level + 1, 3)

        req_profile = requirement_profile or {}
        budget_code = req_profile.get("budget_tier", "B1_LOW")
        existing_tools = set(req_profile.get("existing_tools", []))

        # Determine compatible cost levels
        budget_info = BUDGET_TIERS_V1.get(budget_code, BUDGET_TIERS_V1["B1_LOW"])
        compatible_costs = budget_info.get("compatible_cost_levels", ["low"])

        # 1. Authoritative C4 Filtering: Only eligible target level items
        eligible_candidates = [
            r for r in RECOMMENDATIONS_V1
            if r.get("target_rbdl_level") == target_level
        ]

        if not eligible_candidates:
            eligible_candidates = [
                r for r in RECOMMENDATIONS_V1
                if r.get("target_rbdl_level") <= target_level
            ]

        # 2. Deterministic C4 Priority Ranking
        ranked_recs: List[RankedRecommendation] = RecommendationRankingEngine.rank_recommendations(
            eligible_recommendations=eligible_candidates,
            dimension_scores=dimension_scores,
        )

        # 3. Safe Advisory Fusion Layer
        fused_items: List[Dict[str, Any]] = []
        ml_applied = ml_advisory_scores is not None and len(ml_advisory_scores) > 0

        for r in ranked_recs:
            code = r.recommendation_code
            base_score = r.priority_breakdown.final_priority_score
            cost_lvl = r.estimated_cost_level

            # Determine Feasibility Status (Rule-governed guardrails)
            feasibility = FeasibilityStatus.FEASIBLE_NOW
            if cost_lvl not in compatible_costs:
                feasibility = FeasibilityStatus.DEFER_DUE_TO_BUDGET

            # Check if business already possesses equivalent tool
            if r.dimension_code == "payments" and "UPI Soundbox" in existing_tools and code == "REC-PAY-01":
                feasibility = FeasibilityStatus.ALREADY_HAVE
            elif r.dimension_code == "records" and ("Accounting Software" in existing_tools or "Cloud ERP" in existing_tools) and code == "REC-REC-01":
                feasibility = FeasibilityStatus.ALREADY_HAVE

            # ML Advisory Score calculation
            ml_score = 5.0  # Neutral baseline
            if ml_applied and code in ml_advisory_scores:
                ml_score = float(ml_advisory_scores[code])

            # Safe Fusion Formula:
            # If item is blocked by budget or already possessed, ML CANNOT boost it to the top!
            if feasibility == FeasibilityStatus.FEASIBLE_NOW:
                fused_score = round(
                    (cls.DETERMINISTIC_WEIGHT * base_score) + (cls.ML_ADVISORY_WEIGHT * ml_score),
                    2
                )
            else:
                # Deferral status strictly maintained; base score discounted
                fused_score = round(base_score * 0.4, 2)

            fused_items.append({
                "recommendation_code": code,
                "dimension_code": r.dimension_code,
                "category": r.category,
                "title_en": r.title_en,
                "title_hi": r.title_hi,
                "description_en": r.description_en,
                "description_hi": r.description_hi,
                "deterministic_priority_score": base_score,
                "ml_advisory_score": ml_score if ml_applied else None,
                "fused_priority_score": fused_score,
                "feasibility_status": feasibility,
                "budget_tier": budget_code,
                "estimated_cost_level": cost_lvl,
                "estimated_effort_level": r.estimated_effort_level,
                "impact_level": r.impact_level_str,
                "guardrail_status": "PROTECTED_BY_C4_RULE_ENGINE",
            })

        # 4. Sort strictly by fused_priority_score desc, respecting feasibility
        # Feasible now items always precede deferred items
        fused_items.sort(
            key=lambda x: (
                1 if x["feasibility_status"] == FeasibilityStatus.FEASIBLE_NOW else 0,
                x["fused_priority_score"],
            ),
            reverse=True,
        )

        for rank, item in enumerate(fused_items, start=1):
            item["rank_order"] = rank

        # 5. Phased Roadmap Generation (deterministic assignment)
        roadmap_result: PhasedRoadmapResult = RoadmapGeneratorEngine.generate_roadmap(
            ranked_recommendations=ranked_recs,
            target_rbdl_level=target_level,
        )

        return {
            "target_rbdl_level": target_level,
            "total_recommendations": len(fused_items),
            "recommendations": fused_items,
            "fusion_metadata": {
                "rule_engine_authority": True,
                "ml_applied": ml_applied,
                "deterministic_weight": cls.DETERMINISTIC_WEIGHT,
                "ml_weight": cls.ML_ADVISORY_WEIGHT if ml_applied else 0.0,
                "advisory_disclaimer": "ML ranking is strictly advisory. Official eligibility governed by deterministic C4 rules.",
            },
            "phased_roadmap": {
                "total_tasks": roadmap_result.total_tasks,
                "phase_1_quick_wins": [t.model_dump() for t in roadmap_result.phase_1_tasks],
                "phase_2_core_steps": [t.model_dump() for t in roadmap_result.phase_2_tasks],
                "phase_3_longer_term": [t.model_dump() for t in roadmap_result.phase_3_tasks],
            },
        }
