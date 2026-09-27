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
    brand: "bg-orange-50 text-orange-600 border border-orange-200",
    emerald: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    amber: "bg-amber-50 text-amber-600 border border-amber-200",
    rose: "bg-rose-50 text-rose-600 border border-rose-200",
    slate: "bg-stone-100 text-stone-700 border border-stone-200",
  };

  const deltaStyles = {
    positive: "text-emerald-700 bg-emerald-50 border-emerald-200",
    negative: "text-rose-700 bg-rose-50 border-rose-200",
    neutral: "text-stone-600 bg-stone-100 border-stone-200",
  };

  const DeltaIcon =
    deltaType === "positive"
      ? TrendingUp
      : deltaType === "negative"
      ? TrendingDown
      : Minus;

  return (
    <div
      className={`p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between space-y-3 transition-all duration-200 hover:border-orange-300 hover:shadow-card-hover ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {label}
        </span>
        {icon && (
          <div className={`p-2.5 rounded-xl shrink-0 ${iconRingStyles[variant]}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <span className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading tracking-tight">
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
        {subtitle && <p className="text-xs text-stone-500 line-clamp-1">{subtitle}</p>}
      </div>
    </div>
  );
};
