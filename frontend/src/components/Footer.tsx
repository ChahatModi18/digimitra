import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Sparkles, Heart, FileCode } from "lucide-react";

export const Footer: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";

  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 py-10 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-heading text-lg font-bold text-white tracking-tight">
                DigiMitra
              </span>
              <span className="text-[10px] uppercase font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full">
                Phase A4 Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              {currentLang === "hi"
                ? "भारतीय सूक्ष्म, लघु और मध्यम उद्यमों के लिए पारदर्शी, नियम-आधारित डिजिटल सलाहकार ढांचा।"
                : "Deterministic, rule-based digitalization framework empowering Indian local businesses with customized, phased roadmaps."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
            <Link to="/" className="text-slate-400 hover:text-white transition">
              {t("navigation.dashboard")}
            </Link>
            <Link to="/businesses" className="text-slate-400 hover:text-white transition">
              {t("navigation.businesses")}
            </Link>
            <Link to="/assessment" className="text-slate-400 hover:text-white transition">
              {t("navigation.assessment")}
            </Link>
            <Link to="/recommendations" className="text-slate-400 hover:text-white transition">
              {t("navigation.recommendations")}
            </Link>
            <Link to="/roadmap" className="text-slate-400 hover:text-white transition">
              {t("navigation.roadmap")}
            </Link>
            <Link to="/history" className="text-slate-400 hover:text-white transition">
              {t("navigation.history")}
            </Link>
            <a
              href="http://localhost:8000/api/v1/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition"
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Swagger API Docs</span>
            </a>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} DigiMitra MSME Digital Consultant. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> for Indian Local Enterprises
          </p>
        </div>
      </div>
    </footer>
  );
};
