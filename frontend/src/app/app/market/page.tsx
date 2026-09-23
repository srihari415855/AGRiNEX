"use client";
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import {
  ShoppingCart, Sparkles, TrendingUp, MapPin, Truck, Award,
  ArrowRight, Search, RefreshCw, AlertCircle, CheckCircle2, DollarSign
} from "lucide-react";

const POPULAR_CROPS = ["Tomato", "Chilli", "Ragi", "Onion", "Potato", "Cotton", "Mango", "Banana"];

export default function MarketPage() {
  const { lang, activeFarm } = useApp();
  const [crop, setCrop] = useState("Tomato");
  const [searchInput, setSearchInput] = useState("Tomato");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"priority" | "modal" | "distance">("priority");

  const loadMarketIntelligence = async (targetCrop: string) => {
    setLoading(true);
    try {
      const farmParam = activeFarm ? `&farm_id=${activeFarm}` : "";
      const r = await api.get(`/market?crop=${encodeURIComponent(targetCrop)}${farmParam}`);
      setData(r.data);
    } catch (e) {
      console.error("Failed to load market data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketIntelligence(crop);
  }, [crop, activeFarm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCrop(searchInput.trim());
    }
  };

  const handleQuickCrop = (c: string) => {
    setSearchInput(c);
    setCrop(c);
  };

  const rawItems = data?.items || [];
  const sortedItems = [...rawItems].sort((a: any, b: any) => {
    if (sortBy === "modal") return (b.modal || 0) - (a.modal || 0);
    if (sortBy === "distance") return (a.distance_km || 9999) - (b.distance_km || 9999);
    return (a.priority || 99) - (b.priority || 99);
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                <ShoppingCart className="text-emerald-600" size={30} />
                <span>Market Intelligence</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                <Sparkles size={11} className="text-emerald-700" />
                Gemini 2.5 Flash Agent
              </span>
            </div>
            <p className="text-sm text-stone-600">
              Real-time APMC Mandi price discovery & AI-prioritized places to sell for maximum farm realization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadMarketIntelligence(crop)}
              disabled={loading}
              className="h-9 px-3 text-xs font-semibold text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Refresh Live Intelligence</span>
            </Button>
          </div>
        </div>

        {/* Crop Search & Quick Selectors */}
        <Card className="rounded-2xl border border-stone-200 bg-white shadow-2xs">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <Input
                  data-testid="market-crop-input"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter any crop (Tomato, Chilli, Ragi, Onion, Potato, Cotton, Mango, Banana...)"
                  className="pl-9 text-sm font-medium bg-stone-50/80 border-stone-300 h-10 rounded-xl"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="h-10 px-5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs cursor-pointer"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : "Analyze Market"}
              </Button>
            </form>

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-1">Quick Select:</span>
              {POPULAR_CROPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleQuickCrop(c)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    crop.toLowerCase() === c.toLowerCase()
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Market Advisory Overview Card */}
        {data && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="md:col-span-2 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-stone-50 shadow-xs">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-2xs">
                      <TrendingUp size={16} />
                    </span>
                    <h3 className="font-bold text-emerald-950 text-base">
                      AI Market Trend & Liquidity Analysis • {data.crop}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                    {data.market_data_date}
                  </span>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed font-normal">
                  {data.ai_summary}
                </p>
                {data.best_selling_advice && (
                  <div className="p-3 rounded-xl bg-emerald-100/70 border border-emerald-200/80 text-emerald-900 text-xs flex items-start gap-2">
                    <Award size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Tactical Selling Advice: </span>
                      {data.best_selling_advice}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Intelligence Grounding</div>
                  <div className="font-extrabold text-stone-900 text-lg flex items-center gap-1.5">
                    <span>{data.items?.length || 0} Mandis Evaluated</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-1">
                    Source: <span className="font-semibold text-emerald-800">{data.source || "Gemini 2.5 Flash Agmarknet"}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 space-y-1.5">
                  <div className="text-[11px] font-semibold text-stone-500 flex justify-between">
                    <span>Benchmark Modal Range:</span>
                    <span className="font-bold text-stone-900">
                      ₹{sortedItems[0]?.modal || 0} - ₹{sortedItems[sortedItems.length - 1]?.modal || 0}/qtl
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-stone-500 flex justify-between">
                    <span>Avg Retail Equivalent:</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      ₹{sortedItems[0]?.modal ? Math.round(sortedItems[0].modal / 100) : 0}/kg
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Priority Filter and Markets Display Header */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-stone-900 tracking-tight">
              Top Prioritized Places to Sell ({sortedItems.length} Markets)
            </h2>
            <StatusBadge kind="RECENT">RANKED 1 - {sortedItems.length}</StatusBadge>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200 text-xs">
            <span className="px-2 font-semibold text-stone-400 uppercase text-[10px]">Sort:</span>
            <button
              onClick={() => setSortBy("priority")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                sortBy === "priority" ? "bg-emerald-700 text-white shadow-2xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Priority Rank
            </button>
            <button
              onClick={() => setSortBy("modal")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                sortBy === "modal" ? "bg-emerald-700 text-white shadow-2xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Highest Price
            </button>
            <button
              onClick={() => setSortBy("distance")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                sortBy === "distance" ? "bg-emerald-700 text-white shadow-2xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Nearest Distance
            </button>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid gap-3">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="h-28 rounded-2xl bg-stone-100 animate-pulse border border-stone-200" />
            ))}
          </div>
        )}

        {/* Prioritized Market Cards */}
        {!loading && (
          <div className="grid gap-3.5">
            {sortedItems.map((m: any, idx: number) => {
              const rank = m.priority || idx + 1;
              const isTop = rank === 1;

              return (
                <Card
                  key={idx}
                  className={`rounded-2xl transition hover:shadow-md border ${
                    isTop
                      ? "border-emerald-300 bg-gradient-to-r from-emerald-50/50 via-white to-white ring-1 ring-emerald-400/40"
                      : "border-stone-200 bg-white"
                  }`}
                >
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Rank, Market Name, Place, Badge */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                            rank === 1
                              ? "bg-amber-400 text-amber-950 ring-2 ring-amber-300"
                              : rank === 2
                              ? "bg-slate-200 text-slate-800"
                              : rank === 3
                              ? "bg-amber-700/80 text-white"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          #{rank}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">
                              {m.market}
                            </h3>
                            {m.priority_badge && (
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs ${
                                  rank === 1
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : "bg-stone-100 text-stone-700 border-stone-200"
                                }`}
                              >
                                {m.priority_badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-stone-500 flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-stone-700">
                              <MapPin size={12} className="text-emerald-600" />
                              {m.place || m.district}, {m.state}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-stone-600">
                              <Truck size={12} className="text-stone-400" />
                              {m.distance_km} km away
                            </span>
                            {m.estimated_transport_cost != null && (
                              <>
                                <span>•</span>
                                <span className="text-stone-500">
                                  Est. Transport: ₹{m.estimated_transport_cost}/qtl
                                </span>
                              </>
                            )}
                          </div>

                          {m.why_recommended && (
                            <p className="text-xs text-stone-600 pt-1 italic">
                              "{m.why_recommended}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Prices & Realization */}
                      <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-100">
                        <div className="text-left sm:text-right">
                          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                            Range (Min - Max)
                          </div>
                          <div className="text-xs font-semibold text-stone-600">
                            ₹{m.price_min} - ₹{m.price_max}
                          </div>
                          <div className="text-[10px] text-stone-400">/{m.unit || "quintal"}</div>
                        </div>

                        <div className="text-right bg-emerald-50/80 px-3.5 py-2 rounded-xl border border-emerald-200/80">
                          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                            Modal Price
                          </div>
                          <div className="text-2xl font-black text-emerald-800 font-mono tracking-tight leading-none my-0.5">
                            ₹{m.modal}
                          </div>
                          {m.net_profit_index ? (
                            <div className="text-[10px] font-bold text-emerald-900">
                              Net ~₹{m.net_profit_index}/qtl
                            </div>
                          ) : (
                            <div className="text-[10px] text-emerald-700">/{m.unit || "quintal"}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {sortedItems.length === 0 && (
              <Card className="rounded-2xl border border-stone-200 bg-white">
                <CardContent className="p-12 text-center text-stone-500 space-y-3">
                  <AlertCircle size={36} className="mx-auto text-stone-400" />
                  <p className="text-base font-semibold">No market intelligence records found for "{crop}".</p>
                  <p className="text-xs text-stone-400">Try searching common crops like Tomato, Chilli, Onion, Potato, or Ragi.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
