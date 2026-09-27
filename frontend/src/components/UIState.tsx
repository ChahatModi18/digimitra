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
      <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin" />
      <Sparkles className="w-5 h-5 text-orange-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>
    <div className="space-y-1">
      <h4 className="text-base font-bold text-stone-900">{message}</h4>
      <p className="text-xs text-stone-500">{subMessage}</p>
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
  <div className="rounded-2xl bg-rose-50 border border-rose-200 p-5 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-bold text-stone-900">{title}</h4>
        <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{message}</p>
      </div>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-rose-100 border border-rose-300 text-xs font-semibold text-rose-800 transition shrink-0 shadow-xs"
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
  <div className="rounded-3xl bg-white border border-stone-200 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-card">
    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center mx-auto shadow-xs">
      <Icon className="w-7 h-7" />
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-bold text-stone-900 font-heading">{title}</h3>
      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
        {description}
      </p>
    </div>
    {actionLabel && onAction && (
      <div className="pt-2">
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold shadow-orange-glow transition hover:scale-105"
        >
          <span>{actionLabel}</span>
        </button>
      </div>
    )}
  </div>
);
