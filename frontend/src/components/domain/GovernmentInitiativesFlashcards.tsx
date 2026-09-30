import React, { useState } from "react";
import {
  ExternalLink,
  ShieldCheck,
  RotateCw,
  Clock,
  FileText,
  Check,
  Award,
} from "lucide-react";

export interface GovernmentInitiativeItem {
  initiative_code: string;
  name_en: string;
  name_hi: string;
  ministry_department: string;
  category: "legal_subsidy" | "credit_finance" | "ecommerce_market" | "artisans_trades";
  category_label_en: string;
  category_label_hi: string;
  purpose_en: string;
  purpose_hi: string;
  target_beneficiary_en: string;
  target_beneficiary_hi: string;
  official_source_url: string;
  last_verified_date: string;
  verification_status: string;
  // Deep-dive flashcard back content
  benefits_en: string[];
  benefits_hi: string[];
  when_to_connect_en: string;
  when_to_connect_hi: string;
  how_to_connect_en: string[];
  how_to_connect_hi: string[];
  required_docs_en: string[];
  required_docs_hi: string[];
}

export const VERIFIED_GOVERNMENT_INITIATIVES: GovernmentInitiativeItem[] = [
  {
    initiative_code: "GOV-UDYAM",
    name_en: "Udyam Registration",
    name_hi: "उद्यम पंजीकरण",
    ministry_department: "Ministry of Micro, Small and Medium Enterprises (MoMSME), Govt. of India",
    category: "legal_subsidy",
    category_label_en: "Legal Identity & Priority Lending",
    category_label_hi: "कानूनी पहचान और प्राथमिकता ऋण",
    purpose_en: "Permanent digital identity and official registration for micro, small, and medium enterprises in India.",
    purpose_hi: "भारत में सूक्ष्म, लघु और मध्यम उद्यमों के लिए आधिकारिक स्थायी डिजिटल पहचान और पंजीकरण।",
    target_beneficiary_en: "All manufacturing and service MSMEs (Zero registration fee).",
    target_beneficiary_hi: "सभी विनिर्माण और सेवा एमएसएमई (शून्य पंजीकरण शुल्क)।",
    official_source_url: "https://udyamregistration.gov.in",
    last_verified_date: "2026-09-01",
    verification_status: "VERIFIED_OFFICIAL",
    benefits_en: [
      "Collateral-free loans under RBI Priority Sector Lending (PSL) norms.",
      "1% interest rate subvention on bank overdrafts and working capital.",
      "100% exemption on Earnest Money Deposit (EMD) in Central Government tenders.",
      "50% subsidy on patent and trademark registrations.",
      "Mandatory prerequisite for all other Central & State government subsidies."
    ],
    benefits_hi: [
      "आरबीआई प्राथमिकता क्षेत्र ऋण (PSL) के तहत बिना बंधक (कोलैटरल-फ्री) ऋण।",
      "बैंक ओवरड्राफ्ट और कार्यशील पूंजी पर 1% ब्याज दर में छूट।",
      "केंद्रीय सरकारी निविदाओं में बयाना राशि (EMD) से 100% छूट।",
      "पेटेंट और ट्रेडमार्क पंजीकरण पर 50% सरकारी सब्सिडी।",
      "अन्य सभी केंद्रीय और राज्य सरकारी योजनाओं के लिए अनिवार्य आधार।"
    ],
    when_to_connect_en: "Day 1 (Maturity Level 0). Every enterprise must register immediately upon starting operations before applying for business bank accounts, GST, or government schemes.",
    when_to_connect_hi: "पहले दिन से (स्तर 0)। हर उद्यम को चालू होते ही बैंक खाता, जीएसटी या सरकारी योजनाओं के लिए आवेदन करने से पहले पंजीकृत होना चाहिए।",
    how_to_connect_en: [
      "Visit the 100% free official portal: udyamregistration.gov.in (no middlemen).",
      "Enter Aadhaar Number of proprietor / director and verify with OTP.",
      "PAN details are automatically fetched from CBDT database.",
      "Instant paperless generation of QR-coded Udyam Registration Certificate."
    ],
    how_to_connect_hi: [
      "100% निःशुल्क आधिकारिक पोर्टल udyamregistration.gov.in पर जाएं।",
      "मालिक/निदेशक का आधार नंबर दर्ज करें और ओटीपी से सत्यापित करें।",
      "पैन और आयकर विवरण आयकर विभाग से स्वतः सत्यापित होते हैं।",
      "क्यूआर कोड युक्त उद्यम प्रमाणपत्र तुरंत ऑनलाइन प्राप्त करें।"
    ],
    required_docs_en: ["Aadhaar Card", "PAN Card", "Bank Account Details", "Basic Business Address"],
    required_docs_hi: ["आधार कार्ड", "पैन कार्ड", "बैंक खाता विवरण", "व्यावसायिक पता"]
  },
  {
    initiative_code: "GOV-ZED",
    name_en: "MSME Sustainable (ZED) Certification",
    name_hi: "एमएसएमई सतत (जेड/ZED) प्रमाणन",
    ministry_department: "Ministry of MSME, Government of India",
    category: "legal_subsidy",
    category_label_en: "Quality & Process Certification",
    category_label_hi: "गुणवत्ता एवं प्रक्रिया प्रमाणन",
    purpose_en: "Financial assistance and certification for Zero Defect manufacturing processes with Zero environmental impact.",
    purpose_hi: "शून्य दोष विनिर्माण और पर्यावरण अनुकूल प्रक्रियाओं को अपनाने हेतु सरकारी अनुदान एवं प्रमाणन।",
    target_beneficiary_en: "Manufacturing MSMEs with valid Udyam Registration.",
    target_beneficiary_hi: "वैध उद्यम पंजीकरण वाली विनिर्माण इकाइयां।",
    official_source_url: "https://zed.msme.gov.in",
    last_verified_date: "2026-09-01",
    verification_status: "VERIFIED_OFFICIAL",
    benefits_en: [
      "Up to 80% subsidy on certification cost for Micro (60% Small, 50% Medium).",
      "Up to ₹5 Lakhs financial handholding support for technical consultancy.",
      "Additional 10% subsidy for women-owned and SC/ST enterprises.",
      "0.5% concession on bank interest rates and 50% waiver in bank loan processing fees.",
      "Global credibility and priority buyer acceptance in corporate supply chains."
    ],
    benefits_hi: [
      "प्रमाणन लागत पर सूक्ष्म उद्यमों के लिए 80% तक सब्सिडी (लघु 60%, मध्यम 50%)।",
      "तकनीकी परामर्श और प्रक्रिया सुधार हेतु ₹5 लाख तक का सरकारी सहयोग।",
      "महिला और अनुसूचित जाति/जनजाति उद्यमियों के लिए 10% अतिरिक्त छूट।",
      "बैंक ऋण ब्याज दरों में 0.5% छूट और प्रोसेसिंग फीस में 50% की छूट।",
      "बड़ी कंपनियों की आपूर्ति श्रृंखला में प्राथमिकता और वैश्विक साख।"
    ],
    when_to_connect_en: "Maturity Level 1 to 2. Apply once your manufacturing or workshop has baseline machinery and you seek export or corporate OEM orders.",
    when_to_connect_hi: "स्तर 1 से 2 के दौरान। जब आपकी कार्यशाला या कारखाने में मशीनरी चालू हो और आप कॉर्पोरेट या निर्यात ऑर्डर पाना चाहते हों।",
    how_to_connect_en: [
      "Register at zed.msme.gov.in using your Udyam Registration Number.",
      "Take the free digital 'ZED Pledge' online.",
      "Complete the self-assessment desktop questionnaire for Bronze certification.",
      "For Silver / Gold levels, schedule a subsidized third-party assessor audit."
    ],
    how_to_connect_hi: [
      "अपने उद्यम नंबर के जरिए zed.msme.gov.in पर लॉगिन करें।",
      "निःशुल्क डिजिटल 'ZED Pledge' (प्रतिज्ञा) लें।",
      "कांस्य (Bronze) प्रमाणन के लिए ऑनलाइन स्व-मूल्यांकन पूरा करें।",
      "रजत या स्वर्ण स्तर के लिए रियायती दर पर अधिकृत ऑडिटर निरीक्षण बुक करें।"
    ],
    required_docs_en: ["Udyam Number", "Factory Electricity Bill", "Equipment List", "Basic Quality Records"],
    required_docs_hi: ["उद्यम पंजीकरण", "कारखाना बिजली बिल", "उपकरण सूची", "गुणवत्ता रिकॉर्ड"]
  },
  {
    initiative_code: "GOV-TREDS",
    name_en: "Trade Receivables Discounting System (TReDS)",
    name_hi: "ट्रेड रिसीवेबल्स डिस्काउंटिंग सिस्टम (TReDS)",
    ministry_department: "Reserve Bank of India (RBI) & Ministry of MSME",
    category: "credit_finance",
    category_label_en: "Instant Invoicing Cashflow",
    category_label_hi: "त्वरित इनवॉइस डिस्काउंटिंग",
    purpose_en: "Electronic institutional exchange facilitating competitive discounting of MSME trade receivables from corporate & PSU buyers.",
    purpose_hi: "बड़ी कंपनियों और सरकारी उपक्रमों से लंबित इनवॉइस पर प्रतिस्पर्धी बैंक दरों पर त्वरित भुगतान प्राप्त करने का मंच।",
    target_beneficiary_en: "MSME suppliers supplying goods/services on credit to large corporates and PSUs.",
    target_beneficiary_hi: "बड़ी कंपनियों और पीएसयू को माल और सेवाएं आपूर्ति करने वाले एमएसएमई।",
    official_source_url: "https://www.rbi.org.in",
    last_verified_date: "2026-09-01",
    verification_status: "VERIFIED_OFFICIAL",
    benefits_en: [
      "Instant working capital within 48 to 72 hours of invoice acceptance.",
      "Zero collateral or mortgage required; financing is based on buyer's creditworthiness.",
      "Non-recourse factoring: if the buyer delays payment, the MSME has no debt liability.",
      "Competitive multi-bank bidding ensures the lowest market discounting rates (6% to 9%).",
      "Eliminates the traditional 90–120 day cash-crunch cycle."
    ],
    benefits_hi: [
      "खरीदार द्वारा बिल स्वीकार होते ही 48 से 72 घंटे में नकद भुगतान।",
      "बिना किसी बंधक या संपत्ति गारंटी के पूंजी; ब्याज खरीदार की साख पर निर्भर।",
      "नॉन-रिकोर्स व्यवस्था: खरीदार की देरी पर एमएसएमई पर कोई देनदारी नहीं।",
      "कई बैंकों की प्रतिस्पर्धी बोली के कारण सबसे कम ब्याज दर (6% से 9%)।",
      "90 से 120 दिनों तक नकदी फंसे रहने की समस्या का स्थायी समाधान।"
    ],
    when_to_connect_en: "Maturity Level 1+. Connect as soon as your enterprise begins supplying B2B invoices exceeding ₹50,000 to corporate buyers or PSUs.",
    when_to_connect_hi: "स्तर 1+ पर। जैसे ही आपका उद्यम कॉर्पोरेट खरीदारों या सरकारी विभागों को ₹50,000 से अधिक के बी2बी इनवॉइस देना शुरू करे।",
    how_to_connect_en: [
      "Choose any RBI-approved TReDS platform: RXIL (rxil.in), M1xchange (m1xchange.com), or Invoicemart (invoicemart.com).",
      "Onboard as a Seller with Udyam Certificate, GSTIN, and Bank Mandate.",
      "Upload approved GST invoices onto the platform.",
      "Accept the best bank bid to receive instant direct credit into your account."
    ],
    how_to_connect_hi: [
      "आरबीआई-स्वीकृत मंच चुनें: rxil.in, m1xchange.com या invoicemart.com।",
      "उद्यम प्रमाणपत्र, जीएसटी और बैंक मैंडेट के साथ सेलर के रूप में रजिस्टर करें।",
      "पोर्टल पर स्वीकृत जीएसटी इनवॉइस अपलोड करें।",
      "सर्वोत्तम बैंक बोली स्वीकार करें और तुरंत खाते में राशि प्राप्त करें।"
    ],
    required_docs_en: ["Udyam Registration", "GSTIN & Filed Invoices", "Cancelled Cheque", "Buyer Purchase Order"],
    required_docs_hi: ["उद्यम प्रमाणपत्र", "जीएसटी बिल", "कैंसिल्ड चेक", "खरीदार का खरीद आदेश (PO)"]
  },
  {
    initiative_code: "GOV-GEM",
    name_en: "Government e-Marketplace (GeM)",
    name_hi: "गवर्नमेंट ई-मार्केटप्लेस (GeM)",
    ministry_department: "Department of Commerce, Ministry of Commerce and Industry",
    category: "ecommerce_market",
    category_label_en: "Direct Public Procurement (B2G)",
    category_label_hi: "सरकारी खरीद पोर्टल (B2G)",
    purpose_en: "End-to-end digital marketplace for procurement of goods and services by all government ministries, departments, and PSUs.",
    purpose_hi: "सरकारी मंत्रालयों, विभागों और सार्वजनिक उपक्रमों द्वारा सामान और सेवाओं की सीधी खरीद का आधिकारिक डिजिटल बाजार।",
    target_beneficiary_en: "Manufacturers, authorized resellers, and service providers holding Udyam.",
    target_beneficiary_hi: "उद्यम पंजीकरण धारक सभी निर्माता, अधिकृत विक्रेता और सेवा प्रदाता।",
    official_source_url: "https://gem.gov.in",
    last_verified_date: "2026-09-01",
    verification_status: "VERIFIED_OFFICIAL",
    benefits_en: [
      "Mandatory 25% annual government procurement quota reserved for MSMEs.",
      "Direct access to ₹2+ Lakh Crore annual public procurement expenditure.",
      "Exemption from prior turnover and experience criteria for micro/small enterprises in many bids.",
      "Direct purchase orders up to ₹25,000 without bidding; L1 price bidding for larger orders.",
      "Automated online payment disbursement tracked transparently by Ministry of Finance."
    ],
    benefits_hi: [
      "सभी सरकारी खरीद में 25% अनिवार्य कोटा केवल एमएसएमई के लिए आरक्षित।",
      "प्रतिवर्ष ₹2 लाख करोड़ से अधिक की सरकारी खरीद तक सीधी पहुंच।",
      "कई बोलियों में नए उद्यमों के लिए पूर्व अनुभव और टर्नओवर की शर्त से छूट।",
      "बिना निविदा के ₹25,000 तक का सीधा ऑर्डर; बड़े ऑर्डर पर पारदर्शी ऑनलाइन बोली।",
      "वित्त मंत्रालय के नियमों के तहत समयबद्ध डिजिटल भुगतान।"
    ],
    when_to_connect_en: "Maturity Level 1 to 2. Connect when your products or services have standardized pricing, GST compliance, and dispatch capability.",
    when_to_connect_hi: "स्तर 1 से 2। जब आपके उत्पादों के मानक मूल्य तय हों, जीएसटी बिलिंग सक्रिय हो और पार्सल भेजने की व्यवस्था हो।",
    how_to_connect_en: [
      "Visit gem.gov.in and click 'Sign Up' > 'Seller'.",
      "Authenticate using Aadhaar and PAN of authorized signatory.",
      "Input Udyam Registration Number to verify MSME status automatically.",
      "Upload digital product catalog with photos, technical specs, and prices."
    ],
    how_to_connect_hi: [
      "gem.gov.in पर जाकर 'Sign Up' > 'Seller' चुनें।",
      "हस्ताक्षरकर्ता के आधार और पैन से प्रमाणीकरण करें।",
      "एमएसएमई स्थिति प्रमाणित करने हेतु उद्यम नंबर दर्ज करें।",
      "उत्पादों के फोटो, तकनीकी विवरण और दरों के साथ डिजिटल कैटलॉग बनाएं।"
    ],
    required_docs_en: ["Aadhaar & PAN", "Udyam Certificate", "GSTIN", "Bank Account Details", "Product Spec Sheets"],
    required_docs_hi: ["आधार एवं पैन", "उद्यम प्रमाणपत्र", "जीएसटी नंबर", "बैंक खाता विवरण", "उत्पाद विवरण"]
  },
  {
    initiative_code: "GOV-ONDC",
    name_en: "Open Network for Digital Commerce (ONDC)",
    name_hi: "ओपन नेटवर्क फॉर डिजिटल कॉमर्स (ONDC)",
    ministry_department: "DPIIT, Ministry of Commerce and Industry",
    category: "ecommerce_market",
    category_label_en: "Open E-Commerce & Retail Access",
    category_label_hi: "खुला ई-कॉमर्स व खुदरा बाजार",
    purpose_en: "Open protocol e-commerce network allowing local retail sellers to be discoverable across all buyer apps without platform lock-in.",
    purpose_hi: "खुला डिजिटल नेटवर्क जो स्थानीय दुकानदारों को बिना किसी प्लेटफॉर्म एकाधिकार के देश भर के ग्राहकों से जोड़ता है।",
    target_beneficiary_en: "Local kiranas, restaurants, garment retailers, and craft producers.",
    target_beneficiary_hi: "स्थानीय किराना स्टोर, रेस्तरां, कपड़े के व्यापारी और हस्तशिल्पी।",
    official_source_url: "https://ondc.org",
    last_verified_date: "2026-09-01",
    verification_status: "VERIFIED_OFFICIAL",
    benefits_en: [
      "Single registration makes your inventory visible on Paytm, Magicpin, PhonePe Pincode, and Ola.",
      "Commission fees slashed from traditional 25–35% (aggregators) to under 5–10%.",
      "You own your customer data and relationship; no risk of platform delisting.",
      "Integrated on-demand delivery logistics (Dunzo, Shadowfax, Delhivery) booked automatically.",
      "Equal digital visibility for neighborhood stores competing against big tech marketplaces."
    ],
    benefits_hi: [
      "एक बार जुड़ने पर आपकी दुकान Paytm, Magicpin, PhonePe Pincode पर दिखने लगती है।",
      "अन्य ई-कॉमर्स कंपनियों का 25-35% कमीशन घटकर 5-10% से भी कम हो जाता है।",
      "ग्राहकों का डेटा और संपर्क सीधे आपके पास रहता है; कोई मनमाना ब्लॉक नहीं।",
      "ऑर्डर आते ही डिलीवरी पार्टनर (Dunzo, Shadowfax आदि) स्वतः असाइन होते हैं।",
      "स्थानीय दुकानों को बड़ी ऑनलाइन कंपनियों के बराबर दृश्यता और अवसर।"
    ],
    when_to_connect_en: "Maturity Level 2+. Connect once your store maintains a digital inventory or price sheet (via Vyapar/Khatabook) and has staff to pack orders.",
    when_to_connect_hi: "स्तर 2+। जब आपकी दुकान पर डिजिटल स्टॉक या मूल्य सूची उपलब्ध हो और ऑर्डर पैक करने वाला स्टाफ हो।",
    how_to_connect_en: [
      "Choose an approved ONDC Seller Application (e.g. Mystore, SellerApp, Magicpin, GrowthFalcons).",
      "Create your seller account using PAN, GSTIN, and Bank Details.",
      "Upload your product catalog, prices, and store working hours.",
      "Start receiving orders from buyers using any ONDC-enabled customer app."
    ],
    how_to_connect_hi: [
      "स्वीकृत ओएनडीसी सेलर ऐप चुनें (जैसे Mystore, SellerApp, Magicpin)।",
      "पैन, जीएसटी और बैंक विवरण के साथ विक्रेता खाता बनाएं।",
      "उत्पादों की सूची, दरें और दुकान का समय दर्ज करें।",
      "विभिन्न ग्राहक ऐप्स से सीधे ऑर्डर प्राप्त करना शुरू करें।"
    ],
    required_docs_en: ["GSTIN (or Composite GST)", "PAN & Bank Account", "Product Pricing List", "Store Address Proof"],
    required_docs_hi: ["जीएसटी नंबर", "पैन और बैंक खाता", "उत्पाद दर सूची", "दुकान का पता"]
  },
  {
    initiative_code: "GOV-CGTMSE",
    name_en: "Credit Guarantee Fund Trust for MSEs (CGTMSE)",
    name_hi: "क्रेडिट गारंटी फंड ट्रस्ट (CGTMSE)",
    ministry_department: "Ministry of MSME & Small Industries Development Bank of India (SIDBI)",
    category: "credit_finance",
    category_label_en: "Collateral-Free Credit up to ₹5 Crore",
    category_label_hi: "बिना बंधक ₹5 करोड़ तक बैंक ऋण",
    purpose_en: "Collateral-free credit facility up to ₹5 Crore for new and existing Micro and Small Enterprises.",
    purpose_hi: "नए और मौजूदा सूक्ष्म व लघु उद्यमों के लिए बिना किसी संपत्ति बंधक (कोलैटरल-फ्री) ₹5 करोड़ तक का बैंक ऋण।",
    target_beneficiary_en: "New and existing Micro and Small Enterprises in manufacturing and service sectors.",
    target_beneficiary_hi: "विनिर्माण और सेवा क्षेत्र के नए व मौजूदा सूक्ष्म एवं लघु उद्यम।",
    official_source_url: "https://www.cgtmse.in",
    last_verified_date: "2026-09-01",
    verification_status: "VERIFIED_OFFICIAL",
    benefits_en: [
      "Zero requirement to mortgage land, home, or commercial real estate to secure bank loans.",
      "Government trust guarantees up to 85% of loan repayment risk to lending banks.",
      "Available for both Term Loans (for machinery/computers) and Working Capital Cash Credit.",
      "Special 85% guarantee coverage and lower annual guarantee fees for women entrepreneurs and North-East/hill states.",
      "Covers loans from ₹5 Lakhs up to ₹5 Crores across all scheduled commercial banks."
    ],
    benefits_hi: [
      "बैंक लोन के लिए घर, दुकान या जमीन गिरवी रखने की कोई आवश्यकता नहीं।",
      "बैंक के ऋण जोखिम की 85% तक गारंटी भारत सरकार का ट्रस्ट लेता है।",
      "मशीनरी/कंप्यूटर के टर्म लोन और रोजमर्रा के खर्च के कैश क्रेडिट दोनों पर लागू।",
      "महिला उद्यमियों और विशेष क्षेत्रों के लिए 85% गारंटी और कम वार्षिक शुल्क।",
      "सभी राष्ट्रीयकृत और वाणिज्यिक बैंकों से ₹5 लाख से ₹5 करोड़ तक उपलब्ध।"
    ],
    when_to_connect_en: "Maturity Level 1 to 3. Connect when preparing to expand operations, buy digital POS/billing machines, or scale working capital.",
    when_to_connect_hi: "स्तर 1 से 3। जब आप व्यापार बढ़ाना चाहते हों, आधुनिक बिलिंग या डिजिटल उपकरण खरीदना चाहते हों।",
    how_to_connect_en: [
      "Prepare a Project Report / Business Profile outlining cash flows and funding needs.",
      "Approach any public sector bank, private commercial bank, or SIDBI branch.",
      "Request loan sanction specifically under the 'CGTMSE Credit Guarantee Scheme'.",
      "Bank evaluates business viability and applies directly to CGTMSE portal for guarantee cover."
    ],
    how_to_connect_hi: [
      "अपने व्यवसाय और अनुमानित मुनाफे की एक सरल प्रोजेक्ट रिपोर्ट तैयार करें।",
      "किसी भी सरकारी बैंक, निजी बैंक या सिडबी (SIDBI) शाखा से संपर्क करें।",
      "ऋण आवेदन के साथ 'CGTMSE योजना' के तहत ऋण देने का अनुरोध करें।",
      "बैंक आपके प्रोजेक्ट का आकलन कर सीधे सीजीटीएमएसई गारंटी प्राप्त करता है।"
    ],
    required_docs_en: ["Udyam Registration", "PAN & KYC", "Last 1-2 Years ITR / Bank Statements", "Project Expansion Cost Estimate"],
    required_docs_hi: ["उद्यम प्रमाणपत्र", "पैन व केवाईसी", "पिछले 1-2 वर्षों की आईटीआर / बैंक स्टेटमेंट", "प्रोजेक्ट लागत विवरण"]
  },
  {
    initiative_code: "GOV-VISHWAKARMA",
    name_en: "PM Vishwakarma Scheme",
    name_hi: "पीएम विश्वकर्मा योजना",
    ministry_department: "Ministry of MSME, Skill Development & Finance",
    category: "artisans_trades",
    category_label_en: "Artisan Grant & Subsidized Credit",
    category_label_hi: "कारीगर अनुदान व रियायती ऋण",
    purpose_en: "End-to-end holistic support for traditional craftspeople and artisans working with their hands and tools.",
    purpose_hi: "पारंपरिक औजारों और हाथों से काम करने वाले 18 क्षेत्रों के शिल्पकारों और कारीगरों के लिए व्यापक सहयोग।",
    target_beneficiary_en: "18 traditional trades: carpenters, blacksmiths, potters, cobblers, tailors, sculptors, weavers, etc.",
    target_beneficiary_hi: "18 पारंपरिक शिल्प: बढ़ई, लोहार, कुम्हार, मोची, दर्जी, मूर्तिकार, सुनार, बुनकर आदि।",
    official_source_url: "https://pmvishwakarma.gov.in",
    last_verified_date: "2026-09-01",
    verification_status: "VERIFIED_OFFICIAL",
    benefits_en: [
      "Official PM Vishwakarma Certificate and digital Artisan ID card.",
      "5–7 days basic skill training with ₹500/day daily stipend.",
      "₹15,000 digital e-voucher grant for modern toolkits and equipment.",
      "Collateral-free enterprise credit at an ultra-low 5% interest rate (Tranche 1: ₹1 Lakh, Tranche 2: ₹2 Lakhs).",
      "Digital transaction incentive: ₹1 credited per digital UPI transaction (up to ₹100 monthly)."
    ],
    benefits_hi: [
      "आधिकारिक पीएम विश्वकर्मा प्रमाणपत्र और डिजिटल कारीगर पहचान पत्र।",
      "5-7 दिनों का बुनियादी कौशल प्रशिक्षण और ₹500 प्रतिदिन का प्रशिक्षण भत्ता।",
      "आधुनिक टूलकिट खरीदने हेतु ₹15,000 का निःशुल्क ई-वाउचर अनुदान।",
      "मात्र 5% रियायती ब्याज दर पर बिना बंधक ऋण (पहला चरण ₹1 लाख, दूसरा चरण ₹2 लाख)।",
      "डिजिटल लेनदेन पर प्रोत्साहन: प्रति यूपीआई लेनदेन ₹1 का सीधा बैंक क्रेडिट (मासिक ₹100 तक)।"
    ],
    when_to_connect_en: "Maturity Level 0 to 1. Applicable immediately for self-employed traditional artisans and manual trade workers.",
    when_to_connect_hi: "स्तर 0 से 1। पारंपरिक कारीगरी और हस्तकला से जुड़े सभी कारीगरों के लिए तुरंत लागू।",
    how_to_connect_en: [
      "Visit your local Common Service Centre (CSC) or apply at pmvishwakarma.gov.in.",
      "Authenticate with Aadhaar and enter trade details.",
      "Gram Panchayat / Urban Local Body conducts three-tier field verification.",
      "Receive digital ID, attend training, and receive toolkit funds directly in bank account."
    ],
    how_to_connect_hi: [
      "निकटतम कॉमन सर्विस सेंटर (CSC) जाएं या pmvishwakarma.gov.in पर लॉगिन करें।",
      "आधार और बैंक पासबुक के साथ अपने पारंपरिक व्यवसाय का चयन करें।",
      "ग्राम पंचायत या नगर पालिका द्वारा तीन-स्तरीय सत्यापन किया जाता है।",
      "डिजिटल कार्ड प्राप्त करें, प्रशिक्षण लें और ₹15,000 का टूलकिट अनुदान पाएं।"
    ],
    required_docs_en: ["Aadhaar Card", "Bank Account Passbook", "Active Mobile Number", "Self-declaration of Trade"],
    required_docs_hi: ["आधार कार्ड", "बैंक पासबुक", "सक्रिय मोबाइल नंबर", "पारंपरिक कार्य का स्व-घोषणा पत्र"]
  },
  {
    initiative_code: "GOV-RAJ-MLUPY",
    name_en: "Mukhyamantri Laghu Udyog Protsahan Yojana (MLUPY)",
    name_hi: "मुख्यमंत्री लघु उद्योग प्रोत्साहन योजना (MLUPY)",
    ministry_department: "Department of Industries and Commerce, Government of Rajasthan",
    category: "credit_finance",
    category_label_en: "State Interest Subsidy up to 8%",
    category_label_hi: "राजस्थान राज्य ब्याज अनुदान 8%",
    purpose_en: "Interest subsidy on business loans up to ₹10 Crore to establish and scale MSME enterprises in Rajasthan.",
    purpose_hi: "राजस्थान में नए व मौजूदा उद्योगों को स्थापित करने व बढ़ाने हेतु ₹10 करोड़ तक के ऋण पर ब्याज अनुदान।",
    target_beneficiary_en: "Micro, small, and medium businesses operating in Rajasthan.",
    target_beneficiary_hi: "राजस्थान राज्य में कार्यरत सूक्ष्म, लघु और मध्यम उद्यम।",
    official_source_url: "https://industries.rajasthan.gov.in",
    last_verified_date: "2026-09-01",
    verification_status: "VERIFIED_OFFICIAL",
    benefits_en: [
      "8% direct interest subsidy on business loans up to ₹25 Lakhs.",
      "6% interest subsidy on business loans up to ₹5 Crores.",
      "5% interest subsidy on business loans up to ₹10 Crores.",
      "Applicable for setting up new manufacturing units, service shops, or retail modernization.",
      "Can be combined with Central Government CGTMSE collateral-free guarantee."
    ],
    benefits_hi: [
      "₹25 लाख तक के व्यावसायिक ऋण पर 8% की सीधी सरकारी ब्याज सब्सिडी।",
      "₹5 करोड़ तक के ऋण पर 6% की सरकारी ब्याज सब्सिडी।",
      "₹10 करोड़ तक के ऋण पर 5% की सरकारी ब्याज सब्सिडी।",
      "नई विनिर्माण इकाई लगाने, सेवा उद्यम शुरू करने या दुकान के आधुनिकीकरण पर लागू।",
      "केंद्रीय सरकार की CGTMSE योजना के साथ संयुक्त रूप से लिया जा सकता है।"
    ],
    when_to_connect_en: "Maturity Level 1+. Connect when purchasing new machinery, computers, POS equipment, or constructing business premises in Rajasthan.",
    when_to_connect_hi: "स्तर 1+। जब आप राजस्थान में नई मशीनें, कंप्यूटर या दुकान के नवीनीकरण के लिए बैंक लोन ले रहे हों।",
    how_to_connect_en: [
      "Login to Rajasthan Single Sign-On portal at sso.rajasthan.gov.in.",
      "Open the MLUPY service module under Industries & Commerce Department.",
      "Submit enterprise profile, proposed investment costs, and chosen bank branch.",
      "District Industries Centre (DIC) approves and forwards directly to your bank for disbursement."
    ],
    how_to_connect_hi: [
      "राजस्थान एसएसओ पोर्टल sso.rajasthan.gov.in पर लॉगिन करें।",
      "उद्योग विभाग के तहत MLUPY आवेदन मॉड्यूल खोलें।",
      "उद्यम विवरण, प्रस्तावित निवेश लागत और अपनी बैंक शाखा चुनें।",
      "जिला उद्योग केंद्र (DIC) से अनुमोदन के बाद बैंक द्वारा रियायती ऋण जारी किया जाता है।"
    ],
    required_docs_en: ["Rajasthan SSO ID", "Udyam Registration", "PAN & Aadhaar", "Project Quotation / Quotations for Machinery"],
    required_docs_hi: ["राजस्थान एसएसओ आईडी", "उद्यम पंजीकरण", "पैन एवं आधार", "मशीनरी या उपकरण का कोटेशन"]
  }
];

interface GovernmentInitiativesFlashcardsProps {
  currentLang?: "en" | "hi";
  defaultCategory?: string;
}

export const GovernmentInitiativesFlashcards: React.FC<GovernmentInitiativesFlashcardsProps> = ({
  currentLang = "en",
  defaultCategory = "all",
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (code: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  };

  const categories = [
    { id: "all", labelEn: "All Verified Schemes (8)", labelHi: "सभी 8 सत्यापित योजनाएं" },
    { id: "legal_subsidy", labelEn: "Registration & Quality (2)", labelHi: "पंजीकरण एवं गुणवत्ता (2)" },
    { id: "credit_finance", labelEn: "Credit & Cashflow (3)", labelHi: "ऋण एवं नकद प्रवाह (3)" },
    { id: "ecommerce_market", labelEn: "Market Access & ONDC (2)", labelHi: "बाजार पहुंच व ई-कॉमर्स (2)" },
    { id: "artisans_trades", labelEn: "Artisans & Trades (1)", labelHi: "शिल्पकार व कारीगर (1)" },
  ];

  const filteredInitiatives = VERIFIED_GOVERNMENT_INITIATIVES.filter((init) => {
    if (selectedCategory === "all") return true;
    return init.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#FFF4ED]/70 rounded-2xl border border-[#EDE2D8]">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#F0592A] text-white shadow-sm"
                  : "bg-white/80 text-[#6B5D52] hover:bg-white hover:text-[#241C15]"
              }`}
            >
              {currentLang === "hi" ? cat.labelHi : cat.labelEn}
            </button>
          );
        })}
      </div>

      {/* Grid of 2-Sided Interactive Flashcards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredInitiatives.map((scheme) => {
          const isFlipped = !!flippedCards[scheme.initiative_code];

          return (
            <div
              key={scheme.initiative_code}
              className="relative rounded-2xl border border-[#EDE2D8] bg-white shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col min-h-[380px]"
            >
              {/* Top Banner with Scheme Code and Category Badge */}
              <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-[#FFF4ED] to-[#FAF1E8] border-b border-[#EDE2D8]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-1 bg-white border border-[#F0592A]/30 text-[#F0592A] rounded-lg shadow-xs">
                    {scheme.initiative_code}
                  </span>
                  <span className="text-[11px] font-bold text-[#6B5D52]">
                    {currentLang === "hi" ? scheme.category_label_hi : scheme.category_label_en}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#1B7A6E] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Portal</span>
                </div>
              </div>

              {!isFlipped ? (
                /* ================= FRONT SIDE OF FLASHCARD ================= */
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-extrabold text-[#241C15] group-hover:text-[#F0592A] transition">
                        {currentLang === "hi" ? scheme.name_hi : scheme.name_en}
                      </h3>
                      <p className="text-[11px] text-[#9C8F84] font-medium mt-0.5">
                        {scheme.ministry_department}
                      </p>
                    </div>

                    <p className="text-xs text-[#6B5D52] leading-relaxed">
                      {currentLang === "hi" ? scheme.purpose_hi : scheme.purpose_en}
                    </p>

                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EDE2D8]/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#9C8F84] tracking-wider block">
                        {currentLang === "hi" ? "लक्षित लाभार्थी" : "Target Beneficiaries"}
                      </span>
                      <p className="text-xs font-semibold text-[#241C15]">
                        {currentLang === "hi" ? scheme.target_beneficiary_hi : scheme.target_beneficiary_en}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-[#241C15]">
                      <span className="text-[#9C8F84] text-[11px]">Official Source:</span>
                      <a
                        href={scheme.official_source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#F0592A] hover:underline flex items-center gap-1 font-bold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {scheme.official_source_url.replace("https://", "")}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Actions: Flip for Integration Guide + Visit Portal */}
                  <div className="pt-3 border-t border-[#EDE2D8] flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleFlip(scheme.initiative_code)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#FFF4ED] hover:bg-[#FFE8DE] text-[#F0592A] font-extrabold text-xs transition border border-[#F0592A]/30 shadow-xs"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>{currentLang === "hi" ? "कार्ड पलटें: एकीकरण व लाभ →" : "Flip: How It Helps & Steps →"}</span>
                    </button>
                    <a
                      href={scheme.official_source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl border border-[#EDE2D8] text-[#6B5D52] hover:text-[#F0592A] hover:border-[#F0592A] transition"
                      title="Open Official Portal"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ) : (
                /* ================= BACK SIDE OF FLASHCARD ================= */
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-[#FAF7F2]/60 animate-fadeIn">
                  <div className="space-y-3.5 overflow-y-auto max-h-[380px] pr-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-[#F0592A] uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4" />
                        <span>Integration Blueprint & Gains</span>
                      </h4>
                      <button
                        onClick={() => toggleFlip(scheme.initiative_code)}
                        className="text-xs font-bold text-[#6B5D52] hover:text-[#241C15] underline"
                      >
                        {currentLang === "hi" ? "वापस जाएं ↩" : "Back to Overview ↩"}
                      </button>
                    </div>

                    {/* 1. Why & How It Is Beneficial */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-extrabold text-[#241C15] block">
                        {currentLang === "hi" ? "💡 एकीकरण से कैसे लाभ होगा (Key Gains)" : "💡 How Integrating Proves Beneficial:"}
                      </span>
                      <ul className="space-y-1 text-xs text-[#44382F]">
                        {(currentLang === "hi" ? scheme.benefits_hi : scheme.benefits_en).map((benefit, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#1B7A6E] shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 2. When to Connect */}
                    <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200/70 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#C88A1D] tracking-wider block flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {currentLang === "hi" ? "कब जुड़ना चाहिए (Readiness & Timing)" : "When You Should Connect:"}
                      </span>
                      <p className="text-xs font-medium text-[#241C15]">
                        {currentLang === "hi" ? scheme.when_to_connect_hi : scheme.when_to_connect_en}
                      </p>
                    </div>

                    {/* 3. How to Connect Step-by-Step */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-extrabold text-[#241C15] block flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-[#F0592A]" />
                        {currentLang === "hi" ? "🚀 कैसे जुड़ें (चरणबद्ध प्रक्रिया)" : "🚀 How to Connect Step-by-Step:"}
                      </span>
                      <ol className="space-y-1 text-xs text-[#44382F] list-decimal list-inside pl-1">
                        {(currentLang === "hi" ? scheme.how_to_connect_hi : scheme.how_to_connect_en).map((step, idx) => (
                          <li key={idx} className="leading-snug">
                            <span className="font-semibold text-[#241C15]">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Required Documents Checklist */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#9C8F84] tracking-wider block">
                        {currentLang === "hi" ? "आवश्यक दस्तावेज" : "Prerequisite Documents"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(currentLang === "hi" ? scheme.required_docs_hi : scheme.required_docs_en).map((doc, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white border border-[#EDE2D8] text-[10px] font-bold text-[#44382F]"
                          >
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions on Back Side */}
                  <div className="pt-3 border-t border-[#EDE2D8] flex items-center justify-between gap-3">
                    <button
                      onClick={() => toggleFlip(scheme.initiative_code)}
                      className="py-2 px-3 rounded-xl bg-white border border-[#EDE2D8] hover:border-[#F0592A] text-[#6B5D52] font-bold text-xs transition"
                    >
                      {currentLang === "hi" ? "सामने का विवरण ↩" : "Front Overview ↩"}
                    </button>
                    <a
                      href={scheme.official_source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-[#F0592A] hover:bg-[#D9481C] text-white font-extrabold text-xs text-center flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <span>{currentLang === "hi" ? "आधिकारिक पोर्टल खोलें" : "Apply on Official Portal"}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
