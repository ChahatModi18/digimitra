import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  History as HistoryIcon,
  TrendingUp,
  Calendar,
  Building2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { fetchBusinesses } from "../api/businesses";
import { getRoadmapHistory, RoadmapHistoryItem } from "../api/roadmap";
import { useAuth } from "../context/AuthContext";
import { LoadingState, EmptyState } from "../components/UIState";

export const HistoryView: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { activeBusinessId, setActiveBusinessId } = useAuth();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";

  // Fetch businesses
  const { data: businesses = [], isLoading: isLoadingBiz } = useQuery({
    queryKey: ["businesses"],
    queryFn: fetchBusinesses,
  });

  const effectiveBizId = activeBusinessId || (businesses.length > 0 ? businesses[0].id : null);

  // Fetch roadmap version history
  const {
    data: history = [],
    isLoading: isLoadingHistory,
    error,
  } = useQuery<RoadmapHistoryItem[]>({
    queryKey: ["roadmapHistory", effectiveBizId],
    queryFn: () => getRoadmapHistory(effectiveBizId!),
    enabled: !!effectiveBizId,
  });

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
            <HistoryIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight">
              {currentLang === "hi" ? "मूल्यांकन एवं रोडमैप इतिहास" : "Assessment & Roadmap History"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {currentLang === "hi"
                ? "अपने उद्यम की डिजिटल परिपक्वता प्रगति और रोडमैप संस्करणों का ऑडिट ट्रेल"
                : "Audit trail of your enterprise's digital progression and versioned roadmap evolutions."}
            </p>
          </div>
        </div>

        {/* Business Selector */}
        {businesses.length > 0 && (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <select
              value={activeBusinessId || ""}
              onChange={(e) => setActiveBusinessId(Number(e.target.value))}
              className="bg-slate-800 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoadingBiz || isLoadingHistory ? (
        <LoadingState message="Loading historical records..." />
      ) : error || history.length === 0 ? (
        <EmptyState
          title="No Assessment History Found"
          description="This business does not have any historical assessments or roadmaps yet. Take your first digital health check."
          actionLabel="Start Free Assessment →"
          onAction={() => navigate("/assessment")}
          icon={HistoryIcon}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <span>Digital Transformation Timeline ({history.length} Generations)</span>
            </h2>

            <button
              onClick={() => navigate("/assessment")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{currentLang === "hi" ? "नया पुनर्मूल्यांकन शुरू करें" : "Retake Assessment"}</span>
            </button>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
            {history.map((item) => {
              const isActive = item.status === "active";
              const percent =
                item.total_tasks > 0
                  ? Math.round((item.completed_tasks / item.total_tasks) * 100)
                  : 0;

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[27px] sm:-left-[35px] top-4 w-4 h-4 rounded-full border-2 transition-transform group-hover:scale-125 ${
                      isActive
                        ? "bg-teal-500 border-teal-300 shadow-lg shadow-teal-500/50"
                        : "bg-slate-800 border-slate-600"
                    }`}
                  />

                  <div
                    className={`p-6 rounded-3xl border transition-all duration-300 space-y-4 ${
                      isActive
                        ? "bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/40 shadow-xl"
                        : "bg-slate-900/60 border-slate-800"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-white">
                          Roadmap Version v{item.version}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                            isActive
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                              : "bg-slate-800 border-slate-700 text-slate-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Generated on {new Date(item.generated_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-500 block">Total Milestones</span>
                        <span className="font-bold text-white text-base mt-0.5 block">
                          {item.total_tasks} Tasks
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <span className="text-slate-500 block">Completed Milestones</span>
                        <span className="font-bold text-emerald-400 text-base mt-0.5 block">
                          {item.completed_tasks} Tasks ({percent}%)
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-slate-500 block">Status</span>
                          <span className="font-bold text-slate-200 capitalize mt-0.5 block">
                            {item.status}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate("/roadmap")}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow transition flex items-center gap-1"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
