"""Location Services and Business Resource Discovery Endpoints (A8).

Endpoints:
- GET /api/v1/explore/categories : List discovery categories and dimension mappings
- GET /api/v1/explore/services   : Search localized digital service providers and resources
- GET /api/v1/explore/services/{id} : Get detailed info for a single service/resource
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.domain.discovery.discovery_service import DiscoveryService
from app.schemas.discovery import (
    DiscoveryCategory,
    ServiceProviderItem,
    ServiceSearchQuery,
    ServiceSearchResponse,
)

router = APIRouter(prefix="/explore", tags=["Explore & Location Services"])


@router.get("/categories", response_model=List[DiscoveryCategory])
async def list_discovery_categories():
    """Returns all 8 canonical service discovery categories in English and Hindi."""
    service = DiscoveryService()
    return service.get_categories()


@router.get("/services", response_model=ServiceSearchResponse)
async def search_services(
    category: Optional[str] = Query(None, description="Category filter (e.g. payments, accounting)"),
    search: Optional[str] = Query(None, description="Search keyword in English or Hindi"),
    state: Optional[str] = Query(None, description="State filter"),
    district: Optional[str] = Query(None, description="District filter"),
    city: Optional[str] = Query(None, description="City or locality"),
    pincode: Optional[str] = Query(None, description="PIN code"),
    business_id: Optional[int] = Query(None, description="Registered enterprise ID for contextual suggestions"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    test_mock: bool = Query(False, description="Internal test mock flag"),
    db: AsyncSession = Depends(get_db),
):
    """
    Search and filter localized digital service providers and official MSME support centres.
    Defaults to an unconfigured empty state when no external provider is active.
    """
    query = ServiceSearchQuery(
        category=category,
        search_term=search,
        state=state,
        district=district,
        city=city,
        pincode=pincode,
        business_id=business_id,
        page=page,
        page_size=page_size,
    )
    service = DiscoveryService()
    return await service.search_services(query=query, db=db, use_test_mock=test_mock)


@router.get("/services/{service_id}", response_model=ServiceProviderItem)
async def get_service_details(
    service_id: str,
    test_mock: bool = Query(False, description="Internal test mock flag"),
):
    """Fetch details for a specific service provider or official resource."""
    service = DiscoveryService()
    item = await service.get_service_by_id(service_id=service_id, use_test_mock=test_mock)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service or provider '{service_id}' was not found.",
        )
    return item
