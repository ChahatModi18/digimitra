"""Idempotent Seeder for Recommendation Catalog Version 1 (Claude C4)."""

import logging
from typing import Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.recommendation import Recommendation
from app.domain.recommendations.catalog_v1 import RECOMMENDATIONS_V1

logger = logging.getLogger(__name__)


async def seed_recommendations_v1(db: AsyncSession) -> int:
    """Seed or update Recommendation Catalog v1 items in the database."""
    count = 0
    for r_data in RECOMMENDATIONS_V1:
        result = await db.execute(
            select(Recommendation).where(
                Recommendation.recommendation_code == r_data["recommendation_code"]
            )
        )
        existing = result.scalar_one_or_none()

        if not existing:
            rec = Recommendation(
                recommendation_code=r_data["recommendation_code"],
                title_en=r_data["title_en"],
                title_hi=r_data["title_hi"],
                description_en=r_data["description_en"],
                description_hi=r_data["description_hi"],
                target_rbdl_level=r_data["target_rbdl_level"],
                category=r_data.get("category"),
                dimension_code=r_data.get("dimension_code"),
                estimated_cost_level=r_data.get("estimated_cost_level", "low"),
                estimated_effort_level=r_data.get("estimated_effort_level", "low"),
                impact_level=r_data.get("impact_level", "medium"),
                prerequisite_json=r_data.get("prerequisite_json"),
                reason_template_en=r_data.get("reason_template_en"),
                reason_template_hi=r_data.get("reason_template_hi"),
                default_priority=r_data.get("default_priority", 0),
                is_active=True,
            )
            db.add(rec)
            count += 1
            logger.info(f"Seeded recommendation {r_data['recommendation_code']}")
        else:
            # Update fields in-place if changed
            existing.title_en = r_data["title_en"]
            existing.title_hi = r_data["title_hi"]
            existing.description_en = r_data["description_en"]
            existing.description_hi = r_data["description_hi"]
            existing.target_rbdl_level = r_data["target_rbdl_level"]
            existing.category = r_data.get("category")
            existing.dimension_code = r_data.get("dimension_code")
            existing.estimated_cost_level = r_data.get("estimated_cost_level", "low")
            existing.estimated_effort_level = r_data.get("estimated_effort_level", "low")
            existing.impact_level = r_data.get("impact_level", "medium")
            existing.prerequisite_json = r_data.get("prerequisite_json")
            existing.reason_template_en = r_data.get("reason_template_en")
            existing.reason_template_hi = r_data.get("reason_template_hi")
            existing.default_priority = r_data.get("default_priority", 0)
            existing.is_active = True

    if count > 0:
        await db.commit()
    return count
