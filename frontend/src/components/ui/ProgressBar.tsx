import React from "react";

export interface ProgressBarProps {
  value: number; // 0 to 100 or 0 to max
  max?: number;
  label?: string;
  showValue?: boolean;
  valueSuffix?: string;
  variant?: "brand" | "emerald" | "amber" | "rose" | "purple" | "gradient";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = false,
  valueSuffix = "%",
  variant = "brand",
  size = "md",
  className = "",
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const variantStyles = {
    brand: "bg-indigo-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    purple: "bg-purple-500",
    gradient: "bg-gradient-to-r from-indigo-500 via-teal-400 to-emerald-400",
  };

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs font-semibold">
          {label && <span className="text-slate-300">{label}</span>}
          {showValue && (
            <span className="text-slate-400 font-mono">
              {typeof value === "number" ? Math.round(value) : value}
              {valueSuffix}
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-slate-800/90 rounded-full overflow-hidden border border-slate-700/50 p-0.5 ${sizeStyles[size]}`}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out shadow-sm ${variantStyles[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
