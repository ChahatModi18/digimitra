"""Phase 2: Fix question versioning to support multi-version questions.

Revision ID: c3a1b2c3d4e5
Revises: b4d29e71f5c3
Create Date: 2026-09-27 14:18:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c3a1b2c3d4e5"
down_revision: Union[str, None] = "b4d29e71f5c3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Drop old single-column unique constraint on questions(question_code)
    try:
        op.drop_constraint("uq_question_code", "questions", type_="unique")
    except Exception:
        try:
            op.drop_index("uq_question_code", table_name="questions")
        except Exception:
            pass

    # 2. Add composite unique constraint for question versioning (question_code, version)
    op.create_unique_constraint(
        "uq_question_code_version",
        "questions",
        ["question_code", "version"],
    )

    # 3. Add non-unique index on question_code for fast lookup across versions
    try:
        op.create_index("idx_questions_code", "questions", ["question_code"])
    except Exception:
        pass


def downgrade() -> None:
    try:
        op.drop_index("idx_questions_code", table_name="questions")
    except Exception:
        pass

    op.drop_constraint("uq_question_code_version", "questions", type_="unique")
    op.create_unique_constraint("uq_question_code", "questions", ["question_code"])
