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

  const [turnoverUnit, setTurnoverUnit] = useState<"lakhs" | "crores">("lakhs");
  const [turnoverInput, setTurnoverInput] = useState<string>(
    turnoverUnit === "lakhs" ? (initialTurnoverCr * 100).toString() : initialTurnoverCr.toString()
  );

  const [investmentUnit, setInvestmentUnit] = useState<"lakhs" | "crores">("lakhs");
  const [investmentInput, setInvestmentInput] = useState<string>(
    investmentUnit === "lakhs" ? (initialInvestmentCr * 100).toString() : initialInvestmentCr.toString()
  );

  // Convert inputs to Crores for the official MSME formula
  const turnoverCr = useMemo(() => {
    const val = parseFloat(turnoverInput) || 0;
    return turnoverUnit === "lakhs" ? val / 100 : val;
  }, [turnoverInput, turnoverUnit]);

  const investmentCr = useMemo(() => {
    const val = parseFloat(investmentInput) || 0;
    return investmentUnit === "lakhs" ? val / 100 : val;
  }, [investmentInput, investmentUnit]);

  const result: MsmeClassificationResult = useMemo(() => {
    return calculateMsmeClassification(turnoverCr, investmentCr);
  }, [turnoverCr, investmentCr]);

  const presetTurnovers = [
    { label: "₹25 Lakhs", valLakhs: 25, unit: "lakhs" as const },
    { label: "₹1 Crore", valLakhs: 100, unit: "crores" as const },
    { label: "₹5 Crores", valLakhs: 500, unit: "crores" as const },
    { label: "₹25 Crores", valLakhs: 2500, unit: "crores" as const },
    { label: "₹100 Crores", valLakhs: 10000, unit: "crores" as const },
  ];

  return (
    <div
      className={`rounded-2xl border transition-all ${
        compact
          ? "bg-stone-50/70 border-stone-200 p-4 space-y-4"
          : "bg-white border-stone-200 p-6 sm:p-7 shadow-sm space-y-6"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
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
                ? "वार्षिक टर्नओवर दर्ज करें और आधिकारिक एमएसएमई श्रेणी जानें"
                : "Enter annual turnover to determine official Govt. of India MSME status"}
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
          <Award className="w-3 h-3 text-orange-600" />
          MSMED Act 2020
        </span>
      </div>

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
                onClick={() => {
                  if (turnoverUnit !== "lakhs") {
                    setTurnoverUnit("lakhs");
                    setTurnoverInput((turnoverCr * 100).toString());
                  }
                }}
                className={`px-2 py-0.5 rounded-md transition ${
                  turnoverUnit === "lakhs" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                ₹ Lakhs
              </button>
              <button
                type="button"
                onClick={() => {
                  if (turnoverUnit !== "crores") {
                    setTurnoverUnit("crores");
                    setTurnoverInput(turnoverCr.toString());
                  }
                }}
                className={`px-2 py-0.5 rounded-md transition ${
                  turnoverUnit === "crores" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
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
              placeholder="e.g. 50"
              className="w-full pl-8 pr-20 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 font-bold text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-xs"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-semibold text-xs">
              {turnoverUnit === "lakhs" ? "Lakhs / लाख" : "Crores / करोड़"}
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
                  setTurnoverInput(p.unit === "lakhs" ? p.valLakhs.toString() : (p.valLakhs / 100).toString());
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
                onClick={() => {
                  if (investmentUnit !== "lakhs") {
                    setInvestmentUnit("lakhs");
                    setInvestmentInput((investmentCr * 100).toString());
                  }
                }}
                className={`px-2 py-0.5 rounded-md transition ${
                  investmentUnit === "lakhs" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
                }`}
              >
                ₹ Lakhs
              </button>
              <button
                type="button"
                onClick={() => {
                  if (investmentUnit !== "crores") {
                    setInvestmentUnit("crores");
                    setInvestmentInput(investmentCr.toString());
                  }
                }}
                className={`px-2 py-0.5 rounded-md transition ${
                  investmentUnit === "crores" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-800"
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
              placeholder="e.g. 10"
              className="w-full pl-8 pr-20 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 font-bold text-base focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-xs"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 font-semibold text-xs">
              {investmentUnit === "lakhs" ? "Lakhs / लाख" : "Crores / करोड़"}
            </span>
          </div>

          <p className="text-[11px] text-stone-500 leading-tight">
            {currentLang === "hi"
              ? "दुकान/कारखाने के उपकरण, कंप्यूटर और मशीनरी की अनुमानित लागत।"
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
            <span className="font-bold text-stone-900">₹{turnoverCr.toFixed(2)} Cr</span>
            <span className="text-[10px] text-stone-400 block">
              Limit: ≤ ₹{result.maxTurnoverCr} Cr
            </span>
          </div>

          <div className="bg-white/70 p-2 rounded-lg border border-stone-200/50">
            <span className="text-[10px] text-stone-500 font-semibold block uppercase">Investment</span>
            <span className="font-bold text-stone-900">₹{investmentCr.toFixed(2)} Cr</span>
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
