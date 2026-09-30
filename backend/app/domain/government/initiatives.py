"""Verified Government MSME Initiatives Knowledge Base.

Contains verified factual details on official Indian Central and State MSME programs.
Strictly disclaims guaranteed eligibility ('Check official eligibility').
Maintains verification dates and official government portal sources.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional


@dataclass
class GovernmentInitiative:
    initiative_code: str
    name_en: str
    name_hi: str
    ministry_department: str
    purpose_en: str
    purpose_hi: str
    target_beneficiary_en: str
    target_beneficiary_hi: str
    eligibility_summary_en: str
    eligibility_summary_hi: str
    digitalization_relevance_en: str
    digitalization_relevance_hi: str
    what_digimitra_helps_with_en: str
    what_digimitra_helps_with_hi: str
    application_route_en: str
    application_route_hi: str
    official_source_url: str
    last_verified_date: str
    verification_status: str  # "VERIFIED_OFFICIAL", "REVIEW_PENDING"
    disclaimer: str = "Check official portal for complete and current eligibility criteria. DigiMitra does not guarantee scheme approval."


GOVERNMENT_INITIATIVES_CATALOG: List[GovernmentInitiative] = [
    # -------------------------------------------------------------------------
    # 1. UDYAM REGISTRATION
    # -------------------------------------------------------------------------
    GovernmentInitiative(
        initiative_code="GOV-UDYAM",
        name_en="Udyam Registration",
        name_hi="उद्यम पंजीकरण",
        ministry_department="Ministry of Micro, Small and Medium Enterprises (MoMSME), Government of India",
        purpose_en="Official permanent digital identity and registration for micro, small, and medium enterprises in India.",
        purpose_hi="भारत में सूक्ष्म, लघु और मध्यम उद्यमों के लिए आधिकारिक स्थायी डिजिटल पहचान और पंजीकरण।",
        target_beneficiary_en="All Micro, Small, and Medium Enterprises engaged in manufacturing or services.",
        target_beneficiary_hi="विनिर्माण या सेवा क्षेत्र में कार्यरत सभी सूक्ष्म, लघु और मध्यम उद्यम।",
        eligibility_summary_en="Based on Composite Criteria of Investment in Plant & Machinery and Annual Turnover (Self-declaration linked to Aadhaar & PAN).",
        eligibility_summary_hi="संयंत्र एवं मशीनरी में निवेश और वार्षिक टर्नओवर के संयुक्त मानदंड पर आधारित (आधार और पैन आधारित स्व-घोषणा)।",
        digitalization_relevance_en="Mandatory digital prerequisite for priority sector lending, government tender exemptions, and all MSME subsidies.",
        digitalization_relevance_hi="प्राथमिकता प्राप्त क्षेत्र ऋण, सरकारी निविदा छूट और सभी एमएसएमई योजनाओं के लिए अनिवार्य डिजिटल पहचान।",
        what_digimitra_helps_with_en="Guides enterprise through required documents and connects to the official paperless Udyam portal.",
        what_digimitra_helps_with_hi="आवश्यक दस्तावेजों की जानकारी देता है और आधिकारिक पेपरलेस उद्यम पोर्टल से जोड़ता है।",
        application_route_en="100% Free Online Portal: udyamregistration.gov.in (No fees or intermediaries required).",
        application_route_hi="100% निःशुल्क ऑनलाइन पोर्टल: udyamregistration.gov.in (कोई शुल्क या दलाल आवश्यक नहीं)।",
        official_source_url="https://udyamregistration.gov.in",
        last_verified_date="2026-09-01",
        verification_status="VERIFIED_OFFICIAL",
    ),

    # -------------------------------------------------------------------------
    # 2. MSME ZED (ZERO DEFECT ZERO EFFECT)
    # -------------------------------------------------------------------------
    GovernmentInitiative(
        initiative_code="GOV-ZED",
        name_en="MSME Sustainable (ZED) Certification Scheme",
        name_hi="एमएसएमई सतत (जेड/ZED) प्रमाणन योजना",
        ministry_department="Ministry of MSME, Government of India",
        purpose_en="Financial assistance and certification to adopt Zero Defect manufacturing processes with Zero environmental effect.",
        purpose_hi="शून्य दोष और शून्य पर्यावरणीय प्रभाव वाली विनिर्माण प्रक्रियाओं को अपनाने हेतु वित्तीय सहायता और प्रमाणन।",
        target_beneficiary_en="Manufacturing MSMEs with valid Udyam Registration.",
        target_beneficiary_hi="वैध उद्यम पंजीकरण वाली विनिर्माण इकाइयां।",
        eligibility_summary_en="Up to 80% subsidy on certification cost for Micro (60% Small, 50% Medium), plus special concessions for women/SC/ST entrepreneurs.",
        eligibility_summary_hi="सूक्ष्म उद्यमों के लिए प्रमाणन लागत पर 80% तक सब्सिडी (लघु के लिए 60%, मध्यम के लिए 50%)।",
        digitalization_relevance_en="Incentivizes digital quality control, calibration tracking, waste reduction, and ERP adoption.",
        digitalization_relevance_hi="डिजिटल गुणवत्ता नियंत्रण, अपशिष्ट न्यूनीकरण और ईआरपी अपनाने को प्रोत्साहित करता है।",
        what_digimitra_helps_with_en="Identifies operational gaps in manufacturing quality records and guides to Bronze/Silver/Gold assessment.",
        what_digimitra_helps_with_hi="विनिर्माण गुणवत्ता रिकॉर्ड में कमियों की पहचान करता है और कांस्य/रजत/स्वर्ण स्तर प्रमाणन की ओर मार्गदर्शन करता है।",
        application_route_en="Online registration and self-assessment via zed.msme.gov.in.",
        application_route_hi="zed.msme.gov.in के माध्यम से ऑनलाइन पंजीकरण और स्व-मूल्यांकन।",
        official_source_url="https://zed.msme.gov.in",
        last_verified_date="2026-09-01",
        verification_status="VERIFIED_OFFICIAL",
    ),

    # -------------------------------------------------------------------------
    # 3. TREDS (TRADE RECEIVABLES DISCOUNTING SYSTEM)
    # -------------------------------------------------------------------------
    GovernmentInitiative(
        initiative_code="GOV-TREDS",
        name_en="Trade Receivables Discounting System (TReDS)",
        name_hi="ट्रेड रिसीवेबल्स डिस्काउंटिंग सिस्टम (TReDS)",
        ministry_department="Reserve Bank of India (RBI) & Ministry of MSME",
        purpose_en="Electronic institutional platform facilitating discounting of trade receivables/invoices of MSMEs from corporate buyers and PSUs.",
        purpose_hi="कॉर्पोरेट खरीदारों और सरकारी उपक्रमों से एमएसएमई के लंबित इनवॉइस पर त्वरित बैंक भुगतान प्राप्त करने का डिजिटल मंच।",
        target_beneficiary_en="MSME suppliers supplying goods/services to large corporates, CPSEs, and government departments.",
        target_beneficiary_hi="बड़ी कंपनियों, सार्वजनिक उपक्रमों और सरकारी विभागों को सामान व सेवाएं आपूर्ति करने वाले एमएसएमई।",
        eligibility_summary_en="Valid Udyam Registration and accepted GST invoices uploaded on RBI-approved TReDS platforms (RxIL, M1xchange, Invoicemart).",
        eligibility_summary_hi="वैध उद्यम पंजीकरण और आरबीआई-अधिकृत मंचों (RxIL, M1xchange, Invoicemart) पर स्वीकृत जीएसटी इनवॉइस।",
        digitalization_relevance_en="Transforms delayed paper billing into immediate digital working capital without collateral.",
        digitalization_relevance_hi="लंबित कागजी बिलों को बिना किसी बंधक (कोलैटरल) के तुरंत डिजिटल कार्यशील पूंजी में बदलता है।",
        what_digimitra_helps_with_en="Helps MSMEs establish digital invoicing discipline (REC-REC-02) required to onboard onto TReDS.",
        what_digimitra_helps_with_hi="एमएसएमई को डिजिटल इनवॉइसिंग अनुशासन स्थापित करने में मदद करता है जो TReDS पर जाने के लिए अनिवार्य है।",
        application_route_en="Register on any RBI-approved TReDS exchange: rxil.in, m1xchange.com, or invoicemart.com.",
        application_route_hi="आरबीआई-स्वीकृत किसी भी मंच पर रजिस्टर करें: rxil.in, m1xchange.com या invoicemart.com।",
        official_source_url="https://www.rbi.org.in",
        last_verified_date="2026-09-01",
        verification_status="VERIFIED_OFFICIAL",
    ),

    # -------------------------------------------------------------------------
    # 4. GOVERNMENT E-MARKETPLACE (GEM)
    # -------------------------------------------------------------------------
    GovernmentInitiative(
        initiative_code="GOV-GEM",
        name_en="Government e-Marketplace (GeM)",
        name_hi="गवर्नमेंट ई-मार्केटप्लेस (GeM)",
        ministry_department="Department of Commerce, Ministry of Commerce and Industry",
        purpose_en="Dedicated end-to-end digital marketplace for procurement of common goods and services by government ministries, departments, and PSUs.",
        purpose_hi="सरकारी मंत्रालयों, विभागों और सार्वजनिक उपक्रमों द्वारा आवश्यक वस्तुओं और सेवाओं की खरीद का आधिकारिक डिजिटल पोर्टल।",
        target_beneficiary_en="All registered manufacturers, service providers, and traders holding Udyam Registration.",
        target_beneficiary_hi="उद्यम पंजीकरण धारक सभी पंजीकृत निर्माता, सेवा प्रदाता और व्यापारी।",
        eligibility_summary_en="Mandatory 25% annual procurement reservation from MSEs by Central Ministries and PSUs.",
        eligibility_summary_hi="केंद्रीय मंत्रालयों और सार्वजनिक उपक्रमों द्वारा वार्षिक खरीद का 25% अनिवार्य रूप से एमएसएमई से खरीदना।",
        digitalization_relevance_en="Opens massive direct B2G (Business-to-Government) sales channels without tender paperwork.",
        digitalization_relevance_hi="बिना कागजी निविदा प्रक्रिया के सीधे सरकारी विभागों को सामान बेचने का विशाल डिजिटल अवसर।",
        what_digimitra_helps_with_en="Assists in cataloguing products digitally and preparing digital compliance needed for GeM vendor registration.",
        what_digimitra_helps_with_hi="उत्पादों के डिजिटल कैटलॉग बनाने और GeM विक्रेता पंजीकरण के लिए आवश्यक तैयारी में सहायता।",
        application_route_en="Official Portal: gem.gov.in (Seller registration requires Aadhaar, PAN, GSTIN, Bank details).",
        application_route_hi="आधिकारिक पोर्टल: gem.gov.in (विक्रेता पंजीकरण के लिए आधार, पैन, जीएसटी और बैंक विवरण आवश्यक)।",
        official_source_url="https://gem.gov.in",
        last_verified_date="2026-09-01",
        verification_status="VERIFIED_OFFICIAL",
    ),

    # -------------------------------------------------------------------------
    # 5. ONDC (OPEN NETWORK FOR DIGITAL COMMERCE)
    # -------------------------------------------------------------------------
    GovernmentInitiative(
        initiative_code="GOV-ONDC",
        name_en="Open Network for Digital Commerce (ONDC)",
        name_hi="ओपन नेटवर्क फॉर डिजिटल कॉमर्स (ONDC)",
        ministry_department="Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce and Industry",
        purpose_en="Open protocol network enabling local sellers and retailers to be discoverable across all buyer apps without platform lock-in.",
        purpose_hi="खुला डिजिटल नेटवर्क जिसके जरिए स्थानीय दुकानदार किसी भी बायर ऐप पर पूरे शहर व देश के ग्राहकों को दिख सकते हैं।",
        target_beneficiary_en="Local kiranas, restaurants, garment shops, artisans, and manufacturers of all sizes.",
        target_beneficiary_hi="स्थानीय किराना, रेस्तरां, कपड़े की दुकानें, कारीगर और किसी भी आकार के निर्माता।",
        eligibility_summary_en="Open to any legal business with a digital catalog, banking details, and fulfillment capacity.",
        eligibility_summary_hi="डिजिटल कैटलॉग, बैंक विवरण और पार्सल भेजने की क्षमता वाले किसी भी कानूनी व्यवसाय के लिए खुला।",
        digitalization_relevance_en="Decouples delivery and buyer discovery, reducing marketplace commission fees from 25–35% to under 5–10%.",
        digitalization_relevance_hi="डिलीवरी और ग्राहक खोज को अलग करता है, जिससे कमीशन 25-35% से घटकर 5-10% से भी कम रह जाता है।",
        what_digimitra_helps_with_en="Directly guides Level 2 and Level 3 businesses to onboard via verified ONDC Seller Network Participants.",
        what_digimitra_helps_with_hi="स्तर 2 और स्तर 3 के व्यवसायों को सत्यापित ओएनडीसी सेलर ऐप्स के माध्यम से जुड़ने में मदद करता है।",
        application_route_en="Onboard via approved ONDC seller applications (Mystore, SellerApp, Magicpin, GrowthFalcons, etc.).",
        application_route_hi="स्वीकृत ओएनडीसी सेलर ऐप्स (जैसे Mystore, SellerApp, Magicpin) के माध्यम से जुड़ें।",
        official_source_url="https://ondc.org",
        last_verified_date="2026-09-01",
        verification_status="VERIFIED_OFFICIAL",
    ),

    # -------------------------------------------------------------------------
    # 6. CGTMSE (CREDIT GUARANTEE FUND TRUST)
    # -------------------------------------------------------------------------
    GovernmentInitiative(
        initiative_code="GOV-CGTMSE",
        name_en="Credit Guarantee Scheme for Micro & Small Enterprises (CGTMSE)",
        name_hi="सूक्ष्म एवं लघु उद्यमों के लिए क्रेडिट गारंटी योजना (CGTMSE)",
        ministry_department="Ministry of MSME & Small Industries Development Bank of India (SIDBI)",
        purpose_en="Collateral-free credit facility up to ₹5 Crore for new and existing Micro and Small Enterprises.",
        purpose_hi="नए और मौजूदा सूक्ष्म व लघु उद्यमों के लिए बिना किसी संपत्ति बंधक (कोलैटरल-फ्री) ₹5 करोड़ तक का बैंक ऋण।",
        target_beneficiary_en="New and existing Micro and Small Enterprises in manufacturing and service sectors.",
        target_beneficiary_hi="विनिर्माण और सेवा क्षेत्र के नए व मौजूदा सूक्ष्म एवं लघु उद्यम।",
        eligibility_summary_en="Credit guarantee coverage up to 85% for micro enterprises and women entrepreneurs; borrower needs viable business project.",
        eligibility_summary_hi="सूक्ष्म उद्यमों और महिला उद्यमियों के लिए 85% तक की बैंक गारंटी; व्यवहार्य व्यावसायिक योजना आवश्यक।",
        digitalization_relevance_en="Provides capital required for digital technology adoption, machinery upgrades, and computerization.",
        digitalization_relevance_hi="डिजिटल तकनीक अपनाने, मशीनरी अपग्रेड और कंप्यूटरीकरण के लिए आवश्यक पूंजी उपलब्ध कराता है।",
        what_digimitra_helps_with_en="Produces structured digital capability and gap reports helpful for demonstrating business viability to lending banks.",
        what_digimitra_helps_with_hi="व्यवसाय की क्षमता और योजनाओं की संरचित रिपोर्ट तैयार करता है जो बैंक को प्रस्तुत करने में उपयोगी हो सकती है।",
        application_route_en="Apply through any scheduled commercial bank or financial institution participating in CGTMSE.",
        application_route_hi="योजना में शामिल किसी भी सरकारी या निजी वाणिज्यिक बैंक के माध्यम से आवेदन करें।",
        official_source_url="https://www.cgtmse.in",
        last_verified_date="2026-09-01",
        verification_status="VERIFIED_OFFICIAL",
    ),

    # -------------------------------------------------------------------------
    # 7. PM VISHWAKARMA SCHEME
    # -------------------------------------------------------------------------
    GovernmentInitiative(
        initiative_code="GOV-VISHWAKARMA",
        name_en="PM Vishwakarma Scheme",
        name_hi="पीएम विश्वकर्मा योजना",
        ministry_department="Ministry of MSME, Ministry of Skill Development, and Ministry of Finance",
        purpose_en="Holistic end-to-end support for traditional artisans and craftspeople working with their hands and tools.",
        purpose_hi="पारंपरिक औजारों और हाथों से काम करने वाले कारीगरों और शिल्पकारों के समग्र उत्थान हेतु विशेष योजना।",
        target_beneficiary_en="18 traditional trades including carpenters, blacksmiths, potters, sculptors, cobblers, tailors, and weavers.",
        target_beneficiary_hi="बढ़ई, लोहार, कुम्हार, मूर्तिकार, मोची, दर्जी, बुनकर सहित 18 पारंपरिक क्षेत्रों के शिल्पकार।",
        eligibility_summary_en="Self-employed traditional artisan family; provides skill training with stipend, ₹15,000 tool incentive, and collateral-free loan at 5%.",
        eligibility_summary_hi="पारंपरिक व्यापार में कार्यरत परिवार; प्रशिक्षण भत्ता, ₹15,000 टूलकिट सहायता और 5% रियायती ब्याज पर ऋण।",
        digitalization_relevance_en="Provides digital transaction incentives (₹1 per transaction up to 100 transactions/month) and digital marketing support.",
        digitalization_relevance_hi="डिजिटल लेनदेन प्रोत्साहन (प्रति लेनदेन ₹1, मासिक अधिकतम 100) और उत्पादों की डिजिटल मार्केटिंग सहायता।",
        what_digimitra_helps_with_en="Identifies craft artisans (CREATIVE_ARTISAN) and assists with digital QR payment setup.",
        what_digimitra_helps_with_hi="हस्तशिल्प और कारीगरों की पहचान कर उन्हें डिजिटल भुगतान और कैटलॉगिंग में मदद करता है।",
        application_route_en="Apply at nearest Common Service Centre (CSC) or online at pmvishwakarma.gov.in.",
        application_route_hi="निकटतम सीएससी (CSC) केंद्र या pmvishwakarma.gov.in पर ऑनलाइन आवेदन करें।",
        official_source_url="https://pmvishwakarma.gov.in",
        last_verified_date="2026-09-01",
        verification_status="VERIFIED_OFFICIAL",
    ),

    # -------------------------------------------------------------------------
    # 8. RAJASTHAN STATE MLUPY (MUKHYAMANTRI LAGHU UDYOG PROTSAHAN YOJANA)
    # -------------------------------------------------------------------------
    GovernmentInitiative(
        initiative_code="GOV-RAJ-MLUPY",
        name_en="Mukhyamantri Laghu Udyog Protsahan Yojana (MLUPY) - Rajasthan",
        name_hi="मुख्यमंत्री लघु उद्योग प्रोत्साहन योजना (MLUPY) - राजस्थान",
        ministry_department="Department of Industries and Commerce, Government of Rajasthan",
        purpose_en="Interest subsidy on loans up to ₹10 Crore to encourage self-employment and establish new MSME enterprises in Rajasthan.",
        purpose_hi="राजस्थान में स्वरोजगार और नए एमएसएमई उद्योग स्थापित करने हेतु ₹10 करोड़ तक के ऋण पर ब्याज अनुदान।",
        target_beneficiary_en="Individuals, proprietary firms, and MSMEs located in the State of Rajasthan.",
        target_beneficiary_hi="राजस्थान राज्य में स्थित नए व मौजूदा सूक्ष्म, लघु और मध्यम उद्यम।",
        eligibility_summary_en="Interest subsidy: 8% on loans up to ₹25 Lakhs, 6% on loans up to ₹5 Crore, 5% on loans up to ₹10 Crore.",
        eligibility_summary_hi="ब्याज अनुदान: ₹25 लाख तक के ऋण पर 8%, ₹5 करोड़ तक पर 6%, और ₹10 करोड़ तक पर 5%।",
        digitalization_relevance_en="Lowers capital cost for purchasing digital computerized equipment, POS hardware, and automated machinery.",
        digitalization_relevance_hi="कंप्यूटरीकृत उपकरण, पीओएस मशीन और स्वचालित प्लांट खरीदने के लिए वित्तीय लागत कम करता है।",
        what_digimitra_helps_with_en="Identifies Rajasthan-based enterprises and matches them with digital investment roadmap recommendations.",
        what_digimitra_helps_with_hi="राजस्थान के व्यवसायों की पहचान कर उन्हें उपयुक्त डिजिटल रोडमैप और योजना से जोड़ता है।",
        application_route_en="Apply online via Rajasthan Single Sign-On (SSO): sso.rajasthan.gov.in.",
        application_route_hi="राजस्थान सिंगल साइन-ऑन (SSO) sso.rajasthan.gov.in के माध्यम से ऑनलाइन आवेदन करें।",
        official_source_url="https://industries.rajasthan.gov.in",
        last_verified_date="2026-09-01",
        verification_status="VERIFIED_OFFICIAL",
    ),
]


def get_all_initiatives() -> List[GovernmentInitiative]:
    """Return all verified government initiatives."""
    return GOVERNMENT_INITIATIVES_CATALOG


def get_initiative_by_code(code: str) -> Optional[GovernmentInitiative]:
    """Retrieve government initiative by its code."""
    for init in GOVERNMENT_INITIATIVES_CATALOG:
        if init.initiative_code == code:
            return init
    return None


def get_initiatives_for_business(state: str, sector: str, current_level: int) -> List[GovernmentInitiative]:
    """Filter relevant initiatives based on business jurisdiction and capability."""
    results: List[GovernmentInitiative] = []
    is_rajasthan = state.lower() == "rajasthan"

    for init in GOVERNMENT_INITIATIVES_CATALOG:
        # State-specific filtering
        if "RAJ" in init.initiative_code and not is_rajasthan:
            continue
        # Sector-specific filtering
        if init.initiative_code == "GOV-VISHWAKARMA" and sector not in ["CREATIVE_ARTISAN", "MANUFACTURING", "SERVICES"]:
            continue
        if init.initiative_code == "GOV-ZED" and sector not in ["MANUFACTURING", "FOOD_HOSPITALITY"]:
            continue
        results.append(init)

    return results
