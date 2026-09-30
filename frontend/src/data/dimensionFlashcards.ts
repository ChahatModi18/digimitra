export interface DimensionFlashcard {
  code: string;
  nameEn: string;
  nameHi: string;
  taglineEn: string;
  taglineHi: string;
  category: "Foundational" | "Operational" | "Strategic Growth";
  weight: number;
  descriptionEn: string;
  descriptionHi: string;
  levelMilestones: {
    level0En: string;
    level0Hi: string;
    level1En: string;
    level1Hi: string;
    level2En: string;
    level2Hi: string;
    level3En: string;
    level3Hi: string;
  };
  recommendedTools: { name: string; type: string; freeTier: boolean }[];
  expectedRoiEn: string;
  expectedRoiHi: string;
  riskAndSecurityEn: string;
  riskAndSecurityHi: string;
  quickActionEn: string;
  quickActionHi: string;
}

export const DIMENSION_FLASHCARDS: Record<string, DimensionFlashcard> = {
  infra: {
    code: "infra",
    nameEn: "Digital Infrastructure & Hardware",
    nameHi: "डिजिटल बुनियादी ढांचा व हार्डवेयर",
    taglineEn: "The foundation of all digital operations in your shop or workshop.",
    taglineHi: "आपकी दुकान या वर्कशॉप के सभी डिजिटल संचालन की मूल नींव।",
    category: "Foundational",
    weight: 1.2,
    descriptionEn:
      "Evaluates basic computing hardware, reliable high-speed broadband/4G connectivity, backup power, barcode scanners, and point-of-sale terminals required for uninterrupted daily transactions.",
    descriptionHi:
      "दुकान या कारखाने में सुचारू संचालन हेतु आवश्यक स्मार्टफोन, ब्रॉडबैंड/4G इंटरनेट, बारकोड स्कैनर, पीओएस टर्मिनल और पावर बैकअप की तत्परता का मूल्यांकन।",
    levelMilestones: {
      level0En: "Manual pen-and-paper; intermittent mobile data without dedicated business hardware.",
      level0Hi: "कागज़-कलम पर निर्भर; व्यक्तिगत मोबाइल इंटरनेट, कोई समर्पित व्यावसायिक उपकरण नहीं।",
      level1En: "Dedicated smartphone/tablet, dual-SIM/Wi-Fi, and basic thermal receipt printer.",
      level1Hi: "समर्पित व्यावसायिक स्मार्टफोन/टैबलेट, वाई-फाई और बेसिक थर्मल रसीद प्रिंटर।",
      level2En: "Desktop/laptop POS terminal with barcode scanner, UPS power backup, and optical broadband.",
      level2Hi: "डेस्कटॉप/लैपटॉप पीओएस टर्मिनल, बारकोड स्कैनर, यूपीएस पावर बैकअप और ब्रॉडबैंड।",
      level3En: "Connected multi-device terminals, automated cloud sync, and redundant network failover.",
      level3Hi: "मल्टी-डिवाइस क्लाउड सिंक टर्मिनल और निर्बाध बैकअप इंटरनेट नेटवर्क।",
    },
    recommendedTools: [
      { name: "Dual-SIM 4G/5G Router", type: "Connectivity", freeTier: false },
      { name: "Handheld Bluetooth Thermal Printer", type: "Hardware", freeTier: false },
      { name: "Mini UPS for Wi-Fi Router", type: "Power Backup", freeTier: false },
    ],
    expectedRoiEn: "Zero sales lost due to connectivity drops; 40% faster checkout times during peak hours.",
    expectedRoiHi: "इंटरनेट कटने से होने वाले नुकसान में 100% कमी; व्यस्त समय में ग्राहकों की बिलिंग 40% तेज।",
    riskAndSecurityEn: "Always secure router admin passwords and avoid connecting business billing devices to public Wi-Fi.",
    riskAndSecurityHi: "राउटर का डिफॉल्ट पासवर्ड तुरंत बदलें और बिलिंग डिवाइस को असुरक्षित सार्वजनिक वाई-फाई से न जोड़ें।",
    quickActionEn: "Install a mini-UPS power backup for your shop's Wi-Fi router to prevent payment drops.",
    quickActionHi: "दुकान के वाई-फाई राउटर के लिए 1,500 रुपये का मिनी-यूपीएस लगाएं ताकि बिजली जाने पर भी ऑनलाइन भुगतान जारी रहे।",
  },

  literacy: {
    code: "literacy",
    nameEn: "Digital Literacy & Skills",
    nameHi: "डिजिटल साक्षरता व स्टाफ कौशल",
    taglineEn: "Empowering owners and floor staff to use digital tools safely and confidently.",
    taglineHi: "स्टाफ और मालिक को डिजिटल टूल्स के सुरक्षित व कुशल उपयोग में सक्षम बनाना।",
    category: "Foundational",
    weight: 1.1,
    descriptionEn:
      "Assesses the digital competence of owners and counter staff in handling online billing apps, customer messaging, safe password hygiene, and basic digital fraud awareness.",
    descriptionHi:
      "स्टाफ द्वारा डिजिटल बिलिंग ऐप चलाने, सुरक्षित पासवर्ड रखने और ऑनलाइन धोखाधड़ी (फ्रॉड) से बचने की समझ व कुशलता का आकलन।",
    levelMilestones: {
      level0En: "Staff unfamiliar with business apps; sole reliance on memory or paper chits.",
      level0Hi: "स्टाफ को ऐप्स की जानकारी नहीं; पूरी तरह कागज़ की पर्चियों पर निर्भर।",
      level1En: "Owner and key staff can generate UPI QR codes and enter basic sales into an app.",
      level1Hi: "मालिक और मुख्य स्टाफ यूपीआई क्यूआर और ऐप में दैनिक बिक्री दर्ज कर सकते हैं।",
      level2En: "All counter staff trained on barcode billing, return processing, and GST invoice generation.",
      level2Hi: "सभी कर्मचारी बारकोड स्कैनिंग, बिलिंग और जीएसटी इनवॉइस बनाने में दक्ष।",
      level3En: "Continuous role-based digital SOPs, anti-phishing drills, and onboarding video modules.",
      level3Hi: "डिजिटल संचालन की लिखित प्रक्रिया (SOP) और साइबर सुरक्षा प्रशिक्षण।",
    },
    recommendedTools: [
      { name: "Digital Saksharta Abhiyan (PMGDisha)", type: "Government Course", freeTier: true },
      { name: "App Vendor Video Tutorials (Hindi)", type: "Training", freeTier: true },
      { name: "Bitwarden / Password Manager", type: "Security", freeTier: true },
    ],
    expectedRoiEn: "Reduces billing input errors by 75% and prevents catastrophic account takeover frauds.",
    expectedRoiHi: "बिलिंग गलतियों में 75% कमी और साइबर धोखाधड़ी व पासवर्ड चोरी से पूर्ण सुरक्षा।",
    riskAndSecurityEn: "Never write passwords in open diaries or share bank OTPs with callers claiming to be bank reps.",
    riskAndSecurityHi: "पासवर्ड डायरी में खुला न लिखें और बैंक या डिलीवरी एजेंट बनकर आने वाले किसी भी व्यक्ति से ओटीपी साझा न करें।",
    quickActionEn: "Conduct a 15-minute weekly staff training on common UPI scam awareness and PIN privacy.",
    quickActionHi: "स्टाफ के साथ 15 मिनट का साप्ताहिक सत्र रखें जिसमें फर्जी क्यूआर और पेमेंट फ्रॉड से बचाव सिखाएं।",
  },

  presence: {
    code: "presence",
    nameEn: "Online Presence & Local Discovery",
    nameHi: "ऑनलाइन उपस्थिति व स्थानीय खोज",
    taglineEn: "Make sure nearby customers easily find your shop, timings, and contact numbers on Google Maps.",
    taglineHi: "आस-पास के ग्राहकों को गूगल मैप्स पर आपकी दुकान, समय और फोन नंबर आसानी से मिले।",
    category: "Operational",
    weight: 1.0,
    descriptionEn:
      "Tracks verified Google Business Profile setup, accurate shop location pins, up-to-date working hours, catalog photos, customer reviews, and local social discoverability.",
    descriptionHi:
      "गूगल बिजनेस प्रोफाइल सत्यापन, गूगल मैप्स पर सटीक लोकेशन, खुलने-बंद होने का सही समय, फोटो और ग्राहक समीक्षाओं का प्रबंधन।",
    levelMilestones: {
      level0En: "No online listing; nearby residents cannot discover business hours or phone number.",
      level0Hi: "इंटरनेट पर कोई लिस्टिंग नहीं; स्थानीय लोग दुकान का पता या नंबर ऑनलाइन नहीं खोज पाते।",
      level1En: "Claimed Google Business Profile with verified phone number, shop photo, and working hours.",
      level1Hi: "गूगल मैप्स पर सत्यापित प्रोफाइल, दुकान की स्पष्ट फोटो और काम के सही घंटे।",
      level2En: "Weekly photo updates, 20+ verified customer reviews with prompt owner replies, and product catalog.",
      level2Hi: "साप्ताहिक फोटो अपडेट, 20+ ग्राहक समीक्षाएं और उत्पाद कैटलॉग लिस्टिंग।",
      level3En: "Unified multi-channel search presence, micro-website with schema markup, and local SEO ranking #1.",
      level3Hi: "वेबसाइट, स्थानीय एसईओ और गूगल लोकल सर्च में शीर्ष 3 स्थानों में निरंतर उपस्थिति।",
    },
    recommendedTools: [
      { name: "Google Business Profile", type: "Local Discovery", freeTier: true },
      { name: "Canva for Business Banners", type: "Design", freeTier: true },
      { name: "WhatsApp Catalog Link", type: "Catalog", freeTier: true },
    ],
    expectedRoiEn: "30-50% increase in inbound walk-in visits and phone inquiries from nearby shoppers.",
    expectedRoiHi: "स्थानीय ग्राहकों के सीधे फोन कॉल और दुकान पर आने वाले ग्राहकों (फुटफॉल) में 30-50% की वृद्धि।",
    riskAndSecurityEn: "Beware of fake callers demanding money to 'renew' your free Google Maps listing.",
    riskAndSecurityHi: "गूगल मैप्स लिस्टिंग पूरी तरह मुफ्त है; इसे 'रिन्यू' करने के नाम पर पैसे मांगने वाले ठगों से सावधान रहें।",
    quickActionEn: "Claim and verify your Google Business Profile today and upload 5 clear photos of your storefront.",
    quickActionHi: "आज ही अपनी दुकान का गूगल मैप्स प्रोफाइल वेरिफाई करें और दुकान के सामने व अंदर की 5 साफ फोटो अपलोड करें।",
  },

  comms: {
    code: "comms",
    nameEn: "Customer Communication & Support",
    nameHi: "ग्राहक संवाद व त्वरित सहायता",
    taglineEn: "Turn one-time shoppers into repeat loyal customers using WhatsApp Business and automated replies.",
    taglineHi: "व्हाट्सएप बिजनेस और ऑटोमैटिक मैसेज से नए ग्राहकों को नियमित ग्राहक बनाएं।",
    category: "Operational",
    weight: 1.0,
    descriptionEn:
      "Evaluates dedicated business messaging channels, automated welcome and away messages, product catalog sharing, order status updates, and digital customer relationship management.",
    descriptionHi:
      "समर्पित बिजनेस व्हाट्सएप, ऑटो-रिप्लाई ग्रीटिंग्स, डिजिटल कैटलॉग शेयरिंग और ग्राहकों को ऑर्डर अपडेट भेजने की व्यवस्था।",
    levelMilestones: {
      level0En: "Scattered personal calls/messages; no dedicated business WhatsApp or recorded customer history.",
      level0Hi: "व्यक्तिगत नंबर से बातचीत; कोई व्यावसायिक रिकॉर्ड या ग्राहक सूची नहीं।",
      level1En: "Dedicated WhatsApp Business app with business hours, greeting message, and digital catalog.",
      level1Hi: "व्हाट्सएप बिजनेस ऐप, दुकान का परिचय, कैटलॉग और स्वचालित 'अवे' मैसेज।",
      level2En: "Labels for customer segments (VIP, pending payment), quick replies for common questions, broadcast lists.",
      level2Hi: "कस्टमर लेबल्स (उधार बाकी, वीआईपी), त्वरित जवाब शॉर्टकट और नई आवक के ब्रॉडकास्ट।",
      level3En: "Official WhatsApp Cloud API, automated dispatch notifications, and multi-agent customer chat desk.",
      level3Hi: "व्हाट्सएप बिजनेस क्लाउड एपीआई, ऑटोमैटिक डिलीवरी ट्रैकिंग और सीआरएम इंटीग्रेशन।",
    },
    recommendedTools: [
      { name: "WhatsApp Business App", type: "Messaging", freeTier: true },
      { name: "Wati / Interakt (for Level 3)", type: "WhatsApp API", freeTier: false },
      { name: "Truecaller for Business", type: "Caller ID", freeTier: true },
    ],
    expectedRoiEn: "35% higher repeat purchase rate and 50% faster resolution of customer order inquiries.",
    expectedRoiHi: "ग्राहकों द्वारा दोबारा खरीदारी में 35% वृद्धि और पूछताछ का तुरंत समाधान।",
    riskAndSecurityEn: "Only send promotional updates to customers who opted in to prevent WhatsApp account bans.",
    riskAndSecurityHi: "अनावश्यक स्पैम मैसेज न भेजें; केवल सहमत ग्राहकों को ही ऑफर भेजें ताकि नंबर ब्लॉक न हो।",
    quickActionEn: "Set up 5 Quick Reply shortcuts in WhatsApp Business for your shop's bank UPI ID, location, and catalog.",
    quickActionHi: "व्हाट्सएप बिजनेस में लोकेशन, बैंक विवरण और कैटलॉग के लिए 3 'त्वरित उत्तर' (Quick Replies) सेट करें।",
  },

  records: {
    code: "records",
    nameEn: "Bookkeeping & Financial Records",
    nameHi: "डिजिटल बहीखाता व हिसाब",
    taglineEn: "Replace paper registers with instant digital ledger apps that track cash flow and send payment reminders.",
    taglineHi: "कागजी बहीखाता छोड़कर डिजिटल लेजर अपनाएं, जिससे एक क्लिक पर दैनिक नफा-नुकसान पता चले।",
    category: "Foundational",
    weight: 1.3,
    descriptionEn:
      "Evaluates adoption of digital khata, GST-compliant billing software, real-time expense logging, bank reconciliation, and exportable financial statements needed for MSME bank loans.",
    descriptionHi:
      "डिजिटल खाता, जीएसटी अनुकूल बिलिंग सॉफ्टवेयर, दैनिक खर्च रिकॉर्ड और बैंक ऋण हेतु आवश्यक वित्तीय रिकॉर्ड का मूल्यांकन।",
    levelMilestones: {
      level0En: "Manual paper khata bahi; lost credit records and unrecorded daily cash withdrawals.",
      level0Hi: "हाथ से लिखा बहीखाता; पन्ने फटने या खोने का डर और दैनिक नकद खर्च का हिसाब गायब।",
      level1En: "Smartphone digital ledger app (Vyapar, Khatabook) recording customer credit and sending SMS reminders.",
      level1Hi: "मोबाइल में खाता ऐप; ग्राहकों का उधारी हिसाब और स्वतः एसएमएस तकादा।",
      level2En: "Desktop billing software with GST e-invoicing, profit/loss reports, and automated daily cloud backup.",
      level2Hi: "डेस्कटॉप जीएसटी बिलिंग, दैनिक लाभ-हानि रिपोर्ट और स्वचालित क्लाउड बैकअप।",
      level3En: "Full ERP (TallyPrime/Zoho Books) integrated with connected banking and automated TDS/GST filings.",
      level3Hi: "पूर्ण ईआरपी (टैली/ज़ोहो बुक्स), बैंक ऑटो-रिकॉन्सिलिएशन और स्वतः जीएसटी रिटर्न।",
    },
    recommendedTools: [
      { name: "Vyapar / myBillBook", type: "Billing & Accounting", freeTier: true },
      { name: "Khatabook / OkCredit", type: "Udhar Ledger", freeTier: true },
      { name: "Zoho Books / TallyPrime", type: "GST Accounting", freeTier: false },
    ],
    expectedRoiEn: "Recovers outstanding customer udhar 3x faster; saves 10-15 hours per month in manual accounting.",
    expectedRoiHi: "बाकी उधारी की 3 गुना तेज वसूली; हर महीने हिसाब-किताब में 15 घंटे की बचत।",
    riskAndSecurityEn: "Always enable daily cloud Google Drive backup in your billing app to protect against phone theft or damage.",
    riskAndSecurityHi: "बिलिंग ऐप में दैनिक गूगल ड्राइव बैकअप चालू रखें ताकि फोन खराब होने पर भी रिकॉर्ड सुरक्षित रहे।",
    quickActionEn: "Switch to a mobile GST billing app to generate professional PDF invoices directly on WhatsApp.",
    quickActionHi: "व्यापार या मायबिलबुक ऐप डाउनलोड कर ग्राहकों को व्हाट्सएप पर सीधे पेशेवर पीडीएफ बिल भेजना शुरू करें।",
  },

  payments: {
    code: "payments",
    nameEn: "Payment Systems & Cashless Operations",
    nameHi: "डिजिटल भुगतान प्रणाली",
    taglineEn: "Fast, contactless payments with audio confirmation soundboxes and instant bank settlements.",
    taglineHi: "बिना नकद के आसान लेन-देन, साउंडबॉक्स से तुरंत पुष्टि और सीधे बैंक खाते में भुगतान।",
    category: "Foundational",
    weight: 1.2,
    descriptionEn:
      "Measures acceptance of dynamic and static UPI QR codes, audio soundbox devices, card POS terminals, digital payment links, and automated next-day bank settlement reconciliation.",
    descriptionHi:
      "दुकान पर यूपीआई क्यूआर कोड, ऑडियो साउंडबॉक्स, डेबिट/क्रेडिट कार्ड स्वाइप मशीन और सीधे बैंक खाते में सेटलमेंट का स्तर।",
    levelMilestones: {
      level0En: "Cash only; losing sales when customers do not have exact currency change.",
      level0Hi: "केवल नकद; छुट्टे पैसे न होने या ग्राहक के पास कैश न होने से बिक्री का नुकसान।",
      level1En: "Static UPI QR standee on the counter linked to the proprietor's bank account.",
      level1Hi: "काउंटर पर बैंक यूपीआई क्यूआर स्टैंडी; ग्राहक द्वारा स्क्रीन दिखाने पर भरोसा।",
      level2En: "Dual-language voice soundbox (Paytm/PhonePe) confirming instant payment receipt; card POS terminal.",
      level2Hi: "आवाज वाला साउंडबॉक्स (हिंदी/अंग्रेजी) जो फर्जी स्क्रीनशॉट धोखाधड़ी से पूरी सुरक्षा दे।",
      level3En: "Dynamic QR printed directly on thermal POS receipts; automated settlement reconciliation with ERP.",
      level3Hi: "बिल पर स्वतः छपने वाला डायनामिक क्यूआर और बैंक खाते का स्वचालित मिलान।",
    },
    recommendedTools: [
      { name: "Paytm / PhonePe Soundbox", type: "Audio Confirmation", freeTier: false },
      { name: "BharatPe Zero-MDR QR", type: "UPI Standee", freeTier: true },
      { name: "Pine Labs / Mosambee Micro-POS", type: "Card Swiping", freeTier: false },
    ],
    expectedRoiEn: "Completely eliminates fake payment screenshot scams; increases average ticket size by 25%.",
    expectedRoiHi: "फर्जी स्क्रीनशॉट ठगी पूरी तरह समाप्त; ऑनलाइन भुगतान से ग्राहक द्वारा 25% अधिक खरीदारी।",
    riskAndSecurityEn: "Never trust a customer's phone screen showing 'Payment Successful'; always wait for your own soundbox or SMS.",
    riskAndSecurityHi: "ग्राहक के फोन का 'सक्सेस' स्क्रीनशॉट देखकर सामान न दें; हमेशा अपने साउंडबॉक्स या बैंक एसएमएस की पुष्टि पर ही भरोसा करें।",
    quickActionEn: "Deploy an audio soundbox at your counter to eliminate payment verification bottlenecks.",
    quickActionHi: "काउंटर पर तुरंत एक साउंडबॉक्स लगाएं ताकि भीड़ के समय भी हर एक भुगतान की आवाज सुनकर पुष्टि हो सके।",
  },

  inventory: {
    code: "inventory",
    nameEn: "Inventory Operations & Stock Control",
    nameHi: "स्टॉक व इन्वेंट्री प्रबंधन",
    taglineEn: "Prevent stock-outs of bestsellers and identify slow-moving dead inventory before expiry.",
    taglineHi: "ज्यादा बिकने वाले सामान की कमी न होने दें और बिक न रहे सामान की पहले से पहचान करें।",
    category: "Operational",
    weight: 1.1,
    descriptionEn:
      "Assesses barcode-based stock intake, minimum stock threshold alerts, batch tracking, expiry date monitoring, automated reorder triggers, and supplier purchase management.",
    descriptionHi:
      "बारकोड द्वारा माल की आमद, न्यूनतम स्टॉक अलर्ट, एक्सपायरी तारीख निगरानी और सप्लायर से नया माल मंगाने का डिजिटल सिस्टम।",
    levelMilestones: {
      level0En: "Visual estimation only; frequently running out of high-demand items or finding expired stock.",
      level0Hi: "केवल आंखों से देखकर अंदाजा लगाना; अक्सर सामान खत्म होना या एक्सपायर होकर खराब होना।",
      level1En: "Basic spreadsheet or mobile app tracking top 20 fast-moving items with manual periodic counts.",
      level1Hi: "मोबाइल में मुख्य 20 उत्पादों की सूची और समय-समय पर स्टॉक की हाथ से गिनती।",
      level2En: "Barcode scanning for stock in/out with automated low-stock warnings and purchase order generation.",
      level2Hi: "बारकोड स्कैनर से बिक्री और माल आमद; स्टॉक कम होते ही फोन पर स्वचालित चेतावनी।",
      level3En: "Multi-warehouse FIFO inventory, supplier lead-time forecasting, and automated stock reordering.",
      level3Hi: "मल्टी-लोकेशन स्टॉक ट्रैकिंग, सप्लाई चेन पूर्वानुमान और स्वतः परचेस ऑर्डर जारी होना।",
    },
    recommendedTools: [
      { name: "Vyapar Inventory Module", type: "Barcode Stock", freeTier: true },
      { name: "QuickSell / StockEdge", type: "Catalog & Stock", freeTier: true },
      { name: "Zebra / TVS Handheld Barcode Scanner", type: "Hardware", freeTier: false },
    ],
    expectedRoiEn: "Reduces tied-up capital in dead stock by 30% and eliminates emergency out-of-stock lost sales.",
    expectedRoiHi: "फंसे हुए पुराने माल में 30% की कमी और ग्राहक को सामान न मिलने से होने वाले नुकसान से मुक्ति।",
    riskAndSecurityEn: "Always reconcile physical shelf inventory with digital app counts on the last Sunday of every month.",
    riskAndSecurityHi: "महीने के अंत में भौतिक दुकान के सामान का ऐप में दर्ज स्टॉक से मिलान अवश्य करें।",
    quickActionEn: "Add minimum stock alert levels (e.g. alert when < 5 units remain) to your top 10 bestselling items.",
    quickActionHi: "अपने 10 सबसे अधिक बिकने वाले उत्पादों पर 'न्यूनतम स्टॉक चेतावनी' सेट करें ताकि समय पर नया माल मंगवाया जा सके।",
  },

  analytics: {
    code: "analytics",
    nameEn: "Data & Sales Analytics",
    nameHi: "डेटा व बिक्री विश्लेषण",
    taglineEn: "Make smart business decisions backed by real sales figures rather than guesswork.",
    taglineHi: "अंदाजे के बजाय वास्तविक बिक्री आंकड़ों और लाभ रिपोर्ट के आधार पर सही व्यावसायिक निर्णय लें।",
    category: "Strategic Growth",
    weight: 1.0,
    descriptionEn:
      "Measures tracking of peak sales hours, customer retention rates, profit margin per category, fast vs dead-stock analysis, and seasonal demand forecasting.",
    descriptionHi:
      "दैनिक बिक्री के सबसे व्यस्त घंटे, नियमित ग्राहकों की पहचान, उत्पाद अनुसार वास्तविक मुनाफा और मौसमी मांग का विश्लेषण।",
    levelMilestones: {
      level0En: "No analytics; owner relies purely on intuition and cash box balance at end of day.",
      level0Hi: "कोई विश्लेषण नहीं; केवल दिन के अंत में गल्ले में बची नकदी देखकर मुनाफे का अंदाजा।",
      level1En: "Monthly sales summary reviewing total revenue, gross profit, and top 5 customer accounts.",
      level1Hi: "मासिक बिक्री रिपोर्ट; कुल आय, कच्चा मुनाफा और शीर्ष 5 ग्राहकों का विवरण।",
      level2En: "Category-wise profit margin reports, slow-moving dead inventory alerts, and customer purchase frequency.",
      level2Hi: "श्रेणी अनुसार लाभ प्रतिशत रिपोर्ट और पिछले 60 दिनों से न बिके सामान की विस्तृत सूची।",
      level3En: "Predictive demand forecasting, customer lifetime value (CLV) cohort analysis, and automated BI dashboards.",
      level3Hi: "बिजनेस इंटेलिजेंस (BI) डैशबोर्ड, मौसमी मांग की अग्रिम भविष्यवाणी और ग्राहक वफादारी विश्लेषण।",
    },
    recommendedTools: [
      { name: "Google Sheets / Excel Templates", type: "Spreadsheet Analytics", freeTier: true },
      { name: "Metabase (Self-hosted BI)", type: "Business Intelligence", freeTier: true },
      { name: "Zoho Analytics MSME Plan", type: "Cloud BI", freeTier: false },
    ],
    expectedRoiEn: "Improves overall gross profit margin by 3-5% by pruning zero-margin items and prioritizing high-margin bundles.",
    expectedRoiHi: "कम मुनाफे वाले उत्पादों को हटाकर और अच्छे मार्जिन वाले सामान बढ़ाकर कुल मुनाफे में 3-5% की शुद्ध बढ़ोतरी।",
    riskAndSecurityEn: "Keep financial reports confidential; grant dashboard access only to authenticated management.",
    riskAndSecurityHi: "वित्तीय और मुनाफे के आंकड़ों को सुरक्षित रखें; केवल अधिकृत मालिक या साझेदार को ही इसकी अनुमति दें।",
    quickActionEn: "Review your top 5 most profitable items this week and negotiate volume discounts with their suppliers.",
    quickActionHi: "इस हफ्ते अपनी दुकान के सबसे ज्यादा मुनाफा देने वाले 5 उत्पादों की सूची निकालें और सप्लायर से बेहतर रेट तय करें।",
  },

  growth: {
    code: "growth",
    nameEn: "Marketplaces & Strategic Growth",
    nameHi: "मार्केटप्लेस व व्यापार विस्तार",
    taglineEn: "Expand your reach across India through ONDC, GeM government procurement, and digital marketing.",
    taglineHi: "ओएनडीसी, सरकारी जेम पोर्टल और डिजिटल मार्केटिंग से अपने शहर के बाहर पूरे देश में ग्राहक बनाएं।",
    category: "Strategic Growth",
    weight: 1.1,
    descriptionEn:
      "Assesses readiness and active listing on Open Network for Digital Commerce (ONDC), Government e-Marketplace (GeM), B2B portals (IndiaMART), and targeted hyperlocal social media advertising.",
    descriptionHi:
      "ओएनडीसी (ONDC) पर बिना कमीशन बिक्री, सरकारी खरीद पोर्टल (GeM), इंडियामार्ट और सोशल मीडिया प्रचार के माध्यम से व्यापार विस्तार।",
    levelMilestones: {
      level0En: "100% dependent on local physical footfall; zero reach to buyers outside immediate neighborhood.",
      level0Hi: "केवल दुकान के सामने से गुजरने वाले ग्राहकों पर निर्भर; शहर या राज्य से बाहर कोई बिक्री नहीं।",
      level1En: "Catalog published on WhatsApp and social media; registered on at least one B2B directory.",
      level1Hi: "सोशल मीडिया पर कैटलॉग और किसी एक व्यापारिक डायरेक्टरी (जैसे इंडियामार्ट) पर लिस्टिंग।",
      level2En: "Onboarded as an active seller on ONDC network with integrated local delivery and UPI payments.",
      level2Hi: "ओएनडीसी (ONDC) सेलर नेटवर्क पर लाइव उत्पाद लिस्टिंग और स्थानीय डिलीवरी की व्यवस्था।",
      level3En: "GeM government procurement vendor with active contract bids, multi-marketplace sync, and omnichannel fulfillment.",
      level3Hi: "सरकारी जेम पोर्टल पर पंजीकृत सप्लायर और सभी ऑनलाइन पोर्टल्स का केंद्रीकृत प्रबंधन।",
    },
    recommendedTools: [
      { name: "ONDC Seller Apps (Mystore / SellerApp)", type: "Open E-Commerce", freeTier: true },
      { name: "GeM Government e-Marketplace", type: "Govt Procurement", freeTier: true },
      { name: "Meta Business Suite", type: "Local Ads", freeTier: true },
    ],
    expectedRoiEn: "Opens brand-new revenue streams with 20-40% additional orders from outside your physical locality.",
    expectedRoiHi: "दुकान के दायरे से बाहर नए ग्राहकों से 20-40% अतिरिक्त ऑर्डर और बिना भारी कमीशन के सीधा व्यापार।",
    riskAndSecurityEn: "Verify buyer credibility on large credit orders; always collect advances or use secure escrow.",
    riskAndSecurityHi: "दूर-दराज के बड़े ऑर्डरों में पहले एडवांस पेमेंट या सुरक्षित माध्यमों का उपयोग करें ताकि धोखाधड़ी से बचाव हो।",
    quickActionEn: "Register your business catalog on an ONDC seller application (e.g. Mystore) to start selling digitally with minimal commissions.",
    quickActionHi: "ओएनडीसी (ONDC) सेलर ऐप पर अपनी दुकान रजिस्टर करें ताकि पूरे देश के खरीदार आपको सीधे ऑर्डर दे सकें।",
  },
};
