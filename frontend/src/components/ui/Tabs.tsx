import React from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  badge?: string;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: "pills" | "underline";
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  variant = "pills",
  className = "",
}) => {
  return (
    <div
      className={`flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 rounded-2xl bg-stone-100 border border-stone-200/80 ${className}`}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;

        if (variant === "underline") {
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "border-orange-600 text-orange-600 font-bold"
                  : "border-transparent text-stone-500 hover:text-stone-800"
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-orange-100 text-orange-700 font-bold"
                      : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-2 select-none ${
              isActive
                ? "bg-white text-orange-600 shadow-sm border border-stone-200/80 font-bold"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive
                    ? "bg-orange-50 text-orange-600 border border-orange-200"
                    : "bg-stone-200 text-stone-600"
                }`}
              >
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
