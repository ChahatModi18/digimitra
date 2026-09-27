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
      className={`p-5 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3.5 transition-all duration-200 hover:border-orange-300 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
            <FileCode className="w-4 h-4" />
          </span>
          <span className="text-sm font-bold text-stone-900 tracking-tight">
            {ruleCode || "RULE-CLASSIFY"}
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
            v{ruleVersion}
          </span>
        </div>

        <Badge variant="brand" size="sm">
          Step #{firedOrder} Fired
        </Badge>
      </div>

      {ruleName && <p className="text-xs font-semibold text-stone-700">{ruleName}</p>}

      {/* Conditions & Matched Trace */}
      <div className="space-y-2 text-xs">
        {conditionJson && Object.keys(conditionJson).length > 0 && (
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 font-mono text-[11px]">
            <span className="text-orange-700 font-bold block mb-1">
              Evaluated Criteria:
            </span>
            <pre className="text-stone-800 overflow-x-auto no-scrollbar whitespace-pre-wrap">
              {JSON.stringify(conditionJson, null, 2)}
            </pre>
          </div>
        )}

        {matchedAnswersJson && Object.keys(matchedAnswersJson).length > 0 && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 font-mono text-[11px]">
            <span className="text-emerald-800 font-bold block mb-1">
              Satisfied Answers:
            </span>
            <pre className="text-emerald-900 overflow-x-auto no-scrollbar whitespace-pre-wrap">
              {JSON.stringify(matchedAnswersJson, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
