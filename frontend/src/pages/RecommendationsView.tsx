import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  Compass,
  Zap,
} from "lucide-react";
import { fetchBusinesses } from "../api/businesses";
import { getBusinessRecommendations, BusinessRecommendationItem } from "../api/roadmap";
import { Business } from "../types";
import { useAuth } from "../context/AuthContext";
import {
  PageHeader,
  StatCard,
  Card,
  RecommendationCard,
  Tabs,
  LoadingState,
  Section,
  Badge,
  Button,
} from "../components";

const SAMPLE_RECOMMENDATIONS: BusinessRecommendationItem[] = [
  {
    id: 8001,
    business_id: 1,
    classification_result_id: 1,
    recommendation_id: 1,
    target_rbdl_level: 2,
    rank_order: 1,
    status: "recommended",
    generated_at: "2026-09-30T00:00:00Z",
    recommendation_code: "REC-UPISOUND",
    title_en: "UPI Standee with Voice Alert Box",
    title_hi: "साउंड बॉक्स के साथ यूपीआई क्यूआर स्टैंडी",
    description_en: "Deploy instant audio notification speaker for retail counters to eliminate payment screenshot fraud.",
    description_hi: "भीड़ के समय फर्जी स्क्रीनशॉट से बचने के लिए तुरंत ध्वनि अलर्ट वाला यूपीआई साउंड बॉक्स लगाएं।",
    reason_en: "Zero setup friction, protects daily cash revenue instantly.",
    reason_hi: "आसान शुरुआत, दैनिक नकद प्रवाह की सुरक्षा।",
    dimension_code: "payments",
    priority_score: 9.5,
    impact_level: "HIGH",
    estimated_effort_level: "LOW",
    estimated_cost_level: "LOW",
    feasibility_status: "FEASIBLE",
    budget_fit: "WITHIN_BUDGET",
  },
  {
    id: 8002,
    business_id: 1,
    classification_result_id: 1,
    recommendation_id: 2,
    target_rbdl_level: 2,
    rank_order: 2,
    status: "recommended",
    generated_at: "2026-09-30T00:00:00Z",
    recommendation_code: "REC-KHATABOOK",
    title_en: "Digital Ledger & Credit Reminders (Khatabook)",
    title_hi: "डिजिटल खाता-बही और एसएमएस तकादा (खाताबुक)",
    description_en: "Track customer balances and auto-send WhatsApp payment reminders to recover pending receivables 4x faster.",
    description_hi: "ग्राहक उधारी और बहीखाते को डिजिटल बनाएं और स्वचालित एसएमएस तकादा भेजकर 4 गुना तेज वसूली करें।",
    reason_en: "Directly solves working capital delays common in micro enterprises.",
    reason_hi: "सूक्ष्म उद्यमों में कार्यशील पूंजी की रुकावट दूर करता है।",
    dimension_code: "bookkeeping",
    priority_score: 9.1,
    impact_level: "HIGH",
    estimated_effort_level: "LOW",
    estimated_cost_level: "LOW",
    feasibility_status: "FEASIBLE",
    budget_fit: "WITHIN_BUDGET",
  },
  {
    id: 8003,
    business_id: 1,
    classification_result_id: 1,
    recommendation_id: 3,
    target_rbdl_level: 2,
    rank_order: 3,
    status: "recommended",
    generated_at: "2026-09-30T00:00:00Z",
    recommendation_code: "REC-GOOGLEBIZ",
    title_en: "Google Business Profile & Local Search Presence",
    title_hi: "गूगल बिजनेस प्रोफाइल और स्थानीय खोज उपस्थिति",
    description_en: "Register and verify storefront with opening hours, photos, and WhatsApp inquiry button on Google Maps.",
    description_hi: "दुकान के फोटो, समय और संपर्क के साथ गूगल मैप्स पर पंजीकृत करें ताकि ग्राहक आसानी से खोज सकें।",
    reason_en: "Zero-cost discovery by nearby smartphone shoppers.",
    reason_hi: "नजदीकी ग्राहकों द्वारा बिना लागत के दुकान खोजे जाने की सुविधा।",
    dimension_code: "online_presence",
    priority_score: 8.8,
    impact_level: "HIGH",
    estimated_effort_level: "LOW",
    estimated_cost_level: "ZERO",
    feasibility_status: "FEASIBLE",
    budget_fit: "WITHIN_BUDGET",
  },
  {
    id: 8004,
    business_id: 1,
    classification_result_id: 1,
    recommendation_id: 4,
    target_rbdl_level: 2,
    rank_order: 4,
    status: "recommended",
    generated_at: "2026-09-30T00:00:00Z",
    recommendation_code: "REC-ONDC",
    title_en: "Open Network for Digital Commerce (ONDC) Onboarding",
    title_hi: "ओएनडीसी (ONDC) सेलर ऐप पंजीकरण एवं डिजिटल कैटलॉग",
    description_en: "List catalog on open e-commerce network to get discoverable across buyer apps without high commissions.",
    description_hi: "ओएनडीसी नेटवर्क पर अपने उत्पादों को सूचीबद्ध करें ताकि पूरे शहर से कम कमीशन में ऑनलाइन ऑर्डर मिल सकें।",
    reason_en: "Expands direct customer reach beyond physical neighborhood.",
    reason_hi: "स्थानीय सीमा से आगे बढ़कर नए ऑनलाइन ग्राहकों तक सीधी पहुंच।",
    dimension_code: "marketplaces",
    priority_score: 8.4,
    impact_level: "HIGH",
    estimated_effort_level: "MEDIUM",
    estimated_cost_level: "LOW",
    feasibility_status: "FEASIBLE",
    budget_fit: "WITHIN_BUDGET",
  },
];

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

  const preferredBusiness =
    businesses.find((b) => b.id === activeBusinessId) ||
    businesses.find((b) => b.id === 162) ||
    businesses.find((b) => b.id === 319) ||
    (businesses.length > 0 ? businesses[0] : null);

  const effectiveBizId = preferredBusiness ? preferredBusiness.id : null;

  // Fetch recommendations
  const {
    data: recData,
    isLoading: isLoadingRecs,
  } = useQuery({
    queryKey: ["businessRecommendations", effectiveBizId],
    queryFn: () => getBusinessRecommendations(effectiveBizId!),
    enabled: !!effectiveBizId,
    retry: false,
  });

  const isSampleRecs = !recData || !recData.recommendations || recData.recommendations.length === 0;
  const recommendations: BusinessRecommendationItem[] = isSampleRecs
    ? SAMPLE_RECOMMENDATIONS
    : recData.recommendations;
  const currentLevel = recData?.current_rbdl_level ?? 1;
  const targetLevel = recData?.target_rbdl_level ?? 2;

  const filteredRecs = React.useMemo(() => {
    if (selectedDimension === "all") return recommendations;
    return recommendations.filter((r) => r.dimension_code === selectedDimension);
  }, [recommendations, selectedDimension]);

  const uniqueDimensions = Array.from(
    new Set(recommendations.map((r) => r.dimension_code).filter(Boolean))
  ) as string[];

  const filterTabs = [
    { id: "all", label: currentLang === "hi" ? "सभी आयाम" : "All Dimensions", count: recommendations.length },
    ...uniqueDimensions.map((dim) => ({
      id: dim,
      label: dim.replace("_", " ").toUpperCase(),
      count: recommendations.filter((r) => r.dimension_code === dim).length,
    })),
  ];

  const handleBackToDashboard = () => {
    navigate("/");
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 animate-fadeIn pb-16">
      {/* 0. Top Breadcrumbs & Back to Dashboard */}
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
            {currentLang === "hi" ? "डिजिटल सिफारिशें" : "Personalized Recommendations"}
          </span>
        </div>

        <button
          onClick={() => navigate("/roadmap")}
          className="text-xs font-bold text-[#F0592A] hover:underline flex items-center gap-1"
        >
          <span>{currentLang === "hi" ? "रोडमैप देखें" : "View Phased Roadmap"}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 1. Standard Page Header */}
      <PageHeader
        icon={<Sparkles className="w-8 h-8 text-orange-600" />}
        badge={<Badge variant="brand" size="sm">Deterministic Recommendations</Badge>}
        title={currentLang === "hi" ? "व्यक्तिगत डिजिटल अनुशंसाएं" : "Personalized Recommendations"}
        subtitle={
          currentLang === "hi"
            ? "प्राथमिकता स्कोर (प्रभाव, लागत, साध्यता) द्वारा क्रमित डिजिटल कार्य।"
            : "Deterministic priority ranking tailored to your enterprise scale, gaps, and readiness."
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

            {businesses.length > 0 && (
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-stone-500" />
                <select
                  value={effectiveBizId || ""}
                  onChange={(e) => setActiveBusinessId(Number(e.target.value))}
                  className="bg-white text-stone-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold shadow-xs"
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

      {/* Informative Sample Banner when displaying demonstration recommendations */}
      {isSampleRecs && (
        <Card
          variant="default"
          className="p-5 bg-gradient-to-r from-orange-50/90 via-amber-50/70 to-white border border-orange-200/90 shadow-xs space-y-3"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-orange-100 text-orange-600 shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning" size="sm">
                    Interactive Sample Recommendations
                  </Badge>
                  <span className="text-xs font-bold text-[#6B5D52]">
                    Enterprise: {preferredBusiness?.name || "Selected Enterprise"}
                  </span>
                </div>
                <p className="text-xs text-[#6B5D52] font-medium mt-1 max-w-xl">
                  {currentLang === "hi"
                    ? `नीचे स्तर 1 से 2 के लिए उच्च-प्राथमिकता डिजिटल सुझाव दिखाए गए हैं। अपने उद्यम के अनुकूलित सुझावों के लिए 3 मिनट का मूल्यांकन करें।`
                    : `Currently displaying deterministic Level 1 → Level 2 recommendations. Complete your 3-minute diagnostic assessment to lock in tailored guidance for "${preferredBusiness?.name || "this enterprise"}".`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/assessment")}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="shadow-sm"
              >
                {currentLang === "hi" ? "मूल्यांकन शुरू करें →" : "Start Assessment →"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {isLoadingBiz || isLoadingRecs ? (
        <LoadingState
          title="Loading recommendations..."
          description="Synthesizing deterministic guidance from your assessment scores"
        />
      ) : (
        <>
          {/* 2. Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              label="Current RBDL Level"
              value={`Level ${currentLevel}`}
              subtitle={`Targeting Level ${targetLevel} Capability`}
              icon={<Zap className="w-4 h-4 text-orange-600" />}
              variant="brand"
            />

            <StatCard
              label="Recommended Milestones"
              value={`${recommendations.length} Actions`}
              subtitle="Gated by 1-level-up prerequisite rules"
              icon={<Sparkles className="w-4 h-4 text-emerald-600" />}
              variant="emerald"
            />

            <StatCard
              label="Roadmap Execution"
              value="Phased Plan"
              subtitle="Quick Wins → Core Steps → Long Term"
              icon={<Compass className="w-4 h-4 text-amber-600" />}
              variant="amber"
            />
          </div>

          {/* 3. Filter Tabs */}
          {uniqueDimensions.length > 1 && (
            <div className="space-y-2">
              <Tabs
                items={filterTabs}
                activeId={selectedDimension}
                onChange={setSelectedDimension}
                variant="pills"
              />
            </div>
          )}

          {/* 4. Recommendations Cards Grid */}
          <Section
            title={`${currentLang === "hi" ? "अनुशंसित कार्य" : "Prioritized Recommendations"} (${filteredRecs.length})`}
            subtitle="Sorted strictly by algorithmic priority score based on impact, effort, and cost."
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/roadmap")}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                className="shadow-orange-glow"
              >
                View Phased Roadmap
              </Button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredRecs.map((rec) => {
                const targetCat = (() => {
                  switch (rec.dimension_code?.toLowerCase()) {
                    case "payments":
                    case "banking":
                      return "payments";
                    case "records":
                      return "accounting";
                    case "presence":
                    case "inventory":
                      return "website";
                    case "comms":
                      return "marketing";
                    case "literacy":
                      return "training";
                    case "infra":
                    case "automation":
                      return "infrastructure";
                    case "security":
                      return "security";
                    default:
                      return "";
                  }
                })();

                return (
                  <RecommendationCard
                    key={rec.id}
                    code={rec.recommendation_code}
                    titleEn={rec.title_en}
                    titleHi={rec.title_hi}
                    descriptionEn={rec.description_en}
                    descriptionHi={rec.description_hi}
                    reasonEn={rec.reason_en}
                    reasonHi={rec.reason_hi}
                    dimensionCode={rec.dimension_code}
                    priorityScore={rec.priority_score}
                    impactLevel={rec.impact_level}
                    effortLevel={(rec as any).effort_level || rec.estimated_effort_level}
                    costLevel={rec.estimated_cost_level}
                    feasibilityStatus={rec.feasibility_status}
                    budgetFit={rec.budget_fit}
                    traceabilityJson={rec.traceability_json}
                    currentLang={currentLang}
                    onAction={() => navigate("/roadmap")}
                    actionLabel={currentLang === "hi" ? "रोडमैप में देखें →" : "View in Roadmap →"}

                    onExplore={() =>
                      navigate(targetCat ? `/explore?category=${targetCat}` : "/explore")
                    }
                    exploreLabel={currentLang === "hi" ? "स्थानीय मदद खोजें" : "Find Local Help"}
                  />
                );
              })}
            </div>
          </Section>

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
                onClick={() => navigate("/roadmap")}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-[#F0592A] text-white hover:bg-[#D9481E] shadow-sm transition"
              >
                <span>{currentLang === "hi" ? "रूपांतरण रोडमैप देखें →" : "View Phased Roadmap →"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
