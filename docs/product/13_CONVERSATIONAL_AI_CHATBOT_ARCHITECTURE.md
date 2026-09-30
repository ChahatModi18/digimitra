# 13. Conversational AI Chatbot Architecture

## 1. Multi-Provider Abstraction
The chatbot architecture supports swappable LLM providers through a unified interface. By default, it operates completely offline (`LLM_PROVIDER=none`) using `NullProvider`.

```mermaid
flowchart TD
    User[User Query] --> Sanitize[Input Sanitizer & Regex Filter]
    Sanitize --> Router[Provider Factory: get_llm_provider]
    Router -->|LLM_PROVIDER=none| NullP[NullProvider: Deterministic Fallback]
    Router -->|LLM_PROVIDER=openai| OpenAIP[OpenAIProvider: GPT-4o-mini]
    Router -->|LLM_PROVIDER=gemini| GemP[GeminiProvider: Gemini 1.5 Flash]
    Router -->|LLM_PROVIDER=anthropic| AnthP[AnthropicProvider: Claude 3.5]
    Router -->|LLM_PROVIDER=local| LocalP[LocalModelProvider: Ollama/vLLM]
    NullP --> Validate[Output Schema Validator]
    OpenAIP --> Validate
    GemP --> Validate
    AnthP --> Validate
    LocalP --> Validate
    Validate --> Response[Structured Chatbot Response]
```

## 2. Safety Invariants & Injection Defense
- Automatic sanitization strips phrases like "ignore previous instructions", "system:", and "override rules".
- Pydantic schema validation rejects any attempt to claim official certification, loan approval, or rule override.\n