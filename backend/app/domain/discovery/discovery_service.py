"""Discovery Service Orchestrator (A8).

Handles location normalization, business profile context resolution,
assessment-based category suggestions, and provider query execution.
"""

from typing import Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.discovery.categories import (
    DISCOVERY_CATEGORIES,
    DISCOVERY_CATEGORY_MAP,
    get_suggested_categories_for_dimensions,
)
from app.domain.discovery.provider_adapter import BaseDiscoveryProvider, get_discovery_provider
from app.models.business import Business
from app.models.assessment import Assessment
from app.schemas.discovery import (
    DiscoveryCategory,
    ServiceProviderItem,
    ServiceSearchQuery,
    ServiceSearchResponse,
)


class DiscoveryService:
    """Core service for location-aware MSME digital service exploration."""

    def __init__(self, provider: Optional[BaseDiscoveryProvider] = None):
        self.provider = provider or get_discovery_provider()

    @staticmethod
    def get_categories() -> List[DiscoveryCategory]:
        """Returns all canonical service discovery categories."""
        return DISCOVERY_CATEGORIES

    @staticmethod
    def get_category_by_id(category_id: str) -> Optional[DiscoveryCategory]:
        """Returns category metadata by ID."""
        return DISCOVERY_CATEGORY_MAP.get(category_id.lower().strip())

    async def search_services(
        self,
        query: ServiceSearchQuery,
        db: Optional[AsyncSession] = None,
        use_test_mock: bool = False,
    ) -> ServiceSearchResponse:
        """
        Executes localized service search. If business_id is passed, resolves
        the business's registered state and district, and checks recent assessment scores
        for weak dimensions to recommend relevant discovery categories.
        """
        applied_location: Dict[str, Optional[str]] = {
            "state": query.state,
            "district": query.district,
            "city": query.city,
            "pincode": query.pincode,
        }
        suggested_categories: List[str] = []

        # Resolve business context if business_id provided
        if query.business_id and db is not None:
            biz_stmt = select(Business).where(Business.id == query.business_id)
            biz_res = await db.execute(biz_stmt)
            business = biz_res.scalar_one_or_none()

            if business:
                # Use business location as fallback if query doesn't specify
                if not query.state and business.state:
                    query.state = business.state
                    applied_location["state"] = business.state
                if not query.district and business.district:
                    query.district = business.district
                    applied_location["district"] = business.district
                if not query.city and business.city_town:
                    query.city = business.city_town
                    applied_location["city"] = business.city_town
                if not query.pincode and business.pincode:
                    query.pincode = business.pincode
                    applied_location["pincode"] = business.pincode

                # Find latest completed assessment for weak dimension suggestions
                asmt_stmt = (
                    select(Assessment)
                    .where(
                        Assessment.business_id == query.business_id,
                        Assessment.status == "COMPLETED",
                    )
                    .order_by(Assessment.completed_at.desc().nullslast(), Assessment.id.desc())
                    .limit(1)
                )
                asmt_res = await db.execute(asmt_stmt)
                latest_asmt = asmt_res.scalar_one_or_none()

                if latest_asmt and latest_asmt.dimension_scores:
                    # Identify dimensions with score < 5.0/10 as growth focus areas
                    weak_dims = [
                        dim_code
                        for dim_code, score in latest_asmt.dimension_scores.items()
                        if isinstance(score, (int, float)) and score < 5.0
                    ]
                    suggested_categories = get_suggested_categories_for_dimensions(weak_dims)

        active_provider = get_discovery_provider(use_test_mock=use_test_mock)
        items, total_count, status_code, msg_en, msg_hi = active_provider.search_services(query)

        return ServiceSearchResponse(
            items=items,
            total_count=total_count,
            page=query.page,
            page_size=query.page_size,
            provider_status=status_code,
            provider_message_en=msg_en,
            provider_message_hi=msg_hi,
            applied_location=applied_location,
            suggested_categories=suggested_categories,
        )

    async def get_service_by_id(
        self, service_id: str, use_test_mock: bool = False
    ) -> Optional[ServiceProviderItem]:
        """Fetches single service details by ID."""
        active_provider = get_discovery_provider(use_test_mock=use_test_mock)
        query = ServiceSearchQuery(page=1, page_size=100)
        items, _, _, _, _ = active_provider.search_services(query)
        for item in items:
            if item.id == service_id:
                return item
        return None
