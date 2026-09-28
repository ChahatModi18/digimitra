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
  ArrowDown,
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
} from "../components";
import { LevelBadge } from "../components/domain/LevelBadge";
import { ProgressRing } from "../components/domain/ProgressRing";
import { ResearchDisclosureBanner } from "../components/domain/ResearchDisclosureBanner";

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
          label: currentLang === "hi" ? "चरण 2: मुख्य अगले कदम" : "Phase 2: Core Digitalization",
          count: roadmap.phase_2?.total_tasks || 0,
        },
        {
          id: "3",
          label: currentLang === "hi" ? "चरण 3: दीर्घकालिक योजना" : "Phase 3: Strategic Growth",
          count: roadmap.phase_3?.total_tasks || 0,
        },
      ]
    : [];

  const completionPct =
    progressSummary?.completion_percentage ??
    (roadmap && roadmap.total_tasks > 0
      ? Math.round((roadmap.completed_tasks / roadmap.total_tasks) * 100)
      : 0);

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 animate-fadeIn pb-16">
      {/* 1. Standard Page Header */}
      <PageHeader
        icon={<Compass className="w-8 h-8 text-[#F0592A]" />}
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
              <Building2 className="w-4 h-4 text-[#9C8F84]" />
              <select
                value={activeBusinessId || ""}
                onChange={(e) => setActiveBusinessId(Number(e.target.value))}
                className="bg-white text-[#241C15] text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-[#EDE2D8] focus:outline-none focus:border-[#F0592A] font-bold shadow-xs"
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
          icon={<Compass className="w-8 h-8 text-[#F0592A]" />}
          title="No Active Roadmap Found"
          description="This enterprise does not have a completed digital assessment yet. Complete an assessment to generate your personalized action roadmap."
          actionLabel="Start Digital Assessment →"
          onAction={() => navigate("/assessment")}
        />
      ) : (
        <>
          {/* Research Diagnostic Disclosure Banner */}
          <ResearchDisclosureBanner compact={false} />

          {/* 2. Level Progression Journey Card with ProgressRing (Section 5.6 & 7.8) */}
          <Card variant="default" className="p-6 sm:p-8 space-y-6 border-[#EDE2D8] shadow-card bg-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 w-full md:w-auto">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#9C8F84] block">
                  Digitalization Journey (One-Level-Above Rule)
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  <LevelBadge
                    level={roadmap.current_rbdl_level}
                    showName={true}
                    currentLang={currentLang}
                    size="md"
                  />
                  <ArrowRight className="w-5 h-5 text-[#F0592A] hidden sm:block" />
                  <ArrowDown className="w-5 h-5 text-[#F0592A] sm:hidden" />
                  <LevelBadge
                    level={roadmap.target_rbdl_level}
                    showName={true}
                    currentLang={currentLang}
                    size="md"
                  />
                </div>
                <p className="text-xs text-[#6B5D52] max-w-md">
                  Execute current Level {roadmap.current_rbdl_level} milestone interventions to unlock Level {roadmap.target_rbdl_level} capabilities.
                </p>
              </div>

              {/* ProgressRing */}
              <div className="flex items-center gap-6 p-4 rounded-2xl bg-[#FFF4ED]/60 border border-[#EDE2D8]">
                <ProgressRing
                  progress={completionPct}
                  size={100}
                  strokeWidth={8}
                  color="#1B7A6E"
                  label={`${completionPct}%`}
                  sublabel="Completed"
                />
                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-[#241C15]">
                    {roadmap.completed_tasks} of {roadmap.total_tasks} Tasks Done
                  </div>
                  <div className="text-[#6B5D52]">Roadmap Version v{roadmap.version}</div>
                  <div className="text-[10px] text-[#2E8B57] font-bold">
                    {roadmap.total_tasks - roadmap.completed_tasks} tasks remaining
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 3. Progress Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <StatCard
              label={currentLang === "hi" ? "कुल कार्य" : "Total Tasks"}
              value={progressSummary?.total_tasks ?? roadmap.total_tasks}
              icon={<ListTodo className="w-4 h-4 text-[#F0592A]" />}
              variant="brand"
            />

            <StatCard
              label={currentLang === "hi" ? "पूर्ण कार्य" : "Completed"}
              value={progressSummary?.completed_tasks ?? roadmap.completed_tasks}
              icon={<CheckSquare className="w-4 h-4 text-[#2E8B57]" />}
              variant="emerald"
            />

            <StatCard
              label={currentLang === "hi" ? "प्रगति में" : "In Progress"}
              value={progressSummary?.in_progress_tasks ?? 0}
              icon={<Clock3 className="w-4 h-4 text-[#C88A1D]" />}
              variant="amber"
            />

            <StatCard
              label={currentLang === "hi" ? "लंबित कार्य" : "Not Started"}
              value={progressSummary?.pending_tasks ?? 0}
              icon={<Clock className="w-4 h-4 text-[#9C8F84]" />}
              variant="slate"
            />

            <StatCard
              label={currentLang === "hi" ? "छोड़ा गया" : "Skipped"}
              value={progressSummary?.skipped_tasks ?? 0}
              icon={<CircleSlash className="w-4 h-4 text-[#9C8F84]" />}
              variant="slate"
            />

            <StatCard
              label={currentLang === "hi" ? "प्रगति दर" : "Completion"}
              value={`${completionPct}%`}
              icon={<TrendingUp className="w-4 h-4 text-[#1B7A6E]" />}
              variant="emerald"
            />
          </div>

          {/* 4. Reassessment Readiness Prompt Banner */}
          {(roadmap.completed_tasks > 0 || progressSummary?.is_ready_for_reassessment) && (
            <Card
              variant="default"
              className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-[#2E8B57]/30 bg-[#E8F5EC]/50 shadow-card"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#2E8B57] font-bold text-base">
                  <Sparkles className="w-5 h-5 text-[#2E8B57]" />
                  <span>
                    {currentLang === "hi"
                      ? "महत्वपूर्ण प्रगति दर्ज! डिजिटल पुनर्मूल्यांकन के लिए तैयार"
                      : "Milestones Completed! Ready for Reassessment"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#241C15] max-w-2xl leading-relaxed">
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
                className="shrink-0 shadow-sm"
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
            <Card variant="default" className="p-6 sm:p-8 space-y-4 border-[#EDE2D8] shadow-card bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#241C15] font-bold text-sm">
                  <History className="h-4 w-4 text-[#F0592A]" />
                  <span>
                    {currentLang === "hi"
                      ? "रोडमैप संस्करण इतिहास"
                      : "Roadmap Version History"}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/history")}
                  className="inline-flex items-center gap-1.5 text-xs text-[#F0592A] hover:underline font-bold"
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
                    variant="default"
                    className={`p-4 space-y-2 text-xs border ${
                      h.status === "active" ? "border-[#F0592A]/40 bg-[#FFF4ED]/30" : "border-[#EDE2D8]"
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[#241C15]">Roadmap v{h.version}</span>
                      <Badge
                        variant={h.status === "active" ? "success" : "neutral"}
                        size="sm"
                      >
                        {h.status}
                      </Badge>
                    </div>
                    <div className="text-[#6B5D52]">
                      {h.completed_tasks} of {h.total_tasks} milestones completed (
                      {Math.round((h.completed_tasks / (h.total_tasks || 1)) * 100)}%)
                    </div>
                    <div className="text-[10px] text-[#9C8F84] flex items-center gap-1">
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
