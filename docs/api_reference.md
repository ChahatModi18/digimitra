# DigiMitra — Comprehensive API Reference

All API endpoints are versioned under `/api/v1/` and return standardized JSON payloads adhering to the DigiMitra response envelope format.

When running locally, interactive OpenAPI Swagger and ReDoc documentation is available at:
- **Swagger UI:** `http://localhost:8000/api/v1/docs`
- **ReDoc UI:** `http://localhost:8000/api/v1/redoc`
- **OpenAPI JSON Schema:** `http://localhost:8000/api/v1/openapi.json`

---

## 1. System & Health

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | API Welcome and discovery links. |
| `GET` | `/api/v1/health` | Public | Diagnostic health check with MySQL latency, uptime, and catalog version. |

---

## 2. Authentication & Account Management

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register a new user account (`business_owner`, `consultant`, `researcher`, `admin`). |
| `POST` | `/api/v1/auth/login` | Public | Login with email and password to receive JWT access and refresh tokens. |
| `POST` | `/api/v1/auth/refresh` | Public | Refresh an expired access token using a valid refresh token. |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve current authenticated user profile and roles. |

---

## 3. MSME Enterprise Management

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/businesses` | Authenticated | Register a new MSME enterprise (name, sector, size, state, city, turnover). |
| `GET` | `/api/v1/businesses` | Authenticated | List all enterprises owned by or accessible to the current user. |
| `GET` | `/api/v1/businesses/{id}` | Authenticated | Retrieve complete enterprise profile by ID. |
| `PUT` | `/api/v1/businesses/{id}` | Authenticated | Update enterprise profile details. |

---

## 4. Digital Assessment & Questionnaire (RBDL)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/assessments` | Authenticated | Start a new assessment session for an enterprise. Accepts optional `previous_assessment_id` for reassessment linking. |
| `GET` | `/api/v1/assessments/{id}/questions` | Authenticated | Fetch the 14-question canonical question bank in English and Hindi. |
| `PUT` | `/api/v1/assessments/{id}/answers` | Authenticated | Save answers (single choice, boolean, multi-choice) for an active assessment. |
| `POST` | `/api/v1/assessments/{id}/submit` | Authenticated | Finalize and submit assessment. Executes deterministic scoring, certainty evaluation, contradiction checks, and RBDL classification. |
| `GET` | `/api/v1/assessments/{id}/result` | Authenticated | Retrieve complete assessment result (RBDL level, dimension scores, gating traces). |
| `GET` | `/api/v1/assessments/business/{id}/history` | Authenticated | Retrieve chronological history of all completed assessments for an enterprise. |
| `GET` | `/api/v1/assessments/business/{id}/compare` | Authenticated | Multi-dimensional comparative evaluation between two assessment sessions with ethical disclaimers. |

---

## 5. Prioritized Recommendations & Phased Roadmap

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/recommendations/business/{id}` | Authenticated | Fetch prioritized, explainable digital recommendations for an enterprise. |
| `GET` | `/api/v1/roadmap/business/{id}` | Authenticated | Retrieve active phased digital transformation roadmap (Quick Wins, Foundation, Expansion). |
| `GET` | `/api/v1/roadmap/business/{id}/history` | Authenticated | Retrieve historical roadmap versions (active vs superseded). |
| `GET` | `/api/v1/roadmap/business/{id}/progress` | Authenticated | Fetch real-time roadmap task progress summary and completion percentage. |
| `PATCH` | `/api/v1/roadmap/tasks/{task_id}/status` | Authenticated | Update task status (`pending`, `in_progress`, `completed`, `skipped`) with timestamp recording. |

---

## 6. Research & ML Classification Pipeline (C5 / A7)

*Restricted strictly to `admin` and `researcher` roles. Structurally isolated from production write paths.*

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/research/ml/dataset-summary` | Admin, Researcher | Inspect empirical dataset volume, class distributions, and CV feasibility. Supports `?stage=1` (rule distillation) or `?stage=2` (consultant-corrected). |
| `POST` | `/api/v1/research/ml/train` | Admin, Researcher | Attempt research ML model training. Enforces real-data readiness gate (returns explanation if data is insufficient; prevents forced training). |

---

## 7. Administrative Rules & Diagnostic Tools

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/rules` | Admin | Inspect active RBDL classification rules, gating thresholds, and conditions. |
