import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  ArrowRight,
  Zap,
  TrendingUp,
  Layers,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { HealthCard } from "../components/HealthCard";

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();

  const rbdlStages = [
    {
      level: 0,
      title: t("assessment:level_0.name"),
      desc: t("assessment:level_0.desc"),
      color: "from-slate-700 to-slate-800",
      badgeColor: "bg-slate-700 text-slate-300",
      icon: FileSpreadsheet,
    },
    {
      level: 1,
      title: t("assessment:level_1.name"),
      desc: t("assessment:level_1.desc"),
      color: "from-blue-900/50 to-indigo-950/50 border-indigo-500/30",
      badgeColor: "bg-indigo-500/20 text-indigo-300",
      icon: Zap,
    },
    {
      level: 2,
      title: t("assessment:level_2.name"),
      desc: t("assessment:level_2.desc"),
      color: "from-emerald-950/50 to-teal-950/50 border-emerald-500/30",
      badgeColor: "bg-emerald-500/20 text-emerald-300",
      icon: TrendingUp,
    },
    {
      level: 3,
      title: t("assessment:level_3.name"),
      desc: t("assessment:level_3.desc"),
      color: "from-purple-950/50 to-indigo-950/50 border-purple-500/30",
      badgeColor: "bg-purple-500/20 text-purple-300",
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>{t("hero.badge")}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-heading tracking-tight leading-tight">
            {t("hero.title")}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <span>{t("hero.cta_start")}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#rbdl-framework"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 px-5 py-3.5 text-sm font-medium text-slate-200 border border-slate-700/80 transition-all"
            >
              <span>{t("hero.cta_explore")}</span>
            </a>
          </div>
        </div>
      </section>

      {/* Real-Time System Health Card */}
      <section>
        <HealthCard />
      </section>

      {/* RBDL Framework Stages Breakdown */}
      <section id="rbdl-framework" className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
              <Layers className="h-4 w-4" />
              <span>{t("assessment:title")}</span>
            </div>
            <h2 className="text-2xl font-bold text-white font-heading mt-1">
              RBDL Framework Architecture (Levels 0–3)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            {t("assessment:subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {rbdlStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.level}
                className={`rounded-2xl p-6 bg-gradient-to-b ${stage.color} border border-slate-800 shadow-lg flex flex-col justify-between glass-panel-hover`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${stage.badgeColor}`}>
                      Level {stage.level}
                    </span>
                    <Icon className="h-5 w-5 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-heading mb-2">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Verified Criteria
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
