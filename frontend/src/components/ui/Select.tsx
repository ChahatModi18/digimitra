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

        <select
          id={selectId}
          disabled={disabled}
          className={`w-full appearance-none rounded-xl bg-white border transition-all duration-200 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
            leftIcon ? "pl-10" : "pl-4"
          } pr-10 py-2.5 ${
            error
              ? "border-rose-300 focus:border-rose-500"
              : "border-stone-200 hover:border-stone-300 focus:border-orange-500"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-stone-50" : ""} ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-white text-stone-900">
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-stone-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error && <p className="text-xs font-medium text-rose-600 animate-fadeIn">{error}</p>}
      {!error && hint && <p className="text-xs text-stone-500">{hint}</p>}
    </div>
  );
};
