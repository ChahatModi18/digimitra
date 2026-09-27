import React from "react";
import { AlertTriangle, RefreshCw, Sparkles, Inbox } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  subMessage = "Please wait a moment",
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-pulse space-y-3">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      <Sparkles className="w-5 h-5 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
    <div className="space-y-1">
      <h4 className="text-base font-semibold text-slate-200">{message}</h4>
      <p className="text-xs text-slate-400">{subMessage}</p>
    </div>
  </div>
);

interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
}) => (
  <div className="rounded-2xl bg-rose-950/40 border border-rose-500/30 p-5 text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <p className="text-xs text-rose-300 mt-0.5 leading-relaxed">{message}</p>
      </div>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-semibold text-rose-100 transition shrink-0"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Try Again</span>
      </button>
    )}
  </div>
);

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) => (
  <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto">
    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner">
      <Icon className="w-7 h-7" />
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-bold text-white font-heading">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
        {description}
      </p>
    </div>
    {actionLabel && onAction && (
      <div className="pt-2">
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition hover:scale-105"
        >
          <span>{actionLabel}</span>
        </button>
      </div>
    )}
  </div>
);
