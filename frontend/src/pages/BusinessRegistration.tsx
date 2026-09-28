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
  Mail,
  Phone,
  User,
  DollarSign,
  Target,
  Briefcase,
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

export const QUEENS_BOOK_WORLD_SAMPLE: CreateBusinessPayload = {
  name: "Queen's Book World",
  sector: "Retail & Trade",
  business_type: "Bookstore & Stationery Shop",
  sub_category: "Books, Stationery & Educational Supplies",
  owner_name: "Neha Sharma",
  year_established: 2018,
  years_in_operation: 8,
  enterprise_size: "Small",
  employee_count: 4,
  state: "Rajasthan",
  city: "Jaipur",
  area_locality: "Mansarovar",
  business_address: "123, Shipra Path, Mansarovar, Jaipur, Rajasthan – 302020",
  pincode: "302020",
  contact_phone: "+91 98765 43210",
  contact_email: "queensbookworld@example.com",
  website: "Not available",
  primary_language: "hi",
  additional_language: "en",
  business_model: "Offline retail",
  target_customers: "Students, parents, teachers and local residents",
  monthly_revenue: "₹2,00,000–₹3,00,000",
  digitalization_goal: "Increase sales and attract more local customers",
  description: "Bookstore & stationery shop offering educational supplies, textbooks, and reading materials in Mansarovar, Jaipur.",
};

const INITIAL_FORM_STATE: CreateBusinessPayload = {
  name: "",
  sector: "Retail & Trade",
  business_type: "",
  sub_category: "",
  owner_name: "",
  year_established: undefined,
  years_in_operation: undefined,
  enterprise_size: "Micro",
  employee_count: undefined,
  state: "Maharashtra",
  city: "Mumbai",
  area_locality: "",
  business_address: "",
  pincode: "400001",
  contact_phone: "",
  contact_email: "",
  website: "",
  primary_language: "en",
  additional_language: "hi",
  business_model: "Offline retail",
  target_customers: "",
  monthly_revenue: "₹1,00,000–₹2,00,000",
  digitalization_goal: "Increase local footfall and digital sales",
  description: "",
};

export const BusinessRegistration: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeBusinessId, setActiveBusinessId } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [sizeInputMode, setSizeInputMode] = useState<"preset" | "calculator">("preset");
  const [showStandaloneCalculator, setShowStandaloneCalculator] = useState(false);

  const [formData, setFormData] = useState<CreateBusinessPayload>(INITIAL_FORM_STATE);

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
    INDIAN_STATES_AND_UTS.find((s) => s.nameEn === "Rajasthan") ||
    INDIAN_STATES_AND_UTS[0];

  // Create Business Mutation
  const createMutation = useMutation({
    mutationFn: (payload: CreateBusinessPayload) => createBusiness(payload),
    onSuccess: (newBiz) => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      setActiveBusinessId(newBiz.id);
      setShowForm(false);
      setFormData(INITIAL_FORM_STATE);
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

  const handleLoadSample = () => {
    setFormData({ ...QUEENS_BOOK_WORLD_SAMPLE });
    setCustomCity(false);
    setShowForm(true);
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
              variant="outline"
              size="md"
              onClick={handleLoadSample}
              leftIcon={<Sparkles className="w-4 h-4 text-orange-600" />}
              className="border-orange-300 hover:border-orange-500 bg-orange-50/50 text-orange-800"
            >
              {currentLang === "hi" ? "नमूना प्रोफ़ाइल भरें (Queen's Book World)" : "Fill Sample (Queen's Book World)"}
            </Button>

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
        <Card variant="gradient-orange" className="p-6 sm:p-8 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success" size="sm" dot>
                  {currentLang === "hi" ? "सक्रिय उद्यम (Active)" : "Active Enterprise"}
                </Badge>
                <span className="text-xs text-orange-700 font-mono font-bold">
                  ID #{activeBiz.id}
                </span>
                {activeBiz.business_type && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100/80 text-orange-800 font-medium">
                    {activeBiz.business_type}
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                  {activeBiz.name}
                </h2>
                {activeBiz.owner_name && (
                  <p className="text-xs font-semibold text-stone-700 mt-0.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-orange-600" />
                    <span>{currentLang === "hi" ? "स्वामी / संचालक:" : "Owner:"} {activeBiz.owner_name}</span>
                    {activeBiz.year_established && (
                      <span className="text-stone-400 font-normal">
                        (Est. {activeBiz.year_established})
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>
                    {activeBiz.area_locality ? `${activeBiz.area_locality}, ` : ""}
                    {activeBiz.city}, {activeBiz.state}{" "}
                    {activeBiz.pincode ? `– ${activeBiz.pincode}` : ""}
                  </span>
                </div>

                {activeBiz.contact_email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span className="font-mono text-stone-800">{activeBiz.contact_email}</span>
                  </div>
                )}

                {activeBiz.contact_phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>{activeBiz.contact_phone}</span>
                  </div>
                )}

                {activeBiz.monthly_revenue && (
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    <span>{currentLang === "hi" ? "मासिक राजस्व:" : "Monthly Rev:"} {activeBiz.monthly_revenue}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 font-semibold text-stone-800">
                  {activeBiz.sector}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 font-bold text-orange-700">
                  {activeBiz.enterprise_size} Enterprise
                </span>
                {activeBiz.employee_count !== undefined && (
                  <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700">
                    👥 {activeBiz.employee_count} {currentLang === "hi" ? "कर्मचारी" : "Employees"}
                  </span>
                )}
                {activeBiz.business_model && (
                  <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700">
                    🏢 {activeBiz.business_model}
                  </span>
                )}
              </div>

              {activeBiz.digitalization_goal && (
                <div className="text-xs bg-white/70 border border-orange-200 rounded-lg p-2.5 text-stone-700 mt-2">
                  <span className="font-bold text-orange-800 mr-1">🎯 {currentLang === "hi" ? "डिजिटल लक्ष्य:" : "Digital Goal:"}</span>
                  {activeBiz.digitalization_goal}
                </div>
              )}
            </div>

            <div className="flex flex-row lg:flex-col items-stretch gap-2.5 shrink-0 pt-2 lg:pt-0">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate("/assessment")}
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="flex-1"
              >
                {currentLang === "hi" ? "मूल्यांकन शुरू करें" : "Take Assessment"}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate("/roadmap")}
                leftIcon={<Compass className="w-4 h-4 text-orange-600" />}
                className="flex-1"
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div className="flex items-center gap-2.5">
              <Store className="w-5 h-5 text-orange-600 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-heading leading-tight">
                  {t("business.form_title")}
                </h3>
                <p className="text-xs text-stone-500">
                  {currentLang === "hi"
                    ? "सटीक जानकारी से आपका 14-प्रश्नों का डिजिटल रोडमैप और संपर्क रिकॉर्ड सुरक्षित रहेगा।"
                    : "Accurate enterprise & contact records power tailored 14-question assessments and roadmap recommendations."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadSample}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-orange-600" />}
                className="text-xs border-orange-300 bg-orange-50/50 hover:bg-orange-100"
              >
                {currentLang === "hi" ? "लोड: Queen's Book World" : "Auto-fill Queen's Book World"}
              </Button>
              <Badge variant="brand" size="sm">
                MSME Form
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Business Identity & Category */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-stone-800 font-bold text-sm border-b border-stone-100 pb-2">
                <Store className="w-4 h-4 text-orange-600" />
                <span>1. {currentLang === "hi" ? "उद्यम का नाम और श्रेणी" : "Enterprise Identity & Category"}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Business Name */}
                <div className="md:col-span-2">
                  <Input
                    label={`${t("business.name")} *`}
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kirana & General Store / Queen's Book World"
                  />
                </div>

                {/* Sector Dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center justify-between">
                    <span>{t("business.sector")} *</span>
                    <span className="text-[10px] text-stone-500 font-normal">
                      {MSME_SECTORS.length} {currentLang === "hi" ? "क्षेत्र उपलब्ध (A-Z)" : "Sectors (A-Z)"}
                    </span>
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full h-11 bg-white text-stone-900 text-sm rounded-xl px-4 border border-stone-200 hover:border-stone-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-xs font-medium"
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
                </div>

                {/* Business Type */}
                <Input
                  label={currentLang === "hi" ? "व्यापार प्रकार (Business Type)" : "Business Type"}
                  value={formData.business_type || ""}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                  placeholder="e.g. Bookstore & Stationery Shop"
                />

                {/* Sub-category */}
                <Input
                  label={currentLang === "hi" ? "उप-श्रेणी (Sub-category)" : "Sub-category"}
                  value={formData.sub_category || ""}
                  onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                  placeholder="e.g. Books, Stationery & Educational Supplies"
                />

                {/* Owner Name */}
                <Input
                  label={currentLang === "hi" ? "संचालक / स्वामी का नाम (Owner Name)" : "Owner Name"}
                  value={formData.owner_name || ""}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  placeholder="e.g. Neha Sharma"
                />

                {/* Year Established */}
                <Input
                  type="number"
                  label={currentLang === "hi" ? "स्थापना वर्ष (Year Established)" : "Year Established"}
                  value={formData.year_established ? String(formData.year_established) : ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year_established: e.target.value ? parseInt(e.target.value, 10) : undefined,
                      years_in_operation: e.target.value ? Math.max(1, new Date().getFullYear() - parseInt(e.target.value, 10)) : undefined,
                    })
                  }
                  placeholder="e.g. 2018"
                />
              </div>
            </div>

            {/* Section 2: Scale, Employees & Operations */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-stone-800 font-bold text-sm border-b border-stone-100 pb-2">
                <Briefcase className="w-4 h-4 text-orange-600" />
                <span>2. {currentLang === "hi" ? "उद्यम का आकार, कर्मचारी और राजस्व" : "Business Scale, Operations & Revenue"}</span>
              </div>

              {/* Enterprise Size & Turnover Section */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                      {t("business.size")} & Turnover Classification *
                    </label>
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
                      <span>{currentLang === "hi" ? "कस्टम टर्नओवर जांचें" : "Turnover Calculator"}</span>
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
                      },
                      {
                        key: "Small",
                        titleEn: "Small Enterprise",
                        titleHi: "लघु उद्यम (Small)",
                        turnover: "Turnover ≤ ₹50 Cr",
                        investment: "Investment ≤ ₹10 Cr",
                      },
                      {
                        key: "Medium",
                        titleEn: "Medium Enterprise",
                        titleHi: "मध्यम उद्यम (Medium)",
                        turnover: "Turnover ≤ ₹250 Cr",
                        investment: "Investment ≤ ₹50 Cr",
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {/* Number of Employees */}
                <Input
                  type="number"
                  label={currentLang === "hi" ? "कर्मचारियों की संख्या (Staff)" : "Number of Employees"}
                  value={formData.employee_count !== undefined ? String(formData.employee_count) : ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employee_count: e.target.value ? parseInt(e.target.value, 10) : undefined,
                    })
                  }
                  placeholder="e.g. 4"
                />

                {/* Monthly Revenue */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    {currentLang === "hi" ? "मासिक राजस्व (Monthly Revenue)" : "Monthly Revenue"}
                  </label>
                  <input
                    type="text"
                    value={formData.monthly_revenue || ""}
                    onChange={(e) => setFormData({ ...formData, monthly_revenue: e.target.value })}
                    placeholder="e.g. ₹2,00,000–₹3,00,000"
                    className="w-full h-11 bg-white text-stone-900 text-sm rounded-xl px-4 border border-stone-200 hover:border-stone-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-xs"
                  />
                </div>

                {/* Business Model */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                    {currentLang === "hi" ? "व्यापार मॉडल (Business Model)" : "Business Model"}
                  </label>
                  <select
                    value={formData.business_model || "Offline retail"}
                    onChange={(e) => setFormData({ ...formData, business_model: e.target.value })}
                    className="w-full h-11 bg-white text-stone-900 text-sm rounded-xl px-4 border border-stone-200 hover:border-stone-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-xs font-medium"
                  >
                    <option value="Offline retail">Offline retail</option>
                    <option value="Hybrid (Retail & Online)">Hybrid (Retail & Online)</option>
                    <option value="Online e-commerce">Online e-commerce</option>
                    <option value="Wholesale / B2B">Wholesale / B2B</option>
                    <option value="Service Provider">Service Provider</option>
                    <option value="Manufacturing & Direct Supply">Manufacturing & Direct Supply</option>
                  </select>
                </div>

                {/* Target Customers */}
                <Input
                  label={currentLang === "hi" ? "लक्षित ग्राहक (Target Customers)" : "Target Customers"}
                  value={formData.target_customers || ""}
                  onChange={(e) => setFormData({ ...formData, target_customers: e.target.value })}
                  placeholder="e.g. Students, parents, teachers"
                />
              </div>
            </div>

            {/* Section 3: Contact & Location Details (Email & Phone Record) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-stone-800 font-bold text-sm border-b border-stone-100 pb-2">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>3. {currentLang === "hi" ? "स्थान और संपर्क जानकारी (ईमेल, फोन व पता)" : "Location & Contact Details (Email, Phone & Address)"}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* State Dropdown */}
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
                    className="w-full h-11 bg-white text-stone-900 text-sm rounded-xl px-4 border border-stone-200 hover:border-stone-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-xs font-medium"
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
                      placeholder="e.g. Jaipur, Kolhapur, Baddi"
                    />
                  ) : (
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full h-11 bg-white text-stone-900 text-sm rounded-xl px-4 border border-stone-200 hover:border-stone-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-xs font-medium"
                    >
                      {selectedStateObj.majorCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Area / Locality */}
                <Input
                  label={currentLang === "hi" ? "क्षेत्र / मोहल्ला (Area / Locality)" : "Area / Locality"}
                  value={formData.area_locality || ""}
                  onChange={(e) => setFormData({ ...formData, area_locality: e.target.value })}
                  placeholder="e.g. Mansarovar / Chandni Chowk"
                />

                {/* PIN Code */}
                <Input
                  label={t("business.pincode")}
                  value={formData.pincode || ""}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="e.g. 302020 (6 digits)"
                />

                {/* Contact Email (Record Keep) */}
                <Input
                  type="email"
                  label={currentLang === "hi" ? "ईमेल रिकॉर्ड (Contact Email)" : "Contact Email"}
                  value={formData.contact_email || ""}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  placeholder="e.g. queensbookworld@example.com"
                />

                {/* Contact Phone */}
                <Input
                  type="tel"
                  label={currentLang === "hi" ? "फोन नंबर (Contact Phone)" : "Contact Phone"}
                  value={formData.contact_phone || ""}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                />

                {/* Full Business Address */}
                <div className="md:col-span-2 lg:col-span-2">
                  <Input
                    label={currentLang === "hi" ? "पूरा पता (Full Business Address)" : "Full Business Address"}
                    value={formData.business_address || ""}
                    onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                    placeholder="e.g. 123, Shipra Path, Mansarovar, Jaipur, Rajasthan – 302020"
                  />
                </div>

                {/* Website */}
                <Input
                  label={currentLang === "hi" ? "वेबसाइट / लिंक (Website)" : "Website"}
                  value={formData.website || ""}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="e.g. Not available / https://..."
                />
              </div>
            </div>

            {/* Section 4: Language & Digitalization Aspirations */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-stone-800 font-bold text-sm border-b border-stone-100 pb-2">
                <Target className="w-4 h-4 text-orange-600" />
                <span>4. {currentLang === "hi" ? "भाषा और डिजिटलीकरण लक्ष्य" : "Language & Digitalization Aspirations"}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Language */}
                <Select
                  label={currentLang === "hi" ? "प्राथमिक भाषा (Primary Language)" : "Primary Language"}
                  value={formData.primary_language}
                  onChange={(e) =>
                    setFormData({ ...formData, primary_language: e.target.value })
                  }
                >
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="en">English</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="te">తెలుగు (Telugu)</option>
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="bn">বাংলা (Bengali)</option>
                </Select>

                {/* Additional Language */}
                <Input
                  label={currentLang === "hi" ? "अतिरिक्त भाषा (Additional Language)" : "Additional Language"}
                  value={formData.additional_language || ""}
                  onChange={(e) => setFormData({ ...formData, additional_language: e.target.value })}
                  placeholder="e.g. English / Hindi"
                />

                {/* Digitalization Goal */}
                <div className="md:col-span-2">
                  <Input
                    label={currentLang === "hi" ? "डिजिटलीकरण लक्ष्य (Digitalization Goal)" : "Digitalization Goal"}
                    value={formData.digitalization_goal || ""}
                    onChange={(e) => setFormData({ ...formData, digitalization_goal: e.target.value })}
                    placeholder="e.g. Increase sales and attract more local customers"
                  />
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
                    placeholder="e.g. Bookstore & stationery retail store serving students and local residents in Mansarovar, Jaipur since 2018."
                    className="w-full bg-white text-stone-900 text-sm rounded-xl px-4 py-2.5 border border-stone-200 hover:border-stone-300 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition shadow-xs"
                  />
                </div>
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
        subtitle="Manage, view email/contact profiles, and switch between your registered MSME entities."
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
            description="Register your first MSME enterprise or use sample Queen's Book World to begin the 14-question digital assessment."
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
                  className="p-6 space-y-4 flex flex-col justify-between"
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
                        {biz.owner_name && (
                          <p className="text-xs text-stone-600 font-medium mt-0.5">
                            👤 {biz.owner_name} {biz.year_established ? `(Est. ${biz.year_established})` : ""}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span>
                            {biz.area_locality ? `${biz.area_locality}, ` : ""}
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

                    {/* Email and Phone badges if available */}
                    {(biz.contact_email || biz.contact_phone) && (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600 bg-stone-50/80 p-2 rounded-lg border border-stone-100">
                        {biz.contact_email && (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="w-3 h-3 text-orange-600" />
                            <span className="font-mono text-stone-800">{biz.contact_email}</span>
                          </span>
                        )}
                        {biz.contact_phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="w-3 h-3 text-orange-600" />
                            <span>{biz.contact_phone}</span>
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                        {biz.sector || "Retail"}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
                        {biz.enterprise_size} Enterprise
                      </span>
                      {biz.employee_count !== undefined && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
                          👥 {biz.employee_count}
                        </span>
                      )}
                      {biz.business_model && (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">
                          🏢 {biz.business_model}
                        </span>
                      )}
                    </div>

                    {biz.digitalization_goal && (
                      <p className="text-xs text-orange-800 bg-orange-50/60 p-2 rounded-lg border border-orange-100 line-clamp-2">
                        🎯 <span className="font-semibold">Goal:</span> {biz.digitalization_goal}
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
