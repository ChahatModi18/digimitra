# Troubleshooting & Debugging Guide — DigiMitra (डिजीमित्र)

> **Document Version:** 1.0.0  
> **Target Audience:** Developers, System Administrators, DevOps Engineers  

---

## 1. Port Collisions & Multi-Project Conflicts

### Symptom: `Vite: Port 5173 is in use` or Backend `Address already in use: 8000`
On shared developer workstations running multiple web applications, default development ports (`5173`, `3000`, `8000`) may be occupied by background processes.

#### Diagnosis & Resolution:
1. **Identify the process occupying the port:**
   - **Windows:**
     ```powershell
     netstat -ano | findstr "8000"
     # Find process details from PID:
     Get-Process -Id <PID>
     ```
   - **Linux / macOS:**
     ```bash
     lsof -i :8000
     ```

2. **Option A: Terminate the competing background process:**
   - **Windows:**
     ```powershell
     Stop-Process -Id <PID> -Force
     ```
   - **Linux / macOS:**
     ```bash
     kill -9 <PID>
     ```

3. **Option B: Run DigiMitra on alternative ports:**
   - Run backend on port `8001`:
     ```powershell
     python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
     ```
   - Update `frontend/vite.config.ts`:
     ```ts
     server: {
       port: 5174,
       proxy: {
         "/api": {
           target: "http://127.0.0.1:8001",
           changeOrigin: true
         }
       }
     }
     ```
   - Add `http://localhost:5174` and `http://127.0.0.1:5174` to `CORS_ORIGINS` in `backend/.env`.

---

## 2. Database Connectivity Issues

### Symptom: `OperationalError: (pymysql.err.OperationalError) (2003, "Can't connect to MySQL server")`
The backend fails during startup when attempting to connect to MySQL on `127.0.0.1:3306`.

#### Resolution Steps:
1. **Verify MySQL Server Service is Running:**
   - **Windows Services:**
     ```powershell
     Get-Service -Name "*mysql*"
     Start-Service -Name "MySQL80"  # or your installed service name
     ```
   - **Docker:**
     ```bash
     docker ps | grep mysql
     docker compose -f infra/docker-compose.yml up -d mysql
     ```

2. **Fallback to SQLite for Zero-Setup Development:**
   If local MySQL is unavailable, edit `backend/.env` to use local SQLite:
   ```ini
   DATABASE_URL=sqlite+aiosqlite:///./digimitra.db
   ```
   Restart the backend. In local dev mode, DigiMitra automatically initializes SQLite tables and seeds rules idempotently.

---

## 3. CORS & Cross-Origin API Errors

### Symptom: Browser Console shows `Access to XMLHttpRequest at '...' from origin 'http://localhost:5173' has been blocked by CORS policy`
Occurs when the frontend is served on a port not listed in the backend's allowed CORS origins array.

#### Resolution:
Check `backend/.env` and ensure `CORS_ORIGINS` includes both `localhost` and `127.0.0.1` for your active frontend port:
```ini
CORS_ORIGINS=["http://localhost:5173","http://localhost:5174","http://127.0.0.1:5173","http://127.0.0.1:5174"]
```
*Remember to restart Uvicorn after modifying `.env`.*

---

## 4. JWT Authentication & Expiration Debugging

### Symptom: `HTTP 401 Unauthorized` with `Could not validate credentials` or `Token expired`
1. Access tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES` (default: 60 minutes).
2. If encountering sudden logouts during development, increase token lifetime in `backend/.env`:
   ```ini
   ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days for local development
   ```
3. Inspect token payload in client browser `localStorage` or `Authorization` header by decoding at [jwt.io](https://jwt.io) to verify user ID and expiration claims.

---

## 5. Log Inspection & Debug Logging

### Enabling Verbose Debug Output:
In `backend/.env`, set:
```ini
LOG_LEVEL=DEBUG
LOG_FORMAT=console
```
This prints structured logs for every HTTP request, database query latency, and rule evaluation trace directly to the terminal stdout.
