import React from "react";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5 gap-1.5 min-h-[34px]",
    md: "text-sm px-5 py-2.5 gap-2 min-h-[42px]",
    lg: "text-base px-6 py-3.5 gap-2.5 min-h-[48px]",
  };

  const variantStyles = {
    primary:
      "bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/30 focus:ring-orange-500 border border-orange-500",
    secondary:
      "bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 hover:border-stone-300 shadow-xs focus:ring-stone-400",
    outline:
      "bg-white hover:bg-orange-50 text-orange-600 hover:text-orange-700 border border-orange-200 hover:border-orange-300 shadow-xs focus:ring-orange-500",
    ghost:
      "bg-transparent hover:bg-stone-100 text-stone-600 hover:text-stone-900 focus:ring-stone-400",
    danger:
      "bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 focus:ring-rose-500 border border-rose-600",
    success:
      "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 focus:ring-emerald-500 border border-emerald-600",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
