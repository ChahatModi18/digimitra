import React from "react";
import {
  Smartphone,
  BookOpen,
  Globe,
  MessageCircle,
  FileSpreadsheet,
  CreditCard,
  Boxes,
  LineChart,
  TrendingUp,
} from "lucide-react";
import { ProgressBar } from "../ui/ProgressBar";

export interface DimensionCardProps {
  code: string;
  nameEn: string;
  nameHi: string;
  descriptionEn?: string;
  descriptionHi?: string;
  score?: number; // 0 to 5.0
  weight?: number;
  currentLang?: string;
  className?: string;
}

export const DimensionCard: React.FC<DimensionCardProps> = ({
  code,
  nameEn,
  nameHi,
  descriptionEn,
  descriptionHi,
  score,
  weight,
  currentLang = "en",
  className = "",
}) => {
  const getDimensionIcon = (dimCode: string) => {
    switch (dimCode.toLowerCase()) {
      case "infra":
        return <Smartphone className="w-5 h-5 text-indigo-400" />;
      case "literacy":
        return <BookOpen className="w-5 h-5 text-sky-400" />;
      case "presence":
        return <Globe className="w-5 h-5 text-emerald-400" />;
      case "comms":
        return <MessageCircle className="w-5 h-5 text-teal-400" />;
      case "records":
        return <FileSpreadsheet className="w-5 h-5 text-amber-400" />;
      case "payments":
        return <CreditCard className="w-5 h-5 text-blue-400" />;
      case "inventory":
        return <Boxes className="w-5 h-5 text-purple-400" />;
      case "analytics":
        return <LineChart className="w-5 h-5 text-rose-400" />;
      case "growth":
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      default:
        return <Smartphone className="w-5 h-5 text-indigo-400" />;
    }
  };

  const name = currentLang === "hi" ? nameHi : nameEn;
  const description = currentLang === "hi" ? descriptionHi : descriptionEn;

  return (
    <div
      className={`p-5 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-lg backdrop-blur-md flex flex-col justify-between space-y-4 transition-all duration-200 hover:border-slate-700 hover:-translate-y-0.5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-inner">
          {getDimensionIcon(code)}
        </div>
        {weight !== undefined && (
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
            {weight}x Weight
          </span>
        )}
      </div>

      <div className="space-y-1">
        <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">{name}</h4>
        {description && (
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{description}</p>
        )}
      </div>

      {score !== undefined && (
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Readiness</span>
            <span className="font-bold text-slate-200">{score.toFixed(1)} / 5.0</span>
          </div>
          <ProgressBar
            value={score}
            max={5}
            variant={score >= 4.0 ? "emerald" : score >= 2.5 ? "amber" : "rose"}
            size="sm"
          />
        </div>
      )}
    </div>
  );
};
