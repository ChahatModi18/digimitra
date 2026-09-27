import React from "react";

export interface LevelProgressBarProps {
  currentLevel: number;
  className?: string;
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  currentLevel,
  className = "",
}) => {
  const levels = [
    { level: 0, label: "L0", name: "Foundational", color: "#9C8F84" },
    { level: 1, label: "L1", name: "Presence", color: "#C88A1D" },
    { level: 2, label: "L2", name: "Operational", color: "#1B7A6E" },
    { level: 3, label: "L3", name: "Growth", color: "#F0592A" },
  ];

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="grid grid-cols-4 gap-2">
        {levels.map((lvl) => {
          const isFilled = lvl.level <= currentLevel;
          const isCurrent = lvl.level === currentLevel;

          return (
            <div key={lvl.level} className="space-y-1">
              <div
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isFilled ? "" : "bg-[#EDE2D8]"
                }`}
                style={{
                  backgroundColor: isFilled ? lvl.color : "#EDE2D8",
                }}
              />
              <div className="flex justify-between items-center text-[10px] font-bold px-0.5">
                <span
                  style={{
                    color: isFilled ? lvl.color : "#9C8F84",
                    fontWeight: isCurrent ? "700" : "600",
                  }}
                >
                  {lvl.label}
                </span>
                <span className="text-[#9C8F84] hidden sm:inline text-[9px] font-medium">
                  {lvl.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
