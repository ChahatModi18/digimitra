"""Business and Assessment Repositories."""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.business import Business
from app.models.assessment import Assessment
from app.repositories.base_repository import BaseRepository


class BusinessRepository(BaseRepository[Business]):
    """Repository for managing business entities."""

    def __init__(self, session: AsyncSession):
        super().__init__(Business, session)

    async def get_by_owner(self, owner_id: int) -> List[Business]:
        """Fetch all businesses belonging to a given user ID."""
        result = await self.session.execute(
            select(Business).where(Business.owner_id == owner_id)
        )
        return list(result.scalars().all())


class AssessmentRepository(BaseRepository[Assessment]):
    """Repository for managing assessment sessions."""

    def __init__(self, session: AsyncSession):
        super().__init__(Assessment, session)

    async def get_by_business(self, business_id: int) -> List[Assessment]:
        """Fetch all historical assessments for a business, ordered by submission date."""
        result = await self.session.execute(
            select(Assessment)
            .where(Assessment.business_id == business_id)
            .order_by(Assessment.submitted_at.desc())
        )
        return list(result.scalars().all())

    async def get_latest_by_business(self, business_id: int) -> Optional[Assessment]:
        """Fetch the most recent assessment for a business."""
        result = await self.session.execute(
            select(Assessment)
            .where(Assessment.business_id == business_id)
            .order_by(Assessment.submitted_at.desc())
            .limit(1)
        )
        return result.scalars().first()
