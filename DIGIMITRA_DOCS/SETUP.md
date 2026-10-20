# Installation, Setup & Environment Configuration — DigiMitra (डिजीमित्र)

> **Target Systems:** Windows 10/11, macOS, Linux (Ubuntu 22.04+)  
> **Backend Stack:** Python 3.11+ / FastAPI / SQLAlchemy / Uvicorn  
> **Frontend Stack:** Node.js 18+ (v20 LTS recommended) / Vite / React 18  
> **Database:** MySQL 8.0+ or Local SQLite 3  

---

## 1. System Prerequisites

Before running DigiMitra, ensure the following runtimes are installed on your workstation:
- **Python:** Version 3.11.0 or higher (`python --version` or `py --version`)
- **Node.js:** Version 18.0.0 or higher (`node --version`)
- **Git:** Version 2.30+ (`git --version`)
- **MySQL (Optional for production mode):** MySQL 8.0 Server running on port 3306

---

## 2. Step-by-Step Setup Guide

### 2.1 Clone Repository
```bash
git clone https://github.com/ChahatModi18/digimitra.git
cd digimitra
```

---

### 2.2 Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Create Python Virtual Environment:**
   - **Windows:**
     ```powershell
     py -m venv .venv
     .venv\Scripts\activate
     ```
   - **macOS / Linux:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install Dependencies:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables:**
   Create a `.env` file in `backend/` (or copy from `.env.example` in repository root):
   ```ini
   PROJECT_NAME="DigiMitra API"
   ENVIRONMENT=development
   DEBUG=true
   API_V1_STR=/api/v1
   HOST=127.0.0.1
   PORT=8000

   SECRET_KEY=digimitra-dev-insecure-secret-key-change-in-production-1234567890
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   REFRESH_TOKEN_EXPIRE_DAYS=7
   ALGORITHM=HS256

   # Option A: MySQL Connection (Recommended for full multi-user testing)
   DATABASE_URL=mysql+aiomysql://digimitra_user:digimitra_secret_pass@127.0.0.1:3306/digimitra_db

   # Option B: Local SQLite (Zero setup required)
   # DATABASE_URL=sqlite+aiosqlite:///./digimitra.db

   CORS_ORIGINS=["http://localhost:5173","http://localhost:5174","http://127.0.0.1:5173","http://127.0.0.1:5174"]
   DEFAULT_LOCALE=en
   SUPPORTED_LOCALES=["en","hi"]
   LOG_LEVEL=INFO
   LOG_FORMAT=console
   ```

5. **Run Database Migrations / Initialize Tables:**
   ```bash
   py -m alembic upgrade head
   ```

6. **Start Backend Server:**
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *The backend will be live at `http://127.0.0.1:8000` with Swagger UI at `http://127.0.0.1:8000/api/v1/docs`.*

---

### 2.3 Frontend Setup

1. **Open a new terminal and navigate to `frontend/`:**
   ```bash
   cd frontend
   ```

2. **Install Node Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Frontend Environment:**
   Create a `.env` file inside `frontend/`:
   ```ini
   VITE_API_URL=/api/v1
   ```

4. **Start Vite Development Server:**
   ```bash
   npm run dev
   ```
   *The frontend will launch at `http://localhost:5173` (or `http://localhost:5174` if port 5173 is occupied).*

---

## 3. Docker Compose Setup (One-Click Launch)

For containerized deployment, run from repository root:

```bash
docker compose -f infra/docker-compose.yml up --build -d
```
This automatically spins up:
- **MySQL 8.0** on `localhost:3306`
- **FastAPI Backend** on `localhost:8000`
- **Vite React Frontend** on `localhost:5173`
