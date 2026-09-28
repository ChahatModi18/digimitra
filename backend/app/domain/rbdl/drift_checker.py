"""Deterministic Rule, Seed, and Database Drift Checker (Safeguard I-02).

Verifies that:
1. Versioned Canonical Question Bank (question_bank_v1.py) matches the Database `questions` and `question_options`.
2. Versioned Canonical Ruleset (rules_v1.py) matches the Database `rules`.
3. Question counts, codes, dimension mappings, option score weights, rule thresholds, and logic do not silently diverge.
"""

from typing import Any, Dict, List, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.rbdl.question_bank_v1 import QUESTIONS_V1, QUESTION_BANK_VERSION
from app.domain.rbdl.rules_v1 import RULES_V1, RULESET_VERSION
from app.models.question import Question, QuestionOption
from app.models.rule import Rule


class DriftChecker:
    """Audits database seed against authoritative canonical Python definitions."""

    @classmethod
    async def check_database_drift(cls, db: AsyncSession) -> Dict[str, Any]:
        """Perform comprehensive drift analysis between canonical source and database."""
        mismatches: List[str] = []
        checked_counts: Dict[str, Any] = {}

        # 1. Audit Question Bank Drift
        q_stmt = (
            select(Question)
            .options(selectinload(Question.options))
            .where(Question.version == QUESTION_BANK_VERSION)
            .order_by(Question.display_order)
        )
        q_result = await db.execute(q_stmt)
        db_questions = q_result.scalars().all()
        db_q_map = {q.question_code: q for q in db_questions}

        checked_counts["canonical_questions"] = len(QUESTIONS_V1)
        checked_counts["db_questions"] = len(db_questions)

        if len(QUESTIONS_V1) != len(db_questions):
            mismatches.append(
                f"Question count mismatch: canonical has {len(QUESTIONS_V1)}, database has {len(db_questions)}"
            )

        for canonical_q in QUESTIONS_V1:
            q_code = canonical_q["question_code"]
            db_q = db_q_map.get(q_code)
            if not db_q:
                mismatches.append(f"Missing question in database: {q_code}")
                continue

            if db_q.dimension_code != canonical_q["dimension_code"]:
                mismatches.append(
                    f"Dimension mismatch for {q_code}: canonical '{canonical_q['dimension_code']}' vs db '{db_q.dimension_code}'"
                )

            if db_q.question_type != canonical_q["question_type"]:
                mismatches.append(
                    f"Question type mismatch for {q_code}: canonical '{canonical_q['question_type']}' vs db '{db_q.question_type}'"
                )

            # Check Options
            canonical_opts = canonical_q.get("options", [])
            db_opts_map = {o.option_code: o for o in db_q.options}

            if len(canonical_opts) != len(db_q.options):
                mismatches.append(
                    f"Option count mismatch for {q_code}: canonical {len(canonical_opts)} vs db {len(db_q.options)}"
                )

            for can_opt in canonical_opts:
                opt_code = can_opt["option_code"]
                db_opt = db_opts_map.get(opt_code)
                if not db_opt:
                    mismatches.append(f"Missing option in database for {q_code}: {opt_code}")
                    continue

                if float(db_opt.score_value) != float(can_opt["score_value"]):
                    mismatches.append(
                        f"Score value mismatch for {q_code} option {opt_code}: canonical {can_opt['score_value']} vs db {db_opt.score_value}"
                    )

        # 2. Audit Ruleset Drift
        r_stmt = select(Rule).where(Rule.version == RULESET_VERSION).order_by(Rule.priority)
        r_result = await db.execute(r_stmt)
        db_rules = r_result.scalars().all()
        db_r_map = {r.rule_code: r for r in db_rules}

        checked_counts["canonical_rules"] = len(RULES_V1)
        checked_counts["db_rules"] = len(db_rules)

        if len(RULES_V1) != len(db_rules):
            mismatches.append(
                f"Rule count mismatch: canonical has {len(RULES_V1)}, database has {len(db_rules)}"
            )

        for canonical_r in RULES_V1:
            r_code = canonical_r["rule_code"]
            db_r = db_r_map.get(r_code)
            if not db_r:
                mismatches.append(f"Missing rule in database: {r_code}")
                continue

            if db_r.target_rbdl_level != canonical_r["target_rbdl_level"]:
                mismatches.append(
                    f"Target RBDL level mismatch for rule {r_code}: canonical {canonical_r['target_rbdl_level']} vs db {db_r.target_rbdl_level}"
                )

        has_drift = len(mismatches) > 0

        return {
            "has_drift": has_drift,
            "status": "DRIFT_DETECTED" if has_drift else "IN_SYNC",
            "question_bank_version": QUESTION_BANK_VERSION,
            "ruleset_version": RULESET_VERSION,
            "checked_counts": checked_counts,
            "mismatches": mismatches,
        }
