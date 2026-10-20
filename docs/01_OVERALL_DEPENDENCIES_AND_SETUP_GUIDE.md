# 01. DigiMitra — Overall Dependencies & Multi-Technology Setup Guide

> **Official Dependencies Specification & Installation Manual**  
> **Project:** DigiMitra (डिजीमित्र) — AI Digital Consultant for Indian MSMEs  
> **Target Environments:** Windows (PowerShell / Command Prompt), Linux (Ubuntu / Debian), macOS  
> **Author/Maintainer:** DigiMitra Core Engineering Team  

---

## 1. Technology Ecosystem Overview

DigiMitra is built upon a modern, high-performance, asynchronous multi-tier architecture. The diagram below illustrates the interplay between all core technologies and runtime environments:

```mermaid
graph TD
    User([MSME Owner / Consultant]) -->|HTTP / HTTPS| Browser[Modern Web Browser]
    Browser -->|Port 5173| Frontend[Vite + React 18 + TypeScript + Tailwind CSS]
    Frontend -->|Axios REST / JSON| Backend[FastAPI + Python 3.11/3.12 ASGI Server]
    
    subgraph Backend_Ecosystem[Backend & AI Services (Port 8000)]
        Backend --> Routing[APIRouter v1]
        Routing --> AuthSvc[JWT & Bcrypt Security]
        Routing --> ScoringEngine[Deterministic 9-Dimension Scoring]
        Routing --> MLEngine[Scikit-Learn ML Hybrid Recommendation]
        Routing --> RoadmapGen[3-Phase Dynamic Roadmap Generator]
        Routing --> GovtSchemes[Verified Govt Initiatives Catalog]
        
        ScoringEngine --> ORM[SQLAlchemy 2.0 Async]
        MLEngine --> ORM
        RoadmapGen --> ORM
        ORM --> DB[(MySQL 8.0+ / SQLite 3 Fallback)]
    end

    subgraph Testing_QA[Automated QA Suite]
        Frontend --> Vitest[Vitest + React Testing Library]
        Backend --> Pytest[Pytest + Asyncio + Coverage]
        E2E[Playwright Browser Automation] --> Browser
    end
```

---

## 2. Runtime & System Prerequisites

Before installing project dependencies, verify that your machine has the required system-level runtimes installed:

| Component | Minimum Version | Recommended Version | Verification Command | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Python** | `3.11.0` | `3.11.8` or `3.12.x` | `python --version` | Backend REST API, ML pipeline, synthetic data generation |
| **Node.js** | `18.18.0` | `20.11.0 LTS` | `node --version` | Frontend build tools, Vite dev server, TypeScript runtime |
| **npm** | `9.0.0` | `10.2.0+` | `npm --version` | Node package manager for frontend dependencies |
| **Database** | SQLite 3 or MySQL 8.0+ | MySQL 8.0.35+ | `mysql --version` | Relational persistence with async driver support |
| **Git** | `2.34.0` | Latest | `git --version` | Version control & repository tracking |
| **Docker** *(Optional)* | `24.0.0` | Latest Docker Desktop | `docker --version` | Containerized deployment & orchestration |

---

## 3. Backend Dependencies (Python / FastAPI / ML)

All backend dependencies are defined in `backend/requirements.txt` and `backend/pyproject.toml`.

### 3.1 Production Runtime Dependencies

| Package Name | Minimum Version | Category | Detailed Description & Architectural Role |
| :--- | :--- | :--- | :--- |
| **`fastapi`** | `>=0.110.0` | Web Framework | Modern, high-performance ASGI web framework for building REST APIs with auto OpenAPI/Swagger docs. |
| **`uvicorn[standard]`** | `>=0.28.0` | ASGI Server | Lightning-fast ASGI web server implementation using `uvloop` and `httptools` for concurrency. |
| **`pydantic`** | `>=2.6.0` | Data Validation | Core data validation and settings management using Python type hints, powering strict API contracts. |
| **`pydantic-settings`**| `>=2.2.0` | Configuration | Hierarchical environment variable configuration with automatic type casting from `.env` files. |
| **`email-validator`** | `>=2.1.0` | Validation | Validates standard RFC email syntax for business user registrations and contact forms. |
| **`sqlalchemy`** | `>=2.0.28` | ORM | SQLAlchemy 2.0 async ORM for robust relational modeling, connection pooling, and SQL abstraction. |
| **`alembic`** | `>=1.13.1` | DB Migrations | Database schema migration tool configured for automated, versioned schema upgrades. |
| **`greenlet`** | `>=3.0.0` | Async Engine | Required by SQLAlchemy's async engine for coroutine bridging during database operations. |
| **`aiomysql`** | `>=0.2.0` | DB Driver | Async MySQL driver based on PyMySQL for non-blocking I/O queries under high concurrent loads. |
| **`asyncmy`** | `>=0.2.9` | DB Driver | High-speed native async MySQL driver written in Cython. |
| **`aiosqlite`** | `>=0.20.0` | DB Driver | Async SQLite driver providing zero-configuration offline fallback if MySQL is unavailable. |
| **`cryptography`** | `>=42.0.0` | Security | Low-level cryptographic primitives used by MySQL connection handshakes and password hashing. |
| **`PyJWT`** | `>=2.8.0` | Authentication | Encodes and decodes JSON Web Tokens (JWT) for stateless bearer authentication and session tokens. |
| **`bcrypt`** | `>=4.0.1` | Security | Enterprise-grade password hashing algorithm using salted blowfish to prevent rainbow table attacks. |
| **`python-multipart`** | `>=0.0.9` | Parser | Streaming multipart/form-data parser for file uploads and OAuth2 password request forms. |
| **`httpx`** | `>=0.27.0` | HTTP Client | Next-generation asynchronous HTTP client used for inter-service communication and webhook calls. |
| **`python-dotenv`** | `>=1.0.1` | Environment | Reads key-value pairs from `.env` file and adds them to environment variables. |

### 3.2 Machine Learning & Data Science Dependencies

| Package Name | Minimum Version | Category | Detailed Description & Architectural Role |
| :--- | :--- | :--- | :--- |
| **`scikit-learn`** | `>=1.5.0, <1.6.0` | Machine Learning | Implements Multi-Output Regression, Random Forest, and Gradient Boosting algorithms for priority scoring. |
| **`pandas`** | `>=2.2.0, <3.0.0` | Data Analysis | DataFrame manipulation, CSV ingestion, synthetic MSME dataset generation, and audit aggregations. |
| **`numpy`** | `>=1.26.0, <2.0.0` | Numerical Compute | High-performance N-dimensional array processing, matrix algebra, and vector calculations for scoring. |
| **`scipy`** | `>=1.13.0` | Scientific Compute | Statistical functions, probability distributions, and correlation tests for academic validation. |
| **`joblib`** | `>=1.4.0` | Serialization | High-performance model serialization and disk caching for trained scikit-learn model pipelines (`.joblib`). |

### 3.3 Backend Testing & Code Quality Dependencies

| Package Name | Minimum Version | Category | Detailed Description & Architectural Role |
| :--- | :--- | :--- | :--- |
| **`pytest`** | `>=8.0.0` | Testing | Core test runner and assertion framework for executing unit and integration test suites. |
| **`pytest-asyncio`** | `>=0.23.5` | Testing | Async test execution plugin enabling native `async def test_*` coroutines with FastAPI test clients. |
| **`pytest-cov`** | `>=4.1.0` | Testing | Code coverage reporting generating terminal summaries and HTML coverage matrices. |

---

## 4. Frontend Dependencies (React / Vite / TypeScript)

All frontend dependencies are defined in `frontend/package.json`.

### 4.1 Production UI & Runtime Dependencies

| Package Name | Version | Category | Detailed Description & Architectural Role |
| :--- | :--- | :--- | :--- |
| **`react`** | `^18.2.0` | UI Library | Core declarative UI library utilizing Virtual DOM, concurrent rendering, and hooks. |
| **`react-dom`** | `^18.2.0` | DOM Renderer | Entry point to DOM and server rendering for React components. |
| **`react-router-dom`** | `^6.22.3` | Routing | Client-side declarative routing, history navigation, URL parameters, and nested layouts. |
| **`@tanstack/react-query`** | `^5.28.4` | State & Cache | Powerful asynchronous state management, smart background caching, auto-refetching, and mutations. |
| **`axios`** | `^1.6.8` | HTTP Client | Promise-based HTTP client with interceptors for JWT bearer injection and standardized error handling. |
| **`lucide-react`** | `^0.359.0` | Iconography | Modern, lightweight, customizable SVG icon library tailored for enterprise dashboards. |
| **`i18next`** | `^23.10.1` | Internationalization | Comprehensive internationalization framework providing translation key management and interpolation. |
| **`react-i18next`** | `^14.1.0` | i18n React Bindings | React hooks (`useTranslation`) and components for instantaneous English/Hindi language toggling. |
| **`i18next-browser-languagedetector`** | `^7.2.0` | i18n Detector | Automatically detects browser language preferences and persists selections in localStorage. |
| **`clsx`** | `^2.1.0` | Utility | Ultra-lightweight utility for conditionally constructing `className` strings. |
| **`tailwind-merge`** | `^2.2.2` | CSS Utility | Intelligently merges Tailwind CSS classes in JS without style conflict issues. |

### 4.2 Frontend Development & Testing Dependencies

| Package Name | Version | Category | Detailed Description & Architectural Role |
| :--- | :--- | :--- | :--- |
| **`vite`** | `^5.1.6` | Build Tool & Bundler | Next-generation lightning-fast frontend dev server and Rollup production bundler. |
| **`typescript`** | `^5.2.2` | Language | Strongly typed superset of JavaScript enforcing strict compile-time type safety. |
| **`tailwindcss`** | `^3.4.1` | Styling | Utility-first CSS framework configured with custom Bharat Saffron theme tokens and glassmorphism. |
| **`postcss`** | `^8.4.38` | CSS Processor | Tool for transforming styles with JS plugins required by Tailwind. |
| **`autoprefixer`** | `^10.4.19` | CSS Processor | Automatically parses CSS and adds vendor prefixes using Can I Use rules. |
| **`vitest`** | `^1.6.0` | Test Runner | Blazing-fast Vite-native unit test runner supporting Jest-compatible APIs. |
| **`jsdom`** | `^30.1.1` | Test Environment | Pure-JavaScript implementation of web standards for testing DOM components in Node. |
| **`@testing-library/react`** | `^16.3.3` | Test Library | Simple and complete React DOM testing utilities encouraging user-centric test practices. |
| **`@testing-library/jest-dom`**| `^7.0.1` | Test Matchers | Custom Jest/Vitest matchers to test the state of the DOM (e.g. `toBeInTheDocument`). |
| **`@testing-library/user-event`**| `^14.6.7` | Test Utility | Simulates real user interactions (click, type, hover) with realistic event dispatching. |
| **`@vitejs/plugin-react`** | `^4.2.1` | Vite Plugin | Provides Fast Refresh (HMR) and automatic JSX runtime compilation. |
| **`@types/react`** | `^18.2.66` | Type Definitions | TypeScript declarations for React. |
| **`@types/react-dom`** | `^18.2.22` | Type Definitions | TypeScript declarations for React DOM. |
| **`@types/node`** | `^20.11.30` | Type Definitions | TypeScript declarations for Node.js standard library. |

---

## 5. Step-by-Step Installation & Setup Commands

### 5.1 Step 1: Open the Project Directory

Open your terminal or PowerShell inside the project root:
```bash
cd "c:\Users\Lenovo\Desktop\MAJOR PROJECT DOCUMENTATION"
```

---

### 5.2 Step 2: Backend Virtual Environment & Dependency Installation

#### Windows (PowerShell):
```powershell
# 1. Navigate to backend directory
cd backend

# 2. Create Python virtual environment (if not already created)
python -m venv .venv

# 3. Activate the virtual environment
.\.venv\Scripts\Activate.ps1
# (If execution policy error occurs, run: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass)

# 4. Upgrade pip and build tools
python -m pip install --upgrade pip setuptools wheel

# 5. Install all backend production, ML, and testing dependencies
pip install -r requirements.txt

# 6. Verify installation
python -c "import fastapi, sqlalchemy, sklearn, pandas, numpy; print('✓ All Backend & ML Dependencies Verified Successfully!')"
```

#### Linux / macOS:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
python -c "import fastapi, sqlalchemy, sklearn, pandas, numpy; print('✓ All Backend & ML Dependencies Verified Successfully!')"
```

---

### 5.3 Step 3: Frontend Dependency Installation

#### In a separate terminal / PowerShell window:
```powershell
# 1. Navigate to frontend directory
cd "c:\Users\Lenovo\Desktop\MAJOR PROJECT DOCUMENTATION\frontend"

# 2. Install all npm dependencies (clean install)
npm install

# 3. Verify TypeScript build and compilation
npm run build
```

---

### 5.4 Step 4: Environment Variables Configuration

#### Backend `.env` (`backend/.env`):
Create or verify `backend/.env` with the following configuration:
```env
# Application Settings
ENVIRONMENT=development
DEBUG=True
APP_NAME="DigiMitra Backend"
API_V1_STR=/api/v1
SECRET_KEY=super-secret-key-change-in-production-digimitra-2026

# Database Connection (Default SQLite for instant setup; or MySQL 8.0)
# SQLite fallback:
DATABASE_URL=sqlite+aiosqlite:///../digimitra.db
# Or MySQL (production):
# DATABASE_URL=mysql+aiomysql://root:password@localhost:3306/digimitra

# CORS Allowed Origins
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:3000"]

# Language & Internationalization
DEFAULT_LOCALE=en
SUPPORTED_LOCALES=["en","hi"]
```

#### Frontend `.env` (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_DEFAULT_LANGUAGE=en
VITE_ENABLE_RESEARCH_MODE=true
```

---

### 5.5 Step 5: Database Initialization & Seeding

Run the database setup script to create tables and seed default MSME enterprises:
```powershell
# Inside backend directory with active virtual environment:
cd "c:\Users\Lenovo\Desktop\MAJOR PROJECT DOCUMENTATION\backend"

# Run schema migrations (if using Alembic)
python -m alembic upgrade head

# Run seed script to populate sample enterprises, 9-dimension question bank, and verified schemes
python -m scripts.setup_mysql
```

---

### 5.6 Step 6: Running the Servers Concurrently

#### Start Backend Server:
```powershell
cd "c:\Users\Lenovo\Desktop\MAJOR PROJECT DOCUMENTATION\backend"
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Root: `http://localhost:8000`
- Interactive API Swagger Docs: `http://localhost:8000/docs`
- Health Endpoint: `http://localhost:8000/api/v1/health`

#### Start Frontend Dev Server:
```powershell
cd "c:\Users\Lenovo\Desktop\MAJOR PROJECT DOCUMENTATION\frontend"
npm run dev -- --host 0.0.0.0 --port 5173
```
- Web Application: `http://localhost:5173`

---

## 6. Verification Checklist

Execute these quick commands to ensure 100% operational health across all subsystems:

| Check | Command | Expected Output | Status |
| :--- | :--- | :--- | :--- |
| **Backend Health** | `curl http://localhost:8000/api/v1/health` | `{"status":"ok","database":"connected",...}` | Pass |
| **Frontend Production Build** | `cd frontend && npm run build` | `✓ built in X.XXs` with 0 TypeScript errors | Pass |
| **Frontend Tests** | `cd frontend && npm run test:run` | All unit & component test suites passing | Pass |
| **Backend Tests** | `cd backend && pytest tests/` | All unit & integration tests passing | Pass |
| **ML Models Loaded** | Verify startup logs in uvicorn | `ML Model Loaded: RandomForestRegressor` | Pass |

---

## 7. Troubleshooting Common Installation Issues

### 1. `execution of scripts is disabled on this system` (PowerShell)
- **Cause:** Windows PowerShell default execution policy blocks activating `.venv`.
- **Solution:** Run in PowerShell as administrator:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```
  Or activate using bypass:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\.venv\Scripts\Activate.ps1
  ```

### 2. `Cannot find module` or `node_modules` corrupted
- **Solution:** Clean install node modules:
  ```powershell
  cd frontend
  Remove-Item -Recurse -Force node_modules, package-lock.json
  npm install
  ```

### 3. `greenlet` or C++ compiler error during `pip install`
- **Solution:** Ensure you are using official pre-compiled wheels:
  ```powershell
  pip install --only-binary :all: greenlet sqlalchemy
  ```

### 4. `Port 8000` or `Port 5173` already in use
- **Solution:** Find and terminate the blocking process on Windows:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
  ```
