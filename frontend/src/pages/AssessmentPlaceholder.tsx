import React from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck, AlertCircle, ArrowLeft } from "lucide-react";

export const AssessmentPlaceholder: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 text-center space-y-6">
      <div className="inline-flex p-4 rounded-3xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-xl">
        <ClipboardCheck className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white font-heading">
          Dynamic Digital Readiness Assessment
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Phase 2 will implement the dynamic DB-driven bilingual questionnaire engine evaluating payments, operations, online footprint, and management systems.
        </p>
      </div>

      <div className="p-4 max-w-md mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-3 text-left">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-400" />
        <span>
          Phase 0 foundation established. Question bank schema & rule condition evaluation algorithms are ready in the backend.
        </span>
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
