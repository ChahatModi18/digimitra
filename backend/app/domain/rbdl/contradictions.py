"""Deterministic Contradiction and Answer Consistency Checks (Claude C3).

NOTE: Contradiction checks never delete or mutate user answers. They flag inconsistencies
for explainability evidence and qualitative certainty tier adjustment.
"""

import json
from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass(frozen=True)
class ContradictionRecord:
    """Record of a detected logical inconsistency between responses."""

    code: str
    name: str
    description_en: str
    description_hi: str
    involved_questions: List[str]
    detected_answers: Dict[str, Any]
    severity: str = "warning"  # "warning" or "critical"


class ContradictionDetector:
    """Evaluates deterministic consistency checks across assessment answers."""

    @classmethod
    def check_contradictions(
        cls,
        answers_by_question_code: Dict[str, Any],  # question_code -> answer object or dict
        options_by_id: Dict[int, Any],  # option_id -> option object or dict
    ) -> List[ContradictionRecord]:
        """Run all active contradiction rules against the answer set."""
        detected: List[ContradictionRecord] = []

        # ------------------------------------------------------------
        # Contradiction A: No internet access BUT active social/web presence
        # Q-INFRA-02 (No internet) AND Q-PRES-01 (Google/Social/Website)
        # ------------------------------------------------------------
        ans_infra_02 = answers_by_question_code.get("Q-INFRA-02")
        ans_pres_01 = answers_by_question_code.get("Q-PRES-01")

        if ans_infra_02 and ans_pres_01:
            infra_opt_code = cls._get_selected_option_code(ans_infra_02, options_by_id)
            pres_opt_codes = cls._get_multi_option_codes(ans_pres_01, options_by_id)

            has_no_internet = (infra_opt_code == "OPT_INFRA_02_NO")
            has_web_presence = any(
                code in ("OPT_PRES_01_GMB", "OPT_PRES_01_SOCIAL", "OPT_PRES_01_WEBSITE")
                for code in pres_opt_codes
            )

            if has_no_internet and has_web_presence:
                detected.append(
                    ContradictionRecord(
                        code="CONTRADICTION_INFRA_PRESENCE",
                        name="No Internet with Active Web Presence",
                        description_en="Business reported 'No internet access' (Q-INFRA-02) but also reported having active social media or website profiles (Q-PRES-01).",
                        description_hi="व्यवसाय ने 'कोई इंटरनेट कनेक्शन नहीं' (Q-INFRA-02) दर्ज किया लेकिन साथ ही सक्रिय सोशल मीडिया या वेबसाइट प्रोफ़ाइल (Q-PRES-01) होने की भी सूचना दी।",
                        involved_questions=["Q-INFRA-02", "Q-PRES-01"],
                        detected_answers={
                            "Q-INFRA-02": infra_opt_code,
                            "Q-PRES-01": pres_opt_codes,
                        },
                    )
                )

        # ------------------------------------------------------------
        # Contradiction B: Cash-only payments BUT claims digital payment reconciliation
        # Q-PAY-01 (Cash only) AND Q-PAY-02 (Yes, reconciles digital payments)
        # ------------------------------------------------------------
        ans_pay_01 = answers_by_question_code.get("Q-PAY-01")
        ans_pay_02 = answers_by_question_code.get("Q-PAY-02")

        if ans_pay_01 and ans_pay_02:
            pay_01_opt_code = cls._get_selected_option_code(ans_pay_01, options_by_id)
            pay_02_opt_code = cls._get_selected_option_code(ans_pay_02, options_by_id)

            is_cash_only = (pay_01_opt_code == "OPT_PAY_01_CASH")
            reconciles_digital = (pay_02_opt_code == "OPT_PAY_02_YES")

            if is_cash_only and reconciles_digital:
                detected.append(
                    ContradictionRecord(
                        code="CONTRADICTION_CASH_RECONCILIATION",
                        name="Cash Only with Digital Payment Reconciliation",
                        description_en="Business reported accepting 'Cash only' (Q-PAY-01) but stated they regularly reconcile digital payments (Q-PAY-02).",
                        description_hi="व्यवसाय ने 'केवल नकद' (Q-PAY-01) भुगतान स्वीकार करने की सूचना दी लेकिन बताया कि वे नियमित रूप से डिजिटल भुगतानों का मिलान करते हैं (Q-PAY-02)।",
                        involved_questions=["Q-PAY-01", "Q-PAY-02"],
                        detected_answers={
                            "Q-PAY-01": pay_01_opt_code,
                            "Q-PAY-02": pay_02_opt_code,
                        },
                    )
                )

        return detected

    @classmethod
    def _get_selected_option_code(cls, answer: Any, options_by_id: Dict[int, Any]) -> Optional[str]:
        """Extract option_code for single-choice / boolean answer."""
        opt_id = getattr(answer, "selected_option_id", None)
        if opt_id is None and isinstance(answer, dict):
            opt_id = answer.get("selected_option_id")
        if opt_id and opt_id in options_by_id:
            opt = options_by_id[opt_id]
            return getattr(opt, "option_code", None) or opt.get("option_code")
        return None

    @classmethod
    def _get_multi_option_codes(cls, answer: Any, options_by_id: Dict[int, Any]) -> List[str]:
        """Extract list of selected option codes from multi-choice answer."""
        text_ans = getattr(answer, "text_answer", None)
        if text_ans is None and isinstance(answer, dict):
            text_ans = answer.get("text_answer")
        codes: List[str] = []
        if not text_ans:
            opt_code = cls._get_selected_option_code(answer, options_by_id)
            return [opt_code] if opt_code else []

        try:
            parsed = json.loads(text_ans)
            if isinstance(parsed, list):
                for item in parsed:
                    if isinstance(item, int) and item in options_by_id:
                        code = getattr(options_by_id[item], "option_code", None) or options_by_id[item].get("option_code")
                        if code:
                            codes.append(code)
                    elif isinstance(item, str):
                        codes.append(item)
            else:
                codes.append(str(parsed))
        except Exception:
            for item in text_ans.split(","):
                codes.append(item.strip())

        return codes
