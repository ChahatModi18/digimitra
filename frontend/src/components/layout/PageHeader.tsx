import React from "react";

export interface PageHeaderProps {
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  badge,
  title,
  subtitle,
  actions,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/50 via-slate-900/90 to-slate-950 border border-slate-800 shadow-2xl backdrop-blur-md ${className}`}
    >
      <div className="flex items-start sm:items-center gap-4">
        {icon && (
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner shrink-0 mt-0.5 sm:mt-0">
            {icon}
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>

          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          {actions}
        </div>
      )}
    </div>
  );
};
