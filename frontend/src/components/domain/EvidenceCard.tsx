import React from "react";
import { FileCode } from "lucide-react";
import { Badge } from "../ui/Badge";

export interface EvidenceCardProps {
  ruleCode?: string;
  ruleName?: string;
  ruleVersion?: number;
  firedOrder?: number;
  conditionJson?: Record<string, any>;
  matchedAnswersJson?: Record<string, any>;
  className?: string;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  ruleCode,
  ruleName,
  ruleVersion = 1,
  firedOrder = 1,
  conditionJson = {},
  matchedAnswersJson = {},
  className = "",
}) => {
  return (
    <div
      className={`p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md space-y-3.5 transition-all duration-200 hover:border-slate-700 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileCode className="w-4 h-4" />
          </span>
          <span className="text-sm font-bold text-white tracking-tight">
            {ruleCode || "RULE-CLASSIFY"}
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
            v{ruleVersion}
          </span>
        </div>

        <Badge variant="brand" size="sm">
          Step #{firedOrder} Fired
        </Badge>
      </div>

      {ruleName && <p className="text-xs font-semibold text-slate-300">{ruleName}</p>}

      {/* Conditions & Matched Trace */}
      <div className="space-y-2 text-xs">
        {conditionJson && Object.keys(conditionJson).length > 0 && (
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 font-mono text-[11px]">
            <span className="text-indigo-400 font-semibold block mb-1">
              Evaluated Criteria:
            </span>
            <pre className="text-slate-300 overflow-x-auto no-scrollbar whitespace-pre-wrap">
              {JSON.stringify(conditionJson, null, 2)}
            </pre>
          </div>
        )}

        {matchedAnswersJson && Object.keys(matchedAnswersJson).length > 0 && (
          <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 font-mono text-[11px]">
            <span className="text-emerald-400 font-semibold block mb-1">
              Satisfied Answers:
            </span>
            <pre className="text-emerald-200/90 overflow-x-auto no-scrollbar whitespace-pre-wrap">
              {JSON.stringify(matchedAnswersJson, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
