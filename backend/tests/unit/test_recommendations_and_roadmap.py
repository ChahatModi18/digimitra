"""Unit tests for DigiMitra Phase A4: Recommendation Rules, Eligibility, Priority Ranking, Bilingual Reasons, and Phased Roadmap Generator."""

import pytest
from app.domain.recommendations.catalog_v1 import RECOMMENDATIONS_V1
from app.domain.recommendations.eligibility import RecommendationEligibilityEngine
from app.domain.recommendations.ranking import RecommendationRankingEngine
from app.domain.recommendations.reasons import RecommendationReasonGenerator
from app.domain.recommendations.roadmap_generator import RoadmapGeneratorEngine


def test_catalog_v1_integrity():
    """Verify recommendation catalog has 13 bilingual items across 9 C3 dimensions and 3 target levels."""
    assert len(RECOMMENDATIONS_V1) == 13
    for rec in RECOMMENDATIONS_V1:
        assert "recommendation_code" in rec
        assert rec["target_rbdl_level"] in (1, 2, 3)
        assert len(rec["title_en"]) > 0
        assert len(rec["title_hi"]) > 0
        assert len(rec["description_en"]) > 0
        assert len(rec["description_hi"]) > 0
        assert rec["estimated_cost_level"] in ("low", "medium", "high")
        assert rec["estimated_effort_level"] in ("low", "medium", "high")
        assert rec["impact_level"] in ("low", "medium", "high")


def test_one_level_above_ceiling_rule():
    """Requirement 1, 2, 3:
    - Level 0 receives only Level 1 recommendations (cannot receive Level 2 or 3).
    - Level 1 receives only Level 2 recommendations (cannot receive Level 3).
    """
    rec_l1 = next(r for r in RECOMMENDATIONS_V1 if r["target_rbdl_level"] == 1)
    rec_l2 = next(r for r in RECOMMENDATIONS_V1 if r["target_rbdl_level"] == 2)
    rec_l3 = next(r for r in RECOMMENDATIONS_V1 if r["target_rbdl_level"] == 3)

    dim_scores_low = {"infra": 2.0, "literacy": 2.0, "presence": 1.0, "comms": 1.0, "records": 1.0, "payments": 1.0, "inventory": 1.0, "data_usage": 1.0, "growth": 1.0}
    profile = {"category_id": 1, "category_name": "Retail & Trade"}

    # Level 0 MSME:
    res_l0_for_l1 = RecommendationEligibilityEngine.evaluate_eligibility(rec_l1, current_rbdl_level=0, dimension_scores=dim_scores_low, business_profile=profile)
    assert res_l0_for_l1.is_eligible is True
    assert res_l0_for_l1.level_ceiling_passed is True

    res_l0_for_l2 = RecommendationEligibilityEngine.evaluate_eligibility(rec_l2, current_rbdl_level=0, dimension_scores=dim_scores_low, business_profile=profile)
    assert res_l0_for_l2.is_eligible is False
    assert "one-level-above" in res_l0_for_l2.rejection_reason.lower()

    res_l0_for_l3 = RecommendationEligibilityEngine.evaluate_eligibility(rec_l3, current_rbdl_level=0, dimension_scores=dim_scores_low, business_profile=profile)
    assert res_l0_for_l3.is_eligible is False

    # Level 1 MSME:
    dim_scores_l1 = {"infra": 5.0, "literacy": 4.0, "presence": 2.0, "comms": 2.0, "records": 2.0, "payments": 2.0, "inventory": 2.0, "data_usage": 1.0, "growth": 1.0}
    res_l1_for_l2 = RecommendationEligibilityEngine.evaluate_eligibility(rec_l2, current_rbdl_level=1, dimension_scores=dim_scores_l1, business_profile=profile)
    assert res_l1_for_l2.is_eligible is True

    res_l1_for_l3 = RecommendationEligibilityEngine.evaluate_eligibility(rec_l3, current_rbdl_level=1, dimension_scores=dim_scores_l1, business_profile=profile)
    assert res_l1_for_l3.is_eligible is False
    assert "one-level-above" in res_l1_for_l3.rejection_reason.lower()


def test_prerequisite_evaluation():
    """Requirement 4, 5: Prerequisite failure excludes recommendation; prerequisite success makes it eligible."""
    rec_pay2 = next(r for r in RECOMMENDATIONS_V1 if r["recommendation_code"] == "REC-PAY-02")
    # Prerequisite: infra >= 3.0
    profile = {"category_id": 1, "category_name": "Retail & Trade"}

    # Failure case: infra is 2.0 (< 3.0)
    dim_scores_fail = {"infra": 2.0, "literacy": 3.0, "presence": 2.0, "payments": 2.0}
    res_fail = RecommendationEligibilityEngine.evaluate_eligibility(rec_pay2, current_rbdl_level=1, dimension_scores=dim_scores_fail, business_profile=profile)
    assert res_fail.is_eligible is False
    assert res_fail.prerequisites_passed is False
    assert "Prerequisites not met" in res_fail.rejection_reason

    # Success case: infra is 4.0 (>= 3.0)
    dim_scores_pass = {"infra": 4.0, "literacy": 3.0, "presence": 2.0, "payments": 2.0}
    res_pass = RecommendationEligibilityEngine.evaluate_eligibility(rec_pay2, current_rbdl_level=1, dimension_scores=dim_scores_pass, business_profile=profile)
    assert res_pass.is_eligible is True
    assert res_pass.prerequisites_passed is True


def test_na_and_category_exemption_exclusions():
    """Requirement 6: N/A dimension and category exemption exclude mapped recommendations."""
    rec_inv = next(r for r in RECOMMENDATIONS_V1 if r["recommendation_code"] == "REC-INV-01")
    dim_scores = {"infra": 5.0, "literacy": 4.0, "records": 3.0, "inventory": 0.0}

    # Case A: Services & Consulting (Category 3) -> Inventory recommendation excluded via category exemption
    profile_services = {"category_id": 3, "category_name": "Services & Consulting"}
    res_services = RecommendationEligibilityEngine.evaluate_eligibility(rec_inv, current_rbdl_level=1, dimension_scores=dim_scores, business_profile=profile_services)
    assert res_services.is_eligible is False
    assert "exempt for this business category" in res_services.rejection_reason.lower()

    # Case B: Dimension explicitly marked N/A
    profile_retail = {"category_id": 1, "category_name": "Retail & Trade"}
    res_na = RecommendationEligibilityEngine.evaluate_eligibility(rec_inv, current_rbdl_level=1, dimension_scores=dim_scores, business_profile=profile_retail, na_dimensions={"inventory"})
    assert res_na.is_eligible is False
    assert "marked n/a" in res_na.rejection_reason.lower()


def test_already_satisfied_dimension_exclusion():
    """Requirement 7: Already-satisfied dimensions do not receive redundant gap recommendations."""
    rec_infra = next(r for r in RECOMMENDATIONS_V1 if r["recommendation_code"] == "REC-INFRA-01")
    # In Level 1 target, infra requirement is 4.0. If business already has infra = 8.0, exclude REC-INFRA-01
    dim_scores_satisfied = {"infra": 8.0, "literacy": 1.0}
    profile = {"category_id": 1}

    res = RecommendationEligibilityEngine.evaluate_eligibility(rec_infra, current_rbdl_level=0, dimension_scores=dim_scores_satisfied, business_profile=profile)
    assert res.is_eligible is False
    assert res.already_satisfied is True
    assert "already satisfies" in res.rejection_reason.lower()


def test_previously_completed_task_exclusion():
    """Requirement 14: Completed recommendation is not re-suggested."""
    rec_infra = next(r for r in RECOMMENDATIONS_V1 if r["recommendation_code"] == "REC-INFRA-01")
    dim_scores = {"infra": 2.0, "literacy": 2.0}
    profile = {"category_id": 1}

    res = RecommendationEligibilityEngine.evaluate_eligibility(
        rec_infra,
        current_rbdl_level=0,
        dimension_scores=dim_scores,
        business_profile=profile,
        completed_recommendation_codes={"REC-INFRA-01"},
    )
    assert res.is_eligible is False
    assert res.previously_completed is True
    assert "already completed" in res.rejection_reason.lower()


def test_deterministic_priority_scoring_and_explainability():
    """Requirement 8, 9: Priority score is deterministic and components are explainable."""
    rec = {
        "recommendation_code": "REC-PRES-01",
        "dimension_code": "presence",
        "target_rbdl_level": 2,
        "impact_level": "high",       # level 3 -> impact_comp = 0.4 * 3 = 1.2
        "estimated_effort_level": "low", # feasibility 3 -> feasibility_comp = 0.2 * 3 = 0.6
        "estimated_cost_level": "low",  # cost 1 -> cost_comp = 0.1 * 1 = 0.1
    }
    # Presence score is 3.5 (target is 4.0, gap = 0.5 <= 1.0 -> readiness = 3.0 -> readiness_comp = 0.3 * 3 = 0.9)
    # Total priority = 1.2 + 0.6 - 0.1 + 0.9 = 2.6
    dim_scores = {"presence": 3.5}
    breakdown = RecommendationRankingEngine.calculate_priority_score(rec, dim_scores)

    assert breakdown.impact_level == 3
    assert breakdown.feasibility_level == 3
    assert breakdown.cost_level == 1
    assert breakdown.readiness_alignment == 3.0
    assert breakdown.impact_component == 1.2
    assert breakdown.feasibility_component == 0.6
    assert breakdown.cost_component == 0.1
    assert breakdown.readiness_component == 0.9
    assert breakdown.final_priority_score == 2.6


def test_bilingual_reason_template_rendering():
    """Requirement 10: Bilingual reason templates produce correct English and Hindi output."""
    rec = {
        "recommendation_code": "REC-PRES-01",
        "dimension_code": "presence",
        "reason_template_en": "Recommended because your Online Presence score ({actual_score}/10) is below the 4.0/10 needed for Level 2.",
        "reason_template_hi": "यह सुझाव इसलिए दिया गया है क्योंकि आपका ऑनलाइन उपस्थिति स्कोर ({actual_score}/10) स्तर 2 के लिए आवश्यक 4.0/10 से कम है।",
    }
    dim_scores = {"presence": 2.5}
    en, hi = RecommendationReasonGenerator.generate_bilingual_reason(rec, target_rbdl_level=2, dimension_scores=dim_scores)

    assert "2.5/10" in en
    assert "Online Presence" in en
    assert "2.5/10" in hi
    assert "ऑनलाइन उपस्थिति" in hi


def test_phased_roadmap_generation_and_caps():
    """Requirement 11, 12, 13:
    - Phase 1: Quick Wins (feasibility=3, cost<=2, readiness>=2.0) capped at 4.
    - Phase 2: Core Next Steps (impact=3 not in Phase 1).
    - Phase 3: Longer Term (remaining).
    - Total active roadmap capped at <= 12 tasks.
    """
    eligible_recs = []
    dim_scores = {"infra": 2.0, "literacy": 2.0, "payments": 2.0, "presence": 2.0, "comms": 2.0, "records": 2.0, "inventory": 2.0, "data_usage": 2.0, "growth": 2.0}

    # Collect Level 2 candidate recommendations
    for r in RECOMMENDATIONS_V1:
        if r["target_rbdl_level"] == 2:
            r_copy = dict(r)
            r_copy["reason_en"], r_copy["reason_hi"] = RecommendationReasonGenerator.generate_bilingual_reason(r_copy, 2, dim_scores)
            eligible_recs.append(r_copy)

    ranked = RecommendationRankingEngine.rank_recommendations(eligible_recs, dim_scores)
    assert len(ranked) > 0

    roadmap = RoadmapGeneratorEngine.generate_roadmap(ranked, target_rbdl_level=2)

    # Verify phase assignment
    assert len(roadmap.phase_1_tasks) <= RoadmapGeneratorEngine.PHASE_1_CAP
    assert roadmap.total_tasks <= RoadmapGeneratorEngine.TOTAL_ROADMAP_CAP
    assert len(roadmap.all_tasks) == len(roadmap.phase_1_tasks) + len(roadmap.phase_2_tasks) + len(roadmap.phase_3_tasks)

    # Quick wins check
    for t in roadmap.phase_1_tasks:
        assert t.estimated_effort_level == "low"  # feasibility = 3
        assert t.estimated_cost_level in ("low", "medium")

    # Global sequence order monotonicity
    seqs = [t.sequence_order for t in roadmap.all_tasks]
    assert seqs == list(range(1, len(roadmap.all_tasks) + 1))
