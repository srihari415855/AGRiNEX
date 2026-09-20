"use client";
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function ProfitabilityPage() {
  const { lang, activeFarm } = useApp();
  const [zones, setZones] = useState<any[]>([]);
  const [f, setF] = useState({
    zone_id: "",
    crop: "Tomato",
    quantity: "100",
    price_per_unit: "20",
    seed_cost: "500",
    fertilizer_cost: "800",
    labour_cost: "1200",
    water_cost: "300",
    transport_cost: "400",
    other_cost: "200",
  });
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const target = activeFarm || "demo-farm";
    api.get(`/farms/${target}/zones`)
      .then((r) => setZones(r.data))
      .catch((e) => console.error(e));
  }, [activeFarm]);

  const calc = async () => {
    const body: Record<string, any> = {};
    for (const [k, v] of Object.entries(f)) {
      body[k] = ["zone_id", "crop"].includes(k) ? v : parseFloat(v) || 0;
    }
    try {
      const r = await api.post("/profitability", body);
      setResult(r.data);
    } catch (e) {
      console.error(e);
    }
  };

  const costFields = [
    "seed_cost",
    "fertilizer_cost",
    "labour_cost",
    "water_cost",
    "transport_cost",
    "other_cost",
  ];

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold text-stone-900 mb-1">💰 {t(lang, "profitability")}</h1>
      <div className="mb-4">
        <StatusBadge kind="INDICATIVE" />
      </div>
      <Card className="rounded-2xl border border-stone-200 bg-white mb-6">
        <CardContent className="p-5 grid sm:grid-cols-2 gap-3">
          <Select value={f.zone_id} onValueChange={(v) => setF({ ...f, zone_id: v })}>
            <SelectTrigger data-testid="prof-zone">
              <SelectValue placeholder="Zone" />
            </SelectTrigger>
            <SelectContent>
              {zones.map((z) => (
                <SelectItem key={z.id} value={z.id}>
                  {z.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Crop"
            value={f.crop}
            onChange={(e) => setF({ ...f, crop: e.target.value })}
            data-testid="prof-crop"
          />
          <Input
            placeholder="Quantity"
            type="number"
            value={f.quantity}
            onChange={(e) => setF({ ...f, quantity: e.target.value })}
            data-testid="prof-qty"
          />
          <Input
            placeholder="Price per unit"
            type="number"
            value={f.price_per_unit}
            onChange={(e) => setF({ ...f, price_per_unit: e.target.value })}
            data-testid="prof-price"
          />
          {costFields.map((k) => (
            <Input
              key={k}
              placeholder={k.replace(/_/g, " ")}
              type="number"
              value={(f as any)[k]}
              onChange={(e) => setF({ ...f, [k]: e.target.value })}
              data-testid={`prof-${k}`}
            />
          ))}
          <Button
            data-testid="prof-calc"
            onClick={calc}
            className="bg-emerald-700 hover:bg-emerald-800 text-white sm:col-span-2 cursor-pointer h-11"
          >
            Calculate
          </Button>
        </CardContent>
      </Card>
      {result && (
        <Card className="rounded-2xl border border-stone-200 bg-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs font-semibold uppercase text-stone-500 mb-1">
                  {t(lang, "revenue")}
                </div>
                <div className="text-3xl font-black text-emerald-700">
                  ₹{result.revenue}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-stone-500 mb-1">
                  {t(lang, "cost")}
                </div>
                <div className="text-3xl font-black text-rose-700">
                  ₹{result.total_cost}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase text-stone-500 mb-1">
                  {t(lang, "margin")}
                </div>
                <div className="text-3xl font-black text-stone-900">
                  ₹{result.margin}
                </div>
              </div>
            </div>
            <div className="text-xs text-center mt-4 text-stone-500 border-t border-stone-100 pt-3">
              {result.note}
            </div>
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
