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
      container: "bg-orange-50 border-orange-200 text-orange-950",
      icon: <Info className="w-5 h-5 text-orange-600 shrink-0" />,
      title: "text-orange-900 font-bold",
      body: "text-orange-800",
    },
    success: {
      container: "bg-emerald-50 border-emerald-200 text-emerald-950",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      title: "text-emerald-900 font-bold",
      body: "text-emerald-800",
    },
    warning: {
      container: "bg-amber-50 border-amber-200 text-amber-950",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      title: "text-amber-900 font-bold",
      body: "text-amber-800",
    },
    error: {
      container: "bg-rose-50 border-rose-200 text-rose-950",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      title: "text-rose-900 font-bold",
      body: "text-rose-800",
    },
  };

  const current = styles[type];

  return (
    <div
      className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xs ${current.container} ${className}`}
    >
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1 text-xs sm:text-sm leading-relaxed">
        {title && <h5 className={`mb-1 ${current.title}`}>{title}</h5>}
        <div className={current.body}>{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-stone-400 hover:text-stone-700 transition-colors p-1 rounded-lg hover:bg-black/5"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
