import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "gradient-indigo" | "gradient-emerald" | "gradient-orange" | "subtle";
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
    default: "bg-white border border-stone-200 shadow-sm",
    interactive:
      "bg-white border border-stone-200 hover:border-orange-300 shadow-sm hover:shadow-card-hover cursor-pointer transition-all duration-200 hover:-translate-y-1",
    "gradient-indigo":
      "bg-gradient-to-br from-orange-50/60 via-white to-amber-50/40 border border-orange-200/80 shadow-md",
    "gradient-orange":
      "bg-gradient-to-br from-orange-50 via-white to-amber-50 border border-orange-200 shadow-md",
    "gradient-emerald":
      "bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 border border-emerald-200/80 shadow-md",
    subtle: "bg-stone-50/80 border border-stone-200/80 shadow-xs",
  };

  const hoverStyle = hover && variant === "default" ? "transition-all duration-200 hover:border-orange-300 hover:shadow-card-hover hover:-translate-y-0.5" : "";

  return (
    <div
      className={`rounded-2xl sm:rounded-3xl ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyle} ${className}`}
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
  <h3 className={`text-lg font-bold text-stone-900 tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <p className={`text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed ${className}`} {...props}>
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
  <div className={`mt-6 pt-4 border-t border-stone-100 flex items-center justify-between gap-4 ${className}`} {...props}>
    {children}
  </div>
);
