"""Synthetic Assessment Generator.

Generates realistic answers to the frozen C3 14-question instrument
conditioned on the synthetic business operational profile.
Uses the deterministic ScoringEngine and RBDLClassifier to produce official RBDL outcomes.
"""

from typing import Dict, List, Any, Optional
import numpy as np
from app.domain.rbdl.question_bank_v1 import QUESTIONS_V1
from app.domain.rbdl.scoring import ScoringEngine, AssessmentScoringSummary
from app.domain.rbdl.classifier import RBDLClassifierEngine, RBDLClassificationResultDTO


class SyntheticAssessmentGenerator:
    """Generates realistic question responses and executes deterministic scoring & classification."""

    def __init__(self, seed: int = 42):
        self.rng = np.random.RandomState(seed)

    def generate_assessment_for_business(
        self,
        business: Dict[str, Any],
        language: str = "en",
    ) -> Dict[str, Any]:
        """
        Generate answers for all 14 questions and run the deterministic rule engine.
        
        Parameters:
        -----------
        business : Synthetic business profile dict from SyntheticBusinessGenerator
        language : Assessment language ('en' or 'hi')
        """
        cap = business["base_capability"]
        sector = business["sector_code"]
        is_service = sector in ["SERVICES", "PROFESSIONAL", "EDUCATION"]

        questions_with_ids = []
        option_counter = 1
        for q_idx, q in enumerate(QUESTIONS_V1, start=1):
            q_copy = dict(q)
            q_copy["id"] = q_idx
            opts_copy = []
            for opt in q.get("options", []):
                opt_c = dict(opt)
                opt_c["id"] = option_counter
                option_counter += 1
                opts_copy.append(opt_c)
            q_copy["options"] = opts_copy
            questions_with_ids.append(q_copy)

        answers_map: Dict[int, Any] = {}
        raw_answers_list: List[Dict[str, Any]] = []

        for q in questions_with_ids:
            q_idx = q["id"]
            q_code = q["question_code"]
            options = q["options"]

            # Sort options by score ascending (0.0 to max)
            sorted_opts = sorted(options, key=lambda o: float(o.get("score_value", 0.0)))
            max_score = float(sorted_opts[-1].get("score_value", 3.0))

            selected_opt = None
            is_na = False

            # Check inventory exemption for pure service enterprises
            if q_code == "Q-INV-01" and is_service:
                # Find NA option if available, otherwise lowest / exempt
                na_opt = next((o for o in options if "NA" in o.get("option_code", "") or "not applicable" in o.get("label_en", "").lower()), None)
                if na_opt:
                    selected_opt = na_opt
                    is_na = True
                else:
                    selected_opt = sorted_opts[0]
            else:
                # Add domain-specific noise to capability for this specific dimension
                q_cap = float(np.clip(cap + self.rng.normal(0.0, 0.12), 0.0, 1.0))

                # Hard constraints based on physical access
                if q_code in ["Q-INFRA-01", "Q-INFRA-02"]:
                    if not business["smartphone_access"] and not business["computer_access"]:
                        q_cap = min(q_cap, 0.1)
                    elif not business["internet_access"]:
                        q_cap = min(q_cap, 0.3)

                if q_code.startswith("Q-PRES") and not business["internet_access"]:
                    q_cap = 0.0

                if q_code.startswith("Q-PAY") and "cash_only" in business["payment_methods"]:
                    q_cap = 0.0

                if q_code.startswith("Q-DATA") and business["data_usage"] == "none":
                    q_cap = min(q_cap, 0.2)

                # Select option matching proportional capability on 0-10 scale
                target_score_10 = q_cap * 10.0
                diffs = [
                    abs(((float(o.get("score_value", 0.0)) / max_score) * 10.0) - target_score_10)
                    for o in sorted_opts
                ]
                best_idx = int(np.argmin(diffs))
                selected_opt = sorted_opts[best_idx]

            # Construct answer dict compatible with ScoringEngine & AssessmentAnswer
            score_val = float(selected_opt.get("score_value", 0.0)) if not is_na else 0.0
            ans_record = {
                "question_id": q_idx,
                "question_code": q_code,
                "dimension_code": q["dimension_code"],
                "selected_option_id": selected_opt["id"],
                "selected_option_code": selected_opt.get("option_code"),
                "raw_score": score_val,
                "score_value": score_val,
                "numeric_answer": score_val,
                "text_answer": f'["{selected_opt.get("option_code")}"]',
                "is_na": is_na,
                "option_text_en": selected_opt.get("label_en"),
                "option_text_hi": selected_opt.get("label_hi"),
            }
            answers_map[q_idx] = ans_record
            raw_answers_list.append(ans_record)

        # 2. Run deterministic scoring engine
        scoring_summary: AssessmentScoringSummary = ScoringEngine.calculate_scores(
            questions=questions_with_ids,
            answers_by_question_id=answers_map,
        )

        # 3. Run deterministic classification engine
        answers_by_code = {a["question_code"]: a for a in raw_answers_list}
        biz_profile = {
            "category_id": 3 if is_service else 1,
            "category_name": business.get("category_display_en", "Retail"),
            "sector": sector,
        }
        classification_result: RBDLClassificationResultDTO = RBDLClassifierEngine.classify(
            scoring_summary=scoring_summary,
            answers_by_question_code=answers_by_code,
            options_by_id={},
            business_profile=biz_profile,
        )

        return {
            "answers": raw_answers_list,
            "scoring_summary": scoring_summary.model_dump(),
            "dimension_scores": scoring_summary.dimension_scores,
            "composite_score": round(scoring_summary.composite_score, 2),
            "rbdl_level": classification_result.rbdl_level,
            "level_name_en": classification_result.level_name_en,
            "level_name_hi": classification_result.level_name_hi,
            "certainty_tier": classification_result.certainty.certainty_tier.value if hasattr(classification_result.certainty.certainty_tier, "value") else str(classification_result.certainty.certainty_tier),
            "contradiction_count": len(classification_result.contradictions),
        }
