import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Compass,
  TrendingUp,
  Sparkles,
  History,
  Building2,
  Clock,
  RotateCcw,
  CheckSquare,
  Clock3,
  ListTodo,
  CircleSlash,
  ArrowRight,
} from "lucide-react";
import { fetchBusinesses } from "../api/businesses";
import { Business, ProgressSummary } from "../types";
import {
  getActiveRoadmap,
  getProgressSummary,
  getRoadmapHistory,
  updateRoadmapTaskStatus,
} from "../api/roadmap";
import { useAuth } from "../context/AuthContext";
import {
  PageHeader,
  StatCard,
  Card,
  TaskCard,
  Badge,
  Button,
  Tabs,
  EmptyState,
  LoadingState,
  Section,
  ProgressBar,
} from "../components";

export const RoadmapView: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeBusinessId, setActiveBusinessId } = useAuth();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";

  const [selectedPhase, setSelectedPhase] = useState<string>("all");

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

  // Fetch progress summary
  const { data: progressSummary } = useQuery<ProgressSummary>({
    queryKey: ["roadmapProgress", effectiveBizId],
    queryFn: () => getProgressSummary(effectiveBizId!),
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
      skipReason,
    }: {
      taskId: number;
      status: "pending" | "in_progress" | "completed" | "skipped";
      skipReason?: string;
    }) => updateRoadmapTaskStatus(taskId, status, skipReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeRoadmap", effectiveBizId] });
      queryClient.invalidateQueries({ queryKey: ["roadmapProgress", effectiveBizId] });
      queryClient.invalidateQueries({ queryKey: ["roadmapHistory", effectiveBizId] });
    },
  });

  const handleStatusChange = (
    taskId: number,
    newStatus: "pending" | "in_progress" | "completed" | "skipped",
    skipReason?: string
  ) => {
    updateStatusMutation.mutate({ taskId, status: newStatus, skipReason });
  };

  const filteredTasks = React.useMemo(() => {
    if (!roadmap) return [];
    if (selectedPhase === "all") return roadmap.all_tasks;
    const phaseNum = Number(selectedPhase);
    return roadmap.all_tasks.filter((t) => t.phase_number === phaseNum);
  }, [roadmap, selectedPhase]);

  const levelNames: Record<number, { en: string; hi: string }> = {
    0: { en: "Level 0: Foundational Readiness", hi: "स्तर 0: बुनियादी तैयारी" },
    1: { en: "Level 1: Basic Digital Presence", hi: "स्तर 1: बुनियादी डिजिटल उपस्थिति" },
    2: { en: "Level 2: Operational Digitalization", hi: "स्तर 2: परिचालन डिजिटलीकरण" },
    3: { en: "Level 3: Growth-Oriented Enterprise", hi: "स्तर 3: विकास-उन्मुख उद्यम" },
  };

  const phaseTabs = roadmap
    ? [
        {
          id: "all",
          label: currentLang === "hi" ? "सभी चरण (All)" : "All Phases",
          count: roadmap.total_tasks,
        },
        {
          id: "1",
          label: currentLang === "hi" ? "चरण 1: त्वरित परिणाम" : "Phase 1: Quick Wins",
          count: roadmap.phase_1?.total_tasks || 0,
        },
        {
          id: "2",
          label: currentLang === "hi" ? "चरण 2: मुख्य अगले कदम" : "Phase 2: Core Next Steps",
          count: roadmap.phase_2?.total_tasks || 0,
        },
        {
          id: "3",
          label: currentLang === "hi" ? "चरण 3: दीर्घकालिक योजना" : "Phase 3: Longer Term",
          count: roadmap.phase_3?.total_tasks || 0,
        },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 animate-fadeIn pb-16">
      {/* 1. Standard Page Header */}
      <PageHeader
        icon={<Compass className="w-8 h-8" />}
        badge={<Badge variant="brand" size="sm">Phase Progression</Badge>}
        title={
          currentLang === "hi"
            ? "व्यक्तिगत डिजिटलीकरण रोडमैप"
            : "Transformation Roadmap & Progress"
        }
        subtitle={
          currentLang === "hi"
            ? "चरणबद्ध कार्य प्रणाली, प्रगति ट्रैकिंग, ऑडिट लॉग और पुनर्मूल्यांकन।"
            : "Phased actionable milestones, status tracking, completion logs, and reassessment."
        }
        actions={
          businesses.length > 0 && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <select
                value={activeBusinessId || ""}
                onChange={(e) => setActiveBusinessId(Number(e.target.value))}
                className="bg-slate-900 text-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.city})
                  </option>
                ))}
              </select>
            </div>
          )
        }
      />

      {isLoadingBiz || isLoadingRoadmap ? (
        <LoadingState
          title="Loading transformation roadmap..."
          description="Fetching your phased milestones and task logs"
        />
      ) : roadmapError || !roadmap ? (
        <EmptyState
          icon={<Compass className="w-8 h-8" />}
          title="No Active Roadmap Found"
          description="This enterprise does not have a completed digital assessment yet. Complete an assessment to generate your personalized action roadmap."
          actionLabel="Start Digital Assessment →"
          onAction={() => navigate("/assessment")}
        />
      ) : (
        <>
          {/* 2. Progress Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <StatCard
              label={currentLang === "hi" ? "कुल कार्य" : "Total Tasks"}
              value={progressSummary?.total_tasks ?? roadmap.total_tasks}
              icon={<ListTodo className="w-4 h-4 text-indigo-400" />}
              variant="brand"
            />

            <StatCard
              label={currentLang === "hi" ? "पूर्ण कार्य" : "Completed"}
              value={progressSummary?.completed_tasks ?? roadmap.completed_tasks}
              icon={<CheckSquare className="w-4 h-4 text-emerald-400" />}
              variant="emerald"
            />

            <StatCard
              label={currentLang === "hi" ? "प्रगति में" : "In Progress"}
              value={progressSummary?.in_progress_tasks ?? 0}
              icon={<Clock3 className="w-4 h-4 text-amber-400" />}
              variant="amber"
            />

            <StatCard
              label={currentLang === "hi" ? "लंबित कार्य" : "Not Started"}
              value={progressSummary?.pending_tasks ?? 0}
              icon={<Clock className="w-4 h-4 text-slate-400" />}
              variant="slate"
            />

            <StatCard
              label={currentLang === "hi" ? "छोड़ा गया" : "Skipped"}
              value={progressSummary?.skipped_tasks ?? 0}
              icon={<CircleSlash className="w-4 h-4 text-slate-500" />}
              variant="slate"
            />

            <StatCard
              label={currentLang === "hi" ? "प्रगति दर" : "Completion"}
              value={`${
                progressSummary?.completion_percentage ??
                (roadmap.total_tasks > 0
                  ? Math.round((roadmap.completed_tasks / roadmap.total_tasks) * 100)
                  : 0)
              }%`}
              icon={<TrendingUp className="w-4 h-4 text-teal-400" />}
              variant="emerald"
            />
          </div>

          {/* 3. Level Progression Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Current Level Card */}
            <Card variant="gradient-indigo" className="p-6 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                {currentLang === "hi" ? "वर्तमान आरबीडीएल स्तर" : "Current RBDL Level"}
              </span>
              <div className="text-xl font-bold text-white">
                {levelNames[roadmap.current_rbdl_level]?.[currentLang] ||
                  `Level ${roadmap.current_rbdl_level}`}
              </div>
              <p className="text-xs text-slate-400">
                {currentLang === "hi"
                  ? `सक्रिय रोडमैप संस्करण v${roadmap.version}`
                  : `Active Roadmap Version v${roadmap.version}`}
              </p>
            </Card>

            {/* Target Level Progression Card */}
            <Card variant="gradient-emerald" className="p-6 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                {currentLang === "hi" ? "लक्ष्य अगले कदम" : "Target RBDL Level"}
              </span>
              <div className="text-xl font-bold text-white">
                {levelNames[roadmap.target_rbdl_level]?.[currentLang] ||
                  `Level ${roadmap.target_rbdl_level}`}
              </div>
              <p className="text-xs text-slate-400">
                {currentLang === "hi"
                  ? "1-स्तर-ऊपर नियम के तहत संचालित"
                  : "Governed strictly by One-Level-Above rule"}
              </p>
            </Card>

            {/* Completion Progress Gauge Card */}
            <Card variant="default" className="p-6 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold uppercase tracking-wider text-slate-400">
                  {currentLang === "hi" ? "कार्य पूर्णता प्रगति" : "Roadmap Progress"}
                </span>
                <span className="font-bold text-white">
                  {roadmap.completed_tasks} / {roadmap.total_tasks} Done
                </span>
              </div>
              <ProgressBar
                value={roadmap.completed_tasks}
                max={roadmap.total_tasks || 1}
                variant="gradient"
                size="md"
              />
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Version v{roadmap.version}</span>
                <span className="font-semibold text-teal-400">
                  {roadmap.total_tasks > 0
                    ? `${Math.round((roadmap.completed_tasks / roadmap.total_tasks) * 100)}% Complete`
                    : "0%"}
                </span>
              </div>
            </Card>
          </div>

          {/* 4. Reassessment Readiness Prompt Banner */}
          {(roadmap.completed_tasks > 0 || progressSummary?.is_ready_for_reassessment) && (
            <Card
              variant="gradient-emerald"
              className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-base">
                  <Sparkles className="w-5 h-5" />
                  <span>
                    {currentLang === "hi"
                      ? "महत्वपूर्ण प्रगति दर्ज! डिजिटल पुनर्मूल्यांकन के लिए तैयार"
                      : "Milestones Completed! Ready for Reassessment"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {currentLang === "hi"
                    ? "आपने अपने डिजिटल रोडमैप पर कार्य पूर्ण कर लिए हैं। अपनी नई क्षमताओं को मापने, अपना स्तर अपग्रेड करने और नया रोडमैप प्राप्त करने के लिए पुनर्मूल्यांकन करें।"
                    : "You have executed key transformation tasks. Take a reassessment to evaluate updated scores, unlock your next RBDL level, and generate Roadmap v" +
                      (roadmap.version + 1) +
                      "."}
                </p>
              </div>

              <Button
                variant="success"
                size="md"
                onClick={() => navigate("/assessment")}
                leftIcon={<RotateCcw className="w-4 h-4" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shrink-0"
              >
                {currentLang === "hi" ? "पुनर्मूल्यांकन शुरू करें" : "Take Reassessment"}
              </Button>
            </Card>
          )}

          {/* 5. Phase Tabs */}
          <Tabs
            items={phaseTabs}
            activeId={selectedPhase}
            onChange={setSelectedPhase}
            variant="pills"
          />

          {/* 6. Tasks List */}
          <Section
            title={`${currentLang === "hi" ? "कार्य सूची" : "Milestone Action Items"} (${filteredTasks.length})`}
            subtitle="Update task statuses as you implement digital solutions in your business."
          >
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <EmptyState
                  title="No Tasks in this Phase"
                  description="There are no active roadmap tasks assigned to this phase for your current RBDL level."
                />
              ) : (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    code={task.recommendation_code}
                    titleEn={task.title_en}
                    titleHi={task.title_hi}
                    descriptionEn={task.description_en}
                    descriptionHi={task.description_hi}
                    reasonEn={task.reason_en}
                    reasonHi={task.reason_hi}
                    phaseNumber={task.phase_number}
                    phaseNameEn={task.phase_name_en}
                    phaseNameHi={task.phase_name_hi}
                    sequenceOrder={task.sequence_order}
                    status={task.status}
                    skipReason={task.skip_reason}
                    completedAt={task.completed_at}
                    updatedAt={task.updated_at}
                    priorityScore={task.priority_score}
                    currentLang={currentLang}
                    onStatusChange={(newStatus, skipReason) =>
                      handleStatusChange(task.id, newStatus, skipReason)
                    }
                    isUpdating={updateStatusMutation.isPending}
                  />
                ))
              )}
            </div>
          </Section>

          {/* 7. Roadmap Version History Card */}
          {historyData.length > 0 && (
            <Card variant="subtle" className="p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <History className="h-4 w-4 text-indigo-400" />
                  <span>
                    {currentLang === "hi"
                      ? "रोडमैप संस्करण इतिहास"
                      : "Roadmap Version History"}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/history")}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>
                    {currentLang === "hi"
                      ? "विस्तृत इतिहास और तुलना देखें →"
                      : "View Full History & Comparison →"}
                  </span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {historyData.map((h) => (
                  <Card
                    key={h.id}
                    variant={h.status === "active" ? "gradient-indigo" : "subtle"}
                    className="p-4 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-white">Roadmap v{h.version}</span>
                      <Badge
                        variant={h.status === "active" ? "success" : "neutral"}
                        size="sm"
                      >
                        {h.status}
                      </Badge>
                    </div>
                    <div className="text-slate-300">
                      {h.completed_tasks} of {h.total_tasks} milestones completed (
                      {Math.round((h.completed_tasks / (h.total_tasks || 1)) * 100)}%)
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(h.generated_at).toLocaleDateString()}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
