import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "An error occurred while communicating with the DigiMitra service.",
  onRetry,
  className = "",
}) => {
  return (
    <div
      className={`p-8 sm:p-10 rounded-3xl bg-rose-950/20 border border-rose-500/30 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto backdrop-blur-md shadow-xl ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shadow-inner">
        <AlertCircle className="w-7 h-7" />
      </div>

      <div className="space-y-1">
        <h4 className="text-base sm:text-lg font-bold text-rose-200">{title}</h4>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{message}</p>
      </div>

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="mt-2"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
