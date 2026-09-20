"use client";
import React, { useState } from "react";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";

export default function WhatIfPage() {
  const { lang, activeFarm } = useApp();
  const [scenario, setScenario] = useState("no_rain");
  const [result, setResult] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const r = await api.post("/whatif", {
        farm_id: activeFarm || "demo-farm",
        scenario,
        language: lang,
      });
      setResult(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold text-stone-900 mb-1">🔮 {t(lang, "whatif")}</h1>
      <p className="text-sm text-stone-600 mb-4">All results are clearly labelled SIMULATION.</p>
      <Card className="rounded-2xl border border-stone-200 bg-white mb-6">
        <CardContent className="p-5 space-y-4">
          <div>
            <Label>{t(lang, "scenario")}</Label>
            <Select value={scenario} onValueChange={setScenario}>
              <SelectTrigger data-testid="whatif-scenario">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_rain">No rain for 2 weeks</SelectItem>
                <SelectItem value="heavy_rain">Heavy rain (100mm)</SelectItem>
                <SelectItem value="high_temp">High temperature (40°C+)</SelectItem>
                <SelectItem value="low_water">Water tank at 20%</SelectItem>
                <SelectItem value="irrigate_now">Irrigate all zones now</SelectItem>
                <SelectItem value="delay_irrigation">Delay irrigation by 3 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            data-testid="whatif-run"
            onClick={run}
            disabled={busy}
            className="bg-purple-700 hover:bg-purple-800 text-white cursor-pointer disabled:opacity-50"
          >
            <Sparkles size={16} className="mr-1.5" />
            {busy ? t(lang, "generating") : t(lang, "simulate")}
          </Button>
        </CardContent>
      </Card>
      {result && (
        <Card className="rounded-2xl border border-stone-200 bg-white">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Simulation Result</CardTitle>
            <StatusBadge kind="SIMULATED" />
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-stone-800 bg-stone-50 p-4 rounded-xl border border-stone-200 font-mono">
              {result.result}
            </div>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
