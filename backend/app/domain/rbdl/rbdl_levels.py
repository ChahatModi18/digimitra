"""Canonical definitions and semantics for RBDL (Requirement-Based Digitalization Levels)."""

from enum import IntEnum
from typing import Any, Dict


class RBDLLevel(IntEnum):
    """RBDL Maturity Level enumeration (0 to 3)."""

    LEVEL_0 = 0  # Non-Digital / Traditional Paper-Based
    LEVEL_1 = 1  # Basic Digital Presence & Payment Integration
    LEVEL_2 = 2  # Operational & Process Digitalization
    LEVEL_3 = 3  # Integrated & Data-Driven Digital Enterprise


RBDL_METADATA: Dict[RBDLLevel, Dict[str, Any]] = {
    RBDLLevel.LEVEL_0: {
        "level": 0,
        "name_en": "Level 0: Non-Digital / Traditional Paper-Based",
        "name_hi": "स्तर 0: गैर-डिजिटल / पारंपरिक कागजी",
        "short_description_en": "Manual record-keeping, cash-only operations, no active digital business footprint.",
        "short_description_hi": "मैन्युअल रिकॉर्ड-कीपिंग, केवल नकद संचालन, कोई सक्रिय डिजिटल व्यावसायिक उपस्थिति नहीं।",
        "primary_focus": "Adoption of basic digital tools, UPI payments, and basic listing.",
    },
    RBDLLevel.LEVEL_1: {
        "level": 1,
        "name_en": "Level 1: Basic Digital Presence & Payments",
        "name_hi": "स्तर 1: बुनियादी डिजिटल उपस्थिति एवं भुगतान",
        "short_description_en": "Adoption of QR/UPI payments, WhatsApp Business, or local online listings.",
        "short_description_hi": "क्यूआर/यूपीआई भुगतान, व्हाट्सएप बिजनेस, या स्थानीय ऑनलाइन लिस्टिंग को अपनाना।",
        "primary_focus": "Transitioning to digital accounting, structured inventory, and digital cataloging.",
    },
    RBDLLevel.LEVEL_2: {
        "level": 2,
        "name_en": "Level 2: Operational & Process Digitalization",
        "name_hi": "स्तर 2: परिचालन एवं प्रक्रिया डिजिटलीकरण",
        "short_description_en": "Digital bookkeeping (e.g. Vyapar/Tally), structured inventory, active social commerce or e-commerce channel.",
        "short_description_hi": "डिजिटल बहीखाता (जैसे व्यापार/टैली), संरचित इन्वेंट्री, सक्रिय सोशल कॉमर्स या ई-कॉमर्स चैनल।",
        "primary_focus": "Integration across systems, customer data analytics, and operational automation.",
    },
    RBDLLevel.LEVEL_3: {
        "level": 3,
        "name_en": "Level 3: Integrated & Data-Driven Digital Enterprise",
        "name_hi": "स्तर 3: एकीकृत एवं डेटा-संचालित डिजिटल उद्यम",
        "short_description_en": "Integrated ERP/CRM workflows, multi-channel selling, automated inventory sync, and data-informed decision making.",
        "short_description_hi": "एकीकृत ईआरपी/सीआरएम वर्कफ़्लो, मल्टी-चैनल बिक्री, स्वचालित इन्वेंट्री सिंक, और डेटा-आधारित निर्णय लेना।",
        "primary_focus": "Advanced predictive analytics, customer loyalty automation, and digital scale.",
    },
}


def get_rbdl_info(level: int) -> Dict[str, Any]:
    """Retrieve metadata description for a given RBDL numeric level."""
    try:
        enum_level = RBDLLevel(level)
        return RBDL_METADATA[enum_level]
    except (ValueError, KeyError):
        return {
            "level": level,
            "name_en": f"Level {level}: Custom / Unclassified",
            "name_hi": f"स्तर {level}: अनिर्धारित",
            "short_description_en": "Unrecognized maturity level.",
            "short_description_hi": "अपरिचित परिपक्वता स्तर।",
            "primary_focus": "Re-evaluation recommended.",
        }
