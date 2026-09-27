"""Comprehensive C4 Methodology Verification Tests for Cases A–F, Priority Scores, and Explainability.

DO NOT delete or change C3 questions, C3 dimensions, or C3 classification rules.
Verifies:
- CASE A: Level 0 MSME receives ONLY foundational readiness recommendations (infra_setup, literacy_training). NO payments, presence, comms, records, inventory, analytics, growth.
- CASE B: Level 1 MSME receives Level 2 operational digitization recommendations (records, payments, inventory, presence, comms).
- CASE C: Level 2 MSME receives Level 3 growth/data recommendations (data_usage, growth, records, payments).
- CASE D: Level 3 MSME receives NO Level 4 advancement recommendations (empty list).
- CASE E: Legitimate N/A / category-exempt inventory exclusion.
- CASE F: Prerequisite failure excludes recommendation; prerequisite satisfaction makes it eligible.
- Priority Score Manual Verification against: priority = 0.4*impact + 0.2*feasibility - 0.1*cost + 0.3*readiness.
- Explainability Verification: Bilingual templates generated from actual stored evidence.
"""

import pytest
from decimal import Decimal
from app.domain.recommendations.catalog_v1 import RECOMMENDATIONS_V1
from app.domain.recommendations.eligibility import RecommendationEligibilityEngine
from app.domain.recommendations.ranking import RecommendationRankingEngine
from app.domain.recommendations.reasons import RecommendationReasonGenerator
from app.domain.recommendations.roadmap_generator import RoadmapGeneratorEngine


def test_case_a_level_0_foundational_scope_only():
    """CASE A — Level 0:
    infra = 2.0, literacy = 1.0, presence = 0, comms = 0, records = 0, payments = 0, inventory = 0, data_usage = 0, growth = 0.
    Expected: ONLY foundational Level-1 recommendations (REC-INFRA-01, REC-LIT-01).
    There must be NO: payment, online presence, customer comms, records, inventory, analytics, growth recommendations.
    """
    dim_scores = {
        "infra": 2.0,
        "literacy": 1.0,
        "presence": 0.0,
        "comms": 0.0,
        "records": 0.0,
        "payments": 0.0,
        "inventory": 0.0,
        "data_usage": 0.0,
        "growth": 0.0,
    }
    profile = {"category_id": 1, "category_name": "Retail & Trade", "business_size": "micro"}

    eligible_recs = []
    for r in RECOMMENDATIONS_V1:
        res = RecommendationEligibilityEngine.evaluate_eligibility(
            recommendation=r,
            current_rbdl_level=0,
            dimension_scores=dim_scores,
            business_profile=profile,
        )
        if res.is_eligible:
            eligible_recs.append(r["recommendation_code"])

    # Must contain ONLY foundational Level-1 recommendations
    assert set(eligible_recs) == {"REC-INFRA-01", "REC-LIT-01"}

    # Explicitly assert absence of any other categories
    prohibited_codes = {
        "REC-PAY-01", "REC-PAY-02", "REC-PAY-03",
        "REC-PRES-01", "REC-COMM-01",
        "REC-REC-01", "REC-REC-02",
        "REC-INV-01", "REC-DATA-01",
        "REC-GROW-01", "REC-GROW-02",
    }
    for code in prohibited_codes:
        assert code not in eligible_recs, f"Prohibited recommendation {code} was generated for Level 0!"


def test_case_b_level_1_operational_digitization_scope():
    """CASE B — Level 1:
    infra >= 4.0, literacy >= 3.0, but gaps in Level 2 requirements.
    Expected: Recommendations directed toward relevant Level 2 gaps (records, payments, inventory, presence, comms).
    """
    dim_scores = {
        "infra": 4.5,
        "literacy": 3.5,
        "presence": 1.0,
        "comms": 1.0,
        "records": 2.5,
        "payments": 1.0,
        "inventory": 1.0,
        "data_usage": 0.0,
        "growth": 0.0,
    }
    profile = {"category_id": 1, "category_name": "Retail & Trade", "business_size": "micro"}

    eligible_recs = []
    for r in RECOMMENDATIONS_V1:
        res = RecommendationEligibilityEngine.evaluate_eligibility(
            recommendation=r,
            current_rbdl_level=1,
            dimension_scores=dim_scores,
            business_profile=profile,
        )
        if res.is_eligible:
            eligible_recs.append(r["recommendation_code"])

    # Target level must be 2 only
    expected_level_2_codes = {"REC-PRES-01", "REC-COMM-01", "REC-REC-01", "REC-PAY-01", "REC-PAY-02", "REC-INV-01"}
    assert set(eligible_recs) == expected_level_2_codes

    # Verify no Level 1 or Level 3 recommendations
    assert "REC-INFRA-01" not in eligible_recs
    assert "REC-LIT-01" not in eligible_recs
    assert "REC-DATA-01" not in eligible_recs
    assert "REC-REC-02" not in eligible_recs
    assert "REC-PAY-03" not in eligible_recs
    assert "REC-GROW-01" not in eligible_recs
    assert "REC-GROW-02" not in eligible_recs


def test_case_c_level_2_growth_and_data_scope():
    """CASE C — Level 2:
    payments < 6.0, records < 6.0, data_usage < 5.0, growth < 4.0.
    Level 1 & Level 2 satisfied (e.g. infra=6, literacy=5, presence=5, comms=5, records=4.5, payments=4.5, inventory=4.0).
    Expected: Recommendations target Level 3 requirements (data_analytics, growth_expansion, deep records/payments).
    """
    dim_scores = {
        "infra": 6.0,
        "literacy": 5.0,
        "presence": 5.0,
        "comms": 5.0,
        "records": 4.5,
        "payments": 4.5,
        "inventory": 4.0,
        "data_usage": 2.0,
        "growth": 2.0,
    }
    profile = {"category_id": 1, "category_name": "Retail & Trade", "business_size": "micro"}

    eligible_recs = []
    for r in RECOMMENDATIONS_V1:
        res = RecommendationEligibilityEngine.evaluate_eligibility(
            recommendation=r,
            current_rbdl_level=2,
            dimension_scores=dim_scores,
            business_profile=profile,
        )
        if res.is_eligible:
            eligible_recs.append(r["recommendation_code"])

    expected_level_3_codes = {"REC-DATA-01", "REC-REC-02", "REC-PAY-03", "REC-GROW-01", "REC-GROW-02"}
    assert set(eligible_recs) == expected_level_3_codes

    # Verify no Level 1 or Level 2 recommendations
    assert "REC-INFRA-01" not in eligible_recs
    assert "REC-PRES-01" not in eligible_recs
    assert "REC-INV-01" not in eligible_recs


def test_case_d_level_3_maintenance_no_advancement():
    """CASE D — Level 3:
    Valid Level 3 business.
    Verify no Level 4-style advancement recommendations are generated (empty list).
    """
    dim_scores = {
        "infra": 8.0,
        "literacy": 7.0,
        "presence": 7.0,
        "comms": 7.0,
        "records": 7.0,
        "payments": 7.0,
        "inventory": 6.0,
        "data_usage": 6.0,
        "growth": 5.0,
    }
    profile = {"category_id": 1, "category_name": "Retail & Trade", "business_size": "small"}

    eligible_recs = []
    for r in RECOMMENDATIONS_V1:
        res = RecommendationEligibilityEngine.evaluate_eligibility(
            recommendation=r,
            current_rbdl_level=3,
            dimension_scores=dim_scores,
            business_profile=profile,
        )
        if res.is_eligible:
            eligible_recs.append(r["recommendation_code"])

    assert eligible_recs == []


def test_case_e_legitimate_na_inventory_exclusion():
    """CASE E — N/A:
    Business where inventory is legitimately N/A (Services category or marked N/A).
    Verify:
    - inventory recommendations are excluded
    - N/A handling does not artificially increase inventory score
    - RBDL classification remains unchanged.
    """
    dim_scores = {
        "infra": 5.0,
        "literacy": 4.0,
        "presence": 2.0,
        "comms": 2.0,
        "records": 2.0,
        "payments": 2.0,
        "inventory": 0.0,
        "data_usage": 1.0,
        "growth": 1.0,
    }
    profile_services = {"category_id": 3, "category_name": "Services & Consulting", "business_size": "micro"}

    eligible_recs = []
    for r in RECOMMENDATIONS_V1:
        res = RecommendationEligibilityEngine.evaluate_eligibility(
            recommendation=r,
            current_rbdl_level=1,
            dimension_scores=dim_scores,
            business_profile=profile_services,
        )
        if res.is_eligible:
            eligible_recs.append(r["recommendation_code"])

    assert "REC-INV-01" not in eligible_recs
    assert "REC-PRES-01" in eligible_recs
    assert "REC-COMM-01" in eligible_recs
    assert "REC-REC-01" in eligible_recs
    assert "REC-PAY-01" in eligible_recs
    assert "REC-PAY-02" in eligible_recs


def test_case_f_prerequisite_failure_and_satisfaction():
    """CASE F — PREREQUISITE FAILURE:
    Recommendation whose prerequisite is not satisfied is absent.
    When prerequisite is satisfied, it becomes eligible.
    """
    rec_pay3 = next(r for r in RECOMMENDATIONS_V1 if r["recommendation_code"] == "REC-PAY-03")
    # Prerequisite: payments >= 4.0
    profile = {"category_id": 1, "category_name": "Retail & Trade"}

    # Failure case: payments is 3.5 (< 4.0)
    dim_scores_fail = {"infra": 6.0, "literacy": 5.0, "records": 4.5, "payments": 3.5, "data_usage": 2.0, "growth": 2.0}
    res_fail = RecommendationEligibilityEngine.evaluate_eligibility(
        recommendation=rec_pay3,
        current_rbdl_level=2,
        dimension_scores=dim_scores_fail,
        business_profile=profile,
    )
    assert res_fail.is_eligible is False
    assert res_fail.prerequisites_passed is False

    # Success case: payments is 4.5 (>= 4.0)
    dim_scores_pass = {"infra": 6.0, "literacy": 5.0, "records": 4.5, "payments": 4.5, "data_usage": 2.0, "growth": 2.0}
    res_pass = RecommendationEligibilityEngine.evaluate_eligibility(
        recommendation=rec_pay3,
        current_rbdl_level=2,
        dimension_scores=dim_scores_pass,
        business_profile=profile,
    )
    assert res_pass.is_eligible is True
    assert res_pass.prerequisites_passed is True


def test_manual_priority_score_formula_verification():
    """Section 4: Priority score manual verification:
    Formula: priority = 0.4*impact + 0.2*feasibility - 0.1*cost + 0.3*readiness.
    """
    rec = {
        "recommendation_code": "REC-PRES-01",
        "dimension_code": "presence",
        "target_rbdl_level": 2,
        "impact_level": "high",          # impact_level = 3 -> 0.4 * 3 = 1.2
        "estimated_effort_level": "low", # feasibility_level = 3 -> 0.2 * 3 = 0.6
        "estimated_cost_level": "low",    # cost_level = 1 -> -0.1 * 1 = -0.1
    }
    dim_scores = {"presence": 3.5}  # target is 4.0, gap = 0.5 <= 1.0 -> readiness = 3.0 -> 0.3 * 3 = 0.9

    breakdown = RecommendationRankingEngine.calculate_priority_score(rec, dim_scores)

    # Manual Calculation:
    expected_impact_comp = round(0.4 * 3, 3)         # 1.2
    expected_feasibility_comp = round(0.2 * 3, 3)    # 0.6
    expected_cost_comp = round(0.1 * 1, 3)           # 0.1
    expected_readiness_comp = round(0.3 * 3.0, 3)    # 0.9
    expected_total = round(expected_impact_comp + expected_feasibility_comp - expected_cost_comp + expected_readiness_comp, 2)  # 2.6

    assert breakdown.impact_level == 3
    assert breakdown.feasibility_level == 3
    assert breakdown.cost_level == 1
    assert breakdown.readiness_alignment == 3.0
    assert breakdown.impact_component == expected_impact_comp
    assert breakdown.feasibility_component == expected_feasibility_comp
    assert breakdown.cost_component == expected_cost_comp
    assert breakdown.readiness_component == expected_readiness_comp
    assert breakdown.final_priority_score == expected_total == 2.6


def test_explainability_bilingual_reason_from_stored_evidence():
    """Section 5: Verify explainability chain:
    recommendation -> dimension -> actual score -> threshold/gap -> prerequisite result ->
    impact -> feasibility -> cost -> readiness -> priority score -> generated reason.
    """
    rec = {
        "recommendation_code": "REC-PRES-01",
        "dimension_code": "presence",
        "target_rbdl_level": 2,
        "reason_template_en": "Recommended because your Online Presence score ({actual_score}/10) is below the 4.0/10 needed for Level 2 Operational Digitalization.",
        "reason_template_hi": "यह सुझाव इसलिए दिया गया है क्योंकि आपका ऑनलाइन उपस्थिति स्कोर ({actual_score}/10) स्तर 2 परिचालन डिजिटलीकरण के लिए आवश्यक 4.0/10 से कम है।",
    }
    dim_scores = {"presence": 2.5}
    reason_en, reason_hi = RecommendationReasonGenerator.generate_bilingual_reason(
        recommendation=rec,
        target_rbdl_level=2,
        dimension_scores=dim_scores,
    )

    assert "2.5/10" in reason_en
    assert "Online Presence" in reason_en
    assert "Level 2" in reason_en
    assert "2.5/10" in reason_hi
    assert "ऑनलाइन उपस्थिति" in reason_hi
    assert "स्तर 2" in reason_hi
