# REST API Specification & Endpoint Contracts — DigiMitra (डिजीमित्र)

> **Base URL:** `http://localhost:8000/api/v1` (or local configured port)  
> **Interactive Swagger UI:** `/api/v1/docs`  
> **ReDoc Specification:** `/api/v1/redoc`  
> **Protocol:** HTTP/1.1 JSON (RESTful)  

---

## 1. Authentication & Headers

All protected endpoints require the standard HTTP `Authorization` header containing a valid Bearer JWT:

```http
Authorization: Bearer <jwt_access_token>
Accept-Language: en  # or 'hi' for Hindi responses
Content-Type: application/json
```

---

## 2. API Endpoint Catalog

### 2.1 System Diagnostics & Health

#### `GET /api/v1/health`
Checks overall application health, active database latency, i18n support, and classification strategy status.
- **Access:** Public
- **Sample 200 OK Response:**
```json
{
  "status": "healthy",
  "app_name": "DigiMitra API",
  "version": "0.1.0",
  "environment": "development",
  "components": {
    "database": {
      "status": "healthy",
      "details": { "dialect": "mysql+aiomysql", "latency_ms": 1.2, "connected": true }
    },
    "classification_engine": {
      "status": "healthy",
      "details": { "strategy": "rule_based", "active_version": "1.0" }
    }
  }
}
```

---

### 2.2 Authentication & User Profiles

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new MSME user account | Public |
| `POST` | `/api/v1/auth/login` | Authenticate with email/password, returns JWT | Public |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile and roles | Protected |

#### Sample Request: `POST /api/v1/auth/register`
```json
{
  "email": "owner@kirana.in",
  "password": "SecurePassword123!",
  "full_name": "Ramesh Kumar",
  "phone": "+919876543210"
}
```

---

### 2.3 Business Profile Management

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/businesses` | Register enterprise profile (sector, turnover, location) | Protected |
| `GET` | `/api/v1/businesses` | List all businesses owned by user | Protected |
| `GET` | `/api/v1/businesses/{id}`| Retrieve specific business profile | Protected |
| `PUT` | `/api/v1/businesses/{id}`| Update business metadata | Protected |

---

### 2.4 Digital Readiness Assessment

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/assessments/questions` | Fetch 9-dimension question bank (localized EN/HI) | Protected |
| `POST` | `/api/v1/assessments/start` | Initialize a new assessment session for a business | Protected |
| `POST` | `/api/v1/assessments/{id}/submit` | Submit answers, calculate scores, and assign RBDL | Protected |
| `GET` | `/api/v1/assessments/{id}` | Fetch completed assessment results & dimension breakdown | Protected |

#### Sample Response: `POST /api/v1/assessments/{id}/submit`
```json
{
  "assessment_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "overall_score": 58.4,
  "assigned_rbdl_level": "Level 1",
  "dimension_scores": {
    "finance": 65.0,
    "operations": 40.0,
    "sales_marketing": 70.0,
    "cyber_security": 30.0
  },
  "created_at": "2026-10-20T10:00:00Z"
}
```

---

### 2.5 Phased Roadmap & Government Initiatives

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/recommendations/roadmap/{id}` | Retrieve generated 3-phase action roadmap | Protected |
| `PATCH`| `/api/v1/recommendations/tasks/{id}` | Toggle milestone task completion status | Protected |
| `GET` | `/api/v1/government/initiatives` | List curated central/state MSME schemes with eligibility | Protected |
| `GET` | `/api/v1/learning/flashcards` | Fetch interactive digitalization flashcards by dimension | Protected |

---

## 3. Standardized Error Format (RFC 7807)

All non-2xx responses adhere to structured Problem Details format:

```json
{
  "error_code": "RESOURCE_NOT_FOUND",
  "message": "Business with ID '9b1deb4d...' was not found.",
  "status_code": 404,
  "details": {},
  "timestamp": "2026-10-20T10:05:00Z"
}
```
