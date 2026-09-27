"""Unit tests for password hashing and JWT security tokens."""

import pytest
from app.core.exceptions import AuthenticationException
from app.core.security import (
    UserRole,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)


def test_password_hashing():
    raw_pass = "SecureMSMEPassword2026!"
    hashed = get_password_hash(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_flow():
    user_id = 42
    token = create_access_token(subject=str(user_id), role=UserRole.BUSINESS_OWNER.value)
    payload = decode_token(token)

    assert payload["sub"] == "42"
    assert payload["role"] == "business_owner"
    assert payload["type"] == "access"


def test_refresh_token_creation():
    user_id = 101
    refresh = create_refresh_token(subject=str(user_id))
    payload = decode_token(refresh)

    assert payload["sub"] == "101"
    assert payload["type"] == "refresh"
