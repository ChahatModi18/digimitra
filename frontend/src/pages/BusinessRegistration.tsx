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
} from "lucide-react";
import { fetchBusinesses, createBusiness, CreateBusinessPayload } from "../api/businesses";
import { Business } from "../types";
import { useAuth } from "../context/AuthContext";
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
} from "../components";

export const BusinessRegistration: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = (i18n?.language?.startsWith("hi") ? "hi" : "en") as "en" | "hi";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeBusinessId, setActiveBusinessId } = useAuth();

  const [showForm, setShowForm] = useState(false);
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
      setErrorMessage("Enterprise name is required.");
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
        badge={<Badge variant="brand" size="sm">MSME Directory</Badge>}
        actions={
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
        }
      />

      {errorMessage && (
        <Alert type="error" onDismiss={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
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
                <span className="text-xs text-orange-700 font-mono font-bold">ID #{activeBiz.id}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                {activeBiz.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>
                  {activeBiz.city}, {activeBiz.state}{" "}
                  {activeBiz.pincode ? `(${activeBiz.pincode})` : ""}
                </span>
                <span className="text-stone-300">•</span>
                <span>{activeBiz.sector}</span>
                <span className="text-stone-300">•</span>
                <span>{activeBiz.enterprise_size}</span>
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

      {/* 3. Registration Form */}
      {(showForm || (!isLoading && businesses.length === 0)) && (
        <Card variant="default" className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-stone-200">
            <Store className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-bold text-stone-900 font-heading">
              {t("business.form_title")}
            </h3>
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
                  placeholder="e.g. Ramesh Kirana & General Store"
                />
              </div>

              {/* Sector */}
              <Select
                label={`${t("business.sector")} *`}
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              >
                <option value="Retail & Trade">Retail & Trade (किराना / व्यापार)</option>
                <option value="Manufacturing">Manufacturing & Production (उत्पादन)</option>
                <option value="Services & Consulting">Services & Consulting (सेवाएं / परामर्श)</option>
                <option value="Food & Hospitality">Food & Hospitality (होटल / खान-पान)</option>
                <option value="Handloom & Handicrafts">Handloom & Handicrafts (हथकरघा / हस्तशिल्प)</option>
                <option value="Healthcare & Wellness">Healthcare & Wellness (स्वास्थ्य सेवाएं)</option>
              </Select>

              {/* Enterprise Size */}
              <Select
                label={`${t("business.size")} *`}
                value={formData.enterprise_size}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enterprise_size: e.target.value as "Micro" | "Small" | "Medium",
                  })
                }
              >
                <option value="Micro">Micro Enterprise (&lt; ₹1 Cr Turnover)</option>
                <option value="Small">Small Enterprise (&lt; ₹10 Cr Turnover)</option>
                <option value="Medium">Medium Enterprise (&lt; ₹50 Cr Turnover)</option>
              </Select>

              {/* State */}
              <Input
                label={`${t("business.state")} *`}
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Uttar Pradesh, Maharashtra"
              />

              {/* City */}
              <Input
                label={`${t("business.city")} *`}
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Lucknow, Pune"
              />

              {/* PIN Code */}
              <Input
                label={t("business.pincode")}
                value={formData.pincode || ""}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="e.g. 226001"
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

              {/* Description */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
                  {t("business.description")}
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe your products or services..."
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
