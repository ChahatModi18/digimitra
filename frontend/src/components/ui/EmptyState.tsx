import React from "react";
import { Inbox } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`p-10 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800/80 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto backdrop-blur-md shadow-xl ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner">
        {icon || <Inbox className="w-8 h-8" />}
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h4 className="text-lg font-bold text-white tracking-tight">{title}</h4>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
