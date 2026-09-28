"""Pydantic schemas for Service Discovery and Location Services (A8)."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DiscoveryCategory(BaseModel):
    """Canonical service discovery category."""

    id: str = Field(..., description="Unique category identifier (e.g. payments, accounting)")
    name_en: str = Field(..., description="English category display name")
    name_hi: str = Field(..., description="Hindi category display name")
    description_en: str = Field(..., description="English category description")
    description_hi: str = Field(..., description="Hindi category description")
    icon_name: str = Field(..., description="Lucide icon identifier")
    relevant_dimensions: List[str] = Field(default_factory=list, description="Associated RBDL dimension codes")


class ServiceProviderItem(BaseModel):
    """Normalized service provider / resource entry."""

    id: str = Field(..., description="Unique provider / service ID")
    name: str = Field(..., description="Provider or resource name")
    category_id: str = Field(..., description="Discovery category identifier")
    locality: str = Field(..., description="Locality / Area / City")
    district: Optional[str] = Field(None, description="District name")
    state: str = Field(..., description="State or Union Territory")
    pincode: Optional[str] = Field(None, description="PIN code if known")
    short_description_en: str = Field(..., description="Short English description")
    short_description_hi: Optional[str] = Field(None, description="Short Hindi description")
    is_official_resource: bool = Field(False, description="True for Govt/MSME official resource centres")
    website_url: Optional[str] = Field(None, description="Official portal or website URL if verified")
    contact_phone: Optional[str] = Field(None, description="Contact helpline or phone if verified")
    action_label_en: Optional[str] = Field(None, description="Primary action button label in English")
    action_label_hi: Optional[str] = Field(None, description="Primary action button label in Hindi")
    action_url: Optional[str] = Field(None, description="Direct verified action URL")
    is_mock_data: bool = Field(False, description="True only for test mock records")


class ServiceSearchQuery(BaseModel):
    """Search and filter parameters for service discovery."""

    category: Optional[str] = Field(None, description="Category filter (e.g. payments, accounting)")
    search_term: Optional[str] = Field(None, description="Search keyword in English or Hindi")
    state: Optional[str] = Field(None, description="State filter")
    district: Optional[str] = Field(None, description="District filter")
    city: Optional[str] = Field(None, description="City / Locality filter")
    pincode: Optional[str] = Field(None, description="PIN code filter")
    business_id: Optional[int] = Field(None, description="Optional registered business ID for contextual discovery")
    page: int = Field(1, ge=1, description="Page number")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")


class ServiceSearchResponse(BaseModel):
    """Paginated response containing discovered services and provider status."""

    items: List[ServiceProviderItem] = Field(default_factory=list, description="List of matching services")
    total_count: int = Field(0, description="Total matching items")
    page: int = Field(1, description="Current page")
    page_size: int = Field(20, description="Page size")
    provider_status: str = Field(
        ...,
        description="Status of discovery provider ('live', 'empty_unconfigured', 'mock_test')",
    )
    provider_message_en: str = Field(..., description="Informative status message in English")
    provider_message_hi: str = Field(..., description="Informative status message in Hindi")
    applied_location: Optional[Dict[str, Optional[str]]] = Field(
        None, description="Resolved search location context"
    )
    suggested_categories: List[str] = Field(
        default_factory=list, description="Contextual category suggestions based on business assessment"
    )
