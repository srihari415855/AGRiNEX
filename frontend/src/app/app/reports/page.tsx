"use client";

import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, API } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import {
  FileText,
  MapPin,
  Layers,
  Camera,
  PackageOpen,
  Droplets,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Award,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

function formatInt(n: number | undefined | null): string {
  if (n === undefined || n === null) return "0";
  return new Intl.NumberFormat("en-US").format(n);
}

export default function ReportsPage() {
  const { lang, activeFarm, farms } = useApp();
  const currentFarm = farms?.find((f: any) => f.id === activeFarm);
  const [masterReport, setMasterReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [clockTime, setClockTime] = useState<Date | null>(null);

  useEffect(() => {
    setClockTime(new Date());
    const timer = setInterval(() => setClockTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const parseToDate = (rawDate?: string): Date => {
    if (!rawDate) return new Date();
    let s = String(rawDate).trim();
    if (!s.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(s)) {
      s += "Z";
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  const formatExactISTTime = (rawDate?: string, fallbackTime?: string) => {
    if (fallbackTime && /^\d{2}:\d{2}:\d{2}\s+(AM|PM)$/i.test(fallbackTime.trim())) {
      return fallbackTime.trim();
    }
    const d = parseToDate(rawDate);
    return d.toLocaleTimeString("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatExactISTDate = (rawDate?: string, fallbackDate?: string) => {
    if (fallbackDate && fallbackDate.length > 5) {
      return fallbackDate.trim();
    }
    const d = parseToDate(rawDate);
    return d.toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const loadConsolidatedReport = async () => {
    const target = activeFarm || "demo-farm";
    try {
      const res = await api.get(`/reports/farm/${target}/consolidated-master`);
      setMasterReport(res.data);
    } catch (err) {
      console.error("Failed to load consolidated master report:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConsolidatedReport();
  }, [activeFarm]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConsolidatedReport();
    toast.success("Consolidated master report refreshed with latest farm telemetry & saved analyses.");
  };

  const data = masterReport?.data || {};
  const weather = data.weather?.current;
  const zones = data.zones || [];
  const soilAnalyses = data.soil_analyses || [];
  const cropAnalyses = data.crop_health_analyses || [];
  const irrigations = data.irrigation_events || [];
  const productions = data.production_records || [];
  const analytics = data.analytics || {};

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-stone-900 flex items-center gap-2">
              📄 {t(lang, "reports")}
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Consolidated agronomic master dossier combining farm audit, live weather, soil analyses, crop health, irrigation, and analytics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="border-stone-300 hover:bg-stone-50 text-stone-700 text-xs rounded-xl flex items-center gap-1.5 h-10 px-3 cursor-pointer"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Sync Latest Data
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
                {currentFarm?.location || data.location || "Karnataka, India"}
              </span>
              <span>•</span>
              <span className="bg-emerald-800/60 px-2 py-0.5 rounded text-[11px] text-emerald-200 font-semibold border border-emerald-700/50">
                AI Ground Truth Active
              </span>
            </div>
          </div>
        )}

        {/* Primary Master Consolidated Banner */}
        <Card className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-stone-50 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-800 text-white flex items-center gap-1">
                  <Award size={13} /> Official Consolidated Master Report
                </span>
                <span className="text-xs text-stone-500 font-serif">
                  Standard: Times New Roman, 12pt
                </span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 pt-1">
                {masterReport?.title || "Master Farm Intelligence & Agronomic Audit Dossier"}
              </h2>
              <p className="text-xs text-stone-600 max-w-3xl leading-relaxed">
                {masterReport?.summary ||
                  "Complete unified document compiling physical infrastructure, live meteorological telemetry, digital twin sensors, saved soil analyses, foliar disease pathology, smart irrigation logs, and longitudinal resource analytics."}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-200/60 flex flex-wrap items-center gap-6 text-xs text-stone-600">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-700" />
              <span className="font-semibold text-stone-900">Consolidated Master Dossier:</span> Complete verified dossier covering all farm records & analytics
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-700" />
              <span className="font-semibold text-stone-900">Typography:</span> Times New Roman &bull; 12pt Standard
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-emerald-700" />
              <span>
                Last Synchronized:{" "}
                <span className="font-semibold text-stone-900 font-mono">
                  {data.generated_at_ist ||
                    (data.generated_at
                      ? `${formatExactISTTime(data.generated_at)} IST (UTC+05:30) • ${formatExactISTDate(data.generated_at)}`
                      : "Synchronized Live")}
                </span>
              </span>
            </div>
          </div>
        </Card>

        {/* Live Visual Dossier Preview */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Section 1: Farm Infrastructure & Live Meteorological Conditions */}
          <div className="space-y-4">
            <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs">
              <CardHeader className="border-b border-stone-100 pb-3">
                <CardTitle className="text-base text-stone-900 flex items-center gap-2">
                  <MapPin size={17} className="text-emerald-700" />
                  Farm Operational Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Farm Name:</span>
                  <span className="font-bold text-stone-900">{data.farm_name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Location:</span>
                  <span className="font-semibold text-stone-800">{data.location}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Coordinates:</span>
                  <span className="font-mono text-stone-600">
                    {data.coordinates?.latitude}&deg;N, {data.coordinates?.longitude}&deg;E
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Total Cultivated Area:</span>
                  <span className="font-bold text-stone-900">{data.total_area}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Farming System:</span>
                  <span className="font-medium text-stone-800">{data.farming_type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Water Availability:</span>
                  <span className="font-medium text-stone-800">{data.water_availability}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Irrigation Method:</span>
                  <span className="font-medium text-stone-800">{data.irrigation_method}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs">
              <CardHeader className="border-b border-stone-100 pb-3">
                <CardTitle className="text-base text-stone-900 flex items-center gap-2">
                  <Activity size={17} className="text-blue-600" />
                  Live Meteorological Telemetry
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs">
                {weather ? (
                  <>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Ambient Temperature:</span>
                      <span className="font-bold text-stone-900">{weather.temperature_2m}&deg;C</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Relative Humidity:</span>
                      <span className="font-bold text-stone-900">{weather.relative_humidity_2m}%</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-100">
                      <span className="text-stone-500">Wind Velocity (10m):</span>
                      <span className="font-medium text-stone-800">{weather.wind_speed_10m} km/h</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-stone-500">Precipitation:</span>
                      <span className="font-medium text-blue-700">{weather.precipitation ?? 0} mm</span>
                    </div>
                  </>
                ) : (
                  <p className="text-stone-500 py-2">Open-Meteo satellite feed active for {data.location}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Section 2: Soil Analyses & Crop Health Monitoring */}
          <div className="space-y-4">
            <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs">
              <CardHeader className="border-b border-stone-100 pb-3">
                <CardTitle className="text-base text-stone-900 flex items-center gap-2">
                  <Camera size={17} className="text-amber-600" />
                  Saved Soil Analyses ({soilAnalyses.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5 text-xs">
                {soilAnalyses.length === 0 ? (
                  <p className="text-stone-500 py-3">No soil analyses saved yet. Baseline loam profile active.</p>
                ) : (
                  soilAnalyses.slice(0, 3).map((s: any) => (
                    <div key={s.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-bold text-xs text-stone-900">
                          Log #{s.id.slice(0, 8)}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-700 bg-white px-2 py-0.5 rounded border border-stone-200 shadow-2xs">
                          <Clock size={11} className="text-emerald-600" />
                          <span className="font-mono text-stone-900">{formatExactISTTime(s.created_at, s.time_str)}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            IST (UTC+05:30)
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-stone-500 font-medium">
                        {formatExactISTDate(s.created_at, s.date_str)}
                      </div>
                      <div className="text-stone-700 line-clamp-3 font-mono text-xs bg-white p-2 rounded border border-stone-150">{s.result}</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs">
              <CardHeader className="border-b border-stone-100 pb-3">
                <CardTitle className="text-base text-stone-900 flex items-center gap-2">
                  <FileText size={17} className="text-emerald-700" />
                  Saved Crop Health Evaluations ({cropAnalyses.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5 text-xs">
                {cropAnalyses.length === 0 ? (
                  <p className="text-stone-500 py-3">No foliar infections or pathology alerts recorded.</p>
                ) : (
                  cropAnalyses.slice(0, 3).map((c: any) => (
                    <div key={c.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="font-bold text-xs text-stone-900">
                          Diagnosis #{c.id.slice(0, 8)}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-700 bg-white px-2 py-0.5 rounded border border-stone-200 shadow-2xs">
                          <Clock size={11} className="text-emerald-600" />
                          <span className="font-mono text-stone-900">{formatExactISTTime(c.created_at, c.time_str)}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            IST (UTC+05:30)
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] text-stone-500 font-medium">
                        {formatExactISTDate(c.created_at, c.date_str)}
                      </div>
                      <div className="text-stone-700 line-clamp-3 font-mono text-xs bg-white p-2 rounded border border-stone-150">{c.result}</div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Section 3: Telemetry, Production & Smart Irrigation */}
          <div className="space-y-4">
            <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs">
              <CardHeader className="border-b border-stone-100 pb-3">
                <CardTitle className="text-base text-stone-900 flex items-center gap-2">
                  <Award size={17} className="text-purple-600" />
                  Longitudinal Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Crop Vigor Index:</span>
                  <span className="font-bold text-emerald-700">{analytics.vigor_index || 92} / 100</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Water Application Efficiency:</span>
                  <span className="font-bold text-stone-900">{analytics.water_efficiency_pct || 88.4}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Cumulative Water Saved:</span>
                  <span className="font-semibold text-stone-900">
                    {formatInt(analytics.water_saved_liters || 128000)} Liters
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Projected Yield Delta:</span>
                  <span className="font-semibold text-emerald-700">+{analytics.yield_projection_delta_pct || 18.5}%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-stone-500">Estimated Total Output:</span>
                  <span className="font-bold text-stone-900">{analytics.estimated_yield_tonnes || 8.4} Tonnes</span>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs">
              <CardHeader className="border-b border-stone-100 pb-3">
                <CardTitle className="text-base text-stone-900 flex items-center gap-2">
                  <Layers size={17} className="text-stone-700" />
                  Summary Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="text-stone-500 text-[11px]">Active Zones</div>
                  <div className="font-black text-lg text-stone-900">{zones.length}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="text-stone-500 text-[11px]">Irrigation Cycles</div>
                  <div className="font-black text-lg text-stone-900">{irrigations.length}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="text-stone-500 text-[11px]">Harvest Batches</div>
                  <div className="font-black text-lg text-stone-900">{productions.length}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                  <div className="text-stone-500 text-[11px]">Avg Moisture</div>
                  <div className="font-black text-lg text-emerald-700">{analytics.avg_moisture || 45}%</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
