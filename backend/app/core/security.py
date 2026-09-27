"""Security, JWT Authentication, Password Hashing, and RBAC Definitions."""

from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Any, Dict, Optional
import bcrypt
import jwt
from app.config import settings
from app.core.exceptions import AuthenticationException, AuthorizationException


class UserRole(str, Enum):
    """Role-Based Access Control (RBAC) user roles."""

    BUSINESS_OWNER = "business_owner"
    CONSULTANT = "consultant"
    ADMIN = "admin"
    RESEARCHER = "researcher"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against a bcrypt hashed password."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Generate bcrypt hash for a plain-text password."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def create_access_token(
    subject: str,
    role: str = UserRole.BUSINESS_OWNER.value,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[Dict[str, Any]] = None,
) -> str:
    """Create a signed JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode: Dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    if extra_claims:
        to_encode.update(extra_claims)

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    subject: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a signed JWT refresh token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode = {
        "sub": str(subject),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "refresh",
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate a signed JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise AuthenticationException("Authentication token has expired.")
    except jwt.InvalidTokenError:
        raise AuthenticationException("Invalid authentication token.")


def check_role_permission(user_role: str, allowed_roles: list[UserRole]) -> None:
    """Verify that the user role has sufficient authorization."""
    allowed_values = [r.value for r in allowed_roles]
    if user_role not in allowed_values:
        raise AuthorizationException(
            f"Role '{user_role}' is not authorized to access this resource."
        )
