"""Chatbot Orchestrator & Safety Controller.

Orchestrates conversational prompts, injects structured business context,
enforces prompt-injection defenses, and guarantees that LLM suggestions
cannot override deterministic RBDL rules, budget tiers, or government schemes.
"""

from typing import Dict, List, Any, Optional
import re
from app.core.llm.schema import ChatbotStructuredResponse, ChatbotResponseType
from app.core.llm.providers import BaseLLMProvider, get_llm_provider


class ChatbotOrchestrator:
    """Safely orchestrates conversational AI interactions for DigiMitra."""

    def __init__(self, provider: Optional[BaseLLMProvider] = None):
        self.provider = provider or get_llm_provider()

    @staticmethod
    def sanitize_user_input(query: str) -> str:
        """
        Strip malicious system prompts, prompt injection attempts, and special tokens.
        """
        # Remove prompt injection phrases
        patterns = [
            r"ignore\s+(all\s+)?(previous\s+)?instructions",
            r"system\s*:\s*",
            r"<\|im_start\|>",
            r"<\|im_end\|>",
            r"you\s+are\s+now\s+in\s+developer\s+mode",
            r"override\s+rules",
        ]
        sanitized = query
        for pat in patterns:
            sanitized = re.sub(pat, "[FILTERED]", sanitized, flags=re.IGNORECASE)

        return sanitized.strip()

    async def get_conversational_guidance(
        self,
        user_query: str,
        business_profile: Dict[str, Any],
        assessment_summary: Optional[Dict[str, Any]] = None,
        requirement_profile: Optional[Dict[str, Any]] = None,
        roadmap_summary: Optional[Dict[str, Any]] = None,
    ) -> ChatbotStructuredResponse:
        """
        Generate structured conversational guidance conditioned on verified business state.
        """
        clean_query = self.sanitize_user_input(user_query)

        # Assemble structured context
        context: Dict[str, Any] = {
            "business_name": business_profile.get("business_name", "Enterprise"),
            "sector": business_profile.get("sector_code", "RETAIL"),
            "size": business_profile.get("business_size", "micro"),
            "current_level": assessment_summary.get("rbdl_level", 0) if assessment_summary else 0,
            "dimension_scores": assessment_summary.get("dimension_scores", {}) if assessment_summary else {},
            "budget_tier": requirement_profile.get("budget_tier", "B1_LOW") if requirement_profile else "B1_LOW",
            "goals": requirement_profile.get("goals", []) if requirement_profile else [],
            "urgency": requirement_profile.get("urgency", "U2_WITHIN_6_MONTHS") if requirement_profile else "U2_WITHIN_6_MONTHS",
        }

        system_instruction = (
            "You are DigiMitra AI Guide, an advisory digital transformation assistant for Indian MSMEs. "
            "You must NOT override official RBDL levels. You must NOT promise loans, subsidies, or tax guarantees. "
            "All recommendations must be realistic, practical, and low-cost for Indian local businesses."
        )

        try:
            response = await self.provider.generate_response(
                prompt=clean_query,
                structured_context=context,
                system_instruction=system_instruction,
            )
            return response
        except Exception:
            # Graceful safety fallback
            return ChatbotStructuredResponse(
                response_type=ChatbotResponseType.SAFETY_FALLBACK,
                message_en="The AI assistant is temporarily unavailable. Please proceed with your structured assessment and roadmap recommendations.",
                message_hi="एआई सहायक वर्तमान में अनुपलब्ध है। कृपया अपने संरचित मूल्यांकन और रोडमैप सुझावों के साथ आगे बढ़ें।",
                confidence_level="fallback",
            )
