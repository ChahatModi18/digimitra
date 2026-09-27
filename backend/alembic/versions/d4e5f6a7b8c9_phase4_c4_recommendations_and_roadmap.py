"""Phase 4: C4 Recommendations and Phased Roadmap Schema.

Revision ID: d4e5f6a7b8c9
Revises: c3a1b2c3d4e5
Create Date: 2026-09-27 15:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.mysql import ENUM, JSON, INTEGER, SMALLINT, BIGINT


# revision identifiers, used by Alembic.
revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, None] = "c3a1b2c3d4e5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add missing fields to recommendations table
    # dimension_code, impact_level, prerequisite_json, reason_template_en, reason_template_hi
    op.execute(
        """
        DROP PROCEDURE IF EXISTS _migrate_recommendations_a4;
        """
    )
    op.execute(
        """
        CREATE PROCEDURE _migrate_recommendations_a4()
        BEGIN
            IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'digimitra_db' AND TABLE_NAME = 'recommendations' AND COLUMN_NAME = 'dimension_code') THEN
                ALTER TABLE recommendations
                ADD COLUMN dimension_code VARCHAR(50) NULL AFTER category,
                ADD COLUMN impact_level ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium' AFTER estimated_effort_level,
                ADD COLUMN prerequisite_json JSON NULL AFTER impact_level,
                ADD COLUMN reason_template_en TEXT NULL AFTER prerequisite_json,
                ADD COLUMN reason_template_hi TEXT NULL AFTER reason_template_en;
            END IF;
        END;
        """
    )
    op.execute("CALL _migrate_recommendations_a4();")
    op.execute("DROP PROCEDURE IF EXISTS _migrate_recommendations_a4;")

    # 2. Add priority and explainability snapshot fields to business_recommendations table
    op.execute(
        """
        DROP PROCEDURE IF EXISTS _migrate_biz_recommendations_a4;
        """
    )
    op.execute(
        """
        CREATE PROCEDURE _migrate_biz_recommendations_a4()
        BEGIN
            IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'digimitra_db' AND TABLE_NAME = 'business_recommendations' AND COLUMN_NAME = 'priority_score') THEN
                ALTER TABLE business_recommendations
                ADD COLUMN priority_score DECIMAL(5, 2) NULL AFTER rank_order,
                ADD COLUMN impact_score DECIMAL(4, 2) NULL AFTER priority_score,
                ADD COLUMN feasibility_score DECIMAL(4, 2) NULL AFTER impact_score,
                ADD COLUMN cost_score DECIMAL(4, 2) NULL AFTER feasibility_score,
                ADD COLUMN readiness_score DECIMAL(4, 2) NULL AFTER cost_score,
                ADD COLUMN reason_en TEXT NULL AFTER readiness_score,
                ADD COLUMN reason_hi TEXT NULL AFTER reason_en,
                ADD COLUMN evidence_json JSON NULL AFTER reason_hi;
            END IF;
        END;
        """
    )
    op.execute("CALL _migrate_biz_recommendations_a4();")
    op.execute("DROP PROCEDURE IF EXISTS _migrate_biz_recommendations_a4;")

    # 3. Add descriptions and skip_reason to roadmap_tasks table
    op.execute(
        """
        DROP PROCEDURE IF EXISTS _migrate_roadmap_tasks_a4;
        """
    )
    op.execute(
        """
        CREATE PROCEDURE _migrate_roadmap_tasks_a4()
        BEGIN
            IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'digimitra_db' AND TABLE_NAME = 'roadmap_tasks' AND COLUMN_NAME = 'description_en') THEN
                ALTER TABLE roadmap_tasks
                ADD COLUMN description_en TEXT NULL AFTER title_hi,
                ADD COLUMN description_hi TEXT NULL AFTER description_en,
                ADD COLUMN skip_reason TEXT NULL AFTER status;
            END IF;
        END;
        """
    )
    op.execute("CALL _migrate_roadmap_tasks_a4();")
    op.execute("DROP PROCEDURE IF EXISTS _migrate_roadmap_tasks_a4;")


def downgrade() -> None:
    pass
