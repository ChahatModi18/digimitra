"""Research Export Re-Identification Diagnostic (Safeguard I-06).

Evaluates k-anonymity across quasi-identifier combinations for research dataset exports.

IMPORTANT RESEARCH & PRIVACY SAFEGUARDS:
- Does NOT claim statutory or legal DPDP compliance.
- Threshold k is strictly configurable and recorded as researcher-supplied.
- Raw personal/identifying fields (names, phones, emails, street addresses) are excluded.
- Diagnostic output summarizes bin sizes without leaking specific microdata identifiers.
"""

from typing import Any, Dict, List, Optional
from collections import Counter
from pydantic import BaseModel, Field


class KAnonymityBinDetail(BaseModel):
    """Aggregated bin summary for quasi-identifier group."""

    quasi_identifier_values: Dict[str, Any]
    count: int
    is_below_k: bool


class KAnonymityReport(BaseModel):
    """Diagnostic outcome for research export privacy inspection."""

    threshold_k: int = Field(..., description="threshold supplied/configured by researcher")
    total_records: int
    total_bins: int
    bins_meeting_k: int
    bins_violating_k: int
    records_in_violating_bins: int
    fraction_violating: float
    is_dataset_k_anonymous: bool
    evaluated_quasi_identifiers: List[str]
    sample_violating_bin_frequencies: List[int]
    disclaimer: str = (
        "Diagnostic tool only: K-anonymity score reflects quasi-identifier distribution under "
        "the researcher-supplied threshold. This check does NOT certify formal DPDP Act statutory compliance."
    )


class KAnonymityEvaluator:
    """Computes k-anonymity metrics over research dataset exports."""

    DEFAULT_QUASI_IDENTIFIERS = ["state", "district", "category_id", "business_size"]

    @classmethod
    def evaluate(
        cls,
        records: List[Dict[str, Any]],
        k_threshold: int = 5,
        quasi_identifiers: Optional[List[str]] = None,
    ) -> KAnonymityReport:
        """Analyze quasi-identifier tuple distributions against configured threshold k."""
        if k_threshold < 1:
            k_threshold = 1

        qi_list = quasi_identifiers or cls.DEFAULT_QUASI_IDENTIFIERS
        total_records = len(records)

        if total_records == 0:
            return KAnonymityReport(
                threshold_k=k_threshold,
                total_records=0,
                total_bins=0,
                bins_meeting_k=0,
                bins_violating_k=0,
                records_in_violating_bins=0,
                fraction_violating=0.0,
                is_dataset_k_anonymous=True,
                evaluated_quasi_identifiers=qi_list,
                sample_violating_bin_frequencies=[],
            )

        # Build tuples of quasi-identifier values
        tuple_counts: Counter = Counter()
        for r in records:
            # Extract quasi-identifier keys safely
            qi_tuple = tuple(str(r.get(qi, "UNKNOWN")).strip().lower() for qi in qi_list)
            tuple_counts[qi_tuple] += 1

        total_bins = len(tuple_counts)
        meeting_k = 0
        violating_k = 0
        violating_records = 0
        violating_freqs: List[int] = []

        for qi_tuple, count in tuple_counts.items():
            if count >= k_threshold:
                meeting_k += 1
            else:
                violating_k += 1
                violating_records += count
                violating_freqs.append(count)

        fraction_violating = round(violating_records / total_records, 4) if total_records > 0 else 0.0
        is_k_anon = violating_k == 0

        # Sort frequencies for statistical reporting
        violating_freqs.sort()

        return KAnonymityReport(
            threshold_k=k_threshold,
            total_records=total_records,
            total_bins=total_bins,
            bins_meeting_k=meeting_k,
            bins_violating_k=violating_k,
            records_in_violating_bins=violating_records,
            fraction_violating=fraction_violating,
            is_dataset_k_anonymous=is_k_anon,
            evaluated_quasi_identifiers=qi_list,
            sample_violating_bin_frequencies=violating_freqs[:20],  # frequency counts only, no raw PII
        )
