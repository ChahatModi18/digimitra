export interface IndianState {
  code: string;
  nameEn: string;
  nameHi: string;
  isUT?: boolean;
  majorCities: string[];
}

export interface MsmeSector {
  id: string;
  nameEn: string;
  nameHi: string;
  category: "Manufacturing" | "Services" | "Trade";
  examplesEn: string;
  examplesHi: string;
}

export interface LegalStructure {
  id: string;
  nameEn: string;
  nameHi: string;
}

// All 28 States + 8 Union Territories of India
export const INDIAN_STATES_AND_UTS: IndianState[] = [
  // States
  {
    code: "AP",
    nameEn: "Andhra Pradesh",
    nameHi: "आंध्र प्रदेश",
    majorCities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry", "Kakinada"],
  },
  {
    code: "AR",
    nameEn: "Arunachal Pradesh",
    nameHi: "अरुणाचल प्रदेश",
    majorCities: ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
  },
  {
    code: "AS",
    nameEn: "Assam",
    nameHi: "असम",
    majorCities: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
  },
  {
    code: "BR",
    nameEn: "Bihar",
    nameHi: "बिहार",
    majorCities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah"],
  },
  {
    code: "CG",
    nameEn: "Chhattisgarh",
    nameHi: "छत्तीसगढ़",
    majorCities: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur"],
  },
  {
    code: "GA",
    nameEn: "Goa",
    nameHi: "गोवा",
    majorCities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  },
  {
    code: "GJ",
    nameEn: "Gujarat",
    nameHi: "गुजरात",
    majorCities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Morbi", "Vapi"],
  },
  {
    code: "HR",
    nameEn: "Haryana",
    nameHi: "हरियाणा",
    majorCities: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat"],
  },
  {
    code: "HP",
    nameEn: "Himachal Pradesh",
    nameHi: "हिमाचल प्रदेश",
    majorCities: ["Shimla", "Dharamshala", "Solan", "Mandi", "Baddi", "Kullu", "Una"],
  },
  {
    code: "JH",
    nameEn: "Jharkhand",
    nameHi: "झारखंड",
    majorCities: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih"],
  },
  {
    code: "KA",
    nameEn: "Karnataka",
    nameHi: "कर्नाटक",
    majorCities: ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Kalaburagi", "Davanagere", "Ballari", "Udupi"],
  },
  {
    code: "KL",
    nameEn: "Kerala",
    nameHi: "केरल",
    majorCities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Kannur", "Alappuzha", "Palakkad", "Kottayam"],
  },
  {
    code: "MP",
    nameEn: "Madhya Pradesh",
    nameHi: "मध्य प्रदेश",
    majorCities: ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
  },
  {
    code: "MH",
    nameEn: "Maharashtra",
    nameHi: "महाराष्ट्र",
    majorCities: ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad (Chhatrapati Sambhajinagar)", "Solapur", "Kolhapur", "Navi Mumbai", "Amravati"],
  },
  {
    code: "MN",
    nameEn: "Manipur",
    nameHi: "मणिपुर",
    majorCities: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul"],
  },
  {
    code: "ML",
    nameEn: "Meghalaya",
    nameHi: "मेघालय",
    majorCities: ["Shillong", "Tura", "Jowai", "Nongpoh", "Cherrapunji"],
  },
  {
    code: "MZ",
    nameEn: "Mizoram",
    nameHi: "मिजोरम",
    majorCities: ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"],
  },
  {
    code: "NL",
    nameEn: "Nagaland",
    nameHi: "नागालैंड",
    majorCities: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
  },
  {
    code: "OD",
    nameEn: "Odisha",
    nameHi: "ओडिशा",
    majorCities: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak"],
  },
  {
    code: "PB",
    nameEn: "Punjab",
    nameHi: "पंजाब",
    majorCities: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur"],
  },
  {
    code: "RJ",
    nameEn: "Rajasthan",
    nameHi: "राजस्थान",
    majorCities: ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Sikar", "Sri Ganganagar"],
  },
  {
    code: "SK",
    nameEn: "Sikkim",
    nameHi: "सिक्किम",
    majorCities: ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Singtam"],
  },
  {
    code: "TN",
    nameEn: "Tamil Nadu",
    nameHi: "तमिलनाडु",
    majorCities: ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Dindigul"],
  },
  {
    code: "TS",
    nameEn: "Telangana",
    nameHi: "तेलंगाना",
    majorCities: ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar", "Nalgonda"],
  },
  {
    code: "TR",
    nameEn: "Tripura",
    nameHi: "त्रिपुरा",
    majorCities: ["Agartala", "Dharmanagar", "Udaipur", "Kailashahar", "Belonia"],
  },
  {
    code: "UP",
    nameEn: "Uttar Pradesh",
    nameHi: "उत्तर प्रदेश",
    majorCities: ["Lucknow", "Kanpur", "Varanasi", "Agra", "Noida", "Prayagraj", "Meerut", "Ghaziabad", "Bareilly", "Aligarh", "Moradabad", "Gorakhpur"],
  },
  {
    code: "UK",
    nameEn: "Uttarakhand",
    nameHi: "उत्तराखंड",
    majorCities: ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Nainital"],
  },
  {
    code: "WB",
    nameEn: "West Bengal",
    nameHi: "पश्चिम बंगाल",
    majorCities: ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Kharagpur", "Haldia"],
  },

  // Union Territories
  {
    code: "DL",
    nameEn: "Delhi (NCT)",
    nameHi: "दिल्ली (एनसीटी)",
    isUT: true,
    majorCities: ["Central Delhi", "New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi", "Dwarka", "Rohini"],
  },
  {
    code: "JK",
    nameEn: "Jammu and Kashmir",
    nameHi: "जम्मू और कश्मीर",
    isUT: true,
    majorCities: ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Udhampur", "Sopore"],
  },
  {
    code: "LA",
    nameEn: "Ladakh",
    nameHi: "लद्दाख",
    isUT: true,
    majorCities: ["Leh", "Kargil", "Diskit", "Drass"],
  },
  {
    code: "CH",
    nameEn: "Chandigarh",
    nameHi: "चंडीगढ़",
    isUT: true,
    majorCities: ["Chandigarh"],
  },
  {
    code: "PY",
    nameEn: "Puducherry",
    nameHi: "पुदुचेरी",
    isUT: true,
    majorCities: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  },
  {
    code: "AN",
    nameEn: "Andaman and Nicobar Islands",
    nameHi: "अंडमान एवं निकोबार द्वीप समूह",
    isUT: true,
    majorCities: ["Port Blair", "Diglipur", "Mayabunder"],
  },
  {
    code: "DNHDD",
    nameEn: "Dadra & Nagar Haveli and Daman & Diu",
    nameHi: "दादरा और नगर हवेली एवं दमन और दीव",
    isUT: true,
    majorCities: ["Silvassa", "Daman", "Diu"],
  },
  {
    code: "LD",
    nameEn: "Lakshadweep",
    nameHi: "लक्षद्वीप",
    isUT: true,
    majorCities: ["Kavaratti", "Agatti", "Andrott"],
  },
];

// 30+ Rich Indian MSME Industry Sectors (Alphabetically Arranged)
export const MSME_SECTORS: MsmeSector[] = [
  {
    id: "Agro & Food Processing",
    nameEn: "Agro & Food Processing",
    nameHi: "कृषि एवं खाद्य प्रसंस्करण",
    category: "Manufacturing",
    examplesEn: "Flour mills, oil extraction, spice grinding, pulses mill (Dal mill), dairy & cold storage",
    examplesHi: "आटा चक्की, तेल मिल, मसाला पिसाई, दाल मिल, डेयरी उत्पाद, कोल्ड स्टोरेज",
  },
  {
    id: "Automotive Workshops & Garages",
    nameEn: "Automotive Workshops, Garages & Spares",
    nameHi: "ऑटोमोबाइल गैराज, वर्कशॉप एवं स्पेयर पार्ट्स",
    category: "Services",
    examplesEn: "Vehicle repair garages, 2-wheeler service centers, tyre alignment, battery sales & charging",
    examplesHi: "गाड़ी रिपेयरिंग गैराज, टू-व्हीलर सर्विस सेंटर, टायर अलाइनमेंट, ऑटो स्पेयर पार्ट्स व बैटरी दुकान",
  },
  {
    id: "Bicycle Stores & Repair",
    nameEn: "Bicycle Stores, Spares & Repair Workshops",
    nameHi: "साइकिल स्टोर, स्पेयर पार्ट्स एवं मरम्मत वर्कशॉप",
    category: "Trade",
    examplesEn: "Bicycle sales, kids cycle showroom, e-cycle dealership, tyre/tube replacement, cycle repair shop",
    examplesHi: "साइकिल दुकान, बच्चों की साइकिल, ई-साइकिल डीलरशिप, टायर-ट्यूब बदलना व साइकिल मरम्मत",
  },
  {
    id: "Building Materials & Hardware",
    nameEn: "Building Materials, Hardware & Paints",
    nameHi: "निर्माण सामग्री, हार्डवेयर एवं पेंट्स",
    category: "Trade",
    examplesEn: "Cement, sand, TMT steel bars, ceramic tiles, sanitaryware, paint shops, plywood & timber",
    examplesHi: "सीमेंट, बजरी, सरिया, टाइल्स, पेंट, प्लाईवुड, प्लंबिंग व सेनेटरी हार्डवेयर दुकान",
  },
  {
    id: "Chemicals & Plastic Goods",
    nameEn: "Chemicals, Rubber & Plastic Products",
    nameHi: "रसायन, रबर एवं प्लास्टिक उत्पाद",
    category: "Manufacturing",
    examplesEn: "Plastic bottles, packaging polybags, PVC pipes, molded items, industrial cleaning solutions",
    examplesHi: "प्लास्टिक बोतलें, पैकेजिंग बैग, पीवीसी पाइप, मोल्डेड उत्पाद, औद्योगिक केमिकल व डिटर्जेंट",
  },
  {
    id: "Coaching & Tuition Centers",
    nameEn: "Coaching Institutes, Tuition & Skill Centers",
    nameHi: "कोचिंग संस्थान, ट्यूशन एवं कौशल केंद्र",
    category: "Services",
    examplesEn: "Private tuition, competitive exam coaching, language classes, computer training institute",
    examplesHi: "प्राइवेट ट्यूशन, प्रतियोगी परीक्षा कोचिंग, कंप्यूटर ट्रेनिंग, भाषा शिक्षण व कौशल विकास केंद्र",
  },
  {
    id: "Cyber Cafe & CSC Kiosks",
    nameEn: "Cyber Cafe, CSC & Digital Service Kiosks",
    nameHi: "साइबर कैफे, सीएससी एवं ई-मित्र डिजिटल केंद्र",
    category: "Services",
    examplesEn: "CSC e-Governance kiosks, e-Mitra, online government form filling, printing, photocopying, PAN/Aadhaar help",
    examplesHi: "सीएससी / ई-मित्र केंद्र, ऑनलाइन सरकारी फॉर्म भरना, फोटोकॉपी, लेमिनेशन, पैन व आधार सहायता",
  },
  {
    id: "Electrical & Electronics Repair",
    nameEn: "Electrical, Electronics & Mobile Repair",
    nameHi: "इलेक्ट्रिकल, इलेक्ट्रॉनिक्स एवं मोबाइल मरम्मत",
    category: "Services",
    examplesEn: "Mobile phone repair, laptop servicing, LED TV repair, electrical wiring & contractor services",
    examplesHi: "मोबाइल रिपेयरिंग, लैपटॉप सर्विसिंग, टीवी मरम्मत, पंखे-मोटर वाइंडिंग व इलेक्ट्रिकल ठेकेदार",
  },
  {
    id: "Event Planning & Catering",
    nameEn: "Event Planning, Tent House & Catering",
    nameHi: "इवेंट मैनेजमेंट, टेंट हाउस एवं केटरिंग",
    category: "Services",
    examplesEn: "Tent house, DJ sound systems, wedding flower decoration, food catering & banquet suppliers",
    examplesHi: "टेंट हाउस, साउंड सिस्टम, विवाह सजावट, खानपान (केटरिंग) व हलवाई सेवाएं",
  },
  {
    id: "Food & Hospitality",
    nameEn: "Food, Hospitality, Bakeries & Sweets",
    nameHi: "होटल, रेस्टोरेंट, बेकरी एवं मिष्ठान भंडार",
    category: "Services",
    examplesEn: "Sweet shops (Mithai), bakeries, restaurants, dhabas, cloud kitchens, juice & snack bars",
    examplesHi: "मिठाई की दुकान, बेकरी, रेस्टोरेंट, ढाबा, क्लाउड किचन, फास्ट फूड व जूस कॉर्नर",
  },
  {
    id: "Footwear & Leather Goods",
    nameEn: "Footwear, Leather Goods & Accessories",
    nameHi: "जूते-चप्पल, लेदर उत्पाद एवं बैग स्टोर",
    category: "Trade",
    examplesEn: "Shoe retail showroom, leather belts & wallets, travel luggage bags, custom cobbler workshop",
    examplesHi: "जूते-चप्पल की दुकान, लेदर बेल्ट व पर्स, ट्रेवल बैग, चप्पल निर्माण व मरम्मत",
  },
  {
    id: "Furniture & Carpentry",
    nameEn: "Furniture, Carpentry & Interior Woodcraft",
    nameHi: "फर्नीचर, बढ़ईगीरी एवं काष्ठकला",
    category: "Manufacturing",
    examplesEn: "Wooden furniture making, modular kitchen, office chairs, sofa upholstery, steel almirah fabrication",
    examplesHi: "लकड़ी का फर्नीचर, मॉड्युलर किचन, ऑफिस टेबल-कुर्सी, सोफा रिपेयर, स्टील अलमारी निर्माण",
  },
  {
    id: "Handloom & Handicrafts",
    nameEn: "Handloom, Handicrafts & Artisan Crafts",
    nameHi: "हथकरघा, हस्तशिल्प एवं कारीगरी",
    category: "Manufacturing",
    examplesEn: "Clay pottery, brass metal craft, wood carving, handloom sarees, zardozi embroidery, stone carving",
    examplesHi: "मिट्टी के बर्तन (कुम्हार), पीतल के बर्तन, लकड़ी नक्काशी, हथकरघा साड़ियां, जरदोजी व कढ़ाई",
  },
  {
    id: "Healthcare & Diagnostic Labs",
    nameEn: "Healthcare, Clinics & Diagnostic Labs",
    nameHi: "स्वास्थ्य सेवा, क्लीनिक एवं पैथोलॉजी लैब",
    category: "Services",
    examplesEn: "Doctor clinics, dental clinics, pathology blood test labs, physiotherapy & AYUSH centers",
    examplesHi: "डॉक्टर क्लीनिक, डेंटल क्लीनिक, पैथोलॉजी ब्लड टेस्ट लैब, फिजियोथेरेपी व आयुष केंद्र",
  },
  {
    id: "Jewellery & Goldsmith",
    nameEn: "Jewellery, Gems & Goldsmith Workshops",
    nameHi: "आभूषण, रत्न, स्वर्णकार एवं आभूषण निर्माण",
    category: "Manufacturing",
    examplesEn: "Gold/silver jewellery retail, traditional goldsmith (Sonar), imitation jewellery, gemstone cutting",
    examplesHi: "सोने-चांदी के गहने, आभूषण निर्माण (सुनार), इमिटेशन ज्वेलरी, रत्न तराशना",
  },
  {
    id: "Logistics, Transport & Couriers",
    nameEn: "Logistics, Transport Fleet & Couriers",
    nameHi: "लॉजिस्टिक्स, ट्रांसपोर्ट एवं कूरियर सेवाएं",
    category: "Services",
    examplesEn: "Mini-truck (Tata Ace/Pickup) goods transport, intercity freight, courier franchise, packers & movers",
    examplesHi: "पिकअप/टेंपो माल परिवहन, कूरियर फ्रेंचाइजी, पैकर्स एंड मूवर्स, स्थानीय लोडिंग सेवाएं",
  },
  {
    id: "Manufacturing & Industrial Engineering",
    nameEn: "Manufacturing, Fabrication & Engineering",
    nameHi: "विनिर्माण, मेटल फैब्रिकेशन एवं इंजीनियरिंग",
    category: "Manufacturing",
    examplesEn: "CNC machine components, steel fabrication, iron grills, sheet metal stamping, machine tools",
    examplesHi: "सीएनसी मशीनिंग, लोहे के गेट-ग्रिल फैब्रिकेशन, शीट मेटल, मशीन स्पेयर पार्ट्स विनिर्माण",
  },
  {
    id: "Medical Stores & Pharmacies",
    nameEn: "Medical Stores & Retail Pharmacies",
    nameHi: "दवा दुकान, केमिस्ट एवं फार्मेसी",
    category: "Trade",
    examplesEn: "Retail chemist shop, wholesale pharma distributors, surgical equipment sales, ayurvedic medicines",
    examplesHi: "दवा दुकान (केमिस्ट), थोक दवा सप्लायर, सर्जिकल उपकरण, आयुर्वेदिक व होम्योपैथिक स्टोर",
  },
  {
    id: "Personal Care, Salons & Beauty",
    nameEn: "Personal Care, Salons, Beauty & Wellness",
    nameHi: "ब्यूटी पार्लर, हेयर सैलून एवं वेलनेस",
    category: "Services",
    examplesEn: "Men's hair salon, women's beauty parlour, bridal makeup studio, unisex spa, gym & fitness studio",
    examplesHi: "मेंस सैलून, ब्यूटी पार्लर, ब्राइडल मेकअप स्टूडियो, स्पा व मसाज, जिम एवं फिटनेस सेंटर",
  },
  {
    id: "Plant Nurseries & Agriculture Inputs",
    nameEn: "Plant Nurseries, Floriculture & Agri Inputs",
    nameHi: "पौधशाला (नर्सरी), पुष्पकृषि एवं कृषि आदान",
    category: "Trade",
    examplesEn: "Plant saplings, decorative flowers, fruit tree nursery, seeds, bio-fertilizers, organic manure, garden pots",
    examplesHi: "पेड़-पौधों की नर्सरी, सजावटी फूल, बीज व जैविक खाद विक्रेता, कीटनाशक, गमले व बागवानी उपकरण",
  },
  {
    id: "Printing, Packaging & Stationery",
    nameEn: "Printing Press, Packaging & Stationery",
    nameHi: "प्रिंटिंग प्रेस, बॉक्स पैकेजिंग एवं स्टेशनरी",
    category: "Manufacturing",
    examplesEn: "Offset printing, wedding cards, flex banners, corrugated box manufacturing, school/office stationery",
    examplesHi: "प्रिंटिंग प्रेस, शादी कार्ड, फ्लेक्स बैनर, गत्ता बॉक्स निर्माण, स्कूल व ऑफिस स्टेशनरी दुकान",
  },
  {
    id: "Professional & Legal Services",
    nameEn: "Professional, Accounting & Legal Services",
    nameHi: "अकाउंटिंग, टैक्स, कानूनी एवं व्यावसायिक परामर्श",
    category: "Services",
    examplesEn: "Chartered Accountants (CA), GST practitioners, income tax consultants, advocates, notary",
    examplesHi: "चार्टर्ड अकाउंटेंट (सीए), जीएसटी प्रैक्टिशनर, आयकर सलाहकार, वकील व नोटरी सेवाएं",
  },
  {
    id: "Retail & Trade",
    nameEn: "Retail Trade (Kirana / Grocery / General Store)",
    nameHi: "किराना, जनरल स्टोर एवं खुदरा व्यापार",
    category: "Trade",
    examplesEn: "Neighborhood kirana store, FMCG grocery shop, cosmetics, gift shops, utility retail stores",
    examplesHi: "किराना दुकान, जनरल स्टोर, कॉस्मेटिक्स, गिफ्ट शॉप, दैनिक उपभोग की खुदरा दुकान",
  },
  {
    id: "Schools, Preschools & Daycare",
    nameEn: "Schools, Play Schools & Daycare Centers",
    nameHi: "प्राइवेट स्कूल, प्ले स्कूल एवं डेकेयर केंद्र",
    category: "Services",
    examplesEn: "Private K-10/K-12 schools, playgroup preschools, montessori kindergarten, crèche & daycare facilities",
    examplesHi: "निजी प्राथमिक व माध्यमिक विद्यालय, प्ले स्कूल, किंडरगार्टन, शिशु देखभाल (डेकेयर) केंद्र",
  },
  {
    id: "Solar & Renewable Energy",
    nameEn: "Solar, Renewable Energy & Power Backup",
    nameHi: "सोलर उपकरण, सौर ऊर्जा एवं इन्वर्टर बैटरी",
    category: "Trade",
    examplesEn: "Rooftop solar panel installation, solar water heaters, inverters, industrial batteries, solar pumps",
    examplesHi: "सोलर पैनल इंस्टॉलेशन, सौर ऊर्जा उपकरण, इन्वर्टर-बैटरी, सोलर पंप डीलरशिप",
  },
  {
    id: "Tailoring, Boutiques & Apparel",
    nameEn: "Tailoring Shops, Boutiques & Apparel",
    nameHi: "सिलाई की दुकान, लेडीज बुटीक एवं वस्त्र निर्माण",
    category: "Manufacturing",
    examplesEn: "Custom men's tailoring, designer women's boutique, school uniform makers, garment alterations",
    examplesHi: "सिलाई दुकान (दर्जी), लेडीज बुटीक, स्कूल यूनिफॉर्म सिलाई, रेडीमेड कपड़ा अल्टरेशन",
  },
  {
    id: "Textile & Garments Manufacturing",
    nameEn: "Textile, Weaving & Garments Manufacturing",
    nameHi: "वस्त्र निर्माण, बुनाई एवं गारमेंट्स फैक्ट्री",
    category: "Manufacturing",
    examplesEn: "Powerloom cloth weaving, knitwear production, jeans/shirt factory, textile dyeing & printing",
    examplesHi: "पावरलूम कपड़ा बुनाई, टी-शर्ट व जींस फैक्ट्री, कपड़ा रंगाई एवं छपाई इकाई",
  },
  {
    id: "Waste Recycling & Scrap",
    nameEn: "Waste Recycling, Scrap & Circular Trade",
    nameHi: "कबाड़ व्यापार, रीसाइक्लिंग एवं अपशिष्ट प्रबंधन",
    category: "Trade",
    examplesEn: "Paper recycling, scrap metal collection & sorting, plastic waste granulating, e-waste handling",
    examplesHi: "कबाड़ की दुकान (लोहा, गत्ता, प्लास्टिक), कतरन रीसाइक्लिंग, प्लास्टिक दाना निर्माण",
  },
  {
    id: "Wholesale & Distribution",
    nameEn: "Wholesale Distribution & B2B Mandi Traders",
    nameHi: "थोक व्यापार, डिस्ट्रीब्यूटर एवं कृषि मंडी आढ़ती",
    category: "Trade",
    examplesEn: "FMCG super stockists, grain merchant (Mandi commission agent), wholesale textiles, electrical goods distributor",
    examplesHi: "एफएमसीजी डिस्ट्रीब्यूटर, अनाज मंडी आढ़त, थोक कपड़ा व्यापारी, थोक इलेक्ट्रिकल व हार्डवेयर विक्रेता",
  },
  {
    id: "Other MSME Sector",
    nameEn: "Other Specialized MSME Sector",
    nameHi: "अन्य विशिष्ट एमएसएमई क्षेत्र",
    category: "Services",
    examplesEn: "Specialized local business, niche trade or custom service enterprise",
    examplesHi: "अन्य विशिष्ट स्थानीय व्यवसाय, शिल्प अथवा सेवा उद्यम",
  },
];

// Legal Entity Structures
export const LEGAL_STRUCTURES: LegalStructure[] = [
  { id: "Proprietorship", nameEn: "Sole Proprietorship (एकल स्वामित्व)", nameHi: "एकल स्वामित्व (Sole Proprietorship)" },
  { id: "Partnership", nameEn: "Partnership Firm (साझेदारी फर्म)", nameHi: "साझेदारी फर्म (Partnership Firm)" },
  { id: "Private Limited", nameEn: "Private Limited Company (प्राइवेट लिमिटेड)", nameHi: "प्राइवेट लिमिटेड कंपनी (Pvt Ltd)" },
  { id: "LLP", nameEn: "Limited Liability Partnership (एलएलपी)", nameHi: "सीमित दायित्व साझेदारी (LLP)" },
  { id: "One Person Company", nameEn: "One Person Company (ओपीसी)", nameHi: "वन पर्सन कंपनी (OPC)" },
  { id: "Self-Help Group (SHG)", nameEn: "Self-Help Group / SHG (स्वयं सहायता समूह)", nameHi: "स्वयं सहायता समूह (SHG)" },
  { id: "Cooperative Society", nameEn: "Cooperative Society (सहकारी समिति)", nameHi: "सहकारी समिति (Cooperative)" },
  { id: "Unregistered / Informal", nameEn: "Informal / Unregistered (अनौपचारिक / अपंजीकृत)", nameHi: "अनौपचारिक / अपंजीकृत (Unregistered)" },
];

/**
 * Official MSME India Definition (Gazette Notification S.O. 2119(E) dated 26 June 2020)
 * 
 * - Micro: Investment <= ₹1 Cr (₹100 Lakhs) AND Turnover <= ₹5 Cr (₹500 Lakhs)
 * - Small: Investment <= ₹10 Cr (₹1000 Lakhs) AND Turnover <= ₹50 Cr (₹5000 Lakhs)
 * - Medium: Investment <= ₹50 Cr (₹5000 Lakhs) AND Turnover <= ₹250 Cr (₹25000 Lakhs)
 * - Large / Non-MSME: Investment > ₹50 Cr OR Turnover > ₹250 Cr
 */
export interface MsmeClassificationResult {
  category: "Micro" | "Small" | "Medium" | "Non-MSME";
  categoryHi: string;
  isMsme: boolean;
  maxTurnoverCr: number;
  maxInvestmentCr: number;
  reasonEn: string;
  reasonHi: string;
  udyamEligible: boolean;
  accentColor: string;
}

export function calculateMsmeClassification(
  turnoverInCrores: number,
  investmentInCrores: number = 0
): MsmeClassificationResult {
  const t = Math.max(0, turnoverInCrores || 0);
  const inv = Math.max(0, investmentInCrores || 0);

  if (t <= 5 && inv <= 1) {
    return {
      category: "Micro",
      categoryHi: "सूक्ष्म उद्यम (Micro Enterprise)",
      isMsme: true,
      maxTurnoverCr: 5,
      maxInvestmentCr: 1,
      reasonEn: `Annual turnover of ₹${t.toFixed(2)} Cr (≤ ₹5 Cr) and investment of ₹${inv.toFixed(2)} Cr (≤ ₹1 Cr) qualifies as a Micro Enterprise under Govt of India norms.`,
      reasonHi: `वार्षिक टर्नओवर ₹${t.toFixed(2)} करोड़ (≤ ₹5 करोड़) और निवेश ₹${inv.toFixed(2)} करोड़ (≤ ₹1 करोड़) भारत सरकार के सूक्ष्म उद्यम वर्ग में आता है।`,
      udyamEligible: true,
      accentColor: "#1B7A6E", // Green/Teal
    };
  }

  if (t <= 50 && inv <= 10) {
    return {
      category: "Small",
      categoryHi: "लघु उद्यम (Small Enterprise)",
      isMsme: true,
      maxTurnoverCr: 50,
      maxInvestmentCr: 10,
      reasonEn: `Annual turnover of ₹${t.toFixed(2)} Cr (≤ ₹50 Cr) and investment of ₹${inv.toFixed(2)} Cr (≤ ₹10 Cr) qualifies as a Small Enterprise.`,
      reasonHi: `वार्षिक टर्नओवर ₹${t.toFixed(2)} करोड़ (≤ ₹50 करोड़) और निवेश ₹${inv.toFixed(2)} करोड़ (≤ ₹10 करोड़) लघु उद्यम वर्ग में आता है।`,
      udyamEligible: true,
      accentColor: "#0E4B94", // Navy Blue
    };
  }

  if (t <= 250 && inv <= 50) {
    return {
      category: "Medium",
      categoryHi: "मध्यम उद्यम (Medium Enterprise)",
      isMsme: true,
      maxTurnoverCr: 250,
      maxInvestmentCr: 50,
      reasonEn: `Annual turnover of ₹${t.toFixed(2)} Cr (≤ ₹250 Cr) and investment of ₹${inv.toFixed(2)} Cr (≤ ₹50 Cr) qualifies as a Medium Enterprise.`,
      reasonHi: `वार्षिक टर्नओवर ₹${t.toFixed(2)} करोड़ (≤ ₹250 करोड़) और निवेश ₹${inv.toFixed(2)} करोड़ (≤ ₹50 करोड़) मध्यम उद्यम वर्ग में आता है।`,
      udyamEligible: true,
      accentColor: "#C25E00", // Amber
    };
  }

  return {
    category: "Non-MSME",
    categoryHi: "बड़ा उद्योग (Large / Non-MSME)",
    isMsme: false,
    maxTurnoverCr: 250,
    maxInvestmentCr: 50,
    reasonEn: `Annual turnover of ₹${t.toFixed(2)} Cr or investment of ₹${inv.toFixed(2)} Cr exceeds the official MSME threshold (> ₹250 Cr turnover or > ₹50 Cr investment). Classified as Large / Non-MSME.`,
    reasonHi: `वार्षिक टर्नओवर ₹${t.toFixed(2)} करोड़ या निवेश ₹${inv.toFixed(2)} करोड़ एमएसएमई सीमा (> ₹250 करोड़) से अधिक है। यह बड़े उद्योग की श्रेणी में आता है।`,
    udyamEligible: false,
    accentColor: "#C1432F", // Red/Warning
  };
}
