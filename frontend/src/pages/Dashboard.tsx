import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  ArrowRight,
  Zap,
  TrendingUp,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  Compass,
  Cpu,
  Smartphone,
  CreditCard,
  Package,
  LineChart,
  Globe2,
  Users,
} from "lucide-react";
import { HealthCard } from "../components/HealthCard";

export const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";

  const rbdlStages = [
    {
      level: 0,
      title: t("assessment:level_0.name"),
      desc: t("assessment:level_0.desc"),
      color: "from-slate-800 to-slate-900 border-slate-700/50",
      badgeColor: "bg-slate-700 text-slate-300",
      icon: FileSpreadsheet,
    },
    {
      level: 1,
      title: t("assessment:level_1.name"),
      desc: t("assessment:level_1.desc"),
      color: "from-blue-950/60 to-indigo-950/60 border-indigo-500/30",
      badgeColor: "bg-indigo-500/20 text-indigo-300",
      icon: Zap,
    },
    {
      level: 2,
      title: t("assessment:level_2.name"),
      desc: t("assessment:level_2.desc"),
      color: "from-emerald-950/60 to-teal-950/60 border-emerald-500/30",
      badgeColor: "bg-emerald-500/20 text-emerald-300",
      icon: TrendingUp,
    },
    {
      level: 3,
      title: t("assessment:level_3.name"),
      desc: t("assessment:level_3.desc"),
      color: "from-purple-950/60 to-indigo-950/60 border-purple-500/30",
      badgeColor: "bg-purple-500/20 text-purple-300",
      icon: Sparkles,
    },
  ];

  const dimensionIcons = [
    { code: "infra", nameEn: "Digital Infrastructure", nameHi: "डिजिटल इन्फ्रास्ट्रक्चर", icon: Smartphone },
    { code: "literacy", nameEn: "Digital Literacy & Skills", nameHi: "डिजिटल साक्षरता व कौशल", icon: Users },
    { code: "presence", nameEn: "Online Presence & Maps", nameHi: "ऑनलाइन उपस्थिति एवं खोज", icon: Globe2 },
    { code: "comms", nameEn: "Customer Communication", nameHi: "ग्राहक संचार", icon: Zap },
    { code: "records", nameEn: "Digital Bookkeeping", nameHi: "डिजिटल बहीखाता व रिकॉर्ड", icon: FileSpreadsheet },
    { code: "payments", nameEn: "Payment Systems (UPI/POS)", nameHi: "डिजिटल भुगतान प्रणाली", icon: CreditCard },
    { code: "inventory", nameEn: "Stock & Inventory Ops", nameHi: "इन्वेंट्री व स्टॉक संचालन", icon: Package },
    { code: "data_usage", nameEn: "Data & Sales Analytics", nameHi: "डेटा व बिक्री विश्लेषण", icon: LineChart },
    { code: "growth", nameEn: "Marketplaces (ONDC/GeM)", nameHi: "डिजिटल विकास व मार्केटप्लेस", icon: Compass },
  ];

  const howItWorksSteps = [
    {
      step: "01",
      titleEn: "Register Enterprise",
      titleHi: "उद्यम पंजीकरण करें",
      descEn: "Tell us your business sector, city, and size in under 60 seconds.",
      descHi: "60 सेकंड के भीतर अपने व्यवसाय क्षेत्र, शहर और आकार की जानकारी दें।",
    },
    {
      step: "02",
      titleEn: "3-Min Health Check",
      titleHi: "3 मिनट का मूल्यांकन",
      descEn: "Answer 14 simple everyday questions about your daily workflow.",
      descHi: "अपने दैनिक संचालन से जुड़े 14 सरल सवालों के उत्तर दें।",
    },
    {
      step: "03",
      titleEn: "Instant RBDL Level",
      titleHi: "आरबीडीएल स्तर व विश्लेषण",
      descEn: "Get deterministic classification (Levels 0–3) with 9 dimension score gauges.",
      descHi: "9 आयामों के साथ सटीक डिजिटल परिपक्वता स्तर प्राप्त करें।",
    },
    {
      step: "04",
      titleEn: "Phased Roadmap",
      titleHi: "चरणबद्ध कार्य योजना",
      descEn: "Receive prioritized, cost-effective tasks: Quick Wins to strategic milestones.",
      descHi: "त्वरित परिणाम से लेकर दीर्घकालिक लक्ष्यों तक प्राथमिकता-प्राप्त कार्य प्राप्त करें।",
    },
  ];

  return (
    <div className="space-y-12 pb-16 animate-fadeIn">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-teal-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>{t("hero.badge")}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-heading tracking-tight leading-tight">
            {t("hero.title")}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-teal-500/20 transition-all hover:scale-105"
            >
              <span>{t("hero.cta_start")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/businesses"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 px-5 py-3.5 text-sm font-semibold text-slate-200 border border-slate-700 transition-all"
            >
              <Building2 className="h-4 w-4 text-indigo-400" />
              <span>{t("hero.cta_register")}</span>
            </Link>

            <Link
              to="/roadmap"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900/60 hover:bg-slate-850 px-4 py-3.5 text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-800 transition-all"
            >
              <Compass className="h-4 w-4" />
              <span>{t("hero.cta_roadmap")}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Real-Time System Health Card */}
      <section>
        <HealthCard />
      </section>

      {/* How DigiMitra Works (4 Step Flow) */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-teal-400">
            {currentLang === "hi" ? "सरल 4-चरणीय प्रक्रिया" : "Simple 4-Step Journey"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-heading">
            {currentLang === "hi" ? "डिजीमित्र कैसे काम करता है" : "How DigiMitra Guides Your MSME"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {howItWorksSteps.map((s) => (
            <div
              key={s.step}
              className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-lg space-y-3 relative group hover:border-slate-700 transition"
            >
              <span className="text-2xl font-black text-indigo-500/40 font-mono block">
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
      </section>

      {/* RBDL Framework Stages Breakdown */}
      <section id="rbdl-framework" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Layers className="h-4 w-4" />
              <span>{t("assessment:title")}</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-heading mt-1">
              RBDL Framework Architecture (Levels 0–3)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            {t("assessment:subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {rbdlStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.level}
                className={`rounded-3xl p-6 bg-gradient-to-b ${stage.color} border shadow-xl flex flex-col justify-between space-y-4 hover:translate-y-[-2px] transition duration-300`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg ${stage.badgeColor}`}>
                      Level {stage.level}
                    </span>
                    <Icon className="h-5 w-5 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-heading">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified Criteria
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 9 Digital Dimensions Visual Grid */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-teal-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white font-heading">
            {currentLang === "hi"
              ? "मूल्यांकन के 9 डिजिटल आयाम"
              : "9 Digital Dimensions Analyzed"}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {dimensionIcons.map((dim) => {
            const Icon = dim.icon;
            return (
              <div
                key={dim.code}
                className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex items-center gap-4 transition shadow-md"
              >
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {currentLang === "hi" ? dim.nameHi : dim.nameEn}
                  </h4>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                    Code: {dim.code}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
