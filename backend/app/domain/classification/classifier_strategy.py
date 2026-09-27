"""Abstract Strategy interface for RBDL Classifiers (Rule-Based & ML)."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List
from pydantic import BaseModel


class ClassificationOutput(BaseModel):
    """Output DTO from any classification strategy."""

    rbdl_level: int
    confidence_score: float = 1.0
    method: str  # "rule_based", "ml", "hybrid"
    fired_rule_codes: List[str] = []
    triggered_recommendations: List[str] = []
    evidence_trace: Dict[str, Any]
    model_version: str = "1.0"


class ClassifierStrategy(ABC):
    """Abstract Base Class for swappable classification engines."""

    @abstractmethod
    async def classify(
        self,
        answers: Dict[str, Any],
        business_profile: Dict[str, Any],
        context: Dict[str, Any] | None = None,
    ) -> ClassificationOutput:
        """Classify digital readiness assessment into an RBDL level with full evidence trail."""
        pass
