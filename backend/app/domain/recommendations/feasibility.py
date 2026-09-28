"""Budget Feasibility and Requirement Context Evaluator (Research Instrument V1).

Evaluates:
1. Contextual alignment with primary business goal and pain point.
2. Existing tool inventory to assign ALREADY_HAVE status.
3. Budget feasibility status (FEASIBLE_NOW, LOWER_COST_ALTERNATIVE, DEFER_DUE_TO_BUDGET).
4. Deterministic end-to-end traceability chain.
"""

from typing import Any, Dict, List, Optional, Set
from pydantic import BaseModel

from app.domain.requirements.constants_v1 import (
    BUDGET_TIERS_V1,
    BUSINESS_GOALS_V1,
    EXISTING_TOOLS_V1,
    PAIN_POINTS_V1,
    URGENCY_TIERS_V1,
    FeasibilityStatus,
)


class FeasibilityEvaluationResult(BaseModel):
    """Deterministic feasibility and requirement alignment result."""

    recommendation_code: str
    feasibility_status: str  # FEASIBLE_NOW, LOWER_COST_ALTERNATIVE, DEFER_DUE_TO_BUDGET, ALREADY_HAVE, NOT_APPLICABLE, ELIGIBLE
    budget_fit: str          # within_budget, requires_higher_budget, zero_cost_alternative
    is_goal_aligned: bool
    is_pain_point_aligned: bool
    traceability_chain: Dict[str, Any]


class RecommendationFeasibilityEngine:
    """Evaluates budget feasibility and constructs audit traceability without changing RBDL scoring."""

    # Map existing tools to the recommendation codes they satisfy
    TOOL_TO_REC_MAPPING: Dict[str, List[str]] = {
        "TOOL_UPI_QR": ["REC-PAY-01"],
        "TOOL_WHATSAPP_BIZ": ["REC-COMM-01"],
        "TOOL_GOOGLE_MAPS": ["REC-PRES-01"],
        "TOOL_DIGITAL_KHATA": ["REC-REC-01"],
        "TOOL_POS_BILLING": ["REC-REC-02"],
        "TOOL_INVENTORY_APP": ["REC-INV-01"],
        "TOOL_PAYMENT_GATEWAY": ["REC-PAY-02"],
        "TOOL_ECOMMERCE_STORE": ["REC-GROW-01"],
    }

    # Alternate low-cost recommendations mapping for B0/B1 enterprises
    LOWER_COST_ALTERNATIVES: Dict[str, str] = {
        "REC-REC-02": "REC-REC-01",   # Desktop POS software -> Mobile Digital Khata
        "REC-PAY-02": "REC-PAY-01",   # Online Payment Gateway -> Static UPI QR Stand
        "REC-DATA-01": "REC-REC-01",  # Advanced BI/Analytics -> Built-in Ledger Summaries
    }

    @classmethod
    def evaluate_feasibility(
        cls,
        recommendation: Dict[str, Any],
        requirement_profile: Optional[Dict[str, Any]],
        dimension_scores: Dict[str, float],
        target_rbdl_level: int,
        target_gate_score: float = 4.0,
    ) -> FeasibilityEvaluationResult:
        """Evaluate budget feasibility and build complete traceability chain."""
        rec_code = recommendation.get("recommendation_code", "")
        cost_level = str(recommendation.get("estimated_cost_level", "low")).lower()
        dim_code = recommendation.get("dimension_code", "")
        actual_score = float(dimension_scores.get(dim_code, 0.0))
        gap = max(0.0, round(target_gate_score - actual_score, 2))

        # Default contextual attributes if no requirement profile is attached
        req_profile = requirement_profile or {}
        goal_code = req_profile.get("business_goal", "G10_OTHER")
        pain_point_code = req_profile.get("primary_pain_point", "P10_OTHER")
        urgency_code = req_profile.get("urgency", "U2_WITHIN_6_MONTHS")
        budget_tier_code = req_profile.get("budget_tier", "B1_LOW")
        existing_tools: List[str] = req_profile.get("existing_tools") or []

        tier_info = BUDGET_TIERS_V1.get(budget_tier_code, BUDGET_TIERS_V1["B1_LOW"])
        compatible_costs = tier_info.get("compatible_cost_levels", ["low"])

        # 1. Check if business already uses this tool
        is_already_had = False
        for tool_code in existing_tools:
            if rec_code in cls.TOOL_TO_REC_MAPPING.get(tool_code, []):
                is_already_had = True
                break

        if is_already_had:
            feasibility_status = FeasibilityStatus.ALREADY_HAVE
            budget_fit = "already_adopted"
        else:
            # 2. Evaluate Budget Feasibility
            if cost_level in compatible_costs:
                feasibility_status = FeasibilityStatus.FEASIBLE_NOW
                budget_fit = "within_budget"

            else:
                # If recommendation has an accessible lower-cost alternative
                if rec_code in cls.LOWER_COST_ALTERNATIVES:
                    feasibility_status = FeasibilityStatus.LOWER_COST_ALTERNATIVE
                    budget_fit = "has_lower_cost_alternative"
                else:
                    # Capability is still needed, but marked deferred due to budget constraint
                    feasibility_status = FeasibilityStatus.DEFER_DUE_TO_BUDGET
                    budget_fit = "requires_higher_budget"

        # 3. Contextual Alignment
        goal_info = BUSINESS_GOALS_V1.get(goal_code, {})
        is_goal_aligned = dim_code in goal_info.get("primary_dimensions", [])

        pain_info = PAIN_POINTS_V1.get(pain_point_code, {})
        is_pain_point_aligned = (
            dim_code == pain_info.get("target_dimension")
            or dim_code == pain_info.get("secondary_dimension")
        )

        # 4. Construct End-to-End Reproducible Traceability Chain
        traceability_chain = {
            "step_1_assessment": {
                "dimension_code": dim_code,
                "actual_score": actual_score,
                "target_gate_score": target_gate_score,
                "target_rbdl_level": target_rbdl_level,
            },
            "step_2_capability_gap": {
                "dimension": dim_code,
                "gap_magnitude": gap,
                "is_gap_present": gap > 0,
            },
            "step_3_business_context": {
                "business_goal": goal_code,
                "goal_name_en": goal_info.get("name_en", "General Goal"),
                "primary_pain_point": pain_point_code,
                "pain_point_name_en": pain_info.get("name_en", "General Challenge"),
                "urgency": urgency_code,
                "budget_tier": budget_tier_code,
                "illustrative_budget_range": tier_info.get("illustrative_range", "Illustrative"),
                "is_goal_aligned": is_goal_aligned,
                "is_pain_point_aligned": is_pain_point_aligned,
            },
            "step_4_feasibility_evaluation": {
                "recommendation_code": rec_code,
                "estimated_cost_level": cost_level,
                "budget_tier": budget_tier_code,
                "feasibility_status": feasibility_status,
                "budget_fit": budget_fit,
            },
            "step_5_traceability_summary": (
                f"Dimension '{dim_code}' (Score: {actual_score}/10, Gap: {gap}) -> "
                f"Goal: {goal_code}, Pain: {pain_point_code} -> "
                f"Rec: {rec_code} (Cost: {cost_level}) -> "
                f"Feasibility: {feasibility_status} (Budget: {budget_tier_code})"
            ),
        }

        return FeasibilityEvaluationResult(
            recommendation_code=rec_code,
            feasibility_status=feasibility_status,
            budget_fit=budget_fit,
            is_goal_aligned=is_goal_aligned,
            is_pain_point_aligned=is_pain_point_aligned,
            traceability_chain=traceability_chain,
        )
