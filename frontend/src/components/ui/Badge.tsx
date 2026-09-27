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
    brand: "bg-orange-50 border-orange-200 text-orange-700 font-bold",
    success: "bg-emerald-50 border-emerald-200 text-emerald-700 font-bold",
    warning: "bg-amber-50 border-amber-200 text-amber-700 font-bold",
    error: "bg-rose-50 border-rose-200 text-rose-700 font-bold",
    neutral: "bg-stone-100 border-stone-200 text-stone-700 font-medium",
    info: "bg-sky-50 border-sky-200 text-sky-700 font-bold",
    purple: "bg-purple-50 border-purple-200 text-purple-700 font-bold",
  };

  const dotColor = {
    brand: "bg-orange-500",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    error: "bg-rose-500",
    neutral: "bg-stone-400",
    info: "bg-sky-500",
    purple: "bg-purple-500",
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
