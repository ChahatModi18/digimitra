import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  Building2,
} from "lucide-react";
import { fetchBusinesses } from "../api/businesses";
import { getBusinessRecommendations, BusinessRecommendationItem } from "../api/roadmap";
import { Business } from "../types";
import { useAuth } from "../context/AuthContext";
import { LoadingState, EmptyState } from "../components/UIState";

export const RecommendationsView: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { activeBusinessId, setActiveBusinessId } = useAuth();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";

  const [selectedDimension, setSelectedDimension] = useState<string>("all");

  // Fetch businesses
  const { data: businesses = [], isLoading: isLoadingBiz } = useQuery<Business[]>({
    queryKey: ["businesses"],
    queryFn: fetchBusinesses,
  });

  const effectiveBizId = activeBusinessId || (businesses.length > 0 ? businesses[0].id : null);

  // Fetch recommendations
  const {
    data: recData,
    isLoading: isLoadingRecs,
    error: recError,
  } = useQuery({
    queryKey: ["businessRecommendations", effectiveBizId],
    queryFn: () => getBusinessRecommendations(effectiveBizId!),
    enabled: !!effectiveBizId,
  });

  const recommendations: BusinessRecommendationItem[] = recData?.recommendations || [];

  const filteredRecs = React.useMemo(() => {
    if (selectedDimension === "all") return recommendations;
    return recommendations.filter((r) => r.dimension_code === selectedDimension);
  }, [recommendations, selectedDimension]);

  const effortBadges: Record<string, string> = {
    low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    high: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  const costBadges: Record<string, string> = {
    low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    high: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  const impactBadges: Record<string, string> = {
    low: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    medium: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    high: "bg-purple-500/10 text-purple-300 border-purple-500/20 font-bold",
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight">
              {currentLang === "hi" ? "व्यक्तिगत डिजिटल अनुशंसाएं" : "Personalized Recommendations"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {currentLang === "hi"
                ? "प्राथमिकता स्कोर और 1-स्तर-ऊपर नियम द्वारा अनुशंसित डिजिटल कार्य"
                : "Deterministic priority ranking (Impact, Feasibility, Cost, Readiness) tailored to your MSME."}
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

      {isLoadingBiz || isLoadingRecs ? (
        <LoadingState message="Loading your tailored recommendations..." />
      ) : recError || !recData || recommendations.length === 0 ? (
        <EmptyState
          title="No Recommendations Available"
          description="Complete a digital assessment for this enterprise to generate customized, prioritized digital transformation recommendations."
          actionLabel="Start Digital Assessment →"
          onAction={() => navigate("/assessment")}
          icon={AlertCircle}
        />
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Current RBDL Level
              </span>
              <div className="text-xl font-extrabold text-white">
                Level {recData.current_rbdl_level}
              </div>
              <p className="text-[11px] text-indigo-400">
                Targeting Level {recData.target_rbdl_level} Readiness
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Recommended Actions
              </span>
              <div className="text-xl font-extrabold text-teal-400">
                {recommendations.length} Tailored Milestones
              </div>
              <p className="text-[11px] text-slate-400">Excludes satisfied & out-of-scope items</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1 flex flex-col justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Transformation Roadmap
              </span>
              <Link
                to="/roadmap"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
              >
                <span>View Phased Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Dimension Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
            <button
              onClick={() => setSelectedDimension("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                selectedDimension === "all"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All Dimensions ({recommendations.length})
            </button>

            {Array.from(new Set(recommendations.map((r) => r.dimension_code).filter(Boolean))).map(
              (dim) => (
                <button
                  key={dim}
                  onClick={() => setSelectedDimension(dim!)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 capitalize ${
                    selectedDimension === dim
                      ? "bg-teal-600 text-white shadow-md"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {dim?.replace("_", " ")}
                </button>
              )
            )}
          </div>

          {/* Recommendations Cards List */}
          <div className="space-y-4">
            {filteredRecs.map((rec, idx) => (
              <div
                key={rec.id}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 shadow-xl transition-all duration-300 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                        Rank #{rec.rank_order || idx + 1}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{rec.recommendation_code}</span>
                      <span className="px-2 py-0.5 text-[11px] rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                        Target Level {rec.target_rbdl_level}
                      </span>
                      {rec.category && (
                        <span className="px-2 py-0.5 text-[11px] rounded-md bg-teal-950/60 text-teal-300 border border-teal-500/30">
                          {rec.category}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white font-heading">
                      {currentLang === "hi" ? rec.title_hi : rec.title_en}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                      {currentLang === "hi" ? rec.description_hi : rec.description_en}
                    </p>
                  </div>

                  {/* Priority Score Gauge Badge */}
                  {rec.priority_score !== undefined && (
                    <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center shrink-0 min-w-[90px]">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 block tracking-wider">
                        Priority Score
                      </span>
                      <span className="text-xl font-extrabold text-white">
                        {rec.priority_score.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Badges & Explainability Reason */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {rec.impact_level && (
                      <span
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border ${
                          impactBadges[rec.impact_level.toLowerCase()] || "border-slate-700"
                        }`}
                      >
                        Impact: {rec.impact_level.toUpperCase()}
                      </span>
                    )}

                    {rec.estimated_effort_level && (
                      <span
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border ${
                          effortBadges[rec.estimated_effort_level.toLowerCase()] || "border-slate-700"
                        }`}
                      >
                        Effort: {rec.estimated_effort_level.toUpperCase()}
                      </span>
                    )}

                    {rec.estimated_cost_level && (
                      <span
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border ${
                          costBadges[rec.estimated_cost_level.toLowerCase()] || "border-slate-700"
                        }`}
                      >
                        Cost: {rec.estimated_cost_level.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {(rec.reason_en || rec.reason_hi) && (
                    <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 max-w-xl">
                      <HelpCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                      <span className="leading-snug">
                        {currentLang === "hi" ? rec.reason_hi : rec.reason_en}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
