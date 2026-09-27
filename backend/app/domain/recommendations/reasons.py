"""Bilingual Explainable Reason Generator for Recommendations (Claude C4).

Generates deterministic, template-filled explanations in English and Hindi
from actual assessment dimension scores and target level requirements.
"""

from typing import Any, Dict, Tuple
from app.domain.rbdl.dimensions import RBDL_DIMENSIONS


class RecommendationReasonGenerator:
    """Renders explainable, deterministic bilingual reasons for recommendations."""

    # Target level dimension thresholds per Claude C3
    TARGET_THRESHOLDS: Dict[int, Dict[str, float]] = {
        1: {"infra": 4.0, "literacy": 3.0, "payments": 3.0},
        2: {"presence": 4.0, "comms": 3.0, "records": 4.0, "payments": 4.0, "inventory": 3.0},
        3: {"payments": 6.0, "records": 6.0, "data_usage": 5.0, "growth": 4.0},
    }

    @classmethod
    def generate_bilingual_reason(
        cls,
        recommendation: Dict[str, Any],
        target_rbdl_level: int,
        dimension_scores: Dict[str, float],
    ) -> Tuple[str, str]:
        """Generate English and Hindi reason strings using stored templates and actual scores."""
        dim_code = recommendation.get("dimension_code", "")
        actual_score = round(dimension_scores.get(dim_code, 0.0), 1)

        dim_info = RBDL_DIMENSIONS.get(dim_code)
        dim_label_en = dim_info.name_en if dim_info else dim_code.replace("_", " ").title()
        dim_label_hi = dim_info.name_hi if dim_info else dim_code

        threshold = cls.TARGET_THRESHOLDS.get(target_rbdl_level, {}).get(dim_code, 4.0)

        template_en = recommendation.get("reason_template_en")
        template_hi = recommendation.get("reason_template_hi")

        if template_en and "{actual_score}" in template_en:
            reason_en = template_en.format(
                dimension_label=dim_label_en,
                actual_score=actual_score,
                threshold=threshold,
                target_level=target_rbdl_level,
            )
        elif template_en:
            reason_en = template_en
        else:
            reason_en = (
                f"Recommended because your {dim_label_en} score ({actual_score}/10) "
                f"is below the {threshold}/10 needed to reach Level {target_rbdl_level}."
            )

        if template_hi and "{actual_score}" in template_hi:
            reason_hi = template_hi.format(
                dimension_label=dim_label_hi,
                actual_score=actual_score,
                threshold=threshold,
                target_level=target_rbdl_level,
            )
        elif template_hi:
            reason_hi = template_hi
        else:
            reason_hi = (
                f"यह सुझाव इसलिए दिया गया है क्योंकि आपका {dim_label_hi} स्कोर ({actual_score}/10) "
                f"स्तर {target_rbdl_level} तक पहुँचने के लिए आवश्यक {threshold}/10 से कम है।"
            )

        return reason_en, reason_hi
