import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Compass,
  Activity,
  Layers,
  Building2,
  Smartphone,
  ChevronRight,
  Calculator,
  Palette,
} from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { LevelCard } from "../components/domain/LevelCard";
import { DimensionCard } from "../components/domain/DimensionCard";
import { Section } from "../components/layout/Section";
import { HealthCard } from "../components/HealthCard";
import { MsmeClassificationCalculator } from "../components/domain/MsmeClassificationCalculator";
import { useTheme, MsmeThemeId } from "../context/ThemeContext";
import { MSME_SECTORS } from "../data/msmeTaxonomy";

export const Dashboard: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showCalculatorSection, setShowCalculatorSection] = useState(false);
  const { theme, themeId, setThemeId, availableThemes } = useTheme();

  const rbdlLevels = [
    {
      level: 0,
      nameEn: "Foundational Readiness",
      nameHi: "बुनियादी तत्परता",
      descriptionEn: "Traditional manual operations relying on pen-and-paper ledgers, cash transactions, and offline footfall.",
      descriptionHi: "पारंपरिक बहीखाता, नकद लेनदेन और ऑफ़लाइन ग्राहकों पर निर्भर पारंपरिक संचालन।",
      capabilitiesEn: ["Manual Cash Book", "Basic Feature Phone", "Direct Walk-in Sales"],
      capabilitiesHi: ["मैन्युअल रोकड़ बही", "साधारण फोन", "प्रत्यक्ष दुकान बिक्री"],
    },
    {
      level: 1,
      nameEn: "Basic Digital Presence",
      nameHi: "प्राथमिक डिजिटल उपस्थिति",
      descriptionEn: "Core smartphone connectivity, digital UPI QR acceptance, and basic local discovery on Google Maps / WhatsApp.",
      descriptionHi: "समर्पित स्मार्टफोन, यूपीआई क्यूआर कोड और गूगल मैप्स/व्हाट्सएप पर व्यावसायिक उपस्थिति।",
      capabilitiesEn: ["Dedicated Smartphone", "UPI Payment QR", "WhatsApp Business"],
      capabilitiesHi: ["समर्पित स्मार्टफोन", "यूपीआई भुगतान क्यूआर", "व्हाट्सएप बिजनेस"],
    },
    {
      level: 2,
      nameEn: "Operational Digitalization",
      nameHi: "परिचालन डिजिटलीकरण",
      descriptionEn: "Structured app-based bookkeeping, digital inventory tracking, and systematic customer order communications.",
      descriptionHi: "डिजिटल खाता-बही ऐप, स्टॉक प्रबंधन और ग्राहकों के साथ व्यवस्थित डिजिटल संचार।",
      capabilitiesEn: ["Khatabook / Vyapar", "Stock Ledger Apps", "Multi-modal Invoicing"],
      capabilitiesHi: ["खाताबुक / व्यापार ऐप", "डिजिटल स्टॉक रजिस्टर", "मल्टी-मोडल बिलिंग"],
    },
    {
      level: 3,
      nameEn: "Growth & Data Optimization",
      nameHi: "विकास व डेटा संचालित संचालन",
      descriptionEn: "Sales trend analytics, marketplace integrations (ONDC / GeM), integrated CRM, and automated re-ordering.",
      descriptionHi: "बिक्री डेटा विश्लेषण, ओएनडीसी/जेम मार्केटप्लेस एकीकरण और स्वचालित ग्राहक जुड़ाव।",
      capabilitiesEn: ["Sales Analytics", "ONDC & GeM Catalog", "Automated Inventory"],
      capabilitiesHi: ["बिक्री व लाभ विश्लेषण", "ओएनडीसी / जेम मार्केटप्लेस", "स्वचालित इन्वेंट्री"],
    },
  ];

  const dimensions = [
    {
      code: "infra",
      nameEn: "Digital Infrastructure",
      nameHi: "डिजिटल इन्फ्रास्ट्रक्चर",
      descEn: "Smartphones, computers, broadband, and reliable cloud connectivity.",
      descHi: "स्मार्टफोन, कंप्यूटर, ब्रॉडबैंड इंटरनेट और सुरक्षित कनेक्टिविटी।",
    },
    {
      code: "literacy",
      nameEn: "Digital Literacy & Skills",
      nameHi: "डिजिटल साक्षरता व कौशल",
      descEn: "Owner and staff confidence using enterprise apps and troubleshooting.",
      descHi: "मालिक और कर्मचारियों का व्यावसायिक ऐप्स का उपयोग करने में आत्मविश्वास।",
    },
    {
      code: "presence",
      nameEn: "Online Presence & Maps",
      nameHi: "ऑनलाइन उपस्थिति एवं खोज",
      descEn: "Google Business profile, localized SEO, and search visibility.",
      descHi: "गूगल बिजनेस प्रोफाइल, स्थानीय खोज और ऑनलाइन पहचान।",
    },
    {
      code: "comms",
      nameEn: "Customer Communication",
      nameHi: "ग्राहक डिजिटल संचार",
      descEn: "WhatsApp Business catalog, automated updates, and customer chat.",
      descHi: "व्हाट्सएप बिजनेस कैटलॉग, त्वरित संदेश और ग्राहक सहायता।",
    },
    {
      code: "records",
      nameEn: "Bookkeeping & Records",
      nameHi: "डिजिटल बहीखाता व हिसाब",
      descEn: "Digital ledger apps, GST billing, and real-time cash flow records.",
      descHi: "डिजिटल बहीखाता ऐप, जीएसटी बिलिंग और वास्तविक समय का हिसाब।",
    },
    {
      code: "payments",
      nameEn: "Payment Systems",
      nameHi: "डिजिटल भुगतान प्रणाली",
      descEn: "UPI QR soundboxes, POS terminals, and online payment links.",
      descHi: "यूपीआई क्यूआर साउंडबॉक्स, पीओएस मशीन और ऑनलाइन भुगतान लिंक।",
    },
    {
      code: "inventory",
      nameEn: "Inventory Operations",
      nameHi: "स्टॉक व इन्वेंट्री प्रबंधन",
      descEn: "Barcode scanning, stock alerts, and automated reorder tracking.",
      descHi: "बारकोड स्कैनिंग, स्टॉक अलर्ट और डिजिटल इन्वेंट्री रिकॉर्ड।",
    },
    {
      code: "analytics",
      nameEn: "Data & Sales Analytics",
      nameHi: "डेटा व बिक्री विश्लेषण",
      descEn: "Fast-selling item insights, seasonal forecasting, and profit trends.",
      descHi: "सर्वाधिक बिकने वाले उत्पादों की जानकारी और लाभ का विश्लेषण।",
    },
    {
      code: "growth",
      nameEn: "Marketplaces & Growth",
      nameHi: "मार्केटप्लेस व व्यापार विस्तार",
      descEn: "Catalog listing on ONDC, GeM, B2B portals, and digital marketing.",
      descHi: "ओएनडीसी, जेम पोर्टल पर उत्पाद लिस्टिंग और डिजिटल मार्केटिंग।",
    },
  ];

  const steps = [
    {
      step: "01",
      titleEn: "Assess",
      titleHi: "मूल्यांकन करें",
      descEn: "Answer 14 simple multiple-choice questions about your shop, clinic, or firm.",
      descHi: "दैनिक व्यवसाय संचालन से जुड़े 14 व्यावहारिक प्रश्नों का 3 मिनट में उत्तर दें।",
    },
    {
      step: "02",
      titleEn: "Understand",
      titleHi: "कमियां समझें",
      descEn: "Get deterministic RBDL Level classification & 9-dimension gap scores.",
      descHi: "9 आयामों में सटीक स्कोरिंग, ताकतें और सुधार के प्रमुख क्षेत्रों की पहचान।",
    },
    {
      step: "03",
      titleEn: "Get Recommendations",
      titleHi: "सुझाव प्राप्त करें",
      descEn: "Discover high-impact digital interventions tailored to your sector & budget.",
      descHi: "लागत, प्रभाव और प्रयास के आधार पर प्राथमिकता प्राप्त डिजिटल सिफारिशें।",
    },
    {
      step: "04",
      titleEn: "Follow Your Roadmap",
      titleHi: "रोडमैप अपनाएं",
      descEn: "Execute structured phased milestones with 1-click status tracking.",
      descHi: "त्वरित परिणाम (Quick Wins) से लेकर रणनीतिक लक्ष्यों तक चरणबद्ध कार्य पूरे करें।",
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 animate-fadeIn">
      {/* 1. High-Energy Vibrant Brand Hero Banner (Dynamic MSME Color Theme Engine) */}
      <section
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${theme.heroGradient} text-white p-6 sm:p-10 lg:p-12 shadow-xl transition-all duration-500`}
      >
        {/* Subtle decorative background circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Top Badges & MSME Theme Palette Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Requirement-Based Digitalization (RBDL)</span>
            </div>

            {/* Live Theme Swatch Pills */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/20 text-xs font-medium text-white/90">
              <Palette className="w-3.5 h-3.5 text-white/80 mr-1" />
              <span className="text-[11px] hidden sm:inline">Theme:</span>
              {availableThemes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setThemeId(t.id as MsmeThemeId)}
                  title={currentLang === "hi" ? t.nameHi : t.nameEn}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    themeId === t.id
                      ? "border-white scale-125 shadow-md"
                      : "border-white/40 opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: t.primaryHex }}
                />
              ))}
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-heading tracking-tight leading-[1.15]">
            {currentLang === "hi"
              ? "डिजिटलीकरण करें अपने व्यापार का। आगे बढ़ें DigiMitra के साथ!"
              : "Digitalize your business, one step at a time. DigiMitra it!"}
          </h1>

          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-medium">
            {currentLang === "hi"
              ? "अपनी डिजिटल तत्परता का 3 मिनट में मुफ्त मूल्यांकन करें, व्यावहारिक कमियों की पहचान करें और चरणबद्ध रोडमैप प्राप्त करें।"
              : "Understand your digital readiness, identify biggest operational gaps, and get a tailored step-by-step roadmap built for Indian MSMEs."}
          </p>

          {/* Interactive Fast-Action Search & Selection Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-2xl flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 w-full sm:w-auto text-[#241C15] font-bold text-xs sm:text-sm border-b sm:border-b-0 sm:border-r border-[#EDE2D8]">
              <Building2
                className="w-4 h-4 shrink-0"
                style={{ color: theme.primaryHex }}
              />
              <span className="truncate">Sharma Silk Sarees, Jaipur</span>
            </div>

            <div className="flex-1 w-full flex items-center px-3 py-2 text-xs sm:text-sm text-[#6B5D52]">
              <span className="truncate">Evaluate payments, records, online presence...</span>
            </div>

            <Link to="/assessment" className="w-full sm:w-auto shrink-0">
              <button
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: theme.primaryHex }}
              >
                <span>{currentLang === "hi" ? "मूल्यांकन शुरू करें" : "Start Assessment"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* 3 Main Action Cards (Direct Product Category Style) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-6 text-left">
            {/* Card 1: Assessment */}
            <Link
              to="/assessment"
              className="p-6 rounded-3xl bg-white text-[#241C15] shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div>
                <h3 className="text-xl font-black font-heading uppercase tracking-tight text-[#241C15]">
                  DIGITAL ASSESSMENT
                </h3>
                <p className="text-xs text-[#6B5D52] font-semibold mt-0.5">
                  14 QUESTIONS • 3 MINUTES
                </p>
                <div
                  className="mt-2 inline-block px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase"
                  style={{
                    backgroundColor: theme.primaryLightHex,
                    color: theme.primaryHex,
                  }}
                >
                  100% FREE FOR MSMES
                </div>
              </div>

              <div className="flex items-end justify-between pt-2">
                <div
                  className="w-10 h-10 rounded-full text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: theme.primaryHex }}
                >
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div
                  className="p-2.5 rounded-2xl"
                  style={{
                    backgroundColor: theme.bgSurfaceAltHex,
                    color: theme.primaryHex,
                  }}
                >
                  <Smartphone className="w-8 h-8" />
                </div>
              </div>
            </Link>

            {/* Card 2: Roadmap */}
            <Link
              to="/roadmap"
              className="p-6 rounded-3xl bg-white text-[#241C15] shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div>
                <h3 className="text-xl font-black font-heading uppercase tracking-tight text-[#241C15]">
                  TRANSFORMATION ROADMAP
                </h3>
                <p className="text-xs text-[#6B5D52] font-semibold mt-0.5">
                  PHASED MILESTONES • QUICK WINS
                </p>
                <div className="mt-2 inline-block px-2.5 py-0.5 rounded-md bg-[#DCF2EE] text-[#1B7A6E] text-[11px] font-extrabold uppercase">
                  PROGRESS TRACKING
                </div>
              </div>

              <div className="flex items-end justify-between pt-2">
                <div
                  className="w-10 h-10 rounded-full text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: theme.primaryHex }}
                >
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div className="p-2.5 rounded-2xl bg-[#DCF2EE] text-[#1B7A6E]">
                  <Compass className="w-8 h-8" />
                </div>
              </div>
            </Link>

            {/* Card 3: Recommendations */}
            <Link
              to="/recommendations"
              className="p-6 rounded-3xl bg-white text-[#241C15] shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div>
                <h3 className="text-xl font-black font-heading uppercase tracking-tight text-[#241C15]">
                  RECOMMENDATIONS
                </h3>
                <p className="text-xs text-[#6B5D52] font-semibold mt-0.5">
                  DETERMINISTIC & EXPLAINABLE
                </p>
                <div className="mt-2 inline-block px-2.5 py-0.5 rounded-md bg-[#FBF1DD] text-[#C88A1D] text-[11px] font-extrabold uppercase">
                  TAILORED TOOLS
                </div>
              </div>

              <div className="flex items-end justify-between pt-2">
                <div
                  className="w-10 h-10 rounded-full text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: theme.primaryHex }}
                >
                  <ArrowRight className="w-5 h-5" />
                </div>
                <div className="p-2.5 rounded-2xl bg-[#FBF1DD] text-[#C88A1D]">
                  <Zap className="w-8 h-8" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Interactive MSME Turnover & Eligibility Checker Tool */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EDE2D8] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: theme.primaryLightHex,
                  color: theme.primaryHex,
                }}
              >
                Interactive Tool
              </span>
              <span className="text-xs text-stone-500 font-semibold">
                Ministry of MSME Standards
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#241C15] font-heading">
              {currentLang === "hi"
                ? "उद्यम टर्नओवर एवं पात्रता जांचें"
                : "Check Your MSME Classification & Eligibility"}
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5D52]">
              {currentLang === "hi"
                ? "कस्टम टर्नओवर दर्ज करें और जानें कि आपका व्यवसाय सूक्ष्म (Micro), लघु (Small), मध्यम (Medium) या बड़ा उद्यम है।"
                : "Enter your enterprise turnover and investment to instantly verify official MSME status under Govt of India norms."}
            </p>
          </div>

          <button
            onClick={() => setShowCalculatorSection(!showCalculatorSection)}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-stone-300 hover:border-stone-400 bg-stone-50 text-stone-800 transition flex items-center gap-1.5 shrink-0"
          >
            <Calculator className="w-4 h-4 text-orange-600" />
            <span>
              {showCalculatorSection
                ? currentLang === "hi"
                  ? "टूल बंद करें"
                  : "Close Tool"
                : currentLang === "hi"
                ? "टर्नओवर कैलकुलेटर खोलें"
                : "Open Calculator"}
            </span>
          </button>
        </div>

        {showCalculatorSection && (
          <div className="pt-2 animate-fadeIn">
            <MsmeClassificationCalculator
              onSelectCategory={() => navigate("/businesses")}
            />
          </div>
        )}
      </section>

      {/* 3. RBDL Journey (Levels 0–3 Cards) */}
      <Section
        id="rbdl-journey"
        badge={
          <Badge variant="brand" size="sm" icon={<Layers className="w-3 h-3 mr-1" />}>
            RBDL Architecture
          </Badge>
        }
        title={
          currentLang === "hi"
            ? "आपकी डिजिटल परिपक्वता यात्रा"
            : "Your Digitalization Journey"
        }
        subtitle={
          currentLang === "hi"
            ? "बुनियादी तत्परता से लेकर डेटा-संचालित विकास तक 4 क्रमिक स्तर।"
            : "Move from foundational readiness to data-driven growth through 4 progressive stages."
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {rbdlLevels.map((lvl) => (
            <LevelCard
              key={lvl.level}
              level={lvl.level}
              nameEn={lvl.nameEn}
              nameHi={lvl.nameHi}
              descriptionEn={lvl.descriptionEn}
              descriptionHi={lvl.descriptionHi}
              capabilitiesEn={lvl.capabilitiesEn}
              capabilitiesHi={lvl.capabilitiesHi}
              currentLang={currentLang}
            />
          ))}
        </div>
      </Section>

      {/* 4. Nine Digitalization Dimensions Grid */}
      <Section
        badge={
          <Badge variant="success" size="sm" icon={<Zap className="w-3 h-3 mr-1" />}>
            9 Operational Pillars
          </Badge>
        }
        title={
          currentLang === "hi"
            ? "डिजीमित्र क्या मूल्यांकन करता है"
            : "What DigiMitra Evaluates"
        }
        subtitle={
          currentLang === "hi"
            ? "आपके व्यवसाय के 9 आवश्यक डिजिटल पहलुओं का व्यापक और पारदर्शी विश्लेषण।"
            : "A comprehensive diagnostic inspecting hardware readiness, operational workflows, and digital sales channels."
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dimensions.map((dim) => (
            <DimensionCard
              key={dim.code}
              code={dim.code}
              nameEn={dim.nameEn}
              nameHi={dim.nameHi}
              descriptionEn={dim.descEn}
              descriptionHi={dim.descHi}
              currentLang={currentLang}
            />
          ))}
        </div>
      </Section>

      {/* 5. How DigiMitra Works */}
      <Section
        badge={
          <Badge variant="warning" size="sm" icon={<Compass className="w-3 h-3 mr-1" />}>
            Simple 4-Step Process
          </Badge>
        }
        title={
          currentLang === "hi"
            ? "डिजीमित्र कैसे काम करता है"
            : "How DigiMitra Works"
        }
        subtitle={
          currentLang === "hi"
            ? "कुछ ही मिनटों में अपने व्यवसाय को एक संरचित और व्यावहारिक कार्य योजना दें।"
            : "Understand the process from quick questionnaire to personalized milestone execution."
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => (
            <div
              key={s.step}
              className="p-6 rounded-2xl bg-white border border-[#EDE2D8] shadow-card space-y-3 relative group hover:border-[#F0592A] hover:shadow-lg transition"
            >
              <span
                className="text-3xl font-black font-mono block opacity-30"
                style={{ color: theme.primaryHex }}
              >
                {s.step}
              </span>
              <h3 className="text-base font-bold text-[#241C15] font-heading">
                {currentLang === "hi" ? s.titleHi : s.titleEn}
              </h3>
              <p className="text-xs text-[#6B5D52] leading-relaxed">
                {currentLang === "hi" ? s.descHi : s.descEn}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* 6. Enterprise Categories Supported (Swiggy Pill Grid Style) */}
      <Section
        title={
          currentLang === "hi"
            ? "भारत भर के प्रमुख एमएसएमई क्षेत्र"
            : "MSME Sectors Supported Across India"
        }
        subtitle={
          currentLang === "hi"
            ? "किराना, विनिर्माण, वस्त्र, हस्तशिल्प और सेवाओं के लिए अनुकूलित डिजिटल नियम।"
            : "Customized digital diagnostic rules for diverse local business models."
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {MSME_SECTORS.map((sector) => (
            <div
              key={sector.id}
              onClick={() => navigate("/businesses")}
              className="p-3.5 rounded-xl bg-white border border-[#EDE2D8] text-xs font-bold text-[#241C15] flex items-center justify-between hover:border-orange-500 hover:shadow-xs transition cursor-pointer"
            >
              <span className="truncate">
                {currentLang === "hi" ? sector.nameHi : sector.nameEn.split("(")[0]}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#9C8F84] shrink-0" />
            </div>
          ))}
        </div>
      </Section>

      {/* 7. Call to Action Banner (Dark App Bar Style) */}
      <section className="p-8 sm:p-12 rounded-3xl bg-[#241C15] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="space-y-3 text-center md:text-left max-w-lg">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: theme.primaryHex }}
            >
              ✦
            </div>
            <span
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: theme.primaryHex }}
            >
              Free AI Digital Consultant
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold font-heading text-white">
            {currentLang === "hi"
              ? "क्या आप अपने व्यवसाय को अपग्रेड करने के लिए तैयार हैं?"
              : "Ready to upgrade your enterprise?"}
          </h3>
          <p className="text-xs sm:text-sm text-[#9C8F84] leading-relaxed">
            {currentLang === "hi"
              ? "आज ही 3 मिनट का डिजिटल मूल्यांकन लें और अपना व्यक्तिगत रोडमैप अनलॉक करें।"
              : "Take the 3-minute diagnostic assessment today to unlock your personalized transformation roadmap."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Link to="/assessment" className="w-full sm:w-auto">
            <button
              className="w-full px-6 py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2"
              style={{ backgroundColor: theme.primaryHex }}
            >
              <span>{currentLang === "hi" ? "मुफ्त मूल्यांकन शुरू करें" : "Start Free Assessment"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link to="/businesses" className="w-full sm:w-auto">
            <button className="w-full px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition">
              {currentLang === "hi" ? "मेरे उद्यम" : "My Businesses"}
            </button>
          </Link>
        </div>
      </section>

      {/* Developer Diagnostics Toggle */}
      <div className="pt-4 text-center">
        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="inline-flex items-center gap-1.5 text-xs text-[#9C8F84] hover:text-[#6B5D52] transition font-medium"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>
            {showDiagnostics
              ? "Hide System Health & Diagnostics"
              : "Show System Health & API Diagnostics"}
          </span>
        </button>

        {showDiagnostics && (
          <div className="mt-4 max-w-2xl mx-auto text-left animate-fadeIn">
            <HealthCard />
          </div>
        )}
      </div>
    </div>
  );
};
