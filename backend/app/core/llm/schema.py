"""Chatbot Response Schemas & Validation Constraints.

Guarantees that all LLM outputs conform to structured, approved schemas.
Prevents unapproved arbitrary question injection or rule override attempts.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class ChatbotResponseType(str, Enum):
    CLARIFICATION_QUESTION = "clarification_question"
    NEXT_QUESTION = "next_question"
    RECOMMENDATION_EXPLANATION = "recommendation_explanation"
    ROADMAP_EXPLANATION = "roadmap_explanation"
    GOVERNMENT_SCHEME_GUIDANCE = "government_scheme_guidance"
    GENERAL_GUIDANCE = "general_guidance"
    SAFETY_FALLBACK = "safety_fallback"


class ChatbotStructuredResponse(BaseModel):
    """Strictly validated structured response returned from the LLM provider."""

    response_type: ChatbotResponseType
    message_en: str = Field(..., min_length=2)
    message_hi: Optional[str] = None
    target_dimension: Optional[str] = Field(default=None, pattern="^(infra|literacy|presence|comms|records|payments|inventory|data_usage|growth)?$")
    recommended_action_code: Optional[str] = None
    related_initiative_name: Optional[str] = None
    options: Optional[List[str]] = None
    confidence_level: str = "advisory"
    safety_disclaimer: str = (
        "AI Chatbot guidance is advisory only. DigiMitra official digitalization levels "
        "and recommendations are strictly determined by verified deterministic rules."
    )

    @field_validator("message_en")
    @classmethod
    def check_safety_invariants(cls, v: str) -> str:
        # Detect attempts to claim official level authority or tax/legal guarantees
        prohibited_phrases = [
            "official rbdl level",
            "guaranteed loan approval",
            "certified eligible by digimitra",
            "override existing rules",
            "i have changed your level",
        ]
        lower_v = v.lower()
        for phrase in prohibited_phrases:
            if phrase in lower_v:
                raise ValueError(f"Safety violation: response attempted unauthorized claim: '{phrase}'")
        return v
