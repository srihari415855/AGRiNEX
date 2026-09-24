"use client";
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { useNavigate } from "@/lib/navigation";
import {
  MapPin,
  Calendar,
  CloudSun,
  TrendingUp,
  Droplets,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Users2,
  ArrowRight,
  Sprout,
  RefreshCw,
  Sparkles
} from "lucide-react";

export default function WhatGrowPage() {
  const { lang, activeFarm, farms } = useApp();
  const nav = useNavigate();
  const currentFarm = farms?.find((f: any) => f.id === activeFarm);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "hype" | "margin" | "water">("all");

  const loadRecommendations = async () => {
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

  useEffect(() => {
    loadRecommendations();
  }, [activeFarm, lang]);

  const structured = data?.structured;
  const cropsList: any[] = structured?.crops || [];

  const filteredCrops = cropsList.filter((c) => {
    if (filter === "hype") {
      return (
        (c.market_hype && c.market_hype.toLowerCase().includes("high")) ||
        c.suitability_score >= 88
      );
    }
    if (filter === "margin") {
      return (
        (c.indicative_margin_note && c.indicative_margin_note.toLowerCase().includes("lakh")) ||
        c.estimated_input_cost_per_acre_inr >= 35000
      );
    }
    if (filter === "water") {
      return (
        c.water_requirement &&
        (c.water_requirement.toLowerCase().includes("low") ||
          c.water_requirement.toLowerCase().includes("rainfed"))
      );
    }
    return true;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                  <Sprout size={24} />
                </span>
                <span>{t(lang, "what_grow")}</span>
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Seasonal Advisory
              </span>
            </div>
            <p className="text-sm text-stone-600">
              Crop recommendations tailored to your current season, real-time weather, market hype, and farm location.
            </p>
          </div>

          <Button
            data-testid="recommend-btn"
            onClick={loadRecommendations}
            disabled={busy}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl h-10 px-4 cursor-pointer disabled:opacity-50 shrink-0 shadow-sm"
          >
            <RefreshCw size={15} className={`mr-2 ${busy ? "animate-spin" : ""}`} />
            {busy ? t(lang, "generating") : t(lang, "recommend_crops")}
          </Button>
        </div>

        {/* 4-Pillar Real-Time Context Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Farm Location */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
              <MapPin size={14} className="text-emerald-700" />
              <span>Farm Location</span>
            </div>
            <div className="text-sm font-bold text-stone-900 truncate">
              {structured?.farm_location || currentFarm?.location || "Kolar, Karnataka"}
            </div>
            <div className="text-[11px] text-stone-500 truncate">
              {currentFarm?.zones?.[0]?.soil_type || "Red Sandy Loam Soil Profile"}
            </div>
          </div>

          {/* 2. Current Season */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
              <Calendar size={14} className="text-teal-700" />
              <span>Current Season</span>
            </div>
            <div className="text-sm font-bold text-stone-900 truncate">
              {structured?.current_season || "Late Kharif / Rabi Window"}
            </div>
            <div className="text-[11px] text-teal-700 font-semibold truncate">
              Active Sowing & Nursery Prep Cycle
            </div>
          </div>

          {/* 3. Real-Time Weather */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
              <CloudSun size={14} className="text-blue-600" />
              <span>Real-Time Weather</span>
            </div>
            <div className="text-sm font-bold text-stone-900 truncate">
              {structured?.weather_summary || "28.5°C · 58% Humidity · Rain: 0.0mm"}
            </div>
            <div className="text-[11px] text-blue-700 font-semibold truncate">
              Warm & Favorable Sowing Conditions
            </div>
          </div>

          {/* 4. Market Hype & Sentiment */}
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider">
              <TrendingUp size={14} className="text-amber-600" />
              <span>Market Hype & Demand</span>
            </div>
            <div className="text-sm font-bold text-stone-900 truncate">
              Strong Mandi Velocity
            </div>
            <div className="text-[11px] text-amber-800 font-medium truncate">
              {structured?.market_sentiment || "High wholesale demand for vegetables & pulses"}
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0 mr-1">
            Filter:
          </span>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
              filter === "all"
                ? "bg-emerald-800 text-white shadow-xs"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            All Recommended ({cropsList.length})
          </button>
          <button
            onClick={() => setFilter("hype")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1 ${
              filter === "hype"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <span>🔥 High Market Hype</span>
          </button>
          <button
            onClick={() => setFilter("margin")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1 ${
              filter === "margin"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <DollarSign size={13} />
            <span>High Profit Margin</span>
          </button>
          <button
            onClick={() => setFilter("water")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1 ${
              filter === "water"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            <Droplets size={13} />
            <span>Low Water / Drought Hardy</span>
          </button>
        </div>

        {/* Crop Recommendation Cards */}
        {busy ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 shadow-2xs">
            <RefreshCw size={32} className="animate-spin mx-auto text-emerald-700" />
            <div className="text-base font-bold text-stone-900">
              Analyzing Season, Weather & Market Hype...
            </div>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Synthesizing local soil compatibility, live mandi prices, and weather parameters for your farm.
            </p>
          </div>
        ) : filteredCrops.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCrops.map((c: any, i: number) => (
              <Card
                key={i}
                className="rounded-2xl border border-stone-200 bg-white hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <CardContent className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header: Crop Name & Match Score */}
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div>
                        <div className="font-extrabold text-xl text-stone-900 tracking-tight">
                          {c.name}
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700">
                          {c.soil_compatibility || "Optimal soil compatibility"}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-emerald-800 font-black bg-emerald-50 px-2.5 py-1 rounded-xl text-sm border border-emerald-200 inline-block shadow-2xs">
                          {c.suitability_score}/100
                        </div>
                        <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mt-0.5">
                          Suitability
                        </div>
                      </div>
                    </div>

                    {/* Market Hype Banner */}
                    {c.market_hype && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-semibold flex items-start gap-2 mb-3">
                        <TrendingUp size={15} className="text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{c.market_hype}</span>
                      </div>
                    )}

                    {/* 4 Pillars Breakdown */}
                    <div className="space-y-1.5 text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-150">
                      <div className="flex items-start gap-1.5">
                        <Calendar size={13} className="text-teal-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-stone-900">Current Season: </span>
                          <span>{c.season_suitability}</span>
                        </div>
                      </div>

                      {c.weather_suitability && (
                        <div className="flex items-start gap-1.5">
                          <CloudSun size={13} className="text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-stone-900">Weather Match: </span>
                            <span>{c.weather_suitability}</span>
                          </div>
                        </div>
                      )}

                      {c.location_suitability && (
                        <div className="flex items-start gap-1.5">
                          <MapPin size={13} className="text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-stone-900">Farm Location: </span>
                            <span>{c.location_suitability}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-1.5">
                        <Droplets size={13} className="text-sky-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-stone-900">Water Needs: </span>
                          <span>{c.water_requirement}</span>
                        </div>
                      </div>
                    </div>

                    {/* Financial & Risk Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                      <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-150">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                          Est. Cost / Acre
                        </span>
                        <span className="text-sm font-black text-emerald-950">
                          ₹{c.estimated_input_cost_per_acre_inr?.toLocaleString() || "35,000"}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-stone-100/70 border border-stone-200">
                        <span className="text-[10px] uppercase font-bold text-stone-600 block">
                          Expected Margin
                        </span>
                        <span className="text-[11px] font-bold text-stone-900 leading-tight block truncate" title={c.indicative_margin_note}>
                          {c.indicative_margin_note || "₹80,000 - 1.2 Lakh/acre"}
                        </span>
                      </div>
                    </div>

                    {/* Agronomy Risk Tip */}
                    {c.major_risks && (
                      <div className="mt-2 text-[11px] text-stone-600 flex items-start gap-1.5 p-2 rounded-lg bg-rose-50/50 border border-rose-100">
                        <AlertTriangle size={13} className="text-rose-500 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-rose-950 font-semibold">Key Risk: </strong>
                          {c.major_risks}
                        </span>
                      </div>
                    )}

                    {/* Why Recommended */}
                    <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-100 text-xs text-emerald-950">
                      <strong className="font-bold text-emerald-900">Why Recommended: </strong>
                      <span>{c.why_recommended}</span>
                    </div>
                  </div>

                  {/* Action Link: Directly Find Buyers for this recommended crop */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => nav(`/app/buyers?crop=${encodeURIComponent(c.name)}`)}
                      className="w-full text-xs font-semibold text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl cursor-pointer"
                    >
                      <Users2 size={13} className="mr-1.5 text-emerald-700" />
                      Find Verified Buyers for {c.name}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border border-stone-200 bg-white">
            <CardContent className="p-8 text-center text-stone-600 space-y-2">
              <p>No crops matching the current filter.</p>
              <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
                Reset Filter
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
