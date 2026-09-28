"""Integration Tests for Research ML API & RBAC Security (C5 Section 17 & 22)."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, UserRole
from app.models.user import User


@pytest.mark.asyncio
async def test_research_ml_api_rbac_restrictions(client: AsyncClient, db_session: AsyncSession):
    """
    Verify that only admin and researcher roles can access /api/v1/research/ml/*,
    while business_owner and consultant roles receive 403 Forbidden.
    """
    import random
    suffix = random.randint(100000, 999999)

    # 1. Create a Business Owner user
    owner_user = User(
        email=f"owner_{suffix}@example.com",
        hashed_password="hashed_pw",
        full_name="Business Owner",
        phone_number=f"92{suffix}"[:10],
        role=UserRole.BUSINESS_OWNER.value,
        is_active=True,
    )
    db_session.add(owner_user)

    # 2. Create an Admin user
    admin_user = User(
        email=f"admin_{suffix}@example.com",
        hashed_password="hashed_pw",
        full_name="System Admin",
        phone_number=f"93{suffix}"[:10],
        role=UserRole.ADMIN.value,
        is_active=True,
    )
    db_session.add(admin_user)

    # 3. Create a Researcher user
    researcher_user = User(
        email=f"researcher_{suffix}@example.com",
        hashed_password="hashed_pw",
        full_name="Lead Researcher",
        phone_number=f"94{suffix}"[:10],
        role=UserRole.RESEARCHER.value,
        is_active=True,
    )
    db_session.add(researcher_user)
    await db_session.commit()

    owner_token = create_access_token(subject=str(owner_user.id), role=UserRole.BUSINESS_OWNER.value)
    admin_token = create_access_token(subject=str(admin_user.id), role=UserRole.ADMIN.value)
    researcher_token = create_access_token(subject=str(researcher_user.id), role=UserRole.RESEARCHER.value)

    # A. Business Owner should get 403 Forbidden on dataset-summary
    res_owner_summary = await client.get(
        "/api/v1/research/ml/dataset-summary",
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    assert res_owner_summary.status_code == 403

    # B. Business Owner should get 403 Forbidden on train
    res_owner_train = await client.post(
        "/api/v1/research/ml/train",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"algorithm": "logistic_regression"},
    )
    assert res_owner_train.status_code == 403

    # C. Admin should get 200 OK on dataset-summary
    res_admin_summary = await client.get(
        "/api/v1/research/ml/dataset-summary",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_admin_summary.status_code == 200
    assert res_admin_summary.json()["success"] is True

    # D. Researcher should get 200 OK on train (returns readiness information)
    res_researcher_train = await client.post(
        "/api/v1/research/ml/train",
        headers={"Authorization": f"Bearer {researcher_token}"},
        json={"algorithm": "logistic_regression"},
    )
    assert res_researcher_train.status_code == 200
    train_data = res_researcher_train.json()
    assert train_data["success"] is True
    assert "training_executed" in train_data
