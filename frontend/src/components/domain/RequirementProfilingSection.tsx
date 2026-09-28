import React from "react";
import {
  Target,
  AlertTriangle,
  Clock,
  IndianRupee,
  Wrench,
  Check,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { RequirementTaxonomies, BusinessRequirementProfile } from "../../api/requirements";

export interface RequirementProfilingSectionProps {
  taxonomies: RequirementTaxonomies;
  profileState: Partial<BusinessRequirementProfile>;
  onChange: (updated: Partial<BusinessRequirementProfile>) => void;
  currentLang?: "en" | "hi";
}

export const RequirementProfilingSection: React.FC<RequirementProfilingSectionProps> = ({
  taxonomies,
  profileState,
  onChange,
  currentLang = "en",
}) => {
  const isHi = currentLang === "hi";

  const {
    business_goals = {},
    pain_points = {},
    urgency_tiers = {},
    budget_tiers = {},
    existing_tools = {},
  } = taxonomies;

  const currentGoal = profileState.business_goal || "G1_CUSTOMER_REACH";
  const currentPain = profileState.primary_pain_point || "P1_FIND_CONTACT";
  const currentUrgency = profileState.urgency || "U2_WITHIN_6_MONTHS";
  const currentBudget = profileState.budget_tier || "B1_LOW";
  const selectedTools = profileState.existing_tools || [];

  const handleToggleTool = (toolCode: string) => {
    if (toolCode === "TOOL_NONE") {
      onChange({ existing_tools: ["TOOL_NONE"] });
      return;
    }
    let nextTools = selectedTools.filter((t) => t !== "TOOL_NONE");
    if (nextTools.includes(toolCode)) {
      nextTools = nextTools.filter((t) => t !== toolCode);
    } else {
      nextTools = [...nextTools, toolCode];
    }
    onChange({ existing_tools: nextTools.length === 0 ? ["TOOL_NONE"] : nextTools });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Friendly Conversational Intro */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-200/80">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-stone-900 tracking-tight">
              {isHi
                ? "अपनी व्यावसायिक आवश्यकताओं और प्राथमिकताओं के बारे में बताएं"
                : "Tell Us What Your Business Needs & Constraints Are"}
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {isHi
                ? "यह जानकारी हमें आपके बजट, तात्कालिकता और प्राथमिक लक्ष्यों के अनुसार सबसे उपयुक्त और व्यावहारिक डिजिटल समाधान सुझाने में मदद करती है।"
                : "This context helps tailor recommendations to your actual budget comfort, urgency, and operational goals without changing your core readiness score."}
            </p>
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-orange-800 bg-orange-100/80 px-2.5 py-0.5 rounded-full border border-orange-200">
                <HelpCircle className="w-3.5 h-3.5" />
                {isHi
                  ? "प्रस्तावित अनुसंधान ढांचा V1 — सांकेतिक श्रेणियां"
                  : "Proposed Research Instrument V1 — Indicative Categories"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Primary Business Goal */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-orange-600" />
            {isHi ? "आपका मुख्य व्यावसायिक लक्ष्य क्या है?" : "What is your primary business goal?"}
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(business_goals).map(([code, item]) => {
            const isSelected = currentGoal === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => onChange({ business_goal: code })}
                className={`p-4 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? "bg-orange-50/90 border-orange-500 shadow-sm ring-1 ring-orange-400"
                    : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono uppercase font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                    {code.split("_")[0]}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900">
                    {isHi ? item.name_hi : item.name_en}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5 line-clamp-2">
                    {isHi ? item.description_hi : item.description_en}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Primary Pain Point / Challenge */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            {isHi
              ? "आपकी सबसे बड़ी डिजिटल या परिचालन चुनौती क्या है?"
              : "What is your biggest operational or digital challenge?"}
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(pain_points).map(([code, item]) => {
            const isSelected = currentPain === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => onChange({ primary_pain_point: code })}
                className={`p-4 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? "bg-amber-50/90 border-amber-500 shadow-sm ring-1 ring-amber-400"
                    : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono uppercase font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                    {code.split("_")[0]}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900">
                    {isHi ? item.name_hi : item.name_en}
                  </div>
                  <div className="text-[11px] text-stone-600 mt-1 uppercase font-semibold">
                    {isHi ? `लक्ष्य आयाम: ${item.target_dimension}` : `Target: ${item.target_dimension}`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Urgency */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            {isHi ? "यह सुधार कितना तत्काल आवश्यक है?" : "How urgent is this digital transition?"}
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(urgency_tiers).map(([code, item]) => {
            const isSelected = currentUrgency === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => onChange({ urgency: code })}
                className={`p-4 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? "bg-orange-50/90 border-orange-500 shadow-sm ring-1 ring-orange-400"
                    : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono uppercase font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                    {code.split("_")[0]}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900">
                    {isHi ? item.name_hi : item.name_en}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {isHi ? item.description_hi : item.description_en}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Budget Allocation */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
            4
          </div>
          <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            {isHi
              ? "आप डिजिटल टूल्स/सेवाओं के लिए कितना बजट सहजता से आवंटित कर सकते हैं?"
              : "What budget can your business comfortably allocate for digital tools/services?"}
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(budget_tiers).map(([code, item]) => {
            const isSelected = currentBudget === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => onChange({ budget_tier: code })}
                className={`p-4 rounded-xl text-left border transition-all duration-200 flex flex-col justify-between space-y-2.5 ${
                  isSelected
                    ? "bg-emerald-50/90 border-emerald-500 shadow-sm ring-1 ring-emerald-400"
                    : "bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/60"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-mono uppercase font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                    {code.split("_")[0]}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900">
                    {isHi ? item.name_hi : item.name_en}
                  </div>
                  <div className="text-xs font-semibold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded mt-1.5 inline-block">
                    {item.illustrative_range}
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    {isHi ? item.description_hi : item.description_en}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Existing Tools Inventory */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
            5
          </div>
          <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-orange-600" />
            {isHi
              ? "आप वर्तमान में कौन से डिजिटल टूल्स या सेवाएं पहले से उपयोग कर रहे हैं?"
              : "What digital tools or services do you already actively use?"}
          </h4>
        </div>
        <p className="text-xs text-stone-600">
          {isHi
            ? "लागू होने वाले सभी टूल्स चुनें। जो टूल्स आपके पास पहले से हैं, उनके लिए दोहराव वाले सुझाव नहीं दिए जाएंगे।"
            : "Select all that apply. We will exclude redundant recommendations for tools you already use."}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {Object.entries(existing_tools).map(([code, item]) => {
            const isSelected = selectedTools.includes(code);
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleToggleTool(code)}
                className={`p-3.5 rounded-xl text-left border transition-all duration-200 flex items-center justify-between gap-2 ${
                  isSelected
                    ? "bg-orange-50 border-orange-500 shadow-sm font-semibold text-orange-950"
                    : "bg-white border-stone-200 hover:border-stone-300 text-stone-700 hover:bg-stone-50/60"
                }`}
              >
                <div className="text-xs sm:text-sm">{isHi ? item.name_hi : item.name_en}</div>
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                    isSelected
                      ? "bg-orange-600 border-orange-600 text-white"
                      : "border-stone-300 bg-stone-50"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
