"""Phase 7: Requirement Profile V1 and Budget Feasibility Schema (Additive).

Revision ID: g7a8b9c0d1e2
Revises: f6a7b8c9d0e1
Create Date: 2026-09-28 15:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "g7a8b9c0d1e2"
down_revision: Union[str, None] = "f6a7b8c9d0e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create requirement_profiles table
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS requirement_profiles (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            assessment_id BIGINT UNSIGNED NOT NULL,
            business_id BIGINT UNSIGNED NOT NULL,
            profile_version INT NOT NULL DEFAULT 1,
            business_goal VARCHAR(50) NOT NULL,
            primary_pain_point VARCHAR(50) NOT NULL,
            urgency VARCHAR(30) NOT NULL,
            budget_tier VARCHAR(30) NOT NULL,
            existing_tools JSON NULL,
            preferred_solution_type VARCHAR(50) NULL,
            created_by BIGINT UNSIGNED NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            CONSTRAINT uq_requirement_profile_assessment UNIQUE (assessment_id),
            CONSTRAINT fk_req_profile_assessment FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE CASCADE,
            CONSTRAINT fk_req_profile_business FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE RESTRICT,
            CONSTRAINT fk_req_profile_user FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL,
            INDEX idx_req_profile_business (business_id),
            INDEX idx_req_profile_version (profile_version)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )

    # 2. Add feasibility and traceability columns to business_recommendations table
    op.execute(
        """
        DROP PROCEDURE IF EXISTS _migrate_biz_recs_feasibility;
        """
    )
    op.execute(
        """
        CREATE PROCEDURE _migrate_biz_recs_feasibility()
        BEGIN
            IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'business_recommendations' AND COLUMN_NAME = 'feasibility_status') THEN
                ALTER TABLE business_recommendations
                ADD COLUMN feasibility_status VARCHAR(30) NOT NULL DEFAULT 'FEASIBLE_NOW' AFTER status,
                ADD COLUMN budget_fit VARCHAR(30) NULL AFTER feasibility_status,
                ADD COLUMN traceability_json JSON NULL AFTER evidence_json;
            END IF;
        END;
        """
    )
    op.execute("CALL _migrate_biz_recs_feasibility();")
    op.execute("DROP PROCEDURE IF EXISTS _migrate_biz_recs_feasibility;")

    # 3. Add requirement and recommendation evaluation columns to consultant_blind_labels table
    op.execute(
        """
        DROP PROCEDURE IF EXISTS _migrate_consultant_labels_v1;
        """
    )
    op.execute(
        """
        CREATE PROCEDURE _migrate_consultant_labels_v1()
        BEGIN
            IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'consultant_blind_labels' AND COLUMN_NAME = 'labeled_business_goal') THEN
                ALTER TABLE consultant_blind_labels
                ADD COLUMN labeled_business_goal VARCHAR(50) NULL AFTER labeled_rbdl_level,
                ADD COLUMN labeled_primary_pain_point VARCHAR(50) NULL AFTER labeled_business_goal,
                ADD COLUMN labeled_budget_tier VARCHAR(30) NULL AFTER labeled_primary_pain_point,
                ADD COLUMN labeled_urgency VARCHAR(30) NULL AFTER labeled_budget_tier,
                ADD COLUMN recommendation_ratings_json JSON NULL AFTER rationales;
            END IF;
        END;
        """
    )
    op.execute("CALL _migrate_consultant_labels_v1();")
    op.execute("DROP PROCEDURE IF EXISTS _migrate_consultant_labels_v1;")


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS requirement_profiles;")

    op.execute(
        """
        DROP PROCEDURE IF EXISTS _downgrade_biz_recs_feasibility;
        """
    )
    op.execute(
        """
        CREATE PROCEDURE _downgrade_biz_recs_feasibility()
        BEGIN
            IF EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'business_recommendations' AND COLUMN_NAME = 'feasibility_status') THEN
                ALTER TABLE business_recommendations
                DROP COLUMN feasibility_status,
                DROP COLUMN budget_fit,
                DROP COLUMN traceability_json;
            END IF;
        END;
        """
    )
    op.execute("CALL _downgrade_biz_recs_feasibility();")
    op.execute("DROP PROCEDURE IF EXISTS _downgrade_biz_recs_feasibility;")

    op.execute(
        """
        DROP PROCEDURE IF EXISTS _downgrade_consultant_labels_v1;
        """
    )
    op.execute(
        """
        CREATE PROCEDURE _downgrade_consultant_labels_v1()
        BEGIN
            IF EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'consultant_blind_labels' AND COLUMN_NAME = 'labeled_business_goal') THEN
                ALTER TABLE consultant_blind_labels
                DROP COLUMN labeled_business_goal,
                DROP COLUMN labeled_primary_pain_point,
                DROP COLUMN labeled_budget_tier,
                DROP COLUMN labeled_urgency,
                DROP COLUMN recommendation_ratings_json;
            END IF;
        END;
        """
    )
    op.execute("CALL _downgrade_consultant_labels_v1();")
    op.execute("DROP PROCEDURE IF EXISTS _downgrade_consultant_labels_v1;")
