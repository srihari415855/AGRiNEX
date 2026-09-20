import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, fileToBase64 } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { Camera, Droplets, Thermometer, Leaf, Trash2, Plus, ArrowLeft, Upload } from "lucide-react";

export function Zones() {
  const { lang, activeFarm } = useApp();
  const nav = useNavigate();
  const [zones, setZones] = useState([]);
  const [newZone, setNewZone] = useState({ name: "", crop: "", soil_type: "", area: "" });

  const load = async () => {
    if (!activeFarm) return;
    const r = await api.get(`/farms/${activeFarm}/zones`);
    setZones(r.data);
  };
  useEffect(() => { load(); }, [activeFarm]);

  const add = async () => {
    if (!newZone.name.trim()) return;
    await api.post(`/farms/${activeFarm}/zones`, {
      name: newZone.name, crop: newZone.crop || null, soil_type: newZone.soil_type || null,
      area: newZone.area ? parseFloat(newZone.area) : null,
    });
    setNewZone({ name: "", crop: "", soil_type: "", area: "" });
    toast.success("Zone added");
    load();
  };
  const del = async (id) => {
    await api.delete(`/zones/${id}`);
    toast.success("Zone deleted");
    load();
  };

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-stone-900">{t(lang, "zones")}</h1>
        <Card className="rounded-2xl"><CardHeader><CardTitle>{t(lang, "add_zone")}</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 lg:grid-cols-5 gap-2">
            <Input data-testid="new-zone-name" placeholder={t(lang, "zone_name")} value={newZone.name} onChange={e => setNewZone({...newZone, name: e.target.value})} />
            <Input data-testid="new-zone-area" placeholder={t(lang, "area")} type="number" value={newZone.area} onChange={e => setNewZone({...newZone, area: e.target.value})} />
            <Input data-testid="new-zone-crop" placeholder={t(lang, "zone_crop")} value={newZone.crop} onChange={e => setNewZone({...newZone, crop: e.target.value})} />
            <Input data-testid="new-zone-soil" placeholder={t(lang, "zone_soil")} value={newZone.soil_type} onChange={e => setNewZone({...newZone, soil_type: e.target.value})} />
            <Button data-testid="add-zone-submit" onClick={add} className="bg-emerald-700 hover:bg-emerald-800"><Plus size={16} className="mr-1" />Add</Button>
          </CardContent>
        </Card>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {zones.map(z => (
            <Card key={z.id} className="rounded-2xl">
              <CardContent className="p-4">
                <div className="flex justify-between mb-2">
                  <div className="font-bold">{z.name}</div>
                  <button data-testid={`del-zone-${z.id}`} onClick={() => del(z.id)} className="text-rose-600"><Trash2 size={14} /></button>
                </div>
                <div className="text-xs text-stone-600 mb-2">{z.crop || "—"} · {z.soil_type || "—"} · {z.area || "—"} {z.area_unit}</div>
                <Button size="sm" variant="outline" onClick={() => nav(`/app/zones/${z.id}`)} data-testid={`view-zone-${z.id}`}>View</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export function ZoneDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { lang } = useApp();
  const [zone, setZone] = useState(null);
  const [reading, setReading] = useState(null);

  const load = async () => {
    const r = await api.get(`/zones/${id}`);
    setZone(r.data);
    const s = await api.get(`/zones/${id}/sensor`);
    setReading(s.data);
  };
  useEffect(() => { load(); }, [id]);

  if (!zone) return <Layout><div>Loading...</div></Layout>;
  return (
    <Layout>
      <button data-testid="back-btn" onClick={() => nav(-1)} className="flex items-center gap-1 text-sm text-stone-600 mb-3"><ArrowLeft size={14} /> Back</button>
      <h1 className="text-3xl font-extrabold text-stone-900 mb-1">{zone.name}</h1>
      <p className="text-sm text-stone-600 mb-4">{zone.crop || "No crop"} · {zone.soil_type || "No soil info"}</p>
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><Droplets className="text-blue-600" size={16} /><span className="text-xs font-semibold uppercase text-stone-600">{t(lang, "moisture")}</span></div>
            <div className="text-2xl font-black">{reading?.moisture_pct}%</div>
            <StatusBadge kind="SIMULATED" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><Thermometer className="text-rose-600" size={16} /><span className="text-xs font-semibold uppercase text-stone-600">{t(lang, "temperature")}</span></div>
            <div className="text-2xl font-black">{reading?.temperature_c}°C</div>
            <StatusBadge kind="SIMULATED" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><Leaf className="text-emerald-600" size={16} /><span className="text-xs font-semibold uppercase text-stone-600">{t(lang, "humidity")}</span></div>
            <div className="text-2xl font-black">{reading?.humidity_pct}%</div>
            <StatusBadge kind="SIMULATED" />
          </CardContent>
        </Card>
      </div>
      <div className="flex gap-2 mb-4">
        <Button onClick={() => nav(`/app/soil?zone=${id}`)} data-testid="zone-analyze-soil"><Camera size={16} className="mr-1" />Analyze Soil</Button>
        <Button onClick={() => nav(`/app/plant?zone=${id}`)} variant="outline" data-testid="zone-analyze-plant"><Leaf size={16} className="mr-1" />Analyze Plant</Button>
      </div>
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Recent Analyses</CardTitle></CardHeader>
        <CardContent>
          {(zone.analyses || []).length === 0 ? <p className="text-sm text-stone-500">No analyses yet.</p> :
            zone.analyses.map(a => (
              <div key={a.id} className="p-3 rounded-lg bg-stone-50 border border-stone-200 mb-2">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-bold uppercase">{a.type}</span>
                  <StatusBadge kind="AI_IMAGE_ANALYSIS" />
                </div>
                <div className="text-xs text-stone-500 mb-1">{new Date(a.created_at).toLocaleString()}</div>
                <div className="text-sm text-stone-800 whitespace-pre-wrap max-h-40 overflow-y-auto">{a.result}</div>
              </div>
            ))
          }
        </CardContent>
      </Card>
    </Layout>
  );
}

export function ImageAnalyzer({ type }) {
  const { lang } = useApp();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const zoneId = params.get("zone");

  const onFile = (f) => {
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
        image_base64: base64, mime_type: mime, analysis_type: type,
        zone_id: zoneId || null, language: lang,
      });
      setResult(r.data);
      toast.success("Analysis complete");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Analysis failed");
    } finally { setBusy(false); }
  };

  const titles = { soil: t(lang, "soil_analysis"), plant: t(lang, "crop_health"), production: t(lang, "production") };
  const hints = { soil: t(lang, "upload_soil_hint"), plant: t(lang, "upload_plant_hint"), production: t(lang, "upload_prod_hint") };

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold text-stone-900 mb-1">📸 {titles[type]}</h1>
      <p className="text-sm text-stone-600 mb-4">{hints[type]}</p>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-64 object-cover rounded-xl mb-3" />
            ) : (
              <div className="w-full h-64 rounded-xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-500 mb-3">
                <Camera size={40} className="mb-2" />
                <span className="text-sm">No image selected</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex-1">
                <input data-testid={`${type}-camera-input`} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files[0])} />
                <div className="flex items-center justify-center gap-2 h-11 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold cursor-pointer">
                  <Camera size={16} /> {t(lang, "take_photo")}
                </div>
              </label>
              <label className="flex-1">
                <input data-testid={`${type}-upload-input`} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files[0])} />
                <div className="flex items-center justify-center gap-2 h-11 rounded-lg border border-stone-300 hover:bg-stone-50 text-sm font-semibold cursor-pointer">
                  <Upload size={16} /> {t(lang, "upload_photo")}
                </div>
              </label>
            </div>
            <Button data-testid={`${type}-analyze-btn`} disabled={!file || busy} onClick={analyze} className="w-full mt-3 h-11 bg-emerald-700 hover:bg-emerald-800">
              {busy ? t(lang, "analyzing") : t(lang, "analyze")}
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Analysis Result</CardTitle>
            {result && <StatusBadge kind="AI_IMAGE_ANALYSIS" />}
          </CardHeader>
          <CardContent>
            {!result && <p className="text-sm text-stone-500 py-10 text-center">Upload a photo and click Analyze.</p>}
            {result && (
              <div>
                <div className="text-xs text-stone-500 mb-2">{new Date(result.created_at).toLocaleString()}</div>
                <div className="text-sm text-stone-800 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">{result.result}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
