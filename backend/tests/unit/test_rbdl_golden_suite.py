"""Permanent Golden Test Suite for Requirement-Based Digitalization Levels (RBDL) — Safeguard C-06.

Tests the authoritative, deterministic C3/C4 RBDL rule engine against all canonical
worked examples, gate boundaries (gate - epsilon, gate, gate + epsilon), N/A handling,
certainty classification, and highest-satisfied-level monotonicity.

Methodology is FROZEN. Tests assert exact documented behavior without altering production rules.
"""

import pytest
from app.domain.rbdl.classifier import RBDLClassifierEngine
from app.domain.rbdl.certainty import CertaintyTier, CertaintyEvaluator
from app.domain.rbdl.contradictions import ContradictionDetector, ContradictionRecord
from app.domain.rbdl.scoring import ScoringEngine, AssessmentScoringSummary


EPSILON = 0.05


def make_scoring_summary(dim_scores: dict, is_complete: bool = True, total_na: int = 0) -> AssessmentScoringSummary:
    """Helper to construct AssessmentScoringSummary with default zeros for missing dimensions."""
    full_scores = {
        "infra": 0.0,
        "literacy": 0.0,
        "presence": 0.0,
        "comms": 0.0,
        "records": 0.0,
        "payments": 0.0,
        "inventory": 0.0,
        "data_usage": 0.0,
        "growth": 0.0,
    }
    full_scores.update(dim_scores)
    return AssessmentScoringSummary(
        dimension_scores=full_scores,
        detailed_scores={},
        composite_score=5.0,
        total_answered=14 - total_na,
        total_na=total_na,
        total_missing=0 if is_complete else 1,
        is_complete=is_complete,
    )


# =====================================================================
# A. Worked Example A: Service MSME
# =====================================================================
def test_worked_example_a():
    """Worked Example A:
    infra: 6.0, literacy: 5.0, presence: 3.0, comms: 6.0, records: 2.0,
    payments: 7.0, inventory: 0.0 (exempt), data_usage: 1.0, growth: 2.0.
    Outcome: Level 1 achieved. Level 2 blocked by online presence (3.0 < 4.0).
    """
    scores = {
        "infra": 6.0, "literacy": 5.0, "presence": 3.0, "comms": 6.0,
        "records": 2.0, "payments": 7.0, "inventory": 0.0,
        "data_usage": 1.0, "growth": 2.0,
    }
    summary = make_scoring_summary(scores, total_na=1)
    res = RBDLClassifierEngine.classify(
        summary, {}, {}, {"category_id": 3, "category_name": "Services & Consulting", "is_inventory_exempt": True}
    )
    assert res.rbdl_level == 1
    assert any(r.dimension_code == "presence" for r in res.blocking_requirements)
    assert len(res.category_exemptions) > 0


# =====================================================================
# B. Worked Example B: Retail MSME
# =====================================================================
def test_worked_example_b():
    """Worked Example B:
    infra: 8.0, literacy: 7.0, presence: 6.0, comms: 5.0, records: 7.0,
    payments: 8.0, inventory: 4.0, data_usage: 3.0, growth: 3.0.
    Outcome: Level 2 achieved. Level 3 blocked by data_usage (3.0 < 5.0) and growth (3.0 < 4.0).
    """
    scores = {
        "infra": 8.0, "literacy": 7.0, "presence": 6.0, "comms": 5.0,
        "records": 7.0, "payments": 8.0, "inventory": 4.0,
        "data_usage": 3.0, "growth": 3.0,
    }
    summary = make_scoring_summary(scores)
    res = RBDLClassifierEngine.classify(
        summary, {}, {}, {"category_id": 1, "category_name": "Retail & Trade"}
    )
    assert res.rbdl_level == 2
    blocker_dims = {r.dimension_code for r in res.blocking_requirements}
    assert "data_usage" in blocker_dims
    assert "growth" in blocker_dims


# =====================================================================
# C. Worked Example C: Integrated & Data-Driven MSME
# =====================================================================
def test_worked_example_c():
    """Worked Example C:
    infra: 8.0, literacy: 8.0, presence: 8.0, comms: 7.0, records: 7.0,
    payments: 8.0, inventory: 6.0, data_usage: 6.0, growth: 5.0.
    Outcome: Level 3 achieved. Zero blocking requirements.
    """
    scores = {
        "infra": 8.0, "literacy": 8.0, "presence": 8.0, "comms": 7.0,
        "records": 7.0, "payments": 8.0, "inventory": 6.0,
        "data_usage": 6.0, "growth": 5.0,
    }
    summary = make_scoring_summary(scores)
    res = RBDLClassifierEngine.classify(
        summary, {}, {}, {"category_id": 1, "category_name": "Retail & Trade"}
    )
    assert res.rbdl_level == 3
    assert len(res.blocking_requirements) == 0


# =====================================================================
# D. Level 1 Threshold Equality (Exact Gating)
# =====================================================================
def test_level_1_exact_threshold_equality():
    """Exact threshold equality for Level 1: infra == 4.0, literacy == 3.0."""
    scores = {"infra": 4.0, "literacy": 3.0}
    summary = make_scoring_summary(scores)
    res = RBDLClassifierEngine.classify(summary, {}, {}, {"category_id": 1})
    assert res.rbdl_level == 1


# =====================================================================
# E. Level 2 Threshold Equality (Exact Gating)
# =====================================================================
def test_level_2_exact_threshold_equality():
    """Exact threshold equality for Level 2:
    infra=4.0, literacy=3.0, presence=4.0, comms=3.0, records=4.0, payments=0.0, inventory=3.0.
    """
    scores = {
        "infra": 4.0, "literacy": 3.0, "presence": 4.0, "comms": 3.0,
        "records": 4.0, "payments": 0.0, "inventory": 3.0,
    }
    summary = make_scoring_summary(scores)
    res = RBDLClassifierEngine.classify(summary, {}, {}, {"category_id": 1})
    assert res.rbdl_level == 2


# =====================================================================
# F. Level 3 Threshold Equality (Exact Gating)
# =====================================================================
def test_level_3_exact_threshold_equality():
    """Exact threshold equality for Level 3:
    Level 2 met + payments=6.0, records=6.0, data_usage=5.0, growth=4.0.
    """
    scores = {
        "infra": 4.0, "literacy": 3.0, "presence": 4.0, "comms": 3.0,
        "records": 6.0, "payments": 6.0, "inventory": 3.0,
        "data_usage": 5.0, "growth": 4.0,
    }
    summary = make_scoring_summary(scores)
    res = RBDLClassifierEngine.classify(summary, {}, {}, {"category_id": 1})
    assert res.rbdl_level == 3


# =====================================================================
# G, H, I: Gating Boundary Triads (gate - epsilon, gate, gate + epsilon)
# =====================================================================
@pytest.mark.parametrize(
    "dim,gate,base_level,target_level,base_scores",
    [
        # Level 1 Infra Gate (4.0)
        ("infra", 4.0, 0, 1, {"literacy": 5.0}),
        # Level 1 Literacy Gate (3.0)
        ("literacy", 3.0, 0, 1, {"infra": 5.0}),
        # Level 2 Presence Gate (4.0)
        ("presence", 4.0, 1, 2, {"infra": 5.0, "literacy": 5.0, "comms": 4.0, "records": 5.0, "inventory": 4.0}),
        # Level 2 Comms Gate (3.0)
        ("comms", 3.0, 1, 2, {"infra": 5.0, "literacy": 5.0, "presence": 5.0, "records": 5.0, "inventory": 4.0}),
        # Level 2 Inventory Gate (3.0)
        ("inventory", 3.0, 1, 2, {"infra": 5.0, "literacy": 5.0, "presence": 5.0, "comms": 4.0, "records": 5.0}),
        # Level 3 Payments Gate (6.0)
        ("payments", 6.0, 2, 3, {"infra": 6.0, "literacy": 6.0, "presence": 6.0, "comms": 6.0, "records": 7.0, "inventory": 5.0, "data_usage": 6.0, "growth": 5.0}),
        # Level 3 Records Gate (6.0)
        ("records", 6.0, 2, 3, {"infra": 6.0, "literacy": 6.0, "presence": 6.0, "comms": 6.0, "payments": 7.0, "inventory": 5.0, "data_usage": 6.0, "growth": 5.0}),
        # Level 3 Data Usage Gate (5.0)
        ("data_usage", 5.0, 2, 3, {"infra": 6.0, "literacy": 6.0, "presence": 6.0, "comms": 6.0, "payments": 7.0, "records": 7.0, "inventory": 5.0, "growth": 5.0}),
        # Level 3 Growth Gate (4.0)
        ("growth", 4.0, 2, 3, {"infra": 6.0, "literacy": 6.0, "presence": 6.0, "comms": 6.0, "payments": 7.0, "records": 7.0, "inventory": 5.0, "data_usage": 6.0}),
    ],
)
def test_gate_boundary_triad(dim, gate, base_level, target_level, base_scores):
    """Test boundary precision: gate - epsilon, gate, and gate + epsilon."""
    # 1. Just below threshold (gate - epsilon)
    scores_below = {**base_scores, dim: round(gate - EPSILON, 2)}
    res_below = RBDLClassifierEngine.classify(make_scoring_summary(scores_below), {}, {}, {"category_id": 1})
    assert res_below.rbdl_level == base_level, f"{dim} at {gate - EPSILON} should be {base_level}"

    # 2. Exactly at threshold (gate)
    scores_at = {**base_scores, dim: gate}
    res_at = RBDLClassifierEngine.classify(make_scoring_summary(scores_at), {}, {}, {"category_id": 1})
    assert res_at.rbdl_level == target_level, f"{dim} at {gate} should be {target_level}"

    # 3. Just above threshold (gate + epsilon)
    scores_above = {**base_scores, dim: round(gate + EPSILON, 2)}
    res_above = RBDLClassifierEngine.classify(make_scoring_summary(scores_above), {}, {}, {"category_id": 1})
    assert res_above.rbdl_level == target_level, f"{dim} at {gate + EPSILON} should be {target_level}"


# =====================================================================
# J. Missing Required Answers
# =====================================================================
def test_missing_required_answers():
    """Unanswered questions set is_complete=False and force Certainty Tier to LOW."""
    summary = make_scoring_summary({"infra": 5.0, "literacy": 5.0}, is_complete=False)
    res = RBDLClassifierEngine.classify(summary, {}, {}, {"category_id": 1})
    assert res.is_complete is False
    assert res.certainty.certainty_tier == CertaintyTier.LOW


# =====================================================================
# K. Contradiction Flag
# =====================================================================
def test_contradiction_handling():
    """Contradictions reduce Certainty to LOW and are logged in output."""
    opt_map = {
        1: {"option_code": "OPT_INFRA_02_NO"},
        2: {"option_code": "OPT_PRES_01_WEBSITE"},
    }
    answers = {
        "Q-INFRA-02": {"selected_option_id": 1},
        "Q-PRES-01": {"text_answer": '["OPT_PRES_01_WEBSITE"]'},
    }
    summary = make_scoring_summary({"infra": 5.0, "literacy": 5.0, "presence": 5.0, "comms": 4.0, "records": 5.0, "inventory": 4.0})
    res = RBDLClassifierEngine.classify(summary, answers, opt_map, {"category_id": 1})
    assert len(res.contradictions) == 1
    assert res.certainty.certainty_tier == CertaintyTier.LOW


# =====================================================================
# L. N/A Handling & Sensitivity
# =====================================================================
def test_na_handling_sensitivity_calculation():
    """Verify N/A exclusion in standard scoring vs hypothetical unmet inclusion in sensitivity."""
    q_infra1 = {"id": 1, "dimension_code": "infra", "question_type": "single_choice", "options": [{"id": 10, "option_code": "O1", "score_value": 3.0}]}
    q_infra2 = {"id": 2, "dimension_code": "infra", "question_type": "single_choice", "options": [{"id": 20, "option_code": "O2", "score_value": 3.0}]}

    # Q1 answered (3.0/3.0), Q2 marked N/A -> Standard infra score = 10.0
    ans = {
        1: {"selected_option_id": 10, "text_answer": None},
        2: {"text_answer": "N/A"},
    }
    prod_summary = ScoringEngine.calculate_scores([q_infra1, q_infra2], ans)
    assert prod_summary.dimension_scores["infra"] == 10.0

    # Hypothetical calculation (C-05) -> Q2 treated as unmet (0/3.0) -> infra score = 5.0
    hyp_summary = ScoringEngine.calculate_hypothetical_scores_with_na_as_unmet([q_infra1, q_infra2], ans)
    assert hyp_summary.dimension_scores["infra"] == 5.0


# =====================================================================
# M. Category-Specific Inventory Exemption
# =====================================================================
def test_inventory_category_exemption():
    """Services business category exempts inventory gate at Level 2."""
    scores = {"infra": 5.0, "literacy": 5.0, "presence": 5.0, "comms": 4.0, "records": 5.0, "inventory": 0.0}
    summary = make_scoring_summary(scores)

    # Retail fails Level 2
    res_retail = RBDLClassifierEngine.classify(summary, {}, {}, {"category_id": 1, "category_name": "Retail & Trade"})
    assert res_retail.rbdl_level == 1

    # Services passes Level 2
    res_services = RBDLClassifierEngine.classify(summary, {}, {}, {"category_id": 3, "category_name": "Services & Consulting"})
    assert res_services.rbdl_level == 2


# =====================================================================
# N. Certainty Classification Tiers
# =====================================================================
def test_certainty_classification_tiers():
    """Verify HIGH, MEDIUM, and LOW certainty tiers."""
    # HIGH: far from boundaries, complete, no contradictions
    scores_high = {"infra": 8.0, "literacy": 8.0}
    res_high = CertaintyEvaluator.evaluate_certainty(scores_high, is_complete=True, contradictions=[], target_level=1)
    assert res_high.certainty_tier == CertaintyTier.HIGH

    # MEDIUM: near boundary (infra is 4.2, within 1.0 of threshold 4.0)
    scores_med = {"infra": 4.2, "literacy": 8.0}
    res_med = CertaintyEvaluator.evaluate_certainty(scores_med, is_complete=True, contradictions=[], target_level=1)
    assert res_med.certainty_tier == CertaintyTier.MEDIUM

    # LOW: incomplete
    res_low = CertaintyEvaluator.evaluate_certainty(scores_high, is_complete=False, contradictions=[], target_level=1)
    assert res_low.certainty_tier == CertaintyTier.LOW


# =====================================================================
# O. Highest-Satisfied-Level Behavior (Strict Monotonicity)
# =====================================================================
def test_highest_satisfied_level_monotonicity():
    """A business cannot achieve Level 2 or Level 3 without satisfying foundational Level 1."""
    # Meets all Level 3 criteria, BUT Level 1 digital literacy is 1.0 (< 3.0)
    scores = {
        "infra": 8.0,
        "literacy": 1.0,  # Fails Level 1!
        "presence": 8.0,
        "comms": 8.0,
        "records": 8.0,
        "payments": 8.0,
        "inventory": 8.0,
        "data_usage": 8.0,
        "growth": 8.0,
    }
    summary = make_scoring_summary(scores)
    res = RBDLClassifierEngine.classify(summary, {}, {}, {"category_id": 1})
    assert res.rbdl_level == 0
    assert any(r.dimension_code == "literacy" for r in res.blocking_requirements)
