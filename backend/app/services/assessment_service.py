"""Assessment Service: Orchestrates Question Bank, Answer Persistence, Scoring, and RBDL Classification."""

import json
import logging
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from sqlalchemy import delete, desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.rbdl.classifier import RBDLClassifierEngine, RBDLClassificationResultDTO
from app.domain.rbdl.dimensions import RBDL_DIMENSIONS, DimensionMetadata
from app.domain.rbdl.scoring import ScoringEngine, AssessmentScoringSummary
from app.models.assessment import Assessment, AssessmentAnswer, AssessmentScore
from app.models.business import Business
from app.models.classification_result import ClassificationResult, ClassificationEvidence
from app.models.question import Question, QuestionOption
from app.models.rule import Rule
from app.models.rbdl_level import RBDLLevelModel
from app.schemas.assessment import (
    AssessmentAnswerItem,
    AssessmentAnswerRead,
    AssessmentAnswerSave,
    AssessmentComparisonRead,
    AssessmentHistoryItemRead,
    AssessmentRead,
    AssessmentScoreRead,
    AssessmentScoresResponse,
    AssessmentWithQuestionsRead,
    ClassificationEvidenceRead,
    ClassificationResultRead,
    DimensionComparisonRead,
    QuestionOptionRead,
    QuestionRead,
)

logger = logging.getLogger(__name__)


class AssessmentService:
    """Business logic and orchestration for digital readiness assessments."""

    @classmethod
    async def verify_business_ownership(
        cls, db: AsyncSession, business_id: int, user_id: int
    ) -> Business:
        """Ensure business exists and belongs to the authenticated user."""
        result = await db.execute(
            select(Business)
            .options(selectinload(Business.category))
            .where(Business.id == business_id)
        )
        business = result.scalar_one_or_none()
        if not business:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Business with ID {business_id} not found.",
            )
        if business.owner_user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access assessments for this business.",
            )
        return business

    @classmethod
    async def verify_assessment_ownership(
        cls, db: AsyncSession, assessment_id: int, user_id: int
    ) -> tuple[Assessment, Business]:
        """Ensure assessment exists and its business belongs to the authenticated user."""
        result = await db.execute(
            select(Assessment)
            .options(
                selectinload(Assessment.business).selectinload(Business.category),
                selectinload(Assessment.answers),
                selectinload(Assessment.scores),
                selectinload(Assessment.classification_results).selectinload(
                    ClassificationResult.evidence_traces
                ),
            )
            .where(Assessment.id == assessment_id)
        )
        assessment = result.scalar_one_or_none()
        if not assessment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Assessment with ID {assessment_id} not found.",
            )
        if assessment.business.owner_user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this assessment.",
            )
        return assessment, assessment.business

    @classmethod
    async def start_assessment(
        cls,
        db: AsyncSession,
        business_id: int,
        user_id: int,
        language_used: str = "en",
        previous_assessment_id: Optional[int] = None,
        administration_mode: Optional[str] = "self",
        respondent_role: Optional[str] = "owner",
        reassessment_reason: Optional[str] = None,
    ) -> AssessmentRead:
        """Start a new assessment session or resume an existing in-progress session."""
        await cls.verify_business_ownership(db, business_id, user_id)

        # Check for existing in-progress assessment for this business
        res = await db.execute(
            select(Assessment)
            .where(
                Assessment.business_id == business_id,
                Assessment.status == "in_progress",
            )
            .order_by(desc(Assessment.id))
        )
        existing = res.scalar_one_or_none()
        if existing:
            return AssessmentRead.model_validate(existing)

        # Check for latest previous submitted assessment to chain
        if not previous_assessment_id:
            latest_res = await db.execute(
                select(Assessment)
                .where(
                    Assessment.business_id == business_id,
                    Assessment.status == "submitted",
                )
                .order_by(desc(Assessment.id))
            )
            latest = latest_res.scalar_one_or_none()
            if latest:
                previous_assessment_id = latest.id

        new_assessment = Assessment(
            business_id=business_id,
            previous_assessment_id=previous_assessment_id,
            question_bank_version=1,
            language_used=language_used if language_used in ("en", "hi") else "en",
            status="in_progress",
            administration_mode=administration_mode if administration_mode in ("self", "consultant_assisted") else "self",
            respondent_role=respondent_role if respondent_role in ("owner", "family", "employee", "other") else "owner",
            reassessment_reason=reassessment_reason if reassessment_reason in ("scheduled", "retest_no_intervention", "post_intervention") else None,
        )
        db.add(new_assessment)
        await db.commit()
        await db.refresh(new_assessment)

        logger.info(
            f"Started assessment ID {new_assessment.id} for business ID {business_id} (user {user_id})"
        )
        return AssessmentRead.model_validate(new_assessment)

    @classmethod
    async def get_assessment_with_questions(
        cls, db: AsyncSession, assessment_id: int, user_id: int
    ) -> AssessmentWithQuestionsRead:
        """Retrieve questionnaire items, options, and any existing saved answers for an assessment session."""
        assessment, _ = await cls.verify_assessment_ownership(db, assessment_id, user_id)

        # Load active questions for the assessment's version
        q_res = await db.execute(
            select(Question)
            .options(selectinload(Question.options))
            .where(
                Question.version == assessment.question_bank_version,
                Question.is_active == True,
            )
            .order_by(Question.display_order.asc())
        )
        questions = q_res.scalars().all()

        # Load saved answers
        ans_res = await db.execute(
            select(AssessmentAnswer)
            .options(selectinload(AssessmentAnswer.question))
            .where(AssessmentAnswer.assessment_id == assessment_id)
        )
        saved_answers = ans_res.scalars().all()

        answers_read: List[AssessmentAnswerRead] = []
        for a in saved_answers:
            is_na = (a.text_answer or "").strip().upper() in ("N/A", "NA")
            multi_ids: Optional[List[int]] = None
            if a.text_answer and not is_na:
                try:
                    parsed = json.loads(a.text_answer)
                    if isinstance(parsed, list):
                        multi_ids = [int(x) for x in parsed if str(x).isdigit()]
                except Exception:
                    pass

            answers_read.append(
                AssessmentAnswerRead(
                    id=a.id,
                    assessment_id=a.assessment_id,
                    question_id=a.question_id,
                    question_code=a.question.question_code if a.question else None,
                    selected_option_id=a.selected_option_id,
                    selected_option_ids=multi_ids,
                    numeric_answer=float(a.numeric_answer) if a.numeric_answer is not None else None,
                    text_answer=a.text_answer,
                    is_na=is_na,
                    answered_at=a.answered_at,
                )
            )

        questions_read = [
            QuestionRead(
                id=q.id,
                question_code=q.question_code,
                dimension_code=q.dimension_code,
                question_text_en=q.question_text_en,
                question_text_hi=q.question_text_hi,
                question_type=q.question_type,
                applies_to_business_size=q.applies_to_business_size,
                display_order=q.display_order,
                version=q.version,
                is_active=q.is_active,
                options=[
                    QuestionOptionRead(
                        id=opt.id,
                        question_id=opt.question_id,
                        option_code=opt.option_code,
                        label_en=opt.label_en,
                        label_hi=opt.label_hi,
                        score_value=float(opt.score_value),
                        display_order=opt.display_order,
                    )
                    for opt in sorted(q.options, key=lambda o: o.display_order)
                ],
            )
            for q in questions
        ]

        return AssessmentWithQuestionsRead(
            assessment=AssessmentRead.model_validate(assessment),
            questions=questions_read,
            answers=answers_read,
        )

    @classmethod
    async def save_answers(
        cls,
        db: AsyncSession,
        assessment_id: int,
        answers_in: AssessmentAnswerSave,
        user_id: int,
    ) -> List[AssessmentAnswerRead]:
        """Upsert answers for an in-progress assessment session."""
        assessment, _ = await cls.verify_assessment_ownership(db, assessment_id, user_id)

        if assessment.status != "in_progress":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot modify assessment with status '{assessment.status}'.",
            )

        # Update language if provided
        if answers_in.language_used in ("en", "hi"):
            assessment.language_used = answers_in.language_used

        # Load valid questions for this assessment
        q_res = await db.execute(
            select(Question)
            .options(selectinload(Question.options))
            .where(
                Question.version == assessment.question_bank_version,
                Question.is_active == True,
            )
        )
        valid_questions = {q.id: q for q in q_res.scalars().all()}
        valid_options = {
            opt.id: opt for q in valid_questions.values() for opt in q.options
        }

        # Load existing answers
        existing_ans_res = await db.execute(
            select(AssessmentAnswer).where(AssessmentAnswer.assessment_id == assessment_id)
        )
        existing_answers = {a.question_id: a for a in existing_ans_res.scalars().all()}

        saved_results: List[AssessmentAnswerRead] = []

        for item in answers_in.answers:
            if item.question_id not in valid_questions:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid question ID {item.question_id} for assessment version {assessment.question_bank_version}.",
                )

            question = valid_questions[item.question_id]
            is_na = bool(item.is_na)

            selected_opt_id: Optional[int] = None
            text_ans_val: Optional[str] = None
            num_ans_val: Optional[Decimal] = None

            if is_na:
                text_ans_val = "N/A"
                selected_opt_id = None
            elif question.question_type == "multi_choice":
                # Handle multi-choice list
                opt_ids = item.selected_option_ids or []
                if item.selected_option_id and item.selected_option_id not in opt_ids:
                    opt_ids.append(item.selected_option_id)

                # Validate options belong to question
                for oid in opt_ids:
                    if oid not in valid_options or valid_options[oid].question_id != question.id:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Option ID {oid} does not belong to Question ID {question.id}.",
                        )

                text_ans_val = json.dumps(opt_ids)
                selected_opt_id = opt_ids[0] if len(opt_ids) == 1 else None
            else:
                # Single choice / boolean / numeric
                if item.selected_option_id is not None:
                    if item.selected_option_id not in valid_options or valid_options[item.selected_option_id].question_id != question.id:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Option ID {item.selected_option_id} does not belong to Question ID {question.id}.",
                        )
                    selected_opt_id = item.selected_option_id

                if item.numeric_answer is not None:
                    num_ans_val = Decimal(str(item.numeric_answer))

                if item.text_answer:
                    text_ans_val = item.text_answer

            # Upsert into assessment_answers
            if item.question_id in existing_answers:
                ans_record = existing_answers[item.question_id]
                ans_record.selected_option_id = selected_opt_id
                ans_record.numeric_answer = num_ans_val
                ans_record.text_answer = text_ans_val
                ans_record.answered_at = datetime.now(timezone.utc).replace(tzinfo=None)
            else:
                ans_record = AssessmentAnswer(
                    assessment_id=assessment_id,
                    question_id=item.question_id,
                    selected_option_id=selected_opt_id,
                    numeric_answer=num_ans_val,
                    text_answer=text_ans_val,
                    answered_at=datetime.now(timezone.utc).replace(tzinfo=None),
                )
                db.add(ans_record)
                existing_answers[item.question_id] = ans_record

        await db.commit()

        # Build response
        for ans_record in existing_answers.values():
            is_na = (ans_record.text_answer or "").strip().upper() in ("N/A", "NA")
            multi_ids = None
            if ans_record.text_answer and not is_na:
                try:
                    parsed = json.loads(ans_record.text_answer)
                    if isinstance(parsed, list):
                        multi_ids = [int(x) for x in parsed if str(x).isdigit()]
                except Exception:
                    pass

            q = valid_questions.get(ans_record.question_id)
            saved_results.append(
                AssessmentAnswerRead(
                    id=ans_record.id or 0,
                    assessment_id=ans_record.assessment_id,
                    question_id=ans_record.question_id,
                    question_code=q.question_code if q else None,
                    selected_option_id=ans_record.selected_option_id,
                    selected_option_ids=multi_ids,
                    numeric_answer=float(ans_record.numeric_answer) if ans_record.numeric_answer is not None else None,
                    text_answer=ans_record.text_answer,
                    is_na=is_na,
                    answered_at=ans_record.answered_at or datetime.now(timezone.utc).replace(tzinfo=None),
                )
            )

        return saved_results

    @classmethod
    async def submit_assessment(
        cls, db: AsyncSession, assessment_id: int, user_id: int
    ) -> ClassificationResultRead:
        """Submit assessment, compute dimension & composite scores, run RBDL classifier, and record explainability evidence."""
        assessment, business = await cls.verify_assessment_ownership(db, assessment_id, user_id)

        # 1. Load all questions for version
        q_res = await db.execute(
            select(Question)
            .options(selectinload(Question.options))
            .where(
                Question.version == assessment.question_bank_version,
                Question.is_active == True,
            )
            .order_by(Question.display_order.asc())
        )
        questions = q_res.scalars().all()
        options_by_id = {opt.id: opt for q in questions for opt in q.options}

        # 2. Load all answers
        ans_res = await db.execute(
            select(AssessmentAnswer)
            .options(selectinload(AssessmentAnswer.question))
            .where(AssessmentAnswer.assessment_id == assessment_id)
        )
        answers = ans_res.scalars().all()
        answers_by_qid = {a.question_id: a for a in answers}
        answers_by_code = {a.question.question_code: a for a in answers if a.question}

        # 3. Calculate Dimension Scores & Composite Score
        scoring_summary = ScoringEngine.calculate_scores(
            questions=questions,
            answers_by_question_id=answers_by_qid,
        )

        # Persist Dimension Scores in assessment_scores
        await db.execute(
            delete(AssessmentScore).where(AssessmentScore.assessment_id == assessment_id)
        )
        for dim_code, score_res in scoring_summary.detailed_scores.items():
            db_score = AssessmentScore(
                assessment_id=assessment_id,
                dimension_code=dim_code,
                raw_score=Decimal(str(score_res.raw_score)),
                max_possible_score=Decimal(str(score_res.max_possible_score)),
                computed_at=datetime.now(timezone.utc).replace(tzinfo=None),
            )
            db.add(db_score)

        # 4. Prepare Business Profile Context for Classifier
        business_profile = {
            "business_id": business.id,
            "category_id": business.category_id,
            "category_name": business.category.name_en if business.category else "General",
            "business_size": business.business_size,
            "state": business.state,
            "district": business.district,
        }

        # 5. Execute RBDL Requirement-Based Classification Engine
        classification_dto = RBDLClassifierEngine.classify(
            scoring_summary=scoring_summary,
            answers_by_question_code=answers_by_code,
            options_by_id=options_by_id,
            business_profile=business_profile,
        )

        # 5b. Compute N/A Sensitivity Safeguard (C-05)
        has_any_na = any(ScoringEngine._is_answer_na(a) for a in answers_by_qid.values())
        na_sensitive = False
        na_hypothetical_level = classification_dto.rbdl_level

        if has_any_na:
            hypothetical_summary = ScoringEngine.calculate_hypothetical_scores_with_na_as_unmet(
                questions=questions,
                answers_by_question_id=answers_by_qid,
            )
            hypothetical_classification = RBDLClassifierEngine.classify(
                scoring_summary=hypothetical_summary,
                answers_by_question_code=answers_by_code,
                options_by_id=options_by_id,
                business_profile=business_profile,
            )
            na_hypothetical_level = hypothetical_classification.rbdl_level
            na_sensitive = (na_hypothetical_level != classification_dto.rbdl_level)

        # 6. Persist Classification Result in classification_results table
        # Set any prior primary classification results for this assessment to false
        prior_res = await db.execute(
            select(ClassificationResult).where(
                ClassificationResult.assessment_id == assessment_id,
                ClassificationResult.is_primary == True,
            )
        )
        for prior_cr in prior_res.scalars().all():
            prior_cr.is_primary = False

        # Load active rule entities from database
        rules_res = await db.execute(
            select(Rule).where(
                Rule.version == classification_dto.ruleset_version,
                Rule.is_active == True,
            )
        )
        db_rules = {r.rule_code: r for r in rules_res.scalars().all()}

        cr_record = ClassificationResult(
            assessment_id=assessment_id,
            method="rule_based",
            rbdl_level=classification_dto.rbdl_level,
            confidence_score=None,  # Rule-based classification is deterministic, not probabilistic
            ruleset_version=classification_dto.ruleset_version,
            is_primary=True,
            na_sensitive=na_sensitive,
            na_hypothetical_level=na_hypothetical_level,
            classified_at=datetime.now(timezone.utc).replace(tzinfo=None),
        )
        db.add(cr_record)
        await db.flush()

        # 7. Persist Explainability Evidence in classification_evidence table
        evidence_reads: List[ClassificationEvidenceRead] = []
        for evaluated_rule in classification_dto.rules_evaluated:
            db_rule = db_rules.get(evaluated_rule.rule_code)
            if db_rule:
                ev_record = ClassificationEvidence(
                    classification_result_id=cr_record.id,
                    rule_id=db_rule.id,
                    rule_version_snapshot=evaluated_rule.rule_version,
                    condition_snapshot_json=evaluated_rule.condition_json,
                    fired_order=evaluated_rule.fired_order,
                    matched_answers_snapshot_json={
                        **evaluated_rule.matched_snapshot,
                        "certainty_tier": classification_dto.certainty.certainty_tier.value,
                        "blocking_reasons": evaluated_rule.blocking_reasons,
                    },
                    created_at=datetime.now(timezone.utc).replace(tzinfo=None),
                )
                db.add(ev_record)
                await db.flush()

                evidence_reads.append(
                    ClassificationEvidenceRead(
                        id=ev_record.id,
                        rule_id=db_rule.id,
                        rule_code=db_rule.rule_code,
                        rule_name=db_rule.name,
                        rule_version_snapshot=ev_record.rule_version_snapshot,
                        fired_order=ev_record.fired_order,
                        condition_snapshot_json=ev_record.condition_snapshot_json,
                        matched_answers_snapshot_json=ev_record.matched_answers_snapshot_json,
                        created_at=ev_record.created_at,
                    )
                )

        # 8. Update Assessment Status
        assessment.status = "submitted"
        assessment.submitted_at = datetime.now(timezone.utc).replace(tzinfo=None)

        await db.commit()
        await db.refresh(cr_record)

        # 9. Auto-generate Recommendations & Phased Roadmap (Claude C4)
        try:
            from app.services.recommendation_service import RecommendationService
            await RecommendationService.generate_recommendations_and_roadmap(
                db=db,
                assessment_id=assessment_id,
            )
        except Exception as e:
            logger.warning(f"Auto-generation of recommendations/roadmap encountered: {e}")

        logger.info(
            f"Successfully classified Assessment ID {assessment_id} -> RBDL Level {cr_record.rbdl_level} (Certainty: {classification_dto.certainty.certainty_tier.value})"
        )

        return ClassificationResultRead(
            id=cr_record.id,
            assessment_id=assessment_id,
            method="rule_based",
            rbdl_level=cr_record.rbdl_level,
            level_name_en=classification_dto.level_name_en,
            level_name_hi=classification_dto.level_name_hi,
            ruleset_version=cr_record.ruleset_version,
            is_primary=cr_record.is_primary,
            na_sensitive=cr_record.na_sensitive,
            na_hypothetical_level=cr_record.na_hypothetical_level,
            classified_at=cr_record.classified_at,
            composite_score=classification_dto.composite_score,
            dimension_scores=classification_dto.dimension_scores,
            certainty_tier=classification_dto.certainty.certainty_tier.value,
            certainty_reasons=classification_dto.certainty.reasons,
            contradictions=classification_dto.contradictions,
            satisfied_requirements=[r.model_dump() for r in classification_dto.satisfied_requirements],
            blocking_requirements=[r.model_dump() for r in classification_dto.blocking_requirements],
            category_exemptions=classification_dto.category_exemptions,
            explanation_summary_en=classification_dto.explanation_summary_en,
            explanation_summary_hi=classification_dto.explanation_summary_hi,
            evidence_traces=evidence_reads,
        )

    @classmethod
    async def get_scores(
        cls, db: AsyncSession, assessment_id: int, user_id: int
    ) -> AssessmentScoresResponse:
        """Retrieve computed dimension scores and composite score for an assessment."""
        assessment, _ = await cls.verify_assessment_ownership(db, assessment_id, user_id)

        scores_res = await db.execute(
            select(AssessmentScore).where(AssessmentScore.assessment_id == assessment_id)
        )
        db_scores = scores_res.scalars().all()

        dim_scores_read: List[AssessmentScoreRead] = []
        composite_score = 0.0

        for s in db_scores:
            dim_meta = RBDL_DIMENSIONS.get(s.dimension_code)
            raw = float(s.raw_score)
            max_p = float(s.max_possible_score)
            dim_score = round((raw / max_p) * 10.0, 2) if max_p > 0 else 0.0
            weight = dim_meta.weight if dim_meta else 0.0

            composite_score += dim_score * weight

            dim_scores_read.append(
                AssessmentScoreRead(
                    dimension_code=s.dimension_code,
                    dimension_name_en=dim_meta.name_en if dim_meta else s.dimension_code,
                    dimension_name_hi=dim_meta.name_hi if dim_meta else s.dimension_code,
                    raw_score=raw,
                    max_possible_score=max_p,
                    dimension_score=dim_score,
                    weight=weight,
                )
            )

        return AssessmentScoresResponse(
            assessment_id=assessment_id,
            composite_score=round(composite_score, 2),
            dimension_scores=dim_scores_read,
            is_complete=(assessment.status == "submitted"),
        )

    @classmethod
    async def get_classification(
        cls, db: AsyncSession, assessment_id: int, user_id: int
    ) -> ClassificationResultRead:
        """Retrieve primary classification result and explainability evidence."""
        assessment, business = await cls.verify_assessment_ownership(db, assessment_id, user_id)

        cr_res = await db.execute(
            select(ClassificationResult)
            .options(
                selectinload(ClassificationResult.evidence_traces).selectinload(
                    ClassificationEvidence.rule
                ),
                selectinload(ClassificationResult.rbdl_level_rel),
            )
            .where(
                ClassificationResult.assessment_id == assessment_id,
                ClassificationResult.is_primary == True,
            )
            .order_by(desc(ClassificationResult.id))
        )
        cr = cr_res.scalar_one_or_none()
        if not cr:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No classification result found for assessment ID {assessment_id}. Assessment may not have been submitted yet.",
            )

        # Load scores
        scores_res = await db.execute(
            select(AssessmentScore).where(AssessmentScore.assessment_id == assessment_id)
        )
        db_scores = scores_res.scalars().all()
        dim_scores: Dict[str, float] = {}
        composite_score = 0.0
        for s in db_scores:
            raw = float(s.raw_score)
            max_p = float(s.max_possible_score)
            score_val = round((raw / max_p) * 10.0, 2) if max_p > 0 else 0.0
            dim_scores[s.dimension_code] = score_val
            weight = RBDL_DIMENSIONS.get(s.dimension_code).weight if s.dimension_code in RBDL_DIMENSIONS else 0.0
            composite_score += score_val * weight

        # Build evidence list
        evidence_reads: List[ClassificationEvidenceRead] = []
        certainty_tier = "HIGH"
        certainty_reasons: List[str] = []

        for ev in cr.evidence_traces:
            matched_snap = ev.matched_answers_snapshot_json or {}
            if "certainty_tier" in matched_snap:
                certainty_tier = matched_snap["certainty_tier"]

            evidence_reads.append(
                ClassificationEvidenceRead(
                    id=ev.id,
                    rule_id=ev.rule_id,
                    rule_code=ev.rule.rule_code if ev.rule else None,
                    rule_name=ev.rule.name if ev.rule else None,
                    rule_version_snapshot=ev.rule_version_snapshot,
                    fired_order=ev.fired_order,
                    condition_snapshot_json=ev.condition_snapshot_json,
                    matched_answers_snapshot_json=matched_snap,
                    created_at=ev.created_at,
                )
            )

        level_name_en = cr.rbdl_level_rel.name_en if cr.rbdl_level_rel else f"Level {cr.rbdl_level}"
        level_name_hi = cr.rbdl_level_rel.name_hi if cr.rbdl_level_rel else f"स्तर {cr.rbdl_level}"

        return ClassificationResultRead(
            id=cr.id,
            assessment_id=assessment_id,
            method=cr.method,
            rbdl_level=cr.rbdl_level,
            level_name_en=level_name_en,
            level_name_hi=level_name_hi,
            ruleset_version=cr.ruleset_version,
            is_primary=cr.is_primary,
            na_sensitive=cr.na_sensitive if hasattr(cr, "na_sensitive") else False,
            na_hypothetical_level=cr.na_hypothetical_level if hasattr(cr, "na_hypothetical_level") else None,
            classified_at=cr.classified_at,
            composite_score=round(composite_score, 2),
            dimension_scores=dim_scores,
            certainty_tier=certainty_tier,
            certainty_reasons=certainty_reasons,
            explanation_summary_en=f"Business evaluated at {level_name_en} based on requirement gating.",
            explanation_summary_hi=f"आवश्यकता-आधारित मूल्यांकन के आधार पर व्यवसाय {level_name_hi} पर निर्धारित।",
            evidence_traces=evidence_reads,
        )

    @classmethod
    async def get_assessment_history_for_business(
        cls, db: AsyncSession, business_id: int, user_id: int
    ) -> List[AssessmentHistoryItemRead]:
        """Retrieve historical assessment timeline for a business."""
        await cls.verify_business_ownership(db, business_id, user_id)

        stmt = (
            select(Assessment)
            .options(
                selectinload(Assessment.classification_results).selectinload(
                    ClassificationResult.rbdl_level_rel
                ),
                selectinload(Assessment.scores),
            )
            .where(Assessment.business_id == business_id)
            .order_by(desc(Assessment.id))
        )
        res = await db.execute(stmt)
        assessments = res.scalars().all()

        history_items: List[AssessmentHistoryItemRead] = []
        for a in assessments:
            primary_cr = next(
                (cr for cr in a.classification_results if cr.is_primary), None
            )
            composite_score: Optional[float] = None
            if a.scores:
                c_score = 0.0
                for s in a.scores:
                    raw = float(s.raw_score)
                    max_p = float(s.max_possible_score)
                    val = round((raw / max_p) * 10.0, 2) if max_p > 0 else 0.0
                    weight = (
                        RBDL_DIMENSIONS[s.dimension_code].weight
                        if s.dimension_code in RBDL_DIMENSIONS
                        else 0.0
                    )
                    c_score += val * weight
                composite_score = round(c_score, 2)

            level_name_en = None
            level_name_hi = None
            certainty_tier = None

            if primary_cr:
                level_name_en = (
                    primary_cr.rbdl_level_rel.name_en
                    if primary_cr.rbdl_level_rel
                    else f"Level {primary_cr.rbdl_level}"
                )
                level_name_hi = (
                    primary_cr.rbdl_level_rel.name_hi
                    if primary_cr.rbdl_level_rel
                    else f"स्तर {primary_cr.rbdl_level}"
                )
                certainty_tier = "HIGH"

            history_items.append(
                AssessmentHistoryItemRead(
                    id=a.id,
                    business_id=a.business_id,
                    question_bank_version=a.question_bank_version,
                    language_used=a.language_used,
                    status=a.status,
                    rbdl_level=primary_cr.rbdl_level if primary_cr else None,
                    level_name_en=level_name_en,
                    level_name_hi=level_name_hi,
                    composite_score=composite_score,
                    certainty_tier=certainty_tier,
                    started_at=a.started_at,
                    submitted_at=a.submitted_at,
                    previous_assessment_id=a.previous_assessment_id,
                )
            )
        return history_items

    @classmethod
    async def compare_assessments(
        cls,
        db: AsyncSession,
        business_id: int,
        user_id: int,
        current_assessment_id: Optional[int] = None,
        previous_assessment_id: Optional[int] = None,
    ) -> AssessmentComparisonRead:
        """Compare two submitted assessments for a business, computing dimension deltas, composite shifts, and completed tasks."""
        business = await cls.verify_business_ownership(db, business_id, user_id)

        # 1. Resolve assessments to compare
        if current_assessment_id:
            curr_res = await db.execute(
                select(Assessment)
                .options(
                    selectinload(Assessment.classification_results).selectinload(
                        ClassificationResult.rbdl_level_rel
                    ),
                    selectinload(Assessment.scores),
                )
                .where(
                    Assessment.id == current_assessment_id,
                    Assessment.business_id == business_id,
                    Assessment.status == "submitted",
                )
            )
            curr_assessment = curr_res.scalar_one_or_none()
            if not curr_assessment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Submitted assessment ID {current_assessment_id} not found for this business.",
                )
        else:
            # Pick latest submitted assessment
            curr_res = await db.execute(
                select(Assessment)
                .options(
                    selectinload(Assessment.classification_results).selectinload(
                        ClassificationResult.rbdl_level_rel
                    ),
                    selectinload(Assessment.scores),
                )
                .where(
                    Assessment.business_id == business_id,
                    Assessment.status == "submitted",
                )
                .order_by(desc(Assessment.id))
            )
            curr_assessment = curr_res.scalar_one_or_none()
            if not curr_assessment:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No completed assessments found for this business to compare.",
                )

        if previous_assessment_id:
            prev_res = await db.execute(
                select(Assessment)
                .options(
                    selectinload(Assessment.classification_results).selectinload(
                        ClassificationResult.rbdl_level_rel
                    ),
                    selectinload(Assessment.scores),
                )
                .where(
                    Assessment.id == previous_assessment_id,
                    Assessment.business_id == business_id,
                    Assessment.status == "submitted",
                )
            )
            prev_assessment = prev_res.scalar_one_or_none()
            if not prev_assessment:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Previous submitted assessment ID {previous_assessment_id} not found for this business.",
                )
        else:
            # Check previous_assessment_id link or previous chronological assessment
            prior_id = curr_assessment.previous_assessment_id
            if prior_id:
                prev_res = await db.execute(
                    select(Assessment)
                    .options(
                        selectinload(Assessment.classification_results).selectinload(
                            ClassificationResult.rbdl_level_rel
                        ),
                        selectinload(Assessment.scores),
                    )
                    .where(
                        Assessment.id == prior_id,
                        Assessment.status == "submitted",
                    )
                )
                prev_assessment = prev_res.scalar_one_or_none()
            else:
                prev_assessment = None

            if not prev_assessment:
                # Find preceding submitted assessment by ID
                prev_res = await db.execute(
                    select(Assessment)
                    .options(
                        selectinload(Assessment.classification_results).selectinload(
                            ClassificationResult.rbdl_level_rel
                        ),
                        selectinload(Assessment.scores),
                    )
                    .where(
                        Assessment.business_id == business_id,
                        Assessment.status == "submitted",
                        Assessment.id < curr_assessment.id,
                    )
                    .order_by(desc(Assessment.id))
                )
                prev_assessment = prev_res.scalar_one_or_none()

        if not prev_assessment:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least two completed assessments are required to generate a comparison.",
            )

        if prev_assessment.id == curr_assessment.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot compare an assessment with itself. Please select two distinct assessments.",
            )

        # 2. Extract classification details
        curr_cr = next(
            (cr for cr in curr_assessment.classification_results if cr.is_primary), None
        )
        prev_cr = next(
            (cr for cr in prev_assessment.classification_results if cr.is_primary), None
        )

        curr_lvl = curr_cr.rbdl_level if curr_cr else 0
        prev_lvl = prev_cr.rbdl_level if prev_cr else 0

        curr_lvl_name_en = curr_cr.rbdl_level_rel.name_en if (curr_cr and curr_cr.rbdl_level_rel) else f"Level {curr_lvl}"
        curr_lvl_name_hi = curr_cr.rbdl_level_rel.name_hi if (curr_cr and curr_cr.rbdl_level_rel) else f"स्तर {curr_lvl}"
        prev_lvl_name_en = prev_cr.rbdl_level_rel.name_en if (prev_cr and prev_cr.rbdl_level_rel) else f"Level {prev_lvl}"
        prev_lvl_name_hi = prev_cr.rbdl_level_rel.name_hi if (prev_cr and prev_cr.rbdl_level_rel) else f"स्तर {prev_lvl}"

        # 3. Compute Dimension Scores & Comparisons
        curr_scores_dict: Dict[str, float] = {}
        curr_comp = 0.0
        for s in curr_assessment.scores:
            raw = float(s.raw_score)
            max_p = float(s.max_possible_score)
            val = round((raw / max_p) * 10.0, 2) if max_p > 0 else 0.0
            curr_scores_dict[s.dimension_code] = val
            weight = RBDL_DIMENSIONS[s.dimension_code].weight if s.dimension_code in RBDL_DIMENSIONS else 0.0
            curr_comp += val * weight

        prev_scores_dict: Dict[str, float] = {}
        prev_comp = 0.0
        for s in prev_assessment.scores:
            raw = float(s.raw_score)
            max_p = float(s.max_possible_score)
            val = round((raw / max_p) * 10.0, 2) if max_p > 0 else 0.0
            prev_scores_dict[s.dimension_code] = val
            weight = RBDL_DIMENSIONS[s.dimension_code].weight if s.dimension_code in RBDL_DIMENSIONS else 0.0
            prev_comp += val * weight

        dim_comparisons: List[DimensionComparisonRead] = []
        for dim_code, dim_meta in RBDL_DIMENSIONS.items():
            c_val = curr_scores_dict.get(dim_code, 0.0)
            p_val = prev_scores_dict.get(dim_code, 0.0)
            delta = round(c_val - p_val, 2)
            pct_chg = round(((c_val - p_val) / p_val) * 100.0, 1) if p_val > 0 else (100.0 if c_val > 0 else 0.0)

            if delta > 0.05:
                status_str = "improved"
            elif delta < -0.05:
                status_str = "declined"
            else:
                status_str = "maintained"

            dim_comparisons.append(
                DimensionComparisonRead(
                    dimension_code=dim_code,
                    dimension_name_en=dim_meta.name_en,
                    dimension_name_hi=dim_meta.name_hi,
                    previous_score=p_val,
                    current_score=c_val,
                    score_delta=delta,
                    percentage_change=pct_chg,
                    status=status_str,
                )
            )

        # 4. Check for tasks completed in historical roadmaps between the assessments
        from app.models.roadmap import Roadmap, RoadmapTask
        tasks_res = await db.execute(
            select(RoadmapTask)
            .join(Roadmap, RoadmapTask.roadmap_id == Roadmap.id)
            .where(
                Roadmap.business_id == business_id,
                RoadmapTask.status == "completed",
            )
        )
        completed_tasks = tasks_res.scalars().all()

        completed_titles_en = [t.title_en for t in completed_tasks]
        completed_titles_hi = [t.title_hi for t in completed_tasks]

        return AssessmentComparisonRead(
            business_id=business_id,
            business_name=business.name,
            previous_assessment_id=prev_assessment.id,
            previous_submitted_at=prev_assessment.submitted_at,
            previous_rbdl_level=prev_lvl,
            previous_level_name_en=prev_lvl_name_en,
            previous_level_name_hi=prev_lvl_name_hi,
            previous_composite_score=round(prev_comp, 2),
            current_assessment_id=curr_assessment.id,
            current_submitted_at=curr_assessment.submitted_at,
            current_rbdl_level=curr_lvl,
            current_level_name_en=curr_lvl_name_en,
            current_level_name_hi=curr_lvl_name_hi,
            current_composite_score=round(curr_comp, 2),
            composite_score_delta=round(curr_comp - prev_comp, 2),
            level_change=(curr_lvl - prev_lvl),
            dimension_comparisons=dim_comparisons,
            completed_tasks_count=len(completed_tasks),
            completed_task_titles_en=completed_titles_en,
            completed_task_titles_hi=completed_titles_hi,
        )

