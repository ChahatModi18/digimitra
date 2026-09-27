import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Compass,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers,
  History,
  Building2,
  Clock,
  RotateCcw,
} from "lucide-react";
import { fetchBusinesses } from "../api/businesses";
import { Business } from "../types";
import {
  getActiveRoadmap,
  getRoadmapHistory,
  updateRoadmapTaskStatus,
  RoadmapTaskItem,
} from "../api/roadmap";
import { useAuth } from "../context/AuthContext";
import { LoadingState, EmptyState } from "../components/UIState";

export const RoadmapView: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeBusinessId, setActiveBusinessId } = useAuth();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";

  const [selectedPhase, setSelectedPhase] = useState<number | "all">("all");

  // Fetch businesses
  const { data: businesses = [], isLoading: isLoadingBiz } = useQuery<Business[]>({
    queryKey: ["businesses"],
    queryFn: fetchBusinesses,
  });

  const effectiveBizId = activeBusinessId || (businesses.length > 0 ? businesses[0].id : null);

  // Fetch active roadmap
  const {
    data: roadmap,
    isLoading: isLoadingRoadmap,
    error: roadmapError,
  } = useQuery({
    queryKey: ["activeRoadmap", effectiveBizId],
    queryFn: () => getActiveRoadmap(effectiveBizId!),
    enabled: !!effectiveBizId,
    retry: 1,
  });

  // Fetch roadmap version history
  const { data: historyData = [] } = useQuery({
    queryKey: ["roadmapHistory", effectiveBizId],
    queryFn: () => getRoadmapHistory(effectiveBizId!),
    enabled: !!effectiveBizId,
    retry: 1,
  });

  // Mutation for updating task status
  const updateStatusMutation = useMutation({
    mutationFn: ({
      taskId,
      status,
    }: {
      taskId: number;
      status: "pending" | "in_progress" | "completed" | "skipped";
    }) => updateRoadmapTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeRoadmap", activeBusinessId] });
      queryClient.invalidateQueries({ queryKey: ["roadmapHistory", activeBusinessId] });
    },
  });

  const handleStatusChange = (
    taskId: number,
    newStatus: "pending" | "in_progress" | "completed" | "skipped"
  ) => {
    updateStatusMutation.mutate({ taskId, status: newStatus });
  };

  const filteredTasks = React.useMemo(() => {
    if (!roadmap) return [];
    if (selectedPhase === "all") return roadmap.all_tasks;
    return roadmap.all_tasks.filter((t) => t.phase_number === selectedPhase);
  }, [roadmap, selectedPhase]);

  const levelNames: Record<number, { en: string; hi: string }> = {
    0: { en: "Level 0: Foundational Readiness", hi: "स्तर 0: बुनियादी तैयारी" },
    1: { en: "Level 1: Basic Digital Presence", hi: "स्तर 1: बुनियादी डिजिटल उपस्थिति" },
    2: { en: "Level 2: Operational Digitalization", hi: "स्तर 2: परिचालन डिजिटलीकरण" },
    3: { en: "Level 3: Growth-Oriented Enterprise", hi: "स्तर 3: विकास-उन्मुख उद्यम" },
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 animate-fadeIn pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 shadow-inner">
            <Compass className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight">
              {currentLang === "hi" ? "व्यक्तिगत डिजिटलीकरण रोडमैप" : "Transformation Roadmap & Tasks"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {currentLang === "hi"
                ? "चरणबद्ध कार्य प्रणाली (त्वरित परिणाम, मुख्य कदम, दीर्घकालिक योजना)"
                : "Phased actionable milestones: Phase 1 (Quick Wins), Phase 2 (Core Steps), Phase 3 (Longer Term)."}
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

      {isLoadingBiz || isLoadingRoadmap ? (
        <LoadingState message="Loading transformation roadmap..." />
      ) : roadmapError || !roadmap ? (
        <EmptyState
          title="No Active Roadmap Found"
          description="This enterprise does not have a completed digital assessment yet. Complete an assessment to generate your personalized action roadmap."
          actionLabel="Start Digital Assessment →"
          onAction={() => navigate("/assessment")}
          icon={AlertCircle}
        />
      ) : (
        <>
          {/* Level Progression & Completion Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Current Level Card */}
            <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 p-6 rounded-3xl border border-indigo-500/20 shadow-lg space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                {currentLang === "hi" ? "वर्तमान आरबीडीएल स्तर" : "Current RBDL Level"}
              </span>
              <div className="text-xl font-bold text-white">
                {levelNames[roadmap.current_rbdl_level]?.[currentLang] || `Level ${roadmap.current_rbdl_level}`}
              </div>
              <p className="text-xs text-slate-400">
                {currentLang === "hi"
                  ? `लक्ष्य स्तर: ${roadmap.target_rbdl_level}`
                  : `Target Progression: Reaching Level ${roadmap.target_rbdl_level}`}
              </p>
            </div>

            {/* Target Level Progression Card */}
            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-6 rounded-3xl border border-emerald-500/20 shadow-lg space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                {currentLang === "hi" ? "लक्ष्य अगले कदम" : "Target RBDL Level"}
              </span>
              <div className="text-xl font-bold text-white">
                {levelNames[roadmap.target_rbdl_level]?.[currentLang] || `Level ${roadmap.target_rbdl_level}`}
              </div>
              <p className="text-xs text-slate-400">
                {currentLang === "hi" ? "1-स्तर-ऊपर नियम के तहत संचालित" : "Governed strictly by One-Level-Above rule"}
              </p>
            </div>

            {/* Completion Progress Card */}
            <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 p-6 rounded-3xl border border-blue-500/20 shadow-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                  {currentLang === "hi" ? "कार्य पूर्णता प्रगति" : "Roadmap Progress"}
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {roadmap.completed_tasks} / {roadmap.total_tasks}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-teal-400 to-indigo-500 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${roadmap.total_tasks > 0 ? (roadmap.completed_tasks / roadmap.total_tasks) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>{currentLang === "hi" ? `रोडमैप संस्करण v${roadmap.version}` : `Roadmap Version v${roadmap.version}`}</span>
                <span className="font-semibold text-teal-400">
                  {roadmap.total_tasks > 0
                    ? `${Math.round((roadmap.completed_tasks / roadmap.total_tasks) * 100)}% Complete`
                    : "0%"}
                </span>
              </div>
            </div>
          </div>

          {/* Phase Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
            <button
              onClick={() => setSelectedPhase("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 ${
                selectedPhase === "all"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{currentLang === "hi" ? "सभी चरण" : "All Phases"} ({roadmap.total_tasks})</span>
            </button>

            <button
              onClick={() => setSelectedPhase(1)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 ${
                selectedPhase === 1
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <span>
                {currentLang === "hi" ? "चरण 1: त्वरित परिणाम" : "Phase 1: Quick Wins"} (
                {roadmap.phase_1?.total_tasks || 0})
              </span>
            </button>

            <button
              onClick={() => setSelectedPhase(2)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 ${
                selectedPhase === 2
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 text-blue-300" />
              <span>
                {currentLang === "hi" ? "चरण 2: मुख्य अगले कदम" : "Phase 2: Core Next Steps"} (
                {roadmap.phase_2?.total_tasks || 0})
              </span>
            </button>

            <button
              onClick={() => setSelectedPhase(3)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 ${
                selectedPhase === 3
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Compass className="h-3.5 w-3.5 text-purple-300" />
              <span>
                {currentLang === "hi" ? "चरण 3: दीर्घकालिक योजना" : "Phase 3: Longer Term"} (
                {roadmap.phase_3?.total_tasks || 0})
              </span>
            </button>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
                No tasks assigned to this phase.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  lang={currentLang}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>

          {/* Roadmap Version History */}
          {historyData.length > 0 && (
            <div className="bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <History className="h-4 w-4 text-indigo-400" />
                  <span>{currentLang === "hi" ? "रोडमैप संस्करण इतिहास" : "Roadmap Version History"}</span>
                </div>

                <button
                  onClick={() => navigate("/assessment")}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{currentLang === "hi" ? "पुनर्मूल्यांकन शुरू करें" : "Start Reassessment"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {historyData.map((h) => (
                  <div
                    key={h.id}
                    className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                      h.status === "active"
                        ? "bg-indigo-950/40 border-indigo-500/40 text-indigo-200"
                        : "bg-slate-950/60 border-slate-800 text-slate-400"
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-white">Roadmap v{h.version}</span>
                      <span
                        className={`uppercase text-[10px] px-2 py-0.5 rounded ${
                          h.status === "active"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {h.status}
                      </span>
                    </div>
                    <div className="text-slate-300">
                      {h.completed_tasks} of {h.total_tasks} milestones completed
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(h.generated_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface TaskCardProps {
  task: RoadmapTaskItem;
  lang: "en" | "hi";
  onStatusChange: (
    taskId: number,
    newStatus: "pending" | "in_progress" | "completed" | "skipped"
  ) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, lang, onStatusChange }) => {
  const isCompleted = task.status === "completed";
  const isInProgress = task.status === "in_progress";
  const isSkipped = task.status === "skipped";

  const phaseColors: Record<number, string> = {
    1: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    2: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    3: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  };

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

  return (
    <div
      className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 space-y-4 ${
        isCompleted
          ? "bg-slate-900/40 border-slate-800 opacity-80"
          : isSkipped
          ? "bg-slate-900/30 border-slate-800 opacity-60"
          : "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {/* Status Checkbox / Quick Toggle */}
          <button
            onClick={() => {
              if (isCompleted) {
                onStatusChange(task.id, "pending");
              } else if (isInProgress) {
                onStatusChange(task.id, "completed");
              } else {
                onStatusChange(task.id, "in_progress");
              }
            }}
            className={`mt-0.5 p-1.5 rounded-xl border transition-colors shrink-0 ${
              isCompleted
                ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20"
                : isInProgress
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                : "bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-600"
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
          </button>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-500 font-bold">#{task.sequence_order}</span>
              <h3
                className={`text-base font-bold ${
                  isCompleted ? "line-through text-slate-400" : "text-white"
                }`}
              >
                {lang === "hi" ? task.title_hi : task.title_en}
              </h3>

              {/* Phase Badge */}
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-lg border ${
                  phaseColors[task.phase_number] || "border-slate-700 text-slate-400"
                }`}
              >
                {lang === "hi" ? task.phase_name_hi : task.phase_name_en}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {lang === "hi" ? task.description_hi : task.description_en}
            </p>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select
            value={task.status}
            onChange={(e) =>
              onStatusChange(
                task.id,
                e.target.value as "pending" | "in_progress" | "completed" | "skipped"
              )
            }
            className={`text-xs font-semibold rounded-xl px-3 py-1.5 border focus:outline-none ${
              isCompleted
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : isInProgress
                ? "bg-amber-950/60 border-amber-500/40 text-amber-300"
                : isSkipped
                ? "bg-slate-800 border-slate-700 text-slate-400"
                : "bg-slate-800 border-slate-700 text-slate-200"
            }`}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed ✓</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
      </div>

      {/* Metadata Badges & Explainability Reason */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {task.estimated_cost_level && (
            <span
              className={`px-2 py-0.5 text-[10px] font-medium rounded-md border ${
                costBadges[task.estimated_cost_level.toLowerCase()] || "border-slate-700 text-slate-400"
              }`}
            >
              Cost: {task.estimated_cost_level.toUpperCase()}
            </span>
          )}

          {task.estimated_effort_level && (
            <span
              className={`px-2 py-0.5 text-[10px] font-medium rounded-md border ${
                effortBadges[task.estimated_effort_level.toLowerCase()] || "border-slate-700 text-slate-400"
              }`}
            >
              Effort: {task.estimated_effort_level.toUpperCase()}
            </span>
          )}

          {task.impact_level && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-md border bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
              Impact: {task.impact_level.toUpperCase()}
            </span>
          )}

          {task.priority_score && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md border bg-slate-800 text-slate-300 border-slate-700">
              Score: {task.priority_score.toFixed(1)}
            </span>
          )}
        </div>

        {/* Explainability Reason */}
        {(task.reason_en || task.reason_hi) && (
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 max-w-xl">
            <HelpCircle className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">
              {lang === "hi" ? task.reason_hi : task.reason_en}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
