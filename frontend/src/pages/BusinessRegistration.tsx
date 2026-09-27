import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  Sparkles,
  MapPin,
  Compass,
  PlusCircle,
  Store,
} from "lucide-react";
import { fetchBusinesses, createBusiness, CreateBusinessPayload } from "../api/businesses";
import { Business } from "../types";
import { useAuth } from "../context/AuthContext";
import { LoadingState, ErrorAlert } from "../components/UIState";

export const BusinessRegistration: React.FC = () => {
  const { t } = useTranslation();
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

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white font-heading tracking-tight">
              {t("business.title")}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t("business.subtitle")}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showForm ? "View Registered Enterprises" : "Register New Enterprise"}</span>
        </button>
      </div>

      {errorMessage && <ErrorAlert message={errorMessage} />}

      {/* Registration Form (Collapsible or if no businesses exist) */}
      {(showForm || (!isLoading && businesses.length === 0)) && (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Store className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white font-heading">
              {t("business.form_title")}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Business Name */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t("business.name")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ramesh Kirana & General Store"
                  className="w-full bg-slate-950 text-white text-sm rounded-xl px-4 py-3 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Sector / Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t("business.sector")} *
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full bg-slate-950 text-white text-sm rounded-xl px-4 py-3 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                >
                  <option value="Retail & Trade">Retail & Trade (किराना / व्यापार)</option>
                  <option value="Manufacturing">Manufacturing & Production (उत्पादन)</option>
                  <option value="Services & Consulting">Services & Consulting (सेवाएं / परामर्श)</option>
                  <option value="Food & Hospitality">Food & Hospitality (होटल / खान-पान)</option>
                  <option value="Handloom & Handicrafts">Handloom & Handicrafts (हथकरघा / हस्तशिल्प)</option>
                  <option value="Healthcare & Wellness">Healthcare & Wellness (स्वास्थ्य सेवाएं)</option>
                </select>
              </div>

              {/* Enterprise Size */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t("business.size")} *
                </label>
                <select
                  value={formData.enterprise_size}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enterprise_size: e.target.value as "Micro" | "Small" | "Medium",
                    })
                  }
                  className="w-full bg-slate-950 text-white text-sm rounded-xl px-4 py-3 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                >
                  <option value="Micro">Micro Enterprise (&lt; ₹1 Cr Turnover, &lt; ₹25 Lakh Inv)</option>
                  <option value="Small">Small Enterprise (&lt; ₹10 Cr Turnover)</option>
                  <option value="Medium">Medium Enterprise (&lt; ₹50 Cr Turnover)</option>
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t("business.state")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Uttar Pradesh, Maharashtra"
                  className="w-full bg-slate-950 text-white text-sm rounded-xl px-4 py-3 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t("business.city")} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Lucknow, Pune"
                  className="w-full bg-slate-950 text-white text-sm rounded-xl px-4 py-3 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t("business.pincode")}
                </label>
                <input
                  type="text"
                  value={formData.pincode || ""}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="e.g. 226001"
                  className="w-full bg-slate-950 text-white text-sm rounded-xl px-4 py-3 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t("business.language")}
                </label>
                <select
                  value={formData.primary_language}
                  onChange={(e) => setFormData({ ...formData, primary_language: e.target.value })}
                  className="w-full bg-slate-950 text-white text-sm rounded-xl px-4 py-3 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t("business.description")}
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Briefly describe your products or services..."
                  className="w-full bg-slate-950 text-white text-sm rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              {businesses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {createMutation.isPending ? "Registering..." : t("business.submit")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Registered Enterprises Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white font-heading">
              {t("business.list_title")} ({businesses.length})
            </h2>
          </div>
        </div>

        {isLoading ? (
          <LoadingState message="Loading your registered enterprises..." />
        ) : businesses.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
            <Store className="w-10 h-10 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {t("business.no_businesses")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businesses.map((biz) => {
              const isActive = activeBusinessId === biz.id;
              return (
                <div
                  key={biz.id}
                  className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                    isActive
                      ? "bg-slate-900 border-indigo-500/50 shadow-xl ring-1 ring-indigo-500/30"
                      : "bg-slate-900/70 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-indigo-400 font-bold">
                            #{biz.id}
                          </span>
                          <h3 className="text-lg font-bold text-white">{biz.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>
                            {biz.city}, {biz.state} {biz.pincode ? `(${biz.pincode})` : ""}
                          </span>
                        </div>
                      </div>

                      {isActive ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          {t("business.active_badge")}
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveBusinessId(biz.id)}
                          className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition shrink-0"
                        >
                          {t("business.select_active")}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-950/60 text-indigo-300 border border-indigo-500/20">
                        {biz.sector || "Retail"}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {biz.enterprise_size} Enterprise
                      </span>
                    </div>

                    {biz.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {biz.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        setActiveBusinessId(biz.id);
                        navigate("/assessment");
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Take Assessment</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveBusinessId(biz.id);
                        navigate("/roadmap");
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-1.5"
                    >
                      <Compass className="w-3.5 h-3.5 text-indigo-400" />
                      <span>View Roadmap</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
