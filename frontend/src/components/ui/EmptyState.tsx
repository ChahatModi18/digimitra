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
      className={`p-10 sm:p-12 rounded-2xl bg-white border border-stone-200 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto shadow-sm ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shadow-xs">
        {icon || <Inbox className="w-8 h-8" />}
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h4 className="text-lg font-bold text-stone-900 tracking-tight">{title}</h4>
        <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">{description}</p>
      </div>

      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
