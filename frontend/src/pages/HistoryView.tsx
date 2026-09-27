import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  History as HistoryIcon,
  Calendar,
  Building2,
  ArrowRight,
  RotateCcw,
  Scale,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  X,
  FileText,
  Layers,
} from "lucide-react";
import { fetchBusinesses } from "../api/businesses";
import {
  getRoadmapHistory,
  getRoadmapById,
  RoadmapHistoryItem,
  PhasedRoadmapData,
} from "../api/roadmap";
import { getAssessmentHistory, compareAssessments } from "../api/assessments";
import { AssessmentHistoryItem, AssessmentComparison } from "../types";
import { useAuth } from "../context/AuthContext";
import {
  PageHeader,
  Card,
  Button,
  Badge,
  Tabs,
  Alert,
  EmptyState,
  LoadingState,
  ProgressBar,
} from "../components";

export const HistoryView: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { activeBusinessId, setActiveBusinessId } = useAuth();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";

  const [activeTab, setActiveTab] = useState<string>("assessments");
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<number | null>(null);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);
  const [selectedCompIds, setSelectedCompIds] = useState<{
    currentId?: number;
    previousId?: number;
  }>({});

  // Fetch businesses
  const { data: businesses = [], isLoading: isLoadingBiz } = useQuery({
    queryKey: ["businesses"],
    queryFn: fetchBusinesses,
  });

  const effectiveBizId = activeBusinessId || (businesses.length > 0 ? businesses[0].id : null);

  // Fetch assessment history
  const {
    data: assessmentHistory = [],
    isLoading: isLoadingAssessments,
  } = useQuery<AssessmentHistoryItem[]>({
    queryKey: ["assessmentHistory", effectiveBizId],
    queryFn: () => getAssessmentHistory(effectiveBizId!),
    enabled: !!effectiveBizId,
  });

  // Fetch roadmap version history
  const {
    data: roadmapHistory = [],
    isLoading: isLoadingRoadmaps,
  } = useQuery<RoadmapHistoryItem[]>({
    queryKey: ["roadmapHistory", effectiveBizId],
    queryFn: () => getRoadmapHistory(effectiveBizId!),
    enabled: !!effectiveBizId,
  });

  // Fetch selected roadmap details
  const { data: selectedRoadmapDetail, isLoading: isLoadingDetail } = useQuery<PhasedRoadmapData>({
    queryKey: ["roadmapDetail", selectedRoadmapId],
    queryFn: () => getRoadmapById(selectedRoadmapId!),
    enabled: !!selectedRoadmapId,
  });

  // Fetch comparison data
  const { data: comparisonData, isLoading: isLoadingComp } = useQuery<AssessmentComparison>({
    queryKey: [
      "assessmentComparison",
      effectiveBizId,
      selectedCompIds.currentId,
      selectedCompIds.previousId,
    ],
    queryFn: () =>
      compareAssessments(
        effectiveBizId!,
        selectedCompIds.currentId,
        selectedCompIds.previousId
      ),
    enabled: showComparisonModal && !!effectiveBizId,
  });

  const submittedAssessments = assessmentHistory.filter((a) => a.status === "submitted");

  const openComparison = (currentId?: number, previousId?: number) => {
    setSelectedCompIds({ currentId, previousId });
    setShowComparisonModal(true);
  };

  const tabsList = [
    {
      id: "assessments",
      label: currentLang === "hi" ? "मूल्यांकन सत्र" : "Assessments",
      icon: <FileText className="w-3.5 h-3.5" />,
      count: assessmentHistory.length,
    },
    {
      id: "roadmaps",
      label: currentLang === "hi" ? "रोडमैप संस्करण" : "Roadmaps",
      icon: <Layers className="w-3.5 h-3.5" />,
      count: roadmapHistory.length,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 animate-fadeIn pb-16">
      {/* 1. Page Header */}
      <PageHeader
        icon={<HistoryIcon className="w-8 h-8" />}
        badge={<Badge variant="brand" size="sm">Audit & Evolution</Badge>}
        title={
          currentLang === "hi"
            ? "मूल्यांकन एवं रोडमैप इतिहास"
            : "Assessment & Progress History"
        }
        subtitle={
          currentLang === "hi"
            ? "डिजिटल परिपक्वता प्रगति, पुनर्मूल्यांकन तुलना और रोडमैप संस्करणों का ऑडिट ट्रेल।"
            : "Comprehensive audit trail of past assessments, score progressions, and versioned roadmaps."
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

      {isLoadingBiz || isLoadingAssessments || isLoadingRoadmaps ? (
        <LoadingState
          title="Loading historical records..."
          description="Fetching your enterprise audit trail and milestone completions"
        />
      ) : assessmentHistory.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon className="w-8 h-8" />}
          title="No Assessment Records Found"
          description="This enterprise does not have any recorded assessment sessions yet. Take the first assessment to begin tracking your digital growth."
          actionLabel="Take 3-Minute Assessment →"
          onAction={() => navigate("/assessment")}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Controls: Tabs + Comparison CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <Tabs items={tabsList} activeId={activeTab} onChange={setActiveTab} variant="pills" />

            <div className="flex items-center gap-3">
              {submittedAssessments.length >= 2 && (
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => openComparison()}
                  leftIcon={<Scale className="w-4 h-4" />}
                >
                  {currentLang === "hi" ? "तुलना देखें (Compare)" : "Compare Reassessments"}
                </Button>
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/assessment")}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                {currentLang === "hi" ? "पुनर्मूल्यांकन करें" : "Retake Assessment"}
              </Button>
            </div>
          </div>

          {/* Assessments Timeline */}
          {activeTab === "assessments" && (
            <div className="space-y-4">
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
                {assessmentHistory.map((item, idx) => {
                  const isSubmitted = item.status === "submitted";
                  const isLatest = idx === 0;

                  return (
                    <div key={item.id} className="relative group">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-[27px] sm:-left-[35px] top-4 w-4 h-4 rounded-full border-2 transition-transform group-hover:scale-125 ${
                          isLatest && isSubmitted
                            ? "bg-teal-500 border-teal-300 shadow-lg shadow-teal-500/50"
                            : isSubmitted
                            ? "bg-indigo-500 border-indigo-300"
                            : "bg-slate-800 border-slate-600"
                        }`}
                      />

                      <Card
                        variant={isLatest && isSubmitted ? "gradient-indigo" : "default"}
                        className="p-6 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-base sm:text-lg font-bold text-white">
                              Assessment #{item.id}
                            </span>
                            <Badge
                              variant={isSubmitted ? "success" : "warning"}
                              size="sm"
                            >
                              {item.status}
                            </Badge>

                            {isLatest && isSubmitted && (
                              <Badge variant="brand" size="sm">
                                Latest Active
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>
                              {item.submitted_at
                                ? `Submitted on ${new Date(item.submitted_at).toLocaleDateString()}`
                                : `Started on ${new Date(item.started_at).toLocaleDateString()}`}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                            <span className="text-slate-500 block">Classified Level</span>
                            <span className="font-bold text-white text-base mt-0.5 block">
                              {item.rbdl_level !== null && item.rbdl_level !== undefined
                                ? currentLang === "hi"
                                  ? item.level_name_hi || `स्तर ${item.rbdl_level}`
                                  : item.level_name_en || `Level ${item.rbdl_level}`
                                : "In Progress"}
                            </span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                            <span className="text-slate-500 block">Composite Readiness</span>
                            <span className="font-bold text-teal-400 text-base mt-0.5 block">
                              {item.composite_score !== null && item.composite_score !== undefined
                                ? `${item.composite_score.toFixed(1)} / 10.0`
                                : "N/A"}
                            </span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-slate-500 block">Question Bank</span>
                              <span className="font-bold text-slate-300 mt-0.5 block">
                                Version v{item.question_bank_version || 1} (
                                {(item.language_used || "en").toUpperCase()})
                              </span>
                            </div>

                            {isSubmitted && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  if (submittedAssessments.length >= 2) {
                                    const prev = submittedAssessments.find((a) => a.id < item.id);
                                    openComparison(item.id, prev?.id);
                                  } else {
                                    navigate("/assessment");
                                  }
                                }}
                                rightIcon={<ArrowRight className="w-3 h-3" />}
                              >
                                <span>
                                  {submittedAssessments.length >= 2 ? "Compare" : "Results"}
                                </span>
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Roadmaps Timeline */}
          {activeTab === "roadmaps" && (
            <div className="space-y-4">
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-800">
                {roadmapHistory.map((item) => {
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

                      <Card
                        variant={isActive ? "gradient-indigo" : "default"}
                        className="p-6 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-white">
                              Roadmap Version v{item.version}
                            </span>
                            <Badge
                              variant={isActive ? "success" : "neutral"}
                              size="sm"
                            >
                              {item.status}
                            </Badge>

                            {isActive && (
                              <Badge variant="brand" size="sm">
                                Currently Active
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{new Date(item.generated_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                            <span className="text-slate-500 block">Milestones Completed</span>
                            <span className="font-bold text-white text-base mt-0.5 block">
                              {item.completed_tasks} / {item.total_tasks} ({percent}%)
                            </span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-center">
                            <span className="text-slate-500 block mb-1">Execution Progress</span>
                            <ProgressBar value={percent} max={100} variant="emerald" size="sm" />
                          </div>

                          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="text-slate-500 block">Snapshot Inspector</span>
                              <span className="font-bold text-slate-300 mt-0.5 block">
                                {selectedRoadmapId === item.id ? "Viewing Tasks" : "Archived Plan"}
                              </span>
                            </div>

                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                if (selectedRoadmapId === item.id) {
                                  setSelectedRoadmapId(null);
                                } else {
                                  setSelectedRoadmapId(item.id);
                                }
                              }}
                            >
                              {selectedRoadmapId === item.id ? "Hide Tasks" : "Inspect"}
                            </Button>
                          </div>
                        </div>

                        {/* Expanded Historical Snapshot Tasks */}
                        {selectedRoadmapId === item.id && (
                          <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 animate-fadeIn">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                              Archived Tasks in Roadmap v{item.version}
                            </h5>

                            {isLoadingDetail ? (
                              <LoadingState title="Loading snapshot..." description="" />
                            ) : selectedRoadmapDetail ? (
                              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                {selectedRoadmapDetail.all_tasks.map((task) => (
                                  <div
                                    key={task.id}
                                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`w-2 h-2 rounded-full ${
                                          task.status === "completed"
                                            ? "bg-emerald-400"
                                            : task.status === "in_progress"
                                            ? "bg-amber-400"
                                            : "bg-slate-600"
                                        }`}
                                      />
                                      <span
                                        className={
                                          task.status === "completed"
                                            ? "text-slate-400 line-through"
                                            : "text-slate-200"
                                        }
                                      >
                                        {currentLang === "hi" ? task.title_hi : task.title_en}
                                      </span>
                                    </div>
                                    <Badge
                                      variant={
                                        task.status === "completed"
                                          ? "success"
                                          : task.status === "in_progress"
                                          ? "warning"
                                          : "neutral"
                                      }
                                      size="sm"
                                    >
                                      {task.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        )}
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Side-by-Side Assessment Comparison Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-heading">
                    {currentLang === "hi"
                      ? "डिजिटल प्रगति तुलना (Reassessment Delta)"
                      : "Assessment Comparison & Readiness Progression"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Side-by-side comparative analysis of capabilities and score shifts.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowComparisonModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingComp ? (
              <LoadingState
                title="Computing Score Deltas..."
                description="Comparing 9 dimensions and completed milestones"
              />
            ) : comparisonData ? (
              <div className="space-y-6 animate-fadeIn">
                {/* Score & Level Jump Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Previous Run */}
                  <Card variant="subtle" className="p-4 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Previous Run (#{comparisonData.previous_assessment_id})
                    </span>
                    <div className="text-lg font-bold text-white">
                      {currentLang === "hi"
                        ? comparisonData.previous_level_name_hi
                        : comparisonData.previous_level_name_en}
                    </div>
                    <div className="text-xs text-slate-400">
                      Composite: <strong className="text-slate-200">{comparisonData.previous_composite_score} / 10</strong>
                    </div>
                    {comparisonData.previous_submitted_at && (
                      <div className="text-[10px] text-slate-500">
                        {new Date(comparisonData.previous_submitted_at).toLocaleDateString()}
                      </div>
                    )}
                  </Card>

                  {/* Level Shift Metric */}
                  <Card
                    variant="gradient-indigo"
                    className="p-4 flex flex-col justify-center items-center text-center space-y-1"
                  >
                    <span className="text-[10px] uppercase font-bold text-indigo-300 block">
                      Readiness Evolution
                    </span>
                    <div className="text-2xl font-extrabold text-teal-300 font-heading">
                      Level {comparisonData.previous_rbdl_level} → Level{" "}
                      {comparisonData.current_rbdl_level}
                    </div>
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>
                        Delta: {comparisonData.composite_score_delta >= 0 ? "+" : ""}
                        {comparisonData.composite_score_delta.toFixed(1)} pts
                      </span>
                    </div>
                  </Card>

                  {/* Current Run */}
                  <Card variant="subtle" className="p-4 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-teal-400 block">
                      Current Run (#{comparisonData.current_assessment_id})
                    </span>
                    <div className="text-lg font-bold text-white">
                      {currentLang === "hi"
                        ? comparisonData.current_level_name_hi
                        : comparisonData.current_level_name_en}
                    </div>
                    <div className="text-xs text-slate-400">
                      Composite: <strong className="text-teal-300">{comparisonData.current_composite_score} / 10</strong>
                    </div>
                    {comparisonData.current_submitted_at && (
                      <div className="text-[10px] text-slate-500">
                        {new Date(comparisonData.current_submitted_at).toLocaleDateString()}
                      </div>
                    )}
                  </Card>
                </div>

                {/* 9 Dimensions Comparison Table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Dimension Score Shifts (9 Dimensions)
                  </h4>

                  <div className="overflow-x-auto rounded-2xl border border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                          <th className="p-3.5">Dimension</th>
                          <th className="p-3.5">Previous</th>
                          <th className="p-3.5">Current</th>
                          <th className="p-3.5">Delta (Shift)</th>
                          <th className="p-3.5">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                        {comparisonData.dimension_comparisons.map((dim) => {
                          const isImproved = dim.status === "improved";
                          const isDeclined = dim.status === "declined";

                          return (
                            <tr key={dim.dimension_code} className="hover:bg-slate-800/40">
                              <td className="p-3.5 font-medium text-white">
                                {currentLang === "hi" ? dim.dimension_name_hi : dim.dimension_name_en}
                              </td>
                              <td className="p-3.5 text-slate-400">{dim.previous_score.toFixed(1)}</td>
                              <td className="p-3.5 font-bold text-slate-200">{dim.current_score.toFixed(1)}</td>
                              <td className="p-3.5 font-bold font-mono">
                                <span
                                  className={
                                    isImproved
                                      ? "text-emerald-400"
                                      : isDeclined
                                      ? "text-rose-400"
                                      : "text-slate-400"
                                  }
                                >
                                  {dim.score_delta > 0 ? "+" : ""}
                                  {dim.score_delta.toFixed(1)} ({dim.percentage_change > 0 ? "+" : ""}
                                  {dim.percentage_change.toFixed(0)}%)
                                </span>
                              </td>
                              <td className="p-3.5">
                                <Badge
                                  variant={isImproved ? "success" : isDeclined ? "error" : "neutral"}
                                  size="sm"
                                  icon={
                                    isImproved ? (
                                      <ArrowUpRight className="w-3 h-3 mr-0.5" />
                                    ) : isDeclined ? (
                                      <ArrowDownRight className="w-3 h-3 mr-0.5" />
                                    ) : (
                                      <Minus className="w-3 h-3 mr-0.5" />
                                    )
                                  }
                                >
                                  {dim.status}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Completed Tasks in Between */}
                {comparisonData.completed_tasks_count > 0 && (
                  <Card variant="subtle" className="p-4 space-y-2 border-emerald-500/20 bg-emerald-950/10">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {comparisonData.completed_tasks_count}{" "}
                        {currentLang === "hi"
                          ? "रोडमैप कार्य इस दौरान पूर्ण किए गए"
                          : "Roadmap Milestones Completed Between Assessments"}
                      </span>
                    </span>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300 pt-1">
                      {(currentLang === "hi"
                        ? comparisonData.completed_task_titles_hi
                        : comparisonData.completed_task_titles_en
                      ).map((title, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{title}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}

                {/* Responsible AI Disclaimer Banner */}
                <Alert type="info" title="DigiMitra Framework Note">
                  {currentLang === "hi"
                    ? comparisonData.disclaimer_hi
                    : comparisonData.disclaimer_en}
                </Alert>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
