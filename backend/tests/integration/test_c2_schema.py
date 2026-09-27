"""Integration tests for Claude C2 database schema, models, and constraints on MySQL."""

from datetime import datetime, timezone
import pytest
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.rbdl_level import RBDLLevelModel
from app.models.user import User
from app.models.business_category import BusinessCategory
from app.models.business import Business
from app.models.question import Question, QuestionOption
from app.models.assessment import Assessment, AssessmentAnswer, AssessmentScore
from app.models.rule import Rule, RuleRecommendation
from app.models.recommendation import Recommendation, BusinessRecommendation
from app.models.classification_result import ClassificationResult, ClassificationEvidence
from app.models.roadmap import Roadmap, RoadmapTask
from app.models.progress_log import ProgressLog
from app.models.ml import MLModel, MLPrediction
from app.models.research import ResearchEvaluationRecord
from app.models.audit_log import AuditLog


@pytest.mark.asyncio
async def test_rbdl_levels_seeded(db_session: AsyncSession):
    """Test that all 4 RBDL levels (0-3) are present in MySQL with bilingual names."""
    result = await db_session.execute(select(RBDLLevelModel).order_by(RBDLLevelModel.id))
    levels = result.scalars().all()
    
    assert len(levels) == 4
    level_codes = [l.code for l in levels]
    assert "L0" in level_codes
    assert "L1" in level_codes
    assert "L2" in level_codes
    assert "L3" in level_codes

    level_0 = levels[0]
    assert level_0.id == 0
    assert "Foundational" in level_0.name_en or "Non-Digital" in level_0.name_en
    assert len(level_0.name_hi) > 0


@pytest.mark.asyncio
async def test_business_category_hierarchy(db_session: AsyncSession):
    """Test self-referencing business categories hierarchy."""
    parent = BusinessCategory(
        name_en="Retail & Trade",
        name_hi="खुदरा और व्यापार",
        description_en="General retail stores",
    )
    db_session.add(parent)
    await db_session.flush()

    child = BusinessCategory(
        parent_category_id=parent.id,
        name_en="Kirana & Grocery",
        name_hi="किराना और राशन",
        description_en="Local neighbourhood groceries",
    )
    db_session.add(child)
    await db_session.flush()

    assert child.parent_category_id == parent.id


@pytest.mark.asyncio
async def test_questions_and_options_bilingual(db_session: AsyncSession):
    """Test questions and options creation with bilingual text and scoring."""
    q = Question(
        question_code="TEST_CONN_01",
        dimension_code="connectivity",
        question_text_en="Do you have high-speed internet in your shop?",
        question_text_hi="क्या आपकी दुकान में हाई-स्पीड इंटरनेट है?",
        question_type="single_choice",
        version=1,
        display_order=1,
    )
    db_session.add(q)
    await db_session.flush()

    opt1 = QuestionOption(
        question_id=q.id,
        option_code="OPT_YES",
        label_en="Yes, broadband / optical fiber",
        label_hi="हाँ, ब्रॉडबैंड / ऑप्टिकल फाइबर",
        score_value=1.0,
        display_order=1,
    )
    opt2 = QuestionOption(
        question_id=q.id,
        option_code="OPT_NO",
        label_en="No internet",
        label_hi="कोई इंटरनेट नहीं",
        score_value=0.0,
        display_order=2,
    )
    db_session.add_all([opt1, opt2])
    await db_session.flush()

    assert q.id is not None
    assert opt1.id is not None
    assert opt2.id is not None


@pytest.mark.asyncio
async def test_question_multi_version_coexistence_and_duplicate_rejection(db_session: AsyncSession):
    """Test that two versions of the same question code can coexist, while exact duplicate is rejected."""
    from sqlalchemy.exc import IntegrityError

    q_code = f"Q_VER_TEST_{int(datetime.now().timestamp())}"

    # 1. Version 1 of question
    q_v1 = Question(
        question_code=q_code,
        dimension_code="digital_presence",
        question_text_en="Do you have a website? (v1)",
        question_text_hi="क्या आपकी कोई वेबसाइट है? (v1)",
        question_type="single_choice",
        version=1,
    )
    db_session.add(q_v1)
    await db_session.flush()
    assert q_v1.id is not None

    # 2. Version 2 of same question code (should succeed and coexist)
    q_v2 = Question(
        question_code=q_code,
        dimension_code="digital_presence",
        question_text_en="Do you have a website or Google Maps profile? (v2 updated)",
        question_text_hi="क्या आपकी कोई वेबसाइट या गूगल मैप्स प्रोफ़ाइल है? (v2)",
        question_type="single_choice",
        version=2,
    )
    db_session.add(q_v2)
    await db_session.flush()
    assert q_v2.id is not None
    assert q_v2.question_code == q_v1.question_code
    assert q_v2.version != q_v1.version

    # 3. Duplicate (same code AND same version=1) should be rejected by uq_question_code_version
    q_v1_duplicate = Question(
        question_code=q_code,
        dimension_code="digital_presence",
        question_text_en="Duplicate v1 question",
        question_text_hi="डुप्लिकेट v1 प्रश्न",
        question_type="single_choice",
        version=1,
    )
    db_session.add(q_v1_duplicate)
    with pytest.raises(IntegrityError):
        await db_session.flush()

    await db_session.rollback()


@pytest.mark.asyncio
async def test_historical_assessments_and_scoring(db_session: AsyncSession):
    """Test append-only historical assessments linked via previous_assessment_id."""
    cat_res = await db_session.execute(select(BusinessCategory).limit(1))
    cat = cat_res.scalar_one_or_none()
    if not cat:
        cat = BusinessCategory(name_en="General Test", name_hi="सामान्य")
        db_session.add(cat)
        await db_session.flush()

    user = User(
        full_name="Assessment Test Owner",
        email=f"assess_owner_{int(datetime.now().timestamp())}@example.com",
        password_hash="fakehash123",
    )
    db_session.add(user)
    await db_session.flush()

    biz = Business(
        owner_user_id=user.id,
        category_id=cat.id,
        business_name="Historical MSME Store",
        business_size="micro",
        state="Maharashtra",
        district="Pune",
    )
    db_session.add(biz)
    await db_session.flush()

    # Initial Assessment (v1)
    a1 = Assessment(
        business_id=biz.id,
        question_bank_version=1,
        language_used="en",
        status="submitted",
        submitted_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    db_session.add(a1)
    await db_session.flush()

    score1 = AssessmentScore(
        assessment_id=a1.id,
        dimension_code="connectivity",
        raw_score=4.0,
        max_possible_score=10.0,
    )
    db_session.add(score1)
    await db_session.flush()

    # Re-assessment (v2) chained via previous_assessment_id
    a2 = Assessment(
        business_id=biz.id,
        previous_assessment_id=a1.id,
        question_bank_version=1,
        language_used="hi",
        status="submitted",
        submitted_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    db_session.add(a2)
    await db_session.flush()

    assert a2.previous_assessment_id == a1.id
    assert score1.raw_score == 4.0


@pytest.mark.asyncio
async def test_classification_and_explainability_evidence(db_session: AsyncSession):
    """Test classification results with snapshotted rule explainability evidence."""
    cat_res = await db_session.execute(select(BusinessCategory).limit(1))
    cat = cat_res.scalar_one_or_none() or BusinessCategory(name_en="Default", name_hi="डिफ़ॉल्ट")
    if not cat.id:
        db_session.add(cat)
        await db_session.flush()

    user = User(
        full_name="Rule Explainer User",
        email=f"rule_user_{int(datetime.now().timestamp())}@example.com",
        password_hash="fakehash123",
    )
    db_session.add(user)
    await db_session.flush()

    biz = Business(
        owner_user_id=user.id,
        category_id=cat.id,
        business_name="Rule Test Corp",
        business_size="small",
        state="Karnataka",
        district="Bengaluru",
    )
    db_session.add(biz)
    await db_session.flush()

    assessment = Assessment(
        business_id=biz.id,
        question_bank_version=1,
        status="submitted",
    )
    db_session.add(assessment)
    await db_session.flush()

    # Create Rule
    rule = Rule(
        rule_code="RULE_CONN_BASIC_TEST",
        version=1,
        name="Basic Connectivity Rule",
        condition_json={"operator": "AND", "conditions": [{"field": "connectivity", "operator": ">=", "value": 5}]},
        target_rbdl_level=1,
        priority=10,
        rationale="MSME has sufficient connectivity for basic digital tools",
        created_by=user.id,
    )
    db_session.add(rule)
    await db_session.flush()

    # Classification Result
    cr = ClassificationResult(
        assessment_id=assessment.id,
        method="rule_based",
        rbdl_level=1,
        ruleset_version=1,
        is_primary=True,
    )
    db_session.add(cr)
    await db_session.flush()

    # Explainability Evidence (snapshotted at evaluation time)
    evidence = ClassificationEvidence(
        classification_result_id=cr.id,
        rule_id=rule.id,
        rule_version_snapshot=1,
        condition_snapshot_json=rule.condition_json,
        fired_order=1,
        matched_answers_snapshot_json={"connectivity_score": 6.5},
    )
    db_session.add(evidence)
    await db_session.flush()

    assert cr.id is not None
    assert evidence.id is not None
    assert evidence.rule_version_snapshot == 1


@pytest.mark.asyncio
async def test_recommendations_and_roadmaps(db_session: AsyncSession):
    """Test recommendations catalog, junction mapping, business recommendations, roadmap, and tasks."""
    rec = Recommendation(
        recommendation_code="REC_UPI_ADOPT_TEST",
        title_en="Adopt QR-Based UPI Payments",
        title_hi="क्यूआर-आधारित यूपीआई भुगतान अपनाएं",
        description_en="Display a static/dynamic soundbox or QR code to accept digital payments from customers.",
        description_hi="ग्राहकों से डिजिटल भुगतान स्वीकार करने के लिए क्यूआर कोड या साउंडबॉक्स लगाएं।",
        target_rbdl_level=1,
        category="payments",
        estimated_cost_level="low",
        estimated_effort_level="low",
    )
    db_session.add(rec)
    await db_session.flush()

    cat_res = await db_session.execute(select(BusinessCategory).limit(1))
    cat = cat_res.scalar_one_or_none()

    user = User(
        full_name="Roadmap Test User",
        email=f"roadmap_user_{int(datetime.now().timestamp())}@example.com",
        password_hash="fakehash123",
    )
    db_session.add(user)
    await db_session.flush()

    biz = Business(
        owner_user_id=user.id,
        category_id=cat.id,
        business_name="Roadmap Test Store",
        business_size="micro",
        state="Delhi",
        district="Central Delhi",
    )
    db_session.add(biz)
    await db_session.flush()

    assessment = Assessment(business_id=biz.id, question_bank_version=1, status="submitted")
    db_session.add(assessment)
    await db_session.flush()

    cr = ClassificationResult(assessment_id=assessment.id, method="rule_based", rbdl_level=1, is_primary=True)
    db_session.add(cr)
    await db_session.flush()

    # Business Recommendation instance
    biz_rec = BusinessRecommendation(
        business_id=biz.id,
        classification_result_id=cr.id,
        recommendation_id=rec.id,
        rank_order=1,
        status="suggested",
    )
    db_session.add(biz_rec)
    await db_session.flush()

    # Versioned Roadmap
    roadmap = Roadmap(
        business_id=biz.id,
        classification_result_id=cr.id,
        version=1,
        status="active",
    )
    db_session.add(roadmap)
    await db_session.flush()

    # Roadmap Tasks
    task = RoadmapTask(
        roadmap_id=roadmap.id,
        recommendation_id=rec.id,
        title_en="Order and activate UPI soundbox",
        title_hi="यूपीआई साउंडबॉक्स ऑर्डर और सक्रिय करें",
        phase_number=1,
        sequence_order=1,
        status="pending",
    )
    db_session.add(task)
    await db_session.flush()

    # Append-only Progress Log with denormalized business_id
    prog_log = ProgressLog(
        roadmap_task_id=task.id,
        business_id=biz.id,
        previous_status=None,
        new_status="in_progress",
        note="Vendor delivered QR kit",
        logged_by_user_id=user.id,
    )
    db_session.add(prog_log)
    await db_session.flush()

    assert roadmap.id is not None
    assert task.id is not None
    assert prog_log.business_id == biz.id


@pytest.mark.asyncio
async def test_ml_and_research_records(db_session: AsyncSession):
    """Test ML models, predictions, and research evaluation comparison records."""
    ml_model = MLModel(
        model_name="random_forest_rbdl_v1",
        version="1.0.0",
        algorithm="RandomForestClassifier",
        artifact_path="/artifacts/models/rf_v1.joblib",
        hyperparameters_json={"n_estimators": 100, "max_depth": 6},
        metrics_json={"accuracy": 0.91, "f1_macro": 0.89},
        is_active=True,
        trained_at=datetime.now(timezone.utc).replace(tzinfo=None),
    )
    db_session.add(ml_model)
    await db_session.flush()

    cat_res = await db_session.execute(select(BusinessCategory).limit(1))
    cat = cat_res.scalar_one_or_none()
    user = User(
        full_name="ML Research User",
        email=f"ml_user_{int(datetime.now().timestamp())}@example.com",
        password_hash="fakehash123",
    )
    db_session.add(user)
    await db_session.flush()

    biz = Business(
        owner_user_id=user.id,
        category_id=cat.id,
        business_name="ML Test MSME",
        business_size="medium",
        state="Gujarat",
        district="Ahmedabad",
    )
    db_session.add(biz)
    await db_session.flush()

    assessment = Assessment(business_id=biz.id, question_bank_version=1, status="submitted")
    db_session.add(assessment)
    await db_session.flush()

    # ML Prediction
    pred = MLPrediction(
        assessment_id=assessment.id,
        ml_model_id=ml_model.id,
        predicted_rbdl_level=2,
        confidence_score=0.875,
        feature_snapshot_json={"payments_score": 8, "accounting_score": 7},
    )
    db_session.add(pred)
    await db_session.flush()

    # Research Evaluation record comparing rule vs ML
    research_rec = ResearchEvaluationRecord(
        assessment_id=assessment.id,
        levels_agree=True,
        consultant_corrected_level=2,
        corrected_by_user_id=user.id,
        notes="Model and consultant both confirmed Level 2 readiness",
    )
    db_session.add(research_rec)
    await db_session.flush()

    assert ml_model.id is not None
    assert pred.id is not None
    assert research_rec.id is not None


@pytest.mark.asyncio
async def test_audit_logs_polymorphic(db_session: AsyncSession):
    """Test polymorphic audit logging without tight FK on entity_id."""
    audit = AuditLog(
        actor_user_id=None,
        action="BUSINESS_REGISTRATION",
        entity_type="businesses",
        entity_id=101,
        old_value_json=None,
        new_value_json={"business_name": "Test Audit Store", "state": "UP"},
        ip_address="127.0.0.1",
    )
    db_session.add(audit)
    await db_session.flush()

    assert audit.id is not None
    assert audit.action == "BUSINESS_REGISTRATION"


@pytest.mark.asyncio
async def test_research_dataset_view_query(db_session: AsyncSession):
    """Test querying MySQL research_dataset_view view directly."""
    result = await db_session.execute(text("SELECT * FROM research_dataset_view LIMIT 5"))
    rows = result.fetchall()
    assert isinstance(rows, list)
