"""Roadmap Learning Flashcard Knowledge Base.

Contains structured 12-attribute learning flashcards for all digitalization levels,
with dedicated focus on Level 3 Growth-Oriented Digitalization.
All claims use platform-neutral, realistic language ('may help', 'can support', 'typically').
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional


@dataclass
class LearningFlashcard:
    card_id: str
    recommendation_code: Optional[str]
    target_level: int
    topic: str
    title_en: str
    title_hi: str
    what_is_it_en: str
    what_is_it_hi: str
    why_matters_en: str
    why_matters_hi: str
    who_needs_it_en: str
    who_needs_it_hi: str
    when_to_adopt_en: str
    when_to_adopt_hi: str
    prerequisites_en: List[str]
    prerequisites_hi: List[str]
    complexity: str  # "Low", "Medium", "High"
    implementation_steps_en: List[str]
    implementation_steps_hi: List[str]
    common_mistakes_en: List[str]
    common_mistakes_hi: List[str]
    expected_benefit_en: str
    expected_benefit_hi: str
    what_to_measure_en: List[str]
    what_to_measure_hi: List[str]
    low_cost_alternative_en: str
    low_cost_alternative_hi: str
    next_action_en: str
    next_action_hi: str


FLASHCARDS_CATALOG: List[LearningFlashcard] = [
    # -------------------------------------------------------------------------
    # LEVEL 1 FLASHCARDS (Foundational)
    # -------------------------------------------------------------------------
    LearningFlashcard(
        card_id="CARD-INFRA-01",
        recommendation_code="REC-INFRA-01",
        target_level=1,
        topic="Hardware & Connectivity",
        title_en="Dedicated Business Smartphone & Daily Internet",
        title_hi="समर्पित व्यावसायिक स्मार्टफोन और दैनिक इंटरनेट",
        what_is_it_en="A separate mobile phone dedicated solely for enterprise orders, customer calls, and billing apps.",
        what_is_it_hi="व्यावसायिक ऑर्डर, ग्राहकों से बातचीत और बिलिंग ऐप्स के लिए समर्पित अलग मोबाइल फोन।",
        why_matters_en="Mixing personal and commercial phone usage can cause missed customer calls, deleted order photos, and security risks.",
        why_matters_hi="व्यक्तिगत और व्यावसायिक फोन मिलाने से ग्राहकों के कॉल छूट सकते हैं और सुरक्षा जोखिम पैदा हो सकते हैं।",
        who_needs_it_en="Micro and small enterprises currently using personal family phones for customer inquiries.",
        who_needs_it_hi="ऐसे सूक्ष्म और लघु उद्यम जो वर्तमान में व्यावसायिक कार्यों के लिए पारिवारिक फोन का उपयोग करते हैं।",
        when_to_adopt_en="Adopt at Level 0 to build the basic digital foundation for all subsequent tools.",
        when_to_adopt_hi="स्तर 0 पर ही इसे अपनाएं ताकि आगे के सभी डिजिटल उपकरणों की मजबूत नींव बन सके।",
        prerequisites_en=["Budget of ₹6,000–₹10,000 or a spare 4G/5G smartphone", "Dedicated SIM card in business name"],
        prerequisites_hi=["₹6,000–₹10,000 का बजट या कोई अतिरिक्त 4G/5G स्मार्टफोन", "व्यवसाय के नाम पर समर्पित सिम कार्ड"],
        complexity="Low",
        implementation_steps_en=[
            "Purchase an affordable 4G/5G smartphone with at least 4GB RAM.",
            "Insert dedicated business SIM and configure PIN lock & biometric security.",
            "Install business essentials: WhatsApp Business, UPI merchant app, and cloud backup.",
            "Display the dedicated business contact number on shop front and signage.",
        ],
        implementation_steps_hi=[
            "कम से कम 4GB रैम वाला किफायती 4G/5G स्मार्टफोन खरीदें।",
            "समर्पित व्यावसायिक सिम लगाएं और पिन लॉक व बायोमेट्रिक सुरक्षा सेट करें।",
            "आवश्यक ऐप्स इंस्टॉल करें: व्हाट्सएप बिजनेस, यूपीआई मर्चेंट ऐप और क्लाउड बैकअप।",
            "दुकान के बोर्ड और बिल पर यह नया व्यावसायिक नंबर प्रदर्शित करें।",
        ],
        common_mistakes_en=[
            "Sharing the phone with family members or children.",
            "Not enabling automatic Google/iCloud photo and chat backup.",
        ],
        common_mistakes_hi=[
            "फोन को बच्चों या परिवार के अन्य सदस्यों के साथ साझा करना।",
            "गूगल ड्राइव पर स्वचालित चैट बैकअप सक्षम न करना।",
        ],
        expected_benefit_en="May help ensure 100% of customer orders and payments are recorded and never lost due to family phone usage.",
        expected_benefit_hi="ग्राहकों के सभी ऑर्डर और भुगतान एक ही जगह सुरक्षित रहते हैं और छूटने का जोखिम कम होता है।",
        what_to_measure_en=["Daily customer inquiries received", "Zero missed calls during business hours"],
        what_to_measure_hi=["दैनिक प्राप्त ग्राहक पूछताछ", "कार्य समय में मिस्ड कॉल की संख्या"],
        low_cost_alternative_en="Use a refurbished certified smartphone (₹4,000) or dual-SIM on an existing device with secure app cloning.",
        low_cost_alternative_hi="रिफर्बिश्ड स्मार्टफोन या मौजूदा फोन में डुअल-सिम और ऐप क्लोनिंग का उपयोग करें।",
        next_action_en="Acquire a dedicated SIM card and set up WhatsApp Business account today.",
        next_action_hi="आज ही एक समर्पित सिम कार्ड लें और व्हाट्सएप बिजनेस अकाउंट सेट करें।",
    ),

    # -------------------------------------------------------------------------
    # LEVEL 2 FLASHCARDS (Operational Presence & Transactions)
    # -------------------------------------------------------------------------
    LearningFlashcard(
        card_id="CARD-PAY-01",
        recommendation_code="REC-PAY-01",
        target_level=2,
        topic="Digital Payments",
        title_en="Merchant QR Code & Audio Confirmation Soundbox",
        title_hi="मर्चेंट क्यूआर कोड और ऑडियो साउंडबॉक्स",
        what_is_it_en="A physical UPI QR counter stand linked to an audio soundbox that announces payment receipts out loud.",
        what_is_it_hi="दुकान के काउंटर पर लगा क्यूआर कोड और ऑडियो साउंडबॉक्स जो भुगतान मिलते ही बोलकर पुष्टि करता है।",
        why_matters_en="Helps eliminate fake screenshot fraud during peak rush hours and frees staff from checking the phone repeatedly.",
        why_matters_hi="भीड़ के समय फर्जी स्क्रीनशॉट से होने वाले नुकसान से बचाता है और बार-बार फोन चेक करने का समय बचाता है।",
        who_needs_it_en="Retail stores, food stalls, pharmacies, and service centers handling high footfall and cash transactions.",
        who_needs_it_hi="खुदरा दुकानें, भोजनालय, मेडिकल स्टोर और ज्यादा ग्राहकों वाले सेवा प्रतिष्ठान।",
        when_to_adopt_en="Adopt when daily digital transactions exceed 10–15 payments.",
        when_to_adopt_hi="जब दैनिक डिजिटल लेनदेन 10–15 से अधिक होने लगें।",
        prerequisites_en=["Bank account in business or owner name", "Aadhaar and PAN for merchant KYC"],
        prerequisites_hi=["व्यवसाय या मालिक के नाम पर बैंक खाता", "मर्चेंट केवाईसी के लिए आधार और पैन"],
        complexity="Low",
        implementation_steps_en=[
            "Apply via authorized provider (Paytm, PhonePe, Google Pay for Business, or Bank).",
            "Complete digital KYC and link bank account for daily settlements.",
            "Install soundbox in audible position near cash counter.",
            "Train counter staff to listen for audio confirmation before handing over goods.",
        ],
        implementation_steps_hi=[
            "अधिकृत प्रदाता (पेटीएम, फोनपे, गूगल पे बिजनेस या बैंक) के माध्यम से आवेदन करें।",
            "डिजिटल केवाईसी पूरी करें और दैनिक खाते में निपटान के लिए बैंक खाता जोड़ें।",
            "काउंटर के पास साउंडबॉक्स ऐसी जगह लगाएं जहां आवाज साफ सुनाई दे।",
            "स्टाफ को सामान देने से पहले ऑडियो घोषणा सुनने का निर्देश दें।",
        ],
        common_mistakes_en=[
            "Relying on customer showing a phone screen without audio verification.",
            "Keeping soundbox on low volume during market peak hours.",
        ],
        common_mistakes_hi=[
            "ऑडियो सुने बिना केवल ग्राहक द्वारा फोन स्क्रीन दिखाने पर भरोसा करना।",
            "भीड़ के समय साउंडबॉक्स की आवाज बहुत धीमी रखना।",
        ],
        expected_benefit_en="Typically eliminates payment verification bottlenecks and helps prevent fake transaction losses.",
        expected_benefit_hi="भुगतान सत्यापन में लगने वाला समय बचता है और फर्जी भुगतान की संभावना खत्म होती है।",
        what_to_measure_en=["Ratio of digital vs cash revenue", "Zero unpaid transaction disputes per month"],
        what_to_measure_hi=["डिजिटल बनाम नकद बिक्री का अनुपात", "मासिक भुगतान विवादों की शून्य संख्या"],
        low_cost_alternative_en="Use a free static laminated QR stand with instant SMS notifications enabled on the shop phone.",
        low_cost_alternative_hi="मुफ्त लेमिनेटेड क्यूआर स्टैंड लगाएं और दुकान के फोन पर तुरंत एसएमएस अलर्ट चालू रखें।",
        next_action_en="Download Google Pay for Business or PhonePe Business and order verified merchant QR.",
        next_action_hi="गूगल पे फॉर बिजनेस या फोनपे बिजनेस डाउनलोड करें और मर्चेंट क्यूआर मंगवाएं।",
    ),
    LearningFlashcard(
        card_id="CARD-PRES-01",
        recommendation_code="REC-PRES-01",
        target_level=2,
        topic="Online Discovery",
        title_en="Google Business Profile & Maps Verification",
        title_hi="गूगल बिजनेस प्रोफाइल एवं मैप्स लिस्टिंग",
        what_is_it_en="A verified public business listing on Google Maps showing shop location, operating hours, photos, and customer reviews.",
        what_is_it_hi="गूगल मैप्स पर सत्यापित प्रोफाइल जो दुकान का पता, खुलने का समय, फोटो और ग्राहकों की समीक्षाएं दिखाता है।",
        why_matters_en="Local customers search 'near me' for shops and services; an unverified business is invisible to new neighborhood residents.",
        why_matters_hi="स्थानीय ग्राहक अक्सर पास की दुकानें सर्च करते हैं; लिस्टिंग न होने से नए ग्राहक दुकान तक नहीं पहुंच पाते।",
        who_needs_it_en="All brick-and-mortar retail stores, clinics, salons, workshops, and restaurants.",
        who_needs_it_hi="सभी खुदरा दुकानें, क्लीनिक, सैलून, वर्कशॉप और भोजनालय।",
        when_to_adopt_en="Adopt immediately upon opening or establishing regular operating hours.",
        when_to_adopt_hi="दुकान शुरू करते ही या नियमित समय तय होते ही इसे अपनाएं।",
        prerequisites_en=["Exact business address and landmark", "Google account and smartphone with camera"],
        prerequisites_hi=["दुकान का सटीक पता और लैंडमार्क", "गूगल अकाउंट और कैमरे वाला स्मार्टफोन"],
        complexity="Low",
        implementation_steps_en=[
            "Search for business name on Google Maps or visit business.google.com.",
            "Claim or create profile with exact store name, category, and GPS pin.",
            "Complete verification (video verification or OTP postcard).",
            "Upload 5+ high-quality photos (shopfront, counter, interior, products).",
            "Request 5 regular satisfied customers to leave genuine 5-star reviews.",
        ],
        implementation_steps_hi=[
            "गूगल मैप्स पर अपनी दुकान खोजें या business.google.com पर जाएं।",
            "सटीक नाम, श्रेणी और सही जीपीएस पिन के साथ प्रोफाइल बनाएं।",
            "सत्यापन पूरा करें (वीडियो सत्यापन या ओटीपी)।",
            "दुकान के बाहर, अंदर और उत्पादों की 5 अच्छी फोटो अपलोड करें।",
            "5 नियमित संतुष्ट ग्राहकों से अच्छी समीक्षा और रेटिंग देने का अनुरोध करें।",
        ],
        common_mistakes_en=[
            "Wrong GPS pin placement sending customers to a back alley.",
            "Irregular operating hours resulting in customers arriving when shop is closed.",
        ],
        common_mistakes_hi=[
            "गलत जीपीएस लोकेशन डालना जिससे ग्राहक भटक जाएं।",
            "दुकान खुलने और बंद होने का गलत समय दर्ज रखना।",
        ],
        expected_benefit_en="Typically increases local discovery calls, direction requests, and walk-in footfall by 15–30%.",
        expected_benefit_hi="स्थानीय ग्राहकों के फोन और दुकान पर आने वाले लोगों की संख्या में बढ़ोतरी हो सकती है।",
        what_to_measure_en=["Monthly Google Maps search views", "Direction requests clicked", "Customer reviews received"],
        what_to_measure_hi=["मासिक मैप्स सर्च व्यूज", "डायरेक्शन अनुरोधों की संख्या", "प्राप्त नई समीक्षाएं"],
        low_cost_alternative_en="100% Free: Google Business Profile charges ₹0 for registration and maintenance.",
        low_cost_alternative_hi="पूर्णतः निःशुल्क: गूगल बिजनेस प्रोफाइल बनाने और चलाने का कोई शुल्क नहीं है।",
        next_action_en="Claim your Google Business Profile and pin your shop on Google Maps today.",
        next_action_hi="आज ही गूगल बिजनेस प्रोफाइल बनाएं और अपनी दुकान को मैप्स पर दर्ज करें।",
    ),

    # -------------------------------------------------------------------------
    # LEVEL 3 FLASHCARDS (Growth-Oriented Digitalization)
    # -------------------------------------------------------------------------
    LearningFlashcard(
        card_id="CARD-L3-ANALYTICS",
        recommendation_code="REC-DATA-02",
        target_level=3,
        topic="Advanced Analytics & Dashboards",
        title_en="Executive Business Dashboards & Sales Trend Forecasting",
        title_hi="व्यावसायिक डैशबोर्ड और बिक्री पूर्वानुमान",
        what_is_it_en="A unified digital dashboard consolidating sales, gross margins, inventory aging, and customer retention metrics.",
        what_is_it_hi="एक डिजिटल डैशबोर्ड जो दैनिक बिक्री, मुनाफा, पुराने स्टॉक और ग्राहक दोहराव को एक स्क्रीन पर दिखाता है।",
        why_matters_en="Moving from gut-feeling intuition to data-backed decisions helps prevent overstocking slow items and losing profit margin.",
        why_matters_hi="अनुमान के बजाय वास्तविक आंकड़ों के आधार पर निर्णय लेने से बिना बिकने वाले माल में पूंजी फंसने से बचती है।",
        who_needs_it_en="Established MSMEs with monthly turnover > ₹5 Lakhs managing multiple product lines or branches.",
        who_needs_it_hi="₹5 लाख से अधिक मासिक टर्नओवर वाले स्थापित व्यवसाय जिनके पास कई उत्पाद या शाखाएं हैं।",
        when_to_adopt_en="Adopt when computerized billing and digital inventory records have been consistently maintained for 6+ months.",
        when_to_adopt_hi="जब कम से कम 6 महीने से कंप्यूटर बिलिंग और डिजिटल इन्वेंट्री रिकॉर्ड नियमित रखे जा रहे हों।",
        prerequisites_en=["Consistent digital POS/ERP data", "Product-level cost and selling price tagging"],
        prerequisites_hi=["नियमित डिजिटल बिलिंग डेटा", "उत्पाद-स्तरीय खरीद और बिक्री मूल्य रिकॉर्ड"],
        complexity="Medium",
        implementation_steps_en=[
            "Audit existing billing software (Tally, Vyapar, Marg) for data cleanliness.",
            "Activate built-in dashboard modules or export monthly CSV into Google Sheets / Power BI.",
            "Configure 4 core KPI widgets: Top 10 Margin Contributors, Dead Stock > 60 days, Daily Peak Hours, and Customer Repeat Rate.",
            "Conduct weekly 30-minute owner reviews to adjust supplier reorders based on dashboard trends.",
        ],
        implementation_steps_hi=[
            "बिलिंग सॉफ्टवेयर (टैली, व्यापार या मार्ग) में डेटा की जांच करें।",
            "इनबिल्ट डैशबोर्ड चालू करें या डेटा को गूगल शीट्स/पावर बीआई में कनेक्ट करें।",
            "4 मुख्य रिपोर्ट सेट करें: सबसे ज्यादा मुनाफे वाले उत्पाद, 60 दिन पुराना स्टॉक, व्यस्ततम समय और ग्राहक दोहराव।",
            "हर हफ्ते 30 मिनट डैशबोर्ड देखकर सप्लायर ऑर्डर की समीक्षा करें।",
        ],
        common_mistakes_en=[
            "Reviewing dashboards once every 6 months instead of weekly.",
            "Tracking too many vanity metrics without acting on slow-moving inventory.",
        ],
        common_mistakes_hi=[
            "हफ्ते के बजाय महीनों बाद डैशबोर्ड देखना।",
            "बिना बिकने वाले स्टॉक पर तुरंत फैसला न लेना।",
        ],
        expected_benefit_en="May help reduce working capital locked in dead inventory by 10–25% and improve gross margins.",
        expected_benefit_hi="पुराने स्टॉक में फंसी कार्यशील पूंजी को 10-25% तक मुक्त करने और मुनाफे को बढ़ाने में मददगार।",
        what_to_measure_en=["Inventory turnover ratio", "Gross profit margin trend", "Dead stock value percentage"],
        what_to_measure_hi=["इन्वेंट्री टर्नओवर अनुपात", "सकल लाभ प्रतिशत", "डेड स्टॉक का मूल्य"],
        low_cost_alternative_en="Build a structured automated Google Sheet connected to your daily Tally/Excel export.",
        low_cost_alternative_hi="दैनिक बिलिंग एक्सेल फाइल को गूगल शीट्स से जोड़कर मुफ्त में ऑटो-डैशबोर्ड बनाएं।",
        next_action_en="Schedule a weekly review session and set up a basic dead-stock tracking report.",
        next_action_hi="साप्ताहिक समीक्षा का समय तय करें और 60 दिन पुराने स्टॉक की रिपोर्ट बनाएं।",
    ),
    LearningFlashcard(
        card_id="CARD-L3-CRM",
        recommendation_code="REC-GROW-02",
        target_level=3,
        topic="Customer Retention & CRM",
        title_en="Customer Relationship Management (CRM) & Automated Loyalty",
        title_hi="ग्राहक संबंध प्रबंधन (CRM) एवं लॉयल्टी ऑटोमेशन",
        what_is_it_en="A structured database of customer purchase history, birthdays, anniversaries, and automated WhatsApp re-engagement workflows.",
        what_is_it_hi="ग्राहकों के खरीद इतिहास, जन्मदिन और सालगिरह का रिकॉर्ड और स्वचालित व्हाट्सएप संदेश प्रणाली।",
        why_matters_en="Acquiring a new customer costs 5x more than retaining an existing customer. CRM keeps your shop top-of-mind.",
        why_matters_hi="नया ग्राहक ढूंढने में पुराने ग्राहक को बनाए रखने से 5 गुना ज्यादा खर्च होता है; सीआरएम ग्राहकों को जोड़कर रखता है।",
        who_needs_it_en="Retailers, salons, apparel boutiques, clinics, and professional service providers with repeat clientele.",
        who_needs_it_hi="खुदरा विक्रेता, ब्यूटी सैलून, कपड़े की दुकानें, क्लीनिक और नियमित ग्राहकों वाले सेवा केंद्र।",
        when_to_adopt_en="Adopt when your customer base exceeds 500+ individual clients.",
        when_to_adopt_hi="जब आपके पास 500 से अधिक ग्राहकों की सूची तैयार हो जाए।",
        prerequisites_en=["Mobile numbers collected during billing with customer consent", "WhatsApp Business API or CRM software"],
        prerequisites_hi=["बिलिंग के समय ग्राहक की सहमति से मोबाइल नंबर संग्रह", "व्हाट्सएप बिजनेस एपीआई या सीआरएम टूल"],
        complexity="Medium",
        implementation_steps_en=[
            "Mandate phone number entry at checkout with opt-in for discount alerts.",
            "Segment customers into 3 buckets: VIP (Top 20%), Regular, and Inactive (>60 days no visit).",
            "Set up automated WhatsApp greetings on customer birthdays with an exclusive 10% coupon.",
            "Launch a win-back campaign for customers who haven't visited in 90 days.",
        ],
        implementation_steps_hi=[
            "बिलिंग के समय ग्राहक की सहमति से मोबाइल नंबर दर्ज करें।",
            "ग्राहकों को 3 वर्गों में बांटें: वीआईपी (शीर्ष 20%), नियमित और निष्क्रिय (60 दिन से न आए हों)।",
            "जन्मदिन पर स्वचालित व्हाट्सएप संदेश और 10% डिस्काउंट कूपन भेजें।",
            "90 दिन से न आने वाले ग्राहकों को वापस बुलाने के लिए विशेष संदेश भेजें।",
        ],
        common_mistakes_en=[
            "Spamming customers with daily promotional messages causing them to block your number.",
            "Failing to honor promised loyalty points or discounts at counter.",
        ],
        common_mistakes_hi=[
            "ग्राहकों को रोज-रोज फालतू संदेश भेजकर नंबर ब्लॉक करवा लेना।",
            "काउंटर पर वादा किए गए लॉयल्टी पॉइंट्स या छूट देने से मुकरना।",
        ],
        expected_benefit_en="Typically increases repeat purchase frequency by 15–20% and lifts customer lifetime value.",
        expected_benefit_hi="पुराने ग्राहकों के दोबारा आने की संभावना 15-20% तक बढ़ सकती है।",
        what_to_measure_en=["Repeat purchase rate", "Inactive customer reactivation count", "Coupon redemption rate"],
        what_to_measure_hi=["दोबारा खरीद की दर", "सक्रिय हुए पुराने ग्राहकों की संख्या", "कूपन उपयोग दर"],
        low_cost_alternative_en="Use WhatsApp Business broadcast lists and Google Contacts tags labeled by visit month.",
        low_cost_alternative_hi="व्हाट्सएप बिजनेस ब्रॉडकास्ट लिस्ट और गूगल कॉन्टैक्ट्स टैग्स का मुफ्त उपयोग करें।",
        next_action_en="Export customer list from billing software and create a VIP customer broadcast group.",
        next_action_hi="बिलिंग सॉफ्टवेयर से ग्राहकों की सूची निकालें और वीआईपी ग्राहकों की लिस्ट बनाएं।",
    ),
    LearningFlashcard(
        card_id="CARD-L3-MULTICHANNEL",
        recommendation_code="REC-GROW-01",
        target_level=3,
        topic="Multi-Channel Expansion & ONDC",
        title_en="Multi-Channel Selling & ONDC Network Integration",
        title_hi="मल्टी-चैनल बिक्री एवं ओएनडीसी (ONDC) नेटवर्क एकीकरण",
        what_is_it_en="Listing enterprise products on Open Network for Digital Commerce (ONDC) and regional marketplaces alongside in-store sales.",
        what_is_it_hi="दुकान के साथ-साथ ओएनडीसी नेटवर्क और ई-कॉमर्स प्लेटफॉर्म पर अपने उत्पादों को ऑनलाइन बेचना।",
        why_matters_en="Overcomes physical neighborhood boundaries and allows local MSMEs to sell to city-wide and national buyers without high commissions.",
        why_matters_hi="भौगोलिक सीमाओं से परे जाकर कम कमीशन पर पूरे शहर और देश भर में नए खरीदारों तक पहुंचने का अवसर।",
        who_needs_it_en="Manufacturers, packaged food makers, apparel boutiques, artisans, and specialized retailers.",
        who_needs_it_hi="उत्पादक, पैकेज्ड फूड निर्माता, बुटीक, कारीगर और विशिष्ट उत्पादों के खुदरा व्यापारी।",
        when_to_adopt_en="Adopt when product quality is consistent, barcode/SKU packaging is ready, and shipping logistics are established.",
        when_to_adopt_hi="जब उत्पाद की गुणवत्ता स्थिर हो, बारकोड पैकेजिंग तैयार हो और कूरियर भेजने की व्यवस्था हो।",
        prerequisites_en=["GSTIN and Udyam Registration", "Standard packaging and courier partner account", "Current bank account"],
        prerequisites_hi=["जीएसटी (GSTIN) और उद्यम पंजीकरण", "सुरक्षित पैकेजिंग और कूरियर पार्टनर", "चालू बैंक खाता"],
        complexity="High",
        implementation_steps_en=[
            "Select an approved ONDC Seller App (e.g. Mystore, SellerApp, GrowthFalcons, Magicpin).",
            "Prepare digital catalog with clear product photos, descriptions, weight, and pricing.",
            "Integrate third-party logistics (Shiprocket, Delhivery, Dunzo for local deliveries).",
            "Establish daily dispatch protocol to ship orders within 24 hours of receipt.",
        ],
        implementation_steps_hi=[
            "किसी अधिकृत ओएनडीसी सेलर ऐप (जैसे Mystore, SellerApp या Magicpin) पर रजिस्टर करें।",
            "साफ फोटो, सही वजन, विवरण और कीमत के साथ डिजिटल कैटलॉग बनाएं।",
            "लॉजिस्टिक्स पार्टनर (Shiprocket या Delhivery) जोड़ें।",
            "ऑर्डर आने के 24 घंटे के भीतर पार्सल भेजने की दैनिक व्यवस्था बनाएं।",
        ],
        common_mistakes_en=[
            "Listing products that are out of stock in the physical shop.",
            "Poor packaging causing product breakage during transit.",
        ],
        common_mistakes_hi=[
            "दुकान में खत्म हो चुके सामान को ऑनलाइन लिस्ट रखना।",
            "कमजोर पैकेजिंग जिससे रास्ते में सामान टूट-फूट जाए।",
        ],
        expected_benefit_en="May expand addressable customer reach beyond walking distance and generate an additional 10–30% revenue stream.",
        expected_benefit_hi="स्थानीय क्षेत्र से बाहर 10-30% अतिरिक्त ऑनलाइन बिक्री की संभावना।",
        what_to_measure_en=["Online order fulfillment rate", "Transit return / RTO percentage", "Net channel margin"],
        what_to_measure_hi=["ऑर्डर पूर्ति दर", "रिटर्न / आरटीओ प्रतिशत", "ऑनलाइन बिक्री पर शुद्ध मुनाफा"],
        low_cost_alternative_en="Start with local hyperlocal delivery via WhatsApp Business catalog and Dunzo/Porter delivery within 5km.",
        low_cost_alternative_hi="शुरुआत में व्हाट्सएप कैटलॉग और स्थानीय डिलीवरी (Dunzo/Porter) से 5 किमी दायरे में बिक्री करें।",
        next_action_en="Register your enterprise on the official ONDC seller portal and onboard 10 hero products.",
        next_action_hi="आधिकारिक ओएनडीसी सेलर पोर्टल पर रजिस्टर करें और अपने 10 मुख्य उत्पाद लिस्ट करें।",
    ),
    LearningFlashcard(
        card_id="CARD-L3-SECURITY",
        recommendation_code="REC-SEC-01",
        target_level=3,
        topic="Cybersecurity & Business Continuity",
        title_en="Role-Based Access Control, Cloud Backups & Ransomware Defense",
        title_hi="सुरक्षित भूमिका-आधारित एक्सेस और क्लाउड बैकअप",
        what_is_it_en="Implementing individual employee logins with restricted permissions and daily automated off-site cloud backups of accounting data.",
        what_is_it_hi="कर्मचारियों के लिए अलग लॉगिन व सीमित अधिकार और लेखांकन डेटा का दैनिक स्वचालित क्लाउड बैकअप।",
        why_matters_en="Hard drive crashes, stolen laptops, and staff tampering can permanently destroy years of credit records and tax filings.",
        why_matters_hi="हार्ड ड्राइव खराब होने, लैपटॉप चोरी या डेटा से छेड़छाड़ से सालों का हिसाब-किताब हमेशा के लिए नष्ट हो सकता है।",
        who_needs_it_en="All enterprises with 3+ staff members using computers, billing machines, or financial software.",
        who_needs_it_hi="3 से अधिक कर्मचारियों वाले वे सभी व्यवसाय जो कंप्यूटर या बिलिंग सॉफ्टवेयर का उपयोग करते हैं।",
        when_to_adopt_en="Adopt immediately when employee count grows beyond immediate family members.",
        when_to_adopt_hi="जैसे ही परिवार से बाहर के कर्मचारी कंप्यूटर या बिलिंग संभालने लगें।",
        prerequisites_en=["Licensed antivirus / Windows Defender updated", "Cloud storage account (Google One or OneDrive)"],
        prerequisites_hi=["अपडेटेड एंटीवायरस या विंडोज डिफेंडर", "क्लाउड स्टोरेज अकाउंट (गूगल ड्राइव या वनड्राइव)"],
        complexity="Medium",
        implementation_steps_en=[
            "Create separate standard Windows/ERP user accounts for staff (never give Administrator access).",
            "Enable Two-Factor Authentication (2FA) on owner email, GST portal, and banking logins.",
            "Configure automatic daily scheduled cloud backup for Tally / Vyapar / Marg data folders.",
            "Conduct quarterly test restoration to ensure backup files can actually be opened.",
        ],
        implementation_steps_hi=[
            "स्टाफ के लिए अलग यूजर अकाउंट बनाएं (उन्हें एडमिन अधिकार कभी न दें)।",
            "मालिक के ईमेल, जीएसटी और नेट बैंकिंग पर टू-फैक्टर ऑथेंटिकेशन (2FA) चालू करें।",
            "टैली या बिलिंग डेटा का रोजाना अपने आप गूगल ड्राइव/वनड्राइव पर बैकअप सेट करें।",
            "हर 3 महीने में बैकअप फाइल को खोलकर चेक करें कि डेटा सुरक्षित बहाल हो रहा है या नहीं।",
        ],
        common_mistakes_en=[
            "Keeping the only backup on a USB thumb drive plugged into the same computer.",
            "Sharing master admin passwords with temporary billing operators.",
        ],
        common_mistakes_hi=[
            "एकमात्र बैकअप उसी कंप्यूटर में लगी पेन ड्राइव में रखना।",
            "अस्थायी बिलिंग ऑपरेटरों को मुख्य एडमिन पासवर्ड बता देना।",
        ],
        expected_benefit_en="Protects enterprise solvency by guaranteeing rapid 2-hour business recovery in case of system hardware failure.",
        expected_benefit_hi="कंप्यूटर खराब या चोरी होने पर भी 2 घंटे के भीतर पूरा हिसाब-किताब सुरक्षित बहाल करने की गारंटी।",
        what_to_measure_en=["Last verified backup timestamp", "Zero data loss events per year", "2FA active status on all bank accounts"],
        what_to_measure_hi=["अंतिम सत्यापित बैकअप का समय", "वार्षिक शून्य डेटा हानि", "बैंक खातों पर 2FA सक्रियता"],
        low_cost_alternative_en="Use free Google Drive for Desktop to automatically sync your Tally backup folder at 8:00 PM daily.",
        low_cost_alternative_hi="मुफ्त गूगल ड्राइव ऐप डाउनलोड करें और रोजाना रात 8 बजे टैली बैकअप फोल्डर का ऑटो-सिंक सेट करें।",
        next_action_en="Turn on 2FA on your primary Gmail and set up an automatic cloud backup for your billing data tonight.",
        next_action_hi="आज ही अपने मुख्य ईमेल पर 2FA चालू करें और बिलिंग डेटा का क्लाउड बैकअप सेट करें।",
    ),
]


def get_all_flashcards() -> List[LearningFlashcard]:
    """Return complete flashcards catalog."""
    return FLASHCARDS_CATALOG


def get_flashcards_by_level(level: int) -> List[LearningFlashcard]:
    """Retrieve flashcards targeted to a specific digitalization level."""
    return [c for c in FLASHCARDS_CATALOG if c.target_level == level]


def get_flashcard_for_recommendation(rec_code: str) -> Optional[LearningFlashcard]:
    """Retrieve flashcard linked to a specific recommendation code."""
    for c in FLASHCARDS_CATALOG:
        if c.recommendation_code == rec_code:
            return c
    return None


def get_flashcard_by_id(card_id: str) -> Optional[LearningFlashcard]:
    """Retrieve flashcard by its unique card ID."""
    for c in FLASHCARDS_CATALOG:
        if c.card_id == card_id:
            return c
    return None
