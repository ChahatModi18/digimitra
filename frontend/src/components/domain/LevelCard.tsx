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
      color: "from-slate-800 to-slate-900 border-slate-700/80 text-slate-300",
      icon: <Building className="w-5 h-5 text-slate-400" />,
      accentBg: "bg-slate-800/80 text-slate-300",
    },
    {
      num: "1",
      badge: "Basic Presence",
      color: "from-blue-950/40 to-slate-900 border-blue-500/30 text-blue-300",
      icon: <Zap className="w-5 h-5 text-blue-400" />,
      accentBg: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    },
    {
      num: "2",
      badge: "Operational",
      color: "from-indigo-950/40 to-slate-900 border-indigo-500/30 text-indigo-300",
      icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
      accentBg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    },
    {
      num: "3",
      badge: "Growth & Data",
      color: "from-emerald-950/40 to-slate-900 border-emerald-500/30 text-emerald-300",
      icon: <BarChart2 className="w-5 h-5 text-emerald-400" />,
      accentBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    },
  ];

  const meta = levelMeta[level] || levelMeta[0];
  const name = currentLang === "hi" ? nameHi : nameEn;
  const description = currentLang === "hi" ? descriptionHi : descriptionEn;
  const capabilities = currentLang === "hi" ? capabilitiesHi : capabilitiesEn;

  return (
    <div
      onClick={onSelect}
      className={`relative p-6 sm:p-7 rounded-3xl bg-gradient-to-br ${meta.color} border shadow-xl backdrop-blur-md flex flex-col justify-between space-y-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        isCurrent
          ? "ring-2 ring-indigo-500 border-indigo-400 shadow-indigo-500/20"
          : isTarget
          ? "ring-2 ring-emerald-500 border-emerald-400 shadow-emerald-500/20"
          : "hover:border-slate-600"
      } ${onSelect ? "cursor-pointer" : ""} ${className}`}
    >
      {/* Top row: level tag & icon */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-extrabold text-sm text-white font-heading">
            L{level}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {meta.badge}
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
          <div className="p-2 rounded-xl bg-white/5">{meta.icon}</div>
        </div>
      </div>

      {/* Main info */}
      <div className="space-y-2">
        <h4 className="text-lg sm:text-xl font-bold text-white font-heading tracking-tight">
          {name}
        </h4>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>

      {/* Key capabilities */}
      {capabilities && capabilities.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            {currentLang === "hi" ? "प्रमुख क्षमताएँ" : "Core Capabilities"}
          </span>
          <ul className="space-y-1.5">
            {capabilities.map((cap, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-tight">{cap}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
