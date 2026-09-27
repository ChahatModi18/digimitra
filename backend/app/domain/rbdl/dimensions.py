"""Canonical RBDL Assessment Dimensions, Metadata, and Weights (Claude C3).

NOTE: The RBDL instrument is a proposed research instrument for MSME digitalization.
Thresholds, weights, and scoring rules represent initial research baselines and require
further empirical calibration.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass(frozen=True)
class DimensionMetadata:
    """Metadata and canonical configuration for an RBDL assessment dimension."""

    code: str
    name_en: str
    name_hi: str
    description_en: str
    description_hi: str
    weight: float  # C3 proposed weight for composite score calculation
    display_order: int


# Nine canonical assessment dimensions defined in Claude C3
RBDL_DIMENSIONS: Dict[str, DimensionMetadata] = {
    "infra": DimensionMetadata(
        code="infra",
        name_en="Digital Infrastructure",
        name_hi="डिजिटल बुनियादी ढांचा",
        description_en="Hardware, internet connectivity, and device accessibility in the business.",
        description_hi="व्यवसाय में हार्डवेयर, इंटरनेट कनेक्टिविटी और उपकरणों की उपलब्धता।",
        weight=0.15,
        display_order=1,
    ),
    "literacy": DimensionMetadata(
        code="literacy",
        name_en="Digital Literacy",
        name_hi="डिजिटल साक्षरता",
        description_en="Owner and staff comfort with mobile apps, digital skills, and tool adoption.",
        description_hi="मोबाइल ऐप, डिजिटल कौशल और टूल अपनाने में मालिक और कर्मचारियों की सहजता।",
        weight=0.15,
        display_order=2,
    ),
    "presence": DimensionMetadata(
        code="presence",
        name_en="Online Presence",
        name_hi="ऑनलाइन उपस्थिति",
        description_en="Google Business, social media channels, and web storefront footprint.",
        description_hi="गूगल बिजनेस, सोशल मीडिया चैनल और वेब स्टोरफ्रंट उपस्थिति।",
        weight=0.12,
        display_order=3,
    ),
    "comms": DimensionMetadata(
        code="comms",
        name_en="Customer Communication",
        name_hi="ग्राहक संचार",
        description_en="Channels used for customer inquiries, orders, and engagement.",
        description_hi="ग्राहकों की पूछताछ, ऑर्डर और जुड़ाव के लिए उपयोग किए जाने वाले चैनल।",
        weight=0.10,
        display_order=4,
    ),
    "records": DimensionMetadata(
        code="records",
        name_en="Record Management",
        name_hi="रिकॉर्ड प्रबंधन",
        description_en="Method of recording daily sales, expenses, and business bookkeeping.",
        description_hi="दैनिक बिक्री, खर्च और व्यावसायिक बहीखाता रिकॉर्ड करने की विधि।",
        weight=0.12,
        display_order=5,
    ),
    "payments": DimensionMetadata(
        code="payments",
        name_en="Payment Systems",
        name_hi="भुगतान प्रणालियाँ",
        description_en="Adoption of UPI, QR soundboxes, cards, and reconciliation practices.",
        description_hi="यूपीआई, क्यूआर साउंडबॉक्स, कार्ड और समाधान प्रथाओं को अपनाना।",
        weight=0.12,
        display_order=6,
    ),
    "inventory": DimensionMetadata(
        code="inventory",
        name_en="Inventory & Operations",
        name_hi="इन्वेंट्री एवं संचालन",
        description_en="Stock management, cataloging, and operational digitalization.",
        description_hi="स्टॉक प्रबंधन, कैटलॉगिंग और परिचालन डिजिटलीकरण।",
        weight=0.10,
        display_order=7,
    ),
    "data_usage": DimensionMetadata(
        code="data_usage",
        name_en="Data Usage",
        name_hi="डेटा उपयोग",
        description_en="Review of sales metrics and data-informed business decision making.",
        description_hi="बिक्री मीट्रिक की समीक्षा और डेटा-सूचित व्यावसायिक निर्णय लेना।",
        weight=0.08,
        display_order=8,
    ),
    "growth": DimensionMetadata(
        code="growth",
        name_en="Business Growth Readiness",
        name_hi="व्यावसायिक विकास तत्परता",
        description_en="Awareness of digital government schemes (ONDC, GeM) and expansion plans.",
        description_hi="डिजिटल सरकारी योजनाओं (ओएनडीसी, जीईएम) और विस्तार योजनाओं की जानकारी।",
        weight=0.06,
        display_order=9,
    ),
}

DIMENSION_WEIGHTS: Dict[str, float] = {
    dim_code: meta.weight for dim_code, meta in RBDL_DIMENSIONS.items()
}


def get_dimension_info(dimension_code: str) -> Optional[DimensionMetadata]:
    """Retrieve metadata for a given dimension code."""
    return RBDL_DIMENSIONS.get(dimension_code)


def get_all_dimensions() -> List[DimensionMetadata]:
    """Retrieve all dimensions ordered by canonical display order."""
    return sorted(RBDL_DIMENSIONS.values(), key=lambda d: d.display_order)
