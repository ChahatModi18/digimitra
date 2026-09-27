"""Business Profile Management Endpoints."""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import EntityNotFoundException
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.business import Business
from app.models.user import User
from app.repositories.business_repository import BusinessRepository
from app.schemas.business import BusinessCreate, BusinessRead, BusinessUpdate
from app.schemas.common import APIResponse

router = APIRouter(prefix="/businesses", tags=["Businesses"])


@router.post("", response_model=APIResponse[BusinessRead], status_code=status.HTTP_201_CREATED)
async def create_business(
    business_in: BusinessCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Register a new MSME business profile."""
    # Fallback owner ID if running without auth during initial testing
    owner_id = current_user.id if current_user else 1

    repo = BusinessRepository(db)
    new_business = Business(
        owner_id=owner_id,
        name=business_in.name,
        sector=business_in.sector,
        enterprise_size=business_in.enterprise_size,
        state=business_in.state,
        city=business_in.city,
        pincode=business_in.pincode,
        description=business_in.description,
        primary_language=business_in.primary_language,
    )
    created = await repo.create(new_business)
    return APIResponse(
        success=True,
        message="Business registered successfully.",
        data=BusinessRead.model_validate(created),
    )


@router.get("/{business_id}", response_model=APIResponse[BusinessRead])
async def get_business(business_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve details of a registered business."""
    repo = BusinessRepository(db)
    business = await repo.get_by_id(business_id)
    if not business:
        raise EntityNotFoundException("Business", business_id)

    return APIResponse(
        success=True,
        data=BusinessRead.model_validate(business),
    )


@router.get("", response_model=APIResponse[List[BusinessRead]])
async def list_businesses(skip: int = 0, limit: int = 50, db: AsyncSession = Depends(get_db)):
    """List registered businesses."""
    repo = BusinessRepository(db)
    businesses = await repo.get_all(skip=skip, limit=limit)
    return APIResponse(
        success=True,
        data=[BusinessRead.model_validate(b) for b in businesses],
    )
