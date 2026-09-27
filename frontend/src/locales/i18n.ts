import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./en/common.json";
import enAssessment from "./en/assessment.json";
import hiCommon from "./hi/common.json";
import hiAssessment from "./hi/assessment.json";

const resources = {
  en: {
    common: enCommon,
    assessment: enAssessment,
  },
  hi: {
    common: hiCommon,
    assessment: hiAssessment,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    defaultNS: "common",
    interpolation: {
      escapeValue: false, // React already safe from XSS
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
