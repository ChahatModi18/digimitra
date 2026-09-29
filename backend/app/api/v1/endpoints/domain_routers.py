"""Domain Routers: Real Authenticated Endpoints for Classification & Admin Rules.

All obsolete unauthenticated stubs have been removed or replaced with real,
RBAC-protected, service-backed endpoints.
"""

from typing import Any, Dict, List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import UserRole
from app.db.session import get_db
from app.dependencies import get_current_user, require_roles
from app.models.rule import Rule
from app.models.user import User
from app.schemas.assessment import ClassificationResultRead
from app.schemas.common import APIResponse
from app.services.assessment_service import AssessmentService

classification_router = APIRouter(prefix="/classification", tags=["Classification"])
admin_rules_router = APIRouter(prefix="/admin/rules", tags=["Admin & Rule Management"])


@classification_router.get("/{assessment_id}", response_model=APIResponse[ClassificationResultRead])
async def get_classification_result(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve verified classification result and evidence trace from real assessment service."""
    classification_result = await AssessmentService.get_classification(
        db=db,
        assessment_id=assessment_id,
        user_id=current_user.id,
    )
    return APIResponse(
        success=True,
        message="Classification result retrieved successfully.",
        data=classification_result,
    )


@admin_rules_router.get("", response_model=APIResponse[List[Dict[str, Any]]])
async def list_admin_rules(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.RESEARCHER])),
):
    """List active rule definitions for authorized admin/researcher management."""
    result = await db.execute(
        select(Rule).where(Rule.is_active == True).order_by(Rule.priority.desc(), Rule.rule_code.asc())
    )
    rules = result.scalars().all()
    rule_data = [
        {
            "id": r.id,
            "rule_code": r.rule_code,
            "name": r.name,
            "description": r.description,
            "target_rbdl_level": r.target_rbdl_level,
            "priority": r.priority,
            "version": r.version,
            "rationale": r.rationale,
        }
        for r in rules
    ]
    return APIResponse(
        success=True,
        message="Admin rules retrieved successfully.",
        data=rule_data,
    )
