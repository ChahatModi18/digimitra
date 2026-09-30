"""Comprehensive MSME Sector and Business Category Taxonomy.

Organized hierarchically: Sector -> Category -> Subcategory.
Contains bilingual names (English/Hindi), descriptions, typical needs,
typical tools, and typical digitalization pathways.
"""

from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field


@dataclass
class TaxonomyNode:
    sector_code: str
    category_code: str
    subcategory_code: str
    display_name_en: str
    display_name_hi: str
    description_en: str
    description_hi: str
    typical_needs: List[str] = field(default_factory=list)
    typical_tools: List[str] = field(default_factory=list)
    typical_digitalization_paths: List[str] = field(default_factory=list)


SECTORS: Dict[str, Dict[str, str]] = {
    "RETAIL": {"en": "Retail & Trade", "hi": "खुदरा एवं व्यापार"},
    "FOOD_HOSPITALITY": {"en": "Food & Hospitality", "hi": "खाद्य एवं आतिथ्य"},
    "SERVICES": {"en": "Services & Maintenance", "hi": "सेवाएं एवं रखरखाव"},
    "HEALTH_WELLNESS": {"en": "Health & Wellness", "hi": "स्वास्थ्य एवं कल्याण"},
    "EDUCATION": {"en": "Education & Training", "hi": "शिक्षा एवं प्रशिक्षण"},
    "MANUFACTURING": {"en": "Manufacturing & Fabrication", "hi": "विनिर्माण एवं निर्माण"},
    "AGRI_RURAL": {"en": "Agriculture & Rural Enterprise", "hi": "कृषि एवं ग्रामीण उद्यम"},
    "PROFESSIONAL": {"en": "Professional & Knowledge Services", "hi": "पेशेवर एवं ज्ञान सेवाएं"},
    "HOME_LOCAL": {"en": "Home & Local Services", "hi": "घरेलू एवं स्थानीय सेवाएं"},
    "CREATIVE_ARTISAN": {"en": "Creative & Artisan Products", "hi": "रचनात्मक एवं कारीगर उत्पाद"},
    "OTHER_MICRO": {"en": "Other Micro Enterprises", "hi": "अन्य सूक्ष्म उद्यम"},
}

TAXONOMY_CATALOG: List[TaxonomyNode] = [
    # ----------------------------------------------------
    # 1. RETAIL
    # ----------------------------------------------------
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="GROCERY",
        subcategory_code="KIRANA",
        display_name_en="Grocery / Kirana",
        display_name_hi="किराना दुकान",
        description_en="Local grocery, provisions, and dry rations retail store",
        description_hi="स्थानीय राशन, किराना और दैनिक उपभोग की दुकान",
        typical_needs=["Fast barcode billing", "Credit/Udhaar ledger tracking", "Inventory stock alerts", "Supplier ordering"],
        typical_tools=["UPI QR", "Khatabook/OkCredit", "Vyapar POS", "WhatsApp Business"],
        typical_digitalization_paths=["Digital Payments", "Digital Ledger", "POS Billing", "WhatsApp Catalog", "Quick Commerce Integration"],
    ),
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="APPAREL",
        subcategory_code="CLOTHING",
        display_name_en="Clothing & Garments",
        display_name_hi="कपड़े एवं वस्त्र",
        description_en="Ready-made garments, ethnic wear, and fabrics retail shop",
        description_hi="तैयार वस्त्र, परिधान और कपड़े की दुकान",
        typical_needs=["Size/color variant tracking", "Seasonal stock clearance", "Customer loyalty retention", "Visual showcase"],
        typical_tools=["Instagram Storefront", "POS software", "UPI Soundbox", "WhatsApp Business"],
        typical_digitalization_paths=["Visual Social Catalog", "Variant Inventory POS", "Loyalty Messaging", "Online Delivery"],
    ),
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="APPAREL",
        subcategory_code="FOOTWEAR",
        display_name_en="Footwear",
        display_name_hi="जूते-चप्पल",
        description_en="Shoes, sandals, and traditional footwear retail shop",
        description_hi="जूते, चप्पल और फुटवियर की दुकान",
        typical_needs=["Size grid inventory", "Brand stock warranty", "Customer loyalty"],
        typical_tools=["UPI QR", "Basic POS", "WhatsApp updates"],
        typical_digitalization_paths=["Digital Billing", "Size Grid Stock Management", "Festive Promotion Broadcasts"],
    ),
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="JEWELLERY",
        subcategory_code="JEWELLERY_STORE",
        display_name_en="Jewellery Store",
        display_name_hi="आभूषण भंडार",
        description_en="Gold, silver, imitation, and gemstone jewellery store",
        description_hi="सोने, चांदी एवं फैंसी आभूषणों का शोरूम",
        typical_needs=["Hallmark tracking", "High-security billing", "Daily metal rate pricing", "Customer KYC records"],
        typical_tools=["Specialized Jewellery ERP", "Biometric CCTV", "WhatsApp VIP Groups"],
        typical_digitalization_paths=["Digital Billing & Invoicing", "Dynamic Gold Rate Screen", "High-Security Cloud Records", "Customer Wishlist App"],
    ),
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="COSMETICS",
        subcategory_code="BEAUTY_RETAIL",
        display_name_en="Cosmetics & Personal Care",
        display_name_hi="प्रसाधन एवं सौंदर्य प्रसाधन",
        description_en="Skin care, cosmetics, fragrances, and personal grooming products",
        description_hi="सौंदर्य प्रसाधन, स्किनकेयर और इत्र की दुकान",
        typical_needs=["Batch & expiry tracking", "Brand cataloguing", "Repeat purchase reminders"],
        typical_tools=["Expiry Tracker POS", "Instagram Reels", "UPI Soundbox"],
        typical_digitalization_paths=["Batch Expiry Tracking", "Loyalty Points", "Social Media Influencer Promotion"],
    ),
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="ELECTRONICS",
        subcategory_code="CONSUMER_ELECTRONICS",
        display_name_en="Electronics & Appliances",
        display_name_hi="इलेक्ट्रॉनिक्स एवं घरेलू उपकरण",
        description_en="Televisions, refrigerators, home appliances, and gadgets",
        description_hi="टीवी, फ्रिज, घरेलू बिजली उपकरण और गैजेट्स की दुकान",
        typical_needs=["Serial number tracking", "Brand warranty registration", "EMI and financing options"],
        typical_tools=["PineLabs/Financing POS", "Brand Warranty Portal", "WhatsApp Support"],
        typical_digitalization_paths=["Serial Barcode Billing", "Digital EMI Integration", "Extended Warranty Tracking"],
    ),
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="ELECTRONICS",
        subcategory_code="MOBILE_ACCESSORIES",
        display_name_en="Mobile Phones & Accessories",
        display_name_hi="मोबाइल एवं एक्सेसरीज",
        description_en="Smartphones, covers, chargers, earphones, and repair accessories",
        description_hi="मोबाइल फोन, कवर, चार्जर और एक्सेसरीज की दुकान",
        typical_needs=["IMEI number tracking", "Rapid accessory replenishment", "Instant recharge services"],
        typical_tools=["IMEI Scanner", "Digital Recharge Portals", "UPI QR"],
        typical_digitalization_paths=["IMEI-linked Invoicing", "Automated Supplier Reordering", "Online Customer Feedback"],
    ),
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="HOME",
        subcategory_code="FURNITURE",
        display_name_en="Furniture",
        display_name_hi="फर्नीचर",
        description_en="Wooden, steel, and modular home/office furniture showroom",
        description_hi="लकड़ी एवं स्टील फर्नीचर शोरूम",
        typical_needs=["Custom dimension quotes", "Delivery scheduling", "Part payment tracking"],
        typical_tools=["Digital Quote Builder", "WhatsApp Catalog", "Google Maps Business Listing"],
        typical_digitalization_paths=["Digital Quotation & Advance Tracking", "Google My Business Reviews", "3D AR Catalogs"],
    ),
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="HOME",
        subcategory_code="HOME_DECOR",
        display_name_en="Home Decor & Furnishing",
        display_name_hi="गृह सज्जा एवं फर्निशिंग",
        description_en="Curtains, lighting, bedsheets, handicrafts, and decorative artifacts",
        description_hi="पर्दे, चादरें, सजावटी सामान और हस्तशिल्प की दुकान",
        typical_needs=["Aesthetic visual catalog", "Seasonal festive bundles", "Online inquiries"],
        typical_tools=["Pinterest/Instagram", "WhatsApp Catalog", "UPI Soundbox"],
        typical_digitalization_paths=["Social Media Showcase", "QR Code Product Tags", "Home Consultation Booking"],
    ),
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="HARDWARE",
        subcategory_code="HARDWARE_STORE",
        display_name_en="Hardware & Tools",
        display_name_hi="हार्डवेयर एवं टूल्स",
        description_en="Pipes, fittings, fasteners, tools, paints, and sanitary ware",
        description_hi="पाइप, फिटिंग, औजार, पेंट और हार्डवेयर सामग्री",
        typical_needs=["Mass SKU management", "Bulk contractor pricing", "Credit ledger tracking"],
        typical_tools=["Tally/Vyapar", "Trade Credit App", "WhatsApp Quote Bot"],
        typical_digitalization_paths=["Barcode Stock Management", "Contractor Ledger App", "WhatsApp Purchase Orders"],
    ),
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="HARDWARE",
        subcategory_code="ELECTRICAL_SHOP",
        display_name_en="Electrical Shop",
        display_name_hi="इलेक्ट्रिकल की दुकान",
        description_en="Wires, switches, LED lighting, fans, and electrical accessories",
        description_hi="तार, स्विच, बल्ब, पंखे और बिजली का सामान",
        typical_needs=["Brand warranty cards", "Electrician commission tracking", "Fast billing"],
        typical_tools=["Vyapar/Tally", "UPI QR", "Digital Invoicing"],
        typical_digitalization_paths=["GST e-Invoicing", "Electrician Referral Tracking", "Digital Inventory Control"],
    ),
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="HEALTHCARE",
        subcategory_code="PHARMACY",
        display_name_en="Pharmacy / Medical Store",
        display_name_hi="दवाइयों की दुकान / मेडिकल स्टोर",
        description_en="Prescription drugs, OTC medicines, and surgical supplies",
        description_hi="दवाइयां और सर्जिकल सामान की मेडिकल दुकान",
        typical_needs=["Drug license compliance", "Batch/expiry management", "Prescription records", "Doctor referral linkage"],
        typical_tools=["Marg ERP", "Swastik Pharma", "WhatsApp Refill Alerts"],
        typical_digitalization_paths=["Mandatory Batch Expiry Billing", "WhatsApp Prescription Ordering", "Automated Stock Low-Alerts"],
    ),
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="BOOKS_STATIONERY",
        subcategory_code="STATIONERY_BOOKS",
        display_name_en="Stationery & Books",
        display_name_hi="स्टेशनरी एवं पुस्तकें",
        description_en="School/college textbooks, notebooks, office stationery, and printing consumables",
        description_hi="स्कूल/कॉलेज की किताबें, कॉपियां और स्टेशनरी",
        typical_needs=["Academic session peak stocking", "Photocopy billing", "School book bundles"],
        typical_tools=["UPI Soundbox", "Basic POS", "School Order Spreadsheets"],
        typical_digitalization_paths=["School Bundle Pre-ordering App", "Digital Payment Integration", "Inventory Replenishment Tracking"],
    ),
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="GENERAL_RETAIL",
        subcategory_code="GIFT_SHOP",
        display_name_en="Gift & Novelty Shop",
        display_name_hi="उपहार एवं खिलौनों की दुकान",
        description_en="Toys, personalized gifts, greeting cards, and party accessories",
        description_hi="खिलौने, गिफ्ट और पार्टी का सामान",
        typical_needs=["Fast turnover tracking", "Gift personalization requests", "Festive promotions"],
        typical_tools=["Instagram", "WhatsApp Catalog", "UPI QR"],
        typical_digitalization_paths=["Customization WhatsApp Orders", "Social Media Campaigns", "Digital Gift Cards"],
    ),
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="AUTOMOTIVE",
        subcategory_code="AUTO_PARTS",
        display_name_en="Auto Parts & Spares",
        display_name_hi="ऑटो स्पेयर पार्ट्स",
        description_en="Two-wheeler, three-wheeler, and commercial vehicle spare parts",
        description_hi="दोपहिया और चार पहिया वाहन के स्पेयर पार्ट्स",
        typical_needs=["Part number catalog search", "Mechanic credit management", "OEM authenticity"],
        typical_tools=["Part Locator App", "Tally/Vyapar", "UPI Soundbox"],
        typical_digitalization_paths=["Part Code Search Database", "Mechanic Loyalty Wallet", "Real-time Supplier Availability"],
    ),
    TaxonomyNode(
        sector_code="RETAIL",
        category_code="AGRICULTURE",
        subcategory_code="AGRI_INPUTS",
        display_name_en="Agricultural Inputs (Seeds, Fertilizer, Pesticide)",
        display_name_hi="कृषि आदान (बीज, खाद, कीटनाशक)",
        description_en="Fertilizers, hybrid seeds, crop protection chemicals, and farming tools",
        description_hi="बीज, खाद, कीटनाशक और कृषि उपकरण की दुकान",
        typical_needs=["Aadhaar DBT subsidy integration", "Batch expiry compliance", "Seasonal farmer credit"],
        typical_tools=["PoS Device (DBT Fertilizer)", "Khatabook", "Farmer WhatsApp Broadcasts"],
        typical_digitalization_paths=["Government DBT Machine Linking", "Crop Advisory SMS/WhatsApp", "Digital Farmer Credit Ledger"],
    ),

    # ----------------------------------------------------
    # 2. FOOD & HOSPITALITY
    # ----------------------------------------------------
    TaxonomyNode(
        sector_code="FOOD_HOSPITALITY",
        category_code="DINE_IN",
        subcategory_code="RESTAURANT_CAFE",
        display_name_en="Restaurant & Cafe",
        display_name_hi="रेस्तरां एवं कैफे",
        description_en="Dine-in multi-cuisine restaurant, cafe, or quick service eatery",
        description_hi="रेस्तरां, कैफे और खानपान प्रतिष्ठान",
        typical_needs=["Table order management (KOT)", "Online aggregator sync (Zomato/Swiggy)", "Raw ingredient recipe costing", "Google reviews"],
        typical_tools=["Petpooja/POSist", "Zomato/Swiggy Merchant", "Google Business Profile", "UPI Soundbox"],
        typical_digitalization_paths=["Digital QR Menu & KOT", "Aggregator Channel Management", "Customer Feedback Automation", "Inventory Recipe Deduction"],
    ),
    TaxonomyNode(
        sector_code="FOOD_HOSPITALITY",
        category_code="SWEETS_BAKERY",
        subcategory_code="SWEET_SHOP_BAKERY",
        display_name_en="Sweet Shop & Bakery",
        display_name_hi="मिठाई की दुकान एवं बेकरी",
        description_en="Traditional Indian sweets (Mithai), cakes, cookies, and savoury snacks",
        description_hi="मिठाई, नमकीन, केक और बेकरी उत्पाद",
        typical_needs=["Short shelf-life stock management", "Festive bulk gifting orders", "Weighing scale integrated billing"],
        typical_tools=["Weighing Scale POS", "WhatsApp Bulk Order Bot", "UPI QR"],
        typical_digitalization_paths=["Scale-Linked POS Billing", "Advance Festive Gifting Portal", "Freshness Batch Rotation"],
    ),
    TaxonomyNode(
        sector_code="FOOD_HOSPITALITY",
        category_code="QUICK_SERVICE",
        subcategory_code="TEA_SNACK_STALL",
        display_name_en="Tea / Snack Shop & Food Stall",
        display_name_hi="चाय-नाश्ता एवं फूड स्टॉल",
        description_en="Tea stalls, juice corners, chaat counters, and street food kiosks",
        description_hi="चाय की दुकान, जूस सेंटर, चाट और फास्ट फूड स्टॉल",
        typical_needs=["Ultra-fast digital micro-payments", "Audio payment confirmation", "Peak hour speed"],
        typical_tools=["Paytm/PhonePe Soundbox", "Daily Expense Diary App"],
        typical_digitalization_paths=["Soundbox Audio Notifications", "Simple Daily P&L Tracking", "Local Delivery Radius Listing"],
    ),
    TaxonomyNode(
        sector_code="FOOD_HOSPITALITY",
        category_code="CATERING",
        subcategory_code="TIFFIN_CLOUD_KITCHEN",
        display_name_en="Tiffin Service & Cloud Kitchen",
        display_name_hi="टिफिन सेवा एवं क्लाउड किचन",
        description_en="Daily meal subscriptions, student/office lunch deliveries, and delivery-only kitchens",
        description_hi="दैनिक टिफिन सेवा और होम डिलीवरी किचन",
        typical_needs=["Monthly meal subscription tracking", "Daily attendance / pause meals", "Route delivery dispatch"],
        typical_tools=["Subscription Billing App", "WhatsApp Broadcast Groups", "Google Pay Recurring"],
        typical_digitalization_paths=["Automated Subscription Tracking", "Daily Pause/Resume via WhatsApp", "Route Optimization"],
    ),
    TaxonomyNode(
        sector_code="FOOD_HOSPITALITY",
        category_code="LODGING",
        subcategory_code="HOTEL_GUEST_HOUSE",
        display_name_en="Hotel, Guest House & Homestay",
        display_name_hi="होटल, गेस्ट हाउस एवं होमस्टे",
        description_en="Budget hotels, lodgings, family guest houses, and tourist homestays",
        description_hi="होटल, गेस्ट हाउस, धर्मशाला और होमस्टे",
        typical_needs=["Room reservation calendar", "OTA channel sync (MakeMyTrip/Booking)", "Guest identity verification (C-form)", "Review management"],
        typical_tools=["Hotel Channel Manager", "DigiLocker / ID Scanner", "MakeMyTrip Partner", "Google Maps"],
        typical_digitalization_paths=["Online Room Booking Engine", "Digital Check-in KYC", "Direct WhatsApp Booking Promotions", "Review Acceleration"],
    ),

    # ----------------------------------------------------
    # 3. SERVICES & MAINTENANCE
    # ----------------------------------------------------
    TaxonomyNode(
        sector_code="SERVICES",
        category_code="PERSONAL_CARE",
        subcategory_code="SALON_BEAUTY",
        display_name_en="Salon & Beauty Parlour",
        display_name_hi="सैलून एवं ब्यूटी पार्लर",
        description_en="Men's salon, women's beauty parlour, spa, and bridal grooming",
        description_hi="सैलून, ब्यूटी पार्लर और ग्रूमिंग सेंटर",
        typical_needs=["Appointment booking", "Stylist commission calculation", "Client service history", "Bridal package advance tracking"],
        typical_tools=["Schedulista/Fresha", "Instagram Portfolio", "WhatsApp Appointment Reminders"],
        typical_digitalization_paths=["Online Slot Booking", "Customer History & Product Recommendations", "Automated SMS/WhatsApp Reminders"],
    ),
    TaxonomyNode(
        sector_code="SERVICES",
        category_code="GARMENT_SERVICES",
        subcategory_code="TAILORING_LAUNDRY",
        display_name_en="Tailoring, Laundry & Dry Cleaning",
        display_name_hi="सिलाई, लॉन्ड्री एवं ड्राई क्लीनिंग",
        description_en="Custom tailoring, stitching, ironing, and garment dry cleaning",
        description_hi="दर्जी, सिलाई, कपड़े धुलाई और ड्राई क्लीनिंग",
        typical_needs=["Garment measurement records", "Job card tracking", "Delivery ready notifications"],
        typical_tools=["Digital Job Card App", "WhatsApp Notification", "UPI Soundbox"],
        typical_digitalization_paths=["Digital Measurement Record Keeping", "SMS Delivery Alerts", "Barcoded Garment Tags"],
    ),
    TaxonomyNode(
        sector_code="SERVICES",
        category_code="REPAIR",
        subcategory_code="VEHICLE_SERVICE",
        display_name_en="Vehicle Repair & Garage",
        display_name_hi="वाहन सर्विस एवं गैराज",
        description_en="Two-wheeler, car repair workshops, tyre puncture, and battery service",
        description_hi="ऑटो गैराज, बाइक सर्विसिंग और मैकेनिक शॉप",
        typical_needs=["Vehicle service job cards", "Spare parts replacement records", "Next service due reminders"],
        typical_tools=["Garage Management App", "WhatsApp Automated Service Reminders", "UPI QR"],
        typical_digitalization_paths=["Digital Job Card & Estimate", "SMS/WhatsApp Service Due Reminders", "Parts Usage Billing"],
    ),
    TaxonomyNode(
        sector_code="SERVICES",
        category_code="BUSINESS_SERVICES",
        subcategory_code="PRINTING_PHOTO",
        display_name_en="Printing, Xerox & Photography",
        display_name_hi="प्रिंटिंग, फोटोकॉपी एवं फोटोग्राफी",
        description_en="Flex printing, wedding photography, document photocopying, and stationery design",
        description_hi="प्रिंटिंग प्रेस, फोटोकॉपी, लेमिनेशन और फोटोग्राफी स्टूडियो",
        typical_needs=["Large design file exchange", "Event date advance bookings", "Watermarked digital proofs"],
        typical_tools=["Google Drive / WeTransfer", "Canva / Photoshop", "UPI QR"],
        typical_digitalization_paths=["Cloud Client Proofing Gallery", "Digital Order Queue", "Online Booking for Photo Sessions"],
    ),
    TaxonomyNode(
        sector_code="SERVICES",
        category_code="CITIZEN_SERVICES",
        subcategory_code="DIGITAL_SERVICE_CENTRE",
        display_name_en="Digital Service Centre / CSC / e-Mitra",
        display_name_hi="ई-मित्र / सीएससी / जन सेवा केंद्र",
        description_en="Government citizen service kiosks, Aadhaar/PAN updates, and online forms",
        description_hi="ई-मित्र कियोस्क, सीएससी, पैन/आधार और ऑनलाइन सरकारी सेवाएं",
        typical_needs=["High uptime internet & power", "Multiple government portal credentials", "Fast receipt generation"],
        typical_tools=["e-Mitra / CSC Portal", "Biometric Scanner", "Laser Receipt Printer"],
        typical_digitalization_paths=["Multi-Service Dashboard", "Automated Token Management", "Citizen SMS Status Alerts"],
    ),
    TaxonomyNode(
        sector_code="SERVICES",
        category_code="LOGISTICS",
        subcategory_code="COURIER_DELIVERY",
        display_name_en="Courier & Delivery Services",
        display_name_hi="कूरियर एवं पार्सल डिलीवरी",
        description_en="Local parcel delivery, interstate courier franchises, and cargo logistics",
        description_hi="कूरियर सेवा, पार्सल बुकिंग और माल परिवहन केंद्र",
        typical_needs=["Consignment tracking numbers", "Weight/dimension pricing calculation", "Proof of delivery (POD) capture"],
        typical_tools=["Carrier Tracking API", "Barcode Scanner", "Digital Signature Pad"],
        typical_digitalization_paths=["Automated Consignment Invoicing", "Instant Tracking Link to Customer", "Mobile POD Verification"],
    ),

    # ----------------------------------------------------
    # 4. HEALTH & WELLNESS
    # ----------------------------------------------------
    TaxonomyNode(
        sector_code="HEALTH_WELLNESS",
        category_code="MEDICAL_PRACTICE",
        subcategory_code="CLINIC_DENTAL",
        display_name_en="Doctor Clinic & Dental Care",
        display_name_hi="डॉक्टर क्लिनिक एवं दंत चिकित्सा",
        description_en="General physician clinic, dental clinic, and outpatient consulting",
        description_hi="क्लिनिक, डॉक्टर परामर्श और डेंटल क्लिनिक",
        typical_needs=["Patient queue management", "Electronic Medical Records (EMR)", "Prescription printing", "Ayushman Bharat Digital Mission (ABDM)"],
        typical_tools=["Practo/EHR Software", "ABDM Health ID (ABHA) Gateway", "WhatsApp Appointment Reminders"],
        typical_digitalization_paths=["Digital Token / Queue System", "E-Prescriptions & ABHA Linking", "Follow-up Reminders"],
    ),
    TaxonomyNode(
        sector_code="HEALTH_WELLNESS",
        category_code="DIAGNOSTICS",
        subcategory_code="DIAGNOSTIC_CENTRE",
        display_name_en="Diagnostic Pathology & Imaging",
        display_name_hi="पैथोलॉजी लैब एवं जांच केंद्र",
        description_en="Blood testing laboratory, X-ray, ultrasound, and diagnostic tests",
        description_hi="रक्त जांच प्रयोगशाला, एक्स-रे और डायग्नोस्टिक केंद्र",
        typical_needs=["Sample barcode labeling", "Automated analyzer interfacing", "PDF report delivery via WhatsApp/Email"],
        typical_tools=["LIMS (Laboratory Information Management System)", "Barcode Printer", "WhatsApp Business API"],
        typical_digitalization_paths=["Direct WhatsApp Lab Report Delivery", "Analyzer Machine Integration", "Doctor Referral Tracking"],
    ),
    TaxonomyNode(
        sector_code="HEALTH_WELLNESS",
        category_code="FITNESS",
        subcategory_code="GYM_YOGA_WELLNESS",
        display_name_en="Gym, Yoga & Fitness Centre",
        display_name_hi="जिम, योग एवं फिटनेस सेंटर",
        description_en="Gymnasiums, yoga studios, physiotherapy, and wellness centers",
        description_hi="जिम, योग केंद्र और फिटनेस प्रशिक्षण केंद्र",
        typical_needs=["Membership duration tracking", "Biometric access control", "Diet & workout chart sharing"],
        typical_tools=["Gym Management App", "Biometric RFID Turnstile", "UPI Recurring Mandates"],
        typical_digitalization_paths=["Membership Auto-Expiry Alerts", "Biometric Attendance Access", "Mobile App Workout Scheduling"],
    ),
    TaxonomyNode(
        sector_code="HEALTH_WELLNESS",
        category_code="OPTICAL",
        subcategory_code="OPTICAL_STORE",
        display_name_en="Optical Store & Eyecare",
        display_name_hi="चश्मे की दुकान एवं ऑप्टिकल",
        description_en="Spectacles, sunglasses, contact lenses, and eye refraction testing",
        description_hi="चश्मे, लेंस और नजर जांच केंद्र",
        typical_needs=["Lens prescription records", "Frame cataloguing", "Order ready notifications"],
        typical_tools=["Optical POS", "WhatsApp Notifications", "Refractometer"],
        typical_digitalization_paths=["Prescription Digitization", "SMS Order Completion Alerts", "Virtual Frame Try-On"],
    ),

    # ----------------------------------------------------
    # 5. EDUCATION & TRAINING
    # ----------------------------------------------------
    TaxonomyNode(
        sector_code="EDUCATION",
        category_code="INSTITUTES",
        subcategory_code="COACHING_CENTRE",
        display_name_en="Coaching & Tuition Centre",
        display_name_hi="कोचिंग एवं ट्यूशन सेंटर",
        description_en="Competitive exam coaching, school tuitions, and test preparation institutes",
        description_hi="प्रतियोगी परीक्षा कोचिंग और स्कूल ट्यूशन केंद्र",
        typical_needs=["Student fee payment installment tracking", "Attendance SMS alerts to parents", "OMR test result generation", "Online test portal"],
        typical_tools=["Classpro / Institute ERP", "SMS Gateway", "Google Classroom / YouTube Unlisted"],
        typical_digitalization_paths=["Fee Receipt & Reminders Automation", "Parent Attendance Notification App", "Hybrid Online Test Platform"],
    ),
    TaxonomyNode(
        sector_code="EDUCATION",
        category_code="VOCATIONAL",
        subcategory_code="SKILL_COMPUTER_CENTRE",
        display_name_en="Skill Training & Computer Academy",
        display_name_hi="कौशल एवं कंप्यूटर प्रशिक्षण केंद्र",
        description_en="Computer training, coding classes, typing institutes, and vocational skills",
        description_hi="कंप्यूटर शिक्षा, टाइपिंग और व्यावसायिक कौशल प्रशिक्षण",
        typical_needs=["Batch scheduling & lab allocation", "Certificate generation with verification QR", "Government PMKVY compliance"],
        typical_tools=["Learning Management System", "QR Certificate Generator", "Biometric Attendance"],
        typical_digitalization_paths=["Verifiable Digital Certificates", "Online Practical Lab Assignments", "Placement Assistance Tracking"],
    ),

    # ----------------------------------------------------
    # 6. MANUFACTURING & FABRICATION
    # ----------------------------------------------------
    TaxonomyNode(
        sector_code="MANUFACTURING",
        category_code="FOOD_PRODUCTION",
        subcategory_code="FOOD_PROCESSING",
        display_name_en="Food Processing & Packaging",
        display_name_hi="खाद्य प्रसंस्करण एवं पैकेजिंग",
        description_en="Flour mills, oil extraction, pickle/papads, spices, and packaged snacks",
        description_hi="आटा मिल, तेल घानी, मसाला पिसाई, नमकीन और पापड़ निर्माण",
        typical_needs=["FSSAI hygiene compliance", "Batch packaging and shelf-life tracking", "Raw agri-commodity procurement"],
        typical_tools=["FSSAI Portal", "Batch Label Printer", "Tally ERP"],
        typical_digitalization_paths=["Batch Expiry Invoicing", "Quality Standard Testing Records", "Direct B2B Marketplace Listing"],
    ),
    TaxonomyNode(
        sector_code="MANUFACTURING",
        category_code="TEXTILES",
        subcategory_code="GARMENT_MANUFACTURING",
        display_name_en="Garment & Textile Manufacturing",
        display_name_hi="वस्त्र एवं परिधान निर्माण",
        description_en="Fabric stitching, loom weaving, block printing, and garment export units",
        description_hi="कपड़ा सिलाई, हथकरघा, ब्लॉक प्रिंटिंग और परिधान निर्माण",
        typical_needs=["Job work order status", "Fabric roll wastage tracking", "Worker piece-rate wage calculation"],
        typical_tools=["Production Tracker Spreadsheet", "Tally Prime", "WhatsApp Supplier Channels"],
        typical_digitalization_paths=["Digital Job Work Cards", "Worker Piece-rate Payroll App", "B2B Catalog for Wholesalers"],
    ),
    TaxonomyNode(
        sector_code="MANUFACTURING",
        category_code="METAL_WOOD",
        subcategory_code="METAL_FABRICATION",
        display_name_en="Metal Fabrication & Machine Parts",
        display_name_hi="धातु निर्माण एवं मशीन पार्ट्स",
        description_en="Gates, grills, lathe workshops, CNC machine components, and automotive parts",
        description_hi="वेल्डिंग, ग्रिल, लेथ मशीन, सीएनसी पार्ट्स और धातु निर्माण",
        typical_needs=["Engineering drawing CAD/CAM sharing", "Raw metal scrap accounting", "Custom job quoting"],
        typical_tools=["AutoCAD / DWG Viewer", "Quotation Generator", "GST e-Way Bill Portal"],
        typical_digitalization_paths=["Digital CAD Estimator", "Automated e-Way Bill & Invoicing", "Machine Maintenance Logs"],
    ),
    TaxonomyNode(
        sector_code="MANUFACTURING",
        category_code="PACKAGING",
        subcategory_code="PACKAGING_BOXES",
        display_name_en="Corrugated Boxes & Packaging Material",
        display_name_hi="पैकेजिंग डिब्बे एवं सामग्री",
        description_en="Cardboard boxes, printed poly-packs, wooden crates, and industrial packaging",
        description_hi="कार्टन, पैकेजिंग बॉक्स और प्लास्टिक रैप निर्माण",
        typical_needs=["Box dimension custom calculators", "Paper GSM inventory", "Large client recurring orders"],
        typical_tools=["Box Spec Calculator", "Tally Invoicing", "Direct B2B Portals"],
        typical_digitalization_paths=["Automated GSM & Pricing Calculator", "GeM Government Procurement Listing", "Real-time Order Status Portal"],
    ),

    # ----------------------------------------------------
    # 7. AGRICULTURE & RURAL ENTERPRISE
    # ----------------------------------------------------
    TaxonomyNode(
        sector_code="AGRI_RURAL",
        category_code="DAIRY_LIVESTOCK",
        subcategory_code="DAIRY_FARMING",
        display_name_en="Dairy Farming & Milk Chilling",
        display_name_hi="डेयरी फार्मिंग एवं दुग्ध संग्रह",
        description_en="Milk collection centers, chilling units, cattle feed, and dairy cooperatives",
        description_hi="डेयरी फार्म, दूध संकलन केंद्र और पशुपालन",
        typical_needs=["Fat/SNF milk quality testing", "Daily farmer payout passbooks", "Veterinary cycle tracking"],
        typical_tools=["Milk Analyzer Device", "Dairy Collection Software", "Direct Bank Payout UPI"],
        typical_digitalization_paths=["Automated Milk Analyzer Billing", "Direct Farmer Account Payouts", "Cattle Health Records"],
    ),
    TaxonomyNode(
        sector_code="AGRI_RURAL",
        category_code="AGRI_PRODUCER",
        subcategory_code="FARMER_PRODUCER_ORG",
        display_name_en="Farmer Producer Enterprise (FPO)",
        display_name_hi="किसान उत्पादक संगठन (एफपीओ)",
        description_en="Farmer producer companies, collective aggregation, grain grading, and bulk sale",
        description_hi="किसान उत्पादक कंपनी (FPO) और सामूहिक कृषि विपणन",
        typical_needs=["Member farmer register", "Collective input purchasing discounts", "e-NAM electronic mandi linkage"],
        typical_tools=["e-NAM Portal", "FPO Accounting ERP", "Agri-Advisory WhatsApp Groups"],
        typical_digitalization_paths=["e-NAM Mandi Integration", "Farmer Shareholder Ledger", "Direct Institutional Buyer Linkages"],
    ),

    # ----------------------------------------------------
    # 8. PROFESSIONAL & KNOWLEDGE SERVICES
    # ----------------------------------------------------
    TaxonomyNode(
        sector_code="PROFESSIONAL",
        category_code="TECH_SERVICES",
        subcategory_code="SOFTWARE_WEB_DEV",
        display_name_en="Software, Web & IT Services",
        display_name_hi="सॉफ्टवेयर एवं वेब सेवाएं",
        description_en="Website design, mobile apps, software maintenance, and digital marketing agency",
        description_hi="वेबसाइट निर्माण, सॉफ्टवेयर विकास और डिजिटल मार्केटिंग",
        typical_needs=["Client milestone contracts", "Project sprint tracking", "Multi-currency invoicing"],
        typical_tools=["Jira / Trello", "GitHub / GitLab", "Zoho / Stripe Invoicing"],
        typical_digitalization_paths=["Automated Project Time Tracking", "Client Milestone Escrow", "Global B2B Marketing"],
    ),
    TaxonomyNode(
        sector_code="PROFESSIONAL",
        category_code="FINANCIAL_LEGAL",
        subcategory_code="ACCOUNTING_LEGAL",
        display_name_en="Accounting, GST & Legal Consultancy",
        display_name_hi="लेखांकन, जीएसटी एवं कानूनी परामर्श",
        description_en="Chartered Accountants, tax practitioners, legal advocates, and compliance consultants",
        description_hi="सीए, टैक्स कंसल्टेंसी और कानूनी सलाह केंद्र",
        typical_needs=["Client document secure vault", "GST filing deadline tracker", "Billing hourly/retainer logs"],
        typical_tools=["GST Portal", "Income Tax Portal", "Cloud Document Management"],
        typical_digitalization_paths=["Client Self-Service Document Portal", "Filing Deadline Alert Bot", "Digital Signature Cloud"],
    ),

    # ----------------------------------------------------
    # 9. HOME & LOCAL SERVICES
    # ----------------------------------------------------
    TaxonomyNode(
        sector_code="HOME_LOCAL",
        category_code="HOME_REPAIR",
        subcategory_code="ELECTRICIAN_PLUMBER_AC",
        display_name_en="Electrician, Plumber & AC Repair",
        display_name_hi="इलेक्ट्रीशियन, प्लंबर एवं एसी रिपेयर",
        description_en="On-demand home appliance repair, electrical wiring, plumbing, and RO maintenance",
        description_hi="होम रिपेयर, एसी सर्विस, प्लंबिंग और आरओ सर्विस",
        typical_needs=["Local customer job dispatch", "Transparent pricing rate cards", "Annual Maintenance Contracts (AMC)"],
        typical_tools=["Urban Company / Local Directory Listing", "WhatsApp Rate Card", "Google Business Profile"],
        typical_digitalization_paths=["Google Local Service Ads", "Digital AMC Renewal Tracking", "Online Customer Feedback"],
    ),

    # ----------------------------------------------------
    # 10. CREATIVE & ARTISAN PRODUCTS
    # ----------------------------------------------------
    TaxonomyNode(
        sector_code="CREATIVE_ARTISAN",
        category_code="HANDICRAFTS",
        subcategory_code="POTTERY_PAINTING_CRAFT",
        display_name_en="Handicrafts, Pottery & Traditional Art",
        display_name_hi="हस्तशिल्प, मिट्टी के बर्तन एवं पारंपरिक कला",
        description_en="Blue pottery, miniature painting, terracotta, lacquer bangles, and regional folk crafts",
        description_hi="ब्लू पॉटरी, पेंटिंग, हस्तनिर्मित वस्तुएं और स्थानीय पारंपरिक कला",
        typical_needs=["Artisan story branding", "High-resolution product catalogs", "Domestic and international courier packing", "ONDC / e-commerce listing"],
        typical_tools=["Instagram Visual Portfolio", "ONDC Buyer Apps", "Etsy / Amazon Karigar"],
        typical_digitalization_paths=["Artisan Storytelling Video Showcase", "ONDC Marketplace Integration", "Digital Craft Mark Certification"],
    ),

    # ----------------------------------------------------
    # 11. OTHER MICRO ENTERPRISES
    # ----------------------------------------------------
    TaxonomyNode(
        sector_code="OTHER_MICRO",
        category_code="OTHER_GENERAL",
        subcategory_code="OTHER_MICRO_ENTERPRISE",
        display_name_en="Other Micro Enterprise",
        display_name_hi="अन्य सूक्ष्म उद्यम",
        description_en="Specialized local commercial, cottage, or micro business not categorized above",
        description_hi="अन्य स्थानीय, कुटीर या सूक्ष्म व्यवसाय जो ऊपर शामिल नहीं हैं",
        typical_needs=["Basic bookkeeping", "Digital payments", "Customer communication"],
        typical_tools=["UPI QR", "Khatabook", "WhatsApp Business"],
        typical_digitalization_paths=["Digital Payment Acceptance", "Online Business Profile", "Basic Digital Accounting"],
    ),
]


def get_all_sectors() -> List[Dict[str, Any]]:
    """Return all sectors with code and bilingual names."""
    return [{"code": k, "name_en": v["en"], "name_hi": v["hi"]} for k, v in SECTORS.items()]


def get_categories_by_sector(sector_code: str) -> List[TaxonomyNode]:
    """Retrieve all taxonomy nodes under a given sector."""
    return [node for node in TAXONOMY_CATALOG if node.sector_code == sector_code]


def get_taxonomy_node(subcategory_code: str) -> Optional[TaxonomyNode]:
    """Retrieve a specific taxonomy node by subcategory code."""
    for node in TAXONOMY_CATALOG:
        if node.subcategory_code == subcategory_code:
            return node
    return None


def get_all_taxonomy_nodes() -> List[TaxonomyNode]:
    """Return complete taxonomy catalog."""
    return TAXONOMY_CATALOG
