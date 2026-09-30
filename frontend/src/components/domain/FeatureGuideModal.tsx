import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Compass,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Target,
  ShieldCheck,
  Layers,
  HeartHandshake,
} from "lucide-react";

export type FeatureGuideType = "roadmap" | "recommendations" | "diagnostic";

interface FeatureGuideModalProps {
  type: FeatureGuideType | null;
  isOpen: boolean;
  onClose: () => void;
  currentLang?: "en" | "hi";
}

export const FeatureGuideModal: React.FC<FeatureGuideModalProps> = ({
  type,
  isOpen,
  onClose,
  currentLang = "en",
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"vision" | "phases" | "howItWorks">("vision");

  if (!isOpen || !type) return null;

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const isRoadmap = type === "roadmap";

  const content = {
    roadmap: {
      badgeEn: "Transformation Roadmap Guide",
      badgeHi: "डिजिटलीकरण रोडमैप गाइड",
      titleEn: "Your Phased MSME Digitalization Roadmap",
      titleHi: "आपकी दुकान व व्यवसाय का चरणबद्ध रोडमैप",
      icon: <Compass className="w-6 h-6 text-teal-600" />,
      themeColor: "from-teal-900 via-stone-900 to-stone-900",
      accentBg: "bg-teal-50 border-teal-200 text-teal-900",
      inspiringThoughtEn:
        "“Digitalization is not about buying every complicated software at once. It is about taking the single next high-impact step that saves 2 hours daily and protects your cash flow.”",
      inspiringThoughtHi:
        "“डिजिटलीकरण का अर्थ एक साथ सभी महंगे सॉफ्टवेयर खरीदना नहीं है — बल्कि वह एक अगला महत्वपूर्ण कदम उठाना है जो प्रतिदिन 2 घंटे बचाए और आपका नकद प्रवाह सुरक्षित रखे।”",
      authorEn: "DigiMitra MSME Transformation Philosophy",
      authorHi: "डिजीमित्र एमएसएमई रूपांतरण दर्शन",
      descriptionEn:
        "A customized 3-phase journey plan built around your exact business category, current digital readiness (Level 0 to 3), and monthly budget. Track tasks as you implement them, mark milestones completed, and watch your readiness level advance.",
      descriptionHi:
        "आपकी दुकान के सेक्टर, वर्तमान परिपक्वता (स्तर 0 से 3) और वास्तविक बजट के अनुसार तैयार 3 चरणों का एक्शन प्लान। जैसे-जैसे कदम पूरे होते जाएं, उन्हें पूर्ण चिह्नित करें और अपने व्यवसाय की प्रगति देखें।",
      phases: [
        {
          num: "01",
          nameEn: "Phase 1: Quick Wins (Days 1–30)",
          nameHi: "चरण 1: त्वरित लाभ (दिन 1–30)",
          budgetEn: "Cost: ₹0 to ₹2,000",
          budgetHi: "लागत: ₹0 से ₹2,000",
          descEn:
            "Instant-impact actions that require minimal technical skills: Google Business Profile verification, voice payment soundbox on counter, and WhatsApp Business catalog.",
          descHi:
            "तत्काल प्रभाव वाले बुनियादी कदम: गूगल मैप्स पर दुकान की लिस्टिंग, काउंटर पर आवाज वाला पेमेंट साउंडबॉक्स और व्हाट्सएप बिजनेस कैटलॉग।",
        },
        {
          num: "02",
          nameEn: "Phase 2: Operational Core (Months 1–3)",
          nameHi: "चरण 2: सुदृढ़ संचालन (माह 1–3)",
          budgetEn: "Cost: ₹2,000 to ₹15,000",
          budgetHi: "लागत: ₹2,000 से ₹15,000",
          descEn:
            "Streamlining daily sales and bookkeeping: handheld thermal printer, mobile GST billing app, digital khata udhar reminders, and low-stock alerts.",
          descHi:
            "दैनिक बिक्री और हिसाब का डिजिटलीकरण: थर्मल रसीद प्रिंटर, मोबाइल जीएसटी बिलिंग ऐप, उधारी तकादा एसएमएस और स्टॉक कमी की चेतावनी।",
        },
        {
          num: "03",
          nameEn: "Phase 3: Strategic Growth (Months 3–6)",
          nameHi: "चरण 3: रणनीतिक व्यापार विस्तार (माह 3–6)",
          budgetEn: "Cost: ₹10,000+",
          budgetHi: "लागत: ₹10,000+",
          descEn:
            "Opening new revenue channels beyond your physical locality: ONDC seller onboarding, GeM government procurement registration, and customer repeat purchase analytics.",
          descHi:
            "दुकान के दायरे से बाहर देश भर में नए ग्राहक: ओएनडीसी (ONDC) सेलर लिस्टिंग, सरकारी जेम पोर्टल पर सप्लायर रजिस्ट्रेशन और ग्राहक रिपीट खरीदारी का विश्लेषण।",
        },
      ],
      features: [
        {
          titleEn: "One-Level-Above Rule",
          titleHi: "एक स्तर ऊपर का वैज्ञानिक नियम",
          descEn: "Never recommends advanced Level 3 systems before foundational Level 1 basics are mastered.",
          descHi: "जब तक बुनियादी स्तर 1 मजबूत न हो, तब तक जटिल स्तर 3 सॉफ्टवेयर का सुझाव नहीं दिया जाता।",
        },
        {
          titleEn: "Auditable Progress Tracking",
          titleHi: "सत्यापित प्रगति ट्रैकिंग",
          descEn: "Mark tasks In Progress, Completed, or Skipped with explicit reasons for research fidelity.",
          descHi: "प्रत्येक कार्य को 'प्रगति में', 'पूर्ण', या 'छोड़ा गया' दर्ज कर वास्तविक सुधार ट्रैक करें।",
        },
        {
          titleEn: "Version Comparison & History",
          titleHi: "संस्करण तुलना व इतिहास",
          descEn: "Compare previous roadmaps and watch 9-dimension score shifts over 3, 6, and 12 months.",
          descHi: "पिछले रोडमैप से तुलना कर 9 आयामों में स्कोर सुधार का वास्तविक अंतर देखें।",
        },
      ],
      primaryRoute: "/roadmap",
      primaryLabelEn: "Open Transformation Roadmap",
      primaryLabelHi: "रोडमैप पेज पर जाएं",
      secondaryRoute: "/assessment",
      secondaryLabelEn: "Start Assessment (Generate Roadmap)",
      secondaryLabelHi: "मूल्यांकन शुरू करें (रोडमैप बनाएं)",
    },
    recommendations: {
      badgeEn: "Recommendation Engine Guide",
      badgeHi: "सिफारिश प्रणाली गाइड",
      titleEn: "Deterministic, Explainable MSME Recommendations",
      titleHi: "पारदर्शी व व्यावहारिक डिजिटल सिफारिशें",
      icon: <Zap className="w-6 h-6 text-amber-600" />,
      themeColor: "from-amber-950 via-stone-900 to-stone-900",
      accentBg: "bg-amber-50 border-amber-200 text-amber-900",
      inspiringThoughtEn:
        "“A single right digital tool suited to your shop will give you 10x more peace of mind than 5 complex apps you and your staff cannot manage.”",
      inspiringThoughtHi:
        "“आपकी दुकान के अनुकूल एक सही डिजिटल उपकरण, उन 5 जटिल ऐप्स से 10 गुना अधिक शांति व मुनाफा देता है जिन्हें आप या आपका स्टाफ संभाल नहीं सकते।”",
      authorEn: "DigiMitra Advisory Principles",
      authorHi: "डिजीमित्र सलाहकार सिद्धांत",
      descriptionEn:
        "DigiMitra's C4 Deterministic Engine filters through 20 curated MSME interventions using strict eligibility rules, budget tiers, and mathematical priority weighting. Every recommendation comes with clear explainability, cost estimates, and expected time-to-value.",
      descriptionHi:
        "डिजीमित्र का नियम-आधारित इंजन 20 व्यावहारिक डिजिटल उपायों में से आपकी दुकान के लिए सबसे उपयोगी टूल्स चुनता है। प्रत्येक सिफारिश के साथ उसकी स्पष्ट लागत, संभावित लाभ और चुनने का सटीक कारण बताया जाता है।",
      phases: [
        {
          num: "40%",
          nameEn: "Goal Alignment Weight",
          nameHi: "व्यावसायिक लक्ष्य अनुकूलता (40%)",
          budgetEn: "Tailored to Your Ambition",
          budgetHi: "आपके उद्देश्य अनुसार",
          descEn:
            "Matches whether your immediate priority is attracting new walk-ins, stopping udhar leakage, cutting billing errors, or expanding online.",
          descHi:
            "यह देखता है कि आपका तात्कालिक लक्ष्य दुकान पर ग्राहक बढ़ाना है, उधारी का पैसा वसूलना है या बिलिंग गलतियां कम करना है।",
        },
        {
          num: "35%",
          nameEn: "Pain Point Relief Weight",
          nameHi: "समस्या निवारण प्राथमिकता (35%)",
          budgetEn: "Relieves Daily Friction",
          budgetHi: "दैनिक रुकावटों का समाधान",
          descEn:
            "Prioritizes actions that directly resolve bottlenecks you reported during diagnostic profiling.",
          descHi:
            "उन कार्यों को पहले रखता है जो आपके द्वारा बताई गई दैनिक दुकान संचालन की सबसे बड़ी समस्या को तुरंत हल करें।",
        },
        {
          num: "25%",
          nameEn: "RBDL Readiness & Prerequisites",
          nameHi: "तत्परता व बुनियादी शर्तें (25%)",
          budgetEn: "No Premature Complexity",
          budgetHi: "बिना तैयारी के जटिलता नहीं",
          descEn:
            "Guarantees that prerequisite tasks (like smartphone & internet) are solved before hardware scanners are suggested.",
          descHi:
            "यह सुनिश्चित करता है कि बेसिक स्मार्टफोन व इंटरनेट होने के बाद ही कंप्यूटर बिलिंग जैसी बड़ी चीजें सुझाई जाएं।",
        },
      ],
      features: [
        {
          titleEn: "100% Explainable Advice",
          titleHi: "100% पारदर्शी और कारण सहित",
          descEn: "No black-box mystery: see exactly why a tool was chosen and what return on investment to expect.",
          descHi: "कोई गुप्त एल्गोरिदम नहीं: हर सुझाव के साथ लिखा है कि यह आपकी दुकान के लिए क्यों जरूरी है।",
        },
        {
          titleEn: "Budget Safety Guardrails",
          titleHi: "बजट सुरक्षा का सख्त नियम",
          descEn: "Interventions exceeding your stated monthly investment budget are tagged 'DEFER_DUE_TO_BUDGET'.",
          descHi: "आपके बताए बजट से अधिक लागत वाले टूल्स को तब तक टाल दिया जाता है जब तक व्यवसाय तैयार न हो।",
        },
        {
          titleEn: "Verified Local & National Tools",
          titleHi: "सत्यापित भारतीय टूल्स व ऐप्स",
          descEn: "Covers trusted Indian MSME solutions: UPI, Vyapar, Khatabook, Google Business, ONDC, and GeM.",
          descHi: "भारत में लोकप्रिय व भरोसेमंद टूल्स: यूपीआई, व्यापार, खाता-बुक, गूगल मैप्स, ओएनडीसी और जेम।",
        },
      ],
      primaryRoute: "/recommendations",
      primaryLabelEn: "Open Recommendations Page",
      primaryLabelHi: "सिफारिशें पेज पर जाएं",
      secondaryRoute: "/assessment",
      secondaryLabelEn: "Take 3-Min Assessment First",
      secondaryLabelHi: "पहले 3 मिनट का मूल्यांकन लें",
    },
    diagnostic: {
      badgeEn: "Diagnostic Assessment Guide",
      badgeHi: "डिजिटल मूल्यांकन गाइड",
      titleEn: "Comprehensive 14-Question MSME Diagnostic",
      titleHi: "14 व्यावहारिक प्रश्नों का डिजिटल मूल्यांकन",
      icon: <Sparkles className="w-6 h-6 text-orange-600" />,
      themeColor: "from-orange-950 via-stone-900 to-stone-900",
      accentBg: "bg-orange-50 border-orange-200 text-orange-900",
      inspiringThoughtEn:
        "“Knowing where you stand today is the first and most critical step towards building a resilient, profitable tomorrow.”",
      inspiringThoughtHi:
        "“यह जानना कि आज आप कहां खड़े हैं, एक मजबूत और लाभदायक भविष्य के निर्माण का पहला व सबसे महत्वपूर्ण कदम है।”",
      authorEn: "DigiMitra Diagnostic Framework",
      authorHi: "डिजीमित्र मूल्यांकन ढांचा",
      descriptionEn:
        "A practical, non-intrusive 3-minute diagnostic covering hardware, internet, billing, payments, staff literacy, and online presence. Takes only 3 minutes and outputs your objective RBDL level (0 to 3).",
      descriptionHi:
        "आपकी दुकान के हार्डवेयर, इंटरनेट, बिलिंग, भुगतान, स्टाफ और ऑनलाइन उपस्थिति का 3 मिनट का सरल व निष्पक्ष परीक्षण।",
      phases: [],
      features: [],
      primaryRoute: "/assessment",
      primaryLabelEn: "Start Assessment Now",
      primaryLabelHi: "अभी मूल्यांकन शुरू करें",
      secondaryRoute: "/businesses",
      secondaryLabelEn: "View My Enterprises",
      secondaryLabelHi: "मेरे उद्यम देखें",
    },
  };

  const item = content[type];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner with Inspiring Theme */}
        <div className={`p-6 sm:p-7 bg-gradient-to-br ${item.themeColor} text-white relative`}>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-orange-200 border border-white/20">
              {currentLang === "hi" ? item.badgeHi : item.badgeEn}
            </span>
            <h3
              id="guide-modal-title"
              className="text-xl sm:text-2xl font-bold font-heading tracking-tight"
            >
              {currentLang === "hi" ? item.titleHi : item.titleEn}
            </h3>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 px-6 bg-white text-xs font-semibold gap-4">
          <button
            onClick={() => setActiveTab("vision")}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "vision"
                ? "border-orange-600 text-orange-600 font-bold"
                : "border-transparent text-stone-500 hover:text-stone-900"
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>{currentLang === "hi" ? "उद्देश्य व प्रेरणा" : "Inspiring Thought & Vision"}</span>
          </button>
          {item.phases.length > 0 && (
            <button
              onClick={() => setActiveTab("phases")}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "phases"
                  ? "border-orange-600 text-orange-600 font-bold"
                  : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {isRoadmap
                  ? currentLang === "hi"
                    ? "3 चरण (3 Phases)"
                    : "The 3 Phases"
                  : currentLang === "hi"
                  ? "प्राथमिकता सूत्र"
                  : "Priority Formula"}
              </span>
            </button>
          )}
          {item.features.length > 0 && (
            <button
              onClick={() => setActiveTab("howItWorks")}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === "howItWorks"
                  ? "border-orange-600 text-orange-600 font-bold"
                  : "border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>{currentLang === "hi" ? "सुरक्षा व सिद्धांत" : "Key Principles"}</span>
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-stone-700 text-xs sm:text-sm">
          {activeTab === "vision" && (
            <div className="space-y-4">
              {/* Encouraging Thought Box */}
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
                <p className="text-sm sm:text-base font-semibold text-amber-950 italic leading-relaxed">
                  {currentLang === "hi" ? item.inspiringThoughtHi : item.inspiringThoughtEn}
                </p>
                <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider text-right">
                  — {currentLang === "hi" ? item.authorHi : item.authorEn}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-stone-600 leading-relaxed text-xs sm:text-sm">
                <h4 className="font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>{currentLang === "hi" ? "यह आपके लिए क्या करता है?" : "What this provides for your enterprise:"}</span>
                </h4>
                <p>{currentLang === "hi" ? item.descriptionHi : item.descriptionEn}</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <span className="font-bold block mb-0.5">
                    {currentLang === "hi" ? "पारदर्शी व व्यावहारिक दृष्टिकोण" : "Transparent & Realistic Approach"}
                  </span>
                  {currentLang === "hi"
                    ? "बिना किसी एजेंट या कमीशन के, यह आपको सीधे स्पष्ट सिफारिशें और अगले 90 दिनों की चरणबद्ध कार्ययोजना देता है।"
                    : "No agency sales pressure and zero platform bias. Gives you direct, step-by-step guidance tailored for Indian local business realities."}
                </div>
              </div>
            </div>
          )}

          {activeTab === "phases" && item.phases.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-stone-500 font-medium">
                {isRoadmap
                  ? currentLang === "hi"
                    ? "आपका रोडमैप 3 स्वाभाविक और व्यावहारिक चरणों में विकसित होता है:"
                    : "Your transformation roadmap is structured into 3 actionable horizons:"
                  : currentLang === "hi"
                  ? "सिफारिशों की प्राथमिकता का गणितीय सूत्र:"
                  : "How recommendations are objectively ranked without bias:"}
              </p>

              <div className="space-y-3">
                {item.phases.map((phase, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-stone-200 bg-white shadow-2xs space-y-1.5 hover:border-orange-300 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 font-extrabold flex items-center justify-center text-xs">
                          {phase.num}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                          {currentLang === "hi" ? phase.nameHi : phase.nameEn}
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                        {currentLang === "hi" ? phase.budgetHi : phase.budgetEn}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed pl-10">
                      {currentLang === "hi" ? phase.descHi : phase.descEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "howItWorks" && item.features.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-stone-500 font-medium">
                {currentLang === "hi"
                  ? "डिजीमित्र के मूल तकनीकी सिद्धांत और सुरक्षा मानक:"
                  : "Core principles engineered to protect small business resources:"}
              </p>

              <div className="grid grid-cols-1 gap-3">
                {item.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-stone-200 bg-white shadow-2xs space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                        {currentLang === "hi" ? feat.titleHi : feat.titleEn}
                      </h4>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed pl-6">
                      {currentLang === "hi" ? feat.descHi : feat.descEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Bar with Direct Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => handleNavigate(item.secondaryRoute)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-200/70 border border-stone-200 transition"
          >
            {currentLang === "hi" ? item.secondaryLabelHi : item.secondaryLabelEn}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200/70 border border-stone-200 transition"
            >
              {currentLang === "hi" ? "बंद करें" : "Close"}
            </button>
            <button
              onClick={() => handleNavigate(item.primaryRoute)}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/20 transition flex items-center justify-center gap-1.5"
            >
              <span>{currentLang === "hi" ? item.primaryLabelHi : item.primaryLabelEn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
