import React from "react";
import { Sparkles } from "lucide-react";

export interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = "Loading...",
  description = "Please wait a moment while we process your request",
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center space-y-4 animate-fadeIn ${className}`}
    >
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin" />
        <Sparkles className="w-6 h-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      </div>

      <div className="space-y-1 max-w-sm">
        <h4 className="text-base font-bold text-stone-900">{title}</h4>
        <p className="text-xs text-stone-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};
