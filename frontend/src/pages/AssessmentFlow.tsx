import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  ClipboardCheck,
  ArrowRight,
  Layers,
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
import { LoadingState } from "../components/UIState";

export const AssessmentFlow: React.FC = () => {
  const { t, i18n } = useTranslation();
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
          selected_option_ids: ans.selected_option_ids || (ans.selected_option_id ? [ans.selected_option_id] : []),
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
        setStatusMessage(
          currentLang === "en"
            ? `Assessment completed! Classified at RBDL Level ${res.data.rbdl_level}.`
            : `मूल्यांकन पूरा हुआ! आरबीडीएल स्तर ${res.data.rbdl_level} निर्धारित किया गया।`
        );
      }
    },
    onError: (err: any) => {
      setStatusMessage(err?.response?.data?.message || "Submission failed. Please answer required questions.");
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
        let currentIds = current.selected_option_ids || [];
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
          // Remove any "None" option
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
        // Single choice or boolean
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
    data_usage: { en: "Data & Sales Analytics", hi: "डेटा व बिक्री विश्लेषण" },
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
      <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fadeIn">
        {/* Intro Hero */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 border border-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-300">
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            <span>{t("assessment:intro.badge")}</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading tracking-tight leading-tight">
              {t("assessment:intro.title")}
            </h1>
            <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
              {t("assessment:intro.desc")}
            </p>
          </div>

          {/* Key Assessment Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                {t("assessment:intro.bullet_1_title")}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t("assessment:intro.bullet_1_desc")}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                {t("assessment:intro.bullet_2_title")}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t("assessment:intro.bullet_2_desc")}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                {t("assessment:intro.bullet_3_title")}
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t("assessment:intro.bullet_3_desc")}
              </p>
            </div>
          </div>

          {/* Enterprise Selection & Start CTA */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {t("assessment:intro.select_business")}
              </label>
              {businesses.length > 0 ? (
                <select
                  value={activeBusinessId || ""}
                  onChange={(e) => setActiveBusinessId(Number(e.target.value))}
                  className="bg-slate-800 text-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city} • {b.sector})
                    </option>
                  ))}
                </select>
              ) : (
                <Link
                  to="/businesses"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline"
                >
                  + Register an enterprise first
                </Link>
              )}
            </div>

            <button
              onClick={handleStart}
              disabled={startMutation.isPending || !activeBusinessId}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-sm font-bold shadow-xl shadow-teal-500/20 transition hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>
                {startMutation.isPending ? "Starting Assessment..." : t("assessment:intro.cta_start")}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 9 Dimensions Overview Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white font-heading">
              {currentLang === "hi"
                ? "मूल्यांकन में शामिल 9 परिचालन आयाम"
                : "9 Operational Dimensions Evaluated"}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(dimensionNames).map(([code, names], idx) => (
              <div
                key={code}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 text-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold font-mono">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">{names[currentLang]}</h4>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                    {code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Step 2: Interactive Questionnaire
  if (activeStep === "questionnaire") {
    return (
      <div className="max-w-4xl mx-auto py-6 space-y-6 animate-fadeIn pb-24">
        {/* Sticky Progress Bar Header */}
        <div className="sticky top-20 z-30 bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-teal-400" />
              <span>{t("assessment:questionnaire.progress")}</span>
            </span>
            <span className="text-slate-300 font-semibold">
              {answeredCount} / {totalQuestions} {t("assessment:questionnaire.questions_answered")} ({progressPercent}%)
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-teal-400 to-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 bg-indigo-950/50 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {qLoading ? (
          <LoadingState message="Loading assessment questions..." />
        ) : (
          Object.entries(questionsByDimension).map(([dimCode, dimQuestions], dimIdx) => (
            <div
              key={dimCode}
              className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <span className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center text-xs font-bold font-mono">
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
                  const selectedIds = currentAnswer?.selected_option_ids || (currentAnswer?.selected_option_id ? [currentAnswer.selected_option_id] : []);

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border transition-all duration-200 space-y-3 ${
                        isNA
                          ? "bg-slate-950/40 border-slate-800/60 opacity-60"
                          : selectedIds.length > 0
                          ? "bg-slate-950 border-teal-500/40 shadow-md"
                          : "bg-slate-950 border-slate-800"
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
                            ? currentLang === "en" ? "✓ Marked N/A" : "✓ लागू नहीं"
                            : currentLang === "en" ? "Mark N/A" : "लागू नहीं"}
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
                                onClick={() => handleSelectOption(q.id, opt.id, q.question_type, isNoneOption)}
                                className={`p-3.5 rounded-xl text-left text-xs sm:text-sm font-medium border transition flex items-center justify-between ${
                                  isSelected
                                    ? "bg-indigo-950/90 border-indigo-500 text-indigo-100 shadow-md ring-1 ring-indigo-500/50"
                                    : "bg-slate-900/90 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700"
                                }`}
                              >
                                <span>{currentLang === "en" ? opt.label_en : opt.label_hi}</span>
                                <span
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ml-2 shrink-0 ${
                                    isSelected ? "border-indigo-400 bg-indigo-600 text-white font-bold" : "border-slate-600"
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
            </div>
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
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition border border-slate-700 disabled:opacity-50"
              >
                {saveMutation.isPending ? t("assessment:questionnaire.saving") : t("assessment:questionnaire.save_draft")}
              </button>

              <button
                onClick={() => submitMutation.mutate()}
                disabled={submitMutation.isPending || answeredCount === 0}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-teal-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>
                  {submitMutation.isPending
                    ? t("assessment:questionnaire.evaluating")
                    : t("assessment:questionnaire.submit")}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Step 3: Classification Results & Explainability
  if (activeStep === "result" && classificationResult) {
    return (
      <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fadeIn">
        {/* Main RBDL Level Banner */}
        <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-teal-400">
                {t("assessment:results.badge")}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                {currentLang === "en" ? classificationResult.level_name_en : classificationResult.level_name_hi}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${
                  classificationResult.certainty_tier === "HIGH"
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : classificationResult.certainty_tier === "MEDIUM"
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}
              >
                {t("assessment:results.certainty")}: {classificationResult.certainty_tier}
              </span>
            </div>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
            {currentLang === "en"
              ? classificationResult.explanation_summary_en
              : classificationResult.explanation_summary_hi}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-200">{t("assessment:results.composite_score")}:</span>{" "}
              <span className="text-teal-400 font-bold text-sm">
                {classificationResult.composite_score} / 10.0
              </span>
            </div>

            <div>
              <span className="font-semibold text-slate-200">Engine:</span>{" "}
              <span>Deterministic Rule-Based (Ruleset v{classificationResult.ruleset_version || 1})</span>
            </div>
          </div>
        </div>

        {/* 9 Dimensions Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h3 className="text-lg font-bold text-white font-heading">
            {t("assessment:results.dimension_scores_title")}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(classificationResult.dimension_scores).map(([code, score]) => (
              <div key={code} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">
                    {dimensionNames[code]?.[currentLang] || code}
                  </span>
                  <span className="text-teal-400 font-bold">{score} / 10</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, score * 10))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explainability & Gating Trail */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h3 className="text-lg font-bold text-white font-heading">
            {t("assessment:results.evidence_trail_title")}
          </h3>

          {/* Category Exemptions */}
          {classificationResult.category_exemptions.length > 0 && (
            <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 text-teal-300 text-xs space-y-1">
              <span className="font-bold uppercase tracking-wider block">
                {t("assessment:results.category_exemptions")}
              </span>
              {classificationResult.category_exemptions.map((ex, idx) => (
                <p key={idx}>{ex}</p>
              ))}
            </div>
          )}

          {/* Blocking Requirements */}
          {classificationResult.blocking_requirements.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400">
                {t("assessment:results.blocking_requirements")}
              </h4>
              <div className="space-y-2">
                {classificationResult.blocking_requirements.map((req, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950 rounded-xl border border-amber-500/20 text-xs flex justify-between items-center"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{req.requirement_name}</span>
                      <span className="text-slate-400 block mt-0.5">
                        Actual: <strong className="text-rose-400">{req.actual_score}</strong> • Required:{" "}
                        <strong className="text-slate-300">{req.required_threshold}</strong>
                      </span>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 rounded-lg font-bold text-xs">
                      Gap: -{req.gap}
                    </span>
                  </div>
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
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 rounded-xl border border-emerald-500/20 text-xs flex items-center justify-between"
                  >
                    <span className="text-slate-300">{req.requirement_name}</span>
                    <span className="text-emerald-400 font-bold">✓ Score: {req.actual_score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Action Buttons */}
          <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => {
                setActiveStep("intro");
                setCurrentAssessmentId(null);
                setClassificationResult(null);
              }}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              {t("assessment:results.reassess")}
            </button>

            <div className="flex items-center gap-3">
              <Link
                to="/recommendations"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700 transition"
              >
                {t("assessment:results.cta_recommendations")}
              </Link>

              <Link
                to="/roadmap"
                className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-teal-500/20 transition flex items-center gap-2"
              >
                <span>{t("assessment:results.cta_roadmap")}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
