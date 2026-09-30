"""Synthetic Requirement Profile Generator.

Generates realistic Requirement Profile V1 records (goals, pain points, urgency,
budget tiers, existing tools, preferred solutions) conditioned on business profile
and assessment gaps.
"""

from typing import Dict, List, Any, Optional
import numpy as np
from app.domain.requirements.constants_v1 import (
    BUDGET_TIERS_V1,
    BUSINESS_GOALS_V1,
    PAIN_POINTS_V1,
    URGENCY_TIERS_V1,
    EXISTING_TOOLS_V1,
)

PREFERRED_SOLUTIONS = [
    "SOL_MOBILE_APP",
    "SOL_WHATSAPP_BASED",
    "SOL_DESKTOP_POS",
    "SOL_CLOUD_SOFTWARE",
    "SOL_ASSISTED_SERVICE",
]


class SyntheticRequirementGenerator:
    """Generates consistent Requirement Profiles matching business capability and gaps."""

    def __init__(self, seed: int = 42):
        self.rng = np.random.RandomState(seed)

    def generate_requirement_profile(
        self,
        business: Dict[str, Any],
        assessment_summary: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Generate a Requirement Profile V1 payload.
        
        Parameters:
        -----------
        business : Synthetic business profile dict
        assessment_summary : Output from SyntheticAssessmentGenerator
        """
        cap = business["base_capability"]
        biz_size = business["business_size"]
        sector = business["sector_code"]
        dimension_scores = assessment_summary["dimension_scores"]

        # 1. Budget Tier Selection (correlated with business size and capability)
        if biz_size == "micro":
            budget_weights = [0.35, 0.45, 0.18, 0.02]
        elif biz_size == "small":
            budget_weights = [0.08, 0.32, 0.48, 0.12]
        else:  # medium
            budget_weights = [0.02, 0.13, 0.45, 0.40]

        budget_tier_code = self.rng.choice(list(BUDGET_TIERS_V1.keys()), p=budget_weights)

        # 2. Pain Points Selection (matching lowest scoring dimensions)
        sorted_dims = sorted(dimension_scores.items(), key=lambda x: x[1])
        weakest_dims = [dim for dim, score in sorted_dims[:3]]

        selected_pain_points: List[str] = []
        for p_code, p_meta in PAIN_POINTS_V1.items():
            if p_meta.get("target_dimension") in weakest_dims:
                selected_pain_points.append(p_code)

        if not selected_pain_points:
            selected_pain_points = ["P1_FIND_CONTACT", "P2_MANUAL_RECORDS"]
        # Limit to 1-3 pain points
        num_pains = int(self.rng.choice([1, 2, 3], p=[0.2, 0.5, 0.3]))
        selected_pain_points = list(self.rng.choice(selected_pain_points, size=min(num_pains, len(selected_pain_points)), replace=False))

        # 3. Goals Selection (sector & growth oriented)
        goal_pool = list(BUSINESS_GOALS_V1.keys())
        # Sector-guided preferences
        if sector in ["RETAIL", "FOOD_HOSPITALITY"]:
            pref_goals = ["G1_CUSTOMER_REACH", "G2_INCREASE_SALES", "G6_PAYMENTS", "G7_INVENTORY"]
        elif sector in ["SERVICES", "HOME_LOCAL"]:
            pref_goals = ["G1_CUSTOMER_REACH", "G4_REDUCE_MANUAL_WORK", "G5_RECORD_KEEPING"]
        elif sector == "MANUFACTURING":
            pref_goals = ["G3_OPERATIONAL_EFFICIENCY", "G7_INVENTORY", "G8_DATA_DECISIONS"]
        else:
            pref_goals = ["G1_CUSTOMER_REACH", "G3_OPERATIONAL_EFFICIENCY", "G5_RECORD_KEEPING"]

        num_goals = int(self.rng.choice([1, 2, 3], p=[0.25, 0.55, 0.20]))
        selected_goals = list(self.rng.choice(pref_goals, size=min(num_goals, len(pref_goals)), replace=False))

        # 4. Urgency
        urgency_weights = [0.20, 0.35, 0.30, 0.15]
        urgency_code = self.rng.choice(list(URGENCY_TIERS_V1.keys()), p=urgency_weights)

        # 5. Preferred Solution
        if not business["computer_access"]:
            sol_pool = ["SOL_MOBILE_APP", "SOL_WHATSAPP_BASED", "SOL_ASSISTED_SERVICE"]
            sol_weights = [0.55, 0.35, 0.10]
        elif biz_size == "medium" or cap > 0.7:
            sol_pool = ["SOL_CLOUD_SOFTWARE", "SOL_DESKTOP_POS", "SOL_MOBILE_APP"]
            sol_weights = [0.50, 0.35, 0.15]
        else:
            sol_pool = PREFERRED_SOLUTIONS
            sol_weights = [0.35, 0.25, 0.20, 0.15, 0.05]

        preferred_solution = self.rng.choice(sol_pool, p=sol_weights)

        # 6. Existing Tools (drawn from business profile)
        existing_tools: List[str] = []
        if business["smartphone_access"]:
            existing_tools.append("Smartphone")
        if business["computer_access"]:
            existing_tools.append("Desktop / Laptop")
        if "upi_soundbox" in business["payment_methods"]:
            existing_tools.append("UPI Soundbox")
        elif "cash_and_basic_upi" in business["payment_methods"]:
            existing_tools.append("UPI QR Stand")
        if "digital_ledger_app" in business["record_keeping"]:
            existing_tools.append("Digital Khata App")
        elif "accounting_software" in business["record_keeping"]:
            existing_tools.append("Accounting Software")
        elif "cloud_erp" in business["record_keeping"]:
            existing_tools.append("Cloud ERP")
        if "whatsapp_business" in business["communication_tools"] or "whatsapp_business_automated" in business["communication_tools"]:
            existing_tools.append("WhatsApp Business")

        return {
            "budget_tier": budget_tier_code,
            "goals": selected_goals,
            "pain_points": selected_pain_points,
            "urgency": urgency_code,
            "preferred_solution": preferred_solution,
            "existing_tools": existing_tools,
        }
