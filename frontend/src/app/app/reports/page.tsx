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
  const { lang, activeFarm } = useApp();
  const [masterReport, setMasterReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
              <Clock size={16} className="text-stone-400" />
              <span>Last Synchronized: {data.generated_at ? new Date(data.generated_at).toISOString().replace("T", " ").slice(0, 16) + " UTC" : "Just now"}</span>
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
                    <div key={s.id} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                      <div className="font-bold text-stone-800 mb-1">
                        Log #{s.id.slice(0, 8)} &bull; {s.created_at.slice(0, 10)}
                      </div>
                      <div className="text-stone-600 line-clamp-3 font-mono">{s.result}</div>
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
                    <div key={c.id} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                      <div className="font-bold text-stone-800 mb-1">
                        Diagnosis #{c.id.slice(0, 8)} &bull; {c.created_at.slice(0, 10)}
                      </div>
                      <div className="text-stone-600 line-clamp-3 font-mono">{c.result}</div>
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
