"""Requirement-Based Digitalization Level (RBDL) Classification Engine (Claude C3).

Methodological Principles:
1. RBDL is REQUIREMENT-BASED, not single-composite-score based.
2. Progression is strictly gated from Level 0 to Level 3.
3. The business receives the highest level whose complete applicable requirements are satisfied.
4. Explanations must be deterministic and fully auditable via snapshotted evidence.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel

from app.domain.rbdl.certainty import CertaintyEvaluator, CertaintyEvaluationResult, CertaintyTier
from app.domain.rbdl.contradictions import ContradictionDetector, ContradictionRecord
from app.domain.rbdl.scoring import AssessmentScoringSummary
from app.domain.rbdl.rules_v1 import RULES_V1, RULESET_VERSION


class RequirementEvaluation(BaseModel):
    """Detailed evaluation result for an individual dimension requirement."""

    requirement_name: str
    dimension_code: str
    required_threshold: float
    actual_score: float
    is_satisfied: bool
    is_exempt: bool = False
    exemption_reason: Optional[str] = None
    gap: float = 0.0


class RuleEvaluationOutcome(BaseModel):
    """Execution trace of an evaluated RBDL gating rule."""

    rule_code: str
    rule_version: int
    rule_name: str
    target_rbdl_level: int
    is_satisfied: bool
    condition_json: Dict[str, Any]
    fired_order: int
    matched_snapshot: Dict[str, Any]
    requirements: List[RequirementEvaluation] = []
    blocking_reasons: List[str] = []


class RBDLClassificationResultDTO(BaseModel):
    """Complete output DTO produced by the RBDL classification engine."""

    rbdl_level: int
    level_name_en: str
    level_name_hi: str
    ruleset_version: int
    method: str = "rule_based"
    composite_score: float
    dimension_scores: Dict[str, float]
    certainty: CertaintyEvaluationResult
    contradictions: List[Dict[str, Any]]
    rules_evaluated: List[RuleEvaluationOutcome]
    satisfied_requirements: List[RequirementEvaluation]
    blocking_requirements: List[RequirementEvaluation]
    category_exemptions: List[str]
    is_complete: bool
    explanation_summary_en: str
    explanation_summary_hi: str


class RBDLClassifierEngine:
    """Deterministic, explainable rule-based classifier implementing Claude C3 methodology."""

    @classmethod
    def classify(
        cls,
        scoring_summary: AssessmentScoringSummary,
        answers_by_question_code: Dict[str, Any],
        options_by_id: Dict[int, Any],
        business_profile: Dict[str, Any],
    ) -> RBDLClassificationResultDTO:
        """Execute requirement-based RBDL classification against dimension scores and business context."""
        dim_scores = scoring_summary.dimension_scores

        # Check Category-Aware Exemption (e.g. Services / Consulting has structural inventory exemption)
        is_inventory_exempt = cls._check_inventory_exemption(business_profile)
        category_exemptions: List[str] = []
        if is_inventory_exempt:
            category_exemptions.append(
                "Inventory & Operations requirement exempted due to business category (Services/Consulting/Non-inventory trade)."
            )

        # 1. Evaluate Contradictions
        contradiction_records = ContradictionDetector.check_contradictions(
            answers_by_question_code=answers_by_question_code,
            options_by_id=options_by_id,
        )

        # 2. Sequential Requirement Evaluation: Level 1 -> Level 2 -> Level 3
        achieved_level = 0
        rules_evaluated: List[RuleEvaluationOutcome] = []
        satisfied_reqs: List[RequirementEvaluation] = []
        blocking_reqs: List[RequirementEvaluation] = []

        fired_order = 0

        # --- LEVEL 1 GATING ---
        fired_order += 1
        l1_req_infra = RequirementEvaluation(
            requirement_name="Digital Infrastructure",
            dimension_code="infra",
            required_threshold=4.0,
            actual_score=dim_scores.get("infra", 0.0),
            is_satisfied=(dim_scores.get("infra", 0.0) >= 4.0),
            gap=round(max(0.0, 4.0 - dim_scores.get("infra", 0.0)), 2),
        )
        l1_req_lit = RequirementEvaluation(
            requirement_name="Digital Literacy",
            dimension_code="literacy",
            required_threshold=3.0,
            actual_score=dim_scores.get("literacy", 0.0),
            is_satisfied=(dim_scores.get("literacy", 0.0) >= 3.0),
            gap=round(max(0.0, 3.0 - dim_scores.get("literacy", 0.0)), 2),
        )

        l1_rule_def = next((r for r in RULES_V1 if r["rule_code"] == "RULE_RBDL_LEVEL_1"), None)
        l1_satisfied = l1_req_infra.is_satisfied and l1_req_lit.is_satisfied
        l1_blockers: List[str] = []

        if not l1_req_infra.is_satisfied:
            l1_blockers.append(f"Digital Infrastructure score is {l1_req_infra.actual_score} (required >= 4.0)")
            blocking_reqs.append(l1_req_infra)
        else:
            satisfied_reqs.append(l1_req_infra)

        if not l1_req_lit.is_satisfied:
            l1_blockers.append(f"Digital Literacy score is {l1_req_lit.actual_score} (required >= 3.0)")
            blocking_reqs.append(l1_req_lit)
        else:
            satisfied_reqs.append(l1_req_lit)

        l1_outcome = RuleEvaluationOutcome(
            rule_code="RULE_RBDL_LEVEL_1",
            rule_version=1,
            rule_name=l1_rule_def["name"] if l1_rule_def else "Level 1 Gating Rule",
            target_rbdl_level=1,
            is_satisfied=l1_satisfied,
            condition_json=l1_rule_def["condition_json"] if l1_rule_def else {},
            fired_order=fired_order,
            matched_snapshot={
                "infra_score": l1_req_infra.actual_score,
                "literacy_score": l1_req_lit.actual_score,
                "is_satisfied": l1_satisfied,
            },
            requirements=[l1_req_infra, l1_req_lit],
            blocking_reasons=l1_blockers,
        )
        rules_evaluated.append(l1_outcome)

        if l1_satisfied:
            achieved_level = 1

        # --- LEVEL 2 GATING (only if Level 1 passed) ---
        l2_rule_def = next((r for r in RULES_V1 if r["rule_code"] == "RULE_RBDL_LEVEL_2"), None)
        l2_req_presence = RequirementEvaluation(
            requirement_name="Online Presence",
            dimension_code="presence",
            required_threshold=4.0,
            actual_score=dim_scores.get("presence", 0.0),
            is_satisfied=(dim_scores.get("presence", 0.0) >= 4.0),
            gap=round(max(0.0, 4.0 - dim_scores.get("presence", 0.0)), 2),
        )
        l2_req_comms = RequirementEvaluation(
            requirement_name="Customer Communication",
            dimension_code="comms",
            required_threshold=3.0,
            actual_score=dim_scores.get("comms", 0.0),
            is_satisfied=(dim_scores.get("comms", 0.0) >= 3.0),
            gap=round(max(0.0, 3.0 - dim_scores.get("comms", 0.0)), 2),
        )
        records_or_payments_passed = (
            dim_scores.get("records", 0.0) >= 4.0 or dim_scores.get("payments", 0.0) >= 4.0
        )
        l2_req_fin = RequirementEvaluation(
            requirement_name="Financial Tracking (Bookkeeping OR Digital Payments)",
            dimension_code="records/payments",
            required_threshold=4.0,
            actual_score=max(dim_scores.get("records", 0.0), dim_scores.get("payments", 0.0)),
            is_satisfied=records_or_payments_passed,
            gap=round(max(0.0, 4.0 - max(dim_scores.get("records", 0.0), dim_scores.get("payments", 0.0))), 2),
        )
        inv_satisfied = (dim_scores.get("inventory", 0.0) >= 3.0) or is_inventory_exempt
        l2_req_inv = RequirementEvaluation(
            requirement_name="Inventory & Operations",
            dimension_code="inventory",
            required_threshold=3.0,
            actual_score=dim_scores.get("inventory", 0.0),
            is_satisfied=inv_satisfied,
            is_exempt=is_inventory_exempt,
            exemption_reason="Exempted for services/consulting business category" if is_inventory_exempt else None,
            gap=0.0 if inv_satisfied else round(max(0.0, 3.0 - dim_scores.get("inventory", 0.0)), 2),
        )

        fired_order += 1
        l2_reqs = [l2_req_presence, l2_req_comms, l2_req_fin, l2_req_inv]
        l2_satisfied = achieved_level >= 1 and all(r.is_satisfied for r in l2_reqs)
        l2_blockers: List[str] = []

        if achieved_level < 1:
            l2_blockers.append("Level 1 foundational readiness requirements not met.")

        for r in l2_reqs:
            if not r.is_satisfied:
                l2_blockers.append(f"{r.requirement_name} score is {r.actual_score} (required >= {r.required_threshold})")
                if achieved_level == 1:
                    blocking_reqs.append(r)
            elif achieved_level >= 1:
                satisfied_reqs.append(r)

        l2_outcome = RuleEvaluationOutcome(
            rule_code="RULE_RBDL_LEVEL_2",
            rule_version=1,
            rule_name=l2_rule_def["name"] if l2_rule_def else "Level 2 Gating Rule",
            target_rbdl_level=2,
            is_satisfied=l2_satisfied,
            condition_json=l2_rule_def["condition_json"] if l2_rule_def else {},
            fired_order=fired_order,
            matched_snapshot={
                "presence_score": l2_req_presence.actual_score,
                "comms_score": l2_req_comms.actual_score,
                "records_score": dim_scores.get("records", 0.0),
                "payments_score": dim_scores.get("payments", 0.0),
                "inventory_score": l2_req_inv.actual_score,
                "is_inventory_exempt": is_inventory_exempt,
                "is_satisfied": l2_satisfied,
            },
            requirements=l2_reqs,
            blocking_reasons=l2_blockers,
        )
        rules_evaluated.append(l2_outcome)

        if l2_satisfied:
            achieved_level = 2

        # --- LEVEL 3 GATING (only if Level 2 passed) ---
        l3_rule_def = next((r for r in RULES_V1 if r["rule_code"] == "RULE_RBDL_LEVEL_3"), None)
        l3_req_pay = RequirementEvaluation(
            requirement_name="Advanced Payment Systems",
            dimension_code="payments",
            required_threshold=6.0,
            actual_score=dim_scores.get("payments", 0.0),
            is_satisfied=(dim_scores.get("payments", 0.0) >= 6.0),
            gap=round(max(0.0, 6.0 - dim_scores.get("payments", 0.0)), 2),
        )
        l3_req_rec = RequirementEvaluation(
            requirement_name="Digital Accounting Records",
            dimension_code="records",
            required_threshold=6.0,
            actual_score=dim_scores.get("records", 0.0),
            is_satisfied=(dim_scores.get("records", 0.0) >= 6.0),
            gap=round(max(0.0, 6.0 - dim_scores.get("records", 0.0)), 2),
        )
        l3_req_data = RequirementEvaluation(
            requirement_name="Data-Driven Decision Usage",
            dimension_code="data_usage",
            required_threshold=5.0,
            actual_score=dim_scores.get("data_usage", 0.0),
            is_satisfied=(dim_scores.get("data_usage", 0.0) >= 5.0),
            gap=round(max(0.0, 5.0 - dim_scores.get("data_usage", 0.0)), 2),
        )
        l3_req_growth = RequirementEvaluation(
            requirement_name="Digital Growth Expansion Readiness",
            dimension_code="growth",
            required_threshold=4.0,
            actual_score=dim_scores.get("growth", 0.0),
            is_satisfied=(dim_scores.get("growth", 0.0) >= 4.0),
            gap=round(max(0.0, 4.0 - dim_scores.get("growth", 0.0)), 2),
        )

        fired_order += 1
        l3_reqs = [l3_req_pay, l3_req_rec, l3_req_data, l3_req_growth]
        l3_satisfied = achieved_level >= 2 and all(r.is_satisfied for r in l3_reqs)
        l3_blockers: List[str] = []

        if achieved_level < 2:
            l3_blockers.append("Level 2 operational digitalization requirements not met.")

        for r in l3_reqs:
            if not r.is_satisfied:
                l3_blockers.append(f"{r.requirement_name} score is {r.actual_score} (required >= {r.required_threshold})")
                if achieved_level == 2:
                    blocking_reqs.append(r)
            elif achieved_level >= 2:
                satisfied_reqs.append(r)

        l3_outcome = RuleEvaluationOutcome(
            rule_code="RULE_RBDL_LEVEL_3",
            rule_version=1,
            rule_name=l3_rule_def["name"] if l3_rule_def else "Level 3 Gating Rule",
            target_rbdl_level=3,
            is_satisfied=l3_satisfied,
            condition_json=l3_rule_def["condition_json"] if l3_rule_def else {},
            fired_order=fired_order,
            matched_snapshot={
                "payments_score": l3_req_pay.actual_score,
                "records_score": l3_req_rec.actual_score,
                "data_usage_score": l3_req_data.actual_score,
                "growth_score": l3_req_growth.actual_score,
                "is_satisfied": l3_satisfied,
            },
            requirements=l3_reqs,
            blocking_reasons=l3_blockers,
        )
        rules_evaluated.append(l3_outcome)

        if l3_satisfied:
            achieved_level = 3

        # 3. Evaluate Qualitative Certainty Tier
        certainty_result = CertaintyEvaluator.evaluate_certainty(
            dimension_scores=dim_scores,
            is_complete=scoring_summary.is_complete,
            contradictions=contradiction_records,
            target_level=achieved_level,
        )

        # 4. Generate Bilingual Explanations
        explanation_en, explanation_hi = cls._generate_bilingual_explanation(
            achieved_level=achieved_level,
            blocking_reqs=blocking_reqs,
            certainty_result=certainty_result,
            is_inventory_exempt=is_inventory_exempt,
        )

        level_names = {
            0: ("Level 0: Foundational Readiness", "स्तर 0: बुनियादी तैयारी"),
            1: ("Level 1: Basic Digital Presence", "स्तर 1: बुनियादी डिजिटल उपस्थिति"),
            2: ("Level 2: Operational Digitalization", "स्तर 2: परिचालन डिजिटलीकरण"),
            3: ("Level 3: Growth-Oriented Digitalization", "स्तर 3: विकास-उन्मुख डिजिटलीकरण"),
        }
        lvl_en, lvl_hi = level_names.get(achieved_level, (f"Level {achieved_level}", f"स्तर {achieved_level}"))

        return RBDLClassificationResultDTO(
            rbdl_level=achieved_level,
            level_name_en=lvl_en,
            level_name_hi=lvl_hi,
            ruleset_version=RULESET_VERSION,
            method="rule_based",
            composite_score=scoring_summary.composite_score,
            dimension_scores=dim_scores,
            certainty=certainty_result,
            contradictions=[
                {
                    "code": c.code,
                    "name": c.name,
                    "description_en": c.description_en,
                    "description_hi": c.description_hi,
                    "involved_questions": c.involved_questions,
                    "detected_answers": c.detected_answers,
                }
                for c in contradiction_records
            ],
            rules_evaluated=rules_evaluated,
            satisfied_requirements=satisfied_reqs,
            blocking_requirements=blocking_reqs,
            category_exemptions=category_exemptions,
            is_complete=scoring_summary.is_complete,
            explanation_summary_en=explanation_en,
            explanation_summary_hi=explanation_hi,
        )

    @classmethod
    def _check_inventory_exemption(cls, business_profile: Dict[str, Any]) -> bool:
        """Determine if the business category legitimately exempts inventory requirement."""
        if business_profile.get("is_inventory_exempt") is True:
            return True

        category_name = str(business_profile.get("category_name", "")).lower()
        sector = str(business_profile.get("sector", "")).lower()
        cat_id = business_profile.get("category_id")

        # Category ID 3 in C2 seed is Services & Consulting
        if cat_id == 3:
            return True

        service_keywords = ["service", "consult", "salon", "repair", "professional", "legal", "agency", "freelance"]
        return any(k in category_name or k in sector for k in service_keywords)

    @classmethod
    def _generate_bilingual_explanation(
        cls,
        achieved_level: int,
        blocking_reqs: List[RequirementEvaluation],
        certainty_result: CertaintyEvaluationResult,
        is_inventory_exempt: bool,
    ) -> tuple[str, str]:
        """Produce human-readable explanation summaries in English and Hindi."""
        if achieved_level == 3:
            en = "Your enterprise satisfies all advanced digitalization requirements across payments, digital accounting, data usage, and digital expansion."
            hi = "आपका उद्यम भुगतान, डिजिटल अकाउंटिंग, डेटा उपयोग और डिजिटल विस्तार से संबंधित सभी उन्नत डिजिटलीकरण आवश्यकताओं को पूरा करता है।"
        elif achieved_level == 2:
            next_reqs_en = ", ".join([f"{r.requirement_name} (needs >= {r.required_threshold})" for r in blocking_reqs]) or "Level 3 metrics"
            en = f"Your business has achieved Operational Digitalization. To advance to Level 3, focus on: {next_reqs_en}."
            hi = f"आपके व्यवसाय ने परिचालन डिजिटलीकरण स्तर प्राप्त कर लिया है। स्तर 3 पर आगे बढ़ने के लिए डिजिटल अकाउंटिंग और डेटा उपयोग पर ध्यान दें।"
        elif achieved_level == 1:
            next_reqs_en = ", ".join([f"{r.requirement_name} (needs >= {r.required_threshold})" for r in blocking_reqs]) or "Level 2 operational tools"
            en = f"Your business has Basic Digital Presence. To reach Level 2 Operational Digitalization, improve: {next_reqs_en}."
            hi = f"आपके व्यवसाय की बुनियादी डिजिटल उपस्थिति है। स्तर 2 परिचालन डिजिटलीकरण तक पहुँचने के लिए ऑनलाइन उपस्थिति और बहीखाता में सुधार करें।"
        else:
            en = "Your business is currently at Foundational Readiness (Level 0). Priority is adopting daily internet access, basic smartphone tools, and digital payments."
            hi = "आपका व्यवसाय वर्तमान में बुनियादी तैयारी (स्तर 0) पर है। प्राथमिकता प्रतिदिन इंटरनेट उपयोग, बुनियादी स्मार्टफोन टूल और डिजिटल भुगतान अपनाना है।"

        return en, hi
