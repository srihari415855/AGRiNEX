"use client";
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api, fileToBase64 } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { Camera, Upload, Clock, Trash2, CheckCircle2, History, MapPin } from "lucide-react";
import { useSearchParams } from "@/lib/navigation";

export default function ImageAnalyzerView({
  type,
}: {
  type: "soil" | "plant" | "production";
}) {
  const { lang, activeFarm, farms } = useApp();
  const currentFarm = farms?.find((f: any) => f.id === activeFarm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
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

  const [params] = useSearchParams();
  const zoneId = params.get("zone");

  const fetchHistory = () => {
    setLoadingHistory(true);
    const farmParam = activeFarm ? `farm_id=${activeFarm}&` : "";
    api
      .get(`/analyses?${farmParam}type=${type}`)
      .then((res) => {
        setSavedAnalyses(res.data || []);
      })
      .catch((err) => console.error("Failed to load past analyses", err))
      .finally(() => setLoadingHistory(false));
  };

  useEffect(() => {
    fetchHistory();
  }, [activeFarm, type]);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const analyze = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const { base64, mime } = await fileToBase64(file);
      const r = await api.post("/analyze/image", {
        image_base64: base64,
        mime_type: mime,
        analysis_type: type,
        zone_id: zoneId || null,
        farm_id: activeFarm || null,
        language: lang,
      });
      setResult(r.data);
      toast.success("Analysis complete & saved to farm history");
      fetchHistory();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Analysis failed");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAnalysis = async (id: string) => {
    try {
      await api.delete(`/analyses/${id}`);
      setSavedAnalyses((prev) => prev.filter((item) => item.id !== id));
      if (result?.id === id) setResult(null);
      toast.success("Analysis record deleted");
    } catch (err: any) {
      toast.error("Failed to delete analysis: " + err.message);
    }
  };

  const titles = {
    soil: t(lang, "soil_analysis"),
    plant: t(lang, "crop_health"),
    production: t(lang, "production"),
  };
  const hints = {
    soil: t(lang, "upload_soil_hint"),
    plant: t(lang, "upload_plant_hint"),
    production: t(lang, "upload_prod_hint"),
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 mb-1">📸 {titles[type]}</h1>
          <p className="text-sm text-stone-600">{hints[type]}</p>
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
                {currentFarm?.location || "Karnataka, India"}
              </span>
              <span>•</span>
              <span className="bg-emerald-800/60 px-2 py-0.5 rounded text-[11px] text-emerald-200 font-semibold border border-emerald-700/50">
                AI Ground Truth Active
              </span>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="rounded-2xl border border-stone-200 bg-white shadow-2xs">
            <CardContent className="p-6">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-64 object-cover rounded-xl mb-3 border border-stone-200"
                />
              ) : (
                <div className="w-full h-64 rounded-xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-500 mb-3">
                  <Camera size={40} className="mb-2 opacity-50" />
                  <span className="text-sm">No image selected</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="flex-1">
                  <input
                    data-testid={`${type}-camera-input`}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                  <div className="flex items-center justify-center gap-2 h-11 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold cursor-pointer transition">
                    <Camera size={16} /> {t(lang, "take_photo")}
                  </div>
                </label>
                <label className="flex-1">
                  <input
                    data-testid={`${type}-upload-input`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                  <div className="flex items-center justify-center gap-2 h-11 rounded-lg border border-stone-300 hover:bg-stone-50 text-sm font-semibold cursor-pointer transition">
                    <Upload size={16} /> {t(lang, "upload_photo")}
                  </div>
                </label>
              </div>
              <Button
                data-testid={`${type}-analyze-btn`}
                disabled={!file || busy}
                onClick={analyze}
                className="w-full mt-3 h-11 bg-emerald-700 hover:bg-emerald-800 cursor-pointer disabled:opacity-50 text-white font-bold"
              >
                {busy ? t(lang, "analyzing") : t(lang, "analyze")}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-stone-200 bg-white shadow-2xs">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span>AI Vision Diagnostic Report</span>
              </CardTitle>
              {result && <StatusBadge kind="AI_IMAGE_ANALYSIS" />}
            </CardHeader>
            <CardContent>
              {!result && (
                <div className="py-8 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
                    <Clock size={22} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">Real-Time Farm Telemetry Synchronized</h3>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                      Upload or capture a photo and click Analyze. Live telemetry time is synchronized with the dashboard and will be permanently stamped on this diagnostic report.
                    </p>
                  </div>
                  {clockTime && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-mono text-stone-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="font-black text-stone-900">
                        {clockTime.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        IST (UTC+05:30)
                      </span>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-600 font-sans">
                        {clockTime.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata", weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {result && (
                <div>
                  {/* Exact Dashboard Clock & Telemetry Banner for the Report */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-950 to-emerald-900 text-white shadow-sm flex items-center justify-between flex-wrap gap-3 mb-3 border border-emerald-800/60">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs text-emerald-300">
                        <Clock size={18} className="animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black font-mono tracking-tight text-white">
                            {formatExactISTTime(result.created_at, result.time_str)}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            IST (UTC+05:30)
                          </span>
                        </div>
                        <div className="text-xs text-emerald-200/80 font-medium">
                          {formatExactISTDate(result.created_at, result.date_str)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-emerald-200/80">
                      <span className="flex items-center gap-1 font-medium text-emerald-300">
                        <MapPin size={12} className="text-emerald-400" />
                        {currentFarm?.location || "Karnataka, India"}
                      </span>
                      <span>•</span>
                      <span className="bg-emerald-800/80 px-2.5 py-1 rounded-lg text-xs text-emerald-200 font-semibold border border-emerald-700/60 flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        Saved in Database
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-stone-800 leading-relaxed max-h-[480px] overflow-y-auto bg-stone-50 p-4 sm:p-5 rounded-xl border border-stone-200 space-y-2">
                    {result.result.split("\n").map((line: string, i: number) => {
                      const trimmed = line.trim();
                      if (!trimmed) return <div key={i} className="h-1" />;
                      if (/^(\d+\.|\#+|\*\*)[A-Za-z\s&/•]+:?(\*\*)?$/.test(trimmed) && trimmed.length < 60) {
                        return (
                          <div key={i} className="pt-2 font-black text-emerald-950 text-sm border-b border-emerald-200/60 pb-0.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                            <span>{trimmed.replace(/^(\#+|\*+|\d+\.)\s*/, "").replace(/\*+$/, "")}</span>
                          </div>
                        );
                      }
                      if (trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                        const content = trimmed.replace(/^[•\-\*]\s*/, "");
                        const colonIdx = content.indexOf(":");
                        if (colonIdx > 0 && colonIdx < 35) {
                          const label = content.slice(0, colonIdx);
                          const rest = content.slice(colonIdx + 1);
                          return (
                            <div key={i} className="pl-2 flex items-start gap-1.5 text-xs sm:text-sm text-stone-700">
                              <span className="text-emerald-600 font-bold shrink-0">•</span>
                              <div>
                                <span className="font-bold text-stone-900">{label}:</span>
                                <span>{rest}</span>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={i} className="pl-2 flex items-start gap-1.5 text-xs sm:text-sm text-stone-700">
                            <span className="text-emerald-600 font-bold shrink-0">•</span>
                            <span>{content}</span>
                          </div>
                        );
                      }
                      return (
                        <p key={i} className="text-xs sm:text-sm text-stone-700">
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Saved Analyses History for the Farm */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <History size={18} className="text-emerald-700" />
              Saved {titles[type]} History ({savedAnalyses.length})
            </h2>
            <span className="text-xs text-stone-500">
              Preserved in database &bull; Included in Consolidated Master Report
            </span>
          </div>

          {savedAnalyses.length === 0 ? (
            <Card className="rounded-2xl border border-stone-200 bg-white p-6 text-center text-sm text-stone-500">
              No saved {titles[type].toLowerCase()} records yet for this farm. Upload and analyze an image above to save your first evaluation.
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {savedAnalyses.map((item) => (
                <Card
                  key={item.id}
                  className="rounded-xl border border-stone-200 bg-white p-4 hover:border-emerald-300 transition shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Log #{item.id.slice(0, 8)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-700 font-semibold flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                        <Clock size={12} className="text-emerald-600" />
                        <span className="font-mono font-bold text-stone-900">{formatExactISTTime(item.created_at, item.time_str)}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          IST (UTC+05:30)
                        </span>
                        <span className="text-stone-400">•</span>
                        <span className="text-stone-600">{formatExactISTDate(item.created_at, item.date_str)}</span>
                      </span>
                      <button
                        onClick={() => handleDeleteAnalysis(item.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-stone-700 whitespace-pre-wrap line-clamp-4 bg-stone-50 p-2.5 rounded-lg font-mono">
                    {item.result}
                  </div>
                  <button
                    onClick={() => setResult(item)}
                    className="mt-2 text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                  >
                    View Full Diagnostic Details &rarr;
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
