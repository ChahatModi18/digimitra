import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle2, ArrowRight } from "lucide-react";
import { createBusiness } from "../api/health";

export const BusinessRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    sector: "Retail",
    enterprise_size: "Micro" as "Micro" | "Small" | "Medium",
    state: "Maharashtra",
    city: "Mumbai",
    pincode: "400001",
    description: "",
    primary_language: "en",
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createBusiness(formData);
      setSuccessMsg("Business registered successfully! Ready for assessment.");
      setTimeout(() => {
        navigate("/assessment");
      }, 1500);
    } catch (err: any) {
      alert("Registration error: " + (err.message || "Failed to register"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="rounded-3xl glass-panel p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white font-heading">Register Your Enterprise</h1>
            <p className="text-xs text-slate-400">Step 1 of the DigiMitra Digital Transformation Journey</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Business Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Ramesh Hardware & Electricals"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Sector / Industry *
              </label>
              <select
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Retail">Retail & General Store</option>
                <option value="Manufacturing">Manufacturing & Fabrication</option>
                <option value="Services">Services & Repair</option>
                <option value="Food & Beverage">Food, Restaurant & Beverage</option>
                <option value="Handicrafts">Handicrafts & Textiles</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Enterprise Size (MSMED Act) *
              </label>
              <select
                value={formData.enterprise_size}
                onChange={(e) => setFormData({ ...formData, enterprise_size: e.target.value as any })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Micro">Micro (Investment &lt; ₹1 Cr, Turnover &lt; ₹5 Cr)</option>
                <option value="Small">Small (Investment &lt; ₹10 Cr, Turnover &lt; ₹50 Cr)</option>
                <option value="Medium">Medium (Investment &lt; ₹50 Cr, Turnover &lt; ₹250 Cr)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Pincode
              </label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>Registering Enterprise...</span>
              ) : (
                <>
                  <span>Save & Continue to Assessment</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
