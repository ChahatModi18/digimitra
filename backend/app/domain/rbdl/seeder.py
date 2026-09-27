"""Idempotent Seeder for Question Bank Version 1 and Rules Version 1 (Claude C3)."""

import logging
from typing import Any, Dict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.question import Question, QuestionOption
from app.models.rule import Rule
from app.domain.rbdl.question_bank_v1 import QUESTIONS_V1, QUESTION_BANK_VERSION
from app.domain.rbdl.rules_v1 import RULES_V1, RULESET_VERSION
from app.domain.recommendations.seeder import seed_recommendations_v1

logger = logging.getLogger(__name__)


async def seed_question_bank_v1(db: AsyncSession) -> int:
    """Seed Question Bank v1 questions and options if not already present."""
    count = 0
    for q_data in QUESTIONS_V1:
        # Check if question exists for this version
        result = await db.execute(
            select(Question).where(
                Question.question_code == q_data["question_code"],
                Question.version == q_data["version"],
            )
        )
        existing_q = result.scalar_one_or_none()

        if not existing_q:
            q = Question(
                question_code=q_data["question_code"],
                dimension_code=q_data["dimension_code"],
                question_text_en=q_data["question_text_en"],
                question_text_hi=q_data["question_text_hi"],
                question_type=q_data["question_type"],
                display_order=q_data["display_order"],
                version=q_data["version"],
                is_active=True,
            )
            db.add(q)
            await db.flush()

            for opt_data in q_data.get("options", []):
                opt = QuestionOption(
                    question_id=q.id,
                    option_code=opt_data["option_code"],
                    label_en=opt_data["label_en"],
                    label_hi=opt_data["label_hi"],
                    score_value=opt_data["score_value"],
                    display_order=opt_data["display_order"],
                )
                db.add(opt)

            count += 1
            logger.info(f"Seeded question {q_data['question_code']} (v{q_data['version']})")

    if count > 0:
        await db.commit()
    return count


async def seed_rules_v1(db: AsyncSession) -> int:
    """Seed declarative classification rules v1 if not already present."""
    count = 0
    for r_data in RULES_V1:
        result = await db.execute(
            select(Rule).where(
                Rule.rule_code == r_data["rule_code"],
                Rule.version == r_data["version"],
            )
        )
        existing_r = result.scalar_one_or_none()

        if not existing_r:
            r = Rule(
                rule_code=r_data["rule_code"],
                version=r_data["version"],
                name=r_data["name"],
                description=r_data.get("description"),
                condition_json=r_data["condition_json"],
                target_rbdl_level=r_data["target_rbdl_level"],
                priority=r_data.get("priority", 0),
                rationale=r_data.get("rationale"),
                is_active=True,
            )
            db.add(r)
            count += 1
            logger.info(f"Seeded rule {r_data['rule_code']} (v{r_data['version']})")

    if count > 0:
        await db.commit()
    return count


async def seed_all_a3_data(db: AsyncSession) -> Dict[str, int]:
    """Seed Question Bank v1, Rules v1, and Recommendations v1."""
    q_count = await seed_question_bank_v1(db)
    r_count = await seed_rules_v1(db)
    rec_count = await seed_recommendations_v1(db)
    return {
        "questions_seeded": q_count,
        "rules_seeded": r_count,
        "recommendations_seeded": rec_count,
    }

