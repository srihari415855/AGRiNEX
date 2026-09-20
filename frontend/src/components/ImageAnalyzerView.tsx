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
import { Camera, Upload, Clock, Trash2, CheckCircle2, History } from "lucide-react";
import { useSearchParams } from "@/lib/navigation";

export default function ImageAnalyzerView({
  type,
}: {
  type: "soil" | "plant" | "production";
}) {
  const { lang, activeFarm } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="rounded-2xl border border-stone-200 bg-white">
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
                className="w-full mt-3 h-11 bg-emerald-700 hover:bg-emerald-800 cursor-pointer disabled:opacity-50"
              >
                {busy ? t(lang, "analyzing") : t(lang, "analyze")}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-stone-200 bg-white">
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Analysis Result</CardTitle>
              {result && <StatusBadge kind="AI_IMAGE_ANALYSIS" />}
            </CardHeader>
            <CardContent>
              {!result && (
                <p className="text-sm text-stone-500 py-16 text-center">
                  Upload a photo and click Analyze. All analyses will be saved to your farm record.
                </p>
              )}
              {result && (
                <div>
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                    <span>{new Date(result.created_at).toLocaleString()}</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Saved in Database
                    </span>
                  </div>
                  <div className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed max-h-[460px] overflow-y-auto font-mono bg-stone-50 p-4 rounded-xl border border-stone-200">
                    {result.result}
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
                      <span className="text-[11px] text-stone-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDeleteAnalysis(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 cursor-pointer"
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
