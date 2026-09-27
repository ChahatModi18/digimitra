import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  className = "",
  id,
  disabled,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-stone-700"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-xl shadow-xs">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          className={`w-full rounded-xl bg-white border transition-all duration-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
            leftIcon ? "pl-10" : "pl-4"
          } ${rightIcon ? "pr-10" : "pr-4"} py-2.5 ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-stone-200 hover:border-stone-300 focus:border-orange-500"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-stone-50" : ""} ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error && <p className="text-xs font-medium text-rose-600 animate-fadeIn">{error}</p>}
      {!error && hint && <p className="text-xs text-stone-500">{hint}</p>}
    </div>
  );
};
