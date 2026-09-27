"""Classification Schemas."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RuleFiringTrace(BaseModel):
    rule_code: str
    rule_name: str
    rbdl_level_target: int
    fired: bool
    rationale: str
    condition_details: Optional[Dict[str, Any]] = None


class EvidenceTrace(BaseModel):
    timestamp: datetime
    rules_evaluated_count: int
    rules_fired_count: int
    rule_traces: List[RuleFiringTrace]
    summary: str


class ClassificationRead(BaseModel):
    id: int
    assessment_id: int
    rbdl_level: int = Field(..., ge=0, le=3, description="RBDL Level from 0 to 3")
    rbdl_level_name: Optional[str] = None
    method: str
    evidence_trace: Dict[str, Any]
    confidence_score: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
