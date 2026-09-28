import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardCheck,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Building2,
  BarChart3,
  ShieldCheck,
  Zap,
  Check,
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
  StatCard,
} from "../components";
import { LevelBadge } from "../components/domain/LevelBadge";
import { LevelProgressBar } from "../components/domain/LevelProgressBar";
import { DimensionScoreBarChart } from "../components/domain/DimensionScoreBarChart";

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

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
        setCurrentQuestionIndex(0);
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

  const dimensionNames: Record<string, { en: string; hi: string; icon: string }> = {
    infra: { en: "Digital Infrastructure", hi: "डिजिटल इन्फ्रास्ट्रक्चर", icon: "📱" },
    literacy: { en: "Digital Literacy & Skills", hi: "डिजिटल साक्षरता व कौशल", icon: "🎓" },
    presence: { en: "Online Presence & Discovery", hi: "ऑनलाइन उपस्थिति एवं खोज", icon: "🌐" },
    comms: { en: "Customer Communication", hi: "ग्राहक संचार", icon: "💬" },
    records: { en: "Digital Bookkeeping & Records", hi: "डिजिटल बहीखाता व रिकॉर्ड", icon: "📋" },
    payments: { en: "Digital Payment Systems", hi: "डिजिटल भुगतान प्रणाली", icon: "💳" },
    inventory: { en: "Inventory & Stock Operations", hi: "इन्वेंट्री व स्टॉक संचालन", icon: "📦" },
    analytics: { en: "Data & Sales Analytics", hi: "डेटा व बिक्री विश्लेषण", icon: "📊" },
    growth: { en: "Digital Growth & Marketplaces", hi: "डिजिटल विकास व मार्केटप्लेस", icon: "🚀" },
  };

  const totalQuestions = questions.length;
  const answeredCount = Object.values(answersState).filter(
    (a) => a.is_na || (a.selected_option_ids && a.selected_option_ids.length > 0) || a.selected_option_id
  ).length;

  // Render Step 1: Assessment Introduction
  if (activeStep === "intro") {
    return (
      <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fadeIn pb-16">
        {/* Intro PageHeader */}
        <PageHeader
          icon={<ClipboardCheck className="w-8 h-8 text-[#F0592A]" />}
          badge={<Badge variant="brand" size="sm">{t("assessment:intro.badge")}</Badge>}
          title={t("assessment:intro.title")}
          subtitle={t("assessment:intro.desc")}
        />

        {/* Pillars Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card variant="default" className="p-6 space-y-2.5 border-[#EDE2D8] hover:border-[#F0592A]/40 transition">
            <Badge variant="brand" size="sm">
              {t("assessment:intro.bullet_1_title")}
            </Badge>
            <p className="text-xs text-[#6B5D52] leading-relaxed pt-1">
              {t("assessment:intro.bullet_1_desc")}
            </p>
          </Card>

          <Card variant="default" className="p-6 space-y-2.5 border-[#EDE2D8] hover:border-[#1B7A6E]/40 transition">
            <Badge variant="success" size="sm">
              {t("assessment:intro.bullet_2_title")}
            </Badge>
            <p className="text-xs text-[#6B5D52] leading-relaxed pt-1">
              {t("assessment:intro.bullet_2_desc")}
            </p>
          </Card>

          <Card variant="default" className="p-6 space-y-2.5 border-[#EDE2D8] hover:border-[#C88A1D]/40 transition">
            <Badge variant="warning" size="sm">
              {t("assessment:intro.bullet_3_title")}
            </Badge>
            <p className="text-xs text-[#6B5D52] leading-relaxed pt-1">
              {t("assessment:intro.bullet_3_desc")}
            </p>
          </Card>
        </div>

        {/* Enterprise Selector Card */}
        <Card variant="default" className="p-6 sm:p-8 space-y-6 border-[#EDE2D8] shadow-card bg-[#FFF4ED]/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5 flex-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9C8F84]">
                {t("assessment:intro.select_business")}
              </label>
              {businesses.length > 0 ? (
                <div className="flex items-center gap-2 max-w-md">
                  <Building2 className="w-5 h-5 text-[#F0592A] shrink-0" />
                  <select
                    value={activeBusinessId || ""}
                    onChange={(e) => setActiveBusinessId(Number(e.target.value))}
                    className="w-full bg-white text-[#241C15] text-sm rounded-xl px-4 py-3 border border-[#EDE2D8] focus:outline-none focus:border-[#F0592A] font-bold shadow-xs"
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
                  className="text-xs text-[#F0592A] hover:underline font-bold inline-block"
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
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="shadow-md shrink-0"
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
          subtitle="A comprehensive evaluation covering hardware readiness, apps, operations, and digital channels."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {Object.entries(dimensionNames).map(([code, info], idx) => (
              <Card key={code} variant="default" className="p-4 flex items-center gap-3.5 hover:border-[#F0592A]/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#FFE8DE] text-[#F0592A] border border-[#EDE2D8] flex items-center justify-center text-lg font-bold shrink-0">
                  {info.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#241C15]">{info[currentLang]}</h4>
                  <span className="text-[10px] text-[#9C8F84] uppercase font-mono tracking-wider font-semibold">Dim 0{idx + 1} • {code}</span>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      </div>
    );
  }

  // Render Step 2: Conversational Questionnaire (Section 7.5: One question per screen)
  if (activeStep === "questionnaire") {
    const currentQ = questions[currentQuestionIndex] || questions[0];
    const currentAnswer = currentQ ? answersState[currentQ.id] : undefined;
    const isNA = currentAnswer?.is_na || false;
    const selectedIds =
      currentAnswer?.selected_option_ids ||
      (currentAnswer?.selected_option_id ? [currentAnswer.selected_option_id] : []);

    const dimCode = currentQ?.dimension_code || "infra";
    const dimInfo = dimensionNames[dimCode] || { en: dimCode, hi: dimCode, icon: "📋" };
    const selectedBusiness = businesses.find((b) => b.id === activeBusinessId) || businesses[0];

    return (
      <div className="max-w-3xl mx-auto py-6 space-y-6 animate-fadeIn pb-32">
        {/* Active Business Context Pill */}
        {selectedBusiness && (
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900">🏪 {selectedBusiness.name}</span>
              {selectedBusiness.owner_name && (
                <span className="text-stone-600 font-medium">({selectedBusiness.owner_name})</span>
              )}
              <span className="text-stone-400">•</span>
              <span className="text-stone-600">{selectedBusiness.city}, {selectedBusiness.state}</span>
              {selectedBusiness.enterprise_size && (
                <span className="px-2 py-0.5 rounded bg-white border border-orange-200 font-bold text-orange-700 text-[10px]">
                  {selectedBusiness.enterprise_size}
                </span>
              )}
            </div>
            {selectedBusiness.digitalization_goal && (
              <span className="text-orange-800 font-medium truncate max-w-sm text-[11px]">
                🎯 {selectedBusiness.digitalization_goal}
              </span>
            )}
          </div>
        )}

        {/* Progress Bar & Question Counter */}
        <div className="bg-white rounded-2xl p-4 border border-[#EDE2D8] shadow-card space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#241C15] flex items-center gap-2">
              <span className="text-base">{dimInfo.icon}</span>
              <span className="text-sm font-extrabold">{dimInfo[currentLang]}</span>
            </span>
            <span className="text-[#6B5D52] font-bold">
              {currentLang === "hi"
                ? `प्रश्न ${currentQuestionIndex + 1} / ${totalQuestions}`
                : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
            </span>
          </div>

          <ProgressBar value={((currentQuestionIndex + 1) / (totalQuestions || 1)) * 100} max={100} variant="brand" size="md" />

          {/* Question Dots Quick Pager */}
          <div className="flex items-center justify-between gap-1 pt-1 overflow-x-auto">
            {questions.map((q, idx) => {
              const hasAns = answersState[q.id]?.is_na || (answersState[q.id]?.selected_option_ids && answersState[q.id].selected_option_ids!.length > 0) || answersState[q.id]?.selected_option_id;
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition ${
                    isCurrent
                      ? "bg-[#F0592A] text-white shadow-xs scale-110"
                      : hasAns
                      ? "bg-[#E8F5EC] text-[#2E8B57] border border-[#2E8B57]/30"
                      : "bg-[#EDE2D8]/60 text-[#6B5D52] hover:bg-[#EDE2D8]"
                  }`}
                  title={`Go to Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {statusMessage && (
          <Alert type="info" onDismiss={() => setStatusMessage(null)}>
            {statusMessage}
          </Alert>
        )}

        {qLoading || !currentQ ? (
          <LoadingState
            title="Loading questions..."
            description="Fetching your customized 14-question diagnostic"
          />
        ) : (
          /* Central Focused Question Card */
          <Card variant="default" className="p-6 sm:p-10 space-y-6 border-[#EDE2D8] shadow-card bg-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#F0592A]">
                  {dimInfo[currentLang]}
                </span>

                {/* Not Applicable Chip */}
                <button
                  type="button"
                  onClick={() => handleToggleNA(currentQ.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                    isNA
                      ? "bg-[#FBF1DD] border-[#C88A1D] text-[#C88A1D]"
                      : "bg-[#FDF8F3] border-[#EDE2D8] text-[#6B5D52] hover:bg-[#FFE8DE] hover:text-[#F0592A]"
                  }`}
                >
                  {isNA
                    ? currentLang === "en"
                      ? "✓ Marked Not Applicable"
                      : "✓ लागू नहीं"
                    : currentLang === "en"
                    ? "Mark Not Applicable"
                    : "लागू नहीं"}
                </button>
              </div>

              {/* Large H3 Question Text */}
              <h3 className="text-xl sm:text-2xl font-bold text-[#241C15] font-heading leading-snug">
                {currentLang === "en" ? currentQ.question_text_en : currentQ.question_text_hi}
              </h3>

              {currentQ.question_type === "multi_choice" && (
                <span className="text-xs text-[#F0592A] font-semibold block">
                  {currentLang === "hi"
                    ? "(लागू होने वाले सभी विकल्प चुनें)"
                    : "(Select all options that apply)"}
                </span>
              )}
            </div>

            {/* Answer Option Cards */}
            {!isNA ? (
              <div className="space-y-3 pt-2">
                {currentQ.options.map((opt: QuestionOption) => {
                  const isSelected = selectedIds.includes(opt.id);
                  const isNoneOption = opt.option_code.toUpperCase().includes("NONE");

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        handleSelectOption(
                          currentQ.id,
                          opt.id,
                          currentQ.question_type,
                          isNoneOption
                        )
                      }
                      className={`w-full p-4 sm:p-5 rounded-xl text-left text-sm sm:text-base font-semibold border transition-all duration-200 flex items-center justify-between min-h-[52px] ${
                        isSelected
                          ? "bg-[#FFE8DE] border-[#F0592A] text-[#241C15] shadow-xs ring-1 ring-[#F0592A]"
                          : "bg-white border-[#EDE2D8] text-[#241C15] hover:bg-[#FFF4ED]/60 hover:border-[#F0592A]/40"
                      }`}
                    >
                      <span className="leading-snug">{currentLang === "en" ? opt.label_en : opt.label_hi}</span>
                      <span
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ml-3 shrink-0 transition-colors ${
                          isSelected
                            ? "border-[#F0592A] bg-[#F0592A] text-white font-bold"
                            : "border-[#DCCFC2] bg-white"
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-[#FBF1DD]/50 border border-[#C88A1D]/30 text-center space-y-1">
                <span className="text-xs font-bold text-[#C88A1D]">Question Marked Not Applicable</span>
                <p className="text-xs text-[#6B5D52]">This dimension check will be exempted or evaluated according to business category rules.</p>
              </div>
            )}
          </Card>
        )}

        {/* Sticky Action Navigation Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EDE2D8] p-4 shadow-lg lg:pl-[260px]">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentQuestionIndex === 0}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              {currentLang === "hi" ? "पिछला" : "Previous"}
            </Button>

            <div className="text-xs text-[#6B5D52] font-semibold hidden sm:block">
              {answeredCount} / {totalQuestions} answered
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => saveMutation.mutate()}
                isLoading={saveMutation.isPending}
              >
                {t("assessment:questionnaire.save_draft")}
              </Button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(prev + 1, totalQuestions - 1))}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {currentLang === "hi" ? "अगला प्रश्न →" : "Next →"}
                </Button>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Step 3: Classification Results & Explainability (Section 7.6)
  if (activeStep === "result" && classificationResult) {
    return (
      <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fadeIn pb-16">
        {/* Top Success Eyebrow */}
        <div className="text-center space-y-2">
          <Badge variant="success" size="md" dot>
            Assessment Complete ✓
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#241C15] font-heading tracking-tight">
            Your Digitalization Level
          </h1>
          <p className="text-sm text-[#6B5D52] max-w-lg mx-auto">
            Comprehensive deterministic evaluation based on the Requirement-Based Digitalization Framework (RBDL).
          </p>
        </div>

        {/* Main RBDL Level Card */}
        <Card variant="default" className="p-8 sm:p-10 space-y-6 border-[#EDE2D8] shadow-card bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#F0592A]">
                {t("assessment:results.badge")}
              </span>
              <div className="pt-1">
                <LevelBadge
                  level={classificationResult.rbdl_level}
                  showName={true}
                  currentLang={currentLang}
                  size="lg"
                />
              </div>
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

          {/* 4-Segment Level Progression Bar */}
          <div className="pt-2">
            <LevelProgressBar currentLevel={classificationResult.rbdl_level} />
          </div>

          <p className="text-[#241C15] text-sm sm:text-base leading-relaxed bg-[#FFF4ED]/50 p-5 rounded-2xl border border-[#EDE2D8]">
            {currentLang === "en"
              ? classificationResult.explanation_summary_en
              : classificationResult.explanation_summary_hi}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#EDE2D8] text-xs text-[#6B5D52]">
            <div>
              <span className="font-bold text-[#241C15]">
                {t("assessment:results.composite_score")}:
              </span>{" "}
              <span className="text-[#F0592A] font-extrabold text-base">
                {classificationResult.composite_score} / 10.0
              </span>
            </div>

            <div>
              <span className="font-bold text-[#241C15]">Engine:</span>{" "}
              <span>Deterministic Rule-Based (Ruleset v{classificationResult.ruleset_version || 1})</span>
            </div>
          </div>
        </Card>

        {/* 3 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            label="Composite Score"
            value={`${classificationResult.composite_score} / 10.0`}
            subtitle="Overall digital maturity index"
            icon={<BarChart3 className="w-4 h-4 text-[#F0592A]" />}
            variant="brand"
          />

          <StatCard
            label="Classification Certainty"
            value={classificationResult.certainty_tier}
            subtitle="Prerequisites verification status"
            icon={<ShieldCheck className="w-4 h-4 text-[#1B7A6E]" />}
            variant="emerald"
          />

          <StatCard
            label="Dimensions Evaluated"
            value="9 Dimensions"
            subtitle="Operations, sales, records & growth"
            icon={<Zap className="w-4 h-4 text-[#C88A1D]" />}
            variant="amber"
          />
        </div>

        {/* 9 Dimensions Breakdown Chart (Section 5.6) */}
        <Section
          title={t("assessment:results.dimension_scores_title")}
          subtitle="Breakdown across all nine digitalization capabilities."
        >
          <Card variant="default" className="p-6 border-[#EDE2D8] shadow-card bg-white">
            <DimensionScoreBarChart
              scores={classificationResult.dimension_scores}
              currentLang={currentLang}
            />
          </Card>
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
                <h4 className="text-xs uppercase font-bold tracking-wider text-[#C88A1D]">
                  {t("assessment:results.blocking_requirements")}
                </h4>
                <div className="space-y-2">
                  {classificationResult.blocking_requirements.map((req, idx) => (
                    <Card
                      key={idx}
                      variant="default"
                      className="p-4 border-[#C88A1D]/30 bg-[#FBF1DD]/40 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#241C15]">
                          {req.requirement_name}
                        </span>
                        <span className="text-[#6B5D52] block mt-0.5">
                          Actual: <strong className="text-[#C1432F]">{req.actual_score}</strong> • Required:{" "}
                          <strong className="text-[#241C15]">{req.required_threshold}</strong>
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
                <h4 className="text-xs uppercase font-bold tracking-wider text-[#2E8B57]">
                  {t("assessment:results.satisfied_capabilities")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {classificationResult.satisfied_requirements.map((req, idx) => (
                    <Card
                      key={idx}
                      variant="default"
                      className="p-3.5 border-[#2E8B57]/30 bg-[#E8F5EC]/40 text-xs flex items-center justify-between"
                    >
                      <span className="text-[#241C15] font-semibold">{req.requirement_name}</span>
                      <span className="text-[#2E8B57] font-bold">✓ {req.actual_score}</span>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Navigation Action Footer */}
        <Card variant="default" className="p-6 flex flex-wrap items-center justify-between gap-4 border-[#EDE2D8] shadow-card bg-white">
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
