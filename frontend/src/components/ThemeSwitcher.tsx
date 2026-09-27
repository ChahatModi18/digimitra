import React, { useState, useRef, useEffect } from "react";
import { Palette, Check, ChevronDown } from "lucide-react";
import { useTheme, MsmeThemeId } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

interface ThemeSwitcherProps {
  compact?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ compact = false }) => {
  const { theme, themeId, setThemeId, availableThemes } = useTheme();
  const { i18n } = useTranslation();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Change MSME Theme Palette"
          title={`Theme: ${currentLang === "hi" ? theme.nameHi : theme.nameEn}`}
          className="flex items-center gap-1.5 p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 transition shadow-xs"
        >
          <div
            className="w-4 h-4 rounded-full border border-black/10 shadow-inner"
            style={{ backgroundColor: theme.primaryHex }}
          />
          <Palette className="w-3.5 h-3.5 text-stone-500" />
        </button>

        {isOpen && (
          <div className="absolute right-0 bottom-full mb-2 w-56 bg-white rounded-xl shadow-xl border border-stone-200 p-2 z-50 animate-fadeIn">
            <div className="px-2 py-1 text-[11px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-100 mb-1">
              {currentLang === "hi" ? "एमएसएमई रंग थीम चुनें" : "Select MSME Theme"}
            </div>
            <div className="space-y-1">
              {availableThemes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setThemeId(t.id as MsmeThemeId);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                    themeId === t.id
                      ? "bg-stone-100 text-stone-900 font-bold"
                      : "text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: t.primaryHex }}
                    />
                    <span>{currentLang === "hi" ? t.nameHi : t.nameEn}</span>
                  </div>
                  {themeId === t.id && <Check className="w-3.5 h-3.5 text-stone-900" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white border border-stone-200 hover:border-stone-300 text-xs font-semibold text-stone-800 transition shadow-xs"
      >
        <div className="flex items-center gap-2">
          <span
            className="w-3.5 h-3.5 rounded-full border border-black/15 shrink-0 shadow-inner"
            style={{ backgroundColor: theme.primaryHex }}
          />
          <span className="truncate">
            {currentLang === "hi" ? theme.nameHi : theme.nameEn}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-stone-200 p-2 z-50 animate-fadeIn">
          <div className="px-2 py-1 text-[10px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-100 mb-1.5 flex items-center gap-1.5">
            <Palette className="w-3 h-3 text-stone-600" />
            <span>{currentLang === "hi" ? "एमएसएमई रंग थीम" : "MSME Brand Theme"}</span>
          </div>

          <div className="space-y-1">
            {availableThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setThemeId(t.id as MsmeThemeId);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition ${
                  themeId === t.id
                    ? "bg-stone-100 text-stone-900 font-bold"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                    style={{ backgroundColor: t.primaryHex }}
                  />
                  <div className="text-left">
                    <p className="font-semibold text-xs leading-tight">
                      {currentLang === "hi" ? t.nameHi : t.nameEn}
                    </p>
                    <p className="text-[10px] text-stone-500 font-normal leading-tight">
                      {currentLang === "hi" ? t.descriptionHi : t.descriptionEn}
                    </p>
                  </div>
                </div>
                {themeId === t.id && <Check className="w-4 h-4 text-stone-900 shrink-0 ml-1" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
