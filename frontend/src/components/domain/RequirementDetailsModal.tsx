import React from "react";
import {
  X,
  IndianRupee,
  Zap,
  TrendingUp,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";


export interface RequirementDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  titleEn: string;
  titleHi: string;
  descriptionEn?: string;
  descriptionHi?: string;
  reasonEn?: string;
  reasonHi?: string;
  dimensionCode?: string;
  phaseNumber?: number;
  priorityScore?: number;
  feasibilityStatus?: string;
  budgetFit?: string;
  traceabilityJson?: Record<string, any>;
  currentLang?: "en" | "hi";
}

export const RequirementDetailsModal: React.FC<RequirementDetailsModalProps> = ({
  isOpen,
  onClose,
  code,
  titleEn,
  titleHi,
  descriptionEn,
  descriptionHi,
  reasonEn,
  reasonHi,
  dimensionCode,
  phaseNumber = 1,
  priorityScore,
  feasibilityStatus = "FEASIBLE_NOW",
  budgetFit,
  traceabilityJson,
  currentLang = "en",
}) => {
  if (!isOpen) return null;

  const isHi = currentLang === "hi";
  const title = isHi ? titleHi : titleEn;
  const description = isHi ? descriptionHi : descriptionEn;
  const reason = isHi ? reasonHi : reasonEn;

  // Derive requirement gate mapping deterministically based on dimension
  const gateMapping: Record<string, { gateNameEn: string; gateNameHi: string; level: number }> = {
    infra: {
      gateNameEn: "Level 1: Digital Infrastructure & Device Readiness Gate",
      gateNameHi: "स्तर 1: डिजिटल इन्फ्रास्ट्रक्चर एवं डिवाइस तत्परता गेट",
      level: 1,
    },
    literacy: {
      gateNameEn: "Level 1: Foundational Digital Literacy Gate",
      gateNameHi: "स्तर 1: बुनियादी डिजिटल साक्षरता गेट",
      level: 1,
    },
    presence: {
      gateNameEn: "Level 2: Discoverable Online Presence Gate",
      gateNameHi: "स्तर 2: ऑनलाइन खोज योग्यता एवं उपस्थिति गेट",
      level: 2,
    },
    comms: {
      gateNameEn: "Level 2: Customer Communication & Engagement Gate",
      gateNameHi: "स्तर 2: ग्राहक संचार एवं सहभागिता गेट",
      level: 2,
    },
    records: {
      gateNameEn: "Level 2/3: Structured Digital Bookkeeping & Accounting Gate",
      gateNameHi: "स्तर 2/3: व्यवस्थित डिजिटल बहीखाता एवं लेखा गेट",
      level: 2,
    },
    payments: {
      gateNameEn: "Level 2/3: Digital Payments & Daily Reconciliation Gate",
      gateNameHi: "स्तर 2/3: डिजिटल भुगतान एवं दैनिक मिलान गेट",
      level: 2,
    },
    inventory: {
      gateNameEn: "Level 2: Operations & Inventory Tracking Gate",
      gateNameHi: "स्तर 2: परिचालन एवं स्टॉक/इन्वेंट्री प्रबंधन गेट",
      level: 2,
    },
    data_usage: {
      gateNameEn: "Level 3: Data-Driven Decision & Analytics Gate",
      gateNameHi: "स्तर 3: डेटा-आधारित निर्णय एवं विश्लेषण गेट",
      level: 3,
    },
    growth: {
      gateNameEn: "Level 3: Digital Growth & Multi-Channel Expansion Gate",
      gateNameHi: "स्तर 3: डिजिटल विकास एवं बहु-चैनल विस्तार गेट",
      level: 3,
    },
  };

  const dim = (dimensionCode || "infra").toLowerCase();
  const gateInfo = gateMapping[dim] || {
    gateNameEn: `RBDL Phase ${phaseNumber} Capability Requirement`,
    gateNameHi: `RBDL चरण ${phaseNumber} क्षमता आवश्यकता`,
    level: phaseNumber,
  };

  const feasibilityBadges: Record<string, { labelEn: string; labelHi: string; color: string }> = {
    FEASIBLE_NOW: {
      labelEn: "Feasible Now",
      labelHi: "तुरंत संभव (बजट अनुकूल)",
      color: "bg-emerald-50 text-emerald-800 border-emerald-300",
    },
    LOWER_COST_ALTERNATIVE: {
      labelEn: "Lower-Cost Alternative",
      labelHi: "कम लागत वाला विकल्प",
      color: "bg-blue-50 text-blue-800 border-blue-300",
    },
    DEFER_DUE_TO_BUDGET: {
      labelEn: "Deferred Due to Budget",
      labelHi: "बजट के कारण बाद के लिए स्थगित",
      color: "bg-amber-50 text-amber-800 border-amber-300",
    },
    ALREADY_HAVE: {
      labelEn: "Already Adopted",
      labelHi: "पहले से उपलब्ध",
      color: "bg-purple-50 text-purple-800 border-purple-300",
    },
    ELIGIBLE: {
      labelEn: "Eligible Intervention",
      labelHi: "पात्र हस्तक्षेप",
      color: "bg-stone-50 text-stone-800 border-stone-300",
    },
  };

  const statusInfo = feasibilityBadges[feasibilityStatus] || feasibilityBadges["FEASIBLE_NOW"];

  // Extract traceability details if present
  const step1 = traceabilityJson?.step_1_assessment;
  const step2 = traceabilityJson?.step_2_capability_gap;
  const step3 = traceabilityJson?.step_3_business_context;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-stone-200 shadow-2xl p-6 sm:p-8 space-y-6 text-[#241C15]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                {code}
              </span>
              <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                {dimensionCode?.toUpperCase() || "CORE"}
              </span>
              <span
                className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md border ${statusInfo.color}`}
              >
                {isHi ? statusInfo.labelHi : statusInfo.labelEn}
              </span>
              {priorityScore !== undefined && (
                <Badge variant="brand" size="sm">
                  Priority: {priorityScore.toFixed(2)}
                </Badge>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-stone-900 tracking-tight leading-snug">
              {title}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. RBDL Requirement Alignment Context */}
        <div className="rounded-2xl bg-amber-50/70 border border-amber-200/90 p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>
              {isHi
                ? "RBDL आवश्यकता-आधारित तत्परता संरेखण"
                : "RBDL Requirement-Based Readiness Alignment"}
            </span>
          </div>
          <p className="text-xs font-semibold text-amber-950">
            {isHi ? gateInfo.gateNameHi : gateInfo.gateNameEn}
          </p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            {isHi
              ? "यह कार्य सीधे आपके व्यावसायिक स्तर की न्यूनतम आवश्यकता को पूरा करने के लिए तैयार किया गया है। इसे पूरा करने पर अगली पुनर्मूल्यांकन में आपकी तत्परता स्वतः अपग्रेड होगी।"
              : "This intervention is deterministically linked to your targeted RBDL gating requirement. Fulfilling it satisfies the specific operational gate upon next reassessment."}
          </p>
        </div>

        {/* 2. Complete Traceability Evidence Trail (Audit & Reproducibility) */}
        {traceabilityJson && (
          <div className="rounded-2xl bg-stone-50 border border-stone-200 p-4 space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4 text-orange-600" />
              <span>
                {isHi
                  ? "सिफारिश ट्रेसेबिलिटी श्रृंखला (Requirement Traceability Trail)"
                  : "Recommendation Traceability Chain (Audit Trail)"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-stone-200/80">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">
                  {isHi ? "1. मूल्यांकन आयाम व स्कोर" : "1. Dimension Diagnostic"}
                </span>
                <span className="font-semibold text-stone-800 mt-0.5 block">
                  {dimensionCode?.toUpperCase()}: {step1?.actual_score ?? "—"}/10 (Gate: {step1?.target_gate_score ?? "4.0"})
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-stone-200/80">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">
                  {isHi ? "2. क्षमता अंतर (Capability Gap)" : "2. Capability Gap"}
                </span>
                <span className="font-semibold text-stone-800 mt-0.5 block">
                  Gap Magnitude: {step2?.gap_magnitude ?? 0.0} pts
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-stone-200/80">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">
                  {isHi ? "3. व्यावसायिक लक्ष्य व दर्द बिंदु" : "3. Context & Goal"}
                </span>
                <span className="font-semibold text-stone-800 mt-0.5 block truncate">
                  {step3?.business_goal?.split("_")[0] || "Goal"} & {step3?.primary_pain_point?.split("_")[0] || "Pain Point"}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-stone-200/80">
                <span className="text-[10px] text-stone-500 uppercase font-bold block">
                  {isHi ? "4. बजट संभाव्यता" : "4. Budget Feasibility"}
                </span>
                <span className="font-semibold text-stone-800 mt-0.5 block truncate">
                  {step3?.budget_tier?.split("_")[0] || "Tier"} {budgetFit ? `(${budgetFit.replace(/_/g, " ")})` : `(${step3?.illustrative_budget_range || "Illustrative"})`}
                </span>

              </div>
            </div>
          </div>
        )}

        {/* 3. Detailed Description & Why Recommended */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">
              {isHi ? "विस्तृत परिचालन विवरण" : "Operational Detail & Scope"}
            </h4>
            <p className="text-sm text-stone-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-100">
              {description || (isHi ? "व्यावसायिक डिजिटलीकरण के लिए चरणबद्ध कार्यान्वयन।" : "Step-by-step implementation for business digitalization.")}
            </p>
          </div>

          {reason && (
            <div>
              <h4 className="text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">
                {isHi ? "मूल्यांकन आधारित कारण (Diagnostic Rationale)" : "Diagnostic Rationale (Why Recommended)"}
              </h4>
              <p className="text-xs text-orange-950 bg-orange-50/70 p-3.5 rounded-xl border border-orange-100 leading-relaxed">
                {reason}
              </p>
            </div>
          )}
        </div>

        {/* 4. Budget-Tiered Implementation Subsets */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-stone-700 tracking-wider">
            <IndianRupee className="w-3.5 h-3.5 text-stone-600" />
            <span>
              {isHi
                ? "बजट के अनुसार कार्यान्वयन विकल्प (Budget-Tiered Subsets)"
                : "Budget-Tiered Implementation Subsets"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-900 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-700" />
                  {isHi ? "प्रवेश-स्तरीय सबसेट (Entry-Level)" : "Entry-Level Subset"}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {isHi ? "₹0 - ₹500/माह" : "₹0 - ₹500/mo"}
                </span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {isHi
                  ? "मुफ्त मोबाइल ऐप (Khatabook, Google Pay for Business, WhatsApp Business, Google My Business) से शुरुआत करें। शून्य अग्रिम लागत।"
                  : "Start immediately using free smartphone tools (Khatabook, GPay Business QR, WhatsApp Business, Google Business Profile). Zero upfront investment."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200/90 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
                  {isHi ? "विकास सबसेट (Growth-Tier)" : "Growth-Tier Subset"}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {isHi ? "₹500 - ₹3,000/माह" : "₹500 - ₹3,000/mo"}
                </span>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                {isHi
                  ? "उन्नत पीओएस बिलिंग सॉफ्टवेयर (Tally, Vyapar), थर्मल प्रिंटर, या सशुल्क ई-कॉमर्स स्टोर। मध्यम बजट में अधिक दक्षता।"
                  : "Dedicated POS billing software (Vyapar, Tally), thermal printers, or paid e-commerce subscriptions for enhanced volume handling."}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
          <span className="text-[11px] text-stone-500 font-medium">
            {isHi
              ? "प्रस्तावित अनुसंधान ढांचा — साक्ष्य आधारित सिफारिशें"
              : "Proposed Research Framework — Evidence-Based Roadmap"}
          </span>
          <Button variant="primary" onClick={onClose} size="sm">
            {isHi ? "समझ गया / बंद करें" : "Understood / Close"}
          </Button>
        </div>
      </div>
    </div>
  );
};
