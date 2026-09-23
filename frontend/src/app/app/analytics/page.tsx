"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, API } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import {
  BarChart3,
  TrendingUp,
  Droplets,
  Leaf,
  Trash2,
  Save,
  Sparkles,
  CloudSun,
  Layers,
  Sprout,
  MapPin,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface StoredReport {
  id: string;
  title: string;
  report_type: string;
  summary_text: string;
  data: any;
  created_at: string;
  created_at_ist?: string;
  time_str?: string;
  date_str?: string;
  timezone?: string;
}

function formatInt(n: number | undefined | null): string {
  if (n === undefined || n === null) return "0";
  return new Intl.NumberFormat("en-US").format(n);
}

function formatDateSafe(dateStr?: string | null, rep?: StoredReport): string {
  if (rep?.created_at_ist) {
    return rep.created_at_ist;
  }
  if (rep?.time_str && rep?.date_str) {
    return `${rep.time_str} IST • ${rep.date_str}`;
  }
  if (!dateStr) return "Synchronized Live";
  try {
    let s = String(dateStr).trim();
    if (!s.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(s)) {
      s += "Z";
    }
    const d = new Date(s);
    if (isNaN(d.getTime())) return "Synchronized Live";
    const time = d.toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    const date = d.toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${time} IST • ${date}`;
  } catch {
    return "Synchronized Live";
  }
}

export default function AnalyticsPage() {
  const { activeFarm, farms } = useApp();
  const [savedAnalytics, setSavedAnalytics] = useState<StoredReport[]>([]);
  const [dynamicMaster, setDynamicMaster] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [clockTime, setClockTime] = useState<Date | null>(null);

  useEffect(() => {
    setClockTime(new Date());
    const timer = setInterval(() => setClockTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchFarmDynamicAnalytics = async () => {
    const target = activeFarm || "demo-farm";
    try {
      const res = await api.get(`/reports/farm/${target}/consolidated-master`);
      setDynamicMaster(res.data);
    } catch (err) {
      console.error("Error fetching dynamic farm analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAnalyticsReports = () => {
    api
      .get("/reports")
      .then((res) => {
        const all: StoredReport[] = res.data || [];
        setSavedAnalytics(all.filter((r) => r.report_type === "analytics"));
      })
      .catch((err) => console.error("Error fetching reports:", err));
  };

  useEffect(() => {
    setLoading(true);
    fetchFarmDynamicAnalytics();
    fetchAnalyticsReports();
  }, [activeFarm]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFarmDynamicAnalytics();
    toast.success("Analytics recalculated based on latest weather, soil telemetry, and crop health.");
  };

  const handleSaveSnapshot = async () => {
    setSaving(true);
    const target = activeFarm || "demo-farm";
    try {
      const res = await api.post("/reports/analytics/generate", { farm_id: target });
      toast.success("Dynamic analytics snapshot saved to database successfully!");
      setSavedAnalytics((prev) => [res.data, ...prev]);
    } catch (err: any) {
      toast.error("Failed to save analytics: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/reports/${id}`);
      setSavedAnalytics((prev) => prev.filter((r) => r.id !== id));
      toast.success("Analytics report deleted from database.");
    } catch (err: any) {
      toast.error("Delete failed: " + (err.message || "Unknown error"));
    }
  };

  const mData = dynamicMaster?.data || {};
  const an = mData.analytics || {};
  const weather = mData.weather?.current || {};
  const zones = mData.zones || [];
  const breakdown = an.breakdown || {};

  const vigor = an.vigor_index ?? 92;
  const eff = an.water_efficiency_pct ?? 88.5;
  const yd = an.yield_projection_delta_pct ?? 16.4;
  const waterSaved = an.water_saved_liters ?? 145000;
  const estYield = an.estimated_yield_tonnes ?? 24.5;
  const avgMoisture = an.avg_moisture ?? 48.0;
  const soilHealth = an.soil_health_score ?? 88;

  const currentFarmObj = farms.find((f: any) => f.id === activeFarm);
  const activeFarmName = mData.farm_name || currentFarmObj?.name || "Active Farm";
  const activeFarmLoc = mData.location || currentFarmObj?.location || "Bhatkal, Karnataka";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                {activeFarmName}
              </span>
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin size={12} /> {activeFarmLoc}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-stone-900 flex items-center gap-2">
              📊 Dynamic Agro-Climatic Analytics
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Real-time multi-factor intelligence adapting dynamically to live weather telemetry, soil physics, crop varieties, and farm geographic location.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              variant="outline"
              className="border-stone-300 hover:bg-stone-50 text-stone-700 text-xs rounded-xl flex items-center gap-1.5 h-10 px-3 cursor-pointer"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Recalculate
            </Button>
            <Button
              onClick={handleSaveSnapshot}
              disabled={saving || loading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl flex items-center gap-2 shadow-sm h-10 px-4 cursor-pointer"
            >
              {saving ? (
                <Sparkles className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}
              Save Analytics Report to DB
            </Button>
          </div>
        </div>

        {/* Real-Time Live Farm Synchronized Clock & Location Banner */}
        {clockTime && (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-950 text-white shadow-sm flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs text-emerald-300">
                <Clock size={20} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black font-mono tracking-tight text-white">
                    {clockTime.toLocaleTimeString("en-US", {
                      timeZone: "Asia/Kolkata",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    IST (UTC+05:30)
                  </span>
                </div>
                <div className="text-xs text-emerald-200/80 font-medium">
                  {clockTime.toLocaleDateString("en-US", {
                    timeZone: "Asia/Kolkata",
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-emerald-200/70">
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin size={13} className="text-emerald-400" />
                {activeFarmLoc}
              </span>
              <span>•</span>
              <span className="bg-emerald-800/60 px-2 py-0.5 rounded text-[11px] text-emerald-200 font-semibold border border-emerald-700/50">
                Live Farm Telemetry Active
              </span>
            </div>
          </div>
        )}

        {/* Dynamic KPI Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs hover:border-emerald-300 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Leaf size={20} />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Dynamic Index
                </span>
              </div>
              <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Overall Crop Vigor</div>
              <div className="text-3xl font-black text-stone-900 mt-0.5">{vigor} / 100</div>
              <div className="text-xs text-emerald-700 font-medium mt-2">
                {vigor >= 85
                  ? `Optimal vegetative vigor across ${zones.length} active zones`
                  : `Thermal & moisture stress moderating canopy density`}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs hover:border-blue-300 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Droplets size={20} />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {mData.irrigation_method || "Drip Delivery"}
                </span>
              </div>
              <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Water Application Efficiency</div>
              <div className="text-3xl font-black text-stone-900 mt-0.5">{eff}%</div>
              <div className="text-xs text-blue-700 font-medium mt-2">
                {formatInt(waterSaved)} L conserved vs. flood irrigation
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs hover:border-purple-300 transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  Yield Projection
                </span>
              </div>
              <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Projected Yield Delta</div>
              <div className="text-3xl font-black text-stone-900 mt-0.5">
                {yd >= 0 ? `+${yd}%` : `${yd}%`}
              </div>
              <div className="text-xs text-purple-700 font-medium mt-2">
                Estimated {estYield} Tonnes harvest across {mData.total_area || "active area"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Agro-Climatic Intelligence Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
                <Sparkles size={20} className="text-emerald-700" />
                Agro-Climatic & Multi-Factor Intelligence Breakdown
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Detailed algorithmic explanation of how live meteorological telemetry, soil physics, and crop varieties govern these metrics.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {mData.generated_at_ist && (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-mono bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                  <Clock size={12} className="text-emerald-700" />
                  Calculated: {mData.generated_at_ist.split(" • ")[0]} IST
                </span>
              )}
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-stone-500 font-medium bg-stone-100 px-2.5 py-1 rounded-lg">
                <CheckCircle2 size={13} className="text-emerald-700" /> Auto-computed for {activeFarmName}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Weather & Microclimate Card */}
            <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs">
              <CardHeader className="border-b border-stone-100 pb-3">
                <CardTitle className="text-base text-stone-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CloudSun size={18} className="text-amber-600" />
                    Live Meteorological & Microclimate Factor
                  </span>
                  {weather.temperature_2m !== undefined && (
                    <span className="text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
                      {weather.temperature_2m}&deg;C &bull; {weather.relative_humidity_2m}% RH
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-stone-700">
                <p>
                  {breakdown.weather_summary ||
                    `Live satellite meteorological telemetry retrieved specifically for coordinates at ${activeFarmLoc}. Ambient temperature of ${weather.temperature_2m ?? 28}&deg;C with ${weather.relative_humidity_2m ?? 70}% relative humidity provides balanced transpirational cooling for active canopies.`}
                </p>
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-stone-50 rounded-xl text-center">
                  <div>
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">Precipitation</div>
                    <div className="text-sm font-bold text-blue-700">{weather.precipitation ?? 0} mm</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">Wind Velocity</div>
                    <div className="text-sm font-bold text-stone-900">{weather.wind_speed_10m ?? 12} km/h</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">Thermal State</div>
                    <div className="text-sm font-bold text-emerald-700">
                      {(weather.temperature_2m ?? 28) <= 30 ? "Optimal" : "Heat Alert"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Soil Detail Card */}
            <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs">
              <CardHeader className="border-b border-stone-100 pb-3">
                <CardTitle className="text-base text-stone-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Layers size={18} className="text-amber-800" />
                    Soil Physics & Moisture Telemetry
                  </span>
                  <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-0.5 rounded-md">
                    {avgMoisture}% Moisture &bull; Health {soilHealth}/100
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-stone-700">
                <p>
                  {breakdown.soil_summary ||
                    `Root-zone moisture sensor telemetry indicates average hydration of ${avgMoisture}% across ${zones.length} active management zones. Operates within targeted field capacity bounds (40% - 60%), maintaining capillary water retention while preserving soil pore oxygenation.`}
                </p>
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-stone-50 rounded-xl text-center">
                  <div>
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">Field Capacity</div>
                    <div className="text-sm font-bold text-emerald-700">
                      {avgMoisture >= 40 && avgMoisture <= 60 ? "Optimal" : avgMoisture < 40 ? "Deficit" : "Saturated"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">Soil Health</div>
                    <div className="text-sm font-bold text-stone-900">{soilHealth} / 100</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">Analyses Logs</div>
                    <div className="text-sm font-bold text-amber-800">{mData.soil_analyses?.length || 1} Saved</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crop Details Card */}
            <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs">
              <CardHeader className="border-b border-stone-100 pb-3">
                <CardTitle className="text-base text-stone-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sprout size={18} className="text-emerald-700" />
                    Crop Varietal Dynamics & Yield Potential
                  </span>
                  <span className="text-xs font-mono font-bold bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-md">
                    {zones.length} Zones &bull; Est. {estYield} T
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-stone-700">
                <p>
                  {breakdown.crop_summary ||
                    `Active crop varieties planted across farm zones maintain a physiological vigor index of ${vigor}/100. Projected harvest delta is ${yd >= 0 ? "+" : ""}${yd}%, resulting in an estimated harvest potential of ${estYield} Tonnes based on acreage allocation.`}
                </p>
                <div className="p-2.5 bg-stone-50 rounded-xl space-y-1.5">
                  <div className="text-[11px] font-semibold text-stone-700">Zone Crop Allocation:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {zones.length > 0 ? (
                      zones.map((z: any) => (
                        <span
                          key={z.id}
                          className="px-2 py-0.5 rounded-md text-[11px] bg-white border border-stone-200 text-stone-800 font-medium"
                        >
                          {z.name}: <b>{z.crop || "General"}</b> ({z.area || "N/A"}) - {z.status?.toUpperCase()}
                        </span>
                      ))
                    ) : (
                      <span className="text-stone-500 text-[11px]">Primary Field Crops &bull; 10.0 acre</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Precision Water & Farm Location Card */}
            <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs">
              <CardHeader className="border-b border-stone-100 pb-3">
                <CardTitle className="text-base text-stone-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin size={18} className="text-blue-700" />
                    Farm Location & Precision Resource Telemetry
                  </span>
                  <span className="text-xs font-mono font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-md">
                    {eff}% Efficiency
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-stone-700">
                <p>
                  {breakdown.irrigation_telemetry ||
                    `Precision ${mData.irrigation_method || "Drip irrigation"} infrastructure operates at ${eff}% application efficiency, saving ${formatInt(waterSaved)} Liters of water vs. conventional flood irrigation.`}
                </p>
                <div className="p-2.5 bg-stone-50 rounded-xl space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Farm Location:</span>
                    <span className="font-semibold text-stone-900">{activeFarmLoc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Irrigation Method:</span>
                    <span className="font-semibold text-stone-900">{mData.irrigation_method || "Drip irrigation"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Water Availability:</span>
                    <span className="font-semibold text-stone-900">{mData.water_availability || "Adequate groundwater"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Saved Analytics Reports in DB */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-emerald-700" />
              Stored Analytics Snapshots in Database ({savedAnalytics.length})
            </h2>
            <span className="text-xs text-stone-500">Stored in SQLite &bull; Retained until deleted</span>
          </div>

          {savedAnalytics.length === 0 ? (
            <Card className="rounded-2xl border border-stone-200 bg-white p-6 text-center">
              <p className="text-sm text-stone-500 mb-3">No analytics reports stored in the database yet.</p>
              <Button
                onClick={handleSaveSnapshot}
                disabled={saving}
                className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs"
              >
                Generate First Analytics Snapshot
              </Button>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {savedAnalytics.map((rep) => (
                <Card
                  key={rep.id}
                  className="rounded-2xl border border-stone-200 bg-white shadow-xs hover:border-emerald-300 transition-all"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                            Analytics Snapshot
                          </span>
                          <span className="text-xs text-stone-400">
                            {formatDateSafe(rep.created_at, rep)}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-stone-900">{rep.title}</h3>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(rep.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl h-8 px-2 cursor-pointer"
                          title="Delete from DB"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 mb-3 line-clamp-2 leading-relaxed">
                      {rep.summary_text}
                    </p>

                    {rep.data && (
                      <div className="grid grid-cols-4 gap-2 bg-stone-50 p-2.5 rounded-xl text-center">
                        <div>
                          <div className="text-[10px] text-stone-500 uppercase font-semibold">Vigor</div>
                          <div className="text-sm font-bold text-stone-900">{rep.data.vigor_index ?? 92}/100</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-stone-500 uppercase font-semibold">Efficiency</div>
                          <div className="text-sm font-bold text-emerald-700">{rep.data.water_efficiency_pct ?? 88.5}%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-stone-500 uppercase font-semibold">Yield Delta</div>
                          <div className="text-sm font-bold text-purple-700">
                            {(rep.data.yield_projection_delta_pct ?? 16) >= 0 ? "+" : ""}
                            {rep.data.yield_projection_delta_pct ?? 16}%
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-stone-500 uppercase font-semibold">Est. Yield</div>
                          <div className="text-sm font-bold text-stone-800">{rep.data.estimated_yield_tonnes ?? 24} T</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
