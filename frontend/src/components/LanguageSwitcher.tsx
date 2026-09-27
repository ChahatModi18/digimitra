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
    <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1 border border-stone-200/80 text-xs">
      <Globe className="h-3.5 w-3.5 text-stone-500 ml-1.5 mr-0.5" />
      <button
        type="button"
        onClick={() => toggleLanguage("en")}
        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
          currentLang === "en"
            ? "bg-white text-orange-600 shadow-xs border border-stone-200/60 font-bold"
            : "text-stone-600 hover:text-stone-900"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => toggleLanguage("hi")}
        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
          currentLang === "hi"
            ? "bg-white text-orange-600 shadow-xs border border-stone-200/60 font-bold"
            : "text-stone-600 hover:text-stone-900"
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
};
