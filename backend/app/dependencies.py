"""FastAPI shared dependencies."""

from typing import AsyncGenerator, List, Optional
from fastapi import Depends, Header, Query, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import AuthenticationException, AuthorizationException
from app.core.i18n import resolve_locale
from app.core.security import UserRole, check_role_permission, decode_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import PaginationParams

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_locale(
    accept_language: Optional[str] = Header(None, alias="Accept-Language"),
    lang: Optional[str] = Query(None, alias="lang"),
) -> str:
    """Dependency that extracts and resolves client locale (e.g. 'en' or 'hi')."""
    return resolve_locale(accept_language=accept_language, requested_lang=lang)


def get_pagination(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
) -> PaginationParams:
    """Dependency for request pagination parameters."""
    return PaginationParams(page=page, page_size=page_size)


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Dependency to extract optional authenticated user from JWT token."""
    if not token:
        return None
    try:
        payload = decode_token(token)
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise AuthenticationException("Token payload missing subject.")
        user_id = int(user_id_str)
        user = await db.get(User, user_id)
        if not user or not user.is_active:
            raise AuthenticationException("User not found or inactive.")
        return user
    except Exception as exc:
        raise AuthenticationException(f"Could not validate credentials: {exc}")


async def get_authenticated_user(
    current_user: Optional[User] = Depends(get_current_user),
) -> User:
    """Dependency that strictly requires an authenticated user."""
    if not current_user:
        raise AuthenticationException("Authentication required. Please provide a valid Bearer token.")
    return current_user


def require_roles(allowed_roles: List[UserRole]):
    """Role-Based Access Control dependency factory."""
    async def role_checker(current_user: User = Depends(get_authenticated_user)) -> User:
        check_role_permission(current_user.role, allowed_roles)
        return current_user

    return role_checker
