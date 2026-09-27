# DigiMitra API Reference

All API endpoints are versioned under `/api/v1/` and serve JSON payloads.
When running locally, interactive OpenAPI Swagger documentation is available at:
- **Swagger UI:** `http://localhost:8000/api/v1/docs`
- **ReDoc UI:** `http://localhost:8000/api/v1/redoc`
- **OpenAPI Schema:** `http://localhost:8000/api/v1/openapi.json`

## Key Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API Welcome and discovery links |
| `GET` | `/api/v1/health` | Comprehensive health check with DB latency & uptime |
| `POST` | `/api/v1/auth/register` | Register new user account |
| `POST` | `/api/v1/auth/login` | Login and obtain JWT tokens |
| `POST` | `/api/v1/businesses` | Register an MSME business profile |
| `GET` | `/api/v1/businesses/{id}` | Fetch business profile by ID |
| `GET` | `/api/v1/assessments/questions` | Fetch active digital readiness question bank |
| `POST` | `/api/v1/assessments/{id}/submit`| Submit assessment responses |
| `GET` | `/api/v1/classification/{id}` | Get classification results and evidence trace |
| `GET` | `/api/v1/recommendations/{id}` | Get prioritized recommendations for business |
| `GET` | `/api/v1/roadmap/{id}` | Get digital transformation roadmap |
| `GET` | `/api/v1/admin/rules` | Admin rule management endpoint |
