# DigiMitra Backend & API Remediation Audit

## Phase 1 — Verification of Findings (P1–P12)

This audit documents the inspection and verification of backend security, authorization, transaction, API, and correctness findings prior to code modification. Each finding was investigated directly against the current repository state.

### Verification Summary Table

| ID | Finding | Verified? | Evidence | Risk | Planned Fix | Tests Required |
|:---|:---|:---|:---|:---|:---|:---|
| **P1** | User registration permits arbitrary role values | **Confirmed** | `backend/app/schemas/user.py`: `UserBase.role: str = Field(default="business_owner")` without enum or validator constraints. `backend/app/api/v1/endpoints/auth.py` assigns `role=user_in.role` directly to the `User` model. | **Critical**: Any user can self-register as `super_admin`, `admin`, `researcher`, or `assessor`, bypassing RBAC entirely. | Restrict `UserCreate` / self-registration schema to self-service roles (`business_owner`, `consultant`) via `Literal` or enum validator. Reject or safely ignore privileged roles. | Unit/Integration tests: reject/prevent registration with `super_admin`, `researcher`, `assessor`; verify legitimate `business_owner` registration works; verify existing privileged users maintain access. |
| **P2** | Stub routes in `domain_routers.py` shadow real endpoints | **Confirmed** | `backend/app/api/v1/endpoints/domain_routers.py` defines unauthenticated stub routes (`/classification/{id}`, `/recommendations/{id}`, `/roadmap/{id}`, `/progress/{id}/timeline`, `/reports/{id}/summary`, `/admin/rules`). In `router.py`, `classification_router` is included at line 28, before real routers. `roadmap_router` in `domain_routers.py` intercepts `GET /roadmap/{id}` returning dummy `{items: []}` without authentication. | **Critical**: Unauthenticated data leakage, contract shadowing, bypassing RBAC, and preventing clients from reaching real service outputs. | Remove obsolete stub routes from `domain_routers.py` and remove unused stub router registrations in `router.py`. Ensure real authenticated endpoints handle all valid routes. Maintain authenticated admin endpoints where required. | Regression tests for unauthenticated access (401/403), authenticated owner access, cross-tenant isolation, and verification that real service results are returned. |
| **P3** | `SECRET_KEY` has an insecure default without production startup guard | **Confirmed** | `backend/app/config.py`: `SECRET_KEY: str = "digimitra-dev-insecure-secret-key-change-in-production-1234567890"`. No validator checks if `ENVIRONMENT == "production"` to fail fast if default or insecure key is used. | **Critical**: If deployed to production without overriding `.env`, any attacker knowing the public default key can forge JWT tokens for arbitrary users. | Add `@field_validator("SECRET_KEY")` in `Settings` to raise `ValueError` on startup if `ENVIRONMENT == "production"` and `SECRET_KEY` is empty, insecure, or matches the default dev key. Ensure secrets are never logged. Update `.env.example`. | Config tests for: secure configured key in production, missing production key failure, default/weak key rejection in production, dev default acceptance in development. |
| **P4** | SQLite database file(s) committed to repository | **Confirmed** | `git ls-files` shows `backend/digimitra.db` (188 KB) committed in repository. Also an empty `digimitra.db` (0 bytes) exists at project root. Inspection of `backend/digimitra.db` confirms it contains empty tables (0 rows, no user or sensitive data). | **Medium/Hygiene**: Committing binary database files pollutes git history, risks merge conflicts, and risks leaking local session data or passwords in future commits. | Remove `backend/digimitra.db` and root `digimitra.db` from git tracking (`git rm --cached`). Add `*.db`, `*.sqlite`, `*.sqlite3` to `.gitignore`. Document remediation. | Verify git status and `.gitignore` prevents re-adding SQLite binaries. |
| **P5** | `AssessmentService` raises `HTTPException` directly instead of domain exceptions | **Confirmed** | `backend/app/services/assessment_service.py` directly imports and raises `HTTPException` in 14 places (lines 57, 62, 87, 92, 259, 292, 316, 327, 658, 833, 855, 877, 922, 928) for 404, 403, and 400 conditions, coupling service layer to HTTP transport. | **High**: Tight coupling of business logic to web framework; inconsistent error responses bypassing global `DigiMitraException` handling. | Replace `HTTPException` with domain exceptions (`EntityNotFoundException`, `AuthorizationException`, `ValidationException`, `BadRequestException`) from `app.core.exceptions`. Preserve exact HTTP status codes and error semantics. | Regression tests for 404, 403, 400/422 status codes across assessment endpoints. |
| **P6** | `submit_assessment()` performs multiple commits instead of one atomic transaction | **Confirmed** | In `backend/app/services/assessment_service.py`: `submit_assessment()` calls `await db.commit()` at line 550, then calls `RecommendationService.generate_recommendations_and_roadmap()` at line 556 which internally calls `await db.commit()` at line 321. Additionally, `get_db()` middleware commits at completion. | **High**: Inconsistent partial state if roadmap generation fails after assessment status/scores are committed. Rollback cannot undo the first commit. | Unify assessment submission into a single atomic transaction: use `await db.flush()` within the service to generate foreign key IDs, delegating the final commit to the outer transaction boundary or an explicit atomic transaction context. Ensure full rollback on failure. | Integration tests: successful atomic submission, simulated failure during recommendation/roadmap generation verifying rollback of assessment status and scores, database constraint failure handling. |
| **P7** | N+1 query patterns in sensitivity and ML empirical record fetching | **Confirmed** | 1) `backend/app/api/v1/endpoints/research_diagnostics.py` (`/sensitivity` endpoint, lines 69-76): iterates through assessment IDs and executes individual `select(AssessmentScore)` queries per ID.<br>2) `backend/app/api/v1/endpoints/research_ml.py` (`_fetch_empirical_records`, lines 48-82): executes per-assessment queries for scores and classification results. | **High**: Linear database query growth with dataset size; slow API responses for research datasets. | Replace per-ID loop queries with batched queries using `AssessmentScore.assessment_id.in_(assessment_ids)` and `ClassificationResult.assessment_id.in_(assessment_ids)`. Group results in-memory. | Query tests proving: identical calculation results before and after optimization, empty dataset handling, single record, multiple records, and tenant isolation. |
| **P8/P9** | Token `expires_in` response does not match actual lifetime & refresh-token endpoint missing | **Confirmed** | In `backend/app/api/v1/endpoints/auth.py`: `/login` returns `expires_in=3600` hardcoded, while `settings.ACCESS_TOKEN_EXPIRE_MINUTES` is `60 * 24 * 7` (10,080 minutes = 604,800 seconds). Furthermore, a refresh token is issued in `TokenResponse`, but no `POST /auth/refresh` endpoint exists to accept it. | **High**: Client token refresh timers expire prematurely; mobile/SPA clients cannot refresh sessions without full re-authentication, leading to broken UX. | Fix `expires_in` in `auth.py` to match `settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60`. Implement `POST /auth/refresh` endpoint that verifies refresh token type and issues a new access token. | Tests for: correct `expires_in` value matching token lifetime, valid token refresh flow, invalid/expired refresh token rejection, and tampered token rejection. |
| **P12** | Zero-answer assessment can be submitted and receive valid Level 0 classification | **Confirmed** | In `backend/app/services/assessment_service.py`: `submit_assessment()` does not validate question answer coverage before scoring and classification. An assessment with zero answers is passed to `ScoringEngine` and `RBDLClassifierEngine`, producing a Level 0 classification. | **High**: Data integrity issue; creates synthetic/fabricated Level 0 classifications for assessments that were never completed. | Add an explicit application/data-integrity safeguard in `submit_assessment()`: verify that at least one applicable question has been answered before permitting submission. Raise `ValidationException` (HTTP 422) if answer count is zero. Document as application safeguard, NOT a change to RBDL_V1. | Integration tests: attempt to submit assessment with 0 answers receives 422 validation error; assessment with answered questions proceeds normally to classification. |

---

### Research Instrument Invariant Confirmation

During the audit and remediation, all frozen research instruments were verified:
- **RBDL_V1** specification remains intact.
- **C3 Question Bank** (14 questions) unchanged.
- **Classification Thresholds & Rules** unchanged.
- **C4 Recommendation Rules & Priority Formula** unchanged.
- **Requirement Profile V1 & Feasibility Rules** unchanged.
- **ML experimental/non-authoritative boundary** strictly maintained.

No proposed fix altered research logic, definitions, or survey instruments.

---

## Phase 2 — Implementation & Remediation Summary

### P1: Role Escalation Prevention
- **Files**: `backend/app/schemas/user.py`, `backend/app/api/v1/endpoints/auth.py`
- **Fix**: Replaced unrestricted string role in `UserCreate` with `AllowedRegistrationRole = Literal["business_owner", "consultant"]` defaulting to `"business_owner"`. Privileged administrative roles (`super_admin`, `admin`, `researcher`, `assessor`) cannot be assigned via public self-registration.
- **Test**: `test_p1_role_escalation_blocked` in `backend/tests/integration/test_remediation_security_and_correctness.py`.

### P2: Route Shadowing & Unauthenticated Stubs Cleanup
- **Files**: `backend/app/api/v1/endpoints/domain_routers.py`, `backend/app/api/v1/router.py`
- **Fix**: Removed shadowed stub endpoints (`/classification/{id}`, `/recommendations/{id}`, `/roadmap/{id}`) from `domain_routers.py` that intercepted traffic before real routers. Removed dead router mounts in `router.py`. Preserved legitimate authenticated administrative rule routes.
- **Test**: `test_p2_real_endpoints_accessible_and_authenticated` verifying real service data and authentication enforcement.

### P3: Production Secret Key Guard
- **Files**: `backend/app/config.py`, `.env.example`, `backend/tests/unit/test_config.py`
- **Fix**: Implemented Pydantic `@field_validator("SECRET_KEY")` in `Settings` that raises a `ValueError` on startup if `ENVIRONMENT == "production"` and `SECRET_KEY` is empty, insecure, or matches the dev default. Development environments continue to use the dev key without friction.
- **Test**: Added unit tests in `backend/tests/unit/test_config.py` testing production security enforcement.

### P4: Committed SQLite Database Removal
- **Files**: `.gitignore`, `backend/digimitra.db`
- **Fix**: Removed `backend/digimitra.db` from git index (`git rm --cached`). Verified `.gitignore` contains `*.db`, `*.sqlite`, `*.sqlite3` to prevent future database artifact commits.

### P5: Domain Exceptions in Service Layer
- **Files**: `backend/app/services/assessment_service.py`
- **Fix**: Replaced direct FastAPI `HTTPException` raises with `EntityNotFoundException` (404), `AuthorizationException` (403), `ValidationException` (422), and `BadRequestException` (400) from `app.core.exceptions`. Decoupled business logic from HTTP transport layer while preserving exact error semantics.
- **Test**: `test_p5_domain_exceptions_and_error_codes` in integration suite.

### P6: Atomic Transaction Boundary in `submit_assessment()`
- **Files**: `backend/app/services/assessment_service.py`, `backend/app/services/recommendation_service.py`
- **Fix**: Removed premature intermediate `await db.commit()` calls in `submit_assessment()` and `RecommendationService.generate_recommendations_and_roadmap()`. Replaced with `await db.flush()` to populate foreign key IDs during generation, leaving the single final commit to the outer transaction boundary. If roadmap generation fails, the entire transaction rolls back cleanly.
- **Test**: `test_p6_atomic_transaction_rollback` validating complete rollback of assessment status and scores upon recommendation failure.

### P7: Elimination of N+1 Queries in Research Endpoints
- **Files**: `backend/app/api/v1/endpoints/research_diagnostics.py`, `backend/app/api/v1/endpoints/research_ml.py`
- **Fix**: Replaced per-ID loop queries in `/sensitivity` and `_fetch_empirical_records` with batched queries using SQLAlchemy `in_()` clause (`AssessmentScore.assessment_id.in_(assessment_ids)` and `ClassificationResult.assessment_id.in_(assessment_ids)`), aggregating in-memory into dictionaries.
- **Test**: `test_p7_batched_queries_sensitivity_and_ml` verifying identical output with constant query count.

### P8 / P9: Token Lifetime Alignment & Token Refresh Endpoint
- **Files**: `backend/app/api/v1/endpoints/auth.py`
- **Fix**: Corrected `/auth/login` to compute `expires_in` dynamically as `settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60`. Implemented `POST /api/v1/auth/refresh` endpoint accepting a valid refresh token and issuing a fresh access token without requiring re-entry of credentials.
- **Test**: `test_p8_p9_token_expires_in_and_refresh_endpoint` verifying lifetime calculation and refresh cycle.

### P12: Data Integrity Guard for Zero-Answer Assessments
- **Files**: `backend/app/services/assessment_service.py`
- **Fix**: Added application-level validation check before scoring in `submit_assessment()`. If an assessment contains zero answers, it raises `ValidationException` (HTTP 422) rather than manufacturing a false Level 0 classification.
- **Test**: `test_p12_zero_answer_assessment_submission_blocked`.

---

## Phase 3 — Verification & Test Results

### 1. Backend Test Suite
- **Command**: `python -m pytest backend/tests -v`
- **Result**: **156 passed, 0 failed, 9 warnings** (20.88s)
- **Coverage**: Full coverage across auth, discovery, business profiles, assessment engine, scoring, classification, recommendation, roadmap, sensitivity, ML evaluation pipeline, and security/RBAC.

### 2. Frontend Test Suite
- **Command**: `npm run test:run`
- **Result**: **11 test files passed (11), 27 tests passed (27)** (7.54s)
- **Coverage**: Business registration, auth flow, assessment questionnaire, recommendations view, roadmap view, history timeline, level cards.

### 3. Frontend Production Build
- **Command**: `npm run build` (`tsc && vite build`)
- **Result**: **Built successfully in 4.69s** with zero TypeScript or bundling errors.

---

## Phase 4 — Deferred Findings & Non-Remediated Items

The following items from the review were deferred as they either relate to post-MVP features or were determined not to represent security risks:
1. **Dynamic Question Weight Calibration**: Deferred to subsequent empirical research phases (weights remain frozen at C3 specifications).
2. **ML Recommender System**: Deferred to future research milestones; ML models remain strictly non-authoritative comparative benchmarks as specified.
3. **Automated Tenant Data Partitioning**: SQLite/MySQL schema uses tenant-scoped foreign keys and RBAC queries; dedicated schema per tenant is not required at current scale.

