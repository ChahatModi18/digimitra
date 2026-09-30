# 27. Codebase Pagewise & Architectural Technical Report

## 1. Directory Structure Overview
```
MAJOR PROJECT DOCUMENTATION/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/       # FastAPI REST routing layer
│   │   ├── core/                   # Security, exceptions, configuration, LLM abstraction
│   │   ├── domain/                 # Pure domain business logic & engines
│   │   │   ├── assessment/         # C3 Diagnostic Questions & Dimensions
│   │   │   ├── government/         # Verified MSME Government Initiatives
│   │   │   ├── learning/           # 12-Attribute Flashcards Catalog
│   │   │   ├── rbdl/               # Scoring, classification & ceiling rules
│   │   │   ├── recommendations/    # C4 recommendations catalog, DAG, ranking & roadmap
│   │   │   ├── requirements/       # Requirement profile V1, budget tiers, goals
│   │   │   └── taxonomy/           # 11-Sector, 49-Category MSME taxonomy
│   │   ├── ml/                     # ML training, candidate models, and synthetic pipeline
│   │   │   ├── models/             # Logistic regression, gradient boosting, clustering
│   │   │   └── synthetic/          # Synthetic dataset generator, validator, builder
│   │   ├── models/                 # SQLAlchemy ORM database models
│   │   ├── schemas/                # Pydantic v2 validation DTOs
│   │   └── services/               # Application coordination & fusion services
│   ├── alembic/                    # Database migrations chain (a1 to i9)
│   └── tests/                      # 180+ pytest unit and integration test suites
└── frontend/
    ├── src/
    │   ├── api/                    # Typed Axios HTTP client modules
    │   ├── components/             # Reusable UI primitives and domain widgets
    │   ├── context/                # AuthContext & session state management
    │   ├── data/                   # Indian states and MSME taxonomy definitions
    │   ├── locales/                # Bilingual i18n JSON catalogs (en, hi)
    │   └── pages/                  # React view components (Dashboard, Assessment, Roadmap, etc.)
    └── tests/                      # 27 Vitest React testing library suites
```

## 2. Key Modules & Technical Documentation

### `backend/app/domain/taxonomy/categories.py`
- Defines the 11 sectors (`SECTORS`) and 49 subcategory nodes (`TAXONOMY_CATALOG`).
- Attributes: `code`, `sector_code`, `category_code`, `subcategory_code`, `typical_needs`, `typical_tools`, `typical_digitalization_paths`.

### `backend/app/domain/rbdl/scoring.py` & `classifier.py`
- `ScoringEngine.calculate_scores()`: Computes normalized 0-10 scores across 9 dimensions.
- `RBDLClassifierEngine.classify()`: Applies ceiling constraints and evaluates Level 0 to Level 3 assignments with certainty tiers.

### `backend/app/domain/recommendations/ranking.py` & `roadmap_generator.py`
- `RecommendationRankingEngine.rank_recommendations()`: Prioritizes eligible actions based on goal alignment, pain point relief, and budget tier.
- `RoadmapGeneratorEngine.generate_roadmap()`: Groups ranked recommendations into Phase 1 (Quick Wins), Phase 2 (Core Next Steps), and Phase 3 (Strategic Growth).

### `backend/app/services/recommendation_fusion_service.py`
- `RecommendationFusionService.fuse_recommendations()`: Merges deterministic C4 rules (80% weight) with advisory ML predictions (20% weight) while enforcing prerequisite and budget invariants.

### `backend/app/core/llm/`
- `providers.py`: Abstract `BaseLLMProvider`, default offline `NullProvider`, and external provider connectors.
- `chatbot_service.py`: `ChatbotOrchestrator` with regex prompt injection filtering and safe context assembly.
- `schema.py`: Strictly typed Pydantic models preventing rule override claims.

### `backend/app/domain/learning/flashcards.py`
- Contains the 12-attribute educational knowledge nuggets for Level 1, Level 2, and Level 3 growth (Business Intelligence, CRM, ONDC, Cybersecurity).

### `backend/app/domain/government/initiatives.py`
- Catalog of 8 verified Government of India & Rajasthan schemes with official portal links and mandatory disclaimer notices.\n