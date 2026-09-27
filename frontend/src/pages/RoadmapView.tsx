import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers,
  History,
  Languages,
} from "lucide-react";
import { fetchBusinesses } from "../api/businesses";
import { Business } from "../types";
import {
  getActiveRoadmap,
  getRoadmapHistory,
  updateRoadmapTaskStatus,
  RoadmapTaskItem,
} from "../api/roadmap";

export const RoadmapView: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<number | "all">("all");
  const [lang, setLang] = useState<"en" | "hi">("en");

  // Fetch businesses
  const { data: businesses, isLoading: isLoadingBiz } = useQuery<Business[]>({
    queryKey: ["businesses"],
    queryFn: fetchBusinesses,
  });

  // Auto-select first business
  React.useEffect(() => {
    if (businesses && businesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(businesses[0].id);
    }
  }, [businesses, selectedBusinessId]);

  // Fetch active roadmap
  const {
    data: roadmap,
    isLoading: isLoadingRoadmap,
    error: roadmapError,
  } = useQuery({
    queryKey: ["activeRoadmap", selectedBusinessId],
    queryFn: () => getActiveRoadmap(selectedBusinessId!),
    enabled: !!selectedBusinessId,
    retry: 1,
  });

  // Fetch roadmap history

  const { data: historyData } = useQuery({
    queryKey: ["roadmapHistory", selectedBusinessId],
    queryFn: () => getRoadmapHistory(selectedBusinessId!),
    enabled: !!selectedBusinessId,
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
      queryClient.invalidateQueries({ queryKey: ["activeRoadmap", selectedBusinessId] });
      queryClient.invalidateQueries({ queryKey: ["roadmapHistory", selectedBusinessId] });
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
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
            <Compass className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-heading">
              {lang === "hi" ? "व्यक्तिगत डिजिटलीकरण रोडमैप" : "Personalized Transformation Roadmap"}
            </h1>
            <p className="text-sm text-slate-400">
              {lang === "hi"
                ? "क्लाउड C4 नियम-आधारित अनुशंसा और चरणबद्ध कार्य प्रणाली"
                : "Phased actionable digital milestones tailored to your MSME's RBDL assessment."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Languages className="h-4 w-4 text-indigo-400" />
            <span>{lang === "en" ? "हिन्दी (HI)" : "English (EN)"}</span>
          </button>

          {/* Business Selector */}
          {businesses && businesses.length > 0 && (
            <select
              value={selectedBusinessId || ""}
              onChange={(e) => setSelectedBusinessId(Number(e.target.value))}
              className="bg-slate-800 text-white text-sm rounded-xl px-3.5 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.city})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isLoadingBiz || isLoadingRoadmap ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 border-r-2 border-transparent"></div>
          <p className="mt-3 text-slate-400 text-sm">Loading roadmap and recommendations...</p>
        </div>
      ) : roadmapError || !roadmap ? (
        <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 text-center space-y-4 max-w-xl mx-auto">
          <AlertCircle className="h-12 w-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">No Active Roadmap Found</h2>
          <p className="text-sm text-slate-400">
            This business does not have a completed digital assessment yet. Complete an assessment to generate your custom transformation roadmap.
          </p>
          <a
            href="/assessment"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-colors text-sm"
          >
            <span>Start Digital Assessment</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      ) : (
        <>
          {/* Level & Milestone Progress Bar Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Level Card */}
            <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 p-6 rounded-3xl border border-indigo-500/20 shadow-lg space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                {lang === "hi" ? "वर्तमान आरबीडीएल स्तर" : "Current RBDL Level"}
              </span>
              <div className="text-xl font-bold text-white">
                {levelNames[roadmap.current_rbdl_level]?.[lang] || `Level ${roadmap.current_rbdl_level}`}
              </div>
              <p className="text-xs text-slate-400">
                {lang === "hi"
                  ? `लक्ष्य स्तर: ${roadmap.target_rbdl_level}`
                  : `Target Progression: Reaching Level ${roadmap.target_rbdl_level}`}
              </p>
            </div>

            {/* Target Progression Card */}
            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-6 rounded-3xl border border-emerald-500/20 shadow-lg space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {lang === "hi" ? "लक्ष्य अगले कदम" : "Target RBDL Level"}
              </span>
              <div className="text-xl font-bold text-white">
                {levelNames[roadmap.target_rbdl_level]?.[lang] || `Level ${roadmap.target_rbdl_level}`}
              </div>
              <p className="text-xs text-slate-400">
                {lang === "hi" ? "1-स्तर-ऊपर नियम के तहत तैयार" : "Governed strictly by One-Level-Above rule"}
              </p>
            </div>

            {/* Completion Progress Card */}
            <div className="bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 p-6 rounded-3xl border border-blue-500/20 shadow-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  {lang === "hi" ? "कार्य पूर्णता" : "Roadmap Progress"}
                </span>
                <span className="text-xs font-bold text-slate-200">
                  {roadmap.completed_tasks} / {roadmap.total_tasks}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${roadmap.total_tasks > 0 ? (roadmap.completed_tasks / roadmap.total_tasks) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>{lang === "hi" ? `संस्करण v${roadmap.version}` : `Version v${roadmap.version}`}</span>
                <span>
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
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
                selectedPhase === "all"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{lang === "hi" ? "सभी चरण" : "All Phases"} ({roadmap.total_tasks})</span>
            </button>

            <button
              onClick={() => setSelectedPhase(1)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
                selectedPhase === 1
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <span>
                {lang === "hi" ? "चरण 1: त्वरित परिणाम" : "Phase 1: Quick Wins"} (
                {roadmap.phase_1?.total_tasks || 0})
              </span>
            </button>

            <button
              onClick={() => setSelectedPhase(2)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
                selectedPhase === 2
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 text-blue-300" />
              <span>
                {lang === "hi" ? "चरण 2: मुख्य अगले कदम" : "Phase 2: Core Next Steps"} (
                {roadmap.phase_2?.total_tasks || 0})
              </span>
            </button>

            <button
              onClick={() => setSelectedPhase(3)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 ${
                selectedPhase === 3
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Compass className="h-3.5 w-3.5 text-purple-300" />
              <span>
                {lang === "hi" ? "चरण 3: दीर्घकालिक योजना" : "Phase 3: Longer Term"} (
                {roadmap.phase_3?.total_tasks || 0})
              </span>
            </button>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
                No tasks assigned to this phase.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  lang={lang}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>

          {/* Roadmap Version History */}
          {historyData && historyData.length > 1 && (
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <History className="h-4 w-4 text-indigo-400" />
                <span>{lang === "hi" ? "रोडमैप संस्करण इतिहास" : "Roadmap Version History"}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {historyData.map((h) => (
                  <div
                    key={h.id}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                      h.status === "active"
                        ? "bg-indigo-950/30 border-indigo-500/40 text-indigo-200"
                        : "bg-slate-800/40 border-slate-700/60 text-slate-400"
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span>Roadmap v{h.version}</span>
                      <span className="uppercase text-[10px]">{h.status}</span>
                    </div>
                    <div className="text-slate-400">
                      {h.completed_tasks} / {h.total_tasks} completed
                    </div>
                    <div className="text-[10px] text-slate-500">
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
    1: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
    2: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    3: "border-purple-500/30 bg-purple-500/5 text-purple-400",
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
      className={`p-5 rounded-2xl border transition-all duration-300 space-y-4 ${
        isCompleted
          ? "bg-slate-900/40 border-slate-800 opacity-80"
          : isSkipped
          ? "bg-slate-900/30 border-slate-800 opacity-60"
          : "bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {/* Status Checkbox / Action */}
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
            className={`mt-0.5 p-1 rounded-lg border transition-colors ${
              isCompleted
                ? "bg-emerald-500 text-white border-emerald-400"
                : isInProgress
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                : "bg-slate-800 text-slate-500 border-slate-700 hover:border-slate-600"
            }`}
          >
            <CheckCircle2 className="h-5 w-5" />
          </button>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-slate-500">#{task.sequence_order}</span>
              <h3
                className={`text-base font-semibold ${
                  isCompleted ? "line-through text-slate-400" : "text-white"
                }`}
              >
                {lang === "hi" ? task.title_hi : task.title_en}
              </h3>

              {/* Phase Badge */}
              <span
                className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-lg border ${
                  phaseColors[task.phase_number] || "border-slate-700 text-slate-400"
                }`}
              >
                {lang === "hi" ? task.phase_name_hi : task.phase_name_en}
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              {lang === "hi" ? task.description_hi : task.description_en}
            </p>
          </div>
        </div>

        {/* Status Dropdown / Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select
            value={task.status}
            onChange={(e) =>
              onStatusChange(
                task.id,
                e.target.value as "pending" | "in_progress" | "completed" | "skipped"
              )
            }
            className="bg-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
      </div>

      {/* Metadata Badges & Explainability Reason Banner */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
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
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-md border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
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
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-700/60 max-w-xl">
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
