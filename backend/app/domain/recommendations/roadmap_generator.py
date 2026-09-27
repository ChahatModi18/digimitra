"""Personalized Phased Roadmap Generator (Claude C4).

Divides ranked recommendations into 3 actionable transformation phases:
- Phase 1: Quick Wins (High feasibility, low-to-medium cost, high readiness)
- Phase 2: Core Next Steps (High impact transformation steps)
- Phase 3: Longer Term (Strategic expansion and advanced tools)

Enforces phase caps (Phase 1: 3-5 tasks, Total Roadmap: 10-12 tasks).
"""

from typing import Any, Dict, List
from pydantic import BaseModel

from app.domain.recommendations.ranking import RankedRecommendation


class PhasedRoadmapTask(BaseModel):
    """An actionable task assigned to a specific roadmap phase."""

    recommendation_code: str
    title_en: str
    title_hi: str
    description_en: str
    description_hi: str
    phase_number: int          # 1, 2, 3
    phase_name_en: str         # "Quick Wins", "Core Next Steps", "Longer Term"
    phase_name_hi: str         # "त्वरित परिणाम", "मुख्य अगले कदम", "दीर्घकालिक योजना"
    sequence_order: int        # 1..N across roadmap
    priority_score: float
    estimated_cost_level: str
    estimated_effort_level: str
    impact_level_str: str
    reason_en: str
    reason_hi: str
    status: str = "pending"


class PhasedRoadmapResult(BaseModel):
    """Complete phased roadmap output."""

    target_rbdl_level: int
    total_tasks: int
    phase_1_tasks: List[PhasedRoadmapTask]
    phase_2_tasks: List[PhasedRoadmapTask]
    phase_3_tasks: List[PhasedRoadmapTask]
    all_tasks: List[PhasedRoadmapTask]


class RoadmapGeneratorEngine:
    """Deterministic phased roadmap generator."""

    PHASE_1_CAP: int = 4       # Max 4 Quick Wins (3-5 range)
    TOTAL_ROADMAP_CAP: int = 12 # Max 12 active tasks

    PHASE_NAMES = {
        1: ("Quick Wins", "त्वरित परिणाम"),
        2: ("Core Next Steps", "मुख्य अगले कदम"),
        3: ("Longer Term", "दीर्घकालिक योजना"),
    }

    @classmethod
    def generate_roadmap(
        cls,
        ranked_recommendations: List[RankedRecommendation],
        target_rbdl_level: int,
    ) -> PhasedRoadmapResult:
        """Divide ranked recommendations into Phase 1, Phase 2, and Phase 3."""
        phase_1: List[RankedRecommendation] = []
        phase_2: List[RankedRecommendation] = []
        phase_3: List[RankedRecommendation] = []

        assigned_codes = set()

        # 1. Assign Phase 1: Quick Wins
        # Criteria: feasibility == 3 (low effort) AND cost <= 2 (low/medium) AND readiness >= 2.0
        for item in ranked_recommendations:
            b = item.priority_breakdown
            if (
                b.feasibility_level == 3
                and b.cost_level <= 2
                and b.readiness_alignment >= 2.0
                and len(phase_1) < cls.PHASE_1_CAP
            ):
                phase_1.append(item)
                assigned_codes.add(item.recommendation_code)

        # 2. Assign Phase 2: Core Next Steps
        # Criteria: impact_level == 3 (high impact) not already in Phase 1
        for item in ranked_recommendations:
            if item.recommendation_code not in assigned_codes:
                if item.priority_breakdown.impact_level == 3:
                    phase_2.append(item)
                    assigned_codes.add(item.recommendation_code)

        # 3. Assign Phase 3: Longer Term
        # Criteria: Remaining items
        for item in ranked_recommendations:
            if item.recommendation_code not in assigned_codes:
                phase_3.append(item)
                assigned_codes.add(item.recommendation_code)

        # Sort each phase by priority_score descending
        phase_1.sort(key=lambda x: -x.priority_breakdown.final_priority_score)
        phase_2.sort(key=lambda x: -x.priority_breakdown.final_priority_score)
        phase_3.sort(key=lambda x: -x.priority_breakdown.final_priority_score)

        # Convert to PhasedRoadmapTask and assign global sequence_order
        seq = 1
        p1_tasks: List[PhasedRoadmapTask] = []
        for r in phase_1:
            if seq <= cls.TOTAL_ROADMAP_CAP:
                p1_tasks.append(cls._create_task(r, 1, seq))
                seq += 1

        p2_tasks: List[PhasedRoadmapTask] = []
        for r in phase_2:
            if seq <= cls.TOTAL_ROADMAP_CAP:
                p2_tasks.append(cls._create_task(r, 2, seq))
                seq += 1

        p3_tasks: List[PhasedRoadmapTask] = []
        for r in phase_3:
            if seq <= cls.TOTAL_ROADMAP_CAP:
                p3_tasks.append(cls._create_task(r, 3, seq))
                seq += 1

        all_tasks = p1_tasks + p2_tasks + p3_tasks

        return PhasedRoadmapResult(
            target_rbdl_level=target_rbdl_level,
            total_tasks=len(all_tasks),
            phase_1_tasks=p1_tasks,
            phase_2_tasks=p2_tasks,
            phase_3_tasks=p3_tasks,
            all_tasks=all_tasks,
        )

    @classmethod
    def _create_task(cls, rec: RankedRecommendation, phase_num: int, seq: int) -> PhasedRoadmapTask:
        names = cls.PHASE_NAMES.get(phase_num, (f"Phase {phase_num}", f"चरण {phase_num}"))
        return PhasedRoadmapTask(
            recommendation_code=rec.recommendation_code,
            title_en=rec.title_en,
            title_hi=rec.title_hi,
            description_en=rec.description_en,
            description_hi=rec.description_hi,
            phase_number=phase_num,
            phase_name_en=names[0],
            phase_name_hi=names[1],
            sequence_order=seq,
            priority_score=rec.priority_breakdown.final_priority_score,
            estimated_cost_level=rec.estimated_cost_level,
            estimated_effort_level=rec.estimated_effort_level,
            impact_level_str=rec.impact_level_str,
            reason_en=rec.reason_en,
            reason_hi=rec.reason_hi,
            status="pending",
        )
