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
    <div className="rounded-2xl bg-white p-6 shadow-card border border-stone-200 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 shadow-xs">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 font-heading">
              {t("system_status.title")}
            </h3>
            <p className="text-xs text-stone-500">Real-time backend & database diagnostics</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {health && <StatusBadge status={health.status} />}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-700 transition-all border border-stone-300 disabled:opacity-50"
            title="Refresh System Health"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-orange-600" : ""}`} />
            <span className="hidden sm:inline">{t("actions.refresh")}</span>
          </button>
        </div>
      </div>

      {/* Body content */}
      <div className="mt-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-orange-600" />
            <span className="ml-3 text-sm text-stone-500 font-medium">Connecting to DigiMitra API...</span>
          </div>
        ) : isError ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm">
            <p className="font-bold">Backend Unreachable</p>
            <p className="text-xs text-rose-700 mt-1">
              {error instanceof Error ? error.message : "Make sure the FastAPI backend is running on http://localhost:8000"}
            </p>
          </div>
        ) : health ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Database Metric */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
              <Database className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-stone-500 block uppercase tracking-wider">
                  {t("system_status.database")}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-stone-900">
                    {health.components.database?.status || "Unknown"}
                  </span>
                  {health.components.database?.details?.latency_ms !== undefined && (
                    <span className="text-xs text-emerald-700 font-mono font-bold">
                      {health.components.database.details.latency_ms} ms
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  Dialect: {health.components.database?.details?.dialect || "SQL"}
                </span>
              </div>
            </div>

            {/* API Uptime */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
              <Clock className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-stone-500 block uppercase tracking-wider">
                  {t("system_status.uptime")}
                </span>
                <span className="text-sm font-bold text-stone-900 mt-1 block">
                  {Math.floor(health.uptime_seconds)} seconds
                </span>
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  Env: <span className="text-stone-800 font-semibold">{health.environment}</span>
                </span>
              </div>
            </div>

            {/* Architecture Engine */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
              <Layers className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-stone-500 block uppercase tracking-wider">
                  Classification Strategy
                </span>
                <span className="text-sm font-bold text-stone-900 mt-1 block">
                  {health.components.classification_engine?.details?.strategy || "Rule-Based"}
                </span>
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  i18n: EN / HI Active
                </span>
              </div>
            </div>

            {/* Runtime Info */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-start gap-3">
              <Cpu className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-stone-500 block uppercase tracking-wider">
                  Runtime Stack
                </span>
                <span className="text-sm font-bold text-stone-900 mt-1 block">
                  Python {health.system_info.python_version}
                </span>
                <span className="text-[11px] text-stone-500 block mt-0.5">
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
