"use client";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "@/lib/navigation";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { Camera, Droplets, Thermometer, Leaf, ArrowLeft } from "lucide-react";

export default function ZoneDetailPage() {
  const params = useParams();
  const id = params.id;
  const nav = useNavigate();
  const { lang } = useApp();
  const [zone, setZone] = useState<any>(null);
  const [reading, setReading] = useState<any>(null);

  const load = async () => {
    if (!id) return;
    try {
      const r = await api.get(`/zones/${id}`);
      setZone(r.data);
      const s = await api.get(`/zones/${id}/sensor`);
      setReading(s.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (!zone) {
    return (
      <Layout>
        <div className="text-stone-500 py-12 text-center">Loading zone...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <button
        data-testid="back-btn"
        onClick={() => nav(-1)}
        className="flex items-center gap-1 text-sm text-stone-600 mb-3 hover:text-stone-900 cursor-pointer"
      >
        <ArrowLeft size={14} /> Back
      </button>
      <h1 className="text-3xl font-extrabold text-stone-900 mb-1">{zone.name}</h1>
      <p className="text-sm text-stone-600 mb-4">
        {zone.crop || "No crop"} · {zone.soil_type || "No soil info"}
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Card className="rounded-2xl border border-stone-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="text-blue-600" size={16} />
              <span className="text-xs font-semibold uppercase text-stone-600">{t(lang, "moisture")}</span>
            </div>
            <div className="text-2xl font-black mb-1">{reading?.moisture_pct ?? zone.last_moisture ?? 45}%</div>
            <StatusBadge kind="SIMULATED" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-stone-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="text-rose-600" size={16} />
              <span className="text-xs font-semibold uppercase text-stone-600">{t(lang, "temperature")}</span>
            </div>
            <div className="text-2xl font-black mb-1">{reading?.temperature_c ?? 28}°C</div>
            <StatusBadge kind="SIMULATED" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-stone-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="text-emerald-600" size={16} />
              <span className="text-xs font-semibold uppercase text-stone-600">{t(lang, "humidity")}</span>
            </div>
            <div className="text-2xl font-black mb-1">{reading?.humidity_pct ?? 60}%</div>
            <StatusBadge kind="SIMULATED" />
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => nav(`/app/soil?zone=${id}`)}
          data-testid="zone-analyze-soil"
          className="bg-emerald-700 hover:bg-emerald-800"
        >
          <Camera size={16} className="mr-1" /> Analyze Soil
        </Button>
        <Button
          onClick={() => nav(`/app/plant?zone=${id}`)}
          variant="outline"
          data-testid="zone-analyze-plant"
        >
          <Leaf size={16} className="mr-1" /> Analyze Plant
        </Button>
      </div>

      <Card className="rounded-2xl border border-stone-200 bg-white">
        <CardHeader>
          <CardTitle>Recent Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          {(zone.analyses || []).length === 0 ? (
            <p className="text-sm text-stone-500">No analyses yet.</p>
          ) : (
            zone.analyses.map((a: any) => (
              <div key={a.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 mb-2">
                <div className="flex justify-between mb-1 items-center">
                  <span className="text-xs font-bold uppercase text-stone-800">{a.type}</span>
                  <StatusBadge kind="AI_IMAGE_ANALYSIS" />
                </div>
                <div className="text-xs text-stone-500 mb-1">
                  {new Date(a.created_at).toLocaleString()}
                </div>
                <div className="text-sm text-stone-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {a.result}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
