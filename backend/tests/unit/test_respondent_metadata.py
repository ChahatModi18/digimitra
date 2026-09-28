from datetime import datetime
import pytest
from app.models.assessment import Assessment
from app.models.business import Business
from app.models.user import User
from app.models.business_category import BusinessCategory
from app.schemas.assessment import AssessmentStart, AssessmentRead
from app.services.assessment_service import AssessmentService
from sqlalchemy import select


@pytest.mark.asyncio
async def test_respondent_metadata_persistence(db_session):
    """Verify administration_mode, respondent_role, and reassessment_reason are saved cleanly."""
    ts = int(datetime.now().timestamp() * 1000)
    user = User(
        email=f"resp_test_{ts}@example.in",
        hashed_password="hashed_pwd",
        full_name="Respondent Test",
        role="business_owner",
    )
    db_session.add(user)
    await db_session.flush()

    cat_res = await db_session.execute(select(BusinessCategory).limit(1))
    cat = cat_res.scalar_one_or_none()
    cat_id = cat.id if cat else 1

    biz = Business(
        owner_user_id=user.id,
        category_id=cat_id,
        name=f"Resp Biz {ts}",
        sector="Retail",
        business_size="Micro",
        state="Delhi",
        city="New Delhi",
    )
    db_session.add(biz)
    await db_session.flush()

    assessment = await AssessmentService.start_assessment(
        db=db_session,
        business_id=biz.id,
        user_id=user.id,
        language_used="en",
        administration_mode="consultant_assisted",
        respondent_role="owner",
        reassessment_reason="post_intervention",
    )
    assert assessment.administration_mode == "consultant_assisted"
    assert assessment.respondent_role == "owner"
    assert assessment.reassessment_reason == "post_intervention"
