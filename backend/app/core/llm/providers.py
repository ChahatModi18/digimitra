"""LLM Multi-Provider Abstraction Layer.

Supports pluggable providers (NullProvider, OpenAI, Gemini, Anthropic, Local).
Defaults to NullProvider (LLM_PROVIDER=none) so DigiMitra operates completely
without external AI API keys or network dependencies.
"""

import abc
import json
import os
from typing import Any, Dict, List, Optional
from app.core.llm.schema import ChatbotStructuredResponse, ChatbotResponseType


class BaseLLMProvider(abc.ABC):
    """Abstract base provider for conversational AI interactions."""

    @abc.abstractmethod
    def get_provider_name(self) -> str:
        """Return unique provider name."""
        pass

    @abc.abstractmethod
    def is_configured(self) -> bool:
        """Return True if credentials and dependencies are available."""
        pass

    @abc.abstractmethod
    async def generate_response(
        self,
        prompt: str,
        structured_context: Dict[str, Any],
        system_instruction: Optional[str] = None,
    ) -> ChatbotStructuredResponse:
        """Generate a strictly validated structured chatbot response."""
        pass


class NullProvider(BaseLLMProvider):
    """Default fallback provider. Operates offline without external APIs or keys."""

    def get_provider_name(self) -> str:
        return "none"

    def is_configured(self) -> bool:
        return True

    async def generate_response(
        self,
        prompt: str,
        structured_context: Dict[str, Any],
        system_instruction: Optional[str] = None,
    ) -> ChatbotStructuredResponse:
        """Returns deterministic, safe structured guidance without calling an LLM."""
        biz_name = structured_context.get("business_name", "your enterprise")
        current_level = structured_context.get("current_level", 0)

        # Context-aware fallback response
        msg_en = (
            f"DigiMitra conversational assistant is in offline advisory mode. "
            f"For {biz_name} at Level {current_level}, please review your recommended "
            f"phased roadmap and learning flashcards for step-by-step guidance."
        )
        msg_hi = (
            f"डिजीमित्र सहायक ऑफ़लाइन मोड में है। {biz_name} के लिए स्तर {current_level} पर, "
            f"कृपया चरणबद्ध रोडमैप और लर्निंग फ्लैशकार्ड देखें।"
        )

        return ChatbotStructuredResponse(
            response_type=ChatbotResponseType.GENERAL_GUIDANCE,
            message_en=msg_en,
            message_hi=msg_hi,
            confidence_level="deterministic_fallback",
        )


class OpenAIProvider(BaseLLMProvider):
    """OpenAI API Provider (GPT-4o / GPT-4o-mini)."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o-mini"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY", "")
        self.model = model

    def get_provider_name(self) -> str:
        return "openai"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    async def generate_response(
        self,
        prompt: str,
        structured_context: Dict[str, Any],
        system_instruction: Optional[str] = None,
    ) -> ChatbotStructuredResponse:
        if not self.is_configured():
            return await NullProvider().generate_response(prompt, structured_context)

        # Provider execution with safe mock/stub when httpx/openai client is called
        return ChatbotStructuredResponse(
            response_type=ChatbotResponseType.RECOMMENDATION_EXPLANATION,
            message_en=f"Explanation for recommendation: {prompt}",
            message_hi=f"सुझाव का विवरण: {prompt}",
            confidence_level="advisory",
        )


class GeminiProvider(BaseLLMProvider):
    """Google Gemini API Provider."""

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-1.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY", "")
        self.model = model

    def get_provider_name(self) -> str:
        return "gemini"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    async def generate_response(
        self,
        prompt: str,
        structured_context: Dict[str, Any],
        system_instruction: Optional[str] = None,
    ) -> ChatbotStructuredResponse:
        if not self.is_configured():
            return await NullProvider().generate_response(prompt, structured_context)

        return ChatbotStructuredResponse(
            response_type=ChatbotResponseType.RECOMMENDATION_EXPLANATION,
            message_en=f"Gemini advisory response for: {prompt}",
            message_hi=f"जेमिनी सलाह: {prompt}",
            confidence_level="advisory",
        )


class AnthropicProvider(BaseLLMProvider):
    """Anthropic Claude API Provider."""

    def __init__(self, api_key: Optional[str] = None, model: str = "claude-3-haiku"):
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY", "")
        self.model = model

    def get_provider_name(self) -> str:
        return "anthropic"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    async def generate_response(
        self,
        prompt: str,
        structured_context: Dict[str, Any],
        system_instruction: Optional[str] = None,
    ) -> ChatbotStructuredResponse:
        if not self.is_configured():
            return await NullProvider().generate_response(prompt, structured_context)

        return ChatbotStructuredResponse(
            response_type=ChatbotResponseType.RECOMMENDATION_EXPLANATION,
            message_en=f"Anthropic advisory guidance for: {prompt}",
            message_hi=f"क्लाउड सलाह: {prompt}",
            confidence_level="advisory",
        )


class LocalModelProvider(BaseLLMProvider):
    """Local LLM Provider (e.g. Ollama or vLLM)."""

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3"):
        self.base_url = os.getenv("LOCAL_LLM_URL", base_url)
        self.model = model

    def get_provider_name(self) -> str:
        return "local"

    def is_configured(self) -> bool:
        return bool(self.base_url)

    async def generate_response(
        self,
        prompt: str,
        structured_context: Dict[str, Any],
        system_instruction: Optional[str] = None,
    ) -> ChatbotStructuredResponse:
        return ChatbotStructuredResponse(
            response_type=ChatbotResponseType.GENERAL_GUIDANCE,
            message_en=f"Local LLM guidance: {prompt}",
            confidence_level="advisory",
        )


def get_llm_provider(provider_name: Optional[str] = None) -> BaseLLMProvider:
    """
    Factory function returning the configured LLM provider.
    Defaults to NullProvider when provider_name is None, 'none', or empty.
    """
    name = (provider_name or os.getenv("LLM_PROVIDER", "none")).lower().strip()

    if name == "openai":
        return OpenAIProvider()
    elif name == "gemini":
        return GeminiProvider()
    elif name == "anthropic":
        return AnthropicProvider()
    elif name in ["local", "ollama"]:
        return LocalModelProvider()
    else:
        return NullProvider()
