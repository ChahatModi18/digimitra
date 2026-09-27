import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "brand" | "success" | "warning" | "error" | "neutral" | "info" | "purple";
  size?: "sm" | "md";
  dot?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  dot = false,
  className = "",
  icon,
}) => {
  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 gap-1 font-semibold",
    md: "text-xs px-2.5 py-1 gap-1.5 font-medium",
  };

  const variantStyles = {
    brand: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
    success: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    warning: "bg-amber-500/15 border-amber-500/30 text-amber-300",
    error: "bg-rose-500/15 border-rose-500/30 text-rose-300",
    neutral: "bg-slate-800/80 border-slate-700 text-slate-300",
    info: "bg-sky-500/15 border-sky-500/30 text-sky-300",
    purple: "bg-purple-500/15 border-purple-500/30 text-purple-300",
  };

  const dotColor = {
    brand: "bg-indigo-400",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    error: "bg-rose-400",
    neutral: "bg-slate-400",
    info: "bg-sky-400",
    purple: "bg-purple-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor[variant]} animate-pulse`}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
