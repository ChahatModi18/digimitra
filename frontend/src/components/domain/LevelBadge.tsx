import React from "react";

export interface LevelBadgeProps {
  level: number;
  showName?: boolean;
  currentLang?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  showName = true,
  currentLang = "en",
  size = "md",
  className = "",
}) => {
  const levelNames: Record<number, { en: string; hi: string; color: string; bg: string; border: string }> = {
    0: {
      en: "Level 0 · Foundational Readiness",
      hi: "स्तर 0 · बुनियादी तत्परता",
      color: "#9C8F84",
      bg: "rgba(156, 143, 132, 0.15)",
      border: "rgba(156, 143, 132, 0.3)",
    },
    1: {
      en: "Level 1 · Basic Digital Presence",
      hi: "स्तर 1 · बुनियादी डिजिटल उपस्थिति",
      color: "#C88A1D",
      bg: "rgba(200, 138, 29, 0.15)",
      border: "rgba(200, 138, 29, 0.3)",
    },
    2: {
      en: "Level 2 · Operational Digitalization",
      hi: "स्तर 2 · परिचालन डिजिटलीकरण",
      color: "#1B7A6E",
      bg: "rgba(27, 122, 110, 0.15)",
      border: "rgba(27, 122, 110, 0.3)",
    },
    3: {
      en: "Level 3 · Growth-Oriented Enterprise",
      hi: "स्तर 3 · विकास-उन्मुख उद्यम",
      color: "#F0592A",
      bg: "rgba(240, 89, 42, 0.15)",
      border: "rgba(240, 89, 42, 0.3)",
    },
  };

  const meta = levelNames[level] || levelNames[0];
  const label = showName
    ? currentLang === "hi"
      ? meta.hi
      : meta.en
    : currentLang === "hi"
    ? `स्तर ${level}`
    : `Level ${level}`;

  const sizeClasses = {
    sm: "text-[11px] px-2.5 py-0.5 font-semibold",
    md: "text-xs px-3.5 py-1 font-bold",
    lg: "text-sm px-4 py-1.5 font-extrabold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill border tracking-wide uppercase font-sans ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: meta.bg,
        color: meta.color,
        borderColor: meta.border,
      }}
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: meta.color }}
      />
      <span>{label}</span>
    </span>
  );
};
