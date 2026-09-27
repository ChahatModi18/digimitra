# DigiMitra: System Architecture Specification

## 1. Architectural Style
- **Pattern:** Modular Monolith (FastAPI + React SPA + MySQL 8.0)
- **Design Principles:** Clean architecture, strategy pattern for swappable classification (Rule-Based in Phase 1 -> ML in Phase 2+), append-only historical audit records, internationalization (EN/HI).

## 2. Layered Responsibilities
1. **Client Layer:** React 18 + TypeScript + Vite + Tailwind CSS SPA.
2. **API Layer (`backend/app/api`):** FastAPI async routers, request validation via Pydantic v2 schemas, JWT authentication, and structured error responses.
3. **Domain Layer (`backend/app/domain`):** Pure Python business logic with zero direct database or HTTP coupling.
4. **Repository Layer (`backend/app/repositories`):** Encapsulated database operations using SQLAlchemy 2.0 async sessions.
5. **Persistence Layer:** MySQL 8.0+ / SQLite async with Alembic schema migrations.
