"""Health Check and System Diagnostics Endpoint."""

import platform
import sys
import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.db.session import get_db
from app.schemas.health import ComponentStatus, HealthResponse, SystemInfo

router = APIRouter(tags=["Health & Diagnostics"])

# Record application boot timestamp for uptime calculation
BOOT_TIME = time.time()


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="System Health & Diagnostics",
    description="Returns detailed health metrics, database latency, uptime, and system diagnostics.",
)
async def get_health_status(db: AsyncSession = Depends(get_db)) -> HealthResponse:
    """Check application and database health status."""
    uptime = time.time() - BOOT_TIME
    components = {}
    overall_status = "healthy"

    # Test Database Connectivity and Latency
    db_start = time.perf_counter()
    db_status = "healthy"
    db_details = {"dialect": settings.DATABASE_URL.split(":")[0]}

    try:
        result = await db.execute(text("SELECT 1"))
        _ = result.scalar()
        db_latency_ms = round((time.perf_counter() - db_start) * 1000, 2)
        db_details["latency_ms"] = db_latency_ms
        db_details["connected"] = True
    except Exception as exc:
        db_status = "unhealthy"
        overall_status = "degraded"
        db_details["connected"] = False
        db_details["error"] = str(exc)

    components["database"] = ComponentStatus(status=db_status, details=db_details)

    # i18n Subsystem Status
    components["i18n"] = ComponentStatus(
        status="healthy",
        details={
            "default_locale": settings.DEFAULT_LOCALE,
            "supported_locales": settings.SUPPORTED_LOCALES,
        },
    )

    # Classification Engine Interface Status
    components["classification_engine"] = ComponentStatus(
        status="healthy",
        details={
            "strategy": "rule_based",
            "active_version": "1.0",
        },
    )

    system_info = SystemInfo(
        python_version=sys.version.split()[0],
        platform=platform.platform(),
        framework="FastAPI",
    )

    return HealthResponse(
        status=overall_status,
        app_name=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc),
        uptime_seconds=round(uptime, 2),
        components=components,
        system_info=system_info,
    )
