# DigiMitra (डिजीमित्र)

> **An AI-Assisted Digital Consultant Framework for Requirement-Based Digitalization of Small and Medium Local Enterprises in India**

---

## 🌟 Overview

**DigiMitra** is an enterprise-grade digital consultant framework designed to assess the digital readiness of Micro, Small, and Medium Enterprises (MSMEs) in India. It classifies businesses into **Requirement-Based Digitalization Levels (RBDL Levels 0 to 3)** and generates personalized, cost-effective, phased transformation roadmaps.

### 🏛️ Core Architecture Principles
- **Modular Monolith:** Strict internal module boundaries allowing future extraction without rewrites.
- **Pure Domain Isolation:** Pure Python business logic in `app/domain/` with zero direct coupling to HTTP or SQL sessions.
- **Strategy-Pattern Classification:** Unified `ClassifierStrategy` interface supporting Rule-Based evaluation for MVP and Machine Learning classifiers for later research phases.
- **Append-Only Audit Trails:** Every assessment and rule evaluation trace is stored immutably with timestamps for research reproducibility and DPDP Act compliance.
- **Bilingual Support (i18n):** Native support for English and Hindi (हिन्दी) across UI, question banks, and recommendations.

---

## 🗂️ Project Structure

```
digimitra/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entry point
│   │   ├── config.py                   # Pydantic Settings environment configuration
│   │   ├── dependencies.py             # Shared FastAPI dependencies (auth, db, i18n)
│   │   ├── api/v1/                     # Versioned REST API routers & endpoints
│   │   │   ├── endpoints/
│   │   │   │   ├── health.py           # Real-time health check & DB diagnostics
│   │   │   │   ├── auth.py             # User registration & JWT authentication
│   │   │   │   ├── businesses.py       # MSME profile management
│   │   │   │   └── domain_routers.py   # Assessments, rules, roadmap endpoints
│   │   ├── core/                       # Security, logging, custom exceptions, i18n
│   │   ├── domain/                     # Pure business logic (RBDL levels, rule parser)
│   │   ├── models/                     # SQLAlchemy 2.0 async ORM models
│   │   ├── repositories/               # Repository pattern database access
│   │   └── schemas/                    # Pydantic v2 request/response DTOs
│   ├── alembic/                        # Async database migrations
│   ├── locales/                        # Translation catalogs (en, hi)
│   ├── tests/                          # Pytest unit and integration test suite
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/                        # Typed Axios API client & endpoints
│   │   ├── components/                 # Navbar, Footer, HealthCard, StatusBadge, etc.
│   │   ├── pages/                      # Dashboard, Business Registration, Placeholders
│   │   ├── locales/                    # react-i18next English and Hindi namespaces
│   │   ├── types/                      # TypeScript schemas mirroring backend
│   │   ├── App.tsx                     # Main router and QueryClient setup
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── data/
│   ├── question_bank/                  # Declarative question bank seed data (JSON)
│   ├── rules/                          # Declarative rule definitions seed data (JSON)
│   └── research_datasets/              # Anonymized research dataset exports
│
├── docs/                               # System architecture & RBDL framework specs
├── infra/                              # Docker Compose for local dev & production
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Python 3.11+** (Python 3.14 verified)
- **Node.js 18+** (Node.js v20+ recommended)
- **Git**
- *(Optional)* **Docker & Docker Compose**

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (optional)
py -m venv .venv
# On Windows: .venv\Scripts\activate
# On Linux/macOS: source .venv/bin/activate

# Install dependencies
py -m pip install -r requirements.txt

# Start the FastAPI development server
py -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at:
- **API Base:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/api/v1/docs`
- **ReDoc Documentation:** `http://localhost:8000/api/v1/redoc`
- **Health Check Endpoint:** `http://localhost:8000/api/v1/health`

---

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

### Run Backend Pytest Suite
```bash
py -m pytest backend/tests
```
*Current test coverage includes unit tests for configuration, RBDL definitions, safe rule condition parser, JWT security, and integration tests for `/api/v1/health`, user registration, and business creation.*

### Build Frontend
```bash
cd frontend
npm run build
```

---

## 🐳 Running with Docker Compose

For a complete containerized environment including **FastAPI backend, React frontend, MySQL 8.0, and Adminer DB UI**:

```bash
# From workspace root
docker compose -f infra/docker-compose.yml up --build
```

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8000`
- **Adminer DB Manager:** `http://localhost:8080` (System: MySQL, Server: `mysql`, User: `digimitra_user`, Pass: `digimitra_secret_pass`, Database: `digimitra_db`)

---

## 📊 RBDL Maturity Model

| Stage | Name | Key Criteria |
|---|---|---|
| **Level 0** | Non-Digital / Traditional | Paper ledgers, cash-only transactions, no web presence. |
| **Level 1** | Basic Digital Presence & Payments | QR/UPI payments, WhatsApp Business, Google Maps presence. |
| **Level 2** | Operational Digitalization | Computerized accounting (Vyapar/Tally), inventory management. |
| **Level 3** | Integrated Digital Enterprise | Cloud ERP/CRM, multi-channel selling, automated analytics. |

---

## 🔒 Security & Privacy (DPDP Act Compliance)
- Password hashing using modern bcrypt with unique salts.
- Short-lived JWT access tokens and long-lived refresh tokens.
- Parameterized SQL queries via SQLAlchemy 2.0 async engine.
- Safe structured rule condition evaluation without Python `eval()` or `exec()`.
- Anonymized research dataset exports with immutable trace hashes.
