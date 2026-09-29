"""Unit tests for security functions, password hashing, JWT lifecycle, and RBAC permission checks."""

from datetime import datetime, timedelta, timezone
import pytest
from app.core.exceptions import AuthenticationException, AuthorizationException
from app.core.security import (
    UserRole,
    check_role_permission,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)


def test_password_hashing_and_verification():
    """Verify bcrypt password hashing and verification behavior."""
    raw_password = "SuperSecretPassword123!@#"
    hashed = get_password_hash(raw_password)

    assert hashed != raw_password
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False
    assert verify_password("", hashed) is False
    assert verify_password(raw_password, "invalid_hash_string") is False


def test_jwt_access_and_refresh_token_lifecycle():
    """Verify valid token generation, payload decoding, and claim preservation."""
    user_id = 42
    role = UserRole.BUSINESS_OWNER.value
    token = create_access_token(
        subject=str(user_id),
        role=role,
        expires_delta=timedelta(minutes=15),
        extra_claims={"email": "owner@example.com"},
    )

    payload = decode_token(token)
    assert payload["sub"] == "42"
    assert payload["role"] == UserRole.BUSINESS_OWNER.value
    assert payload["email"] == "owner@example.com"
    assert payload["type"] == "access"
    assert "exp" in payload


def test_jwt_expired_token_handling():
    """Verify that expired JWT token raises AuthenticationException."""
    expired_token = create_access_token(
        subject="100",
        expires_delta=timedelta(seconds=-10),  # expired 10 seconds ago
    )

    with pytest.raises(AuthenticationException) as exc_info:
        decode_token(expired_token)
    assert "Authentication token has expired" in str(exc_info.value.message)


def test_jwt_tampered_token_handling():
    """Verify that tampered JWT token fails signature verification."""
    token = create_access_token(subject="200")
    tampered = token[:-5] + "XXXXX"

    with pytest.raises(AuthenticationException) as exc_info:
        decode_token(tampered)
    assert "Invalid authentication token" in str(exc_info.value.message)


def test_rbac_permission_checking():
    """Verify role authorization checks for different user roles."""
    # 1. Admin allowed
    check_role_permission(UserRole.ADMIN.value, [UserRole.ADMIN, UserRole.RESEARCHER])

    # 2. Researcher allowed
    check_role_permission(UserRole.RESEARCHER.value, [UserRole.ADMIN, UserRole.RESEARCHER])

    # 3. Business owner denied admin access
    with pytest.raises(AuthorizationException) as exc_info:
        check_role_permission(UserRole.BUSINESS_OWNER.value, [UserRole.ADMIN, UserRole.RESEARCHER])
    assert "not authorized" in str(exc_info.value.message)

    # 4. Consultant denied admin access
    with pytest.raises(AuthorizationException):
        check_role_permission(UserRole.CONSULTANT.value, [UserRole.ADMIN])
