"""Authentication and User Registration Endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import AuthenticationException, EntityAlreadyExistsException
from app.core.security import create_access_token, create_refresh_token, get_password_hash, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserRead
from sqlalchemy import select

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=APIResponse[UserRead], status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user account (business owner or consultant)."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise EntityAlreadyExistsException("User", "email", user_in.email)

    new_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone_number=user_in.phone_number,
        role=user_in.role,
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
            expires_in=3600,
            user=UserRead.model_validate(user),
        ),
    )
