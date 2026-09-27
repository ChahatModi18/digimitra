import React from "react";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  badge?: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  containerClassName?: string;
}

export const Section: React.FC<SectionProps> = ({
  badge,
  title,
  subtitle,
  action,
  children,
  className = "",
  containerClassName = "",
  ...props
}) => {
  return (
    <section className={`space-y-6 ${className}`} {...props}>
      {(title || badge || action) && (
        <div
          className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-800/80 pb-4 ${containerClassName}`}
        >
          <div className="space-y-1">
            {badge && <div className="mb-1.5">{badge}</div>}
            {title && (
              <h2 className="text-xl sm:text-2xl font-bold text-white font-heading tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
};
