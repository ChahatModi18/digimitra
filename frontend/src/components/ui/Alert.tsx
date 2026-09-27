import React from "react";
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export interface AlertProps {
  type?: "info" | "success" | "warning" | "error";
  title?: string;
  children: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  children,
  onDismiss,
  className = "",
}) => {
  const styles = {
    info: {
      container: "bg-indigo-950/40 border-indigo-500/30 text-indigo-200",
      icon: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
      title: "text-indigo-200 font-bold",
    },
    success: {
      container: "bg-emerald-950/40 border-emerald-500/30 text-emerald-200",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      title: "text-emerald-200 font-bold",
    },
    warning: {
      container: "bg-amber-950/40 border-amber-500/30 text-amber-200",
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      title: "text-amber-200 font-bold",
    },
    error: {
      container: "bg-rose-950/40 border-rose-500/30 text-rose-200",
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
      title: "text-rose-200 font-bold",
    },
  };

  const current = styles[type];

  return (
    <div
      className={`p-4 rounded-2xl border backdrop-blur-md flex items-start gap-3 shadow-lg ${current.container} ${className}`}
    >
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1 text-xs sm:text-sm leading-relaxed">
        {title && <h5 className={`mb-1 ${current.title}`}>{title}</h5>}
        <div className="text-slate-300">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
