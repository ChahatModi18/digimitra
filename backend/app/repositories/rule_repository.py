"""Rule, Recommendation, and Roadmap Repositories."""

from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.rule import Rule
from app.models.recommendation import Recommendation
from app.models.roadmap import Roadmap, RoadmapItem
from app.repositories.base_repository import BaseRepository


class RuleRepository(BaseRepository[Rule]):
    """Repository for managing classification rules."""

    def __init__(self, session: AsyncSession):
        super().__init__(Rule, session)

    async def get_active_rules(self) -> List[Rule]:
        """Fetch all active rules ordered by priority descending."""
        result = await self.session.execute(
            select(Rule).where(Rule.is_active == True).order_by(Rule.priority.desc())
        )
        return list(result.scalars().all())


class RecommendationRepository(BaseRepository[Recommendation]):
    """Repository for recommendation catalog."""

    def __init__(self, session: AsyncSession):
        super().__init__(Recommendation, session)

    async def get_by_codes(self, codes: List[str]) -> List[Recommendation]:
        """Fetch recommendations by a list of unique codes."""
        if not codes:
            return []
        result = await self.session.execute(
            select(Recommendation).where(
                Recommendation.code.in_(codes),
                Recommendation.is_active == True,
            )
        )
        return list(result.scalars().all())


class RoadmapRepository(BaseRepository[Roadmap]):
    """Repository for digital transformation roadmaps."""

    def __init__(self, session: AsyncSession):
        super().__init__(Roadmap, session)

    async def get_active_by_business(self, business_id: int) -> Optional[Roadmap]:
        """Fetch the current active roadmap for a business."""
        result = await self.session.execute(
            select(Roadmap)
            .where(Roadmap.business_id == business_id, Roadmap.status == "active")
            .order_by(Roadmap.created_at.desc())
            .limit(1)
        )
        return result.scalars().first()
