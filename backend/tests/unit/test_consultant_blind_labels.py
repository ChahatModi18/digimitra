from datetime import datetime
import pytest
from app.models.consultant_label import ConsultantBlindLabel
from app.models.assessment import Assessment
from app.models.business import Business
from app.models.user import User
from app.models.business_category import BusinessCategory
from sqlalchemy import select


@pytest.mark.asyncio
async def test_consultant_blind_label_model(db_session):
    """Verify consultant independent label can be recorded against an assessment."""
    ts = int(datetime.now().timestamp() * 1000)
    user = User(
        email=f"consultant_{ts}@example.in",
        hashed_password="hashed_pwd",
        full_name="Dr. Consultant",
        role="researcher",
    )
    db_session.add(user)
    await db_session.flush()

    cat_res = await db_session.execute(select(BusinessCategory).limit(1))
    cat = cat_res.scalar_one_or_none()
    cat_id = cat.id if cat else 1

    biz = Business(
        owner_user_id=user.id,
        category_id=cat_id,
        name=f"Consultant Test Biz {ts}",
        sector="Retail",
        business_size="Micro",
        state="Delhi",
        city="New Delhi",
    )
    db_session.add(biz)
    await db_session.flush()

    ass = Assessment(
        business_id=biz.id,
        status="submitted",
        question_bank_version=1,
        language_used="en",
    )
    db_session.add(ass)
    await db_session.flush()

    label = ConsultantBlindLabel(
        assessment_id=ass.id,
        consultant_user_id=user.id,
        labeled_rbdl_level=2,
        labeling_protocol_version="1.0",
        rationales="MSME has standard QR payments and manual accounting records.",
    )
    db_session.add(label)
    await db_session.commit()

    # Query back
    stmt = select(ConsultantBlindLabel).where(ConsultantBlindLabel.id == label.id)
    res = await db_session.execute(stmt)
    saved = res.scalar_one()
    assert saved.labeled_rbdl_level == 2
    assert saved.consultant_user_id == user.id
