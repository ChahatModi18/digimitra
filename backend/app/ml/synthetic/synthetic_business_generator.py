"""Synthetic Business Profile Generator.

Generates realistic MSME business operational profiles across all taxonomy categories.
Enforces dependency-aware attributes to prevent impossible combinations.
"""

from typing import Dict, List, Any, Optional
import numpy as np
from app.domain.taxonomy.categories import TAXONOMY_CATALOG, TaxonomyNode


STATES_AND_DISTRICTS: Dict[str, List[str]] = {
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar", "Bhilwara", "Sikar"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Thane"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida", "Prayagraj", "Meerut", "Ghaziabad"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Kalaburagi"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur"],
    "Delhi": ["Central Delhi", "New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Siliguri", "Asansol"],
}


class SyntheticBusinessGenerator:
    """Generates realistic synthetic business records with dependency constraints."""

    def __init__(self, seed: int = 42):
        self.rng = np.random.RandomState(seed)

    def generate_business(
        self,
        business_id: int,
        target_capability_tier: Optional[int] = None,
        preferred_sector: Optional[str] = None,
        preferred_category: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Generate a single synthetic business record.
        
        Parameters:
        -----------
        business_id : Unique identifier
        target_capability_tier : Optional target tier (0, 1, 2, or 3) to guide capability simulation
        preferred_sector : Optional sector filter
        preferred_category : Optional category filter
        """
        # 1. Select taxonomy node
        candidates = TAXONOMY_CATALOG
        if preferred_sector:
            candidates = [c for c in candidates if c.sector_code == preferred_sector]
        if preferred_category:
            filtered = [c for c in candidates if c.subcategory_code == preferred_category or c.category_code == preferred_category]
            if filtered:
                candidates = filtered

        node: TaxonomyNode = self.rng.choice(candidates)

        # 2. Select geography
        state = self.rng.choice(list(STATES_AND_DISTRICTS.keys()))
        district = self.rng.choice(STATES_AND_DISTRICTS[state])
        is_urban = district in ["Mumbai", "Bengaluru", "Delhi", "Ahmedabad", "Chennai", "Pune", "Kolkata", "Jaipur"]
        location_level = "urban" if is_urban else self.rng.choice(["semi-urban", "rural"], p=[0.6, 0.4])

        # 3. Size and tenure
        size_prob = [0.75, 0.20, 0.05]  # Indian MSME distribution heavily skewed to micro
        business_size = self.rng.choice(["micro", "small", "medium"], p=size_prob)
        years_operating = int(self.rng.choice(
            [1, 2, 3, 5, 8, 12, 18, 25, 35],
            p=[0.10, 0.12, 0.15, 0.20, 0.18, 0.12, 0.08, 0.04, 0.01]
        ))
        
        # 4. Latent Digital Capability (0.0 to 1.0)
        tier_means = [0.18, 0.58, 0.78, 0.94]
        if target_capability_tier is not None:
            base_cap = float(np.clip(self.rng.normal(tier_means[target_capability_tier], 0.06), 0.02, 0.98))
        else:
            # Natural distribution: 25% L0, 45% L1, 22% L2, 8% L3
            tier = self.rng.choice([0, 1, 2, 3], p=[0.25, 0.45, 0.22, 0.08])
            base_cap = float(np.clip(self.rng.normal(tier_means[tier], 0.06), 0.02, 0.98))

        # 5. Dependency-Aware Infrastructure & Digital Literacy
        # Rule: literacy and device ownership depend on base_cap and size
        digital_literacy_score = float(np.clip(base_cap + self.rng.normal(0, 0.1), 0.0, 1.0))
        if digital_literacy_score < 0.25:
            digital_literacy = "low"
            smartphone_access = bool(self.rng.choice([True, False], p=[0.6, 0.4]))
            computer_access = False
            internet_access = smartphone_access and bool(self.rng.choice([True, False], p=[0.7, 0.3]))
        elif digital_literacy_score < 0.65:
            digital_literacy = "moderate"
            smartphone_access = True
            computer_access = bool(self.rng.choice([True, False], p=[0.35, 0.65]))
            internet_access = True
        else:
            digital_literacy = "high"
            smartphone_access = True
            computer_access = bool(self.rng.choice([True, False], p=[0.85, 0.15]))
            internet_access = True

        # 6. Operational Tooling conditioned on access
        if not internet_access:
            website_status = "none"
            social_media_status = "none"
            communication_tools = ["in_person", "sms_calling"]
            payment_methods = ["cash_only"] if not smartphone_access else ["cash_and_basic_upi"]
            record_keeping = "paper_registers"
            inventory_management = "none" if node.sector_code in ["SERVICES", "PROFESSIONAL"] else "manual_notebook"
            data_usage = "none"
        else:
            # Payments
            if base_cap < 0.3:
                payment_methods = ["cash_and_basic_upi"]
                communication_tools = ["whatsapp_basic", "calling"]
                record_keeping = "paper_registers"
                website_status = "none"
                social_media_status = "none"
                inventory_management = "none" if node.sector_code in ["SERVICES", "PROFESSIONAL"] else "manual_notebook"
                data_usage = "none"
            elif base_cap < 0.6:
                payment_methods = ["upi_soundbox", "cash", "bank_transfer"]
                communication_tools = ["whatsapp_business", "calling"]
                record_keeping = "digital_ledger_app"  # e.g. Khatabook
                website_status = "google_business_profile"
                social_media_status = "basic_instagram_facebook" if node.sector_code in ["RETAIL", "FOOD_HOSPITALITY", "CREATIVE_ARTISAN"] else "none"
                inventory_management = "basic_pos_app" if node.sector_code not in ["SERVICES", "PROFESSIONAL"] else "none"
                data_usage = "sales_review_monthly"
            elif base_cap < 0.8:
                payment_methods = ["pos_machine", "upi_soundbox", "qr_code", "bank_transfer"]
                communication_tools = ["whatsapp_business_automated", "email"]
                record_keeping = "accounting_software"  # Tally / Vyapar
                website_status = "standalone_website"
                social_media_status = "active_social_marketing"
                inventory_management = "integrated_pos_inventory" if node.sector_code not in ["SERVICES", "PROFESSIONAL"] else "appointment_software"
                data_usage = "weekly_dashboard_monitoring"
            else:
                payment_methods = ["online_gateway", "pos_machine", "upi_soundbox", "net_banking"]
                communication_tools = ["crm_integrated_messaging", "email", "whatsapp_api"]
                record_keeping = "cloud_erp"  # Zoho, Marg, ERP
                website_status = "ecommerce_enabled"
                social_media_status = "omnichannel_paid_campaigns"
                inventory_management = "automated_multi_channel_inventory" if node.sector_code not in ["SERVICES", "PROFESSIONAL"] else "crm_project_tracking"
                data_usage = "advanced_analytics_and_forecasting"

        # Growth orientation
        growth_orientation = "aggressive" if base_cap > 0.7 else ("steady" if base_cap > 0.35 else "survival")

        return {
            "synthetic_business_id": f"SYN-BIZ-{business_id:06d}",
            "numeric_id": business_id,
            "business_name": f"{district} {node.display_name_en} {business_id}",
            "sector_code": node.sector_code,
            "category_code": node.category_code,
            "subcategory_code": node.subcategory_code,
            "category_display_en": node.display_name_en,
            "category_display_hi": node.display_name_hi,
            "business_size": business_size,
            "years_operating": years_operating,
            "state": state,
            "district": district,
            "location_level": location_level,
            "base_capability": round(base_cap, 3),
            "digital_literacy": digital_literacy,
            "internet_access": internet_access,
            "smartphone_access": smartphone_access,
            "computer_access": computer_access,
            "website_status": website_status,
            "social_media_status": social_media_status,
            "communication_tools": communication_tools,
            "record_keeping": record_keeping,
            "payment_methods": payment_methods,
            "inventory_management": inventory_management,
            "data_usage": data_usage,
            "growth_orientation": growth_orientation,
            "typical_needs": node.typical_needs,
            "typical_tools": node.typical_tools,
        }
