"""Dataset Quality Filtering (C5 Section 6 & 7).

Applies validation rules to ensure only valid, high-integrity assessment records
are considered for research evaluation:
1. Status must be 'submitted' (or completed)
2. Completion ratio must be >= min_completion_ratio (default 0.5)
3. No unresolved contradictions
"""

from typing import Any, Dict, List, Tuple


class QualityFilter:
    """Filters candidate assessment records and tracks exclusion statistics."""

    def __init__(self, min_completion_ratio: float = 0.5, allow_contradictions: bool = False):
        self.min_completion_ratio = min_completion_ratio
        self.allow_contradictions = allow_contradictions

    def filter_records(
        self, candidate_records: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], Dict[str, int]]:
        """
        Filters raw assessment candidate records.

        Returns:
        --------
        (eligible_records, exclusion_counts_by_reason)
        """
        eligible: List[Dict[str, Any]] = []
        exclusion_counts: Dict[str, int] = {
            "not_submitted": 0,
            "below_completion_threshold": 0,
            "unresolved_contradiction": 0,
            "missing_label": 0,
        }

        for rec in candidate_records:
            status = str(rec.get("status", "")).lower()
            if status not in ("submitted", "completed"):
                exclusion_counts["not_submitted"] += 1
                continue

            completion = float(rec.get("completion_ratio", 1.0))
            if completion < self.min_completion_ratio:
                exclusion_counts["below_completion_threshold"] += 1
                continue

            contradiction = int(rec.get("contradiction_flag", 0))
            if contradiction > 0 and not self.allow_contradictions:
                exclusion_counts["unresolved_contradiction"] += 1
                continue

            if rec.get("target_level") is None:
                exclusion_counts["missing_label"] += 1
                continue

            eligible.append(rec)

        return eligible, exclusion_counts
