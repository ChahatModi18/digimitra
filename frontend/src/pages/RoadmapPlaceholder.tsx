import React from "react";
import { Link } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";

export const RoadmapPlaceholder: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 text-center space-y-6">
      <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xl">
        <Compass className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white font-heading">
          Phased Digitalization Roadmap
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Phase 4 will deliver personalized, sequenced recommendations across Immediate (0–30 days), Short-Term (30–90 days), and Growth (90–180 days) phases.
        </p>
      </div>

      <div className="pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
