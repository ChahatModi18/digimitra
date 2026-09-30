import React from "react";

export interface DimensionScoreItem {
  code: string;
  nameEn: string;
  nameHi: string;
  score: number; // 0 to 10
  requiredThreshold?: number;
}

export interface DimensionScoreBarChartProps {
  scores: Record<string, number>;
  thresholds?: Record<string, number>;
  currentLang?: "en" | "hi";
  className?: string;
}

export const DimensionScoreBarChart: React.FC<DimensionScoreBarChartProps> = ({
  scores,
  thresholds = {},
  currentLang = "en",
  className = "",
}) => {
  const dimensionMeta: Record<string, { en: string; hi: string; icon: string }> = {
    infra: { en: "Digital Infrastructure", hi: "डिजिटल इन्फ्रास्ट्रक्चर", icon: "📱" },
    literacy: { en: "Digital Literacy & Skills", hi: "डिजिटल साक्षरता व कौशल", icon: "🎓" },
    presence: { en: "Online Presence & Discovery", hi: "ऑनलाइन उपस्थिति एवं खोज", icon: "🌐" },
    comms: { en: "Customer Communication", hi: "ग्राहक संचार", icon: "💬" },
    records: { en: "Digital Bookkeeping & Records", hi: "डिजिटल बहीखाता व रिकॉर्ड", icon: "📋" },
    payments: { en: "Digital Payment Systems", hi: "डिजिटल भुगतान प्रणाली", icon: "💳" },
    inventory: { en: "Inventory & Stock Operations", hi: "इन्वेंट्री व स्टॉक संचालन", icon: "📦" },
    analytics: { en: "Data & Sales Analytics", hi: "डेटा व बिक्री विश्लेषण", icon: "📊" },
    growth: { en: "Digital Growth & Marketplaces", hi: "डिजिटल विकास व मार्केटप्लेस", icon: "🚀" },
  };

  return (
    <div className={`space-y-3.5 ${className}`}>
      {Object.entries(scores).map(([code, score]) => {
        const meta = dimensionMeta[code] || { en: code, hi: code, icon: "📊" };
        const threshold = thresholds[code] || 4.0;
        const numScore = typeof score === "number" && !isNaN(score) ? score : 0;
        const isSatisfied = numScore >= threshold;
        const name = currentLang === "hi" ? meta.hi : meta.en;
        const widthPercent = Math.min(Math.max((numScore / 10) * 100, 4), 100);

        return (
          <div key={code} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-sm">{meta.icon}</span>
                <span className="font-bold text-[#241C15]">{name}</span>
                <span className="text-[10px] text-[#9C8F84] uppercase font-mono font-semibold">
                  ({code})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#241C15]">
                  {numScore.toFixed(1)} / 10
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSatisfied
                      ? "bg-[#E8F5EC] text-[#2E8B57]"
                      : "bg-[#FFE8DE] text-[#F0592A]"
                  }`}
                >
                  {isSatisfied ? "Ready" : "Gap"}
                </span>
              </div>
            </div>

            {/* Bar Track */}
            <div className="h-2.5 w-full rounded-full bg-[#EDE2D8] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${widthPercent}%`,
                  backgroundColor: isSatisfied ? "#2E8B57" : "#F0592A",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
