import React from "react";
import { CheckCircle2, Zap, Sparkles, Building, BarChart2 } from "lucide-react";
import { Badge } from "../ui/Badge";

export interface LevelCardProps {
  level: number;
  nameEn: string;
  nameHi: string;
  descriptionEn: string;
  descriptionHi: string;
  capabilitiesEn: string[];
  capabilitiesHi: string[];
  currentLang?: string;
  isCurrent?: boolean;
  isTarget?: boolean;
  onSelect?: () => void;
  className?: string;
}

export const LevelCard: React.FC<LevelCardProps> = ({
  level,
  nameEn,
  nameHi,
  descriptionEn,
  descriptionHi,
  capabilitiesEn,
  capabilitiesHi,
  currentLang = "en",
  isCurrent = false,
  isTarget = false,
  onSelect,
  className = "",
}) => {
  const levelMeta = [
    {
      num: "0",
      badge: "Foundational",
      badgeHi: "बुनियादी तत्परता",
      color: "bg-white border-stone-200 text-stone-900 hover:border-stone-400",
      icon: <Building className="w-5 h-5 text-stone-500" />,
      accentBg: "bg-stone-100 text-stone-700",
    },
    {
      num: "1",
      badge: "Basic Presence",
      badgeHi: "डिजिटल उपस्थिति",
      color: "bg-white border-stone-200 text-stone-900 hover:border-orange-300",
      icon: <Zap className="w-5 h-5 text-orange-600" />,
      accentBg: "bg-orange-50 text-orange-700",
    },
    {
      num: "2",
      badge: "Operational",
      badgeHi: "परिचालन डिजिटलीकरण",
      color: "bg-white border-stone-200 text-stone-900 hover:border-orange-300",
      icon: <Sparkles className="w-5 h-5 text-orange-600" />,
      accentBg: "bg-orange-50 text-orange-700",
    },
    {
      num: "3",
      badge: "Growth & Data",
      badgeHi: "विकास व डेटा",
      color: "bg-white border-stone-200 text-stone-900 hover:border-emerald-300",
      icon: <BarChart2 className="w-5 h-5 text-emerald-600" />,
      accentBg: "bg-emerald-50 text-emerald-700",
    },
  ];

  const meta = levelMeta[level] || levelMeta[0];
  const name = currentLang === "hi" ? nameHi : nameEn;
  const description = currentLang === "hi" ? descriptionHi : descriptionEn;
  const capabilities = currentLang === "hi" ? capabilitiesHi : capabilitiesEn;

  return (
    <div
      onClick={onSelect}
      className={`relative p-6 sm:p-7 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between space-y-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${
        isCurrent
          ? "ring-2 ring-orange-500 border-orange-400 shadow-orange-500/10"
          : isTarget
          ? "ring-2 ring-emerald-500 border-emerald-400 shadow-emerald-500/10"
          : "hover:border-orange-200"
      } ${onSelect ? "cursor-pointer" : ""} ${className}`}
    >
      {/* Top row: level tag & icon */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center font-extrabold text-sm font-heading">
            L{level}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            {currentLang === "hi" ? meta.badgeHi : meta.badge}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isCurrent && (
            <Badge variant="brand" size="sm" dot>
              {currentLang === "hi" ? "वर्तमान स्तर" : "Current"}
            </Badge>
          )}
          {isTarget && (
            <Badge variant="success" size="sm" dot>
              {currentLang === "hi" ? "लक्ष्य स्तर" : "Target"}
            </Badge>
          )}
          <div className="p-2 rounded-xl bg-stone-50 border border-stone-100">{meta.icon}</div>
        </div>
      </div>

      {/* Main info */}
      <div className="space-y-2">
        <h4 className="text-lg sm:text-xl font-bold text-stone-900 font-heading tracking-tight">
          {name}
        </h4>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{description}</p>
      </div>

      {/* Key capabilities */}
      {capabilities && capabilities.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-stone-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
            {currentLang === "hi" ? "प्रमुख क्षमताएँ" : "Core Capabilities"}
          </span>
          <ul className="space-y-1.5">
            {capabilities.map((cap, i) => (
              <li key={i} className="text-xs text-stone-700 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-tight">{cap}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
