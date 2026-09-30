"""Government MSME Initiatives REST Endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Query, status
from pydantic import BaseModel

from app.schemas.common import APIResponse
from app.core.exceptions import EntityNotFoundException
from app.domain.government.initiatives import (
    GOVERNMENT_INITIATIVES_CATALOG,
    GovernmentInitiative,
    get_all_initiatives,
    get_initiative_by_code,
    get_initiatives_for_business,
)

router = APIRouter(prefix="/government/initiatives", tags=["Government Initiatives"])


class GovernmentInitiativeDTO(BaseModel):
    initiative_code: str
    name_en: str
    name_hi: str
    ministry_department: str
    purpose_en: str
    purpose_hi: str
    target_beneficiary_en: str
    target_beneficiary_hi: str
    eligibility_summary_en: str
    eligibility_summary_hi: str
    digitalization_relevance_en: str
    digitalization_relevance_hi: str
    what_digimitra_helps_with_en: str
    what_digimitra_helps_with_hi: str
    application_route_en: str
    application_route_hi: str
    official_source_url: str
    last_verified_date: str
    verification_status: str
    disclaimer: str


def _to_dto(init: GovernmentInitiative) -> GovernmentInitiativeDTO:
    return GovernmentInitiativeDTO(
        initiative_code=init.initiative_code,
        name_en=init.name_en,
        name_hi=init.name_hi,
        ministry_department=init.ministry_department,
        purpose_en=init.purpose_en,
        purpose_hi=init.purpose_hi,
        target_beneficiary_en=init.target_beneficiary_en,
        target_beneficiary_hi=init.target_beneficiary_hi,
        eligibility_summary_en=init.eligibility_summary_en,
        eligibility_summary_hi=init.eligibility_summary_hi,
        digitalization_relevance_en=init.digitalization_relevance_en,
        digitalization_relevance_hi=init.digitalization_relevance_hi,
        what_digimitra_helps_with_en=init.what_digimitra_helps_with_en,
        what_digimitra_helps_with_hi=init.what_digimitra_helps_with_hi,
        application_route_en=init.application_route_en,
        application_route_hi=init.application_route_hi,
        official_source_url=init.official_source_url,
        last_verified_date=init.last_verified_date,
        verification_status=init.verification_status,
        disclaimer=init.disclaimer,
    )


@router.get("", response_model=APIResponse[List[GovernmentInitiativeDTO]])
async def list_initiatives(
    state: Optional[str] = Query(None, description="Optional State filter (e.g. 'Rajasthan')"),
    sector: Optional[str] = Query(None, description="Optional Sector filter (e.g. 'RETAIL')"),
    level: Optional[int] = Query(0, description="Optional current digitalization level"),
):
    """Retrieve verified government MSME initiatives matching enterprise profile."""
    if state or sector:
        initiatives = get_initiatives_for_business(state=state or "", sector=sector or "", current_level=level or 0)
    else:
        initiatives = get_all_initiatives()

    return APIResponse(
        success=True,
        data=[_to_dto(i) for i in initiatives],
    )


@router.get("/{code}", response_model=APIResponse[GovernmentInitiativeDTO])
async def get_initiative(code: str):
    """Retrieve details of an individual government initiative by code."""
    init = get_initiative_by_code(code)
    if not init:
        raise EntityNotFoundException("GovernmentInitiative", code)
    return APIResponse(
        success=True,
        data=_to_dto(init),
    )
