# DigiMitra — Master Project Documentation Repository

> **Central Documentation Hub for DigiMitra (डिजीमित्र)**  
> *AI-Assisted Digital Consultant Framework for Requirement-Based Digitalization of Indian MSMEs*

---

## 📑 Documentation Structure & Navigation

All documentation files for the DigiMitra project have been collected, verified, and organized into dedicated modular directories inside `PROJECT_DOCUMENTATION/`.

```
PROJECT_DOCUMENTATION/
├── 01_OVERALL_DEPENDENCIES_AND_SETUP_GUIDE.md   # ⭐ Complete Technology Stack & Installation Manual
├── README.md                                    # 📖 Master Index & Navigation Directory (This Document)
│
├── architecture_audits/                         # 🏛️ Architecture, APIs, & Audit Reports
│   ├── system_architecture.md                   # Clean-architecture modular monolith design
│   ├── api_reference.md                         # Detailed FastAPI endpoint contracts & schemas
│   ├── backend_api_remediation_audit.md         # API route alignment & test verification audit
│   └── CLAIMS_AUDIT.md                          # Academic and technical claims validation
│
├── product_specifications/                      # 📦 27 Modular Product & Technical Specs
│   ├── 01_PRODUCT_OVERVIEW.md                   # Core mission, problem statement, and value proposition
│   ├── 02_USER_PERSONAS_AND_JOURNEYS.md         # Target MSME personas and user journey maps
│   ├── 03_BUSINESS_TAXONOMY_SPECIFICATION.md    # Sector categorization & turnover classification
│   ├── 04_DIGITAL_MATURITY_FRAMEWORK_RBDL_V1.md # RBDL Levels 0–3 maturity framework definition
│   ├── 05_ASSESSMENT_QUESTION_BANK_C3.md        # 9-Dimension digital readiness questionnaire
│   ├── 06_SCORING_AND_CLASSIFICATION_ENGINE.md  # Deterministic scoring & classification rules
│   ├── 07_REQUIREMENT_PROFILING_SPECIFICATION.md# Business profiling and pain point mapping
│   ├── 08_RECOMMENDATION_ENGINE_C4.md           # Heuristic & ML hybrid recommendation logic
│   ├── 09_PHASED_ROADMAP_GENERATOR.md           # 30-60-90-180 day transformation roadmap logic
│   ├── 10_RECOMMENDATION_FUSION_SERVICE.md      # Multi-source recommendation blending engine
│   ├── 11_SYNTHETIC_DATASET_GENERATION_PIPELINE.md # 10,000 synthetic MSME dataset generation
│   ├── 12_ML_MODEL_SUITE_AND_EXPERIMENTATION.md # Random Forest & Gradient Boosting ML pipelines
│   ├── 13_CONVERSATIONAL_AI_CHATBOT_ARCHITECTURE.md # AI Digital Consultant conversational agent
│   ├── 14_LEARNING_FLASHCARDS_AND_KNOWLEDGE_NUGGETS.md # Byte-sized MSME digitalization knowledge
│   ├── 15_GOVERNMENT_MSME_INITIATIVES_LAYER.md  # Curated central/state government scheme matching
│   ├── 16_BACKEND_ARCHITECTURE_AND_API_SPECIFICATION.md # FastAPI async structure & middleware
│   ├── 17_DATABASE_SCHEMA_AND_MIGRATION_GUIDE.md # SQLAlchemy ORM models & Alembic migrations
│   ├── 18_SECURITY_AUTHENTICATION_AND_RBAC.md   # JWT auth, password hashing, and DPDP compliance
│   ├── 19_FRONTEND_ARCHITECTURE_AND_DESIGN_SYSTEM.md # React 18, Vite, TypeScript, and Bharat UI tokens
│   ├── 20_INTERNATIONALIZATION_I18N_FRAMEWORK.md# English/Hindi bilingual localization system
│   ├── 21_ACCESSIBILITY_PERFORMANCE_AND_SEO.md  # WCAG 2.1 AA accessibility & Core Web Vitals
│   ├── 22_QA_TESTING_AND_VALIDATION_MATRIX.md   # Unit, integration, and E2E test strategies
│   ├── 23_DEVOPS_CONTAINERIZATION_AND_DEPLOYMENT.md # Docker, Docker Compose, and CI/CD pipelines
│   ├── 24_EMPIRICAL_RESEARCH_INFRASTRUCTURE_A11.md # A11 empirical research instrumentation
│   ├── 25_PRODUCT_REQUIREMENTS_DOCUMENT_PRD.md  # Formal Product Requirements Document
│   ├── 26_FUTURE_ROADMAP.md                     # Post-v1.0 roadmap (Fintech & ONDC integrations)
│   └── 27_CODEBASE_PAGEWISE_TECHNICAL_REPORT.md # Pagewise audit of all frontend views & APIs
│
└── research_validation/                         # 🔬 Academic Research & Evaluation Instruments
    ├── a11_research_infrastructure.md           # Complete A11 empirical research suite
    ├── a11_research_infrastructure_audit.md     # Research protocol integrity & audit records
    ├── a11_research_instrument_integrity_report.md # Instrument validation & statistical verification
    ├── c8_research_validation_and_empirical_evaluation_design.md # Formal evaluation methodology & power analysis
    └── rbdl_framework.md                        # Academic definition of Requirement-Based Digitalization Levels
```

---

## 🚀 Quick Document Directory

### 1. Overall Dependencies & Multi-Technology Setup Guide
- **File:** [`01_OVERALL_DEPENDENCIES_AND_SETUP_GUIDE.md`](./01_OVERALL_DEPENDENCIES_AND_SETUP_GUIDE.md)
- **Contents:**
  - Complete list of all Python / FastAPI / Scikit-Learn packages with version bounds and architectural descriptions.
  - Complete list of all Node.js / React 18 / Vite / TypeScript / Tailwind CSS packages and testing tools.
  - Runtime and system prerequisites (Python 3.11+, Node 20+, MySQL 8.0/SQLite).
  - Step-by-step installation commands for Windows (PowerShell) and Linux/macOS.
  - Environment variable setup (`.env` configurations for backend and frontend).
  - Database initialization, migration execution, and test suite commands.
  - Troubleshooting guide for common installation errors.

---

### 2. Architecture & Technical Audits
- **System Architecture:** [`architecture_audits/system_architecture.md`](./architecture_audits/system_architecture.md)
- **API Reference Manual:** [`architecture_audits/api_reference.md`](./architecture_audits/api_reference.md)
- **Backend API Remediation Audit:** [`architecture_audits/backend_api_remediation_audit.md`](./architecture_audits/backend_api_remediation_audit.md)
- **Claims & Integrity Audit:** [`architecture_audits/CLAIMS_AUDIT.md`](./architecture_audits/CLAIMS_AUDIT.md)

---

### 3. Product & Feature Specifications (01 to 27)
- **Foundations:** [Product Overview](./product_specifications/01_PRODUCT_OVERVIEW.md) | [Personas](./product_specifications/02_USER_PERSONAS_AND_JOURNEYS.md) | [Taxonomy](./product_specifications/03_BUSINESS_TAXONOMY_SPECIFICATION.md) | [RBDL Model](./product_specifications/04_DIGITAL_MATURITY_FRAMEWORK_RBDL_V1.md)
- **Assessment & Scoring:** [Question Bank](./product_specifications/05_ASSESSMENT_QUESTION_BANK_C3.md) | [Scoring Engine](./product_specifications/06_SCORING_AND_CLASSIFICATION_ENGINE.md) | [Requirement Profiling](./product_specifications/07_REQUIREMENT_PROFILING_SPECIFICATION.md)
- **Recommendations & Roadmaps:** [Recommendation Engine](./product_specifications/08_RECOMMENDATION_ENGINE_C4.md) | [Roadmap Generator](./product_specifications/09_PHASED_ROADMAP_GENERATOR.md) | [Fusion Service](./product_specifications/10_RECOMMENDATION_FUSION_SERVICE.md)
- **Data & ML Suite:** [Synthetic Data](./product_specifications/11_SYNTHETIC_DATASET_GENERATION_PIPELINE.md) | [ML Suite](./product_specifications/12_ML_MODEL_SUITE_AND_EXPERIMENTATION.md)
- **Assistance & Schemes:** [AI Chatbot](./product_specifications/13_CONVERSATIONAL_AI_CHATBOT_ARCHITECTURE.md) | [Learning Flashcards](./product_specifications/14_LEARNING_FLASHCARDS_AND_KNOWLEDGE_NUGGETS.md) | [Government Initiatives](./product_specifications/15_GOVERNMENT_MSME_INITIATIVES_LAYER.md)
- **Engineering & Infrastructure:** [Backend Specs](./product_specifications/16_BACKEND_ARCHITECTURE_AND_API_SPECIFICATION.md) | [Database & Migrations](./product_specifications/17_DATABASE_SCHEMA_AND_MIGRATION_GUIDE.md) | [Security & Auth](./product_specifications/18_SECURITY_AUTHENTICATION_AND_RBAC.md) | [Frontend Architecture](./product_specifications/19_FRONTEND_ARCHITECTURE_AND_DESIGN_SYSTEM.md) | [i18n Localization](./product_specifications/20_INTERNATIONALIZATION_I18N_FRAMEWORK.md) | [Accessibility & SEO](./product_specifications/21_ACCESSIBILITY_PERFORMANCE_AND_SEO.md) | [Testing Matrix](./product_specifications/22_QA_TESTING_AND_VALIDATION_MATRIX.md) | [DevOps & Docker](./product_specifications/23_DEVOPS_CONTAINERIZATION_AND_DEPLOYMENT.md)
- **Research & PRD:** [Research Infrastructure A11](./product_specifications/24_EMPIRICAL_RESEARCH_INFRASTRUCTURE_A11.md) | [PRD Document](./product_specifications/25_PRODUCT_REQUIREMENTS_DOCUMENT_PRD.md) | [Future Roadmap](./product_specifications/26_FUTURE_ROADMAP.md) | [Pagewise Technical Report](./product_specifications/27_CODEBASE_PAGEWISE_TECHNICAL_REPORT.md)

---

### 4. Research & Empirical Evaluation Instruments
- **A11 Infrastructure:** [`research_validation/a11_research_infrastructure.md`](./research_validation/a11_research_infrastructure.md)
- **A11 Audit:** [`research_validation/a11_research_infrastructure_audit.md`](./research_validation/a11_research_infrastructure_audit.md)
- **Instrument Integrity Report:** [`research_validation/a11_research_instrument_integrity_report.md`](./research_validation/a11_research_instrument_integrity_report.md)
- **Empirical Evaluation Design (C8):** [`research_validation/c8_research_validation_and_empirical_evaluation_design.md`](./research_validation/c8_research_validation_and_empirical_evaluation_design.md)
- **RBDL Framework Specification:** [`research_validation/rbdl_framework.md`](./research_validation/rbdl_framework.md)
