import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Compass,
  TrendingUp,
  History,
  Building2,
  Clock,
  CheckSquare,
  Clock3,
  ListTodo,
  CircleSlash,
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  X,
  CheckCircle2,
  ChevronRight,
  Share2,
  Film,
} from "lucide-react";
import { fetchBusinesses } from "../api/businesses";
import { Business, ProgressSummary } from "../types";
import {
  getActiveRoadmap,
  getProgressSummary,
  getRoadmapHistory,
  updateRoadmapTaskStatus,
  PhasedRoadmapData,
  RoadmapTaskItem,
} from "../api/roadmap";
import { fetchFlashcards, Flashcard } from "../api/learning";
import { useAuth } from "../context/AuthContext";
import { ShareModal } from "../components/ui/ShareModal";
import {
  PageHeader,
  StatCard,
  Card,
  TaskCard,
  Badge,
  Button,
  Tabs,
  LoadingState,
  Section,
} from "../components";
import { LevelBadge } from "../components/domain/LevelBadge";
import { ProgressRing } from "../components/domain/ProgressRing";
import { ResearchDisclosureBanner } from "../components/domain/ResearchDisclosureBanner";
import { GovernmentInitiativesFlashcards } from "../components/domain/GovernmentInitiativesFlashcards";
import { FeedbackRatingSection } from "../components/domain/FeedbackRatingSection";
import { WalkthroughVideoModal } from "../components/domain/WalkthroughVideoModal";

// Realistic interactive sample roadmap for immediate preview if an enterprise hasn't completed assessment yet
const SAMPLE_ROADMAP: PhasedRoadmapData = {
  id: 9999,
  business_id: 1,
  classification_result_id: 1,
  version: 1,
  status: "active",
  current_rbdl_level: 1,
  target_rbdl_level: 2,
  total_tasks: 6,
  completed_tasks: 2,
  generated_at: new Date().toISOString(),
  phase_1: {
    phase_number: 1,
    phase_name_en: "Quick Wins & Immediate Cashflow",
    phase_name_hi: "त्वरित परिणाम और प्रारंभिक डिजिटलीकरण",
    total_tasks: 2,
    tasks: [
      {
        id: 9001,
        roadmap_id: 9999,
        title_en: "Dedicated Business Smartphone & SIM",
        title_hi: "समर्पित व्यावसायिक स्मार्टफोन और सिम कार्ड",
        description_en: "Separate personal communications from commercial store inquiries to avoid missed customer orders.",
        description_hi: "व्यक्तिगत कॉल से व्यावसायिक पूछताछ को अलग रखें ताकि कोई ग्राहक ऑर्डर न छूटे।",
        phase_number: 1,
        phase_name_en: "Quick Wins",
        phase_name_hi: "त्वरित परिणाम",
        sequence_order: 1,
        status: "completed",
        estimated_cost_level: "LOW",
        estimated_effort_level: "LOW",
        impact_level: "HIGH",
        priority_score: 9.2,
      },
      {
        id: 9002,
        roadmap_id: 9999,
        title_en: "UPI Standee with Voice Box Payment Alert",
        title_hi: "साउंड बॉक्स के साथ यूपीआई क्यूआर स्टैंडी",
        description_en: "Deploy an instant audio speaker for UPI payments to prevent counterfeit payment screen fraud during rush hours.",
        description_hi: "भीड़ के समय फर्जी स्क्रीनशॉट से बचने के लिए तुरंत ध्वनि अलर्ट वाला यूपीआई साउंड बॉक्स लगाएं।",
        phase_number: 1,
        phase_name_en: "Quick Wins",
        phase_name_hi: "त्वरित परिणाम",
        sequence_order: 2,
        status: "completed",
        estimated_cost_level: "LOW",
        estimated_effort_level: "LOW",
        impact_level: "HIGH",
        priority_score: 9.0,
      },
    ],
  },
  phase_2: {
    phase_number: 2,
    phase_name_en: "Core Operational Digitalization",
    phase_name_hi: "मुख्य परिचालन खाता-बही डिजिटलीकरण",
    total_tasks: 2,
    tasks: [
      {
        id: 9003,
        roadmap_id: 9999,
        title_en: "App-Based Bookkeeping (Vyapar / Khatabook)",
        title_hi: "डिजिटल खाता-बही ऐप (व्यापार या खाताबुक)",
        description_en: "Digitize daily udhaar (credit) and customer balances with automated SMS reminders.",
        description_hi: "दैनिक उधारी और ग्राहक बहीखाते को डिजिटल बनाएं और स्वचालित एसएमएस तकादा भेजें।",
        phase_number: 2,
        phase_name_en: "Core Operations",
        phase_name_hi: "मुख्य परिचालन",
        sequence_order: 3,
        status: "in_progress",
        estimated_cost_level: "LOW",
        estimated_effort_level: "MEDIUM",
        impact_level: "HIGH",
        priority_score: 8.7,
      },
      {
        id: 9004,
        roadmap_id: 9999,
        title_en: "Google Business Profile & Local Search Map Verification",
        title_hi: "गूगल बिजनेस प्रोफाइल और गूगल मैप्स सत्यापन",
        description_en: "Verify your store on Google Maps with photos, phone number, and operating hours to capture local footfall.",
        description_hi: "दुकान के फोटो, समय और संपर्क के साथ गूगल मैप्स पर पंजीकृत करें ताकि ग्राहक आसानी से खोज सकें।",
        phase_number: 2,
        phase_name_en: "Core Operations",
        phase_name_hi: "मुख्य परिचालन",
        sequence_order: 4,
        status: "pending",
        estimated_cost_level: "ZERO",
        estimated_effort_level: "LOW",
        impact_level: "MEDIUM",
        priority_score: 8.1,
      },
    ],
  },
  phase_3: {
    phase_number: 3,
    phase_name_en: "Strategic Growth & Market Access",
    phase_name_hi: "दीर्घकालिक विकास व ई-कॉमर्स बाजार पहुंच",
    total_tasks: 2,
    tasks: [
      {
        id: 9005,
        roadmap_id: 9999,
        title_en: "ONDC Seller Onboarding & Digital Catalog",
        title_hi: "ओएनडीसी (ONDC) सेलर ऐप पंजीकरण एवं डिजिटल कैटलॉग",
        description_en: "List your retail product catalog on Open Network for Digital Commerce to receive orders across Paytm, Magicpin, and PhonePe.",
        description_hi: "ओएनडीसी नेटवर्क पर अपने उत्पादों को सूचीबद्ध करें ताकि पूरे शहर से ऑनलाइन ऑर्डर मिल सकें।",
        phase_number: 3,
        phase_name_en: "Strategic Growth",
        phase_name_hi: "दीर्घकालिक विकास",
        sequence_order: 5,
        status: "pending",
        estimated_cost_level: "LOW",
        estimated_effort_level: "MEDIUM",
        impact_level: "HIGH",
        priority_score: 8.5,
      },
      {
        id: 9006,
        roadmap_id: 9999,
        title_en: "TReDS Digital Bill Discounting Setup",
        title_hi: "TReDS डिजिटल बिल डिस्काउंटिंग पंजीकरण",
        description_en: "Register on RBI-approved TReDS platform to receive 48-hour invoice cash flow from corporate buyers without collateral.",
        description_hi: "आरबीआई अधिकृत TReDS मंच पर पंजीकरण कर कॉर्पोरेट खरीदारों से 48 घंटे में बिल भुगतान पाएं।",
        phase_number: 3,
        phase_name_en: "Strategic Growth",
        phase_name_hi: "दीर्घकालिक विकास",
        sequence_order: 6,
        status: "pending",
        estimated_cost_level: "ZERO",
        estimated_effort_level: "MEDIUM",
        impact_level: "HIGH",
        priority_score: 7.9,
      },
    ],
  },
  all_tasks: [],
};
SAMPLE_ROADMAP.all_tasks = [
  ...SAMPLE_ROADMAP.phase_1.tasks,
  ...SAMPLE_ROADMAP.phase_2.tasks,
  ...SAMPLE_ROADMAP.phase_3.tasks,
];

export const RoadmapView: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeBusinessId, setActiveBusinessId } = useAuth();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";

  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [sampleTasksState, setSampleTasksState] = useState<RoadmapTaskItem[]>(SAMPLE_ROADMAP.all_tasks);

  // Fetch businesses
  const { data: businesses = [], isLoading: isLoadingBiz } = useQuery<Business[]>({
    queryKey: ["businesses"],
    queryFn: fetchBusinesses,
  });

  // Smart effective enterprise selection:
  // If user selected an activeBusinessId, honor it.
  // Otherwise, prefer an enterprise known to have assessments (e.g. Verma Sweets ID 162 or Queen's Book World ID 319),
  // falling back to businesses[0]?.id.
  const preferredBusiness =
    businesses.find((b) => b.id === activeBusinessId) ||
    businesses.find((b) => b.id === 162) ||
    businesses.find((b) => b.id === 319) ||
    (businesses.length > 0 ? businesses[0] : null);

  const effectiveBizId = preferredBusiness ? preferredBusiness.id : null;
  const currentBiz = preferredBusiness;

  const [selectedFlashcard, setSelectedFlashcard] = useState<Flashcard | null>(null);
  const [flashcardLevelFilter, setFlashcardLevelFilter] = useState<string>("all");

  // Fetch active roadmap (retry: false so 404 does not stall loading)
  const { data: roadmapData } = useQuery({
    queryKey: ["activeRoadmap", effectiveBizId],
    queryFn: () => getActiveRoadmap(effectiveBizId!),
    enabled: !!effectiveBizId,
    retry: false,
  });

  // Always supply a full interactive roadmap - fallback to SAMPLE_ROADMAP so the page is immediately alive and functional
  const activeRoadmap: PhasedRoadmapData = roadmapData || SAMPLE_ROADMAP;
  const isSampleRoadmap = !roadmapData;

  // Fetch progress summary
  const { data: progressSummary } = useQuery<ProgressSummary>({
    queryKey: ["roadmapProgress", effectiveBizId],
    queryFn: () => getProgressSummary(effectiveBizId!),
    enabled: !!effectiveBizId && !!roadmapData,
    retry: false,
  });

  // Fetch roadmap version history
  const { data: historyData = [] } = useQuery({
    queryKey: ["roadmapHistory", effectiveBizId],
    queryFn: () => getRoadmapHistory(effectiveBizId!),
    enabled: !!effectiveBizId && !!roadmapData,
    retry: false,
  });

  // Fetch learning flashcards (unconditionally enabled)
  const { data: flashcards = [] } = useQuery<Flashcard[]>({
    queryKey: ["flashcards"],
    queryFn: () => fetchFlashcards(),
    retry: false,
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
    if (roadmapData) {
      updateStatusMutation.mutate({ taskId, status: newStatus, skipReason });
    } else {
      // Update local state for interactive sample roadmap preview
      setSampleTasksState((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus, skip_reason: skipReason } : t))
      );
    }
  };

  const tasksToDisplay = React.useMemo(() => {
    if (roadmapData?.all_tasks && roadmapData.all_tasks.length > 0) {
      return roadmapData.all_tasks;
    }
    if (roadmapData?.phase_1?.tasks || roadmapData?.phase_2?.tasks || roadmapData?.phase_3?.tasks) {
      return [
        ...(roadmapData.phase_1?.tasks || []),
        ...(roadmapData.phase_2?.tasks || []),
        ...(roadmapData.phase_3?.tasks || []),
      ];
    }
    return sampleTasksState;
  }, [roadmapData, sampleTasksState]);

  const filteredTasks = React.useMemo(() => {
    if (!tasksToDisplay) return [];
    if (selectedPhase === "all") return tasksToDisplay;
    const phaseNum = Number(selectedPhase);
    return tasksToDisplay.filter((t) => t.phase_number === phaseNum);
  }, [tasksToDisplay, selectedPhase]);

  const activeRoadmapObj = activeRoadmap;

  const phaseTabs = activeRoadmapObj
    ? [
        {
          id: "all",
          label: currentLang === "hi" ? "सभी चरण (All)" : "All Phases",
          count: activeRoadmapObj.total_tasks,
        },
        {
          id: "1",
          label: currentLang === "hi" ? "चरण 1: त्वरित परिणाम" : "Phase 1: Quick Wins",
          count: activeRoadmapObj.phase_1?.total_tasks || 0,
        },
        {
          id: "2",
          label: currentLang === "hi" ? "चरण 2: मुख्य अगले कदम" : "Phase 2: Core Operations",
          count: activeRoadmapObj.phase_2?.total_tasks || 0,
        },
        {
          id: "3",
          label: currentLang === "hi" ? "चरण 3: दीर्घकालिक योजना" : "Phase 3: Strategic Growth",
          count: activeRoadmapObj.phase_3?.total_tasks || 0,
        },
      ]
    : [];

  const flashcardTabs = [
    { id: "all", label: currentLang === "hi" ? "सभी कार्ड" : "All Flashcards" },
    { id: "1", label: currentLang === "hi" ? "स्तर 1: बुनियादी" : "Level 1: Basic" },
    { id: "2", label: currentLang === "hi" ? "स्तर 2: मानकीकृत" : "Level 2: Standard" },
    { id: "3", label: currentLang === "hi" ? "स्तर 3: उन्नत वृद्धि" : "Level 3: Growth" },
  ];

  const filteredFlashcards = React.useMemo(() => {
    if (!flashcards || flashcards.length === 0) return [];
    if (flashcardLevelFilter === "all") return flashcards;
    const lvl = Number(flashcardLevelFilter);
    return flashcards.filter((c) => c.target_level === lvl);
  }, [flashcards, flashcardLevelFilter]);

  const completedCount = roadmapData
    ? roadmapData.completed_tasks
    : sampleTasksState.filter((t) => t.status === "completed").length;
  const totalCount = activeRoadmapObj?.total_tasks || 6;
  const completionPct =
    progressSummary?.completion_percentage ?? Math.round((completedCount / (totalCount || 1)) * 100);

  const handleBackToDashboard = () => {
    navigate("/");
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 animate-fadeIn pb-16">
      {/* 0. Top Breadcrumb Navigation & In-App Back Button */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-1">
        <div className="flex items-center gap-2 text-xs font-bold text-[#6B5D52]">
          <button
            onClick={handleBackToDashboard}
            className="hover:text-[#F0592A] flex items-center gap-1.5 transition py-1.5 px-3 rounded-xl bg-white border border-[#EDE2D8] hover:border-[#F0592A] shadow-xs text-[#241C15]"
            title={currentLang === "hi" ? "डैशबोर्ड पर वापस जाएं" : "Back to Home Dashboard"}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#F0592A]" />
            <span>{currentLang === "hi" ? "← मुख्य डैशबोर्ड" : "← Back to Dashboard"}</span>
          </button>
          <span className="text-stone-300">/</span>
          <span className="text-[#241C15]">
            {currentLang === "hi" ? "रूपांतरण रोडमैप" : "Transformation Roadmap & Progress"}
          </span>
        </div>

        <button
          onClick={() => navigate("/")}
          className="text-xs font-bold text-[#F0592A] hover:underline flex items-center gap-1"
        >
          <span>{currentLang === "hi" ? "होम पेज देखें" : "View Home Overview"}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 1. Page Header with Actions */}
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
          <div className="flex items-center gap-2 flex-wrap">
            {/* Prominent Back to Dashboard Button */}
            <button
              onClick={handleBackToDashboard}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#241C15] border-2 border-[#EDE2D8] hover:border-[#F0592A] hover:text-[#F0592A] rounded-xl text-xs font-black shadow-xs transition"
              title={currentLang === "hi" ? "होम डैशबोर्ड पर लौटें" : "Return to Home Dashboard"}
            >
              <ArrowLeft className="w-4 h-4 text-[#F0592A]" />
              <span>{currentLang === "hi" ? "वापस डैशबोर्ड" : "Back to Dashboard"}</span>
            </button>

            {/* Watch Walkthrough Video Guide Button */}
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 text-[#F0592A] border border-orange-200 rounded-xl text-xs font-extrabold shadow-xs transition"
              title="Watch How DigiMitra Works (Video Guide)"
            >
              <Film className="w-3.5 h-3.5 fill-[#F0592A]" />
              <span>{currentLang === "hi" ? "वीडियो गाइड देखें" : "Watch Video Guide"}</span>
            </button>

            {/* Share Roadmap */}
            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#241C15] border border-[#EDE2D8] hover:border-[#F0592A] rounded-xl text-xs font-bold shadow-xs transition"
              title={currentLang === "hi" ? "रोडमैप साझा करें" : "Share Roadmap"}
            >
              <Share2 className="w-3.5 h-3.5 text-[#F0592A]" />
              <span className="hidden sm:inline">
                {currentLang === "hi" ? "साझा करें" : "Share"}
              </span>
            </button>

            {/* Enterprise Switcher */}
            {businesses.length > 0 && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#9C8F84]" />
                <select
                  value={effectiveBizId || ""}
                  onChange={(e) => {
                    const newId = Number(e.target.value);
                    setActiveBusinessId(newId);
                  }}
                  className="bg-white text-[#241C15] text-xs sm:text-sm rounded-xl px-3.5 py-2 border border-[#EDE2D8] focus:outline-none focus:border-[#F0592A] font-bold shadow-xs"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city}) {b.id === 162 || b.id === 319 ? "★ Active" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        }
      />

      {/* Loading state indicator only during active initial fetch */}
      {isLoadingBiz && (
        <LoadingState
          title="Loading enterprise details..."
          description="Fetching registered enterprises and assessment states"
        />
      )}

      {/* Informative banner when viewing interactive sample demonstration roadmap */}
      {!isLoadingBiz && isSampleRoadmap && (
        <Card
          variant="default"
          className="p-5 sm:p-6 bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-white border border-orange-200/90 shadow-sm space-y-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-orange-100 text-[#F0592A] shrink-0 mt-0.5">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning" size="sm">
                    {currentLang === "hi" ? "मूल्यांकन लंबित" : "Assessment Required"}
                  </Badge>
                  <span className="text-xs font-bold text-[#6B5D52]">
                    Enterprise: {currentBiz?.name || "Selected Enterprise"}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#241C15] mt-1">
                  {currentLang === "hi"
                    ? `${currentBiz?.name || "इस उद्यम"} का डिजिटल मूल्यांकन अभी पूरा नहीं हुआ है`
                    : `No Active Transformation Roadmap for "${currentBiz?.name || "this enterprise"}"`}
                </h3>
                <p className="text-xs text-[#6B5D52] max-w-xl mt-0.5">
                  {currentLang === "hi"
                    ? "व्यक्तिगत 3-चरणीय रोडमैप प्राप्त करने के लिए 5 मिनट का डिजिटल मूल्यांकन पूरा करें, या नीचे इंटरएक्टिव नमूना रोडमैप और सत्यापित सरकारी योजनाएं देखें।"
                    : "Complete the 5-minute diagnostic assessment to generate your personalized action roadmap, or explore the interactive sample preview and verified government schemes catalog below."}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/assessment")}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-sm"
              >
                {currentLang === "hi" ? "मूल्यांकन शुरू करें →" : "Start Assessment →"}
              </Button>

              {/* Quick switch to Verma Sweets or Queen's Book World if available */}
              {businesses.some((b) => b.id === 162 && b.id !== effectiveBizId) && (
                <button
                  onClick={() => {
                    setActiveBusinessId(162);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#EDE2D8] hover:border-[#F0592A] text-xs font-bold text-[#241C15] hover:text-[#F0592A] transition shadow-xs"
                >
                  Switch to Verma Sweets (Delhi) ★
                </button>
              )}

            </div>
          </div>
        </Card>
      )}

      {/* Render Roadmap Journey & Phased Tasks (Always active) */}
      <div className="space-y-8 animate-fadeIn">
        {/* Research Diagnostic Disclosure Banner */}
        <ResearchDisclosureBanner compact={false} />

          {/* 2. Level Progression Journey Card with ProgressRing */}
          <Card variant="default" className="p-6 sm:p-8 space-y-6 border-[#EDE2D8] shadow-card bg-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 w-full md:w-auto">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#9C8F84] block">
                  Digitalization Journey (One-Level-Above Rule)
                </span>
                <div className="flex items-center gap-3 flex-wrap">
                  <LevelBadge
                    level={activeRoadmapObj.current_rbdl_level}
                    showName={true}
                    currentLang={currentLang}
                    size="md"
                  />
                  <ArrowRight className="w-5 h-5 text-[#F0592A] hidden sm:block" />
                  <ArrowDown className="w-5 h-5 text-[#F0592A] sm:hidden" />
                  <LevelBadge
                    level={activeRoadmapObj.target_rbdl_level}
                    showName={true}
                    currentLang={currentLang}
                    size="md"
                  />
                </div>
                <p className="text-xs text-[#6B5D52] max-w-md">
                  Execute current Level {activeRoadmapObj.current_rbdl_level} milestone interventions to unlock Level {activeRoadmapObj.target_rbdl_level} capabilities without premature software overhead.
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
                    {completedCount} of {totalCount} Tasks Done
                  </div>
                  <div className="text-[#6B5D52]">Roadmap Version v{activeRoadmapObj.version}</div>
                  <div className="text-[10px] text-[#2E8B57] font-bold">
                    {totalCount - completedCount} tasks remaining
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* 3. Progress Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <StatCard
              label={currentLang === "hi" ? "कुल कार्य" : "Total Tasks"}
              value={totalCount}
              icon={<ListTodo className="w-4 h-4 text-[#F0592A]" />}
              variant="brand"
            />
            <StatCard
              label={currentLang === "hi" ? "पूर्ण कार्य" : "Completed"}
              value={completedCount}
              icon={<CheckSquare className="w-4 h-4 text-[#2E8B57]" />}
              variant="emerald"
            />
            <StatCard
              label={currentLang === "hi" ? "प्रगति में" : "In Progress"}
              value={tasksToDisplay.filter((t) => t.status === "in_progress").length}
              icon={<Clock3 className="w-4 h-4 text-[#C88A1D]" />}
              variant="amber"
            />
            <StatCard
              label={currentLang === "hi" ? "लंबित कार्य" : "Not Started"}
              value={tasksToDisplay.filter((t) => t.status === "pending").length}
              icon={<Clock className="w-4 h-4 text-[#9C8F84]" />}
              variant="slate"
            />
            <StatCard
              label={currentLang === "hi" ? "छोड़े गए" : "Skipped"}
              value={tasksToDisplay.filter((t) => t.status === "skipped").length}
              icon={<CircleSlash className="w-4 h-4 text-stone-400" />}
              variant="slate"
            />
            <StatCard
              label={currentLang === "hi" ? "पूर्णता दर" : "Progress Rate"}
              value={`${completionPct}%`}
              icon={<TrendingUp className="w-4 h-4 text-[#1B7A6E]" />}
              variant="emerald"
            />
          </div>

          {/* 4. Phased Task Action Milestones */}
          <Section
            title={currentLang === "hi" ? "चरणबद्ध कार्य सूची" : "Phased Action Milestones"}
            subtitle={
              currentLang === "hi"
                ? "कार्य स्थिति बदलें (लंबित, प्रगति में, पूर्ण)। प्रत्येक परिवर्तन ऑडिट लॉग में दर्ज होता है।"
                : "Select a phase tab to filter tasks. Update task status as you implement interventions."
            }
          >
            <div className="space-y-4">
              <Tabs
                items={phaseTabs}
                activeId={selectedPhase}
                onChange={setSelectedPhase}
              />

              <div className="space-y-3">
                {filteredTasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#9C8F84] bg-white rounded-2xl border border-[#EDE2D8]">
                    No tasks found in this phase.
                  </div>
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
                      onStatusChange={(status, reason) => handleStatusChange(task.id, status, reason)}
                    />
                  ))
                )}
              </div>
            </div>
          </Section>
        </div>

      {/* Return to Dashboard and Next Action Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-[#EDE2D8] shadow-xs">
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-[#241C15] hover:text-[#F0592A] bg-stone-50 hover:bg-orange-50 border border-[#EDE2D8] hover:border-orange-200 transition w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="w-4 h-4 text-[#F0592A]" />
          <span>{currentLang === "hi" ? "← मुख्य डैशबोर्ड पर वापस लौटें" : "← Back to Main Dashboard"}</span>
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => navigate("/recommendations")}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#6B5D52] hover:text-[#241C15] bg-white border border-[#EDE2D8] hover:border-[#F0592A] transition"
          >
            <span>{currentLang === "hi" ? "डिजिटल सिफारिशें देखें" : "View Recommendations"}</span>
          </button>
          <button
            onClick={() => navigate("/assessment")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#F0592A] text-white hover:bg-[#D9481E] shadow-sm transition"
          >
            <span>{currentLang === "hi" ? "नया मूल्यांकन करें →" : "Take New Assessment →"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 5. Verified Government Initiatives 2-Sided Flashcards (ALWAYS DISPLAYED) */}
      <Section
        title={
          currentLang === "hi"
            ? "सत्यापित सरकारी एमएसएमई योजनाएं (Verified Schemes Catalog)"
            : "Verified Government MSME Schemes & Enablers Catalog"
        }
        subtitle={
          currentLang === "hi"
            ? "आधिकारिक सरकारी पोर्टल, पात्रता मानदंड, एकीकरण लाभ और चरणबद्ध आवेदन मार्गदर्शिका।"
            : "Interactive 2-sided flashcards with official portals, business ROI gains, readiness stage, and application checklists."
        }
      >
        <GovernmentInitiativesFlashcards currentLang={currentLang} />
      </Section>

      {/* 6. Interactive Digital Learning Flashcards */}
      {filteredFlashcards.length > 0 && (
        <Section
          title={currentLang === "hi" ? "डिजिटल लर्निंग फ्लैशकार्ड्स" : "Digital Capability Learning Flashcards"}
          subtitle={
            currentLang === "hi"
              ? "प्रत्येक डिजिटल तकनीक और उपकरण के 12-आयामी विवरण जानने के लिए कार्ड पर क्लिक करें।"
              : "Click any flashcard to open its deep-dive 12-attribute implementation guide."
          }
        >
          <div className="space-y-4">
            <Tabs
              items={flashcardTabs}
              activeId={flashcardLevelFilter}
              onChange={setFlashcardLevelFilter}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFlashcards.map((card) => (
                <Card
                  key={card.card_id}
                  variant="interactive"
                  onClick={() => setSelectedFlashcard(card)}
                  className="p-5 space-y-3 border-[#EDE2D8] bg-white hover:border-[#F0592A] hover:shadow-card transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#F0592A] bg-[#FFF4ED] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {card.topic}
                    </span>
                    <Badge variant="neutral" size="sm">
                      Level {card.target_level}
                    </Badge>
                  </div>

                  <h4 className="font-bold text-sm text-[#241C15] group-hover:text-[#F0592A] transition-colors">
                    {currentLang === "hi" ? card.title_hi : card.title_en}
                  </h4>

                  <p className="text-xs text-[#6B5D52] line-clamp-2 leading-relaxed">
                    {currentLang === "hi" ? card.what_is_it_hi : card.what_is_it_en}
                  </p>

                  <div className="pt-2 border-t border-[#EDE2D8] flex items-center justify-between text-xs text-[#9C8F84]">
                    <span className="capitalize">{card.complexity} complexity</span>
                    <span className="text-[#F0592A] font-bold group-hover:underline flex items-center gap-1">
                      {currentLang === "hi" ? "गाइड पढ़ें" : "View Guide"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* 7. Rating and Feedback Section (ALWAYS DISPLAYED & RESPONSIVE) */}
      <Section
        title={currentLang === "hi" ? "समीक्षा और रेटिंग" : "User Rating & Qualitative Feedback"}
        subtitle={
          currentLang === "hi"
            ? "बताएं कि डिजीमित्र ने आपके व्यवसाय को कैसे लाभ पहुंचाया और क्या सुधार चाहिए।"
            : "Share your rating and questionnaire feedback to help us refine DigiMitra for small enterprises across India."
        }
      >
        <FeedbackRatingSection
          currentLang={currentLang}
          businessName={currentBiz?.name}
          sourcePage="roadmap"
        />
      </Section>

      {/* 8. Roadmap Version History Card */}
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

      {/* Learning Flashcard Detail Modal */}
      {selectedFlashcard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#EDE2D8]">
            <div className="p-6 border-b border-[#EDE2D8] flex items-start justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold text-[#F0592A] bg-[#FFF4ED] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {selectedFlashcard.topic}
                  </span>
                  <Badge variant="neutral" size="sm">
                    Level {selectedFlashcard.target_level}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {selectedFlashcard.complexity}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-[#241C15]">
                  {currentLang === "hi" ? selectedFlashcard.title_hi : selectedFlashcard.title_en}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFlashcard(null)}
                className="p-1.5 rounded-lg text-[#9C8F84] hover:text-[#241C15] hover:bg-[#FAF7F4] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#FAF7F4] border border-[#EDE2D8] space-y-1">
                  <span className="text-xs font-bold text-[#8C4A26] uppercase">
                    {currentLang === "hi" ? "1. यह क्या है?" : "1. What is it?"}
                  </span>
                  <p className="text-xs text-[#241C15] leading-relaxed">
                    {currentLang === "hi" ? selectedFlashcard.what_is_it_hi : selectedFlashcard.what_is_it_en}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#FFF9F5] border border-[#F0592A]/20 space-y-1">
                  <span className="text-xs font-bold text-[#F0592A] uppercase">
                    {currentLang === "hi" ? "2. यह क्यों महत्वपूर्ण है?" : "2. Why it matters?"}
                  </span>
                  <p className="text-xs text-[#241C15] leading-relaxed">
                    {currentLang === "hi" ? selectedFlashcard.why_matters_hi : selectedFlashcard.why_matters_en}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs space-y-1">
                  <span className="font-bold text-[#241C15]">
                    {currentLang === "hi" ? "3. किसे इसकी आवश्यकता है?" : "3. Who Needs It:"}
                  </span>
                  <p className="text-xs text-[#6B5D52]">
                    {currentLang === "hi" ? selectedFlashcard.who_needs_it_hi : selectedFlashcard.who_needs_it_en}
                  </p>
                </div>
                <div className="text-xs space-y-1">
                  <span className="font-bold text-[#241C15]">
                    {currentLang === "hi" ? "4. इसे कब अपनाएं?" : "4. When to Adopt:"}
                  </span>
                  <p className="text-xs text-[#6B5D52]">
                    {currentLang === "hi" ? selectedFlashcard.when_to_adopt_hi : selectedFlashcard.when_to_adopt_en}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-xs text-[#241C15] block">
                  {currentLang === "hi" ? "5. पूर्व-आवश्यकताएं (Prerequisites):" : "5. Prerequisites Checklist:"}
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(currentLang === "hi" ? selectedFlashcard.prerequisites_hi : selectedFlashcard.prerequisites_en).map((req, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-[#6B5D52] bg-[#FAF7F4] p-2 rounded-lg border border-[#EDE2D8]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F0592A] flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-bold text-xs text-[#241C15] block">
                  {currentLang === "hi" ? "6. चरणबद्ध कार्यान्वयन चरण:" : "6. Step-by-Step Implementation:"}
                </span>
                <div className="space-y-2">
                  {(currentLang === "hi" ? selectedFlashcard.implementation_steps_hi : selectedFlashcard.implementation_steps_en).map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs text-[#241C15] p-2.5 rounded-lg bg-white border border-[#EDE2D8]">
                      <span className="w-5 h-5 rounded-full bg-[#FFF4ED] text-[#F0592A] font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-[#EDE2D8] bg-[#FAF7F4] flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => setSelectedFlashcard(null)}
                  className="bg-[#F0592A] hover:bg-[#D9481C] text-white"
                >
                  {currentLang === "hi" ? "समझ गया / बंद करें" : "Understood / Close Guide"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title="My DigiMitra Digitalization Roadmap"
        description="Check out my customized phased digitalization roadmap on DigiMitra!"
        shareUrl={window?.location?.href || "http://localhost:5173/roadmap"}
        currentLang={currentLang}
      />

      {/* In-App Video Walkthrough Modal */}
      <WalkthroughVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        currentLang={currentLang}
      />
    </div>
  );
};
