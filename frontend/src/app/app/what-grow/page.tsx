"use client";
import React, { useState } from "react";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

export default function WhatGrowPage() {
  const { lang, activeFarm } = useApp();
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<any>(null);

  const go = async () => {
    setBusy(true);
    try {
      const r = await api.post("/recommend/crop", {
        farm_id: activeFarm || "demo-farm",
        language: lang,
      });
      setData(r.data);
    } catch (e) {
      toast.error("Failed to generate recommendations");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold text-stone-900 mb-1">🌱 {t(lang, "what_grow")}</h1>
      <p className="text-sm text-stone-600 mb-4">
        AGRiNEX uses your farm context + current weather to suggest crops.
      </p>
      <Button
        data-testid="recommend-btn"
        onClick={go}
        disabled={busy}
        className="mb-6 bg-emerald-700 hover:bg-emerald-800 cursor-pointer disabled:opacity-50"
      >
        {busy ? t(lang, "generating") : t(lang, "recommend_crops")}
      </Button>

      {data && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            <StatusBadge kind="INDICATIVE" />
            <StatusBadge kind="AI_IMAGE_ANALYSIS">AI RECOMMENDATION</StatusBadge>
          </div>

          {data.structured?.crops ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.structured.crops.map((c: any, i: number) => (
                <Card key={i} className="rounded-2xl border border-stone-200 bg-white hover:shadow-md transition">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-bold text-lg text-stone-900">{c.name}</div>
                      <div className="text-emerald-700 font-extrabold bg-emerald-50 px-2.5 py-1 rounded-full text-sm border border-emerald-200">
                        {c.suitability_score}/100
                      </div>
                    </div>
                    <div className="text-xs text-stone-600 space-y-1.5 leading-relaxed">
                      <div>💧 <span className="font-medium">Water:</span> {c.water_requirement}</div>
                      <div>🌱 <span className="font-medium">Soil:</span> {c.soil_compatibility}</div>
                      <div>📅 <span className="font-medium">Season:</span> {c.season_suitability}</div>
                      <div>💰 <span className="font-medium">Est. cost/acre:</span> ₹{c.estimated_input_cost_per_acre_inr}</div>
                      <div>📈 <span className="font-medium">Margin:</span> {c.indicative_margin_note}</div>
                      <div>⚠️ <span className="font-medium">Risks:</span> {c.major_risks}</div>
                      <div className="pt-2 mt-2 border-t border-stone-100 text-emerald-800 font-medium bg-emerald-50/50 p-2 rounded-lg">
                        <span className="font-bold">Why:</span> {c.why_recommended}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border border-stone-200 bg-white">
              <CardContent className="p-4">
                <pre className="whitespace-pre-wrap text-sm font-mono text-stone-800">{data.raw}</pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </Layout>
  );
}
