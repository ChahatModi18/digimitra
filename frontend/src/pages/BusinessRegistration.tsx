import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  Tag,
  RotateCcw,
  FileText,
} from "lucide-react";
import { createBusiness, CreateBusinessPayload } from "../api/businesses";
import { Business } from "../types";

export const BusinessRegistration: React.FC = () => {
  const [formData, setFormData] = useState<CreateBusinessPayload>({
    name: "",
    sector: "Retail",
    enterprise_size: "Micro",
    state: "Maharashtra",
    city: "Mumbai",
    pincode: "400001",
    description: "",
    primary_language: "en",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdBusiness, setCreatedBusiness] = useState<Business | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim()) {
      setErrorMessage("Business name is required.");
      return;
    }
    if (!formData.state.trim() || !formData.city.trim()) {
      setErrorMessage("State and City are required fields.");
      return;
    }

    setLoading(true);
    try {
      const result = await createBusiness(formData);
      setCreatedBusiness(result);
    } catch (err: any) {
      const msg =
        err?.message ||
        (Array.isArray(err?.details)
          ? err.details.map((d: any) => `${d.loc?.join(".")}: ${d.msg}`).join(", ")
          : "Failed to register business. Please verify all fields.");
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCreatedBusiness(null);
    setFormData({
      name: "",
      sector: "Retail",
      enterprise_size: "Micro",
      state: "Maharashtra",
      city: "Mumbai",
      pincode: "400001",
      description: "",
      primary_language: "en",
    });
    setErrorMessage(null);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex items-center gap-4 p-6 rounded-3xl glass-panel border border-slate-800 shadow-xl">
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
          <Building2 className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
            MSME Business Registration
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Step 1 of the DigiMitra Digital Consultant Framework — Stored in real-time MySQL database
          </p>
        </div>
      </div>

      {/* Success View */}
      {createdBusiness ? (
        <div className="rounded-3xl glass-panel p-8 border border-emerald-500/30 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-heading">
                  Enterprise Registered Successfully!
                </h2>
                <p className="text-xs text-emerald-400">
                  Persisted to MySQL Database with ID #{createdBusiness.id}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {createdBusiness.enterprise_size} Enterprise
            </span>
          </div>

          {/* Details Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-sm">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Business Name</span>
              <span className="font-semibold text-white text-base mt-0.5 block">{createdBusiness.name}</span>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Sector</span>
              <span className="font-medium text-indigo-300 flex items-center gap-1.5 mt-0.5">
                <Tag className="h-3.5 w-3.5" />
                {createdBusiness.sector}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Location</span>
              <span className="text-slate-200 flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {createdBusiness.city}, {createdBusiness.state} {createdBusiness.pincode ? `(${createdBusiness.pincode})` : ""}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Registration Time</span>
              <span className="text-slate-300 text-xs mt-0.5 block">
                {new Date(createdBusiness.created_at).toLocaleString()}
              </span>
            </div>

            {createdBusiness.description && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-800/60">
                <span className="text-xs text-slate-400 uppercase tracking-wider block">Operational Summary</span>
                <p className="text-slate-300 text-xs mt-1 leading-relaxed">{createdBusiness.description}</p>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Register Another Business</span>
            </button>

            <Link
              to="/assessment"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Proceed to Digital Assessment</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Registration Form */
        <div className="rounded-3xl glass-panel p-8 border border-slate-800 shadow-2xl space-y-6">
          {errorMessage && (
            <div
              data-testid="error-banner"
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3"
            >
              <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Registration Failed</p>
                <p className="text-xs text-rose-400 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            {/* Enterprise Name */}
            <div>
              <label
                htmlFor="business-name-input"
                className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider"
              >
                Enterprise Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="business-name-input"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Hardware & Electricals"
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Sector & Enterprise Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="sector-select"
                  className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider"
                >
                  Sector / Industry <span className="text-rose-400">*</span>
                </label>
                <select
                  id="sector-select"
                  name="sector"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="Retail">Retail & General Store</option>
                  <option value="Manufacturing">Manufacturing & Fabrication</option>
                  <option value="Services">Services, Repair & Maintenance</option>
                  <option value="Food & Beverage">Food, Restaurant & Beverage</option>
                  <option value="Handicrafts">Handicrafts, Apparel & Textiles</option>
                  <option value="Wholesale">Wholesale & Distribution</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="enterprise-size-select"
                  className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider"
                >
                  MSME Category (MSMED Act) <span className="text-rose-400">*</span>
                </label>
                <select
                  id="enterprise-size-select"
                  name="enterprise_size"
                  value={formData.enterprise_size}
                  onChange={(e) =>
                    setFormData({ ...formData, enterprise_size: e.target.value as any })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-all"
                >
                  <option value="Micro">Micro (Inv &lt; ₹1 Cr, Turnover &lt; ₹5 Cr)</option>
                  <option value="Small">Small (Inv &lt; ₹10 Cr, Turnover &lt; ₹50 Cr)</option>
                  <option value="Medium">Medium (Inv &lt; ₹50 Cr, Turnover &lt; ₹250 Cr)</option>
                </select>
              </div>
            </div>

            {/* State, City, Pincode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="state-input"
                  className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider"
                >
                  State <span className="text-rose-400">*</span>
                </label>
                <input
                  id="state-input"
                  name="state"
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="city-input"
                  className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider"
                >
                  City / Town <span className="text-rose-400">*</span>
                </label>
                <input
                  id="city-input"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Mumbai"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="pincode-input"
                  className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider"
                >
                  PIN Code
                </label>
                <input
                  id="pincode-input"
                  name="pincode"
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="e.g. 400001"
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Description / Operations */}
            <div>
              <label
                htmlFor="description-input"
                className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider"
              >
                Brief Description of Current Operations
              </label>
              <textarea
                id="description-input"
                name="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what you sell, your primary customers, and current payment or accounting methods..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-xs"
              />
            </div>

            {/* Language Preference */}
            <div>
              <label
                htmlFor="language-select"
                className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider"
              >
                Primary Consultation Language
              </label>
              <select
                id="language-select"
                name="primary_language"
                value={formData.primary_language}
                onChange={(e) => setFormData({ ...formData, primary_language: e.target.value })}
                className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-xs"
              >
                <option value="en">English (Default)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 hover:scale-[1.01]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Persisting to MySQL Database...
                  </span>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    <span>Register Enterprise in DigiMitra</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
