"""Phase 6: Research Hardening Safeguards Schema (Additive).

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-09-28 13:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f6a7b8c9d0e1"
down_revision: Union[str, None] = "e5f6a7b8c9d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Additive columns to assessments table: administration_mode, respondent_role, reassessment_reason
    op.execute(
        """
        DROP PROCEDURE IF EXISTS _migrate_assessments_hardening;
        """
    )
    op.execute(
        """
        CREATE PROCEDURE _migrate_assessments_hardening()
        BEGIN
            IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'assessments' AND COLUMN_NAME = 'administration_mode') THEN
                ALTER TABLE assessments
                ADD COLUMN administration_mode VARCHAR(30) NULL AFTER language_used,
                ADD COLUMN respondent_role VARCHAR(30) NULL AFTER administration_mode,
                ADD COLUMN reassessment_reason VARCHAR(50) NULL AFTER respondent_role;
            END IF;
        END;
        """
    )
    op.execute("CALL _migrate_assessments_hardening();")
    op.execute("DROP PROCEDURE IF EXISTS _migrate_assessments_hardening;")

    # 2. Additive columns to classification_results table: na_sensitive, na_hypothetical_level
    op.execute(
        """
        DROP PROCEDURE IF EXISTS _migrate_classification_results_hardening;
        """
    )
    op.execute(
        """
        CREATE PROCEDURE _migrate_classification_results_hardening()
        BEGIN
            IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'classification_results' AND COLUMN_NAME = 'na_sensitive') THEN
                ALTER TABLE classification_results
                ADD COLUMN na_sensitive BOOLEAN NOT NULL DEFAULT FALSE AFTER ruleset_version,
                ADD COLUMN na_hypothetical_level SMALLINT NULL AFTER na_sensitive;
            END IF;
        END;
        """
    )
    op.execute("CALL _migrate_classification_results_hardening();")
    op.execute("DROP PROCEDURE IF EXISTS _migrate_classification_results_hardening;")

    # 3. Create consultant_blind_labels table (for blind consultant-labeling technical foundation I-07)
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS consultant_blind_labels (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            assessment_id BIGINT UNSIGNED NOT NULL,
            consultant_user_id BIGINT UNSIGNED NOT NULL,
            labeled_rbdl_level TINYINT UNSIGNED NOT NULL,
            labeling_protocol_version VARCHAR(20) NOT NULL DEFAULT '1.0',
            rationales TEXT NULL,
            labeled_at DATETIME NOT NULL,
            created_at DATETIME NOT NULL,
            CONSTRAINT fk_cbl_assessment FOREIGN KEY (assessment_id) REFERENCES assessments (id) ON DELETE CASCADE,
            CONSTRAINT fk_cbl_consultant FOREIGN KEY (consultant_user_id) REFERENCES users (id) ON DELETE RESTRICT,
            CONSTRAINT fk_cbl_level FOREIGN KEY (labeled_rbdl_level) REFERENCES rbdl_levels (id) ON DELETE RESTRICT,
            CONSTRAINT uq_cbl_assessment_consultant UNIQUE (assessment_id, consultant_user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS consultant_blind_labels;")

    op.execute(
        """
        DROP PROCEDURE IF EXISTS _downgrade_classification_results_hardening;
        """
    )
    op.execute(
        """
        CREATE PROCEDURE _downgrade_classification_results_hardening()
        BEGIN
            IF EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'classification_results' AND COLUMN_NAME = 'na_sensitive') THEN
                ALTER TABLE classification_results
                DROP COLUMN na_sensitive,
                DROP COLUMN na_hypothetical_level;
            END IF;
        END;
        """
    )
    op.execute("CALL _downgrade_classification_results_hardening();")
    op.execute("DROP PROCEDURE IF EXISTS _downgrade_classification_results_hardening;")

    op.execute(
        """
        DROP PROCEDURE IF EXISTS _downgrade_assessments_hardening;
        """
    )
    op.execute(
        """
        CREATE PROCEDURE _downgrade_assessments_hardening()
        BEGIN
            IF EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'assessments' AND COLUMN_NAME = 'administration_mode') THEN
                ALTER TABLE assessments
                DROP COLUMN administration_mode,
                DROP COLUMN respondent_role,
                DROP COLUMN reassessment_reason;
            END IF;
        END;
        """
    )
    op.execute("CALL _downgrade_assessments_hardening();")
    op.execute("DROP PROCEDURE IF EXISTS _downgrade_assessments_hardening;")
