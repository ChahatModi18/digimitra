# DigiMitra (डिजीमित्र) — Master Documentation Suite (`DIGIMITRA_DOCS`)

> **Project:** DigiMitra — An AI-Assisted Digital Consultant Framework for Requirement-Based Digitalization of Small and Medium Local Enterprises in India  
> **Repository:** [https://github.com/ChahatModi18/digimitra.git](https://github.com/ChahatModi18/digimitra.git)  

---

## 📚 Complete Documentation Index

This directory (`DIGIMITRA_DOCS/`) serves as the comprehensive, unified technical documentation center for the DigiMitra project. Every file is tailored specifically to the architecture, codebase, and deployment requirements of the platform:

| Document | Primary Focus | Key Highlights |
| :--- | :--- | :--- |
| **[PRD.md](PRD.md)** | Product Requirements Document | Problem statement, user personas, RBDL levels 0–3, functional & non-functional requirements. |
| **[DESIGN.md](DESIGN.md)** | UI/UX Design System | Bharat Digital Theme, saffron/terracotta palette, dual-script typography (Inter + Devanagari), component hierarchy. |
| **[ARCHITECTURE.md](ARCHITECTURE.md)** | System Architecture & Topology | Clean Architecture Modular Monolith, FastAPI ASGI, React 18 SPA, domain isolation, sequence diagrams. |
| **[DATABASE.md](DATABASE.md)** | Schema & Entity Relationships | MySQL & SQLite async specs, ER diagram, tables (`users`, `businesses`, `assessments`, `roadmaps`), Alembic migrations. |
| **[API.md](API.md)** | REST API Endpoint Contracts | Endpoint catalog, Swagger `/api/v1/docs`, JWT authentication headers, request/response DTOs, RFC 7807 error format. |
| **[PROJECT_IMPLEMENTATION.md](PROJECT_IMPLEMENTATION.md)** | Pagewise Technical Report | Codebase walkthrough, `pages/` implementation, scoring engine, recommendation fusion service. |
| **[SETUP.md](SETUP.md)** | Environment Setup & Installation | Prerequisites, Python virtual environment, Node dependencies, `.env` config, running servers, Docker compose. |
| **[FEATURE_DEVELOPMENT.md](FEATURE_DEVELOPMENT.md)** | Core Features & Capabilities | 9-dimension assessment, RBDL 0–3 maturity framework, phased roadmap generator, MSME schemes, bilingual i18n. |
| **[AUTHENTICATION_AND_SECURITY.md](AUTHENTICATION_AND_SECURITY.md)** | Security, Auth & DPDP Compliance | JWT Bearer tokens, bcrypt hashing, RBAC, AST safe condition parser (zero `eval`), DPDP Act 2023 compliance. |
| **[MCP_CONNECTION.md](MCP_CONNECTION.md)** | Model Context Protocol (MCP) | MCP server config, exposed tools/resources, IDE sidecars, AI digital consultant prompt grounding. |
| **[INTEGRATIONS.md](INTEGRATIONS.md)** | External System Integrations | LLM providers (Gemini, Groq, OpenAI), Government of India MSME portals (Udyam, Samadhaan, ZED), ONDC, payments. |
| **[TESTING_AND_QA.md](TESTING_AND_QA.md)** | Testing & Quality Assurance | Pytest backend suite, Vitest frontend tests, E2E flows, CI quality gates, coverage requirements. |
| **[DEBUGGING.md](DEBUGGING.md)** | Troubleshooting & Debugging | Resolving port collisions, MySQL connectivity & SQLite fallback, CORS misconfigurations, JWT token renewal. |

---

## 🚀 Quick Start
To launch the complete application locally:
1. Follow the **[SETUP.md](SETUP.md)** instructions.
2. Review the API endpoints in **[API.md](API.md)** via [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs).
3. Check the design guidelines in **[DESIGN.md](DESIGN.md)**.
