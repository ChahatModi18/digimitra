"""Expand Business Categories Taxonomy (Additive).

Revision ID: i9c0d1e2f3a4
Revises: h8b9c0d1e2f3
Create Date: 2026-09-29 15:20:00.000000

Adds extended taxonomy columns to business_categories table:
- code
- sector_code
- category_code
- subcategory_code
- typical_needs_json
- typical_tools_json
- typical_digitalization_paths_json
Populates comprehensive taxonomy nodes across all 11 MSME sectors.
"""
from typing import Sequence, Union
import json
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import text
from app.domain.taxonomy.categories import TAXONOMY_CATALOG

# revision identifiers, used by Alembic.
revision: str = 'i9c0d1e2f3a4'
down_revision: Union[str, None] = 'h8b9c0d1e2f3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()

    # 1. Add columns to business_categories if they do not exist
    columns = [
        ("code", "VARCHAR(50) NULL UNIQUE"),
        ("sector_code", "VARCHAR(50) NULL"),
        ("category_code", "VARCHAR(50) NULL"),
        ("subcategory_code", "VARCHAR(50) NULL"),
        ("typical_needs_json", "JSON NULL"),
        ("typical_tools_json", "JSON NULL"),
        ("typical_digitalization_paths_json", "JSON NULL"),
    ]

    for col_name, col_type in columns:
        check_col = conn.execute(
            text(
                "SELECT COUNT(*) FROM information_schema.COLUMNS "
                "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'business_categories' "
                f"AND COLUMN_NAME = '{col_name}'"
            )
        ).scalar()
        if not check_col:
            op.execute(f"ALTER TABLE business_categories ADD COLUMN {col_name} {col_type};")

    # Add indexes if not exist
    for idx_col in ["sector_code", "category_code", "subcategory_code"]:
        try:
            op.execute(f"CREATE INDEX idx_business_categories_{idx_col} ON business_categories ({idx_col});")
        except Exception:
            pass

    # 2. Seed / Update taxonomy nodes
    # Update existing categories 1-5 with default codes if empty
    op.execute(
        "UPDATE business_categories SET code = 'RETAIL_GENERAL', sector_code = 'RETAIL' WHERE id = 1 AND code IS NULL;"
    )
    op.execute(
        "UPDATE business_categories SET code = 'MFG_GENERAL', sector_code = 'MANUFACTURING' WHERE id = 2 AND code IS NULL;"
    )
    op.execute(
        "UPDATE business_categories SET code = 'SERVICES_GENERAL', sector_code = 'SERVICES' WHERE id = 3 AND code IS NULL;"
    )
    op.execute(
        "UPDATE business_categories SET code = 'FOOD_GENERAL', sector_code = 'FOOD_HOSPITALITY' WHERE id = 4 AND code IS NULL;"
    )
    op.execute(
        "UPDATE business_categories SET code = 'OTHER_GENERAL', sector_code = 'OTHER_MICRO' WHERE id = 5 AND code IS NULL;"
    )

    # Insert comprehensive taxonomy nodes
    insert_stmt = text(
        """
        INSERT INTO business_categories (
            code, sector_code, category_code, subcategory_code,
            name_en, name_hi, description_en, description_hi,
            typical_needs_json, typical_tools_json, typical_digitalization_paths_json,
            is_active
        )
        VALUES (
            :code, :sector_code, :category_code, :subcategory_code,
            :name_en, :name_hi, :description_en, :description_hi,
            :typical_needs_json, :typical_tools_json, :typical_digitalization_paths_json,
            1
        )
        ON DUPLICATE KEY UPDATE
            sector_code = VALUES(sector_code),
            category_code = VALUES(category_code),
            subcategory_code = VALUES(subcategory_code),
            name_en = VALUES(name_en),
            name_hi = VALUES(name_hi),
            description_en = VALUES(description_en),
            description_hi = VALUES(description_hi),
            typical_needs_json = VALUES(typical_needs_json),
            typical_tools_json = VALUES(typical_tools_json),
            typical_digitalization_paths_json = VALUES(typical_digitalization_paths_json);
        """
    )

    for node in TAXONOMY_CATALOG:
        conn.execute(
            insert_stmt,
            {
                "code": node.subcategory_code,
                "sector_code": node.sector_code,
                "category_code": node.category_code,
                "subcategory_code": node.subcategory_code,
                "name_en": node.display_name_en,
                "name_hi": node.display_name_hi,
                "description_en": node.description_en,
                "description_hi": node.description_hi,
                "typical_needs_json": json.dumps(node.typical_needs, ensure_ascii=False),
                "typical_tools_json": json.dumps(node.typical_tools, ensure_ascii=False),
                "typical_digitalization_paths_json": json.dumps(node.typical_digitalization_paths, ensure_ascii=False),
            },
        )


def downgrade() -> None:
    pass
