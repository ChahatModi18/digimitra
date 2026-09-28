import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Sparkles,
  MapPin,
  Compass,
  PlusCircle,
  Store,
  Calculator,
  Sliders,
  CheckCircle,
} from "lucide-react";
import { fetchBusinesses, createBusiness, CreateBusinessPayload } from "../api/businesses";
import { Business } from "../types";
import { useAuth } from "../context/AuthContext";
import {
  INDIAN_STATES_AND_UTS,
  MSME_SECTORS,
} from "../data/msmeTaxonomy";
import {
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  Badge,
  Alert,
  EmptyState,
  LoadingState,
  Section,
  MsmeClassificationCalculator,
} from "../components";

export const BusinessRegistration: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeBusinessId, setActiveBusinessId } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [sizeInputMode, setSizeInputMode] = useState<"preset" | "calculator">("preset");
  const [showStandaloneCalculator, setShowStandaloneCalculator] = useState(false);

  const [formData, setFormData] = useState<CreateBusinessPayload>({
    name: "",
    sector: "Retail & Trade",
    enterprise_size: "Micro",
    state: "Maharashtra",
    city: "Mumbai",
    pincode: "400001",
    description: "",
    primary_language: "en",
  });

  const [customCity, setCustomCity] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch registered businesses
  const {
    data: businesses = [],
    isLoading,
  } = useQuery<Business[]>({
    queryKey: ["businesses"],
    queryFn: fetchBusinesses,
  });

  // Auto-set active business if not set
  React.useEffect(() => {
    if (businesses.length > 0 && !activeBusinessId) {
      setActiveBusinessId(businesses[0].id);
    }
  }, [businesses, activeBusinessId, setActiveBusinessId]);

  // Current state object
  const selectedStateObj =
    INDIAN_STATES_AND_UTS.find((s) => s.nameEn === formData.state) ||
    INDIAN_STATES_AND_UTS[13]; // Default Maharashtra

  // Create Business Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateBusinessPayload) => createBusiness(payload),
    onSuccess: (newBiz) => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      setActiveBusinessId(newBiz.id);
      setShowForm(false);
      setFormData({
        name: "",
        sector: "Retail & Trade",
        enterprise_size: "Micro",
        state: "Maharashtra",
        city: "Mumbai",
        pincode: "400001",
        description: "",
        primary_language: "en",
      });
    },
    onError: (err: any) => {
      const msg =
        err?.message ||
        (Array.isArray(err?.details)
          ? err.details.map((d: any) => `${d.loc?.join(".")}: ${d.msg}`).join(", ")
          : "Failed to register enterprise. Please check all fields.");
      setErrorMessage(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!formData.name.trim()) {
      setErrorMessage(
        currentLang === "hi"
          ? "उद्यम का नाम आवश्यक है।"
          : "Enterprise name is required."
      );
      return;
    }
    createMutation.mutate(formData);
  };

  const activeBiz = businesses.find((b) => b.id === activeBusinessId) || businesses[0];

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 animate-fadeIn pb-16">
      {/* 1. Standard Page Header */}
      <PageHeader
        icon={<Building2 className="w-8 h-8" />}
        title={t("business.title")}
        subtitle={t("business.subtitle")}
        badge={
          <Badge variant="brand" size="sm">
            {currentLang === "hi" ? "एमएसएमई डायरेक्टरी" : "MSME Directory"}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowStandaloneCalculator(!showStandaloneCalculator)}
              leftIcon={<Calculator className="w-4 h-4 text-orange-600" />}
            >
              {showStandaloneCalculator
                ? currentLang === "hi"
                  ? "कैलकुलेटर छिपाएं"
                  : "Hide Calculator"
                : currentLang === "hi"
                ? "टर्नओवर कैलकुलेटर"
                : "MSME Calculator"}
            </Button>

            <Button
              variant={showForm ? "secondary" : "primary"}
              size="md"
              onClick={() => setShowForm(!showForm)}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              {showForm
                ? currentLang === "hi"
                  ? "पंजीकृत उद्यम देखें"
                  : "View Enterprises"
                : currentLang === "hi"
                ? "+ नया उद्यम जोड़ें"
                : "+ Add Enterprise"}
            </Button>
          </div>
        }
      />

      {errorMessage && (
        <Alert type="error" onDismiss={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* Standalone MSME Eligibility Calculator Tool */}
      {showStandaloneCalculator && (
        <Card variant="default" className="p-6 space-y-4 border-2 border-orange-200">
          <MsmeClassificationCalculator
            compact={false}
            onSelectCategory={(cat) => {
              setFormData((prev) => ({ ...prev, enterprise_size: cat }));
              setShowForm(true);
              setShowStandaloneCalculator(false);
            }}
          />
        </Card>
      )}

      {/* 2. Active Business Highlight Card */}
      {activeBiz && !showForm && (
        <Card variant="gradient-orange" className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" dot>
                  {currentLang === "hi" ? "सक्रिय उद्यम (Active)" : "Active Enterprise"}
                </Badge>
                <span className="text-xs text-orange-700 font-mono font-bold">
                  ID #{activeBiz.id}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {activeBiz.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-stone-600">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  {activeBiz.city}, {activeBiz.state}{" "}
                  {activeBiz.pincode ? `(${activeBiz.pincode})` : ""}
                </span>
                <span className="text-stone-300">•</span>
                <span className="font-semibold text-stone-800">{activeBiz.sector}</span>
                <span className="text-stone-300">•</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 font-bold text-orange-700">
                  {activeBiz.enterprise_size} Enterprise
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate("/assessment")}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {currentLang === "hi" ? "मूल्यांकन शुरू करें" : "Take Assessment"}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate("/roadmap")}
                leftIcon={<Compass className="w-4 h-4 text-orange-600" />}
              >
                {currentLang === "hi" ? "रोडमैप देखें" : "View Roadmap"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 3. Enterprise Registration Form */}
      {(showForm || (!isLoading && businesses.length === 0)) && (
        <Card variant="default" className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <div className="flex items-center gap-2.5">
              <Store className="w-5 h-5 text-orange-600" />
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-heading leading-tight">
                  {t("business.form_title")}
                </h3>
                <p className="text-xs text-stone-500">
                  {currentLang === "hi"
                    ? "सटीक जानकारी से आपका 14-प्रश्नों का डिजिटल रोडमैप कस्टमाइज़ होगा।"
                    : "Accurate profile info generates a tailor-made 14-question digital transformation plan."}
                </p>
              </div>
            </div>

            <Badge variant="brand" size="sm">
              MSME Form
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Business Name */}
              <div className="md:col-span-2">
                <Input
                  label={`${t("business.name")} *`}
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kirana & General Store / Sharma Auto Components"
                />
              </div>

              {/* Sector Dropdown (Comprehensive 30+ Indian MSME Sectors Alphabetically Arranged) */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center justify-between">
                  <span>{t("business.sector")} *</span>
                  <span className="text-[10px] text-stone-500 font-normal">
                    {MSME_SECTORS.length} {currentLang === "hi" ? "क्षेत्र उपलब्ध (A-Z)" : "Sectors Available (A-Z)"}
                  </span>
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full h-12 bg-white text-stone-900 text-sm rounded-xl px-4 border border-stone-200 hover:border-stone-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-xs font-medium"
                >
                  {[...MSME_SECTORS]
                    .sort((a, b) => {
                      const nameA = currentLang === "hi" ? a.nameHi : a.nameEn;
                      const nameB = currentLang === "hi" ? b.nameHi : b.nameEn;
                      return nameA.localeCompare(nameB);
                    })
                    .map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {currentLang === "hi" ? `${sec.nameHi} (${sec.id})` : sec.nameEn}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-stone-500 leading-tight">
                  {currentLang === "hi"
                    ? "उदाहरण: " +
                      (MSME_SECTORS.find((s) => s.id === formData.sector)?.examplesHi || "")
                    : "Examples: " +
                      (MSME_SECTORS.find((s) => s.id === formData.sector)?.examplesEn || "")}
                </p>
              </div>

              {/* State Dropdown (All 28 States & 8 UTs) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center justify-between">
                  <span>{t("business.state")} *</span>
                  <span className="text-[10px] text-stone-500 font-normal">
                    {INDIAN_STATES_AND_UTS.length} States & UTs
                  </span>
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => {
                    const newState = e.target.value;
                    const stObj = INDIAN_STATES_AND_UTS.find((s) => s.nameEn === newState);
                    setFormData({
                      ...formData,
                      state: newState,
                      city: stObj?.majorCities[0] || "",
                    });
                  }}
                  className="w-full h-12 bg-white text-stone-900 text-sm rounded-xl px-4 border border-stone-200 hover:border-stone-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-xs font-medium"
                >
                  <optgroup label="States / राज्य">
                    {INDIAN_STATES_AND_UTS.filter((s) => !s.isUT).map((st) => (
                      <option key={st.code} value={st.nameEn}>
                        {currentLang === "hi" ? `${st.nameHi} (${st.nameEn})` : st.nameEn}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Union Territories / केंद्र शासित प्रदेश">
                    {INDIAN_STATES_AND_UTS.filter((s) => s.isUT).map((st) => (
                      <option key={st.code} value={st.nameEn}>
                        {currentLang === "hi" ? `${st.nameHi} (${st.nameEn})` : st.nameEn}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* City Dropdown with Custom Fallback */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    {t("business.city")} *
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomCity(!customCity)}
                    className="text-[11px] text-orange-600 font-semibold hover:underline"
                  >
                    {customCity
                      ? currentLang === "hi"
                        ? "सूची से चुनें"
                        : "Select from list"
                      : currentLang === "hi"
                      ? "अन्य शहर लिखें"
                      : "Type custom city"}
                  </button>
                </div>

                {customCity ? (
                  <Input
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Kolhapur, Baddi, Moradabad"
                  />
                ) : (
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-12 bg-white text-stone-900 text-sm rounded-xl px-4 border border-stone-200 hover:border-stone-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-xs font-medium"
                  >
                    {selectedStateObj.majorCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* PIN Code */}
              <Input
                label={t("business.pincode")}
                value={formData.pincode || ""}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="e.g. 400001 (6 digits)"
              />

              {/* Preferred Language */}
              <Select
                label={t("business.language")}
                value={formData.primary_language}
                onChange={(e) =>
                  setFormData({ ...formData, primary_language: e.target.value })
                }
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </Select>

              {/* Enterprise Size & Turnover Section */}
              <div className="md:col-span-2 space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                      {t("business.size")} & Turnover Classification *
                    </label>
                    <p className="text-xs text-stone-500">
                      {currentLang === "hi"
                        ? "मानक श्रेणी चुनें या अपने टर्नओवर से सटीक एमएसएमई प्रकार निकालें"
                        : "Select standard category or calculate from exact turnover & investment"}
                    </p>
                  </div>

                  {/* Mode Toggle Button Group */}
                  <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold shrink-0">
                    <button
                      type="button"
                      onClick={() => setSizeInputMode("preset")}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                        sizeInputMode === "preset"
                          ? "bg-white text-stone-900 shadow-xs"
                          : "text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{currentLang === "hi" ? "मानक श्रेणी" : "Standard Preset"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSizeInputMode("calculator")}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                        sizeInputMode === "calculator"
                          ? "bg-white text-orange-700 shadow-xs"
                          : "text-stone-500 hover:text-stone-800"
                      }`}
                    >
                      <Calculator className="w-3.5 h-3.5 text-orange-600" />
                      <span>{currentLang === "hi" ? "कस्टम टर्नओवर जांचें" : "Custom Turnover Calculator"}</span>
                    </button>
                  </div>
                </div>

                {sizeInputMode === "preset" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        key: "Micro",
                        titleEn: "Micro Enterprise",
                        titleHi: "सूक्ष्म उद्यम (Micro)",
                        turnover: "Turnover ≤ ₹5 Cr",
                        investment: "Investment ≤ ₹1 Cr",
                        color: "border-emerald-300 bg-emerald-50/40",
                      },
                      {
                        key: "Small",
                        titleEn: "Small Enterprise",
                        titleHi: "लघु उद्यम (Small)",
                        turnover: "Turnover ≤ ₹50 Cr",
                        investment: "Investment ≤ ₹10 Cr",
                        color: "border-blue-300 bg-blue-50/40",
                      },
                      {
                        key: "Medium",
                        titleEn: "Medium Enterprise",
                        titleHi: "मध्यम उद्यम (Medium)",
                        turnover: "Turnover ≤ ₹250 Cr",
                        investment: "Investment ≤ ₹50 Cr",
                        color: "border-amber-300 bg-amber-50/40",
                      },
                    ].map((item) => {
                      const isSelected = formData.enterprise_size === item.key;
                      return (
                        <div
                          key={item.key}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              enterprise_size: item.key as "Micro" | "Small" | "Medium",
                            })
                          }
                          className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? "border-orange-600 bg-orange-50/60 shadow-xs"
                              : "border-stone-200 hover:border-stone-300 bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 text-sm">
                              {currentLang === "hi" ? item.titleHi : item.titleEn}
                            </span>
                            {isSelected && <CheckCircle className="w-4 h-4 text-orange-600" />}
                          </div>
                          <div className="text-[11px] text-stone-600 mt-1 space-y-0.5">
                            <p className="font-semibold text-stone-800">{item.turnover}</p>
                            <p className="text-stone-500">{item.investment}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="pt-1">
                    <MsmeClassificationCalculator
                      compact={true}
                      onSelectCategory={(cat) => {
                        setFormData({ ...formData, enterprise_size: cat });
                        setSizeInputMode("preset");
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  {t("business.description")}
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Retail grocery with home delivery, UPI payments, 4 staff members..."
                  className="w-full bg-white text-stone-900 text-sm rounded-xl px-4 py-2.5 border border-stone-200 hover:border-stone-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
              {businesses.length > 0 && (
                <Button variant="ghost" size="md" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={createMutation.isPending}
              >
                {t("business.submit")}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 4. Registered Enterprises Grid */}
      <Section
        title={`${t("business.list_title")} (${businesses.length})`}
        subtitle="Manage and switch between your registered MSME entities."
      >
        {isLoading ? (
          <LoadingState
            title="Loading enterprises..."
            description="Fetching your registered MSME entities"
          />
        ) : businesses.length === 0 ? (
          <EmptyState
            icon={<Store className="w-8 h-8" />}
            title={t("business.no_businesses")}
            description="Register your first MSME enterprise to begin the 14-question digital assessment."
            actionLabel="+ Register Enterprise"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {businesses.map((biz) => {
              const isActive = activeBusinessId === biz.id;

              return (
                <Card
                  key={biz.id}
                  variant={isActive ? "gradient-orange" : "default"}
                  className="p-6 space-y-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-orange-600 font-bold">
                            #{biz.id}
                          </span>
                          <h3 className="text-lg font-bold text-stone-900">{biz.name}</h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>
                            {biz.city}, {biz.state}{" "}
                            {biz.pincode ? `(${biz.pincode})` : ""}
                          </span>
                        </div>
                      </div>

                      {isActive ? (
                        <Badge variant="success" size="sm" dot>
                          {t("business.active_badge")}
                        </Badge>
                      ) : (
                        <button
                          onClick={() => setActiveBusinessId(biz.id)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition"
                        >
                          {t("business.select_active")}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                        {biz.sector || "Retail"}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
                        {biz.enterprise_size} Enterprise
                      </span>
                    </div>

                    {biz.description && (
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {biz.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setActiveBusinessId(biz.id);
                        navigate("/assessment");
                      }}
                      leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                      className="flex-1"
                    >
                      {currentLang === "hi" ? "मूल्यांकन करें" : "Take Assessment"}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setActiveBusinessId(biz.id);
                        navigate("/roadmap");
                      }}
                      leftIcon={<Compass className="w-3.5 h-3.5 text-orange-600" />}
                      className="flex-1"
                    >
                      {currentLang === "hi" ? "रोडमैप देखें" : "View Roadmap"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
};
