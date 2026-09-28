import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Building,
  TrendingUp,
  Award,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";
import { calculateMsmeClassification, MsmeClassificationResult } from "../../data/msmeTaxonomy";

interface MsmeClassificationCalculatorProps {
  onSelectCategory?: (category: "Micro" | "Small" | "Medium") => void;
  initialTurnoverCr?: number;
  initialInvestmentCr?: number;
  compact?: boolean;
}

export const MsmeClassificationCalculator: React.FC<MsmeClassificationCalculatorProps> = ({
  onSelectCategory,
  initialTurnoverCr = 0.5,
  initialInvestmentCr = 0.1,
  compact = false,
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";
  const [showRulesGuide, setShowRulesGuide] = useState<boolean>(false);

  // Unit types: 'thousands' (हजार), 'lakhs' (लाख), 'crores' (करोड़)
  const [turnoverUnit, setTurnoverUnit] = useState<"thousands" | "lakhs" | "crores">("lakhs");
  const [turnoverInput, setTurnoverInput] = useState<string>(
    turnoverUnit === "thousands"
      ? (initialTurnoverCr * 100000).toString()
      : turnoverUnit === "lakhs"
      ? (initialTurnoverCr * 100).toString()
      : initialTurnoverCr.toString()
  );

  const [investmentUnit, setInvestmentUnit] = useState<"thousands" | "lakhs" | "crores">("lakhs");
  const [investmentInput, setInvestmentInput] = useState<string>(
    investmentUnit === "thousands"
      ? (initialInvestmentCr * 100000).toString()
      : investmentUnit === "lakhs"
      ? (initialInvestmentCr * 100).toString()
      : initialInvestmentCr.toString()
  );

  // Convert inputs to Crores for the official MSME formula
  const turnoverCr = useMemo(() => {
    const val = parseFloat(turnoverInput) || 0;
    if (turnoverUnit === "thousands") return val / 100000;
    if (turnoverUnit === "lakhs") return val / 100;
    return val;
  }, [turnoverInput, turnoverUnit]);

  const investmentCr = useMemo(() => {
    const val = parseFloat(investmentInput) || 0;
    if (investmentUnit === "thousands") return val / 100000;
    if (investmentUnit === "lakhs") return val / 100;
    return val;
  }, [investmentInput, investmentUnit]);

  const result: MsmeClassificationResult = useMemo(() => {
    return calculateMsmeClassification(turnoverCr, investmentCr);
  }, [turnoverCr, investmentCr]);

  const presetTurnovers = [
    { label: "₹50 Thousand", val: 50, unit: "thousands" as const },
    { label: "₹2 Lakhs", val: 2, unit: "lakhs" as const },
    { label: "₹10 Lakhs", val: 10, unit: "lakhs" as const },
    { label: "₹50 Lakhs", val: 50, unit: "lakhs" as const },
    { label: "₹1 Crore", val: 1, unit: "crores" as const },
    { label: "₹5 Crores", val: 5, unit: "crores" as const },
    { label: "₹50 Crores", val: 50, unit: "crores" as const },
    { label: "₹250 Crores", val: 250, unit: "crores" as const },
  ];

  const handleTurnoverUnitChange = (newUnit: "thousands" | "lakhs" | "crores") => {
    if (turnoverUnit === newUnit) return;
    setTurnoverUnit(newUnit);
    if (newUnit === "thousands") {
      setTurnoverInput((turnoverCr * 100000).toFixed(0));
    } else if (newUnit === "lakhs") {
      setTurnoverInput((turnoverCr * 100).toFixed(2));
    } else {
      setTurnoverInput(turnoverCr.toFixed(4));
    }
  };

  const handleInvestmentUnitChange = (newUnit: "thousands" | "lakhs" | "crores") => {
    if (investmentUnit === newUnit) return;
    setInvestmentUnit(newUnit);
    if (newUnit === "thousands") {
      setInvestmentInput((investmentCr * 100000).toFixed(0));
    } else if (newUnit === "lakhs") {
      setInvestmentInput((investmentCr * 100).toFixed(2));
    } else {
      setInvestmentInput(investmentCr.toFixed(4));
    }
  };

  return (
    <div
      className={`rounded-2xl border transition-all ${
        compact
          ? "bg-stone-50/70 border-stone-200 p-4 space-y-4"
          : "bg-white border-stone-200 p-6 sm:p-7 shadow-sm space-y-6"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-100/80 text-orange-700">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-stone-900 leading-tight">
              {currentLang === "hi"
                ? "उद्यम टर्नओवर एवं एमएसएमई कैलकुलेटर"
                : "MSME Turnover & Eligibility Checker"}
            </h4>
            <p className="text-xs text-stone-500">
              {currentLang === "hi"
                ? "वार्षिक टर्नओवर दर्ज करें और आधिकारिक एमएसएमई श्रेणी जानें (हजार, लाख अथवा करोड़ में)"
                : "Enter annual turnover to determine official Govt. of India MSME status (in Thousands, Lakhs, or Crores)"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRulesGuide(!showRulesGuide)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full border border-orange-200 transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-orange-600" />
            <span>{currentLang === "hi" ? "सरकारी नियम देखें" : "Govt. Rules Explainer"}</span>
            {showRulesGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
            <Award className="w-3 h-3 text-orange-600" />
            MSMED Act 2020
          </span>
        </div>
      </div>

      {/* 2. Collapsible Govt. of India Rules Explainer Card */}
      {showRulesGuide && (
        <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/90 border border-stone-200 space-y-3 animate-fadeIn text-xs">
          <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
            <span className="font-extrabold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {currentLang === "hi"
                ? "भारत सरकार की आधिकारिक एमएसएमई परिभाषा (अधिसूचना S.O. 2119(E))"
                : "Official Govt. of India MSME Definition (Gazette Notification S.O. 2119(E))"}
            </span>
            <span className="text-[10px] font-bold uppercase text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
              Composite Criteria
            </span>
          </div>

          <p className="text-stone-600 leading-relaxed text-[11px]">
            {currentLang === "hi"
              ? "सूक्ष्म, लघु एवं मध्यम उद्यम विकास (MSMED) अधिनियम 2020 के अनुसार, विनिर्माण (Manufacturing) एवं सेवा (Services) दोनों क्षेत्रों के लिए समान समग्र मानदंड लागू हैं। निर्यात से प्राप्त टर्नओवर को गणना से बाहर रखा जाता है।"
              : "Under the revised MSMED Act 2020 composite criteria, both Manufacturing and Services sectors follow identical thresholds. Exports of goods or services are fully excluded from turnover calculations."}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-1">
              <span className="font-bold text-emerald-800 text-xs block">
                {currentLang === "hi" ? "1. सूक्ष्म उद्यम (Micro)" : "1. Micro Enterprise"}
              </span>
              <p className="text-[11px] text-stone-600">
                • <strong>{currentLang === "hi" ? "निवेश:" : "Investment:"}</strong> ≤ ₹1 Crore (₹100 Lakhs)<br />
                • <strong>{currentLang === "hi" ? "टर्नओवर:" : "Turnover:"}</strong> ≤ ₹5 Crores (₹500 Lakhs)
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-blue-200 space-y-1">
              <span className="font-bold text-blue-800 text-xs block">
                {currentLang === "hi" ? "2. लघु उद्यम (Small)" : "2. Small Enterprise"}
              </span>
              <p className="text-[11px] text-stone-600">
                • <strong>{currentLang === "hi" ? "निवेश:" : "Investment:"}</strong> ≤ ₹10 Crores (₹1000 Lakhs)<br />
                • <strong>{currentLang === "hi" ? "टर्नओवर:" : "Turnover:"}</strong> ≤ ₹50 Crores (₹5000 Lakhs)
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white border border-amber-200 space-y-1">
              <span className="font-bold text-amber-800 text-xs block">
                {currentLang === "hi" ? "3. मध्यम उद्यम (Medium)" : "3. Medium Enterprise"}
              </span>
              <p className="text-[11px] text-stone-600">
                • <strong>{currentLang === "hi" ? "निवेश:" : "Investment:"}</strong> ≤ ₹50 Crores<br />
                • <strong>{currentLang === "hi" ? "टर्नओवर:" : "Turnover:"}</strong> ≤ ₹250 Crores
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inputs Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Annual Turnover Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
              {currentLang === "hi" ? "वार्षिक टर्नओवर (Turnover)" : "Annual Turnover"} *
            </label>
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => handleTurnoverUnitChange("thousands")}
                className={`px-2 py-0.5 rounded-md transition ${
                  turnoverUnit === "thousands"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                ₹ '000s
              </button>
              <button
                type="button"
                onClick={() => handleTurnoverUnitChange("lakhs")}
                className={`px-2 py-0.5 rounded-md transition ${
                  turnoverUnit === "lakhs"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                ₹ Lakhs
              </button>
              <button
                type="button"
                onClick={() => handleTurnoverUnitChange("crores")}
                className={`px-2 py-0.5 rounded-md transition ${
                  turnoverUnit === "crores"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                ₹ Crores
              </button>
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={turnoverInput}
              onChange={(e) => setTurnoverInput(e.target.value)}
              placeholder={turnoverUnit === "thousands" ? "e.g. 50" : turnoverUnit === "lakhs" ? "e.g. 25" : "e.g. 1"}
              className="w-full pl-8 pr-24 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 font-bold text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-xs"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-semibold text-xs">
              {turnoverUnit === "thousands"
                ? "Thousand / हजार"
                : turnoverUnit === "lakhs"
                ? "Lakhs / लाख"
                : "Crores / करोड़"}
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {presetTurnovers.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setTurnoverUnit(p.unit);
                  setTurnoverInput(p.val.toString());
                }}
                className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Plant & Machinery Investment (Optional) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-stone-600" />
              {currentLang === "hi" ? "संयंत्र / मशीनरी में निवेश" : "Plant & Machinery Investment"}
            </label>
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => handleInvestmentUnitChange("thousands")}
                className={`px-2 py-0.5 rounded-md transition ${
                  investmentUnit === "thousands"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                ₹ '000s
              </button>
              <button
                type="button"
                onClick={() => handleInvestmentUnitChange("lakhs")}
                className={`px-2 py-0.5 rounded-md transition ${
                  investmentUnit === "lakhs"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                ₹ Lakhs
              </button>
              <button
                type="button"
                onClick={() => handleInvestmentUnitChange("crores")}
                className={`px-2 py-0.5 rounded-md transition ${
                  investmentUnit === "crores"
                    ? "bg-white text-stone-900 shadow-xs"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                ₹ Crores
              </button>
            </div>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="any"
              value={investmentInput}
              onChange={(e) => setInvestmentInput(e.target.value)}
              placeholder={investmentUnit === "thousands" ? "e.g. 20" : investmentUnit === "lakhs" ? "e.g. 10" : "e.g. 0.5"}
              className="w-full pl-8 pr-24 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 font-bold text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-xs"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-semibold text-xs">
              {investmentUnit === "thousands"
                ? "Thousand / हजार"
                : investmentUnit === "lakhs"
                ? "Lakhs / लाख"
                : "Crores / करोड़"}
            </span>
          </div>

          <p className="text-[11px] text-stone-500 leading-tight">
            {currentLang === "hi"
              ? "दुकान, वर्कशॉप, कंप्यूटर, उपकरण अथवा मशीनरी की अनुमानित लागत।"
              : "Approximate cost of business equipment, computers, tools & machinery."}
          </p>
        </div>
      </div>

      {/* 3. Live Calculated Result Card */}
      <div
        className={`p-4 sm:p-5 rounded-xl border transition-all ${
          result.isMsme
            ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-950"
            : "bg-amber-50/60 border-amber-200/80 text-amber-950"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-stone-200 shadow-xs text-stone-700">
                Official Result
              </span>
              {result.isMsme ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {currentLang === "hi" ? "मान्यता प्राप्त एमएसएमई" : "Qualified MSME Entity"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {currentLang === "hi" ? "बड़ा उद्योग (> ₹250 करोड़)" : "Non-MSME / Large Enterprise"}
                </span>
              )}
            </div>

            <h3 className="text-xl font-extrabold text-stone-900 tracking-tight">
              {currentLang === "hi" ? result.categoryHi : `${result.category} Enterprise`}
            </h3>

            <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
              {currentLang === "hi" ? result.reasonHi : result.reasonEn}
            </p>
          </div>

          {/* Action button if inside registration form */}
          {onSelectCategory && result.category !== "Non-MSME" && (
            <button
              type="button"
              onClick={() => onSelectCategory(result.category as "Micro" | "Small" | "Medium")}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-sm transition shrink-0"
            >
              <span>{currentLang === "hi" ? `चुनें: ${result.category}` : `Apply ${result.category}`}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Breakdown bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-stone-200/60 text-xs">
          <div className="bg-white/70 p-2 rounded-lg border border-stone-200/50">
            <span className="text-[10px] text-stone-500 font-semibold block uppercase">Turnover</span>
            <span className="font-bold text-stone-900">
              {turnoverCr < 0.01
                ? `₹${(turnoverCr * 100000).toFixed(0)} Thousand`
                : turnoverCr < 1
                ? `₹${(turnoverCr * 100).toFixed(2)} Lakhs`
                : `₹${turnoverCr.toFixed(2)} Cr`}
            </span>
            <span className="text-[10px] text-stone-400 block">
              Limit: ≤ ₹{result.maxTurnoverCr} Cr
            </span>
          </div>

          <div className="bg-white/70 p-2 rounded-lg border border-stone-200/50">
            <span className="text-[10px] text-stone-500 font-semibold block uppercase">Investment</span>
            <span className="font-bold text-stone-900">
              {investmentCr < 0.01
                ? `₹${(investmentCr * 100000).toFixed(0)} Thousand`
                : investmentCr < 1
                ? `₹${(investmentCr * 100).toFixed(2)} Lakhs`
                : `₹${investmentCr.toFixed(2)} Cr`}
            </span>
            <span className="text-[10px] text-stone-400 block">
              Limit: ≤ ₹{result.maxInvestmentCr} Cr
            </span>
          </div>

          <div className="bg-white/70 p-2 rounded-lg border border-stone-200/50">
            <span className="text-[10px] text-stone-500 font-semibold block uppercase">Udyam Eligible</span>
            <span className="font-bold text-emerald-700">
              {result.udyamEligible ? "Yes (100%)" : "Exceeds MSME"}
            </span>
          </div>

          <div className="bg-white/70 p-2 rounded-lg border border-stone-200/50">
            <span className="text-[10px] text-stone-500 font-semibold block uppercase">Assessment Scope</span>
            <span className="font-bold text-orange-600">Full 9 Dimensions</span>
          </div>
        </div>
      </div>
    </div>
  );
};
