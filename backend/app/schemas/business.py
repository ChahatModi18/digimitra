"""Business Profile Schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class BusinessBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    sector: str = Field(..., max_length=100)
    business_type: Optional[str] = Field(default=None, max_length=150)
    sub_category: Optional[str] = Field(default=None, max_length=150)
    owner_name: Optional[str] = Field(default=None, max_length=150)
    year_established: Optional[int] = Field(default=None)
    years_in_operation: Optional[int] = Field(default=None)
    enterprise_size: str = Field(..., pattern="^(Micro|Small|Medium)$")
    employee_count: Optional[int] = Field(default=None)
    state: str = Field(..., max_length=100)
    city: str = Field(..., max_length=100)
    area_locality: Optional[str] = Field(default=None, max_length=150)
    business_address: Optional[str] = Field(default=None, max_length=255)
    pincode: Optional[str] = Field(default=None, max_length=10)
    contact_phone: Optional[str] = Field(default=None, max_length=30)
    contact_email: Optional[str] = Field(default=None, max_length=255)
    website: Optional[str] = Field(default=None, max_length=255)
    primary_language: str = Field(default="en", max_length=10)
    additional_language: Optional[str] = Field(default=None, max_length=50)
    business_model: Optional[str] = Field(default=None, max_length=100)
    target_customers: Optional[str] = Field(default=None, max_length=255)
    monthly_revenue: Optional[str] = Field(default=None, max_length=100)
    digitalization_goal: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None


class BusinessCreate(BusinessBase):
    pass


class BusinessUpdate(BaseModel):
    name: Optional[str] = None
    sector: Optional[str] = None
    business_type: Optional[str] = None
    sub_category: Optional[str] = None
    owner_name: Optional[str] = None
    year_established: Optional[int] = None
    years_in_operation: Optional[int] = None
    enterprise_size: Optional[str] = None
    employee_count: Optional[int] = None
    state: Optional[str] = None
    city: Optional[str] = None
    area_locality: Optional[str] = None
    business_address: Optional[str] = None
    pincode: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    website: Optional[str] = None
    primary_language: Optional[str] = None
    additional_language: Optional[str] = None
    business_model: Optional[str] = None
    target_customers: Optional[str] = None
    monthly_revenue: Optional[str] = None
    digitalization_goal: Optional[str] = None
    description: Optional[str] = None


class BusinessRead(BusinessBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CategoryRead(BaseModel):
    id: int
    code: Optional[str] = None
    sector_code: Optional[str] = None
    category_code: Optional[str] = None
    subcategory_code: Optional[str] = None
    name_en: str
    name_hi: str
    description_en: Optional[str] = None
    description_hi: Optional[str] = None
    typical_needs: Optional[list[str]] = Field(default=None, alias="typical_needs_json")
    typical_tools: Optional[list[str]] = Field(default=None, alias="typical_tools_json")
    typical_digitalization_paths: Optional[list[str]] = Field(default=None, alias="typical_digitalization_paths_json")
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
