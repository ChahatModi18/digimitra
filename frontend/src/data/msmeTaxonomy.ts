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

// 16+ Rich Indian MSME Industry Sectors
export const MSME_SECTORS: MsmeSector[] = [
  {
    id: "Retail & Trade",
    nameEn: "Retail & Trade (Kirana / General Store)",
    nameHi: "किराना एवं खुदरा व्यापार",
    category: "Trade",
    examplesEn: "Grocery, FMCG, stationary, hardware, footwear, mobile shops",
    examplesHi: "किराना, जनरल स्टोर, स्टेशनरी, हार्डवेयर, जूते-चप्पल, मोबाइल दुकान",
  },
  {
    id: "Wholesale & Distribution",
    nameEn: "Wholesale & Distribution (B2B Trade)",
    nameHi: "थोक व्यापार एवं वितरण",
    category: "Trade",
    examplesEn: "FMCG distributors, grain merchants (Mandi), electrical wholesale",
    examplesHi: "थोक व्यापारी, अनाज मंडी, डिस्ट्रीब्यूटर, थोक कपड़ा एवं उपकरण",
  },
  {
    id: "Manufacturing",
    nameEn: "Manufacturing & Engineering",
    nameHi: "विनिर्माण एवं इंजीनियरिंग",
    category: "Manufacturing",
    examplesEn: "Machine parts, plastic moulding, fabrication, sheet metal, packaging",
    examplesHi: "मशीनरी पार्ट्स, प्लास्टिक मोल्डिंग, फैब्रिकेशन, डाई-कास्टिंग, पैकेजिंग",
  },
  {
    id: "Textile & Garments",
    nameEn: "Textile, Apparel & Garments",
    nameHi: "कपड़ा, परिधान एवं गारमेंट्स",
    category: "Manufacturing",
    examplesEn: "Readymade garments, boutique, weaving, tailoring, embroidery",
    examplesHi: "रेडीमेड गारमेंट्स, बुटीक, सिलाई-कढ़ाई, बुनाई, वस्त्र निर्माण",
  },
  {
    id: "Food & Hospitality",
    nameEn: "Food, Hospitality & Sweets",
    nameHi: "होटल, रेस्टोरेंट एवं मिष्ठान",
    category: "Services",
    examplesEn: "Restaurants, sweet shops (Mithai), bakeries, cloud kitchens, dhabas",
    examplesHi: "रेस्टोरेंट, मिठाई की दुकान, बेकरी, क्लाउड किचन, कैफे, ढाबा",
  },
  {
    id: "Agro & Food Processing",
    nameEn: "Agro & Food Processing",
    nameHi: "कृषि एवं खाद्य प्रसंस्करण",
    category: "Manufacturing",
    examplesEn: "Flour mills, oil extraction, spices grinding, dairy & cold storage",
    examplesHi: "आटा चक्की, तेल मिल, मसाला पिसाई, डेयरी उत्पाद, कोल्ड स्टोरेज",
  },
  {
    id: "Handloom & Handicrafts",
    nameEn: "Handloom, Handicrafts & Artisans",
    nameHi: "हथकरघा, हस्तशिल्प एवं कारीगरी",
    category: "Manufacturing",
    examplesEn: "Pottery, brassware, woodcraft, traditional handloom weaving, zardozi",
    examplesHi: "मिट्टी के बर्तन, पीतल के काम, लकड़ी शिल्प, हाथ से बुने वस्त्र, जरदोजी",
  },
  {
    id: "Healthcare & Wellness",
    nameEn: "Healthcare, Clinics & Pharmacies",
    nameHi: "स्वास्थ्य सेवा, क्लीनिक एवं फार्मेसी",
    category: "Services",
    examplesEn: "Medical stores/pharmacies, diagnostic labs, clinics, wellness centers",
    examplesHi: "दवा दुकान (केमिस्ट), पैथोलॉजी लैब, डेंटल व आयुष क्लीनिक",
  },
  {
    id: "Services & Consulting",
    nameEn: "Professional & Business Services",
    nameHi: "परामर्श एवं व्यावसायिक सेवाएं",
    category: "Services",
    examplesEn: "Tax consultants, CA, legal advocates, event planners, digital agencies",
    examplesHi: "टैक्स कंसल्टेंट, सीए, वकील, इवेंट मैनेजमेंट, डिजिटल मार्केटिंग",
  },
  {
    id: "IT & Digital Services",
    nameEn: "IT, Software & Digital Services",
    nameHi: "आईटी, सॉफ्टवेयर एवं डिजिटल सेवाएं",
    category: "Services",
    examplesEn: "Computer centers, web development, CSC e-Mitra kiosks, cyber cafes",
    examplesHi: "कंप्यूटर सेंटर, सीएससी / ई-मित्र केंद्र, सॉफ्टवेयर एवं डेटा एंट्री",
  },
  {
    id: "Automotive & Spare Parts",
    nameEn: "Automotive Workshops & Spare Parts",
    nameHi: "ऑटोमोबाइल गैराज एवं स्पेयर पार्ट्स",
    category: "Services",
    examplesEn: "Vehicle repair garages, 2-wheeler service, tyre shops, battery sales",
    examplesHi: "गाड़ी रिपेयरिंग, टू-व्हीलर सर्विस सेंटर, टायर दुकान, ऑटो स्पेयर पार्ट्स",
  },
  {
    id: "Logistics & Transport",
    nameEn: "Logistics, Transport & Couriers",
    nameHi: "लॉजिस्टिक्स, ट्रांसपोर्ट एवं कूरियर",
    category: "Services",
    examplesEn: "Local transport fleet, tempo delivery, parcel courier franchises",
    examplesHi: "ट्रांसपोर्ट ऑपरेटर, पार्सल व कूरियर फ्रेंचाइजी, वेयरहाउसिंग",
  },
  {
    id: "Construction & Hardware",
    nameEn: "Building Materials, Hardware & Paints",
    nameHi: "निर्माण सामग्री, हार्डवेयर एवं पेंट्स",
    category: "Trade",
    examplesEn: "Cement & sand depot, tiles, sanitaryware, paint shops, plywood",
    examplesHi: "सीमेंट, सरिया, टाइल्स, पेंट, प्लाईवुड, प्लंबिंग व सेनेटरी हार्डवेयर",
  },
  {
    id: "Personal Care & Beauty",
    nameEn: "Beauty Parlours, Salons & Spa",
    nameHi: "ब्यूटी पार्लर, सैलून एवं ग्रूमिंग",
    category: "Services",
    examplesEn: "Men's salon, bridal makeup studio, fitness gym, grooming centers",
    examplesHi: "सैलून, ब्राइडल मेकअप स्टूडियो, ब्यूटी पार्लर, फिटनेस जिम",
  },
  {
    id: "Education & Coaching",
    nameEn: "Coaching, Skill Centers & Daycare",
    nameHi: "कोचिंग, कौशल केंद्र एवं शिक्षण",
    category: "Services",
    examplesEn: "Tuition centers, vocational skill training, driving schools, preschools",
    examplesHi: "ट्यूशन व कोचिंग सेंटर, वोकेशनल ट्रेनिंग, ड्राइविंग स्कूल, प्ले स्कूल",
  },
  {
    id: "Other MSME Sector",
    nameEn: "Other Specialized MSME Sector",
    nameHi: "अन्य विशिष्ट एमएसएमई क्षेत्र",
    category: "Services",
    examplesEn: "Recycling, printing press, solar installation, artisan crafts",
    examplesHi: "प्रिंटिंग प्रेस, रीसाइक्लिंग, सोलर उपकरण, पैकेजिंग आदि",
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
