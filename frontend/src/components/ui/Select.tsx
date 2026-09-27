import React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options?: SelectOption[];
  leftIcon?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  hint,
  error,
  options,
  leftIcon,
  children,
  className = "",
  id,
  disabled,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-xl shadow-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}

        <select
          id={selectId}
          disabled={disabled}
          className={`w-full appearance-none rounded-xl bg-slate-900/90 border transition-all duration-200 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
            leftIcon ? "pl-10" : "pl-4"
          } pr-10 py-3 ${
            error
              ? "border-rose-500/80 focus:border-rose-500"
              : "border-slate-800 hover:border-slate-700 focus:border-indigo-500"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-950" : ""} ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error && <p className="text-xs font-medium text-rose-400 animate-fadeIn">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
};
