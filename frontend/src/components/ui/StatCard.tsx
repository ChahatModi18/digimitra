import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  delta?: number | string;
  deltaType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  variant?: "brand" | "emerald" | "amber" | "rose" | "slate";
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  delta,
  deltaType = "neutral",
  subtitle,
  variant = "slate",
  className = "",
}) => {
  const iconRingStyles = {
    brand: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    rose: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    slate: "bg-slate-800/80 text-slate-300 border border-slate-700",
  };

  const deltaStyles = {
    positive: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    negative: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    neutral: "text-slate-400 bg-slate-800 border-slate-700",
  };

  const DeltaIcon =
    deltaType === "positive"
      ? TrendingUp
      : deltaType === "negative"
      ? TrendingDown
      : Minus;

  return (
    <div
      className={`p-5 rounded-3xl bg-slate-900/70 border border-slate-800/90 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-3 transition-all duration-200 hover:border-slate-700 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        {icon && (
          <div className={`p-2.5 rounded-2xl shrink-0 ${iconRingStyles[variant]}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
            {value}
          </span>
          {delta !== undefined && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${deltaStyles[deltaType]}`}
            >
              <DeltaIcon className="w-3 h-3" />
              <span>{delta}</span>
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-slate-400 line-clamp-1">{subtitle}</p>}
      </div>
    </div>
  );
};
