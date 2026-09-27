"""Eligibility and Exclusion Evaluator for Recommendations (Claude C4).

Enforces:
1. One-Level-Above Ceiling Rule (Level 0 -> Level 1 only, Level 1 -> Level 2 only, Level 2 -> Level 3 only).
2. Prerequisite condition evaluation via RuleConditionParser.
3. Category-level & N/A dimension exclusions (e.g., inventory exclusion for services).
4. Already-satisfied dimension capability exclusions.
5. Historical completed recommendations deduplication.
"""

from typing import Any, Dict, List, Optional, Set
from pydantic import BaseModel

from app.domain.classification.rule_condition_parser import RuleConditionParser


class EligibilityEvaluationResult(BaseModel):
    """Evaluation result for an individual recommendation's eligibility."""

    recommendation_code: str
    is_eligible: bool
    rejection_reason: Optional[str] = None
    level_ceiling_passed: bool
    prerequisites_passed: bool
    na_exclusion_passed: bool
    already_satisfied: bool = False
    previously_completed: bool = False


class RecommendationEligibilityEngine:
    """Deterministic eligibility rule evaluator."""

    @classmethod
    def evaluate_eligibility(
        cls,
        recommendation: Dict[str, Any],
        current_rbdl_level: int,
        dimension_scores: Dict[str, float],
        business_profile: Dict[str, Any],
        completed_recommendation_codes: Optional[Set[str]] = None,
        na_dimensions: Optional[Set[str]] = None,
    ) -> EligibilityEvaluationResult:
        """Evaluate whether a recommendation is eligible for a business given its assessment profile."""
        code = recommendation.get("recommendation_code", "")
        target_level = recommendation.get("target_rbdl_level", 1)
        dim_code = recommendation.get("dimension_code", "")
        prereq_json = recommendation.get("prerequisite_json")

        completed_codes = completed_recommendation_codes or set()
        na_dims = na_dimensions or set()

        # 1. Check Previously Completed
        if code in completed_codes:
            return EligibilityEvaluationResult(
                recommendation_code=code,
                is_eligible=False,
                rejection_reason="Recommendation was already completed in a previous roadmap.",
                level_ceiling_passed=True,
                prerequisites_passed=True,
                na_exclusion_passed=True,
                previously_completed=True,
            )

        # 2. Enforce One-Level-Above Ceiling Rule & Level Scope
        # Level 0 -> Target Level 1 (foundational readiness: infra_setup, literacy_training ONLY)
        # Level 1 -> Target Level 2 (operational digitization: records, payments, inventory, presence, comms)
        # Level 2 -> Target Level 3 (growth/data: data_usage, growth, records, payments)
        # Level 3 -> No advancement recommendations
        if current_rbdl_level >= 3:
            return EligibilityEvaluationResult(
                recommendation_code=code,
                is_eligible=False,
                rejection_reason=f"Business is at Level {current_rbdl_level}; no further advancement recommendations are in scope.",
                level_ceiling_passed=False,
                prerequisites_passed=False,
                na_exclusion_passed=True,
            )

        allowed_target_level = current_rbdl_level + 1
        if target_level != allowed_target_level:
            return EligibilityEvaluationResult(
                recommendation_code=code,
                is_eligible=False,
                rejection_reason=f"Violates one-level-above rule: Business is Level {current_rbdl_level}, but recommendation targets Level {target_level} (allowed target: Level {allowed_target_level}).",
                level_ceiling_passed=False,
                prerequisites_passed=False,
                na_exclusion_passed=True,
            )

        # Enforce C4 Category and Dimension Scope by Level
        category = recommendation.get("category", "")
        allowed_categories_by_level: Dict[int, Set[str]] = {
            0: {"infra_setup", "literacy_training"},
            1: {"record_keeping", "payments", "inventory_ops", "online_presence", "customer_comms"},
            2: {"data_analytics", "growth_expansion", "record_keeping", "payments"},
        }
        allowed_dimensions_by_level: Dict[int, Set[str]] = {
            0: {"infra", "literacy"},
            1: {"records", "payments", "inventory", "presence", "comms"},
            2: {"data_usage", "growth", "records", "payments"},
        }

        allowed_cats = allowed_categories_by_level.get(current_rbdl_level, set())
        allowed_dims = allowed_dimensions_by_level.get(current_rbdl_level, set())

        if category not in allowed_cats or dim_code not in allowed_dims:
            return EligibilityEvaluationResult(
                recommendation_code=code,
                is_eligible=False,
                rejection_reason=f"Category '{category}' / Dimension '{dim_code}' is outside C4 scope for Level {current_rbdl_level}.",
                level_ceiling_passed=True,
                prerequisites_passed=False,
                na_exclusion_passed=True,
            )

        # 3. N/A and Category Exemption Exclusion
        is_inventory_exempt = cls._is_inventory_exempt(business_profile)
        if dim_code == "inventory" and is_inventory_exempt:
            return EligibilityEvaluationResult(
                recommendation_code=code,
                is_eligible=False,
                rejection_reason="Excluded: Inventory dimension is legitimately exempt for this business category (Services/Consulting).",
                level_ceiling_passed=True,
                prerequisites_passed=True,
                na_exclusion_passed=False,
            )

        if dim_code in na_dims:
            return EligibilityEvaluationResult(
                recommendation_code=code,
                is_eligible=False,
                rejection_reason=f"Excluded: Dimension '{dim_code}' was marked N/A in the assessment.",
                level_ceiling_passed=True,
                prerequisites_passed=True,
                na_exclusion_passed=False,
            )

        # 4. Prerequisite Condition Check (via safe RuleConditionParser)
        if prereq_json:
            eval_context = {
                "dimension_scores": dimension_scores,
                "achieved_level": current_rbdl_level,
                "context": {
                    "is_inventory_exempt": is_inventory_exempt,
                    "business_size": business_profile.get("business_size"),
                    "category_id": business_profile.get("category_id"),
                },
            }
            prereq_passed = bool(RuleConditionParser.evaluate(prereq_json, eval_context))
            if not prereq_passed:
                return EligibilityEvaluationResult(
                    recommendation_code=code,
                    is_eligible=False,
                    rejection_reason=f"Prerequisites not met: {prereq_json}",
                    level_ceiling_passed=True,
                    prerequisites_passed=False,
                    na_exclusion_passed=True,
                )

        # 5. Already-Satisfied Gating Check
        # If dimension score already comfortably meets the target level threshold, exclude redundant recommendations
        is_satisfied = cls._check_dimension_already_satisfied(
            dim_code=dim_code,
            target_level=target_level,
            dimension_scores=dimension_scores,
        )
        if is_satisfied:
            return EligibilityEvaluationResult(
                recommendation_code=code,
                is_eligible=False,
                rejection_reason=f"Dimension '{dim_code}' score ({dimension_scores.get(dim_code, 0.0)}) already satisfies Level {target_level} gate.",
                level_ceiling_passed=True,
                prerequisites_passed=True,
                na_exclusion_passed=True,
                already_satisfied=True,
            )

        return EligibilityEvaluationResult(
            recommendation_code=code,
            is_eligible=True,
            level_ceiling_passed=True,
            prerequisites_passed=True,
            na_exclusion_passed=True,
        )

    @classmethod
    def _is_inventory_exempt(cls, business_profile: Dict[str, Any]) -> bool:
        """Check if business category exempts inventory requirement."""
        if business_profile.get("is_inventory_exempt") is True:
            return True
        cat_id = business_profile.get("category_id")
        if cat_id in (3, 4) and cat_id == 3:  # Services & Consulting
            return True
        cat_name = str(business_profile.get("category_name", "")).lower()
        sector = str(business_profile.get("sector", "")).lower()
        service_keywords = ["service", "consult", "salon", "repair", "professional", "legal", "agency"]
        return any(k in cat_name or k in sector for k in service_keywords)

    @classmethod
    def _check_dimension_already_satisfied(
        cls,
        dim_code: str,
        target_level: int,
        dimension_scores: Dict[str, float],
    ) -> bool:
        """Determine if a dimension score already meets the required target gate threshold."""
        score = dimension_scores.get(dim_code, 0.0)
        # Thresholds per C3:
        # Level 1: infra >= 4.0, literacy >= 3.0
        # Level 2: presence >= 4.0, comms >= 3.0, records/payments >= 4.0, inventory >= 3.0
        # Level 3: payments >= 6.0, records >= 6.0, data_usage >= 5.0, growth >= 4.0
        thresholds = {
            1: {"infra": 4.0, "literacy": 3.0},
            2: {"presence": 4.0, "comms": 3.0, "records": 4.0, "payments": 4.0, "inventory": 3.0},
            3: {"payments": 6.0, "records": 6.0, "data_usage": 5.0, "growth": 4.0},
        }
        level_thresh = thresholds.get(target_level, {})
        req = level_thresh.get(dim_code)
        if req is not None and score >= req:
            return True
        return False
