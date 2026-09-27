"""Business Profile Schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class BusinessBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    sector: str = Field(..., max_length=100)
    enterprise_size: str = Field(..., pattern="^(Micro|Small|Medium)$")
    state: str = Field(..., max_length=100)
    city: str = Field(..., max_length=100)
    pincode: Optional[str] = Field(default=None, max_length=10)
    description: Optional[str] = None
    primary_language: str = Field(default="en", max_length=10)


class BusinessCreate(BusinessBase):
    pass


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    sector: Optional[str] = None
    enterprise_size: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    description: Optional[str] = None
    primary_language: Optional[str] = None


class BusinessRead(BusinessBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
