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
  className = "",
}) => {
  const title = currentLang === "hi" ? titleHi : titleEn;
  const description = currentLang === "hi" ? descriptionHi : descriptionEn;
  const reason = currentLang === "hi" ? reasonHi : reasonEn;

  const levelBadges: Record<string, { color: string; labelEn: string; labelHi: string }> = {
    low: { color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", labelEn: "Low", labelHi: "कम" },
    medium: { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", labelEn: "Medium", labelHi: "मध्यम" },
    high: { color: "bg-rose-500/10 text-rose-400 border-rose-500/20", labelEn: "High", labelHi: "उच्च" },
  };

  return (
    <div
      className={`p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-5 transition-all duration-300 hover:border-indigo-500/40 hover:-translate-y-1 ${className}`}
    >
      <div className="space-y-3">
        {/* Top bar: Code, Priority, Dimension */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-extrabold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {code}
            </span>
            {dimensionCode && (
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
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
          <h4 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
            {title}
          </h4>
          {description && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{description}</p>
          )}
        </div>

        {/* Rationale / Why recommended */}
        {reason && (
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-indigo-300/90 leading-relaxed">
            <span className="font-semibold text-indigo-400 block mb-0.5">
              {currentLang === "hi" ? "यह क्यों महत्वपूर्ण है:" : "Why Recommended:"}
            </span>
            {reason}
          </div>
        )}
      </div>

      {/* Meta tags & Action */}
      <div className="pt-4 border-t border-slate-800/80 space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">
              {currentLang === "hi" ? "प्रभाव" : "Impact"}
            </span>
            <span className={`text-xs font-bold ${levelBadges[impactLevel.toLowerCase()]?.color || ""}`}>
              {currentLang === "hi"
                ? levelBadges[impactLevel.toLowerCase()]?.labelHi || impactLevel
                : levelBadges[impactLevel.toLowerCase()]?.labelEn || impactLevel}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">
              {currentLang === "hi" ? "प्रयास" : "Effort"}
            </span>
            <span className={`text-xs font-bold ${levelBadges[effortLevel.toLowerCase()]?.color || ""}`}>
              {currentLang === "hi"
                ? levelBadges[effortLevel.toLowerCase()]?.labelHi || effortLevel
                : levelBadges[effortLevel.toLowerCase()]?.labelEn || effortLevel}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-[9px] uppercase font-bold text-slate-500 block">
              {currentLang === "hi" ? "लागत" : "Cost"}
            </span>
            <span className={`text-xs font-bold ${levelBadges[costLevel.toLowerCase()]?.color || ""}`}>
              {currentLang === "hi"
                ? levelBadges[costLevel.toLowerCase()]?.labelHi || costLevel
                : levelBadges[costLevel.toLowerCase()]?.labelEn || costLevel}
            </span>
          </div>
        </div>

        {onAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAction}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="w-full"
          >
            {actionLabel || (currentLang === "hi" ? "विवरण देखें" : "View Details")}
          </Button>
        )}
      </div>
    </div>
  );
};
