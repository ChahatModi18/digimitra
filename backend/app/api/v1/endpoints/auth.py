"""Authentication and User Registration Endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.config import settings
from app.core.exceptions import AuthenticationException, EntityAlreadyExistsException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.user import RefreshTokenRequest, TokenResponse, UserCreate, UserLogin, UserRead
from sqlalchemy import select

router = APIRouter(prefix="/auth", tags=["Authentication"])

ALLOWED_REGISTRATION_ROLES = {"business_owner", "consultant"}


@router.post("/register", response_model=APIResponse[UserRead], status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user account (business owner or consultant)."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise EntityAlreadyExistsException("User", "email", user_in.email)

    # Controlled role assignment: public registration cannot create privileged roles
    assigned_role = user_in.role if user_in.role in ALLOWED_REGISTRATION_ROLES else "business_owner"

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone_number=user_in.phone_number,
        role=assigned_role,
        is_active=True,
    )
    db.add(new_user)
    await db.flush()
    await db.refresh(new_user)

    return APIResponse(
        success=True,
        message="User account registered successfully.",
        data=UserRead.model_validate(new_user),
    )


@router.post("/login", response_model=APIResponse[TokenResponse])
async def login_user(login_in: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate user and issue JWT access and refresh tokens."""
    result = await db.execute(select(User).where(User.email == login_in.email))
    user = result.scalars().first()

    if not user or not verify_password(login_in.password, user.hashed_password):
        raise AuthenticationException("Invalid email or password.")

    if not user.is_active:
        raise AuthenticationException("Account is disabled.")

    access_token = create_access_token(subject=str(user.id), role=user.role)
    refresh_token = create_refresh_token(subject=str(user.id))

    return APIResponse(
        success=True,
        message="Authentication successful.",
        data=TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserRead.model_validate(user),
        ),
    )


@router.post("/refresh", response_model=APIResponse[TokenResponse])
async def refresh_token_endpoint(payload: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Refresh access and refresh tokens using a valid refresh token."""
    token_payload = decode_token(payload.refresh_token)
    if token_payload.get("type") != "refresh":
        raise AuthenticationException("Invalid token type for refresh.")

    user_id = token_payload.get("sub")
    if not user_id:
        raise AuthenticationException("Invalid token subject.")

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalars().first()
    if not user or not user.is_active:
        raise AuthenticationException("User account not found or disabled.")

    access_token = create_access_token(subject=str(user.id), role=user.role)
    new_refresh_token = create_refresh_token(subject=str(user.id))

    return APIResponse(
        success=True,
        message="Token refreshed successfully.",
        data=TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserRead.model_validate(user),
        ),
    )

