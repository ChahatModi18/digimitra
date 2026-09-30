from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import AuthorizationException, EntityNotFoundException
from app.core.security import UserRole
from app.db.session import get_db
from app.dependencies import get_authenticated_user
from app.models.business import Business
from app.models.business_category import BusinessCategory
from app.models.user import User
from app.repositories.business_repository import BusinessRepository
from app.schemas.business import BusinessCreate, BusinessRead, BusinessUpdate, CategoryRead
from app.schemas.common import APIResponse
from app.domain.taxonomy.categories import SECTORS, TAXONOMY_CATALOG, get_all_sectors

router = APIRouter(prefix="/businesses", tags=["Businesses"])


@router.post("", response_model=APIResponse[BusinessRead], status_code=status.HTTP_201_CREATED)
async def create_business(
    business_in: BusinessCreate,
    current_user: User = Depends(get_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Register a new MSME business profile linked to the authenticated user."""
    repo = BusinessRepository(db)
    new_business = Business(
        owner_id=current_user.id,
        name=business_in.name,
        sector=business_in.sector,
        business_type=business_in.business_type,
        sub_category=business_in.sub_category,
        owner_name=business_in.owner_name,
        year_established=business_in.year_established,
        years_in_operation=business_in.years_in_operation,
        enterprise_size=business_in.enterprise_size,
        employee_count=business_in.employee_count,
        state=business_in.state,
        city=business_in.city,
        area_locality=business_in.area_locality,
        business_address=business_in.business_address,
        pincode=business_in.pincode,
        contact_phone=business_in.contact_phone,
        contact_email=business_in.contact_email,
        website=business_in.website,
        primary_language=business_in.primary_language,
        additional_language=business_in.additional_language,
        business_model=business_in.business_model,
        target_customers=business_in.target_customers,
        monthly_revenue=business_in.monthly_revenue,
        digitalization_goal=business_in.digitalization_goal,
        description=business_in.description,
    )
    created = await repo.create(new_business)
    return APIResponse(
        success=True,
        message="Business registered successfully.",
        data=BusinessRead.model_validate(created),
    )


@router.get("/categories/taxonomy", response_model=APIResponse[Dict[str, Any]])
async def get_taxonomy():
    """Retrieve full hierarchical MSME business sectors, categories, and digitalization pathways."""
    sectors = get_all_sectors()
    nodes = [
        {
            "sector_code": n.sector_code,
            "category_code": n.category_code,
            "subcategory_code": n.subcategory_code,
            "display_name_en": n.display_name_en,
            "display_name_hi": n.display_name_hi,
            "description_en": n.description_en,
            "description_hi": n.description_hi,
            "typical_needs": n.typical_needs,
            "typical_tools": n.typical_tools,
            "typical_digitalization_paths": n.typical_digitalization_paths,
        }
        for n in TAXONOMY_CATALOG
    ]
    return APIResponse(
        success=True,
        data={
            "sectors": sectors,
            "taxonomy": nodes,
        },
    )


@router.get("/categories", response_model=APIResponse[List[CategoryRead]])
async def list_business_categories(
    sector_code: Optional[str] = Query(None, description="Optional sector filter"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve list of active business categories from database."""
    stmt = select(BusinessCategory).where(BusinessCategory.is_active == True)
    if sector_code:
        stmt = stmt.where(BusinessCategory.sector_code == sector_code)
    stmt = stmt.order_by(BusinessCategory.id.asc())
    categories = (await db.execute(stmt)).scalars().all()
    return APIResponse(
        success=True,
        data=[CategoryRead.model_validate(c) for c in categories],
    )


@router.get("/{business_id}", response_model=APIResponse[BusinessRead])
async def get_business(
    business_id: int,
    current_user: User = Depends(get_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve details of a registered business."""
    repo = BusinessRepository(db)
    business = await repo.get_by_id(business_id)
    if not business:
        raise EntityNotFoundException("Business", business_id)

    # Check access permission: owner or admin/consultant
    if (
        current_user.role not in [UserRole.ADMIN.value, UserRole.CONSULTANT.value]
        and business.owner_id != current_user.id
    ):
        raise AuthorizationException("You do not have access to view this business.")

    return APIResponse(
        success=True,
        data=BusinessRead.model_validate(business),
    )


@router.get("", response_model=APIResponse[List[BusinessRead]])
async def list_businesses(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_authenticated_user),
    db: AsyncSession = Depends(get_db),
):
    """List businesses belonging to the logged-in user (or all if admin)."""
    repo = BusinessRepository(db)
    if current_user.role == UserRole.ADMIN.value:
        businesses = await repo.get_all(skip=skip, limit=limit)
    else:
        businesses = await repo.get_by_owner(owner_id=current_user.id)

    return APIResponse(
        success=True,
        data=[BusinessRead.model_validate(b) for b in businesses],
    )
