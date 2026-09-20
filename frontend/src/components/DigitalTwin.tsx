"use client";
import React from "react";
import { useNavigate } from "@/lib/navigation";
import { Leaf, Droplets, Thermometer, AlertTriangle } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";

export interface Zone {
  id: string;
  name: string;
  crop?: string;
  soil_type?: string;
  area?: number;
  area_unit?: string;
  status?: string;
  last_moisture?: number;
}

const STATUS_STYLES: Record<string, { ring: string; bg: string; dot: string; label: string }> = {
  healthy: { ring: "ring-emerald-400", bg: "from-emerald-50 to-emerald-100", dot: "bg-emerald-500", label: "Healthy" },
  attention: { ring: "ring-amber-400", bg: "from-amber-50 to-amber-100", dot: "bg-amber-500", label: "Attention" },
  critical: { ring: "ring-rose-400", bg: "from-rose-50 to-rose-100", dot: "bg-rose-500", label: "Critical" },
  irrigating: { ring: "ring-blue-400", bg: "from-blue-50 to-blue-100", dot: "bg-blue-500", label: "Irrigating" },
  no_data: { ring: "ring-stone-300", bg: "from-stone-50 to-stone-100", dot: "bg-stone-400", label: "No data" },
};

export function ZoneCard({ zone, onClick }: { zone: Zone; onClick?: () => void }) {
  const s = STATUS_STYLES[zone.status || "no_data"] || STATUS_STYLES.no_data;
  return (
    <button
      onClick={onClick}
      data-testid={`zone-card-${zone.id}`}
      className={`group relative text-left w-full rounded-2xl border-2 ring-2 ring-offset-2 ring-offset-stone-50 ${s.ring} bg-gradient-to-br ${s.bg} border-white/60 p-4 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer`}
    >
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${s.dot} animate-pulse`} />
        <span className="text-[10px] font-bold uppercase text-stone-700">{s.label}</span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-lg bg-white/70 flex items-center justify-center">
          <Leaf className="text-emerald-700" size={18} />
        </div>
        <div>
          <div className="font-bold text-stone-900 text-sm">{zone.name}</div>
          <div className="text-[11px] text-stone-600">{zone.area ? `${zone.area} ${zone.area_unit || "acre"}` : "—"}</div>
        </div>
      </div>
      <div className="text-xs font-semibold text-stone-800 mb-2">
        {zone.crop || <span className="text-stone-500 italic">Assign crop</span>}
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        <div className="flex items-center gap-1 bg-white/60 rounded px-1.5 py-1">
          <Droplets size={12} className="text-blue-600" />
          <span className="font-medium">{zone.last_moisture != null ? `${zone.last_moisture}%` : "—"}</span>
        </div>
        <div className="flex items-center gap-1 bg-white/60 rounded px-1.5 py-1">
          <Thermometer size={12} className="text-rose-600" />
          <span className="font-medium">—</span>
        </div>
      </div>
      {zone.status === "critical" && (
        <div className="absolute -top-1 -left-1 bg-rose-500 text-white rounded-full p-1">
          <AlertTriangle size={10} />
        </div>
      )}
    </button>
  );
}

export default function DigitalTwin({
  zones,
  onZoneClick,
  isDemo,
}: {
  zones: Zone[];
  onZoneClick?: (z: Zone) => void;
  isDemo?: boolean;
}) {
  const nav = useNavigate();
  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 p-6 sm:p-8 shadow-2xl overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px, 60px 60px",
        }}
      />
      <div className="relative flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Digital Twin</h2>
            <StatusBadge kind="LIVE" />
          </div>
          <p className="text-emerald-200 text-sm">Pictorial view of your actual farm zones</p>
        </div>
      </div>
      <div className="relative">
        {!zones || zones.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center text-emerald-100">
            <p className="mb-3">No zones yet. Configure your farm to see the Digital Twin.</p>
            {!isDemo && (
              <button
                data-testid="twin-go-setup"
                onClick={() => nav("/onboarding")}
                className="px-4 py-2 rounded-lg bg-white text-emerald-800 font-semibold text-sm cursor-pointer hover:bg-emerald-50 transition"
              >
                Setup Farm
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {zones.map((z) => (
              <ZoneCard key={z.id} zone={z} onClick={() => onZoneClick && onZoneClick(z)} />
            ))}
          </div>
        )}
      </div>
      <div className="relative mt-6 flex items-center gap-3 flex-wrap text-xs text-emerald-100">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          Healthy
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Attention
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          Critical
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          Irrigating
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-stone-400" />
          No data
        </span>
      </div>
    </div>
  );
}
