"""DigiMitra FastAPI Application Entry Point."""

import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.router import api_v1_router
from app.config import settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import logger, setup_logging
from app.db.base import Base
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager for startup and shutdown events."""
    # 1. Initialize logging
    setup_logging(level=settings.LOG_LEVEL, log_format=settings.LOG_FORMAT)
    logger.info(
        "Starting %s v%s in %s mode",
        settings.PROJECT_NAME,
        settings.VERSION,
        settings.ENVIRONMENT,
    )

    # 2. In local dev mode, initialize database tables if using SQLite
    if settings.DATABASE_URL.startswith("sqlite"):
        logger.info("Initializing SQLite database tables...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully.")

    yield

    # 3. Shutdown: dispose DB connection pool
    logger.info("Shutting down DigiMitra application...")
    await engine.dispose()
    logger.info("Database connections disposed cleanly.")


def create_application() -> FastAPI:
    """Create and configure the FastAPI application instance."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
        lifespan=lifespan,
    )

    # Configure CORS Middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Request Processing & Latency Middleware
    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.perf_counter()
        response = await call_next(request)
        process_time = time.perf_counter() - start_time
        response.headers["X-Process-Time-Ms"] = str(round(process_time * 1000, 2))
        return response

    # Register Exception Handlers
    register_exception_handlers(app)

    # Mount API v1 Router
    app.include_router(api_v1_router, prefix=settings.API_V1_STR)

    # Root and Top-Level Health Endpoints
    @app.get("/", tags=["Root"])
    async def root():
        return {
            "name": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "environment": settings.ENVIRONMENT,
            "status": "operational",
            "docs": f"{settings.API_V1_STR}/docs",
            "health": f"{settings.API_V1_STR}/health",
        }

    @app.get("/health", tags=["Health & Diagnostics"])
    async def top_level_health():
        return {"status": "healthy", "service": "digimitra-backend"}

    return app


app = create_application()
