"""Unit tests for DigiMitra Phase A3: Dimensions, Scoring Engine, Contradictions, Certainty Tier, and Requirement-Based Classifier."""

import pytest
from app.domain.rbdl.dimensions import RBDL_DIMENSIONS, DIMENSION_WEIGHTS, get_all_dimensions
from app.domain.rbdl.question_bank_v1 import QUESTIONS_V1, QUESTION_BANK_VERSION
from app.domain.rbdl.rules_v1 import RULES_V1, RULESET_VERSION
from app.domain.rbdl.scoring import ScoringEngine, AssessmentScoringSummary
from app.domain.rbdl.contradictions import ContradictionDetector
from app.domain.rbdl.certainty import CertaintyEvaluator, CertaintyTier
from app.domain.rbdl.classifier import RBDLClassifierEngine


def test_nine_canonical_dimensions_and_weights():
    """Verify all 9 canonical dimensions exist with weights summing exactly to 1.00."""
    dims = get_all_dimensions()
    assert len(dims) == 9
    expected_codes = {"infra", "literacy", "presence", "comms", "records", "payments", "inventory", "data_usage", "growth"}
    assert set(RBDL_DIMENSIONS.keys()) == expected_codes

    total_weight = sum(DIMENSION_WEIGHTS.values())
    assert round(total_weight, 4) == 1.00


def test_question_bank_v1_structure():
    """Verify question bank version 1 has 14 questions across all 9 dimensions with bilingual text."""
    assert len(QUESTIONS_V1) == 14
    for q in QUESTIONS_V1:
        assert "question_code" in q
        assert q["dimension_code"] in RBDL_DIMENSIONS
        assert len(q["question_text_en"]) > 0
        assert len(q["question_text_hi"]) > 0
        assert len(q["options"]) > 0
        for opt in q["options"]:
            assert "option_code" in opt
            assert len(opt["label_en"]) > 0
            assert len(opt["label_hi"]) > 0
            assert opt["score_value"] >= 0.0


def test_multi_choice_scoring_and_none_exclusivity():
    """Verify multi-choice questions sum positive options and enforce mutual exclusivity on 'None of these'."""
    q_pres = next(q for q in QUESTIONS_V1 if q["question_code"] == "Q-PRES-01")
    # Positive options: GMB (2) + Social (2) = 4, max possible is 8 (2+2+1+3)
    answer_gmb_social = {"text_answer": '["OPT_PRES_01_GMB", "OPT_PRES_01_SOCIAL"]'}
    score, max_pos = ScoringEngine._calculate_question_score("multi_choice", q_pres["options"], answer_gmb_social)
    assert score == 4.0
    assert max_pos == 8.0

    # Mutual exclusivity with 'None of these': should score 0.0 even if other options were selected
    answer_with_none = {"text_answer": '["OPT_PRES_01_GMB", "OPT_PRES_01_NONE"]'}
    score_none, _ = ScoringEngine._calculate_question_score("multi_choice", q_pres["options"], answer_with_none)
    assert score_none == 0.0


def test_scoring_with_na_exclusion():
    """Verify N/A questions are excluded from both numerator and denominator."""
    # Test scoring with dummy questions
    q1 = {
        "id": 1,
        "dimension_code": "infra",
        "question_type": "single_choice",
        "options": [{"id": 10, "option_code": "O1", "score_value": 3.0}, {"id": 11, "option_code": "O2", "score_value": 0.0}],
    }
    q2 = {
        "id": 2,
        "dimension_code": "infra",
        "question_type": "single_choice",
        "options": [{"id": 20, "option_code": "O3", "score_value": 3.0}, {"id": 21, "option_code": "O4", "score_value": 0.0}],
    }

    # Case 1: Q1 answered with score 3.0, Q2 marked N/A -> infra should be 10.0 (3.0 / 3.0 * 10)
    answers_case1 = {
        1: {"selected_option_id": 10, "text_answer": None},
        2: {"text_answer": "N/A"},
    }
    summary1 = ScoringEngine.calculate_scores([q1, q2], answers_case1)
    assert summary1.dimension_scores["infra"] == 10.0
    assert summary1.detailed_scores["infra"].na_count == 1
    assert summary1.detailed_scores["infra"].answered_count == 1

    # Case 2: Q1 answered with score 3.0, Q2 unanswered -> infra should be 5.0 (3.0 / 6.0 * 10)
    answers_case2 = {
        1: {"selected_option_id": 10, "text_answer": None},
    }
    summary2 = ScoringEngine.calculate_scores([q1, q2], answers_case2)
    assert summary2.dimension_scores["infra"] == 5.0
    assert summary2.detailed_scores["infra"].missing_count == 1
    assert summary2.is_complete is False


def test_contradiction_detection():
    """Verify deterministic detection of Contradiction A and Contradiction B."""
    opt_map = {
        1: {"option_code": "OPT_INFRA_02_NO"},
        2: {"option_code": "OPT_PRES_01_WEBSITE"},
        3: {"option_code": "OPT_PAY_01_CASH"},
        4: {"option_code": "OPT_PAY_02_YES"},
    }

    # Contradiction A: No internet + Website
    ans_a = {
        "Q-INFRA-02": {"selected_option_id": 1},
        "Q-PRES-01": {"text_answer": '["OPT_PRES_01_WEBSITE"]'},
    }
    contras_a = ContradictionDetector.check_contradictions(ans_a, opt_map)
    assert len(contras_a) == 1
    assert contras_a[0].code == "CONTRADICTION_INFRA_PRESENCE"

    # Contradiction B: Cash only + Reconciles digital payments
    ans_b = {
        "Q-PAY-01": {"selected_option_id": 3},
        "Q-PAY-02": {"selected_option_id": 4},
    }
    contras_b = ContradictionDetector.check_contradictions(ans_b, opt_map)
    assert len(contras_b) == 1
    assert contras_b[0].code == "CONTRADICTION_CASH_RECONCILIATION"


def test_certainty_tier_evaluation():
    """Verify Certainty Tier logic: HIGH, MEDIUM, LOW."""
    # Complete, clear scores (no score near threshold)
    dim_scores_high = {
        "infra": 8.0,      # far from 4.0
        "literacy": 7.0,   # far from 3.0
        "presence": 8.0,   # far from 4.0
        "comms": 7.0,      # far from 3.0
        "records": 8.0,    # far from 4.0/6.0
        "payments": 8.0,   # far from 4.0/6.0
        "inventory": 8.0,  # far from 3.0
        "data_usage": 8.0, # far from 5.0
        "growth": 8.0,     # far from 4.0
    }
    res_high = CertaintyEvaluator.evaluate_certainty(dim_scores_high, is_complete=True, contradictions=[], target_level=3)
    assert res_high.certainty_tier == CertaintyTier.HIGH

    # Complete, but infra is 3.9 (within 1.0 of threshold 4.0) -> MEDIUM
    dim_scores_med = {**dim_scores_high, "infra": 3.9}
    res_med = CertaintyEvaluator.evaluate_certainty(dim_scores_med, is_complete=True, contradictions=[], target_level=1)
    assert res_med.certainty_tier == CertaintyTier.MEDIUM
    assert res_med.boundary_proximity_detected is True

    # Incomplete assessment -> LOW
    res_low_incomp = CertaintyEvaluator.evaluate_certainty(dim_scores_high, is_complete=False, contradictions=[], target_level=3)
    assert res_low_incomp.certainty_tier == CertaintyTier.LOW

    # Contradiction present -> LOW
    from app.domain.rbdl.contradictions import ContradictionRecord
    dummy_contra = [ContradictionRecord("C1", "Test Contra", "desc", "वर्णन", [], {})]
    res_low_contra = CertaintyEvaluator.evaluate_certainty(dim_scores_high, is_complete=True, contradictions=dummy_contra, target_level=3)
    assert res_low_contra.certainty_tier == CertaintyTier.LOW


def test_rbdl_classifier_level_0():
    """Test Level 0 classification when foundational requirements are not met."""
    scoring = AssessmentScoringSummary(
        dimension_scores={"infra": 2.0, "literacy": 2.0, "presence": 0.0, "comms": 0.0, "records": 0.0, "payments": 0.0, "inventory": 0.0, "data_usage": 0.0, "growth": 0.0},
        detailed_scores={},
        composite_score=1.5,
        total_answered=14,
        total_na=0,
        total_missing=0,
        is_complete=True,
    )
    res = RBDLClassifierEngine.classify(scoring, {}, {}, {"category_id": 1})
    assert res.rbdl_level == 0
    assert "Level 0" in res.level_name_en


def test_rbdl_classifier_level_1():
    """Test Level 1 classification: infra >= 4.0 and literacy >= 3.0, but Level 2 presence/comms low."""
    scoring = AssessmentScoringSummary(
        dimension_scores={"infra": 5.0, "literacy": 4.0, "presence": 2.0, "comms": 1.0, "records": 2.0, "payments": 2.0, "inventory": 1.0, "data_usage": 1.0, "growth": 1.0},
        detailed_scores={},
        composite_score=2.8,
        total_answered=14,
        total_na=0,
        total_missing=0,
        is_complete=True,
    )
    res = RBDLClassifierEngine.classify(scoring, {}, {}, {"category_id": 1})
    assert res.rbdl_level == 1
    assert any("presence" in r.dimension_code for r in res.blocking_requirements)


def test_rbdl_classifier_level_2_with_or_condition():
    """Test Level 2 classification: passes with records >= 4 even if payments < 4."""
    scoring = AssessmentScoringSummary(
        dimension_scores={"infra": 6.0, "literacy": 5.0, "presence": 5.0, "comms": 4.0, "records": 5.0, "payments": 2.0, "inventory": 4.0, "data_usage": 2.0, "growth": 2.0},
        detailed_scores={},
        composite_score=4.2,
        total_answered=14,
        total_na=0,
        total_missing=0,
        is_complete=True,
    )
    res = RBDLClassifierEngine.classify(scoring, {}, {}, {"category_id": 1})
    assert res.rbdl_level == 2


def test_rbdl_classifier_level_2_category_inventory_exemption():
    """Test Level 2 classification with inventory exemption for service category."""
    # Retail store with inventory = 0.0 -> fails Level 2 (blocked by inventory)
    scoring = AssessmentScoringSummary(
        dimension_scores={"infra": 6.0, "literacy": 5.0, "presence": 5.0, "comms": 4.0, "records": 5.0, "payments": 5.0, "inventory": 0.0, "data_usage": 2.0, "growth": 2.0},
        detailed_scores={},
        composite_score=4.0,
        total_answered=14,
        total_na=0,
        total_missing=0,
        is_complete=True,
    )
    res_retail = RBDLClassifierEngine.classify(scoring, {}, {}, {"category_id": 1, "category_name": "Retail & Trade"})
    assert res_retail.rbdl_level == 1  # Blocked by inventory

    # Service store with inventory = 0.0 -> category exemption applies -> achieves Level 2!
    res_service = RBDLClassifierEngine.classify(scoring, {}, {}, {"category_id": 3, "category_name": "Services & Consulting"})
    assert res_service.rbdl_level == 2
    assert len(res_service.category_exemptions) > 0


def test_rbdl_classifier_level_3_synthetic_business():
    """Test complete synthetic Level 3 business meeting all advanced criteria."""
    scoring = AssessmentScoringSummary(
        dimension_scores={"infra": 8.0, "literacy": 8.0, "presence": 8.0, "comms": 8.0, "records": 8.0, "payments": 8.0, "inventory": 8.0, "data_usage": 7.0, "growth": 7.0},
        detailed_scores={},
        composite_score=7.8,
        total_answered=14,
        total_na=0,
        total_missing=0,
        is_complete=True,
    )
    res = RBDLClassifierEngine.classify(scoring, {}, {}, {"category_id": 1})
    assert res.rbdl_level == 3
    assert len(res.blocking_requirements) == 0


def test_boundary_precision_cases():
    """Test deterministic boundary precision around 3.9 vs 4.0, 4.0 vs 4.1, 5.9 vs 6.0."""
    # 1. Level 1 boundary: infra 3.9 vs 4.0 (with literacy 4.0)
    scoring_3_9 = AssessmentScoringSummary(
        dimension_scores={"infra": 3.9, "literacy": 4.0, "presence": 0.0, "comms": 0.0, "records": 0.0, "payments": 0.0, "inventory": 0.0, "data_usage": 0.0, "growth": 0.0},
        detailed_scores={},
        composite_score=2.0,
        total_answered=14,
        total_na=0,
        total_missing=0,
        is_complete=True,
    )
    res_3_9 = RBDLClassifierEngine.classify(scoring_3_9, {}, {}, {"category_id": 1})
    assert res_3_9.rbdl_level == 0  # 3.9 < 4.0 -> fails Level 1

    scoring_4_0 = AssessmentScoringSummary(
        dimension_scores={"infra": 4.0, "literacy": 4.0, "presence": 0.0, "comms": 0.0, "records": 0.0, "payments": 0.0, "inventory": 0.0, "data_usage": 0.0, "growth": 0.0},
        detailed_scores={},
        composite_score=2.0,
        total_answered=14,
        total_na=0,
        total_missing=0,
        is_complete=True,
    )
    res_4_0 = RBDLClassifierEngine.classify(scoring_4_0, {}, {}, {"category_id": 1})
    assert res_4_0.rbdl_level == 1  # 4.0 >= 4.0 -> achieves Level 1

    # 2. Level 3 boundary: payments 5.9 vs 6.0
    scoring_5_9 = AssessmentScoringSummary(
        dimension_scores={"infra": 8.0, "literacy": 8.0, "presence": 8.0, "comms": 8.0, "records": 8.0, "payments": 5.9, "inventory": 8.0, "data_usage": 7.0, "growth": 7.0},
        detailed_scores={},
        composite_score=7.5,
        total_answered=14,
        total_na=0,
        total_missing=0,
        is_complete=True,
    )
    res_5_9 = RBDLClassifierEngine.classify(scoring_5_9, {}, {}, {"category_id": 1})
    assert res_5_9.rbdl_level == 2  # 5.9 < 6.0 -> fails Level 3, achieves Level 2

    scoring_6_0 = AssessmentScoringSummary(
        dimension_scores={"infra": 8.0, "literacy": 8.0, "presence": 8.0, "comms": 8.0, "records": 8.0, "payments": 6.0, "inventory": 8.0, "data_usage": 7.0, "growth": 7.0},
        detailed_scores={},
        composite_score=7.6,
        total_answered=14,
        total_na=0,
        total_missing=0,
        is_complete=True,
    )
    res_6_0 = RBDLClassifierEngine.classify(scoring_6_0, {}, {}, {"category_id": 1})
    assert res_6_0.rbdl_level == 3  # 6.0 >= 6.0 -> achieves Level 3


def test_incomplete_assessment_missing_gating_question_evidence():
    """Verify missing gating question is NOT treated as N/A, keeps is_complete=False, triggers Certainty LOW, and records missing requirement in evidence."""
    # Q-INFRA-01 is missing (unanswered), Q-INFRA-02 has score 3.0
    # infra score = 3.0 / 6.0 * 10 = 5.0, but missing_count = 1
    q1 = {"id": 1, "dimension_code": "infra", "question_type": "single_choice", "options": [{"id": 10, "option_code": "O1", "score_value": 3.0}]}
    q2 = {"id": 2, "dimension_code": "infra", "question_type": "single_choice", "options": [{"id": 20, "option_code": "O2", "score_value": 3.0}]}

    answers = {
        2: {"selected_option_id": 20, "text_answer": None},  # Q2 answered, Q1 missing
    }
    scoring = ScoringEngine.calculate_scores([q1, q2], answers)
    assert scoring.is_complete is False
    assert scoring.total_missing == 1
    assert scoring.total_na == 0

    res = RBDLClassifierEngine.classify(scoring, {}, {}, {"category_id": 1})
    assert res.is_complete is False
    assert res.certainty.certainty_tier == CertaintyTier.LOW
    assert any("incomplete" in r.lower() for r in res.certainty.reasons)


def test_na_vs_category_exemption_strict_distinction():
    """Verify N/A on inventory does NOT grant exemption to a retail business, but category exemption does."""
    # Case A: Retail business (inventory applicable), but marks Q-INV-01 as N/A
    # Inventory score is 0.0 because it was marked N/A (no answered positive score)
    scoring_na = AssessmentScoringSummary(
        dimension_scores={
            "infra": 6.0, "literacy": 5.0, "presence": 5.0, "comms": 4.0,
            "records": 5.0, "payments": 5.0, "inventory": 0.0,
            "data_usage": 3.0, "growth": 3.0,
        },
        detailed_scores={},
        composite_score=4.1,
        total_answered=13,
        total_na=1,
        total_missing=0,
        is_complete=True,
    )
    res_retail_na = RBDLClassifierEngine.classify(
        scoring_na, {}, {}, {"category_id": 1, "category_name": "Retail & Trade", "is_inventory_exempt": False}
    )
    # Retail business must NOT get automatic exemption from an N/A answer
    assert res_retail_na.rbdl_level == 1
    assert any("inventory" in r.dimension_code for r in res_retail_na.blocking_requirements)
    assert len(res_retail_na.category_exemptions) == 0

    # Case B: Services / Consulting business (category legitimately exempt from inventory)
    res_services_exempt = RBDLClassifierEngine.classify(
        scoring_na, {}, {}, {"category_id": 3, "category_name": "Services & Consulting"}
    )
    # Service business gets legitimate category exemption
    assert res_services_exempt.rbdl_level == 2
    assert len(res_services_exempt.category_exemptions) > 0
    assert any("Services/Consulting" in ex for ex in res_services_exempt.category_exemptions)
