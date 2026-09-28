import React from "react";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ResearchDisclosureBannerProps {
  className?: string;
  compact?: boolean;
}

export const ResearchDisclosureBanner: React.FC<ResearchDisclosureBannerProps> = ({
  className = "",
  compact = false,
}) => {
  const { i18n } = useTranslation();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";

  return (
    <div
      className={`rounded-xl border border-amber-200/90 bg-amber-50/80 p-3.5 text-xs text-amber-900 shadow-xs ${className}`}
      role="note"
      aria-label="Research and Diagnostic Disclosure"
    >
      <div className="flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold tracking-tight text-amber-950">
            {currentLang === "hi"
              ? "अनुसंधान एवं कार्यप्रणाली प्रकटीकरण (Research Notice)"
              : "Academic & Diagnostic Methodology Disclosure"}
          </p>
          <p className="text-amber-800 leading-relaxed">
            {currentLang === "hi"
              ? "आवश्यकता-आधारित डिजिटलीकरण स्तर (RBDL) रूपरेखा अनुसंधान और स्व-मूल्यांकन के लिए प्रस्तावित एक खोजपूर्ण नैदानिक उपकरण है। यह वास्तविक व्यावसायिक परिणामों या राजस्व वृद्धि का औपचारिक वैज्ञानिक दावा नहीं करता है।"
              : "The Requirement-Based Digitalization Level (RBDL) framework is a proposed exploratory diagnostic instrument for structured self-assessment. It has not yet undergone formal longitudinal or empirical validation and does not guarantee commercial outcomes."}
          </p>
          {!compact && (
            <p className="text-[11px] text-amber-700 italic pt-0.5">
              {currentLang === "hi"
                ? "नोट: सभी सुझाव और रोडमैप स्व-रिपोर्ट की गई परिचालन आवश्यकताओं पर आधारित हैं।"
                : "Note: All recommendations and phased roadmaps are deterministically mapped to self-reported operational capabilities."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
