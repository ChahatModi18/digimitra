"""Label Extraction Strategy (C5 Section 7).

Extracts training targets for Stage 1 (rule-distillation) and Stage 2
(consultant-corrected ground truth).

Enforces STAGE_1_DISCLAIMER on all Stage 1 outputs.
"""

from typing import Any, Dict, Optional
from app.ml.constants import STAGE_1_DISCLAIMER


class LabelBuilder:
    """Extracts classification target labels and binds required ethical disclaimers."""

    @staticmethod
    def extract_stage_1_label(classification_record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract Stage 1 rule-based distillation label.

        Requires:
        - method == 'rule_based'
        - is_primary == True
        """
        method = classification_record.get("method", "rule_based")
        is_primary = classification_record.get("is_primary", True)
        rbdl_level = classification_record.get("rbdl_level")
        ruleset_version = classification_record.get("ruleset_version", 1)

        if method != "rule_based" or not is_primary or rbdl_level is None:
            return {
                "valid": False,
                "label": None,
                "stage": "stage_1",
                "ruleset_version": ruleset_version,
                "disclaimer": STAGE_1_DISCLAIMER,
                "reason": "Not a primary rule-based classification record.",
            }

        return {
            "valid": True,
            "label": int(rbdl_level),
            "stage": "stage_1",
            "ruleset_version": int(ruleset_version),
            "disclaimer": STAGE_1_DISCLAIMER,
        }

    @staticmethod
    def extract_stage_2_label(research_record: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract Stage 2 consultant-corrected ground truth label.
        """
        corrected_level = research_record.get("consultant_corrected_level")

        if corrected_level is None:
            return {
                "valid": False,
                "label": None,
                "stage": "stage_2",
                "disclaimer": None,
                "reason": "No consultant corrected level present.",
            }

        return {
            "valid": True,
            "label": int(corrected_level),
            "stage": "stage_2",
            "corrected_by_user_id": research_record.get("corrected_by_user_id"),
            "corrected_at": research_record.get("corrected_at"),
            "disclaimer": None,
        }
