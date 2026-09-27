import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const currentLang = i18n.language.startsWith("hi") ? "hi" : "en";

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex items-center gap-1 rounded-lg bg-slate-800/80 p-1 border border-slate-700/60 text-xs">
      <Globe className="h-3.5 w-3.5 text-slate-400 ml-1.5 mr-0.5" />
      <button
        type="button"
        onClick={() => toggleLanguage("en")}
        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
          currentLang === "en"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => toggleLanguage("hi")}
        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
          currentLang === "hi"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
};
