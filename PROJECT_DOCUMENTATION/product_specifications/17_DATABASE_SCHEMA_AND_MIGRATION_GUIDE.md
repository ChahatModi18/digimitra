# 17. Database Schema & Migration Guide

## 1. Relational Entity Relationship Diagram (ERD)
The database structure is normalized, maintaining full relational integrity and auditability.

```mermaid
erDiagram
    USERS ||--o{ BUSINESSES : owns
    BUSINESSES ||--o{ ASSESSMENTS : conducts
    ASSESSMENTS ||--|| CLASSIFICATION_RESULTS : produces
    CLASSIFICATION_RESULTS ||--o{ DIMENSION_SCORES : contains
    CLASSIFICATION_RESULTS ||--o{ RECOMMENDATIONS : generates
    RECOMMENDATIONS ||--o{ ROADMAP_TASKS : scheduled_as
    BUSINESSES ||--o{ ROADMAPS : has
    ROADMAPS ||--o{ ROADMAP_TASKS : contains
    BUSINESSES ||--o{ REQUIREMENT_PROFILES : configures

    USERS {
        int id PK
        string email UK
        string hashed_password
        string role
        datetime created_at
    }

    BUSINESSES {
        int id PK
        int user_id FK
        string name
        string sector_code
        string category_code
        string enterprise_size
        string state
        string city
        datetime created_at
    }

    CLASSIFICATION_RESULTS {
        int id PK
        int business_id FK
        int rbdl_level
        float composite_score
        string certainty_tier
        datetime created_at
    }

    ROADMAPS {
        int id PK
        int business_id FK
        int version
        string status
        int current_rbdl_level
        int target_rbdl_level
        datetime generated_at
    }
```

## 2. Alembic Migration Chain
The database schema is managed via linear Alembic migrations:
1. `a1b2c3d4e5f6`: Initial core schema (users, businesses, assessments).
2. `b2c3d4e5f6a1`: Classification results and dimension score tables.
3. `c3d4e5f6a1b2`: C4 recommendations and roadmap tables.
4. `d4e5f6a1b2c3`: Requirement profile V1 table.
5. `e5f6a1b2c3d4`: Progress tracking and historical comparison tables.
6. `f6a1b2c3d4e5`: Security and audit logging enhancements.
7. `h8b9c0d1e2f3`: Research evaluation infrastructure tables.
8. `i9c0d1e2f3a4`: Business taxonomy expansion (11 sectors, 49 subcategories, needs, tools, paths).\n