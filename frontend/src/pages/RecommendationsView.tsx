import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  ArrowRight,
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
  RecommendationCard,
  Tabs,
  EmptyState,
  LoadingState,
  Section,
  Badge,
  Button,
} from "../components";

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

  const effectiveBizId = activeBusinessId || (businesses.length > 0 ? businesses[0].id : null);

  // Fetch recommendations
  const {
    data: recData,
    isLoading: isLoadingRecs,
    error: recError,
  } = useQuery({
    queryKey: ["businessRecommendations", effectiveBizId],
    queryFn: () => getBusinessRecommendations(effectiveBizId!),
    enabled: !!effectiveBizId,
  });

  const recommendations: BusinessRecommendationItem[] = recData?.recommendations || [];

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

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 animate-fadeIn pb-16">
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
          businesses.length > 0 && (
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-stone-500" />
              <select
                value={activeBusinessId || ""}
                onChange={(e) => setActiveBusinessId(Number(e.target.value))}
                className="bg-white text-stone-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold shadow-xs"
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

      {isLoadingBiz || isLoadingRecs ? (
        <LoadingState
          title="Loading recommendations..."
          description="Synthesizing deterministic guidance from your assessment scores"
        />
      ) : recError || !recData || recommendations.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-8 h-8 text-orange-600" />}
          title="No Recommendations Available"
          description="Complete a digital assessment for this enterprise to generate customized, prioritized digital transformation recommendations."
          actionLabel="Start Digital Assessment →"
          onAction={() => navigate("/assessment")}
        />
      ) : (
        <>
          {/* 2. Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              label="Current RBDL Level"
              value={`Level ${recData.current_rbdl_level}`}
              subtitle={`Targeting Level ${recData.target_rbdl_level} Capability`}
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
        </>
      )}
    </div>
  );
};
