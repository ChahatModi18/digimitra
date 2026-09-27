import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "gradient-indigo" | "gradient-emerald" | "subtle";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  hover = false,
  padding = "md",
  className = "",
  ...props
}) => {
  const paddingStyles = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const variantStyles = {
    default: "bg-slate-900/70 border border-slate-800 shadow-xl backdrop-blur-md",
    interactive:
      "bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 shadow-xl backdrop-blur-md cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-indigo-950/40",
    "gradient-indigo":
      "bg-gradient-to-br from-indigo-950/50 via-slate-900/90 to-slate-950 border border-indigo-500/30 shadow-2xl backdrop-blur-md",
    "gradient-emerald":
      "bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-950 border border-emerald-500/30 shadow-2xl backdrop-blur-md",
    subtle: "bg-slate-950/50 border border-slate-800/80 shadow-sm",
  };

  const hoverStyle = hover && variant === "default" ? "transition-all duration-200 hover:border-slate-700 hover:-translate-y-0.5" : "";

  return (
    <div
      className={`rounded-3xl ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`flex items-center justify-between gap-4 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <h3 className={`text-lg font-bold text-white tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <p className={`text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`space-y-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div className={`mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-4 ${className}`} {...props}>
    {children}
  </div>
);
