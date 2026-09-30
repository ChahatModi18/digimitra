# 20. Internationalization (i18n) Framework

## 1. Bilingual Architecture
DigiMitra is built from the ground up to support dual-language fluency in English and Hindi (`hi-IN`).

```mermaid
graph LR
    User[User clicks Language Switcher] --> I18n[i18next Language Instance]
    I18n --> KeyLookup[Translation Key Resolution]
    KeyLookup -->|en| EnCatalog[locales/en.json]
    KeyLookup -->|hi| HiCatalog[locales/hi.json]
    EnCatalog --> Render[React Virtual DOM Re-render]
    HiCatalog --> Render
```

## 2. Domain Localization Features
- All 14 C3 questions, option choices, and explainability notes are translated into clear, natural Hindi.
- All recommendations, rationale bullet points, and roadmaps display bilingual descriptions based on user selection.
- All 12 attributes in Learning Flashcards and Government Initiatives are fully localized.\n