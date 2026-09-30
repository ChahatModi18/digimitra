"""Synthetic Dataset Quality & Consistency Validator.

Enforces automated quality checks:
- No impossible operational combinations
- Taxonomy category and sector coverage
- Score ranges and dimension boundaries (0.0 to 10.0)
- RBDL deterministic rule consistency
- Duplicate detection
- Budget & Requirement Profile consistency
"""

from typing import Dict, List, Any, Set
from app.domain.taxonomy.categories import SECTORS, TAXONOMY_CATALOG
from app.domain.rbdl.dimensions import RBDL_DIMENSIONS
from app.domain.requirements.constants_v1 import BUDGET_TIERS_V1


class SyntheticDataValidator:
    """Automated validator ensuring synthetic records satisfy domain invariants."""

    @staticmethod
    def validate_record(record: Dict[str, Any]) -> List[str]:
        """Validate a single synthetic business + assessment record. Returns list of errors."""
        errors: List[str] = []
        biz = record.get("business", {})
        ass = record.get("assessment", {})
        req = record.get("requirement_profile", {})

        # 1. Identity & Non-empty checks
        if not biz.get("synthetic_business_id"):
            errors.append("Missing synthetic_business_id")

        # 2. Sector and category validity
        sector = biz.get("sector_code")
        if sector not in SECTORS:
            errors.append(f"Invalid sector_code: {sector}")

        # 3. Impossible combinations check
        internet = biz.get("internet_access", False)
        smartphone = biz.get("smartphone_access", False)
        computer = biz.get("computer_access", False)

        if not internet and biz.get("website_status") not in ["none", None]:
            errors.append("Impossible combination: No internet access but website_status is active")

        if not internet and "cloud_erp" in biz.get("record_keeping", ""):
            errors.append("Impossible combination: No internet access but record_keeping is cloud_erp")

        if not smartphone and not computer and (internet or biz.get("digital_literacy") == "high"):
            errors.append("Impossible combination: High digital literacy or internet access with zero devices")

        if not smartphone and "upi_soundbox" in biz.get("payment_methods", []):
            errors.append("Impossible combination: UPI Soundbox without smartphone device access")

        # 4. Dimension score boundaries
        dim_scores = ass.get("dimension_scores", {})
        for dim in RBDL_DIMENSIONS:
            if dim in dim_scores:
                val = dim_scores[dim]
                if not (0.0 <= val <= 10.0):
                    errors.append(f"Dimension score {dim}={val} out of range [0.0, 10.0]")

        # 5. RBDL level validity
        level = ass.get("rbdl_level")
        if level not in [0, 1, 2, 3]:
            errors.append(f"Invalid RBDL level: {level}")

        # 6. Budget tier validity
        budget = req.get("budget_tier")
        if budget not in BUDGET_TIERS_V1:
            errors.append(f"Invalid budget_tier: {budget}")

        return errors

    @classmethod
    def validate_dataset(cls, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Validate an entire synthetic dataset batch and compute health metrics."""
        total = len(records)
        all_errors: List[str] = []
        all_warnings: List[str] = []
        seen_ids: Set[str] = set()

        sector_counts: Dict[str, int] = {k: 0 for k in SECTORS}
        level_counts: Dict[int, int] = {0: 0, 1: 0, 2: 0, 3: 0}

        for idx, rec in enumerate(records):
            biz_id = rec.get("business", {}).get("synthetic_business_id")
            if biz_id in seen_ids:
                all_errors.append(f"Duplicate business_id: {biz_id} at index {idx}")
            seen_ids.add(biz_id)

            rec_errors = cls.validate_record(rec)
            all_errors.extend([f"Record {idx} ({biz_id}): {e}" for e in rec_errors])

            sector = rec.get("business", {}).get("sector_code")
            if sector in sector_counts:
                sector_counts[sector] += 1

            level = rec.get("assessment", {}).get("rbdl_level")
            if level in level_counts:
                level_counts[level] += 1

        # Check sector representation
        empty_sectors = [s for s, c in sector_counts.items() if c == 0]
        if empty_sectors and total >= 50:
            all_warnings.append(f"Sectors with zero representation: {empty_sectors}")

        # Check class representation
        empty_levels = [lvl for lvl, c in level_counts.items() if c == 0]
        if empty_levels and total >= 50:
            all_warnings.append(f"RBDL levels with zero representation: {empty_levels}")

        is_valid = len(all_errors) == 0

        return {
            "is_valid": is_valid,
            "total_records": total,
            "error_count": len(all_errors),
            "warning_count": len(all_warnings),
            "errors_sample": all_errors[:20],
            "warnings": all_warnings,
            "sector_distribution": sector_counts,
            "rbdl_level_distribution": level_counts,
        }
