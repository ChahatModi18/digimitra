import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ChevronDown,
  Search,
  Share2,
  Sparkles,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { ShareModal } from "../components/ui/ShareModal";

interface FAQItem {
  id: string;
  category: "assessment" | "privacy" | "roadmap" | "schemes";
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
}

const FAQS_DATA: FAQItem[] = [
  {
    id: "faq-1",
    category: "assessment",
    questionEn: "How long does the DigiMitra assessment take, and is it really free?",
    questionHi: "डिजीमित्र मूल्यांकन में कितना समय लगता है और क्या यह वास्तव में निःशुल्क है?",
    answerEn:
      "The diagnostic consists of 14 practical multiple-choice questions about your daily operations (billing, connectivity, payments, inventory) and takes less than 3 minutes. DigiMitra is 100% free and open-source for Indian MSMEs.",
    answerHi:
      "इस मूल्यांकन में केवल 14 व्यावहारिक प्रश्न हैं जो आपकी दैनिक दुकान/व्यापार संचालन से संबंधित हैं और इसमें केवल 3 मिनट का समय लगता है। डिजीमित्र भारतीय सूक्ष्म व लघु उद्यमों के लिए 100% पूर्णतः निःशुल्क है।",
  },
  {
    id: "faq-2",
    category: "assessment",
    questionEn: "What are RBDL Maturity Levels (Level 0 to Level 3)?",
    questionHi: "RBDL डिजिटल परिपक्वता स्तर (स्तर 0 से स्तर 3) क्या हैं?",
    answerEn:
      "RBDL (Rule-Based Digitalization Level) classifies your enterprise into 4 objective stages: Level 0 (Traditional manual / pen-and-paper), Level 1 (Basic digitalized with smartphone/UPI), Level 2 (Integrated desktop POS, barcode & accounting), and Level 3 (Strategic growth with ONDC, BI analytics & omnichannel sales).",
    answerHi:
      "RBDL आपके व्यवसाय को 4 स्पष्ट स्तरों में बांटता है: स्तर 0 (कागजी बहीखाता/नकद), स्तर 1 (स्मार्टफोन व यूपीआई द्वारा बुनियादी डिजिटलीकरण), स्तर 2 (कंप्यूटर बिलिंग, बारकोड व जीएसटी), तथा स्तर 3 (ओएनडीसी, बिजनेस एनालिटिक्स व डिजिटल विस्तार)।",
  },
  {
    id: "faq-3",
    category: "privacy",
    questionEn: "Is my business financial or sales data shared with government tax authorities?",
    questionHi: "क्या मेरी बिक्री या वित्तीय जानकारी आयकर या जीएसटी विभाग के साथ साझा की जाती है?",
    answerEn:
      "No. DigiMitra is an independent diagnostic and research platform. Your responses are strictly confidential, stored securely, and NEVER shared with tax departments, competitors, or marketing telemarketers.",
    answerHi:
      "बिल्कुल नहीं। डिजीमित्र एक स्वतंत्र शोध व सलाहकार मंच है। आपकी दी गई जानकारी पूर्णतः सुरक्षित और गोपनीय रहती है तथा इसे किसी भी कर विभाग या बाहरी कंपनी को नहीं भेजा जाता।",
  },
  {
    id: "faq-4",
    category: "roadmap",
    questionEn: "How are the recommendations prioritized into Phase 1, Phase 2, and Phase 3?",
    questionHi: "सिफारिशों को चरण 1, चरण 2 और चरण 3 में कैसे बांटा जाता है?",
    answerEn:
      "Our C4 Deterministic Engine calculates a mathematically transparent priority score using: Priority = (Goal Alignment × 0.40) + (Pain Relief × 0.35) + (RBDL Readiness × 0.25). Immediate, low-cost actions form Phase 1 (Quick Wins), while advanced integrations form Phase 3.",
    answerHi:
      "हमारा नियम-आधारित इंजन लक्ष्य, वर्तमान समस्या और तत्परता के आधार पर प्राथमिकता तय करता है। तुरंत लागू होने वाले व कम लागत के कदम चरण 1 (शीघ्र लाभ) में रखे जाते हैं, जबकि बड़े सुधार चरण 3 में आते हैं।",
  },
  {
    id: "faq-5",
    category: "schemes",
    questionEn: "Does DigiMitra guarantee loan or subsidy approvals under Udyam, ZED, or MLUPY?",
    questionHi: "क्या डिजीमित्र उद्यम, जेड (ZED) या राजस्थान MLUPY योजना में सब्सिडी मिलने की गारंटी देता है?",
    answerEn:
      "No. DigiMitra provides verified informational links and eligibility guidance for official government schemes. Applications, document verification, and subsidy approvals are handled exclusively by the respective government ministries and nodal banks.",
    answerHi:
      "नहीं। डिजीमित्र आधिकारिक सरकारी योजनाओं की केवल सत्यापित जानकारी व पात्रता मार्गदर्शन प्रदान करता है। सब्सिडी व लोन की मंजूरी केवल संबंधित सरकारी विभागों व बैंकों के नियमों के अधीन होती है।",
  },
  {
    id: "faq-6",
    category: "assessment",
    questionEn: "Can I retake the assessment after implementing recommendations?",
    questionHi: "डिजिटल सुधार लागू करने के बाद क्या मैं दोबारा मूल्यांकन कर सकता हूँ?",
    answerEn:
      "Yes! You can retake the assessment at any time from your dashboard or enterprise history page. DigiMitra will track your level progression and show score shifts across all 9 operational dimensions.",
    answerHi:
      "हाँ! आप जब चाहें दोबारा मूल्यांकन दे सकते हैं। डिजीमित्र आपके सुधार का तुलनात्मक विश्लेषण (Comparison) दिखाएगा कि 9 आयामों में आपका स्कोर कितना बढ़ा है।",
  },
];

export const ContactView: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";

  // Share modal state
  const [isShareOpen, setIsShareOpen] = useState(false);

  // FAQ state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  // Contact Form State
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("assessment");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Filter FAQs
  const filteredFaqs = useMemo(() => {
    return FAQS_DATA.filter((faq) => {
      const matchesCategory =
        selectedCategory === "all" || faq.category === selectedCategory;
      const q = currentLang === "hi" ? faq.questionHi : faq.questionEn;
      const a = currentLang === "hi" ? faq.answerHi : faq.answerEn;
      const matchesSearch =
        !searchQuery.trim() ||
        q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, currentLang]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError(currentLang === "hi" ? "कृपया अपना नाम दर्ज करें।" : "Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setFormError(currentLang === "hi" ? "कृपया वैध ईमेल आईडी दर्ज करें।" : "Please provide a valid email address.");
      return;
    }
    if (!message.trim() || message.length < 10) {
      setFormError(
        currentLang === "hi"
          ? "कृपया कम से कम 10 अक्षरों में अपना प्रश्न लिखें।"
          : "Please describe your inquiry in at least 10 characters."
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const ticketId = `DM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      setIsSubmitting(false);
      setSubmittedTicket(ticketId);
      setFullName("");
      setBusinessName("");
      setEmail("");
      setPhone("");
      setMessage("");
    }, 700);
  };

  return (
    <div className="space-y-10 sm:space-y-14 animate-fade-in pb-12">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-orange-950 p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-300 border border-orange-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              {currentLang === "hi" ? "सहायता व परामर्श केंद्र" : "Helpdesk & Advisory Support"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              {currentLang === "hi" ? "सत्यापित सहायता" : "Verified MSME Helpdesk"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-heading tracking-tight">
            {currentLang === "hi"
              ? "हमसे संपर्क करें और सहायता पाएं"
              : "Reach Out to DigiMitra Support"}
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
            {currentLang === "hi"
              ? "मूल्यांकन, 9 आयामों के स्कोर, सरकारी योजनाओं या तकनीकी सहायता के लिए हमारी सलाहकार टीम से संपर्क करें। नीचे दिए गए सामान्य प्रश्नों (FAQs) में भी तुरंत उत्तर देखें।"
              : "Have questions regarding your 14-question assessment, 9-dimension scores, official government MSME schemes, or technical assistance? We are here to guide you."}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsShareOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition"
            >
              <Share2 className="w-4 h-4" />
              <span>{currentLang === "hi" ? "डिजीमित्र साझा करें" : "Share DigiMitra"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Direct Contact Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Helpline */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {currentLang === "hi" ? "टोल-फ्री हेल्पलाइन" : "Toll-Free Helpline"}
              </p>
              <h4 className="text-sm font-bold text-stone-900">1800-180-2026</h4>
            </div>
          </div>
          <p className="text-xs text-stone-500">
            {currentLang === "hi"
              ? "सोम - शनि (प्रातः 9 से सायं 6 बजे तक)"
              : "Mon - Sat (9:00 AM - 6:00 PM IST)"}
          </p>
        </div>

        {/* Email */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {currentLang === "hi" ? "आधिकारिक ईमेल" : "Official Email"}
              </p>
              <h4 className="text-sm font-bold text-stone-900">support@digimitra.gov.in</h4>
            </div>
          </div>
          <p className="text-xs text-stone-500">
            {currentLang === "hi"
              ? "24 कार्य घंटों में विस्तृत उत्तर"
              : "Response within 24 working hours"}
          </p>
        </div>

        {/* Center */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {currentLang === "hi" ? "नोडल शोध केंद्र" : "Research Center"}
              </p>
              <h4 className="text-sm font-bold text-stone-900">Jaipur Innovation Hub</h4>
            </div>
          </div>
          <p className="text-xs text-stone-500">Rajasthan MSME Cell, Jaipur 302004</p>
        </div>

        {/* Working Hours */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                {currentLang === "hi" ? "सलाहकार समय" : "Advisory Hours"}
              </p>
              <h4 className="text-sm font-bold text-stone-900">Mon - Sat: 9 AM - 6 PM</h4>
            </div>
          </div>
          <p className="text-xs text-stone-500">
            {currentLang === "hi" ? "रविवार व राजपत्रित अवकाश बंद" : "Closed on Sundays & Public Holidays"}
          </p>
        </div>
      </div>

      {/* 3. Main Grid: FAQs on Left, Contact Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Frequently Asked Questions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-stone-900 tracking-tight flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-orange-600" />
                <span>{currentLang === "hi" ? "अक्सर पूछे जाने वाले प्रश्न (FAQs)" : "Frequently Asked Questions"}</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {currentLang === "hi"
                  ? "डिजीमित्र कार्यप्रणाली और योजनाओं से जुड़े त्वरित उत्तर"
                  : "Quick answers to common questions about DigiMitra and MSME digitalization"}
              </p>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  currentLang === "hi"
                    ? "प्रश्नों में खोजें (उदा. स्कोर, गोपनीयता, ओएनडीसी)..."
                    : "Search FAQs (e.g. score, privacy, ONDC, loan)..."
                }
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              {[
                { id: "all", labelEn: "All Topics", labelHi: "सभी प्रश्न" },
                { id: "assessment", labelEn: "Assessment & Scoring", labelHi: "मूल्यांकन व स्कोर" },
                { id: "privacy", labelEn: "Data Privacy", labelHi: "डेटा गोपनीयता" },
                { id: "roadmap", labelEn: "Roadmaps & Plans", labelHi: "रोडमैप व सुधार" },
                { id: "schemes", labelEn: "Govt Schemes", labelHi: "सरकारी योजनाएं" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-orange-600 text-white shadow-xs"
                      : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  {currentLang === "hi" ? cat.labelHi : cat.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
                {currentLang === "hi"
                  ? "आपकी खोज के अनुसार कोई प्रश्न नहीं मिला। कृपया दूसरा शब्द खोजें या नीचे दिए फॉर्म से पूछें।"
                  : "No matching questions found. Please try a different query or submit your question via the contact form."}
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                const question = currentLang === "hi" ? faq.questionHi : faq.questionEn;
                const answer = currentLang === "hi" ? faq.answerHi : faq.answerEn;
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border transition-all duration-200 bg-white ${
                      isOpen
                        ? "border-orange-300 shadow-sm"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-4"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
                        {question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-stone-400 transition-transform duration-200 flex-shrink-0 ${
                          isOpen ? "rotate-180 text-orange-600" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3 animate-fade-in">
                        {answer}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Contact & Inquiry Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold font-heading text-stone-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              <span>{currentLang === "hi" ? "सलाहकार से पूछें" : "Submit an Inquiry"}</span>
            </h2>
            <p className="text-xs text-stone-500">
              {currentLang === "hi"
                ? "हमारी टीम 24 कार्य घंटों में आपको फोन या ईमेल पर संपर्क करेगी।"
                : "Our advisory team will review your query and respond within 24 working hours."}
            </p>
          </div>

          {submittedTicket ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4 animate-fade-in text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-emerald-950">
                  {currentLang === "hi" ? "आपका प्रश्न प्राप्त हो गया है!" : "Inquiry Submitted Successfully!"}
                </h4>
                <p className="text-xs text-emerald-800">
                  {currentLang === "hi"
                    ? "आपका सहायता संदर्भ क्रमांक (Ticket ID) है:"
                    : "Your support reference tracking ID is:"}
                </p>
                <div className="inline-block px-3 py-1 bg-white font-mono font-bold text-xs text-emerald-900 rounded-lg border border-emerald-200 mt-1">
                  {submittedTicket}
                </div>
              </div>
              <p className="text-xs text-stone-500">
                {currentLang === "hi"
                  ? "एक पुष्टिकरण आपके दिए गए ईमेल पते पर भी भेज दिया गया है।"
                  : "A confirmation notification has been sent to your registered email address."}
              </p>
              <button
                onClick={() => setSubmittedTicket(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-xs"
              >
                {currentLang === "hi" ? "अन्य प्रश्न भेजें" : "Submit Another Inquiry"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">
                  {currentLang === "hi" ? "पूरा नाम *" : "Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={currentLang === "hi" ? "उदा. रमेश कुमार शर्मा" : "e.g. Ramesh Kumar Sharma"}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Business Name */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">
                  {currentLang === "hi" ? "दुकान / उद्यम का नाम" : "Enterprise / Shop Name"}
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={currentLang === "hi" ? "उदा. शर्मा किराना स्टोर" : "e.g. Sharma Kirana Store"}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Email & Phone grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">
                    {currentLang === "hi" ? "ईमेल आईडी *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">
                    {currentLang === "hi" ? "मोबाइल नंबर" : "Phone Number"}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">
                  {currentLang === "hi" ? "पूछताछ का विषय" : "Inquiry Category"}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  <option value="assessment">
                    {currentLang === "hi" ? "मूल्यांकन व 9-आयाम स्कोर" : "Assessment & 9-Dimension Scoring"}
                  </option>
                  <option value="roadmap">
                    {currentLang === "hi" ? "रोडमैप व तकनीकी उपकरण सुझाव" : "Roadmap & Recommended Tools"}
                  </option>
                  <option value="government">
                    {currentLang === "hi" ? "सरकारी एमएसएमई योजनाएं (उद्यम, जेड)" : "Government MSME Schemes (Udyam, ZED)"}
                  </option>
                  <option value="technical">
                    {currentLang === "hi" ? "तकनीकी समस्या या बग रिपोर्ट" : "Technical Support or Bug Report"}
                  </option>
                  <option value="research">
                    {currentLang === "hi" ? "शैक्षणिक व शोध साझेदारी" : "Academic & Research Collaboration"}
                  </option>
                </select>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">
                  {currentLang === "hi" ? "अपना प्रश्न या संदेश लिखें *" : "Your Question / Message *"}
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    currentLang === "hi"
                      ? "कृपया अपनी आवश्यकता या समस्या का संक्षेप में विवरण दें..."
                      : "Please describe how we can assist your enterprise..."
                  }
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{currentLang === "hi" ? "भेज रहे हैं..." : "Submitting Inquiry..."}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{currentLang === "hi" ? "संदेश भेजें" : "Send Inquiry"}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="DigiMitra MSME Digital Helpdesk & Consultant"
        description="Free diagnostic assessment, 9-dimension maturity classification, and customized roadmaps for Indian local businesses."
        shareUrl={window?.location?.origin || "http://localhost:5173"}
        currentLang={currentLang}
      />
    </div>
  );
};
