"""DigiMitra Proposed Requirement-Based Digitalization Framework (Research Instrument V1).

IMPORTANT RESEARCH DISCLOSURE:
All category taxonomies, budget tiers, goal mappings, pain point definitions, and urgency
levels defined herein represent PROPOSED RESEARCH INSTRUMENTS (Version 1). They are designed
for empirical evaluation and reproducible research experiments. They do NOT constitute
empirically validated scientific boundaries or formal economic thresholds.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

RBDL_FRAMEWORK_VERSION = "RBDL_V1"
REQUIREMENT_PROFILE_VERSION = 1
REQUIREMENT_PROFILE_CODE = "REQUIREMENT_PROFILE_V1"
RECOMMENDATION_RULES_VERSION = "RECOMMENDATION_RULES_V1"

RESEARCH_STATUS_DISCLOSURE = (
    "Proposed research instrument for Requirement-Based Digitalization (V1). "
    "Taxonomies and budget categories are illustrative research instruments and not scientifically validated."
)

# -----------------------------------------------------------------------------
# 1. PROPOSED BUDGET TIERS (Research Instrument V1)
# Categorical rather than exact financial reporting to prevent self-reporting barrier
# -----------------------------------------------------------------------------
BUDGET_TIERS_V1: Dict[str, Dict[str, Any]] = {
    "B0_FREE": {
        "code": "B0_FREE",
        "tier_level": 0,
        "name_en": "No additional budget / Free solutions only",
        "name_hi": "कोई अतिरिक्त बजट नहीं / केवल निःशुल्क समाधान",
        "description_en": "Willing to adopt zero-cost, open, or free-tier mobile tools only.",
        "description_hi": "केवल शून्य-लागत, मुफ्त मोबाइल टूल्स अपनाने के इच्छुक।",
        "illustrative_range": "₹0 / month (Illustrative)",
        "compatible_cost_levels": ["low"],  # low-cost/free recommendations
    },
    "B1_LOW": {
        "code": "B1_LOW",
        "tier_level": 1,
        "name_en": "Low budget",
        "name_hi": "कम बजट",
        "description_en": "Can comfortably allocate a small monthly or one-time amount for digital adoption.",
        "description_hi": "डिजिटल अपनाने के लिए छोटा मासिक या एकमुश्त खर्च वहन करने में सक्षम।",
        "illustrative_range": "< ₹1,000 / month (Illustrative)",
        "compatible_cost_levels": ["low"],
    },
    "B2_MODERATE": {
        "code": "B2_MODERATE",
        "tier_level": 2,
        "name_en": "Moderate budget",
        "name_hi": "मध्यम बजट",
        "description_en": "Can invest in subscription software, paid hardware, or dedicated services.",
        "description_hi": "सॉफ्टवेयर सब्सक्रिप्शन, सशुल्क हार्डवेयर या समर्पित सेवाओं में निवेश कर सकते हैं।",
        "illustrative_range": "₹1,000 – ₹5,000 / month (Illustrative)",
        "compatible_cost_levels": ["low", "medium"],
    },
    "B3_HIGHER": {
        "code": "B3_HIGHER",
        "tier_level": 3,
        "name_en": "Higher budget",
        "name_hi": "उच्च बजट",
        "description_en": "Willing to invest in comprehensive digital solutions, custom systems, or marketing.",
        "description_hi": "व्यापक डिजिटल समाधान, कस्टम सिस्टम या मार्केटिंग में निवेश के इच्छुक।",
        "illustrative_range": "> ₹5,000 / month (Illustrative)",
        "compatible_cost_levels": ["low", "medium", "high"],
    },
}

# -----------------------------------------------------------------------------
# 2. PROPOSED BUSINESS GOAL CATEGORIES (Research Instrument V1)
# -----------------------------------------------------------------------------
BUSINESS_GOALS_V1: Dict[str, Dict[str, Any]] = {
    "G1_CUSTOMER_REACH": {
        "code": "G1_CUSTOMER_REACH",
        "name_en": "Increase customer reach",
        "name_hi": "नए ग्राहकों तक पहुंच बढ़ाना",
        "description_en": "Get discovered by more local customers online and via social media.",
        "description_hi": "ऑनलाइन और सोशल मीडिया के माध्यम से अधिक स्थानीय ग्राहकों तक पहुंचें।",
        "primary_dimensions": ["presence", "comms"],
    },
    "G2_INCREASE_SALES": {
        "code": "G2_INCREASE_SALES",
        "name_en": "Increase sales & repeat orders",
        "name_hi": "बिक्री और दोबारा ऑर्डर बढ़ाना",
        "description_en": "Drive revenue growth through digital engagement and catalogs.",
        "description_hi": "डिजिटल जुड़ाव और कैटलॉग के जरिए आमदनी बढ़ाना।",
        "primary_dimensions": ["comms", "presence", "payments"],
    },
    "G3_OPERATIONAL_EFFICIENCY": {
        "code": "G3_OPERATIONAL_EFFICIENCY",
        "name_en": "Improve operational efficiency",
        "name_hi": "परिचालन दक्षता में सुधार",
        "description_en": "Streamline day-to-day operations and reduce transaction bottlenecks.",
        "description_hi": "दैनिक संचालन को व्यवस्थित करना और लेन-देन की बाधाओं को कम करना।",
        "primary_dimensions": ["records", "payments", "inventory"],
    },
    "G4_REDUCE_MANUAL_WORK": {
        "code": "G4_REDUCE_MANUAL_WORK",
        "name_en": "Reduce manual work & errors",
        "name_hi": "मैन्युअल कार्य और गलतियों को कम करना",
        "description_en": "Automate billing, calculating, and repetitive paperwork.",
        "description_hi": "बिलिंग, हिसाब-किताब और कागजी काम को आसान व स्वचालित करना।",
        "primary_dimensions": ["records", "payments"],
    },
    "G5_RECORD_KEEPING": {
        "code": "G5_RECORD_KEEPING",
        "name_en": "Improve record keeping & accounts",
        "name_hi": "बहीखाता व हिसाब-किताब व्यवस्थित करना",
        "description_en": "Maintain structured digital records for credit, debt, and sales.",
        "description_hi": "उधारी, खर्च और बिक्री के लिए डिजिटल बहीखाता बनाए रखना।",
        "primary_dimensions": ["records"],
    },
    "G6_PAYMENTS": {
        "code": "G6_PAYMENTS",
        "name_en": "Improve digital payments & reconciliation",
        "name_hi": "डिजिटल भुगतान और मिलान में सुधार",
        "description_en": "Accept UPI/cards smoothly and track bank deposits accurately.",
        "description_hi": "यूपीआई/कार्ड आसानी से स्वीकार करें और बैंक जमा को ट्रैक करें।",
        "primary_dimensions": ["payments"],
    },
    "G7_INVENTORY": {
        "code": "G7_INVENTORY",
        "name_en": "Improve inventory & stock management",
        "name_hi": "स्टॉक और इन्वेंट्री प्रबंधन सुधारना",
        "description_en": "Avoid stockouts and track fast-moving products digitally.",
        "description_hi": "स्टॉक खत्म होने से बचाना और उत्पादों की डिजिटल ट्रैकिंग।",
        "primary_dimensions": ["inventory"],
    },
    "G8_DATA_DECISIONS": {
        "code": "G8_DATA_DECISIONS",
        "name_en": "Use business data for decisions",
        "name_hi": "व्यावसायिक डेटा के आधार पर निर्णय लेना",
        "description_en": "Analyze customer buying trends, profitability, and sales performance.",
        "description_hi": "ग्राहकों के रुझान, लाभप्रदता और बिक्री प्रदर्शन का विश्लेषण करना।",
        "primary_dimensions": ["data_usage"],
    },
    "G9_EXPANSION": {
        "code": "G9_EXPANSION",
        "name_en": "Expand business to online marketplaces",
        "name_hi": "ऑनलाइन मार्केटप्लेस पर व्यवसाय का विस्तार",
        "description_en": "Sell products on e-commerce, delivery platforms, or ONDC.",
        "description_hi": "ई-कॉमर्स, डिलीवरी प्लेटफॉर्म या ओएनडीसी पर उत्पाद बेचना।",
        "primary_dimensions": ["growth"],
    },
    "G10_OTHER": {
        "code": "G10_OTHER",
        "name_en": "Other specific business goal",
        "name_hi": "अन्य विशिष्ट व्यावसायिक लक्ष्य",
        "description_en": "Other customized operational or strategic target.",
        "description_hi": "अन्य व्यक्तिगत या रणनीतिक व्यावसायिक लक्ष्य।",
        "primary_dimensions": ["infra", "literacy"],
    },
}

# -----------------------------------------------------------------------------
# 3. PROPOSED PAIN POINT CATEGORIES (Research Instrument V1)
# Explicitly mapped to RBDL capability dimensions
# -----------------------------------------------------------------------------
PAIN_POINTS_V1: Dict[str, Dict[str, Any]] = {
    "P1_FIND_CONTACT": {
        "code": "P1_FIND_CONTACT",
        "name_en": "Customers cannot easily find or contact us online",
        "name_hi": "ग्राहक हमें ऑनलाइन आसानी से खोज या संपर्क नहीं कर पाते",
        "target_dimension": "presence",
        "secondary_dimension": "comms",
    },
    "P2_MANUAL_RECORDS": {
        "code": "P2_MANUAL_RECORDS",
        "name_en": "Time-consuming manual record keeping and paper ledgers",
        "name_hi": "कागजी बहीखातों में समय बर्बाद होना और हिसाब में गलतियां",
        "target_dimension": "records",
        "secondary_dimension": None,
    },
    "P3_PAYMENT_MGMT": {
        "code": "P3_PAYMENT_MGMT",
        "name_en": "Difficulties in payment tracking, cash handling, and credit recovery",
        "name_hi": "भुगतान ट्रैकिंग, नकदी प्रबंधन और उधारी वसूली में परेशानी",
        "target_dimension": "payments",
        "secondary_dimension": "records",
    },
    "P4_INVENTORY_MGMT": {
        "code": "P4_INVENTORY_MGMT",
        "name_en": "Stockouts, wastage, or inability to track inventory",
        "name_hi": "स्टॉक खत्म होना, बर्बादी या माल की सही जानकारी न होना",
        "target_dimension": "inventory",
        "secondary_dimension": None,
    },
    "P5_COMMS": {
        "code": "P5_COMMS",
        "name_en": "Difficulty communicating offers, updates, or catalog to customers",
        "name_hi": "ग्राहकों को ऑफ़र, कैटलॉग या जानकारी भेजने में कठिनाई",
        "target_dimension": "comms",
        "secondary_dimension": "presence",
    },
    "P6_DIGITAL_SKILLS": {
        "code": "P6_DIGITAL_SKILLS",
        "name_en": "Lack of digital skills, staff training, or smartphone comfort",
        "name_hi": "कर्मचारियों में डिजिटल कौशल या स्मार्टफोन का पर्याप्त ज्ञान न होना",
        "target_dimension": "literacy",
        "secondary_dimension": "infra",
    },
    "P7_ONLINE_PRESENCE": {
        "code": "P7_ONLINE_PRESENCE",
        "name_en": "No Google Maps, business profile, or website presence",
        "name_hi": "गूगल मैप्स, प्रोफाइल या वेबसाइट पर व्यवसाय का न होना",
        "target_dimension": "presence",
        "secondary_dimension": None,
    },
    "P8_DATA_ANALYTICS": {
        "code": "P8_DATA_ANALYTICS",
        "name_en": "Lack of clarity on which items are profitable or top-selling",
        "name_hi": "कौन सा सामान ज्यादा बिक रहा है या लाभदायक है, इसकी स्पष्ट जानकारी न होना",
        "target_dimension": "data_usage",
        "secondary_dimension": "records",
    },
    "P9_DIGITAL_EXPANSION": {
        "code": "P9_DIGITAL_EXPANSION",
        "name_en": "Struggling to sell online, on marketplaces, or delivery networks",
        "name_hi": "ऑनलाइन मार्केटप्लेस या डिलीवरी नेटवर्क पर बिक्री शुरू करने में दिक्कत",
        "target_dimension": "growth",
        "secondary_dimension": "presence",
    },
    "P10_OTHER": {
        "code": "P10_OTHER",
        "name_en": "Other business or infrastructure challenge",
        "name_hi": "अन्य व्यावसायिक या बुनियादी ढांचा संबंधी चुनौती",
        "target_dimension": "infra",
        "secondary_dimension": None,
    },
}

# -----------------------------------------------------------------------------
# 4. PROPOSED URGENCY LEVELS (Research Instrument V1)
# -----------------------------------------------------------------------------
URGENCY_TIERS_V1: Dict[str, Dict[str, Any]] = {
    "U1_NOT_URGENT": {
        "code": "U1_NOT_URGENT",
        "level": 1,
        "name_en": "Not urgent / Exploratory",
        "name_hi": "कोई जल्दबाजी नहीं / प्रारंभिक खोज",
        "description_en": "Planning for long-term improvement over the next 12+ months.",
        "description_hi": "अगले 12+ महीनों में दीर्घकालिक सुधार की योजना।",
    },
    "U2_WITHIN_6_MONTHS": {
        "code": "U2_WITHIN_6_MONTHS",
        "level": 2,
        "name_en": "Within 6 months",
        "name_hi": "अगले 6 महीनों में",
        "description_en": "Looking to introduce tools in the medium term.",
        "description_hi": "मध्यम अवधि में नए डिजिटल टूल्स शुरू करने का विचार।",
    },
    "U3_WITHIN_1_3_MONTHS": {
        "code": "U3_WITHIN_1_3_MONTHS",
        "level": 3,
        "name_en": "Within 1–3 months",
        "name_hi": "अगले 1–3 महीनों में",
        "description_en": "Active priority to implement changes in the upcoming quarter.",
        "description_hi": "अगली तिमाही में बदलाव लागू करने की सक्रिय प्राथमिकता।",
    },
    "U4_IMMEDIATE": {
        "code": "U4_IMMEDIATE",
        "level": 4,
        "name_en": "Immediate / As soon as possible",
        "name_hi": "तत्काल / यथाशीघ्र",
        "description_en": "Critical immediate need to adopt solutions this week or month.",
        "description_hi": "इसी सप्ताह या महीने में समाधान अपनाने की अत्यंत आवश्यकता।",
    },
}

# -----------------------------------------------------------------------------
# 5. CONTROLLED EXISTING TOOLS INVENTORY (supports 'already-have' exclusion)
# -----------------------------------------------------------------------------
EXISTING_TOOLS_V1: Dict[str, Dict[str, Any]] = {
    "TOOL_UPI_QR": {
        "code": "TOOL_UPI_QR",
        "name_en": "Static / Soundbox UPI QR Code",
        "name_hi": "स्टेटिक / साउंडबॉक्स यूपीआई क्यूआर कोड",
        "related_rec_codes": ["REC-PAY-01"],
    },
    "TOOL_WHATSAPP_BIZ": {
        "code": "TOOL_WHATSAPP_BIZ",
        "name_en": "WhatsApp Business Account with Catalog",
        "name_hi": "कैटलॉग के साथ व्हाट्सएप बिजनेस अकाउंट",
        "related_rec_codes": ["REC-COMM-01"],
    },
    "TOOL_GOOGLE_MAPS": {
        "code": "TOOL_GOOGLE_MAPS",
        "name_en": "Google Business Profile / Google Maps Listing",
        "name_hi": "गूगल बिजनेस प्रोफाइल / गूगल मैप्स लिस्टिंग",
        "related_rec_codes": ["REC-PRES-01"],
    },
    "TOOL_DIGITAL_KHATA": {
        "code": "TOOL_DIGITAL_KHATA",
        "name_en": "Mobile Digital Khata / Ledger App (e.g. Khatabook, OkCredit)",
        "name_hi": "मोबाइल डिजिटल खाता / बहीखाता ऐप",
        "related_rec_codes": ["REC-REC-01"],
    },
    "TOOL_POS_BILLING": {
        "code": "TOOL_POS_BILLING",
        "name_en": "Dedicated POS / GST Billing Software (e.g. Vyapar, Tally)",
        "name_hi": "पीओएस / जीएसटी बिलिंग सॉफ्टवेयर",
        "related_rec_codes": ["REC-REC-02"],
    },
    "TOOL_INVENTORY_APP": {
        "code": "TOOL_INVENTORY_APP",
        "name_en": "Barcode / Digital Stock Management Software",
        "name_hi": "बारकोड / डिजिटल स्टॉक प्रबंधन सॉफ्टवेयर",
        "related_rec_codes": ["REC-INV-01"],
    },
    "TOOL_PAYMENT_GATEWAY": {
        "code": "TOOL_PAYMENT_GATEWAY",
        "name_en": "Online Payment Gateway / Payment Links (e.g. Razorpay, Paytm)",
        "name_hi": "ऑनलाइन पेमेंट गेटवे / पेमेंट लिंक्स",
        "related_rec_codes": ["REC-PAY-02"],
    },
    "TOOL_ECOMMERCE_STORE": {
        "code": "TOOL_ECOMMERCE_STORE",
        "name_en": "E-Commerce Storefront / ONDC / Marketplace Account",
        "name_hi": "ई-कॉमर्स स्टोर / ओएनडीसी / मार्केटप्लेस अकाउंट",
        "related_rec_codes": ["REC-GROW-01"],
    },
    "TOOL_NONE": {
        "code": "TOOL_NONE",
        "name_en": "No digital tools used currently",
        "name_hi": "वर्तमान में किसी डिजिटल टूल का उपयोग नहीं",
        "related_rec_codes": [],
    },
}

# -----------------------------------------------------------------------------
# 6. DETERMINISTIC FEASIBILITY STATES
# -----------------------------------------------------------------------------
class FeasibilityStatus:
    FEASIBLE_NOW = "FEASIBLE_NOW"
    LOWER_COST_ALTERNATIVE = "LOWER_COST_ALTERNATIVE"
    DEFER_DUE_TO_BUDGET = "DEFER_DUE_TO_BUDGET"
    ALREADY_HAVE = "ALREADY_HAVE"
    NOT_APPLICABLE = "NOT_APPLICABLE"
    ELIGIBLE = "ELIGIBLE"

    ALL_STATUSES = [
        FEASIBLE_NOW,
        LOWER_COST_ALTERNATIVE,
        DEFER_DUE_TO_BUDGET,
        ALREADY_HAVE,
        NOT_APPLICABLE,
        ELIGIBLE,
    ]


# -----------------------------------------------------------------------------
# 7. RESEARCH EXPERIMENT REGISTRY (E-01 to E-12)
# -----------------------------------------------------------------------------
RESEARCH_EXPERIMENTS = [
    {"code": "E-01", "name": "Content validity", "phase": "Expert panel validation of items and dimensions"},
    {"code": "E-02", "name": "Rule vs consultant agreement", "phase": "Cohen's kappa & Krippendorff's alpha evaluation"},
    {"code": "E-03", "name": "Test-retest reliability", "phase": "Short-window test-retest consistency without intervention"},
    {"code": "E-04", "name": "Threshold sensitivity", "phase": "Boundary perturbation and stability analysis"},
    {"code": "E-05", "name": "Recommendation appropriateness", "phase": "Blind expert evaluation of suggested roadmaps"},
    {"code": "E-06", "name": "English/Hindi cognitive interviews", "phase": "Qualitative comprehension & cognitive walk-through"},
    {"code": "E-07", "name": "Explanation comprehension/usability", "phase": "User comprehension of evidence cards & score charts"},
    {"code": "E-08", "name": "Level-ordering test", "phase": "Guttman scalogram analysis for hierarchical stage ordering"},
    {"code": "E-09", "name": "Gating vs score-band ablation", "phase": "Evaluation of strict gating vs weighted composite bands"},
    {"code": "E-10", "name": "Longitudinal progress description", "phase": "Tracking progression of re-assessed enterprises over time"},
    {"code": "E-11", "name": "Language equivalence", "phase": "Differential Item Functioning (DIF) across EN and HI"},
    {"code": "E-12", "name": "Research export re-identification", "phase": "K-anonymity and l-diversity audit on export manifests"},
]
