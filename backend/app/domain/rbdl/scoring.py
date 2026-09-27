"""Dimension and Composite Scoring Engine for DigiMitra (Claude C3).

Formula:
dimension_score = (sum_of_applicable_scores / sum_of_max_possible_applicable_scores) * 10.0

N/A questions are excluded from both numerator and denominator.
Unanswered questions are NOT treated as N/A.
Composite score = sum(dimension_score * dimension_weight).
"""

from decimal import Decimal
from typing import Any, Dict, List, Optional, Set
from pydantic import BaseModel

from app.domain.rbdl.dimensions import RBDL_DIMENSIONS, DIMENSION_WEIGHTS


class DimensionScoreResult(BaseModel):
    """Calculated score metrics for a single dimension."""

    dimension_code: str
    dimension_name_en: str
    dimension_name_hi: str
    raw_score: float
    max_possible_score: float
    dimension_score: float  # Normalized 0.0 to 10.0
    weight: float
    answered_count: int
    na_count: int
    missing_count: int
    is_fully_na: bool = False


class AssessmentScoringSummary(BaseModel):
    """Full assessment scoring outcome with per-dimension and composite scores."""

    dimension_scores: Dict[str, float]  # e.g. {"infra": 7.5, "literacy": 6.0}
    detailed_scores: Dict[str, DimensionScoreResult]
    composite_score: float  # 0.0 to 10.0 weighted composite
    total_answered: int
    total_na: int
    total_missing: int
    is_complete: bool


class ScoringEngine:
    """Calculates dimension scores and weighted composite score from assessment answers."""

    @classmethod
    def calculate_scores(
        cls,
        questions: List[Any],  # List of Question models or dicts
        answers_by_question_id: Dict[int, Any],  # question_id -> AssessmentAnswer or dict
    ) -> AssessmentScoringSummary:
        """Calculate per-dimension normalized scores (0-10) and composite score."""
        # Group questions by dimension
        questions_by_dim: Dict[str, List[Any]] = {dim: [] for dim in RBDL_DIMENSIONS}
        for q in questions:
            dim = getattr(q, "dimension_code", None) or q.get("dimension_code")
            if dim in questions_by_dim:
                questions_by_dim[dim].append(q)

        detailed_scores: Dict[str, DimensionScoreResult] = {}
        dimension_scores: Dict[str, float] = {}

        total_answered = 0
        total_na = 0
        total_missing = 0

        for dim_code, dim_meta in RBDL_DIMENSIONS.items():
            dim_questions = questions_by_dim.get(dim_code, [])
            dim_raw_score = 0.0
            dim_max_possible = 0.0
            dim_answered = 0
            dim_na = 0
            dim_missing = 0

            for q in dim_questions:
                q_id = getattr(q, "id", None) or q.get("id")
                q_type = getattr(q, "question_type", None) or q.get("question_type")
                options = getattr(q, "options", []) or q.get("options", [])

                answer = answers_by_question_id.get(q_id)

                if answer is None:
                    # Unanswered / skipped: max possible still counts in potential, but 0 scored
                    q_max = cls._get_question_max_score(q_type, options)
                    dim_max_possible += q_max
                    dim_missing += 1
                    total_missing += 1
                    continue

                # Check if marked N/A
                is_na = cls._is_answer_na(answer)
                if is_na:
                    dim_na += 1
                    total_na += 1
                    # Exclude both from numerator and denominator
                    continue

                # Answered with score
                score_obtained, q_max = cls._calculate_question_score(q_type, options, answer)
                dim_raw_score += score_obtained
                dim_max_possible += q_max
                dim_answered += 1
                total_answered += 1

            # Compute normalized 0.0 - 10.0 score
            if dim_max_possible > 0:
                normalized_score = round((dim_raw_score / dim_max_possible) * 10.0, 2)
            else:
                # All questions were N/A or no questions in dimension
                normalized_score = 0.0

            is_fully_na = (dim_na > 0 and dim_answered == 0 and dim_missing == 0)

            result = DimensionScoreResult(
                dimension_code=dim_code,
                dimension_name_en=dim_meta.name_en,
                dimension_name_hi=dim_meta.name_hi,
                raw_score=round(dim_raw_score, 2),
                max_possible_score=round(dim_max_possible, 2),
                dimension_score=normalized_score,
                weight=dim_meta.weight,
                answered_count=dim_answered,
                na_count=dim_na,
                missing_count=dim_missing,
                is_fully_na=is_fully_na,
            )
            detailed_scores[dim_code] = result
            dimension_scores[dim_code] = normalized_score

        # Calculate weighted composite score
        composite_score = 0.0
        for dim_code, score in dimension_scores.items():
            weight = DIMENSION_WEIGHTS.get(dim_code, 0.0)
            composite_score += score * weight

        composite_score = round(composite_score, 2)
        is_complete = (total_missing == 0)

        return AssessmentScoringSummary(
            dimension_scores=dimension_scores,
            detailed_scores=detailed_scores,
            composite_score=composite_score,
            total_answered=total_answered,
            total_na=total_na,
            total_missing=total_missing,
            is_complete=is_complete,
        )

    @classmethod
    def _is_answer_na(cls, answer: Any) -> bool:
        """Check if an answer record represents an explicit Not Applicable selection."""
        text_ans = getattr(answer, "text_answer", None)
        if text_ans is None and isinstance(answer, dict):
            text_ans = answer.get("text_answer")
        if text_ans and str(text_ans).strip().upper() in ("N/A", "NA", "NOT_APPLICABLE"):
            return True
        return False

    @classmethod
    def _opt_attr(cls, opt: Any, key: str, default: Any = None) -> Any:
        """Safely extract attribute from option model or dict."""
        if hasattr(opt, key):
            val = getattr(opt, key)
            return default if val is None else val
        if isinstance(opt, dict):
            return opt.get(key, default)
        return default

    @classmethod
    def _get_question_max_score(cls, q_type: str, options: List[Any]) -> float:
        """Calculate maximum achievable score for a question."""
        if not options:
            return 1.0
        if q_type == "multi_choice":
            pos_sum = 0.0
            for opt in options:
                code = str(cls._opt_attr(opt, "option_code", ""))
                val = float(cls._opt_attr(opt, "score_value", 0.0))
                if "NONE" not in code.upper() and val > 0:
                    pos_sum += val
            return pos_sum if pos_sum > 0 else 1.0
        else:
            max_val = max(float(cls._opt_attr(o, "score_value", 0.0)) for o in options)
            return max_val if max_val > 0 else 1.0

    @classmethod
    def _calculate_question_score(
        cls, q_type: str, options: List[Any], answer: Any
    ) -> tuple[float, float]:
        """Calculate obtained score and maximum possible score for an answered question."""
        max_possible = cls._get_question_max_score(q_type, options)

        opt_by_id = {}
        opt_by_code = {}
        for opt in options:
            opt_id = cls._opt_attr(opt, "id")
            opt_code = cls._opt_attr(opt, "option_code")
            if opt_id is not None:
                opt_by_id[opt_id] = opt
            if opt_code:
                opt_by_code[opt_code] = opt

        if q_type == "multi_choice":
            import json
            text_ans = getattr(answer, "text_answer", None)
            if text_ans is None and isinstance(answer, dict):
                text_ans = answer.get("text_answer")

            selected_keys: List[Any] = []
            if text_ans:
                try:
                    parsed = json.loads(text_ans)
                    if isinstance(parsed, list):
                        selected_keys = parsed
                    else:
                        selected_keys = [parsed]
                except Exception:
                    selected_keys = [k.strip() for k in text_ans.split(",") if k.strip()]

            # Also check if single option ID is populated
            single_opt_id = getattr(answer, "selected_option_id", None)
            if single_opt_id is None and isinstance(answer, dict):
                single_opt_id = answer.get("selected_option_id")
            if single_opt_id and single_opt_id not in selected_keys:
                selected_keys.append(single_opt_id)

            # Check mutual exclusivity for 'None of these'
            has_none = False
            for key in selected_keys:
                if str(key).upper() in ("OPT_PRES_01_NONE", "NONE", "NONE_OF_THESE"):
                    has_none = True
                    break
                if isinstance(key, int) and key in opt_by_id:
                    code = str(cls._opt_attr(opt_by_id[key], "option_code", ""))
                    if "NONE" in code.upper():
                        has_none = True
                        break

            if has_none:
                return 0.0, max_possible

            # Sum positive scores
            obtained = 0.0
            for key in selected_keys:
                opt = None
                if isinstance(key, int) and key in opt_by_id:
                    opt = opt_by_id[key]
                elif str(key).isdigit() and int(key) in opt_by_id:
                    opt = opt_by_id[int(key)]
                elif str(key) in opt_by_code:
                    opt = opt_by_code[str(key)]

                if opt:
                    val = float(cls._opt_attr(opt, "score_value", 0.0))
                    obtained += val

            return obtained, max_possible

        else:
            # Single choice / boolean / numeric
            opt_id = getattr(answer, "selected_option_id", None)
            if opt_id is None and isinstance(answer, dict):
                opt_id = answer.get("selected_option_id")

            if opt_id and opt_id in opt_by_id:
                opt = opt_by_id[opt_id]
                score = float(cls._opt_attr(opt, "score_value", 0.0))
                return score, max_possible

            # Fallback check for numeric answer
            numeric_ans = getattr(answer, "numeric_answer", None)
            if numeric_ans is None and isinstance(answer, dict):
                numeric_ans = answer.get("numeric_answer")
            if numeric_ans is not None:
                return float(numeric_ans), max_possible

            return 0.0, max_possible
