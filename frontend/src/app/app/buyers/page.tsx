"use client";
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";

export default function BuyersPage() {
  const { lang } = useApp();
  const [crop, setCrop] = useState("Tomato");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get(`/buyers?crop=${crop}`)
      .then((r) => setData(r.data))
      .catch((e) => console.error(e));
  }, [crop]);

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold text-stone-900 mb-1">🤝 {t(lang, "buyers")}</h1>
      <div className="flex items-center gap-2 mb-4">
        <StatusBadge kind="RECENT" />
        {data && <span className="text-xs text-stone-500">{data.source}</span>}
      </div>
      <Card className="rounded-2xl border border-stone-200 bg-white mb-6">
        <CardContent className="p-4">
          <Input
            data-testid="buyer-crop-input"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            placeholder="Search crop..."
          />
        </CardContent>
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        {(data?.items || []).map((b: any, i: number) => (
          <Card key={i} className="rounded-2xl border border-stone-200 bg-white hover:shadow-md transition">
            <CardContent className="p-5">
              <div className="font-bold text-lg text-stone-900">{b.name}</div>
              <div className="text-xs text-stone-500 mb-3">
                {b.location} · Grade {b.grade}
              </div>
              <div className="text-sm text-stone-700">
                Wants: <span className="font-semibold text-stone-900">{b.crop}</span> · Min {b.quantity_min_kg} kg
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-2">
                ₹{b.price_per_kg}/kg
              </div>
              <div className="text-xs text-stone-500 mt-2 pt-2 border-t border-stone-100">
                Listed: {b.listed_on} · Contact: <span className="font-mono">{b.contact}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {!data?.items?.length && (
          <div className="col-span-2 text-center text-stone-500 py-12">
            NO CURRENT BUYER DATA FOUND
          </div>
        )}
      </div>
    </Layout>
  );
}
