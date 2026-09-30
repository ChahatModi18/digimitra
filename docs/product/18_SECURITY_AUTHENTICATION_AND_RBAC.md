# 18. Security, Authentication & RBAC

## 1. Authentication Architecture
- **Password Protection**: Passwords hashed using `bcrypt` with automatic salting (work factor 12).
- **Session Tokens**: Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 (`HS256`).
- **Token Expiry**: Configurable TTL (default 1440 minutes = 24 hours).
- **Transport Security**: Enforced HTTPS in production; strict CORS policy restricting allowed origins.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Frontend SPA
    participant Auth as FastAPI Auth Router
    participant DB as Users DB
    participant Protected as Protected Endpoint

    Client->>Auth: POST /api/v1/auth/login (email, password)
    Auth->>DB: Query user by email
    DB-->>Auth: User record (bcrypt hash)
    Auth->>Auth: Verify password hash
    Auth-->>Client: JWT Access Token
    Client->>Protected: GET /api/v1/businesses (Bearer Token)
    Protected->>Protected: Validate JWT signature & expiration
    Protected-->>Client: 200 OK + Authorized Business Data
```

## 2. Role-Based Access Control (RBAC)
- `business_owner`: Access and manage owned enterprises, assessments, and roadmaps.
- `researcher`: Read-only access to anonymized assessment cohorts and evaluation metrics.
- `administrator`: Full access to taxonomy management, audit logs, and system configuration.\n