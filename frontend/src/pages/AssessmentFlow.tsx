import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardCheck,
  ArrowRight,
  RotateCcw,
  Building2,
} from "lucide-react";
import { fetchBusinesses } from "../api/businesses";
import {
  startAssessment,
  getAssessmentQuestions,
  saveAssessmentAnswers,
  submitAssessment,
  AnswerSubmissionItem,
} from "../api/assessments";
import { Business, Question, QuestionOption, ClassificationResult } from "../types";
import { useAuth } from "../context/AuthContext";
import {
  PageHeader,
  Card,
  Button,
  Badge,
  ProgressBar,
  Alert,
  LoadingState,
  Section,
} from "../components";

export const AssessmentFlow: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeBusinessId, setActiveBusinessId } = useAuth();

  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";

  const [currentAssessmentId, setCurrentAssessmentId] = useState<number | null>(null);
  const [answersState, setAnswersState] = useState<Record<number, AnswerSubmissionItem>>({});
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<"intro" | "questionnaire" | "result">("intro");

  // 1. Fetch user's registered businesses
  const { data: businesses = [] } = useQuery<Business[]>({
    queryKey: ["businesses"],
    queryFn: fetchBusinesses,
  });

  // Auto-select active business
  useEffect(() => {
    if (businesses.length > 0 && !activeBusinessId) {
      setActiveBusinessId(businesses[0].id);
    }
  }, [businesses, activeBusinessId, setActiveBusinessId]);

  // 2. Fetch questions & saved answers once assessment session is active
  const {
    data: qData,
    isLoading: qLoading,
  } = useQuery({
    queryKey: ["assessmentQuestions", currentAssessmentId],
    queryFn: () => getAssessmentQuestions(currentAssessmentId!),
    enabled: !!currentAssessmentId,
  });

  const questions: Question[] = qData?.data?.questions || [];
  const savedAnswers = qData?.data?.answers || [];

  // Populate answers state from server
  useEffect(() => {
    if (savedAnswers.length > 0) {
      const stateMap: Record<number, AnswerSubmissionItem> = {};
      savedAnswers.forEach((ans) => {
        stateMap[ans.question_id] = {
          question_id: ans.question_id,
          selected_option_id: ans.selected_option_id,
          selected_option_ids:
            ans.selected_option_ids || (ans.selected_option_id ? [ans.selected_option_id] : []),
          text_answer: ans.text_answer,
          is_na: ans.is_na,
        };
      });
      setAnswersState(stateMap);
    }
  }, [savedAnswers]);

  // Start Assessment Mutation
  const startMutation = useMutation({
    mutationFn: (bizId: number) => startAssessment(bizId, currentLang),
    onSuccess: (res) => {
      if (res.data) {
        setCurrentAssessmentId(res.data.id);
        setClassificationResult(null);
        setActiveStep("questionnaire");
        setStatusMessage(
          currentLang === "en"
            ? "Assessment session started. Please answer the questions below."
            : "मूल्यांकन सत्र प्रारंभ हो गया। कृपया नीचे दिए गए प्रश्नों के उत्तर दें।"
        );
      }
    },
    onError: (err: any) => {
      setStatusMessage(err?.response?.data?.message || "Failed to start assessment.");
    },
  });

  // Save Answers Mutation
  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: AnswerSubmissionItem[] = Object.values(answersState);
      return saveAssessmentAnswers(currentAssessmentId!, payload, currentLang);
    },
    onSuccess: () => {
      setStatusMessage(
        currentLang === "en"
          ? "Draft answers saved successfully."
          : "प्रश्नों के उत्तर सफलतापूर्वक सहेज लिए गए हैं।"
      );
    },
    onError: (err: any) => {
      setStatusMessage(err?.response?.data?.message || "Failed to save answers.");
    },
  });

  // Submit Assessment Mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload: AnswerSubmissionItem[] = Object.values(answersState);
      await saveAssessmentAnswers(currentAssessmentId!, payload, currentLang);
      return submitAssessment(currentAssessmentId!);
    },
    onSuccess: (res) => {
      if (res.data) {
        setClassificationResult(res.data);
        setActiveStep("result");
        queryClient.invalidateQueries({ queryKey: ["activeRoadmap"] });
        queryClient.invalidateQueries({ queryKey: ["businessRecommendations"] });
        queryClient.invalidateQueries({ queryKey: ["assessmentHistory"] });
        setStatusMessage(
          currentLang === "en"
            ? `Assessment completed! Classified at RBDL Level ${res.data.rbdl_level}.`
            : `मूल्यांकन पूरा हुआ! आरबीडीएल स्तर ${res.data.rbdl_level} निर्धारित किया गया।`
        );
      }
    },
    onError: (err: any) => {
      setStatusMessage(
        err?.response?.data?.message || "Submission failed. Please answer required questions."
      );
    },
  });

  const handleStart = () => {
    if (activeBusinessId) {
      startMutation.mutate(activeBusinessId);
    }
  };

  const handleSelectOption = (
    questionId: number,
    optionId: number,
    qType: string,
    isNoneOption: boolean = false
  ) => {
    setAnswersState((prev) => {
      const current = prev[questionId] || { question_id: questionId, is_na: false };

      if (qType === "multi_choice") {
        const currentIds = current.selected_option_ids || [];
        if (isNoneOption) {
          return {
            ...prev,
            [questionId]: {
              question_id: questionId,
              selected_option_id: optionId,
              selected_option_ids: [optionId],
              is_na: false,
            },
          };
        } else {
          const noneOption = questions
            .find((q) => q.id === questionId)
            ?.options.find((o) => o.option_code.toUpperCase().includes("NONE"));
          const noneId = noneOption?.id;

          let nextIds = currentIds.filter((id) => id !== noneId);
          if (nextIds.includes(optionId)) {
            nextIds = nextIds.filter((id) => id !== optionId);
          } else {
            nextIds = [...nextIds, optionId];
          }
          return {
            ...prev,
            [questionId]: {
              question_id: questionId,
              selected_option_id: nextIds[0] || null,
              selected_option_ids: nextIds,
              is_na: false,
            },
          };
        }
      } else {
        return {
          ...prev,
          [questionId]: {
            question_id: questionId,
            selected_option_id: optionId,
            selected_option_ids: [optionId],
            is_na: false,
          },
        };
      }
    });
  };

  const handleToggleNA = (questionId: number) => {
    setAnswersState((prev) => {
      const current = prev[questionId] || { question_id: questionId, is_na: false };
      const nextNA = !current.is_na;
      return {
        ...prev,
        [questionId]: {
          question_id: questionId,
          is_na: nextNA,
          selected_option_id: nextNA ? null : current.selected_option_id,
          selected_option_ids: nextNA ? [] : current.selected_option_ids,
        },
      };
    });
  };

  // Group questions by dimension
  const questionsByDimension: Record<string, Question[]> = {};
  questions.forEach((q) => {
    const dim = q.dimension_code;
    if (!questionsByDimension[dim]) {
      questionsByDimension[dim] = [];
    }
    questionsByDimension[dim].push(q);
  });

  const dimensionNames: Record<string, { en: string; hi: string }> = {
    infra: { en: "Digital Infrastructure", hi: "डिजिटल इन्फ्रास्ट्रक्चर" },
    literacy: { en: "Digital Literacy & Skills", hi: "डिजिटल साक्षरता व कौशल" },
    presence: { en: "Online Presence & Discovery", hi: "ऑनलाइन उपस्थिति एवं खोज" },
    comms: { en: "Customer Communication", hi: "ग्राहक संचार" },
    records: { en: "Digital Bookkeeping & Records", hi: "डिजिटल बहीखाता व रिकॉर्ड" },
    payments: { en: "Digital Payment Systems", hi: "डिजिटल भुगतान प्रणाली" },
    inventory: { en: "Inventory & Stock Operations", hi: "इन्वेंट्री व स्टॉक संचालन" },
    analytics: { en: "Data & Sales Analytics", hi: "डेटा व बिक्री विश्लेषण" },
    growth: { en: "Digital Growth & Marketplaces", hi: "डिजिटल विकास व मार्केटप्लेस" },
  };

  const totalQuestions = questions.length;
  const answeredCount = Object.values(answersState).filter(
    (a) => a.is_na || (a.selected_option_ids && a.selected_option_ids.length > 0) || a.selected_option_id
  ).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  // Render Step 1: Assessment Introduction
  if (activeStep === "intro") {
    return (
      <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fadeIn pb-16">
        {/* Intro PageHeader */}
        <PageHeader
          icon={<ClipboardCheck className="w-8 h-8" />}
          badge={<Badge variant="brand" size="sm">{t("assessment:intro.badge")}</Badge>}
          title={t("assessment:intro.title")}
          subtitle={t("assessment:intro.desc")}
        />

        {/* Pillars Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card variant="subtle" className="p-6 space-y-2 border-indigo-500/20">
            <Badge variant="brand" size="sm">
              {t("assessment:intro.bullet_1_title")}
            </Badge>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {t("assessment:intro.bullet_1_desc")}
            </p>
          </Card>

          <Card variant="subtle" className="p-6 space-y-2 border-emerald-500/20">
            <Badge variant="success" size="sm">
              {t("assessment:intro.bullet_2_title")}
            </Badge>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {t("assessment:intro.bullet_2_desc")}
            </p>
          </Card>

          <Card variant="subtle" className="p-6 space-y-2 border-amber-500/20">
            <Badge variant="warning" size="sm">
              {t("assessment:intro.bullet_3_title")}
            </Badge>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              {t("assessment:intro.bullet_3_desc")}
            </p>
          </Card>
        </div>

        {/* Enterprise Selector Card */}
        <Card variant="gradient-indigo" className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                {t("assessment:intro.select_business")}
              </label>
              {businesses.length > 0 ? (
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <select
                    value={activeBusinessId || ""}
                    onChange={(e) => setActiveBusinessId(Number(e.target.value))}
                    className="bg-slate-900 text-white text-sm rounded-xl px-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city} • {b.sector})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <Link
                  to="/businesses"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline"
                >
                  + Register an enterprise first
                </Link>
              )}
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleStart}
              isLoading={startMutation.isPending}
              disabled={!activeBusinessId}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t("assessment:intro.cta_start")}
            </Button>
          </div>
        </Card>

        {/* 9 Dimensions Overview Grid */}
        <Section
          title={
            currentLang === "hi"
              ? "मूल्यांकन में शामिल 9 परिचालन आयाम"
              : "9 Operational Dimensions Evaluated"
          }
          subtitle="A comprehensive evaluation covering hardware readiness, apps, and digital channels."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(dimensionNames).map(([code, names], idx) => (
              <Card key={code} variant="subtle" className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold font-mono text-xs">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{names[currentLang]}</h4>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">{code}</span>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      </div>
    );
  }

  // Render Step 2: Interactive Questionnaire
  if (activeStep === "questionnaire") {
    return (
      <div className="max-w-4xl mx-auto py-6 space-y-6 animate-fadeIn pb-28">
        {/* Sticky Progress Bar Header */}
        <Card variant="default" className="sticky top-20 z-30 p-4 shadow-2xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-teal-400" />
              <span>{t("assessment:questionnaire.progress")}</span>
            </span>
            <span className="text-slate-300 font-semibold">
              {answeredCount} / {totalQuestions} {t("assessment:questionnaire.questions_answered")} (
              {progressPercent}%)
            </span>
          </div>

          <ProgressBar value={progressPercent} max={100} variant="gradient" size="md" />
        </Card>

        {statusMessage && (
          <Alert type="info" onDismiss={() => setStatusMessage(null)}>
            {statusMessage}
          </Alert>
        )}

        {qLoading ? (
          <LoadingState
            title="Loading questions..."
            description="Fetching your customized 14-question diagnostic"
          />
        ) : (
          Object.entries(questionsByDimension).map(([dimCode, dimQuestions], dimIdx) => (
            <Card key={dimCode} variant="default" className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xs font-bold font-mono">
                  {dimIdx + 1}
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                    {dimensionNames[dimCode]?.[currentLang] || dimCode}
                  </h3>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                    Dimension: {dimCode}
                  </span>
                </div>
              </div>

              <div className="space-y-5">
                {dimQuestions.map((q) => {
                  const currentAnswer = answersState[q.id];
                  const isNA = currentAnswer?.is_na || false;
                  const selectedIds =
                    currentAnswer?.selected_option_ids ||
                    (currentAnswer?.selected_option_id ? [currentAnswer.selected_option_id] : []);

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border transition-all duration-200 space-y-3.5 ${
                        isNA
                          ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                          : selectedIds.length > 0
                          ? "bg-slate-950/90 border-indigo-500/40 shadow-md"
                          : "bg-slate-950/70 border-slate-800"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="space-y-1 flex-1">
                          <p className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
                            {currentLang === "en" ? q.question_text_en : q.question_text_hi}
                          </p>
                          {q.question_type === "multi_choice" && (
                            <span className="text-[11px] text-indigo-400 font-medium block">
                              {currentLang === "hi"
                                ? "(लागू होने वाले सभी विकल्प चुनें)"
                                : "(Select all that apply)"}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleNA(q.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition shrink-0 ${
                            isNA
                              ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold"
                              : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {isNA
                            ? currentLang === "en"
                              ? "✓ Marked N/A"
                              : "✓ लागू नहीं"
                            : currentLang === "en"
                            ? "Mark N/A"
                            : "लागू नहीं"}
                        </button>
                      </div>

                      {!isNA && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {q.options.map((opt: QuestionOption) => {
                            const isSelected = selectedIds.includes(opt.id);
                            const isNoneOption = opt.option_code.toUpperCase().includes("NONE");

                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() =>
                                  handleSelectOption(
                                    q.id,
                                    opt.id,
                                    q.question_type,
                                    isNoneOption
                                  )
                                }
                                className={`p-4 rounded-xl text-left text-xs sm:text-sm font-medium border transition-all duration-200 flex items-center justify-between ${
                                  isSelected
                                    ? "bg-indigo-950/90 border-indigo-500 text-indigo-100 shadow-md ring-1 ring-indigo-500/50"
                                    : "bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700"
                                }`}
                              >
                                <span>{currentLang === "en" ? opt.label_en : opt.label_hi}</span>
                                <span
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ml-2 shrink-0 transition-colors ${
                                    isSelected
                                      ? "border-indigo-400 bg-indigo-600 text-white font-bold"
                                      : "border-slate-600 bg-slate-950"
                                  }`}
                                >
                                  {isSelected ? "✓" : ""}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))
        )}

        {/* Sticky Action Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-4 shadow-2xl">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              {currentLang === "en"
                ? `${answeredCount} of ${totalQuestions} questions completed`
                : `${answeredCount} / ${totalQuestions} प्रश्नों के उत्तर पूर्ण`}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="md"
                onClick={() => saveMutation.mutate()}
                isLoading={saveMutation.isPending}
              >
                {t("assessment:questionnaire.save_draft")}
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => submitMutation.mutate()}
                isLoading={submitMutation.isPending}
                disabled={answeredCount === 0}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {t("assessment:questionnaire.submit")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Step 3: Classification Results & Explainability
  if (activeStep === "result" && classificationResult) {
    return (
      <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fadeIn pb-16">
        {/* Main RBDL Level Banner */}
        <Card variant="gradient-indigo" className="p-8 sm:p-10 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-widest text-teal-400">
                {t("assessment:results.badge")}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight">
                {currentLang === "en"
                  ? classificationResult.level_name_en
                  : classificationResult.level_name_hi}
              </h2>
            </div>

            <Badge
              variant={
                classificationResult.certainty_tier === "HIGH"
                  ? "success"
                  : classificationResult.certainty_tier === "MEDIUM"
                  ? "warning"
                  : "error"
              }
              size="md"
              dot
            >
              {t("assessment:results.certainty")}: {classificationResult.certainty_tier}
            </Badge>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
            {currentLang === "en"
              ? classificationResult.explanation_summary_en
              : classificationResult.explanation_summary_hi}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-200">
                {t("assessment:results.composite_score")}:
              </span>{" "}
              <span className="text-teal-400 font-bold text-base">
                {classificationResult.composite_score} / 10.0
              </span>
            </div>

            <div>
              <span className="font-semibold text-slate-200">Engine:</span>{" "}
              <span>Deterministic Rule-Based (Ruleset v{classificationResult.ruleset_version || 1})</span>
            </div>
          </div>
        </Card>

        {/* 9 Dimensions Breakdown */}
        <Section
          title={t("assessment:results.dimension_scores_title")}
          subtitle="Breakdown across all nine digitalization capabilities."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(classificationResult.dimension_scores).map(([code, score]) => (
              <Card key={code} variant="subtle" className="p-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">
                    {dimensionNames[code]?.[currentLang] || code}
                  </span>
                  <span className="text-teal-400 font-bold">{score} / 10</span>
                </div>
                <ProgressBar
                  value={score * 10}
                  max={100}
                  variant={score >= 7 ? "emerald" : score >= 4 ? "brand" : "amber"}
                  size="sm"
                />
              </Card>
            ))}
          </div>
        </Section>

        {/* Gating & Requirements Trace */}
        <Section
          title={t("assessment:results.evidence_trail_title")}
          subtitle="Deterministic rule evaluation and prerequisite satisfaction trace."
        >
          <div className="space-y-4">
            {/* Category Exemptions */}
            {classificationResult.category_exemptions.length > 0 && (
              <Alert type="info" title={t("assessment:results.category_exemptions")}>
                {classificationResult.category_exemptions.map((ex, idx) => (
                  <p key={idx}>{ex}</p>
                ))}
              </Alert>
            )}

            {/* Blocking Requirements */}
            {classificationResult.blocking_requirements.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400">
                  {t("assessment:results.blocking_requirements")}
                </h4>
                <div className="space-y-2">
                  {classificationResult.blocking_requirements.map((req, idx) => (
                    <Card
                      key={idx}
                      variant="subtle"
                      className="p-4 border-amber-500/20 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-200">
                          {req.requirement_name}
                        </span>
                        <span className="text-slate-400 block mt-0.5">
                          Actual: <strong className="text-rose-400">{req.actual_score}</strong> • Required:{" "}
                          <strong className="text-slate-300">{req.required_threshold}</strong>
                        </span>
                      </div>
                      <Badge variant="warning" size="sm">
                        Gap: -{req.gap}
                      </Badge>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Satisfied Requirements */}
            {classificationResult.satisfied_requirements.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-400">
                  {t("assessment:results.satisfied_capabilities")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {classificationResult.satisfied_requirements.map((req, idx) => (
                    <Card
                      key={idx}
                      variant="subtle"
                      className="p-3 border-emerald-500/20 text-xs flex items-center justify-between"
                    >
                      <span className="text-slate-300">{req.requirement_name}</span>
                      <span className="text-emerald-400 font-bold">✓ {req.actual_score}</span>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Navigation Action Footer */}
        <Card variant="default" className="p-6 flex flex-wrap items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              setActiveStep("intro");
              setCurrentAssessmentId(null);
              setClassificationResult(null);
            }}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            {t("assessment:results.reassess")}
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate("/recommendations")}
            >
              {t("assessment:results.cta_recommendations")}
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate("/roadmap")}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {t("assessment:results.cta_roadmap")}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};
