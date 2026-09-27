"""Recommendation and Roadmap Service (Claude C4).

Orchestrates:
1. Eligibility filtering (One-level-above ceiling, prerequisites, exclusions).
2. Priority scoring and deterministic ranking.
3. Bilingual explainable reason generation.
4. Phased roadmap generation (Quick Wins, Core Next Steps, Longer Term).
5. Versioned roadmap lifecycle management & task progress tracking.
"""

from datetime import datetime, timezone
from decimal import Decimal
import logging
from typing import Any, Dict, List, Optional, Set, Tuple
from fastapi import HTTPException, status
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.recommendations.eligibility import RecommendationEligibilityEngine
from app.domain.recommendations.ranking import RecommendationRankingEngine, RankedRecommendation
from app.domain.recommendations.reasons import RecommendationReasonGenerator
from app.domain.recommendations.roadmap_generator import RoadmapGeneratorEngine, PhasedRoadmapResult
from app.models.assessment import Assessment, AssessmentScore
from app.models.business import Business
from app.models.classification_result import ClassificationResult
from app.models.progress_log import ProgressLog
from app.models.recommendation import BusinessRecommendation, Recommendation
from app.models.roadmap import Roadmap, RoadmapTask
from app.schemas.recommendation import (
    BusinessRecommendationRead,
    BusinessRecommendationsResponse,
)
from app.schemas.roadmap import (
    PhasedRoadmapGroup,
    ProgressLogRead,
    ProgressSummaryRead,
    RoadmapRead,
    RoadmapSummaryRead,
    RoadmapTaskRead,
    RoadmapTaskStatusUpdate,
)

logger = logging.getLogger(__name__)


class RecommendationService:
    """Service layer for recommendations and roadmaps."""

    @classmethod
    async def verify_business_ownership(
        cls,
        db: AsyncSession,
        business_id: int,
        user_id: int,
    ) -> Business:
        """Verify that the business exists and belongs to the authenticated user."""
        res = await db.execute(
            select(Business)
            .options(selectinload(Business.category))
            .where(Business.id == business_id, Business.owner_user_id == user_id)
        )
        business = res.scalar_one_or_none()
        if not business:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Business ID {business_id} not found or access unauthorized.",
            )
        return business

    @classmethod
    async def generate_recommendations_and_roadmap(
        cls,
        db: AsyncSession,
        assessment_id: int,
        user_id: Optional[int] = None,
    ) -> RoadmapRead:
        """Generate ranked recommendations and a phased roadmap for a submitted assessment."""
        # 1. Load Assessment and Primary Classification Result
        stmt = (
            select(Assessment)
            .options(
                selectinload(Assessment.business).selectinload(Business.category),
                selectinload(Assessment.classification_results),
                selectinload(Assessment.scores),
            )
            .where(Assessment.id == assessment_id)
        )
        res = await db.execute(stmt)
        assessment = res.scalar_one_or_none()

        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Assessment ID {assessment_id} not found.",
            )

        if user_id is not None and assessment.business.owner_user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not own this business.",
            )

        # Find primary classification result
        cr_query = await db.execute(
            select(ClassificationResult).where(
                ClassificationResult.assessment_id == assessment_id,
                ClassificationResult.is_primary == True,
            )
        )
        primary_cr = cr_query.scalar_one_or_none()
        if not primary_cr:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assessment has not been classified yet. Submit assessment first.",
            )

        business = assessment.business
        current_rbdl_level = primary_cr.rbdl_level
        target_rbdl_level = min(3, current_rbdl_level + 1)
        if current_rbdl_level == 3:
            target_rbdl_level = 3

        # 2. Extract 9 Dimension Scores & NA Dimensions
        dim_scores: Dict[str, float] = {}
        na_dims: Set[str] = set()
        for s in assessment.scores:
            dim_scores[s.dimension_code] = float(s.raw_score)

        # 3. Check for Previously Completed Tasks across historical roadmaps for this business
        past_tasks_res = await db.execute(
            select(RoadmapTask)
            .join(Roadmap, RoadmapTask.roadmap_id == Roadmap.id)
            .where(
                Roadmap.business_id == business.id,
                RoadmapTask.status == "completed",
            )
            .options(selectinload(RoadmapTask.recommendation))
        )
        completed_rec_codes: Set[str] = {
            t.recommendation.recommendation_code
            for t in past_tasks_res.scalars().all()
            if t.recommendation
        }

        # 4. Load Active Recommendations Catalog
        rec_res = await db.execute(
            select(Recommendation).where(Recommendation.is_active == True)
        )
        all_recs = rec_res.scalars().all()
        recs_by_code = {r.recommendation_code: r for r in all_recs}

        business_profile = {
            "business_id": business.id,
            "category_id": business.category_id,
            "category_name": business.category.name_en if business.category else "General",
            "business_size": business.business_size,
            "state": business.state,
            "district": business.district,
        }

        # 5. Filter Eligible Recommendations
        eligible_rec_dicts: List[Dict[str, Any]] = []
        for r in all_recs:
            r_dict = {
                "id": r.id,
                "recommendation_code": r.recommendation_code,
                "target_rbdl_level": r.target_rbdl_level,
                "dimension_code": r.dimension_code or r.category,
                "category": r.category or "",
                "title_en": r.title_en,
                "title_hi": r.title_hi,
                "description_en": r.description_en,
                "description_hi": r.description_hi,
                "estimated_cost_level": r.estimated_cost_level,
                "estimated_effort_level": r.estimated_effort_level,
                "impact_level": r.impact_level,
                "prerequisite_json": r.prerequisite_json,
                "reason_template_en": r.reason_template_en,
                "reason_template_hi": r.reason_template_hi,
                "default_priority": r.default_priority,
            }
            elig_res = RecommendationEligibilityEngine.evaluate_eligibility(
                recommendation=r_dict,
                current_rbdl_level=current_rbdl_level,
                dimension_scores=dim_scores,
                business_profile=business_profile,
                completed_recommendation_codes=completed_rec_codes,
                na_dimensions=na_dims,
            )
            if elig_res.is_eligible:
                # Generate bilingual reasons
                reason_en, reason_hi = RecommendationReasonGenerator.generate_bilingual_reason(
                    recommendation=r_dict,
                    target_rbdl_level=target_rbdl_level,
                    dimension_scores=dim_scores,
                )
                r_dict["reason_en"] = reason_en
                r_dict["reason_hi"] = reason_hi
                eligible_rec_dicts.append(r_dict)

        # 6. Rank Eligible Recommendations
        ranked_recs = RecommendationRankingEngine.rank_recommendations(
            eligible_recommendations=eligible_rec_dicts,
            dimension_scores=dim_scores,
        )

        # 7. Persist BusinessRecommendation instances
        # Delete any existing instances for this classification result
        await db.execute(
            delete(BusinessRecommendation).where(
                BusinessRecommendation.classification_result_id == primary_cr.id
            )
        )
        for ranked_item in ranked_recs:
            db_rec = recs_by_code.get(ranked_item.recommendation_code)
            if db_rec:
                b = ranked_item.priority_breakdown
                biz_rec = BusinessRecommendation(
                    business_id=business.id,
                    classification_result_id=primary_cr.id,
                    recommendation_id=db_rec.id,
                    rank_order=ranked_item.rank_order,
                    priority_score=Decimal(str(b.final_priority_score)),
                    impact_score=Decimal(str(b.impact_component)),
                    feasibility_score=Decimal(str(b.feasibility_component)),
                    cost_score=Decimal(str(b.cost_component)),
                    readiness_score=Decimal(str(b.readiness_component)),
                    reason_en=ranked_item.reason_en,
                    reason_hi=ranked_item.reason_hi,
                    evidence_json={
                        "breakdown": b.model_dump(),
                        "dimension_code": ranked_item.dimension_code,
                        "actual_dimension_score": dim_scores.get(ranked_item.dimension_code, 0.0),
                    },
                    status="suggested",
                    generated_at=datetime.now(timezone.utc).replace(tzinfo=None),
                )
                db.add(biz_rec)

        # 8. Phased Roadmap Generation
        phased_result = RoadmapGeneratorEngine.generate_roadmap(
            ranked_recommendations=ranked_recs,
            target_rbdl_level=target_rbdl_level,
        )

        # 9. Manage Versioning: Supersede previous active roadmaps
        prior_roadmaps_res = await db.execute(
            select(Roadmap).where(
                Roadmap.business_id == business.id,
                Roadmap.status == "active",
            )
        )
        for prior_rm in prior_roadmaps_res.scalars().all():
            prior_rm.status = "superseded"

        # Determine version number
        all_rm_res = await db.execute(
            select(Roadmap.version).where(Roadmap.business_id == business.id)
        )
        existing_versions = all_rm_res.scalars().all()
        new_version = max(existing_versions, default=0) + 1

        # Create new active Roadmap
        new_roadmap = Roadmap(
            business_id=business.id,
            classification_result_id=primary_cr.id,
            version=new_version,
            status="active",
            generated_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )
        db.add(new_roadmap)
        await db.flush()

        # Create Roadmap Tasks
        for t in phased_result.all_tasks:
            db_rec = recs_by_code.get(t.recommendation_code)
            db_task = RoadmapTask(
                roadmap_id=new_roadmap.id,
                recommendation_id=db_rec.id if db_rec else None,
                title_en=t.title_en,
                title_hi=t.title_hi,
                description_en=t.description_en,
                description_hi=t.description_hi,
                phase_number=t.phase_number,
                sequence_order=t.sequence_order,
                status="pending",
            )
            db.add(db_task)

        await db.commit()
        await db.refresh(new_roadmap)

        logger.info(
            f"Generated Roadmap ID {new_roadmap.id} (v{new_version}) for Business ID {business.id} with {len(phased_result.all_tasks)} tasks."
        )

        return await cls._build_roadmap_read(
            db=db,
            roadmap=new_roadmap,
            current_rbdl_level=current_rbdl_level,
            target_rbdl_level=target_rbdl_level,
        )

    @classmethod
    async def get_recommendations_for_business(
        cls,
        db: AsyncSession,
        business_id: int,
        user_id: int,
    ) -> BusinessRecommendationsResponse:
        """Retrieve ranked recommendations for a business from its latest classification result."""
        business = await cls.verify_business_ownership(db, business_id, user_id)

        # Find latest primary classification result
        cr_res = await db.execute(
            select(ClassificationResult)
            .join(Assessment, ClassificationResult.assessment_id == Assessment.id)
            .where(
                Assessment.business_id == business_id,
                ClassificationResult.is_primary == True,
            )
            .order_by(ClassificationResult.classified_at.desc())
        )
        latest_cr = cr_res.scalar_one_or_none()

        if not latest_cr:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No completed digital assessment found for this business. Please take the assessment first.",
            )

        # Load BusinessRecommendations
        biz_recs_res = await db.execute(
            select(BusinessRecommendation)
            .options(selectinload(BusinessRecommendation.recommendation))
            .where(BusinessRecommendation.classification_result_id == latest_cr.id)
            .order_by(BusinessRecommendation.rank_order.asc())
        )
        biz_recs = biz_recs_res.scalars().all()

        # If none exist yet, generate them
        if not biz_recs:
            await cls.generate_recommendations_and_roadmap(
                db=db,
                assessment_id=latest_cr.assessment_id,
                user_id=user_id,
            )
            # Reload
            biz_recs_res = await db.execute(
                select(BusinessRecommendation)
                .options(selectinload(BusinessRecommendation.recommendation))
                .where(BusinessRecommendation.classification_result_id == latest_cr.id)
                .order_by(BusinessRecommendation.rank_order.asc())
            )
            biz_recs = biz_recs_res.scalars().all()

        current_lvl = latest_cr.rbdl_level
        target_lvl = min(3, current_lvl + 1)
        if current_lvl == 3:
            target_lvl = 3

        rec_reads: List[BusinessRecommendationRead] = []
        for br in biz_recs:
            rec = br.recommendation
            rec_reads.append(
                BusinessRecommendationRead(
                    id=br.id,
                    business_id=br.business_id,
                    classification_result_id=br.classification_result_id,
                    recommendation_id=br.recommendation_id,
                    recommendation_code=rec.recommendation_code if rec else "",
                    dimension_code=rec.dimension_code if rec else None,
                    category=rec.category if rec else None,
                    target_rbdl_level=rec.target_rbdl_level if rec else target_lvl,
                    title_en=rec.title_en if rec else "",
                    title_hi=rec.title_hi if rec else "",
                    description_en=rec.description_en if rec else "",
                    description_hi=rec.description_hi if rec else "",
                    rank_order=br.rank_order,
                    priority_score=float(br.priority_score) if br.priority_score is not None else None,
                    impact_score=float(br.impact_score) if br.impact_score is not None else None,
                    feasibility_score=float(br.feasibility_score) if br.feasibility_score is not None else None,
                    cost_score=float(br.cost_score) if br.cost_score is not None else None,
                    readiness_score=float(br.readiness_score) if br.readiness_score is not None else None,
                    estimated_cost_level=rec.estimated_cost_level if rec else "low",
                    estimated_effort_level=rec.estimated_effort_level if rec else "low",
                    impact_level=rec.impact_level if rec else "medium",
                    reason_en=br.reason_en,
                    reason_hi=br.reason_hi,
                    evidence_json=br.evidence_json,
                    status=br.status,
                    generated_at=br.generated_at,
                )
            )

        return BusinessRecommendationsResponse(
            business_id=business_id,
            assessment_id=latest_cr.assessment_id,
            current_rbdl_level=current_lvl,
            target_rbdl_level=target_lvl,
            total_recommendations=len(rec_reads),
            recommendations=rec_reads,
        )

    @classmethod
    async def get_roadmap_for_business(
        cls,
        db: AsyncSession,
        business_id: int,
        user_id: int,
    ) -> RoadmapRead:
        """Retrieve active digital transformation roadmap for a business."""
        await cls.verify_business_ownership(db, business_id, user_id)

        # Load active roadmap
        rm_res = await db.execute(
            select(Roadmap)
            .options(
                selectinload(Roadmap.tasks).selectinload(RoadmapTask.recommendation),
                selectinload(Roadmap.classification_result),
            )
            .where(
                Roadmap.business_id == business_id,
                Roadmap.status == "active",
            )
            .order_by(Roadmap.version.desc())
        )
        active_rm = rm_res.scalar_one_or_none()

        if not active_rm:
            # Check if there is a primary classification result to generate from
            cr_res = await db.execute(
                select(ClassificationResult)
                .join(Assessment, ClassificationResult.assessment_id == Assessment.id)
                .where(
                    Assessment.business_id == business_id,
                    ClassificationResult.is_primary == True,
                )
                .order_by(ClassificationResult.classified_at.desc())
            )
            latest_cr = cr_res.scalar_one_or_none()
            if latest_cr:
                return await cls.generate_recommendations_and_roadmap(
                    db=db,
                    assessment_id=latest_cr.assessment_id,
                    user_id=user_id,
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No active roadmap or completed assessment found for this business.",
                )

        cr = active_rm.classification_result
        current_lvl = cr.rbdl_level if cr else 0
        target_lvl = min(3, current_lvl + 1)
        if current_lvl == 3:
            target_lvl = 3

        return await cls._build_roadmap_read(
            db=db,
            roadmap=active_rm,
            current_rbdl_level=current_lvl,
            target_rbdl_level=target_lvl,
        )

    @classmethod
    async def get_roadmap_history(
        cls,
        db: AsyncSession,
        business_id: int,
        user_id: int,
    ) -> List[RoadmapSummaryRead]:
        """Retrieve version history of all roadmaps generated for a business."""
        await cls.verify_business_ownership(db, business_id, user_id)

        rm_res = await db.execute(
            select(Roadmap)
            .options(selectinload(Roadmap.tasks))
            .where(Roadmap.business_id == business_id)
            .order_by(Roadmap.version.desc())
        )
        roadmaps = rm_res.scalars().all()

        summaries: List[RoadmapSummaryRead] = []
        for rm in roadmaps:
            total = len(rm.tasks)
            completed = sum(1 for t in rm.tasks if t.status == "completed")
            in_prog = sum(1 for t in rm.tasks if t.status == "in_progress")
            skipped = sum(1 for t in rm.tasks if t.status == "skipped")
            pending = sum(1 for t in rm.tasks if t.status == "pending")
            pct = round((completed / total) * 100.0, 1) if total > 0 else 0.0

            summaries.append(
                RoadmapSummaryRead(
                    id=rm.id,
                    business_id=rm.business_id,
                    version=rm.version,
                    status=rm.status,
                    total_tasks=total,
                    completed_tasks=completed,
                    in_progress_tasks=in_prog,
                    pending_tasks=pending,
                    skipped_tasks=skipped,
                    completion_percentage=pct,
                    generated_at=rm.generated_at,
                )
            )
        return summaries

    @classmethod
    async def get_roadmap_by_id(
        cls,
        db: AsyncSession,
        roadmap_id: int,
        user_id: int,
    ) -> RoadmapRead:
        """Retrieve a specific historical or active roadmap by ID."""
        rm_res = await db.execute(
            select(Roadmap)
            .options(
                selectinload(Roadmap.tasks).selectinload(RoadmapTask.recommendation),
                selectinload(Roadmap.classification_result),
                selectinload(Roadmap.business),
            )
            .where(Roadmap.id == roadmap_id)
        )
        roadmap = rm_res.scalar_one_or_none()
        if not roadmap:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Roadmap ID {roadmap_id} not found.",
            )

        if roadmap.business.owner_user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You do not own this business.",
            )

        cr = roadmap.classification_result
        current_lvl = cr.rbdl_level if cr else 0
        target_lvl = min(3, current_lvl + 1)
        if current_lvl == 3:
            target_lvl = 3

        return await cls._build_roadmap_read(
            db=db,
            roadmap=roadmap,
            current_rbdl_level=current_lvl,
            target_rbdl_level=target_lvl,
        )

    @classmethod
    async def get_progress_summary(
        cls,
        db: AsyncSession,
        business_id: int,
        user_id: int,
    ) -> ProgressSummaryRead:
        """Calculate detailed progress metrics across phases for the active roadmap."""
        await cls.verify_business_ownership(db, business_id, user_id)

        # Load active roadmap
        rm_res = await db.execute(
            select(Roadmap)
            .options(selectinload(Roadmap.tasks))
            .where(
                Roadmap.business_id == business_id,
                Roadmap.status == "active",
            )
            .order_by(Roadmap.version.desc())
        )
        active_rm = rm_res.scalar_one_or_none()
        if not active_rm:
            # Check latest roadmap regardless of status
            any_rm_res = await db.execute(
                select(Roadmap)
                .options(selectinload(Roadmap.tasks))
                .where(Roadmap.business_id == business_id)
                .order_by(Roadmap.version.desc())
            )
            active_rm = any_rm_res.scalar_one_or_none()

        if not active_rm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No roadmap found for this business. Complete assessment first.",
            )

        tasks = active_rm.tasks
        total = len(tasks)
        completed = sum(1 for t in tasks if t.status == "completed")
        in_prog = sum(1 for t in tasks if t.status == "in_progress")
        pending = sum(1 for t in tasks if t.status == "pending")
        skipped = sum(1 for t in tasks if t.status == "skipped")
        pct = round((completed / total) * 100.0, 1) if total > 0 else 0.0

        p1_tasks = [t for t in tasks if t.phase_number == 1]
        p1_total = len(p1_tasks)
        p1_done = sum(1 for t in p1_tasks if t.status == "completed")

        p2_tasks = [t for t in tasks if t.phase_number == 2]
        p2_total = len(p2_tasks)
        p2_done = sum(1 for t in p2_tasks if t.status == "completed")

        p3_tasks = [t for t in tasks if t.phase_number == 3]
        p3_total = len(p3_tasks)
        p3_done = sum(1 for t in p3_tasks if t.status == "completed")

        # Ready for reassessment if user completed at least 2 tasks or all of Phase 1
        is_ready = (completed >= 2) or (p1_total > 0 and p1_done == p1_total)

        return ProgressSummaryRead(
            roadmap_id=active_rm.id,
            business_id=business_id,
            version=active_rm.version,
            total_tasks=total,
            completed_tasks=completed,
            in_progress_tasks=in_prog,
            pending_tasks=pending,
            skipped_tasks=skipped,
            completion_percentage=pct,
            phase_1_total=p1_total,
            phase_1_completed=p1_done,
            phase_2_total=p2_total,
            phase_2_completed=p2_done,
            phase_3_total=p3_total,
            phase_3_completed=p3_done,
            is_ready_for_reassessment=is_ready,
            last_activity_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )

    @classmethod
    async def update_task_status(
        cls,
        db: AsyncSession,
        task_id: int,
        status_in: RoadmapTaskStatusUpdate,
        user_id: int,
    ) -> RoadmapTaskRead:
        """Update status of a roadmap task, log state transition in progress_logs, and update timestamps."""
        t_res = await db.execute(
            select(RoadmapTask)
            .options(
                selectinload(RoadmapTask.roadmap),
                selectinload(RoadmapTask.recommendation),
            )
            .where(RoadmapTask.id == task_id)
        )
        task = t_res.scalar_one_or_none()

        if not task:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Roadmap task ID {task_id} not found.",
            )

        # Verify business ownership
        await cls.verify_business_ownership(db, task.roadmap.business_id, user_id)

        prev_status = task.status
        new_status = status_in.status
        now_utc = datetime.now(timezone.utc).replace(tzinfo=None)

        task.status = new_status
        task.updated_at = now_utc
        if status_in.skip_reason is not None:
            task.skip_reason = status_in.skip_reason

        # Append state change log into progress_logs
        log_record = ProgressLog(
            roadmap_task_id=task.id,
            business_id=task.roadmap.business_id,
            previous_status=prev_status,
            new_status=new_status,
            note=status_in.skip_reason,
            logged_by_user_id=user_id,
            logged_at=now_utc,
        )
        db.add(log_record)

        await db.commit()
        await db.refresh(task)

        rec = task.recommendation
        return RoadmapTaskRead(
            id=task.id,
            roadmap_id=task.roadmap_id,
            recommendation_id=task.recommendation_id,
            recommendation_code=rec.recommendation_code if rec else None,
            title_en=task.title_en,
            title_hi=task.title_hi,
            description_en=task.description_en,
            description_hi=task.description_hi,
            phase_number=task.phase_number,
            phase_name_en=RoadmapGeneratorEngine.PHASE_NAMES.get(task.phase_number, ("", ""))[0],
            phase_name_hi=RoadmapGeneratorEngine.PHASE_NAMES.get(task.phase_number, ("", ""))[1],
            sequence_order=task.sequence_order,
            status=task.status,
            skip_reason=task.skip_reason,
            due_date_estimate=task.due_date_estimate,
            estimated_cost_level=rec.estimated_cost_level if rec else "low",
            estimated_effort_level=rec.estimated_effort_level if rec else "low",
            impact_level=rec.impact_level if rec else "medium",
            created_at=task.created_at,
            updated_at=task.updated_at,
            completed_at=now_utc if task.status == "completed" else None,
        )

    @classmethod
    async def _build_roadmap_read(
        cls,
        db: AsyncSession,
        roadmap: Roadmap,
        current_rbdl_level: int,
        target_rbdl_level: int,
    ) -> RoadmapRead:
        """Helper to construct a fully populated RoadmapRead response with task progress metrics."""
        tasks_res = await db.execute(
            select(RoadmapTask)
            .options(selectinload(RoadmapTask.recommendation))
            .where(RoadmapTask.roadmap_id == roadmap.id)
            .order_by(RoadmapTask.sequence_order.asc())
        )
        tasks = tasks_res.scalars().all()

        p1_reads: List[RoadmapTaskRead] = []
        p2_reads: List[RoadmapTaskRead] = []
        p3_reads: List[RoadmapTaskRead] = []
        all_reads: List[RoadmapTaskRead] = []

        completed_count = 0
        in_prog_count = 0
        pending_count = 0
        skipped_count = 0

        for t in tasks:
            if t.status == "completed":
                completed_count += 1
            elif t.status == "in_progress":
                in_prog_count += 1
            elif t.status == "skipped":
                skipped_count += 1
            else:
                pending_count += 1

            rec = t.recommendation
            p_names = RoadmapGeneratorEngine.PHASE_NAMES.get(
                t.phase_number, (f"Phase {t.phase_number}", f"चरण {t.phase_number}")
            )

            t_read = RoadmapTaskRead(
                id=t.id,
                roadmap_id=t.roadmap_id,
                recommendation_id=t.recommendation_id,
                recommendation_code=rec.recommendation_code if rec else None,
                title_en=t.title_en,
                title_hi=t.title_hi,
                description_en=t.description_en,
                description_hi=t.description_hi,
                phase_number=t.phase_number,
                phase_name_en=p_names[0],
                phase_name_hi=p_names[1],
                sequence_order=t.sequence_order,
                status=t.status,
                skip_reason=t.skip_reason,
                due_date_estimate=t.due_date_estimate,
                estimated_cost_level=rec.estimated_cost_level if rec else "low",
                estimated_effort_level=rec.estimated_effort_level if rec else "low",
                impact_level=rec.impact_level if rec else "medium",
                created_at=t.created_at,
                updated_at=t.updated_at,
                completed_at=t.updated_at if t.status == "completed" else None,
            )
            all_reads.append(t_read)
            if t.phase_number == 1:
                p1_reads.append(t_read)
            elif t.phase_number == 2:
                p2_reads.append(t_read)
            else:
                p3_reads.append(t_read)

        p1_done = sum(1 for t in p1_reads if t.status == "completed")
        p1_in_prog = sum(1 for t in p1_reads if t.status == "in_progress")
        p2_done = sum(1 for t in p2_reads if t.status == "completed")
        p2_in_prog = sum(1 for t in p2_reads if t.status == "in_progress")
        p3_done = sum(1 for t in p3_reads if t.status == "completed")
        p3_in_prog = sum(1 for t in p3_reads if t.status == "in_progress")

        p1_group = PhasedRoadmapGroup(
            phase_number=1,
            phase_name_en=RoadmapGeneratorEngine.PHASE_NAMES[1][0],
            phase_name_hi=RoadmapGeneratorEngine.PHASE_NAMES[1][1],
            total_tasks=len(p1_reads),
            completed_tasks=p1_done,
            in_progress_tasks=p1_in_prog,
            tasks=p1_reads,
        )
        p2_group = PhasedRoadmapGroup(
            phase_number=2,
            phase_name_en=RoadmapGeneratorEngine.PHASE_NAMES[2][0],
            phase_name_hi=RoadmapGeneratorEngine.PHASE_NAMES[2][1],
            total_tasks=len(p2_reads),
            completed_tasks=p2_done,
            in_progress_tasks=p2_in_prog,
            tasks=p2_reads,
        )
        p3_group = PhasedRoadmapGroup(
            phase_number=3,
            phase_name_en=RoadmapGeneratorEngine.PHASE_NAMES[3][0],
            phase_name_hi=RoadmapGeneratorEngine.PHASE_NAMES[3][1],
            total_tasks=len(p3_reads),
            completed_tasks=p3_done,
            in_progress_tasks=p3_in_prog,
            tasks=p3_reads,
        )

        total_t = len(all_reads)
        comp_pct = round((completed_count / total_t) * 100.0, 1) if total_t > 0 else 0.0

        return RoadmapRead(
            id=roadmap.id,
            business_id=roadmap.business_id,
            classification_result_id=roadmap.classification_result_id,
            version=roadmap.version,
            status=roadmap.status,
            current_rbdl_level=current_rbdl_level,
            target_rbdl_level=target_rbdl_level,
            total_tasks=total_t,
            completed_tasks=completed_count,
            in_progress_tasks=in_prog_count,
            pending_tasks=pending_count,
            skipped_tasks=skipped_count,
            completion_percentage=comp_pct,
            phase_1=p1_group,
            phase_2=p2_group,
            phase_3=p3_group,
            all_tasks=all_reads,
            generated_at=roadmap.generated_at,
        )

