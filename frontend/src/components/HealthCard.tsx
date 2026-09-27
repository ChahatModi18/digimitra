import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Activity, Database, Clock, RefreshCw, Cpu, Layers } from "lucide-react";
import { fetchHealth } from "../api/health";
import { StatusBadge } from "./StatusBadge";

export const HealthCard: React.FC = () => {
  const { t } = useTranslation();

  const {
    data: health,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["healthCheck"],
    queryFn: fetchHealth,
    refetchInterval: 30000,
    retry: 1,
  });

  return (
    <div className="rounded-2xl glass-panel p-6 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white font-heading">
              {t("system_status.title")}
            </h3>
            <p className="text-xs text-slate-400">Real-time backend & database diagnostics</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {health && <StatusBadge status={health.status} />}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-all border border-slate-700 disabled:opacity-50"
            title="Refresh System Health"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-indigo-400" : ""}`} />
            <span className="hidden sm:inline">{t("actions.refresh")}</span>
          </button>
        </div>
      </div>

      {/* Body content */}
      <div className="mt-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
            <span className="ml-3 text-sm text-slate-400">Connecting to DigiMitra API...</span>
          </div>
        ) : isError ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            <p className="font-semibold">Backend Unreachable</p>
            <p className="text-xs text-rose-400 mt-1">
              {error instanceof Error ? error.message : "Make sure the FastAPI backend is running on http://localhost:8000"}
            </p>
          </div>
        ) : health ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Database Metric */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <Database className="h-5 w-5 text-indigo-400 mt-0.5" />
              <div>
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                  {t("system_status.database")}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-white">
                    {health.components.database?.status || "Unknown"}
                  </span>
                  {health.components.database?.details?.latency_ms !== undefined && (
                    <span className="text-xs text-emerald-400 font-mono">
                      {health.components.database.details.latency_ms} ms
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Dialect: {health.components.database?.details?.dialect || "SQL"}
                </span>
              </div>
            </div>

            {/* API Uptime */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <Clock className="h-5 w-5 text-emerald-400 mt-0.5" />
              <div>
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                  {t("system_status.uptime")}
                </span>
                <span className="text-sm font-semibold text-white mt-1 block">
                  {Math.floor(health.uptime_seconds)} seconds
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Env: <span className="text-indigo-300">{health.environment}</span>
                </span>
              </div>
            </div>

            {/* Architecture Engine */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <Layers className="h-5 w-5 text-amber-400 mt-0.5" />
              <div>
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                  Classification Strategy
                </span>
                <span className="text-sm font-semibold text-white mt-1 block">
                  {health.components.classification_engine?.details?.strategy || "Rule-Based"}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  i18n: EN / HI Active
                </span>
              </div>
            </div>

            {/* Runtime Info */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
              <Cpu className="h-5 w-5 text-sky-400 mt-0.5" />
              <div>
                <span className="text-[11px] font-medium text-slate-400 block uppercase tracking-wider">
                  Runtime Stack
                </span>
                <span className="text-sm font-semibold text-white mt-1 block">
                  Python {health.system_info.python_version}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {health.system_info.framework} v{health.version}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
