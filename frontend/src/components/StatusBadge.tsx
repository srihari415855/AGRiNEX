import React from "react";

const styles: Record<string, string> = {
  LIVE: "bg-emerald-100 text-emerald-800 border-emerald-300",
  SIMULATED: "bg-purple-100 text-purple-800 border-purple-300",
  RECENT: "bg-blue-100 text-blue-800 border-blue-300",
  ESTIMATED: "bg-amber-100 text-amber-800 border-amber-300",
  FARMER_UPLOADED: "bg-orange-100 text-orange-800 border-orange-300",
  AI_IMAGE_ANALYSIS: "bg-teal-100 text-teal-800 border-teal-300",
  NO_CURRENT_DATA: "bg-slate-100 text-slate-700 border-slate-300",
  DEMO: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300",
  INDICATIVE: "bg-amber-100 text-amber-800 border-amber-300",
};

export default function StatusBadge({
  kind = "LIVE",
  children,
}: {
  kind?: string;
  children?: React.ReactNode;
}) {
  const cls = styles[kind] || styles.RECENT;
  const label =
    children ||
    (kind === "AI_IMAGE_ANALYSIS"
      ? "PHOTO ANALYSIS"
      : kind.replace(/_/g, " "));

  return (
    <span
      data-testid={`status-badge-${kind.toLowerCase()}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {label}
    </span>
  );
}
