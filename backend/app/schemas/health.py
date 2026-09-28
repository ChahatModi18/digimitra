"""Health check Pydantic schemas."""

from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class ComponentStatus(BaseModel):
    """Health status for a single system component."""

    status: str = Field(..., description="Status indicator: healthy, degraded, or unhealthy")
    details: Optional[Dict[str, Any]] = Field(default=None, description="Diagnostic details or metrics")


class SystemInfo(BaseModel):
    """Runtime system information."""

    python_version: str
    platform: str
    framework: str = "FastAPI"
    runtime_supported: bool = Field(default=True, description="True if Python 3.11/3.12 (Python 3.14+ not supported for runtime)")
    database_dialect: str = Field(default="mysql", description="Active database engine dialect")
    connected_database: Optional[str] = Field(default=None, description="Connected database name")


class HealthResponse(BaseModel):
    """Top-level health check response schema."""

    status: str = Field(..., description="Overall system health status")
    app_name: str
    version: str
    environment: str
    timestamp: datetime
    uptime_seconds: float
    components: Dict[str, ComponentStatus]
    system_info: SystemInfo
