"""Phase 5: C5 ML Models Schema Enhancements (Additive).

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-09-27 23:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.mysql import JSON, VARCHAR, INTEGER


# revision identifiers, used by Alembic.
revision: str = "e5f6a7b8c9d0"
down_revision: Union[str, None] = "d4e5f6a7b8c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add 4 additive nullable columns to ml_models for experiment tracking & provenance
    op.execute(
        """
        DROP PROCEDURE IF EXISTS _migrate_ml_models_a7;
        """
    )
    op.execute(
        """
        CREATE PROCEDURE _migrate_ml_models_a7()
        BEGIN
            IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'digimitra_db' AND TABLE_NAME = 'ml_models' AND COLUMN_NAME = 'ruleset_version_used') THEN
                ALTER TABLE ml_models
                ADD COLUMN ruleset_version_used JSON NULL AFTER metrics_json,
                ADD COLUMN code_commit_hash VARCHAR(40) NULL AFTER ruleset_version_used,
                ADD COLUMN random_seed INT NULL AFTER code_commit_hash,
                ADD COLUMN dataset_content_hash VARCHAR(64) NULL AFTER random_seed;
            END IF;
        END;
        """
    )
    op.execute("CALL _migrate_ml_models_a7();")
    op.execute("DROP PROCEDURE IF EXISTS _migrate_ml_models_a7;")


def downgrade() -> None:
    op.execute(
        """
        DROP PROCEDURE IF EXISTS _downgrade_ml_models_a7;
        """
    )
    op.execute(
        """
        CREATE PROCEDURE _downgrade_ml_models_a7()
        BEGIN
            IF EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'digimitra_db' AND TABLE_NAME = 'ml_models' AND COLUMN_NAME = 'ruleset_version_used') THEN
                ALTER TABLE ml_models
                DROP COLUMN ruleset_version_used,
                DROP COLUMN code_commit_hash,
                DROP COLUMN random_seed,
                DROP COLUMN dataset_content_hash;
            END IF;
        END;
        """
    )
    op.execute("CALL _downgrade_ml_models_a7();")
    op.execute("DROP PROCEDURE IF EXISTS _downgrade_ml_models_a7;")
