import React from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

export interface RecommendationCardProps {
  code: string;
  titleEn: string;
  titleHi: string;
  descriptionEn?: string;
  descriptionHi?: string;
  reasonEn?: string;
  reasonHi?: string;
  dimensionCode?: string;
  priorityScore?: number;
  impactLevel?: string;
  effortLevel?: string;
  costLevel?: string;
  currentLang?: string;
  onAction?: () => void;
  actionLabel?: string;
  onExplore?: () => void;
  exploreLabel?: string;
  className?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  code,
  titleEn,
  titleHi,
  descriptionEn,
  descriptionHi,
  reasonEn,
  reasonHi,
  dimensionCode,
  priorityScore,
  impactLevel = "medium",
  effortLevel = "medium",
  costLevel = "low",
  currentLang = "en",
  onAction,
  actionLabel,
  onExplore,
  exploreLabel,
  className = "",
}) => {
  const title = currentLang === "hi" ? titleHi : titleEn;
  const description = currentLang === "hi" ? descriptionHi : descriptionEn;
  const reason = currentLang === "hi" ? reasonHi : reasonEn;

  const levelBadges: Record<string, { color: string; labelEn: string; labelHi: string }> = {
    low: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", labelEn: "Low", labelHi: "कम" },
    medium: { color: "bg-amber-50 text-amber-700 border-amber-200", labelEn: "Medium", labelHi: "मध्यम" },
    high: { color: "bg-rose-50 text-rose-700 border-rose-200", labelEn: "High", labelHi: "उच्च" },
  };

  return (
    <div
      className={`p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between space-y-5 transition-all duration-300 hover:border-orange-300 hover:shadow-card-hover hover:-translate-y-1 ${className}`}
    >
      <div className="space-y-3">
        {/* Top bar: Code, Priority, Dimension */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-extrabold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
              {code}
            </span>
            {dimensionCode && (
              <span className="text-[10px] uppercase font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                {dimensionCode}
              </span>
            )}
          </div>

          {priorityScore !== undefined && (
            <Badge variant="brand" size="sm" icon={<Sparkles className="w-3 h-3 mr-1" />}>
              Priority <span className="font-bold ml-0.5">{priorityScore.toFixed(2)}</span>
            </Badge>
          )}
        </div>

        {/* Title & description */}
        <div className="space-y-1.5">
          <h4 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight leading-snug">
            {title}
          </h4>
          {description && (
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{description}</p>
          )}
        </div>

        {/* Rationale / Why recommended */}
        {reason && (
          <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-100 text-xs text-stone-700 leading-relaxed">
            <span className="font-bold text-orange-800 block mb-0.5">
              {currentLang === "hi" ? "यह क्यों महत्वपूर्ण है:" : "Why Recommended:"}
            </span>
            {reason}
          </div>
        )}
      </div>

      {/* Meta tags & Action */}
      <div className="pt-4 border-t border-stone-100 space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="text-[9px] uppercase font-bold text-stone-500 block">
              {currentLang === "hi" ? "प्रभाव" : "Impact"}
            </span>
            <span className={`text-xs font-bold inline-block px-1.5 py-0.5 rounded mt-0.5 border ${levelBadges[impactLevel.toLowerCase()]?.color || ""}`}>
              {currentLang === "hi"
                ? levelBadges[impactLevel.toLowerCase()]?.labelHi || impactLevel
                : levelBadges[impactLevel.toLowerCase()]?.labelEn || impactLevel}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="text-[9px] uppercase font-bold text-stone-500 block">
              {currentLang === "hi" ? "प्रयास" : "Effort"}
            </span>
            <span className={`text-xs font-bold inline-block px-1.5 py-0.5 rounded mt-0.5 border ${levelBadges[effortLevel.toLowerCase()]?.color || ""}`}>
              {currentLang === "hi"
                ? levelBadges[effortLevel.toLowerCase()]?.labelHi || effortLevel
                : levelBadges[effortLevel.toLowerCase()]?.labelEn || effortLevel}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80">
            <span className="text-[9px] uppercase font-bold text-stone-500 block">
              {currentLang === "hi" ? "लागत" : "Cost"}
            </span>
            <span className={`text-xs font-bold inline-block px-1.5 py-0.5 rounded mt-0.5 border ${levelBadges[costLevel.toLowerCase()]?.color || ""}`}>
              {currentLang === "hi"
                ? levelBadges[costLevel.toLowerCase()]?.labelHi || costLevel
                : levelBadges[costLevel.toLowerCase()]?.labelEn || costLevel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onExplore && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExplore}
              className="flex-1 border-orange-200 text-orange-800 hover:bg-orange-50"
            >
              {exploreLabel || (currentLang === "hi" ? "स्थानीय मदद खोजें" : "Find Local Help")}
            </Button>
          )}

          {onAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAction}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className={onExplore ? "flex-1" : "w-full"}
            >
              {actionLabel || (currentLang === "hi" ? "विवरण देखें" : "View Details")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
