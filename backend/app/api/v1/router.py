"""API v1 Router Aggregator."""

from fastapi import APIRouter
from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.businesses import router as businesses_router
from app.api.v1.endpoints.assessments import router as assessments_router
from app.api.v1.endpoints.recommendations import router as recommendations_router
from app.api.v1.endpoints.roadmap import router as roadmap_router
from app.api.v1.endpoints.domain_routers import (
    classification_router,
    progress_router,
    reports_router,
    admin_rules_router,
)
from app.api.v1.endpoints.research_ml import router as research_ml_router
from app.api.v1.endpoints.discovery import router as discovery_router

api_v1_router = APIRouter()

# Register endpoint modules
api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(businesses_router)
api_v1_router.include_router(assessments_router)
api_v1_router.include_router(classification_router)
api_v1_router.include_router(recommendations_router)
api_v1_router.include_router(roadmap_router)
api_v1_router.include_router(progress_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(admin_rules_router)
api_v1_router.include_router(research_ml_router)
api_v1_router.include_router(discovery_router)


