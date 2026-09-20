"use client";
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";

export default function MarketPage() {
  const { lang } = useApp();
  const [crop, setCrop] = useState("Tomato");
  const [data, setData] = useState<any>(null);

  const load = async () => {
    try {
      const r = await api.get(`/market?crop=${crop}`);
      setData(r.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, [crop]);

  const sorted = data ? [...data.items].sort((a: any, b: any) => b.modal - a.modal) : [];

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold text-stone-900 mb-1">🛒 {t(lang, "market")}</h1>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <StatusBadge kind="RECENT">LATEST AVAILABLE</StatusBadge>
        {data && (
          <span className="text-xs text-stone-500">
            Market date: {data.market_data_date} · Source: {data.source}
          </span>
        )}
      </div>
      <Card className="rounded-2xl border border-stone-200 bg-white mb-6">
        <CardContent className="p-4">
          <Label>Search crop</Label>
          <Input
            data-testid="market-crop-input"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            placeholder="Tomato, Chilli, Ragi..."
          />
        </CardContent>
      </Card>
      <Card className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-100 text-left border-b border-stone-200">
                <th className="p-3.5 font-semibold text-stone-700">Market</th>
                <th className="p-3.5 font-semibold text-stone-700">Min</th>
                <th className="p-3.5 font-semibold text-stone-700">Max</th>
                <th className="p-3.5 font-semibold text-stone-700">Modal</th>
                <th className="p-3.5 font-semibold text-stone-700">Unit</th>
                <th className="p-3.5 font-semibold text-stone-700">{t(lang, "distance")}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m: any, i: number) => (
                <tr key={i} className="border-t border-stone-200 hover:bg-stone-50/70 transition">
                  <td className="p-3.5">
                    <div className="font-semibold text-stone-900">{m.market}</div>
                    <div className="text-xs text-stone-500">{m.state}</div>
                  </td>
                  <td className="p-3.5 text-stone-700">₹{m.price_min}</td>
                  <td className="p-3.5 text-stone-700">₹{m.price_max}</td>
                  <td className="p-3.5 font-bold text-emerald-700 text-base">₹{m.modal}</td>
                  <td className="p-3.5 text-stone-600">/{m.unit}</td>
                  <td className="p-3.5 text-stone-600">{m.distance_km} km</td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">
                    No data for this crop.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </Layout>
  );
}
