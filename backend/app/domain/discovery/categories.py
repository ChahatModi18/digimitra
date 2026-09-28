"""Canonical Service Discovery Categories & Dimension Mappings (A8)."""

from typing import Dict, List
from app.schemas.discovery import DiscoveryCategory

DISCOVERY_CATEGORIES: List[DiscoveryCategory] = [
    DiscoveryCategory(
        id="payments",
        name_en="Digital Payments & POS",
        name_hi="डिजिटल भुगतान एवं पीओएस",
        description_en="Merchant QR codes, UPI soundboxes, POS card swipe machines, and payment gateways.",
        description_hi="मर्चेंट क्यूआर कोड, यूपीआई साउंडबॉक्स, पीओएस मशीनें और पेमेंट गेटवे।",
        icon_name="CreditCard",
        relevant_dimensions=["payments", "banking"],
    ),
    DiscoveryCategory(
        id="accounting",
        name_en="Accounting & GST Billing",
        name_hi="अकाउंटिंग एवं जीएसटी बिलिंग",
        description_en="Digital bookkeeping apps, GST-compliant invoicing software, and local CA assistance.",
        description_hi="डिजिटल बहीखाता ऐप, जीएसटी बिलिंग सॉफ्टवेयर और स्थानीय सीए सहायता।",
        icon_name="FileSpreadsheet",
        relevant_dimensions=["records", "comms"],
    ),
    DiscoveryCategory(
        id="website",
        name_en="Web Development & E-Commerce",
        name_hi="वेब डेवलपमेंट एवं ई-कॉमर्स",
        description_en="Business websites, domain registration, ONDC seller onboarding, and catalog creators.",
        description_hi="व्यावसायिक वेबसाइट, डोमेन पंजीकरण, ओएनडीसी सेलर ऑनबोर्डिंग और ऑनलाइन कैटलॉग।",
        icon_name="Globe",
        relevant_dimensions=["presence", "inventory"],
    ),
    DiscoveryCategory(
        id="marketing",
        name_en="Digital Marketing & Local Search",
        name_hi="डिजिटल मार्केटिंग एवं लोकल सर्च",
        description_en="Google Business Profile setup, local SEO, WhatsApp Business marketing, and social media.",
        description_hi="गूगल बिजनेस प्रोफाइल, लोकल सर्च लिस्टिंग, व्हाट्सएप बिजनेस एवं सोशल मीडिया मार्केटिंग।",
        icon_name="Megaphone",
        relevant_dimensions=["presence", "comms"],
    ),
    DiscoveryCategory(
        id="training",
        name_en="Digital Literacy & Skill Training",
        name_hi="डिजिटल साक्षरता एवं कौशल प्रशिक्षण",
        description_en="Government digital literacy centres, PMKVY training, and smartphone accounting workshops.",
        description_hi="सरकारी डिजिटल साक्षरता केंद्र, पीएमकेवीवाई प्रशिक्षण एवं स्मार्टफोन वर्कशॉप।",
        icon_name="GraduationCap",
        relevant_dimensions=["literacy"],
    ),
    DiscoveryCategory(
        id="msme_support",
        name_en="MSME & Government Support Centres",
        name_hi="एमएसएमई एवं सरकारी सहायता केंद्र",
        description_en="District Industries Centres (DIC), Common Service Centres (CSC), and Udyam helpdesks.",
        description_hi="जिला उद्योग केंद्र (DIC), कॉमन सर्विस सेंटर (CSC) एवं उद्यम पंजीकरण हेल्पडेस्क।",
        icon_name="Building2",
        relevant_dimensions=["banking", "records", "infra"],
    ),
    DiscoveryCategory(
        id="infrastructure",
        name_en="Hardware & Network Infrastructure",
        name_hi="कंप्यूटर, हार्डवेयर एवं नेटवर्क",
        description_en="Business broadband providers, computer hardware, barcode scanners, and thermal receipt printers.",
        description_hi="ब्रॉडबैंड इंटरनेट, कंप्यूटर हार्डवेयर, बारकोड स्कैनर और थर्मल प्रिंटर विक्रेता।",
        icon_name="Server",
        relevant_dimensions=["infra", "automation"],
    ),
    DiscoveryCategory(
        id="security",
        name_en="Cyber Security & Cloud Backup",
        name_hi="साइबर सुरक्षा एवं क्लाउड बैकअप",
        description_en="Automated cloud backup tools, business antivirus, and data recovery assistance.",
        description_hi="स्वचालित क्लाउड बैकअप टूल, बिजनेस एंटीवायरस और डेटा सुरक्षा सेवाएं।",
        icon_name="ShieldCheck",
        relevant_dimensions=["security"],
    ),
]

DISCOVERY_CATEGORY_MAP: Dict[str, DiscoveryCategory] = {
    cat.id: cat for cat in DISCOVERY_CATEGORIES
}


def get_suggested_categories_for_dimensions(weak_dimensions: List[str]) -> List[str]:
    """
    Returns relevant discovery category IDs given a list of weak RBDL dimension codes.
    Deterministic, downstream personalization only.
    """
    suggested: List[str] = []
    for dim in weak_dimensions:
        for cat in DISCOVERY_CATEGORIES:
            if dim in cat.relevant_dimensions and cat.id not in suggested:
                suggested.append(cat.id)
    return suggested
