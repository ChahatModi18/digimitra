# System Architecture & Technical Specifications — DigiMitra (डिजीमित्र)

> **Document Version:** 1.0.0  
> **Architecture Pattern:** Clean Architecture Modular Monolith  
> **Backend Framework:** FastAPI (Python 3.11+) + SQLAlchemy 2.0 Async + Uvicorn  
> **Frontend Framework:** React 18 (TypeScript) + Vite + Tailwind CSS + TanStack Query  
> **Persistence:** MySQL 8.0+ / SQLite 3 (aiosqlite) with Alembic Migrations  

---

## 1. High-Level Architectural Topology

DigiMitra is architected as a **Modular Monolith** with strict domain boundary isolation. It provides the deployment simplicity and zero-network-hop operational latency of a single service while maintaining pure architectural decoupling that permits individual modules (such as the Scoring Engine or Chatbot) to be extracted into independent microservices if scale dictates.

```mermaid
graph TD
    subgraph Client_Presentation_Tier [Client & Presentation Layer]
        ReactApp["React 18 SPA (TypeScript + Vite)"]
        UI_Components["AppShell, DimensionCards, RoadmapTracker"]
        QueryState["TanStack React Query Cache"]
        i18nBundle["react-i18next (en / hi)"]
    end

    subgraph API_Gateway_Tier [FastAPI ASGI Gateway & Routing]
        Uvicorn["Uvicorn High-Performance Worker"]
        AuthMiddleware["JWT Bearer Authentication & RBAC"]
        PydanticValidation["Pydantic v2 Request/Response Serializers"]
        ExceptionHandlers["Normalized JSON Problem Details (RFC 7807)"]
    end

    subgraph Domain_Core_Tier [Pure Domain Application Layer]
        ScoringCore["9-Dimension Scoring Engine"]
        ClassifierCore["Classifier Strategy (Rule-Based vs ML)"]
        RoadmapCore["3-Phase Action Roadmap Generator"]
        SchemeMatcher["Government MSME Scheme Fusion"]
        AuditEngine["Append-Only Reproducibility Audit Engine"]
    end

    subgraph Data_Persistence_Tier [Persistence & Storage Layer]
        SQLA["SQLAlchemy 2.0 Async Session"]
        Alembic["Alembic Migration Engine"]
        MySQL_DB[("MySQL 8.0 Primary DB / Local SQLite")]
    end

    ReactApp -->|HTTP REST / JSON| Uvicorn
    Uvicorn --> AuthMiddleware
    AuthMiddleware --> PydanticValidation
    PydanticValidation --> Domain_Core_Tier
    Domain_Core_Tier --> SQLA
    SQLA --> MySQL_DB
```

---

## 2. Layered Responsibilities & Inversion of Control

### 2.1 Client Layer (`frontend/src`)
- **State Management:** TanStack Query handles server-state synchronization, automatic refetching, and caching.
- **Routing:** React Router v6 provides deterministic client-side page routing (`/`, `/register`, `/assessment`, `/roadmap`, `/initiatives`, `/history`, `/contact`).
- **HTTP Client:** Centralized Axios instance with automatic authorization header injection and localized error interception.

### 2.2 API Layer (`backend/app/api/v1`)
- **FastAPI Endpoints:** Thin controllers that validate HTTP payloads via Pydantic schemas, invoke domain services, and return strict DTO responses.
- **Dependency Injection:** Database sessions (`get_async_session`), authenticated current user (`get_current_user`), and active language locale (`get_locale`) are injected via FastAPI dependencies.

### 2.3 Domain Layer (`backend/app/domain`)
- **Zero Framework Coupling:** Domain classes contain pure business logic with no imports of FastAPI, HTTP, or direct SQL sessions.
- **Strategy Pattern (`classifier_strategy.py`):** Defines an abstract base class `ClassifierStrategy` with concrete implementations:
  1. `RuleBasedClassifierStrategy`: Deterministic, interpretable AST condition evaluator for MVP.
  2. `MLClassifierStrategy`: Trained Scikit-Learn Random Forest / Gradient Boosting pipeline for research experiments.

### 2.4 Persistence Layer (`backend/app/repositories` & `backend/app/models`)
- **Repository Pattern:** Generic `BaseRepository` provides standardized CRUD methods (`create`, `get_by_id`, `list`, `update`, `delete`).
- **SQLAlchemy 2.0 Async:** All operations execute using `async/await` non-blocking database queries with connection pooling.

---

## 3. Data Flow Execution Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as MSME Owner / Consultant
    participant UI as React 18 Frontend
    participant API as FastAPI Router
    participant Domain as Domain Scoring Engine
    participant DB as MySQL Database
    participant Audit as Audit Trace Logger

    User->>UI: Submits 9-Dimension Assessment Answers
    UI->>API: POST /api/v1/assessments/{id}/submit
    API->>API: Validate Payload via AssessmentSubmitRequest schema
    API->>Domain: Execute scoring & classifier strategy
    Domain->>Domain: Compute dimensional percentages (0-100%)
    Domain->>Domain: Evaluate rule predicates & classify RBDL Level
    Domain->>DB: Persist assessment_answers & classification_result
    Domain->>Audit: Write immutable cryptographic audit trace
    DB-->>API: Transaction committed
    API-->>UI: Return AssessmentResponse with RBDL Level & Milestone Tasks
    UI-->>User: Render visual score gauge & interactive 3-phase roadmap
```

---

## 4. Architectural Quality Attributes & Non-Functional Design

1. **Reproducibility & Auditability:** Every classification is logged with rule IDs, trigger predicates, and input parameters.
2. **Horizontal Scalability:** Stateless ASGI workers can scale behind Nginx or cloud load balancers.
3. **Data Protection:** Implements Indian DPDP Act 2023 compliance with user consent tracking, role isolation, and sanitized exports.
