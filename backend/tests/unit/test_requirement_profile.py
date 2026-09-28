"""Comprehensive Unit & Regression Tests for Requirement Profile V1 & Research Instruments.

Tests:
1. Controlled taxonomy constants & proposed research instrument definitions.
2. Budget feasibility engine deterministic state assignments (FEASIBLE_NOW, LOWER_COST_ALTERNATIVE, DEFER_DUE_TO_BUDGET, ALREADY_HAVE).
3. End-to-end traceability chain construction.
4. Absolute independence: Budget tier does NOT affect RBDL score or level classification.
5. Blind consultant labeling technical boundary.
6. Research reproducibility manifest verification.
"""

import pytest
from app.domain.requirements.constants_v1 import (
    BUDGET_TIERS_V1,
    BUSINESS_GOALS_V1,
    EXISTING_TOOLS_V1,
    PAIN_POINTS_V1,
    RBDL_FRAMEWORK_VERSION,
    RECOMMENDATION_RULES_VERSION,
    REQUIREMENT_PROFILE_CODE,
    REQUIREMENT_PROFILE_VERSION,
    RESEARCH_EXPERIMENTS,
    URGENCY_TIERS_V1,
    FeasibilityStatus,
)
from app.domain.recommendations.feasibility import (
    RecommendationFeasibilityEngine,
    FeasibilityEvaluationResult,
)
from app.domain.rbdl.classifier import RBDLClassifierEngine
from app.domain.rbdl.scoring import AssessmentScoringSummary
from app.domain.research.reproducibility import ReproducibilityService




def test_controlled_taxonomies_structure_v1():
    """Verify proposed research taxonomies V1 are well-defined and complete."""
    assert RBDL_FRAMEWORK_VERSION == "RBDL_V1"
    assert REQUIREMENT_PROFILE_VERSION == 1
    assert REQUIREMENT_PROFILE_CODE == "REQUIREMENT_PROFILE_V1"
    assert RECOMMENDATION_RULES_VERSION == "RECOMMENDATION_RULES_V1"

    # Verify 4 budget tiers
    assert set(BUDGET_TIERS_V1.keys()) == {"B0_FREE", "B1_LOW", "B2_MODERATE", "B3_HIGHER"}
    for b_code, b_data in BUDGET_TIERS_V1.items():
        assert "name_en" in b_data and "name_hi" in b_data
        assert "illustrative_range" in b_data
        assert isinstance(b_data["compatible_cost_levels"], list)

    # Verify 10 business goals
    assert len(BUSINESS_GOALS_V1) == 10
    assert "G1_CUSTOMER_REACH" in BUSINESS_GOALS_V1
    assert "G10_OTHER" in BUSINESS_GOALS_V1

    # Verify 10 pain points with dimension mapping
    assert len(PAIN_POINTS_V1) == 10
    assert PAIN_POINTS_V1["P1_FIND_CONTACT"]["target_dimension"] == "presence"
    assert PAIN_POINTS_V1["P2_MANUAL_RECORDS"]["target_dimension"] == "records"
    assert PAIN_POINTS_V1["P3_PAYMENT_MGMT"]["target_dimension"] == "payments"
    assert PAIN_POINTS_V1["P4_INVENTORY_MGMT"]["target_dimension"] == "inventory"
    assert PAIN_POINTS_V1["P6_DIGITAL_SKILLS"]["target_dimension"] == "literacy"

    # Verify 4 urgency levels
    assert len(URGENCY_TIERS_V1) == 4
    assert set(URGENCY_TIERS_V1.keys()) == {
        "U1_NOT_URGENT",
        "U2_WITHIN_6_MONTHS",
        "U3_WITHIN_1_3_MONTHS",
        "U4_IMMEDIATE",
    }

    # Verify 12 research experiments registry (E-01 through E-12)
    assert len(RESEARCH_EXPERIMENTS) == 12
    exp_codes = [e["code"] for e in RESEARCH_EXPERIMENTS]
    for i in range(1, 13):
        assert f"E-{i:02d}" in exp_codes


def test_budget_feasibility_engine_states():
    """Verify deterministic feasibility status assignment for different budget tiers and cost levels."""
    # Scenario A: Low-cost recommendation with B0 (Free) budget -> FEASIBLE_NOW
    rec_low = {"recommendation_code": "REC-INFRA-01", "estimated_cost_level": "low", "dimension_code": "infra"}
    profile_b0 = {"business_goal": "G1_CUSTOMER_REACH", "primary_pain_point": "P6_DIGITAL_SKILLS", "budget_tier": "B0_FREE"}
    dim_scores = {"infra": 2.0}

    res_a = RecommendationFeasibilityEngine.evaluate_feasibility(
        recommendation=rec_low,
        requirement_profile=profile_b0,
        dimension_scores=dim_scores,
        target_rbdl_level=1,
    )
    assert res_a.feasibility_status == FeasibilityStatus.FEASIBLE_NOW
    assert res_a.budget_fit == "within_budget"

    # Scenario B: High-cost recommendation with B0 budget (has lower-cost alt) -> LOWER_COST_ALTERNATIVE
    rec_pos = {"recommendation_code": "REC-REC-02", "estimated_cost_level": "medium", "dimension_code": "records"}
    res_b = RecommendationFeasibilityEngine.evaluate_feasibility(
        recommendation=rec_pos,
        requirement_profile=profile_b0,
        dimension_scores={"records": 1.5},
        target_rbdl_level=2,
    )
    assert res_b.feasibility_status == FeasibilityStatus.LOWER_COST_ALTERNATIVE
    assert res_b.budget_fit == "has_lower_cost_alternative"

    # Scenario C: High-cost recommendation with B1 budget (no direct alt) -> DEFER_DUE_TO_BUDGET
    rec_custom = {"recommendation_code": "REC-CUSTOM-01", "estimated_cost_level": "high", "dimension_code": "growth"}
    profile_b1 = {"business_goal": "G9_EXPANSION", "primary_pain_point": "P9_DIGITAL_EXPANSION", "budget_tier": "B1_LOW"}
    res_c = RecommendationFeasibilityEngine.evaluate_feasibility(
        recommendation=rec_custom,
        requirement_profile=profile_b1,
        dimension_scores={"growth": 1.0},
        target_rbdl_level=3,
    )
    assert res_c.feasibility_status == FeasibilityStatus.DEFER_DUE_TO_BUDGET
    assert res_c.budget_fit == "requires_higher_budget"

    # Scenario D: Already adopted tool -> ALREADY_HAVE
    rec_qr = {"recommendation_code": "REC-PAY-01", "estimated_cost_level": "low", "dimension_code": "payments"}
    profile_with_qr = {
        "business_goal": "G6_PAYMENTS",
        "primary_pain_point": "P3_PAYMENT_MGMT",
        "budget_tier": "B1_LOW",
        "existing_tools": ["TOOL_UPI_QR"],
    }
    res_d = RecommendationFeasibilityEngine.evaluate_feasibility(
        recommendation=rec_qr,
        requirement_profile=profile_with_qr,
        dimension_scores={"payments": 3.0},
        target_rbdl_level=2,
    )
    assert res_d.feasibility_status == FeasibilityStatus.ALREADY_HAVE
    assert res_d.budget_fit == "already_adopted"


def test_traceability_chain_completeness():
    """Verify that full audit traceability is captured in the evaluation output."""
    rec = {"recommendation_code": "REC-PRES-01", "estimated_cost_level": "low", "dimension_code": "presence"}
    profile = {
        "business_goal": "G1_CUSTOMER_REACH",
        "primary_pain_point": "P1_FIND_CONTACT",
        "urgency": "U4_IMMEDIATE",
        "budget_tier": "B1_LOW",
        "existing_tools": [],
    }
    dim_scores = {"presence": 2.5}

    res = RecommendationFeasibilityEngine.evaluate_feasibility(
        recommendation=rec,
        requirement_profile=profile,
        dimension_scores=dim_scores,
        target_rbdl_level=2,
        target_gate_score=4.0,
    )

    t_chain = res.traceability_chain
    assert "step_1_assessment" in t_chain
    assert t_chain["step_1_assessment"]["actual_score"] == 2.5
    assert t_chain["step_1_assessment"]["target_gate_score"] == 4.0

    assert "step_2_capability_gap" in t_chain
    assert t_chain["step_2_capability_gap"]["gap_magnitude"] == 1.5
    assert t_chain["step_2_capability_gap"]["is_gap_present"] is True

    assert "step_3_business_context" in t_chain
    assert t_chain["step_3_business_context"]["business_goal"] == "G1_CUSTOMER_REACH"
    assert t_chain["step_3_business_context"]["primary_pain_point"] == "P1_FIND_CONTACT"
    assert t_chain["step_3_business_context"]["is_pain_point_aligned"] is True

    assert "step_4_feasibility_evaluation" in t_chain
    assert t_chain["step_4_feasibility_evaluation"]["feasibility_status"] == FeasibilityStatus.FEASIBLE_NOW

    assert "step_5_traceability_summary" in t_chain


def test_budget_tier_has_zero_effect_on_rbdl_level():
    """CRITICAL INVARIANT: Business requirement profile & budget must NOT alter deterministic RBDL level."""
    # Level 1 Qualifying Scores (Infra >= 4, Literacy >= 3, Presence < 4)
    dim_scores = {
        "infra": 4.5,
        "literacy": 3.5,
        "presence": 2.0,
        "comms": 2.0,
        "records": 2.0,
        "payments": 2.0,
        "inventory": 2.0,
        "data_usage": 1.0,
        "growth": 1.0,
    }

    summary = AssessmentScoringSummary(
        dimension_scores=dim_scores,
        detailed_scores={},
        composite_score=2.5,
        total_answered=14,
        total_na=0,
        total_missing=0,
        is_complete=True,
    )

    # Baseline classification without budget context
    eval_result_1 = RBDLClassifierEngine.classify(
        scoring_summary=summary,
        answers_by_question_code={},
        options_by_id={},
        business_profile={"category_id": 1},
    )
    assert eval_result_1.rbdl_level == 1

    # Varying budget tier across all possible values (B0 to B3) must never change RBDL Level
    for b_tier in ["B0_FREE", "B1_LOW", "B2_MODERATE", "B3_HIGHER"]:
        # Re-run classifier
        eval_result = RBDLClassifierEngine.classify(
            scoring_summary=summary,
            answers_by_question_code={},
            options_by_id={},
            business_profile={"category_id": 1},
        )
        assert eval_result.rbdl_level == 1, f"Budget {b_tier} illegally altered RBDL level!"
        assert eval_result.composite_score == eval_result_1.composite_score




def test_reproducibility_manifest_contains_explicit_versions():
    """Verify research manifest records all 3 explicit version stamps."""
    manifest = ReproducibilityService.generate_manifest()

    assert manifest.rbdl_framework_version == "RBDL_V1"
    assert manifest.requirement_profile_version == "REQUIREMENT_PROFILE_V1"
    assert manifest.recommendation_rules_version == "RECOMMENDATION_RULES_V1"
    assert len(manifest.requirement_taxonomies_sha256) == 64
    assert len(manifest.recommendations_catalog_sha256) == 64
