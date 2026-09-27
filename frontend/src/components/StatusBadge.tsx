import React from "react";

interface StatusBadgeProps {
  status: "healthy" | "degraded" | "unhealthy" | "operational" | "active" | string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const isHealthy = ["healthy", "operational", "active", "completed"].includes(status.toLowerCase());
  const isDegraded = ["degraded", "in_progress", "warning"].includes(status.toLowerCase());

  const colorStyles = isHealthy
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : isDegraded
    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
    : "bg-rose-500/10 text-rose-400 border-rose-500/20";

  const dotColor = isHealthy
    ? "bg-emerald-400"
    : isDegraded
    ? "bg-amber-400"
    : "bg-rose-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium tracking-wide ${
        size === "sm" ? "text-xs" : "text-sm"
      } ${colorStyles}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor} animate-pulse`} />
      {status.toUpperCase()}
    </span>
  );
};
