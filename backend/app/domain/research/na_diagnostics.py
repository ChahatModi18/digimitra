"""N/A Rate Diagnostic Analyzer (Safeguard C-05).

Provides question-level and dimension-level N/A frequency analytics across submitted assessments.
"""

from typing import Any, Dict, List
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.rbdl.dimensions import RBDL_DIMENSIONS
from app.models.assessment import Assessment, AssessmentAnswer
from app.models.question import Question


class QuestionNARate(BaseModel):
    """N/A statistics for an individual question."""

    question_code: str
    dimension_code: str
    total_responses: int
    na_count: int
    na_percentage: float


class DimensionNARate(BaseModel):
    """N/A statistics for an entire dimension."""

    dimension_code: str
    dimension_name_en: str
    total_answers: int
    na_answers: int
    na_percentage: float


class NADiagnosticsReport(BaseModel):
    """Aggregate N/A usage report."""

    total_submitted_assessments: int
    total_assessment_answers: int
    overall_na_count: int
    overall_na_percentage: float
    dimension_rates: List[DimensionNARate]
    question_rates: List[QuestionNARate]


class NADiagnosticsService:
    """Computes empirical N/A usage rates across submitted assessments."""

    @classmethod
    async def get_na_diagnostics(cls, db: AsyncSession) -> NADiagnosticsReport:
        """Query answer table to calculate N/A distributions."""
        # 1. Count total submitted assessments
        sub_count_stmt = select(func.count(Assessment.id)).where(Assessment.status == "submitted")
        sub_res = await db.execute(sub_count_stmt)
        total_submitted = sub_res.scalar() or 0

        # 2. Query answers from submitted assessments
        ans_stmt = (
            select(
                Question.question_code,
                Question.dimension_code,
                AssessmentAnswer.text_answer,
            )
            .join(Question, AssessmentAnswer.question_id == Question.id)
            .join(Assessment, AssessmentAnswer.assessment_id == Assessment.id)
            .where(Assessment.status == "submitted")
        )
        ans_res = await db.execute(ans_stmt)
        rows = ans_res.all()

        total_answers = len(rows)
        overall_na = 0

        q_stats: Dict[str, Dict[str, Any]] = {}
        dim_stats: Dict[str, Dict[str, int]] = {
            d: {"total": 0, "na": 0} for d in RBDL_DIMENSIONS
        }

        for q_code, dim_code, text_ans in rows:
            is_na = text_ans is not None and str(text_ans).strip().upper() in ("N/A", "NA", "NOT_APPLICABLE")
            if is_na:
                overall_na += 1

            if q_code not in q_stats:
                q_stats[q_code] = {"dim": dim_code, "total": 0, "na": 0}
            q_stats[q_code]["total"] += 1
            if is_na:
                q_stats[q_code]["na"] += 1

            if dim_code in dim_stats:
                dim_stats[dim_code]["total"] += 1
                if is_na:
                    dim_stats[dim_code]["na"] += 1

        overall_pct = round((overall_na / total_answers * 100), 2) if total_answers > 0 else 0.0

        q_rates: List[QuestionNARate] = []
        for q_code, data in sorted(q_stats.items()):
            tot = data["total"]
            na_c = data["na"]
            pct = round((na_c / tot * 100), 2) if tot > 0 else 0.0
            q_rates.append(
                QuestionNARate(
                    question_code=q_code,
                    dimension_code=data["dim"],
                    total_responses=tot,
                    na_count=na_c,
                    na_percentage=pct,
                )
            )

        dim_rates: List[DimensionNARate] = []
        for dim_code, dim_meta in RBDL_DIMENSIONS.items():
            tot = dim_stats[dim_code]["total"]
            na_c = dim_stats[dim_code]["na"]
            pct = round((na_c / tot * 100), 2) if tot > 0 else 0.0
            dim_rates.append(
                DimensionNARate(
                    dimension_code=dim_code,
                    dimension_name_en=dim_meta.name_en,
                    total_answers=tot,
                    na_answers=na_c,
                    na_percentage=pct,
                )
            )

        return NADiagnosticsReport(
            total_submitted_assessments=total_submitted,
            total_assessment_answers=total_answers,
            overall_na_count=overall_na,
            overall_na_percentage=overall_pct,
            dimension_rates=dim_rates,
            question_rates=q_rates,
        )
