"""Common and shared Pydantic DTOs and API response models."""

from typing import Any, Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standardized top-level API response envelope."""

    success: bool = True
    message: Optional[str] = None
    data: Optional[T] = None


class ErrorDetail(BaseModel):
    """Structured error payload."""

    code: str
    message: str
    details: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Standardized top-level error response envelope."""

    success: bool = False
    error: ErrorDetail


class PaginationParams(BaseModel):
    """Query parameters for pagination."""

    page: int = Field(default=1, ge=1, description="Page number starting from 1")
    page_size: int = Field(default=20, ge=1, le=100, description="Items per page (max 100)")


class PaginatedResponse(BaseModel, Generic[T]):
    """Envelope for paginated list results."""

    items: List[T]
    total_count: int
    page: int
    page_size: int
    total_pages: int
