import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Clock3,
  CircleSlash,
  ChevronDown,
  Sparkles,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { Badge } from "../ui/Badge";

export interface TaskCardProps {
  id: number;
  code?: string;
  titleEn: string;
  titleHi: string;
  descriptionEn?: string;
  descriptionHi?: string;
  reasonEn?: string;
  reasonHi?: string;
  phaseNumber: number;
  phaseNameEn: string;
  phaseNameHi: string;
  sequenceOrder: number;
  status: "pending" | "in_progress" | "completed" | "skipped";
  skipReason?: string;
  completedAt?: string;
  updatedAt?: string;
  priorityScore?: number;
  currentLang?: string;
  onStatusChange: (
    newStatus: "pending" | "in_progress" | "completed" | "skipped",
    skipReason?: string
  ) => void;
  isUpdating?: boolean;
  className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  code,
  titleEn,
  titleHi,
  descriptionEn,
  descriptionHi,
  reasonEn,
  reasonHi,
  phaseNumber,
  phaseNameEn,
  phaseNameHi,
  sequenceOrder,
  status,
  skipReason,
  completedAt,
  priorityScore,
  currentLang = "en",
  onStatusChange,
  isUpdating = false,
  className = "",
}) => {
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [localSkipNote, setLocalSkipNote] = useState("");

  const title = currentLang === "hi" ? titleHi : titleEn;
  const description = currentLang === "hi" ? descriptionHi : descriptionEn;
  const reason = currentLang === "hi" ? reasonHi : reasonEn;
  const phaseName = currentLang === "hi" ? phaseNameHi : phaseNameEn;

  const statusConfigs = {
    pending: {
      badge: "Not Started",
      badgeHi: "शुरू नहीं हुआ",
      badgeVariant: "neutral" as const,
      icon: <Clock className="w-4 h-4 text-stone-400" />,
      border: "border-stone-200",
      bg: "bg-white",
    },
    in_progress: {
      badge: "In Progress",
      badgeHi: "प्रगति में",
      badgeVariant: "warning" as const,
      icon: <Clock3 className="w-4 h-4 text-amber-600" />,
      border: "border-amber-300",
      bg: "bg-amber-50/40",
    },
    completed: {
      badge: "Completed",
      badgeHi: "पूर्ण",
      badgeVariant: "success" as const,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      border: "border-emerald-300",
      bg: "bg-emerald-50/30",
    },
    skipped: {
      badge: "Skipped",
      badgeHi: "छोड़ा गया",
      badgeVariant: "neutral" as const,
      icon: <CircleSlash className="w-4 h-4 text-stone-400" />,
      border: "border-stone-200 opacity-75",
      bg: "bg-stone-50/60",
    },
  };

  const currentCfg = statusConfigs[status] || statusConfigs.pending;

  const handleSelectStatus = (newStatus: "pending" | "in_progress" | "completed" | "skipped") => {
    if (newStatus === "skipped") {
      setShowSkipModal(true);
    } else {
      onStatusChange(newStatus);
    }
  };

  const handleConfirmSkip = () => {
    onStatusChange("skipped", localSkipNote);
    setShowSkipModal(false);
  };

  return (
    <div
      data-task-id={id}
      className={`p-6 rounded-2xl border shadow-sm flex flex-col justify-between space-y-4 transition-all duration-200 hover:shadow-card-hover ${currentCfg.border} ${currentCfg.bg} ${className}`}
    >
      <div className="space-y-3">
        {/* Top meta: Phase, Milestone #, Priority, Status dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              Phase {phaseNumber}: {phaseName}
            </span>
            <span className="text-xs text-stone-500 font-mono">#{sequenceOrder}</span>
            {code && (
              <span className="text-[10px] font-mono uppercase text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                {code}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {priorityScore !== undefined && (
              <Badge variant="brand" size="sm" icon={<Sparkles className="w-3 h-3 mr-1" />}>
                {priorityScore.toFixed(1)}
              </Badge>
            )}

            {/* Quick Status Selector */}
            <div className="relative">
              <select
                disabled={isUpdating}
                value={status}
                onChange={(e) =>
                  handleSelectStatus(
                    e.target.value as "pending" | "in_progress" | "completed" | "skipped"
                  )
                }
                className="bg-white text-xs font-semibold text-stone-800 rounded-xl px-3 py-1.5 border border-stone-200 hover:border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer disabled:opacity-50 appearance-none pr-7 shadow-xs"
              >
                <option value="pending">
                  {currentLang === "hi" ? "लंबित (Not Started)" : "Not Started"}
                </option>
                <option value="in_progress">
                  {currentLang === "hi" ? "प्रगति में (In Progress)" : "In Progress"}
                </option>
                <option value="completed">
                  {currentLang === "hi" ? "पूर्ण (Completed)" : "Completed"}
                </option>
                <option value="skipped">
                  {currentLang === "hi" ? "छोड़ा गया (Skipped)" : "Skipped"}
                </option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-1.5">
          <h4
            className={`text-base sm:text-lg font-bold tracking-tight ${
              status === "completed"
                ? "text-emerald-800 line-through opacity-85"
                : "text-stone-900"
            }`}
          >
            {title}
          </h4>
          {description && (
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{description}</p>
          )}
        </div>

        {/* Rationale explanation */}
        {reason && (
          <div className="p-3.5 rounded-xl bg-orange-50/50 border border-orange-100 text-xs text-stone-700 leading-relaxed">
            <span className="font-bold text-orange-800 block mb-0.5">
              {currentLang === "hi" ? "अनुशंसा का कारण:" : "Recommendation Rationale:"}
            </span>
            {reason}
          </div>
        )}

        {/* Skip reason display */}
        {status === "skipped" && skipReason && (
          <div className="p-3 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-600 flex items-start gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
            <span>
              <strong className="text-stone-800">
                {currentLang === "hi" ? "छोड़ने का कारण: " : "Skip Reason: "}
              </strong>
              {skipReason}
            </span>
          </div>
        )}
      </div>

      {/* Footer info: completion date or action buttons */}
      <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-stone-500">
          <Calendar className="w-3.5 h-3.5" />
          {status === "completed" && completedAt ? (
            <span className="text-emerald-700 font-medium">
              {currentLang === "hi"
                ? `पूर्ण किया गया: ${new Date(completedAt).toLocaleDateString()}`
                : `Completed on ${new Date(completedAt).toLocaleDateString()}`}
            </span>
          ) : (
            <span>Milestone #{sequenceOrder}</span>
          )}
        </div>

        {/* Quick toggle buttons */}
        <div className="flex items-center gap-1.5">
          {status !== "completed" && (
            <button
              disabled={isUpdating}
              onClick={() => onStatusChange("completed")}
              className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs transition"
            >
              {currentLang === "hi" ? "पूर्ण चिह्नित करें" : "Mark Done"}
            </button>
          )}

          {status !== "in_progress" && status !== "completed" && (
            <button
              disabled={isUpdating}
              onClick={() => onStatusChange("in_progress")}
              className="px-3 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-semibold text-xs transition"
            >
              {currentLang === "hi" ? "प्रगति में" : "Start"}
            </button>
          )}
        </div>
      </div>

      {/* Skip Reason Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="text-lg font-bold text-stone-900">
              {currentLang === "hi" ? "माइलस्टोन छोड़ें" : "Skip Roadmap Task"}
            </h4>
            <p className="text-xs text-stone-500">
              {currentLang === "hi"
                ? "कृपया बताएं कि यह कार्य क्यों छोड़ा जा रहा है (वैकल्पिक):"
                : "Please provide a reason why this task is being skipped (optional):"}
            </p>
            <textarea
              rows={3}
              value={localSkipNote}
              onChange={(e) => setLocalSkipNote(e.target.value)}
              placeholder={
                currentLang === "hi"
                  ? "उदाहरण: बजट की सीमा, पहले से ही दूसरी सेवा मौजूद है..."
                  : "e.g., Budget constraint, already implemented alternate solution..."
              }
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSkipModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold hover:bg-stone-200"
              >
                {currentLang === "hi" ? "रद्द करें" : "Cancel"}
              </button>
              <button
                onClick={handleConfirmSkip}
                className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-semibold hover:bg-orange-500"
              >
                {currentLang === "hi" ? "छोड़ें" : "Confirm Skip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
