"""Initial Question Bank Definition — Version 1 (Claude C3).

NOTE: The questions below are representative research questionnaire items for Version 1.
Translations in Hindi are provided as initial research content items and will undergo
continuous refinement.
"""

from typing import Any, Dict, List

QUESTION_BANK_VERSION = 1

QUESTIONS_V1: List[Dict[str, Any]] = [
    # ------------------------------------------------------------
    # 1. DIGITAL INFRASTRUCTURE (infra)
    # ------------------------------------------------------------
    {
        "question_code": "Q-INFRA-01",
        "dimension_code": "infra",
        "question_text_en": "Does anyone in the business regularly use a smartphone or computer for business purposes?",
        "question_text_hi": "क्या व्यवसाय में कोई व्यक्ति नियमित रूप से व्यावसायिक कार्यों के लिए स्मार्टफोन या कंप्यूटर का उपयोग करता है?",
        "question_type": "single_choice",
        "display_order": 10,
        "version": 1,
        "options": [
            {
                "option_code": "OPT_INFRA_01_COMFORT",
                "label_en": "Yes, comfortably",
                "label_hi": "हाँ, आसानी से",
                "score_value": 3.0,
                "display_order": 1,
            },
            {
                "option_code": "OPT_INFRA_01_HELP",
                "label_en": "Yes, with help",
                "label_hi": "हाँ, किसी की मदद से",
                "score_value": 2.0,
                "display_order": 2,
            },
            {
                "option_code": "OPT_INFRA_01_RARE",
                "label_en": "Rarely",
                "label_hi": "शायद ही कभी",
                "score_value": 1.0,
                "display_order": 3,
            },
            {
                "option_code": "OPT_INFRA_01_NO",
                "label_en": "No",
                "label_hi": "नहीं",
                "score_value": 0.0,
                "display_order": 4,
            },
        ],
    },
    {
        "question_code": "Q-INFRA-02",
        "dimension_code": "infra",
        "question_text_en": "How reliable is your internet access at the business location?",
        "question_text_hi": "व्यवसाय स्थल पर आपका इंटरनेट कनेक्शन कितना विश्वसनीय है?",
        "question_type": "single_choice",
        "display_order": 20,
        "version": 1,
        "options": [
            {
                "option_code": "OPT_INFRA_02_DAILY",
                "label_en": "Reliable daily",
                "label_hi": "प्रतिदिन विश्वसनीय",
                "score_value": 3.0,
                "display_order": 1,
            },
            {
                "option_code": "OPT_INFRA_02_INTERMITTENT",
                "label_en": "Intermittent",
                "label_hi": "रुक-रुक कर",
                "score_value": 2.0,
                "display_order": 2,
            },
            {
                "option_code": "OPT_INFRA_02_RARE",
                "label_en": "Rare",
                "label_hi": "शायद ही कभी",
                "score_value": 1.0,
                "display_order": 3,
            },
            {
                "option_code": "OPT_INFRA_02_NO",
                "label_en": "No internet access",
                "label_hi": "कोई इंटरनेट कनेक्शन नहीं",
                "score_value": 0.0,
                "display_order": 4,
            },
        ],
    },
    # ------------------------------------------------------------
    # 2. DIGITAL LITERACY (literacy)
    # ------------------------------------------------------------
    {
        "question_code": "Q-LIT-01",
        "dimension_code": "literacy",
        "question_text_en": "How comfortable are you installing and using a new mobile app on your own?",
        "question_text_hi": "आप स्वयं एक नया मोबाइल ऐप इंस्टॉल और उपयोग करने में कितने सहज हैं?",
        "question_type": "single_choice",
        "display_order": 30,
        "version": 1,
        "options": [
            {
                "option_code": "OPT_LIT_01_VERY",
                "label_en": "Very comfortable",
                "label_hi": "बहुत सहज",
                "score_value": 3.0,
                "display_order": 1,
            },
            {
                "option_code": "OPT_LIT_01_GUIDED",
                "label_en": "Somewhat, with guidance",
                "label_hi": "थोड़ा, मार्गदर्शन के साथ",
                "score_value": 2.0,
                "display_order": 2,
            },
            {
                "option_code": "OPT_LIT_01_UNCOMFORTABLE",
                "label_en": "Uncomfortable",
                "label_hi": "असहज",
                "score_value": 1.0,
                "display_order": 3,
            },
            {
                "option_code": "OPT_LIT_01_NEVER",
                "label_en": "Never tried",
                "label_hi": "कभी प्रयास नहीं किया",
                "score_value": 0.0,
                "display_order": 4,
            },
        ],
    },
    {
        "question_code": "Q-LIT-02",
        "dimension_code": "literacy",
        "question_text_en": "Has anyone in the business received any digital skills training (formal or informal)?",
        "question_text_hi": "क्या व्यवसाय में किसी ने कोई डिजिटल कौशल प्रशिक्षण (औपचारिक या अनौपचारिक) प्राप्त किया है?",
        "question_type": "boolean",
        "display_order": 40,
        "version": 1,
        "options": [
            {
                "option_code": "OPT_LIT_02_YES",
                "label_en": "Yes",
                "label_hi": "हाँ",
                "score_value": 2.0,
                "display_order": 1,
            },
            {
                "option_code": "OPT_LIT_02_NO",
                "label_en": "No",
                "label_hi": "नहीं",
                "score_value": 0.0,
                "display_order": 2,
            },
        ],
    },
    # ------------------------------------------------------------
    # 3. ONLINE PRESENCE (presence)
    # ------------------------------------------------------------
    {
        "question_code": "Q-PRES-01",
        "dimension_code": "presence",
        "question_text_en": "Which of these does your business currently have?",
        "question_text_hi": "वर्तमान में आपके व्यवसाय में इनमें से क्या मौजूद है?",
        "question_type": "multi_choice",
        "display_order": 50,
        "version": 1,
        "options": [
            {
                "option_code": "OPT_PRES_01_GMB",
                "label_en": "Google Business listing",
                "label_hi": "गूगल बिजनेस लिस्टिंग",
                "score_value": 2.0,
                "display_order": 1,
            },
            {
                "option_code": "OPT_PRES_01_SOCIAL",
                "label_en": "Instagram or Facebook page",
                "label_hi": "इंस्टाग्राम या फेसबुक पेज",
                "score_value": 2.0,
                "display_order": 2,
            },
            {
                "option_code": "OPT_PRES_01_WABIZ",
                "label_en": "WhatsApp Business profile",
                "label_hi": "व्हाट्सएप बिजनेस प्रोफाइल",
                "score_value": 1.0,
                "display_order": 3,
            },
            {
                "option_code": "OPT_PRES_01_WEBSITE",
                "label_en": "Website",
                "label_hi": "वेबसाइट",
                "score_value": 3.0,
                "display_order": 4,
            },
            {
                "option_code": "OPT_PRES_01_NONE",
                "label_en": "None of these",
                "label_hi": "इनमें से कोई नहीं",
                "score_value": 0.0,
                "display_order": 5,
            },
        ],
    },
    # ------------------------------------------------------------
    # 4. CUSTOMER COMMUNICATION (comms)
    # ------------------------------------------------------------
    {
        "question_code": "Q-COMM-01",
        "dimension_code": "comms",
        "question_text_en": "How do you usually take customer orders or queries?",
        "question_text_hi": "आप आमतौर पर ग्राहकों के ऑर्डर या पूछताछ कैसे लेते हैं?",
        "question_type": "single_choice",
        "display_order": 60,
        "version": 1,
        "options": [
            {
                "option_code": "OPT_COMM_01_PERSON",
                "label_en": "Only in person/phone call",
                "label_hi": "केवल व्यक्तिगत रूप से या फोन कॉल पर",
                "score_value": 0.0,
                "display_order": 1,
            },
            {
                "option_code": "OPT_COMM_01_WHATSAPP",
                "label_en": "WhatsApp messages",
                "label_hi": "व्हाट्सएप संदेश",
                "score_value": 2.0,
                "display_order": 2,
            },
            {
                "option_code": "OPT_COMM_01_ONLINE",
                "label_en": "Online form or ordering app",
                "label_hi": "ऑनलाइन फॉर्म या ऑर्डरिंग ऐप",
                "score_value": 3.0,
                "display_order": 3,
            },
            {
                "option_code": "OPT_COMM_01_MIX",
                "label_en": "Mix of the above",
                "label_hi": "उपरोक्त का मिश्रण",
                "score_value": 2.0,
                "display_order": 4,
            },
        ],
    },
    # ------------------------------------------------------------
    # 5. RECORD MANAGEMENT (records)
    # ------------------------------------------------------------
    {
        "question_code": "Q-REC-01",
        "dimension_code": "records",
        "question_text_en": "How are your sales and expense records kept?",
        "question_text_hi": "आपकी बिक्री और खर्च का रिकॉर्ड कैसे रखा जाता है?",
        "question_type": "single_choice",
        "display_order": 70,
        "version": 1,
        "options": [
            {
                "option_code": "OPT_REC_01_NONE",
                "label_en": "Not kept / memory only",
                "label_hi": "नहीं रखा जाता / केवल याददाश्त",
                "score_value": 0.0,
                "display_order": 1,
            },
            {
                "option_code": "OPT_REC_01_REGISTER",
                "label_en": "Handwritten register",
                "label_hi": "हाथ से लिखा रजिस्टर/खाताबही",
                "score_value": 1.0,
                "display_order": 2,
            },
            {
                "option_code": "OPT_REC_01_SPREADSHEET",
                "label_en": "Spreadsheet on phone/computer",
                "label_hi": "फोन/कंप्यूटर पर स्प्रेडशीट (एक्सेल/शीट्स)",
                "score_value": 2.0,
                "display_order": 3,
            },
            {
                "option_code": "OPT_REC_01_SOFTWARE",
                "label_en": "Dedicated accounting software",
                "label_hi": "समर्पित अकाउंटिंग सॉफ्टवेयर (जैसे व्यापार/टैली)",
                "score_value": 3.0,
                "display_order": 4,
            },
        ],
    },
    # ------------------------------------------------------------
    # 6. PAYMENT SYSTEMS (payments)
    # ------------------------------------------------------------
    {
        "question_code": "Q-PAY-01",
        "dimension_code": "payments",
        "question_text_en": "How do customers usually pay you?",
        "question_text_hi": "ग्राहक आमतौर पर आपको भुगतान कैसे करते हैं?",
        "question_type": "single_choice",
        "display_order": 80,
        "version": 1,
        "options": [
            {
                "option_code": "OPT_PAY_01_CASH",
                "label_en": "Cash only",
                "label_hi": "केवल नकद",
                "score_value": 0.0,
                "display_order": 1,
            },
            {
                "option_code": "OPT_PAY_01_UPI_SOMETIMES",
                "label_en": "UPI/QR sometimes",
                "label_hi": "यूपीआई/क्यूआर कभी-कभी",
                "score_value": 2.0,
                "display_order": 2,
            },
            {
                "option_code": "OPT_PAY_01_UPI_MOSTLY",
                "label_en": "UPI/QR mostly",
                "label_hi": "यूपीआई/क्यूआर अधिकतर",
                "score_value": 3.0,
                "display_order": 3,
            },
            {
                "option_code": "OPT_PAY_01_BOTH",
                "label_en": "Card/POS and UPI both",
                "label_hi": "कार्ड/पीओएस और यूपीआई दोनों",
                "score_value": 3.0,
                "display_order": 4,
            },
        ],
    },
    {
        "question_code": "Q-PAY-02",
        "dimension_code": "payments",
        "question_text_en": "Do you reconcile digital payments against your sales records regularly?",
        "question_text_hi": "क्या आप नियमित रूप से डिजिटल भुगतानों का अपने बिक्री रिकॉर्ड से मिलान करते हैं?",
        "question_type": "boolean",
        "display_order": 90,
        "version": 1,
        "options": [
            {
                "option_code": "OPT_PAY_02_YES",
                "label_en": "Yes",
                "label_hi": "हाँ",
                "score_value": 2.0,
                "display_order": 1,
            },
            {
                "option_code": "OPT_PAY_02_NO",
                "label_en": "No",
                "label_hi": "नहीं",
                "score_value": 0.0,
                "display_order": 2,
            },
        ],
    },
    # ------------------------------------------------------------
    # 7. INVENTORY & OPERATIONS (inventory)
    # ------------------------------------------------------------
    {
        "question_code": "Q-INV-01",
        "dimension_code": "inventory",
        "question_text_en": "How do you track your stock/inventory?",
        "question_text_hi": "आप अपने स्टॉक/इन्वेंट्री को कैसे ट्रैक करते हैं?",
        "question_type": "single_choice",
        "display_order": 100,
        "version": 1,
        "options": [
            {
                "option_code": "OPT_INV_01_NONE",
                "label_en": "Not tracked formally",
                "label_hi": "औपचारिक रूप से ट्रैक नहीं किया जाता",
                "score_value": 0.0,
                "display_order": 1,
            },
            {
                "option_code": "OPT_INV_01_MANUAL",
                "label_en": "Manual count/register",
                "label_hi": "मैनुअल गिनती/रजिस्टर",
                "score_value": 1.0,
                "display_order": 2,
            },
            {
                "option_code": "OPT_INV_01_SPREADSHEET",
                "label_en": "Spreadsheet",
                "label_hi": "स्प्रेडशीट (एक्सेल)",
                "score_value": 2.0,
                "display_order": 3,
            },
            {
                "option_code": "OPT_INV_01_SOFTWARE",
                "label_en": "Inventory/billing software",
                "label_hi": "इन्वेंट्री/बिलिंग सॉफ्टवेयर",
                "score_value": 3.0,
                "display_order": 4,
            },
        ],
    },
    # ------------------------------------------------------------
    # 8. DATA USAGE (data_usage)
    # ------------------------------------------------------------
    {
        "question_code": "Q-DATA-01",
        "dimension_code": "data_usage",
        "question_text_en": "How often do you look at your sales numbers to understand how the business is doing?",
        "question_text_hi": "व्यवसाय कैसा चल रहा है यह समझने के लिए आप कितनी बार अपने बिक्री आंकड़ों को देखते हैं?",
        "question_type": "single_choice",
        "display_order": 110,
        "version": 1,
        "options": [
            {
                "option_code": "OPT_DATA_01_RARE",
                "label_en": "Never/rarely",
                "label_hi": "कभी नहीं / शायद ही कभी",
                "score_value": 0.0,
                "display_order": 1,
            },
            {
                "option_code": "OPT_DATA_01_OCCASIONAL",
                "label_en": "Occasionally",
                "label_hi": "कभी-कभार",
                "score_value": 1.0,
                "display_order": 2,
            },
            {
                "option_code": "OPT_DATA_01_MONTHLY",
                "label_en": "Monthly",
                "label_hi": "मासिक",
                "score_value": 2.0,
                "display_order": 3,
            },
            {
                "option_code": "OPT_DATA_01_WEEKLY",
                "label_en": "Weekly or more",
                "label_hi": "साप्ताहिक या अधिक बार",
                "score_value": 3.0,
                "display_order": 4,
            },
        ],
    },
    {
        "question_code": "Q-DATA-02",
        "dimension_code": "data_usage",
        "question_text_en": "Have you ever changed a business decision (pricing, stock, hours) because of something you saw in your sales data?",
        "question_text_hi": "क्या आपने कभी बिक्री डेटा में देखी गई किसी बात के कारण कोई व्यावसायिक निर्णय (मूल्य निर्धारण, स्टॉक, समय) बदला है?",
        "question_type": "boolean",
        "display_order": 120,
        "version": 1,
        "options": [
            {
                "option_code": "OPT_DATA_02_YES",
                "label_en": "Yes",
                "label_hi": "हाँ",
                "score_value": 2.0,
                "display_order": 1,
            },
            {
                "option_code": "OPT_DATA_02_NO",
                "label_en": "No",
                "label_hi": "नहीं",
                "score_value": 0.0,
                "display_order": 2,
            },
        ],
    },
    # ------------------------------------------------------------
    # 9. BUSINESS GROWTH READINESS (growth)
    # ------------------------------------------------------------
    {
        "question_code": "Q-GROW-01",
        "dimension_code": "growth",
        "question_text_en": "Are you aware of any government or platform digital programs for small businesses (e.g. Udyam, ONDC, GeM)?",
        "question_text_hi": "क्या आप छोटे व्यवसायों के लिए किसी सरकारी या प्लेटफ़ॉर्म डिजिटल कार्यक्रम (जैसे उद्यम, ओएनडीसी, जीईएम) से अवगत हैं?",
        "question_type": "boolean",
        "display_order": 130,
        "version": 1,
        "options": [
            {
                "option_code": "OPT_GROW_01_YES",
                "label_en": "Yes",
                "label_hi": "हाँ",
                "score_value": 1.0,
                "display_order": 1,
            },
            {
                "option_code": "OPT_GROW_01_NO",
                "label_en": "No",
                "label_hi": "नहीं",
                "score_value": 0.0,
                "display_order": 2,
            },
        ],
    },
    {
        "question_code": "Q-GROW-02",
        "dimension_code": "growth",
        "question_text_en": "Do you have any plan to expand how you sell or operate digitally in the next year?",
        "question_text_hi": "क्या आपकी अगले वर्ष में डिजिटल रूप से बिक्री या संचालन का विस्तार करने की कोई योजना है?",
        "question_type": "single_choice",
        "display_order": 140,
        "version": 1,
        "options": [
            {
                "option_code": "OPT_GROW_02_CONCRETE",
                "label_en": "Concrete plan",
                "label_hi": "ठोस योजना",
                "score_value": 3.0,
                "display_order": 1,
            },
            {
                "option_code": "OPT_GROW_02_INTERESTED",
                "label_en": "Interested, no plan yet",
                "label_hi": "रुचि है, अभी कोई योजना नहीं",
                "score_value": 2.0,
                "display_order": 2,
            },
            {
                "option_code": "OPT_GROW_02_NO",
                "label_en": "Not interested",
                "label_hi": "रुचि नहीं है",
                "score_value": 0.0,
                "display_order": 3,
            },
        ],
    },
]
