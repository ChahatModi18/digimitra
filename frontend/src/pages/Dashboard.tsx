import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Building2,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Activity,
  Layers,
  HelpCircle,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { LevelCard } from "../components/domain/LevelCard";
import { DimensionCard } from "../components/domain/DimensionCard";
import { Section } from "../components/layout/Section";
import { HealthCard } from "../components/HealthCard";

export const Dashboard: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";
  const [showDiagnostics, setShowDiagnostics] = useState(false);

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
      titleEn: "Register Your MSME",
      titleHi: "उद्यम पंजीकरण करें",
      descEn: "Select your sector (Retail, Manufacturing, Services), state, and enterprise scale.",
      descHi: "अपना व्यवसाय क्षेत्र (खुदरा, विनिर्माण, सेवा), राज्य और उद्यम आकार चुनें।",
    },
    {
      step: "02",
      titleEn: "Answer 14 Pragmatic Questions",
      titleHi: "14 सरल प्रश्नों के उत्तर दें",
      descEn: "A 3-minute health check covering real-world workflows without confusing technical jargon.",
      descHi: "दैनिक व्यवसाय संचालन से जुड़े 14 व्यावहारिक प्रश्नों का 3 मिनट में उत्तर दें।",
    },
    {
      step: "03",
      titleEn: "Instant RBDL Level & Gaps",
      titleHi: "सटीक आरबीडीएल स्तर व कमियाँ",
      descEn: "Deterministic scoring across 9 dimensions with high, medium, or low certainty tiers.",
      descHi: "9 आयामों में सटीक स्कोरिंग, ताकतें और सुधार के प्रमुख क्षेत्रों की पहचान।",
    },
    {
      step: "04",
      titleEn: "Execute Phased Roadmap",
      titleHi: "चरणबद्ध रोडमैप पूरा करें",
      descEn: "Actionable tasks prioritized by impact, cost, and effort. Retake anytime to level up.",
      descHi: "त्वरित परिणाम (Quick Wins) से लेकर रणनीतिक लक्ष्यों तक प्राथमिकताप्राप्त कार्य।",
    },
  ];

  return (
    <div className="space-y-16 pb-16 animate-fadeIn">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 lg:p-16 shadow-2xl">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-teal-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <Badge variant="brand" size="md" icon={<Sparkles className="w-3.5 h-3.5 mr-1" />}>
            {currentLang === "hi" ? "भारतीय एमएसएमई हेतु एआई डिजिटल सलाहकार" : "AI Digital Consultant for Indian MSMEs"}
          </Badge>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-heading tracking-tight leading-tight">
            {currentLang === "hi" ? (
              <>
                अपने व्यवसाय का डिजिटलीकरण करें,{" "}
                <span className="dm-gradient-text-indigo">एक-एक कदम आगे बढ़कर।</span>
              </>
            ) : (
              <>
                Digitalize your business,{" "}
                <span className="dm-gradient-text-indigo">one step at a time.</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl">
            {currentLang === "hi"
              ? "डिजीमित्र एक पारदर्शी, नियम-आधारित डिजिटल सलाहकार ढांचा है जो भारतीय स्थानीय व्यवसायों को उनकी वास्तविक जरूरतों के अनुसार चरणबद्ध रोडमैप प्रदान करता है।"
              : "DigiMitra is a deterministic, requirement-based digitalization framework designed to evaluate your MSME's digital readiness and deliver a personalized, actionable transformation roadmap."}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/assessment">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-xl shadow-indigo-600/30"
              >
                {currentLang === "hi" ? "मुफ़्त मूल्यांकन शुरू करें" : "Start Free Assessment"}
              </Button>
            </Link>

            <Link to="/businesses">
              <Button
                variant="secondary"
                size="lg"
                leftIcon={<Building2 className="w-4 h-4 text-indigo-400" />}
              >
                {currentLang === "hi" ? "उद्यम डैशबोर्ड देखें" : "Explore DigiMitra"}
              </Button>
            </Link>
          </div>

          <div className="pt-4 flex items-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              100% Free & Open Source
            </span>
            <span className="flex items-center gap-1.5 text-indigo-300">
              <ShieldCheck className="w-4 h-4" />
              Bilingual (हिन्दी / English)
            </span>
          </div>
        </div>
      </section>

      {/* 2. RBDL Journey (Levels 0–3 Cards) */}
      <Section
        id="rbdl-journey"
        badge={
          <Badge variant="brand" size="sm" icon={<Layers className="w-3 h-3 mr-1" />}>
            RBDL Architecture
          </Badge>
        }
        title={
          currentLang === "hi"
            ? "आरबीडीएल डिजिटल परिपक्वता यात्रा (स्तर 0 से 3)"
            : "Requirement-Based Digitalization Levels (0–3)"
        }
        subtitle={
          currentLang === "hi"
            ? "प्रत्येक व्यवसाय के लिए स्पष्ट, संरचित और क्रमिक डिजिटल उन्नयन के 4 स्तर।"
            : "A structured, progressive hierarchy ensuring businesses master foundational operations before adopting complex technologies."
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* 3. Nine Digitalization Dimensions Grid */}
      <Section
        badge={
          <Badge variant="success" size="sm" icon={<Zap className="w-3 h-3 mr-1" />}>
            Comprehensive Assessment
          </Badge>
        }
        title={
          currentLang === "hi"
            ? "मूल्यांकन के 9 डिजिटल आयाम"
            : "9 Digitalization Dimensions Analyzed"
        }
        subtitle={
          currentLang === "hi"
            ? "हर आयाम आपके व्यवसाय के एक विशिष्ट परिचालन पहलू का सटीक विश्लेषण करता है।"
            : "A holistic diagnostic inspecting both hardware readiness, operational software, and customer-facing channels."
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

      {/* 4. How DigiMitra Works */}
      <Section
        badge={
          <Badge variant="warning" size="sm" icon={<Compass className="w-3 h-3 mr-1" />}>
            Simple Workflow
          </Badge>
        }
        title={
          currentLang === "hi"
            ? "डिजीमित्र कैसे काम करता है"
            : "How DigiMitra Works for Your MSME"
        }
        subtitle={
          currentLang === "hi"
            ? "4 आसान चरणों में अपने व्यवसाय को एक संरचित डिजिटल रोडमैप दें।"
            : "Fast, explainable, and privacy-preserving guidance from diagnostic to milestone execution."
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => (
            <div
              key={s.step}
              className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-3 relative group hover:border-slate-700 transition backdrop-blur-md"
            >
              <span className="text-3xl font-black text-indigo-500/30 font-mono block">
                {s.step}
              </span>
              <h3 className="text-base font-bold text-white font-heading">
                {currentLang === "hi" ? s.titleHi : s.titleEn}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {currentLang === "hi" ? s.descHi : s.descEn}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* 5. Why Requirement-Based Digitalization (Value Section) */}
      <Section
        badge={
          <Badge variant="info" size="sm" icon={<HelpCircle className="w-3 h-3 mr-1" />}>
            Methodology Advantage
          </Badge>
        }
        title={
          currentLang === "hi"
            ? "पारंपरिक परामर्श बनाम डिजीमित्र आरबीडीएल"
            : "Why Requirement-Based Digitalization (RBDL)?"
        }
        subtitle={
          currentLang === "hi"
            ? "सामान्य एआई चैटबॉट्स या महंगे सलाहकारों की तुलना में स्पष्ट अंतर।"
            : "Eliminating generic advice and expensive software that Indian MSMEs cannot sustain."
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="subtle" className="p-7 space-y-4 border-rose-500/20 bg-rose-950/10">
            <h4 className="text-base font-bold text-rose-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Generic Consultants & Chatbots
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                Recommends expensive ERP/SaaS regardless of budget or readiness.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                Black-box LLM hallucinations with no reproducible rule audit trail.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                No consideration for local Indian retail constraints or language barriers.
              </li>
            </ul>
          </Card>

          <Card variant="default" className="p-7 space-y-4 border-indigo-500/30 bg-indigo-950/20">
            <h4 className="text-base font-bold text-emerald-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              DigiMitra RBDL Engine
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Gated prerequisite checks (e.g. smartphone before ERP, UPI before ONDC).
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                100% deterministic rules with auditable evidence traces and score deltas.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                Native bilingual support in Hindi and English with phased actionable milestones.
              </li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* 6. Call to Action Banner */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900/60 via-indigo-950/80 to-slate-950 border border-indigo-500/30 shadow-2xl text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-bold text-white font-heading">
            {currentLang === "hi"
              ? "आज ही अपने व्यवसाय का डिजिटल मूल्यांकन करें"
              : "Ready to accelerate your MSME's digital journey?"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {currentLang === "hi"
              ? "केवल 3 मिनट में अपना आरबीडीएल स्तर जानें और व्यक्तिगत कार्य योजना प्राप्त करें।"
              : "Discover your exact digital readiness level and start executing Quick Win recommendations today."}
          </p>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          <Link to="/assessment">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {currentLang === "hi" ? "निःशुल्क मूल्यांकन शुरू करें" : "Start Free Assessment"}
            </Button>
          </Link>
          <Link to="/businesses">
            <Button variant="secondary" size="lg">
              {currentLang === "hi" ? "व्यवसाय प्रबंधित करें" : "Manage Businesses"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Developer Diagnostics Toggle */}
      <div className="pt-4 text-center">
        <button
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{showDiagnostics ? "Hide System Health & Diagnostics" : "Show System Health & API Status"}</span>
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
