"use client";
import React, { useEffect, useState, Suspense } from "react";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "@/lib/navigation";
import {
  Users2,
  Search,
  Sparkles,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Phone,
  CheckCircle2,
  DollarSign,
  Truck,
  Award,
  Clock,
  ArrowRight,
  RefreshCw,
  Building2,
  Factory,
  Store,
  Globe2,
  HelpCircle,
  Copy,
  ExternalLink,
  MessageCircle,
  ArrowUpDown,
  Calendar,
  PackageCheck,
  FileText,
  BadgeCheck,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const POPULAR_CROPS = [
  "Tomato",
  "Chilli",
  "Onion",
  "Potato",
  "Ragi",
  "Ginger",
  "Garlic",
  "Cotton",
  "Groundnut",
  "Pigeon Pea",
  "Arecanut",
  "Mango",
  "Banana"
];

function BuyersContent() {
  const { lang, activeFarm, farms } = useApp();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const cropParam = searchParams?.get?.("crop") || "";

  const [activeTab, setActiveTab] = useState<"directory" | "enquiries">("directory");
  const [crop, setCrop] = useState(cropParam || "Tomato");
  const [searchInput, setSearchInput] = useState(cropParam || "Tomato");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"payout" | "distance" | "min_qty">("payout");

  // Selected Buyer Modal State
  const [selectedBuyer, setSelectedBuyer] = useState<any>(null);
  const [enquiryForm, setEnquiryForm] = useState({
    quantity_kg: 500,
    grade: "Grade A (Prime Table Quality)",
    dispatch_date: "Next 24-48 Hours",
    farmer_phone: "",
    notes: "Harvested and sorted into crates. Ready for farmgate pickup or collection depot drop."
  });
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

  // Enquiries list state
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

  const currentFarm = farms?.find((f: any) => f.id === activeFarm);

  // Sync crop if URL query param changes
  useEffect(() => {
    if (cropParam && cropParam !== crop) {
      setCrop(cropParam);
      setSearchInput(cropParam);
    }
  }, [cropParam]);

  const loadBuyers = async (targetCrop: string) => {
    setLoading(true);
    try {
      const farmParam = activeFarm ? `&farm_id=${activeFarm}` : "";
      const locParam = currentFarm?.location
        ? `&location=${encodeURIComponent(currentFarm.location)}`
        : "";
      const res = await api.get(
        `/buyers?crop=${encodeURIComponent(targetCrop)}${farmParam}${locParam}`
      );
      setData(res.data);
    } catch (e) {
      console.error("Failed to load buyer data", e);
      toast.error("Could not fetch buyer suggestions");
    } finally {
      setLoading(false);
    }
  };

  const loadEnquiries = async () => {
    setLoadingEnquiries(true);
    try {
      const farmParam = activeFarm ? `?farm_id=${activeFarm}` : "";
      const res = await api.get(`/buyers/enquiries${farmParam}`);
      if (Array.isArray(res.data)) {
        setEnquiries(res.data);
      }
    } catch (e) {
      console.error("Failed to load enquiries", e);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  useEffect(() => {
    loadBuyers(crop);
  }, [crop, activeFarm]);

  useEffect(() => {
    if (activeTab === "enquiries") {
      loadEnquiries();
    }
  }, [activeTab, activeFarm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCrop(searchInput.trim());
    }
  };

  const handleSelectQuickCrop = (c: string) => {
    setSearchInput(c);
    setCrop(c);
  };

  // Open modal with pre-filled buyer details
  const handleOpenBuyerModal = (b: any) => {
    setSelectedBuyer(b);
    setEnquiryForm({
      quantity_kg: b.quantity_min_kg || 500,
      grade: b.grade || "Grade A (Prime Table Quality)",
      dispatch_date: "Next 24-48 Hours",
      farmer_phone: "",
      notes: "Harvested and sorted into crates. Ready for farmgate pickup or collection depot drop."
    });
  };

  // Submit trade dispatch enquiry
  const handleConfirmEnquiry = async () => {
    if (!selectedBuyer) return;
    setSubmittingEnquiry(true);
    try {
      const payload = {
        crop: crop,
        buyer_name: selectedBuyer.name,
        buyer_type: selectedBuyer.buyer_type,
        offered_price: selectedBuyer.price_per_kg,
        quantity_kg: Number(enquiryForm.quantity_kg) || selectedBuyer.quantity_min_kg,
        grade: enquiryForm.grade,
        dispatch_date: enquiryForm.dispatch_date,
        farmer_phone: enquiryForm.farmer_phone,
        notes: enquiryForm.notes,
        farm_id: activeFarm
      };
      const res = await api.post("/buyers/enquiry", payload);
      toast.success(
        `Dispatch Enquiry #${res.data?.tracking_code || "LOGGED"} registered with ${selectedBuyer.name}! Sourcing coordinator notified.`
      );
      setSelectedBuyer(null);
      loadEnquiries();
    } catch (e) {
      console.error("Failed to log enquiry", e);
      toast.error("Could not register enquiry. Please call the procurement desk directly.");
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const items: any[] = data?.items || [];

  // Filter items
  const filteredItems = items.filter((b) => {
    if (typeFilter === "all") return true;
    if (typeFilter === "institutional") {
      return b.buyer_type?.toLowerCase().includes("institutional");
    }
    if (typeFilter === "processor") {
      return (
        b.buyer_type?.toLowerCase().includes("processing") ||
        b.buyer_type?.toLowerCase().includes("food")
      );
    }
    if (typeFilter === "mandi") {
      return (
        b.buyer_type?.toLowerCase().includes("mandi") ||
        b.buyer_type?.toLowerCase().includes("apmc")
      );
    }
    if (typeFilter === "exporter") {
      return b.buyer_type?.toLowerCase().includes("export");
    }
    return true;
  });

  // Sort filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "payout") {
      return (b.price_per_kg || 0) - (a.price_per_kg || 0);
    }
    if (sortBy === "distance") {
      return (a.distance_km || 999) - (b.distance_km || 999);
    }
    if (sortBy === "min_qty") {
      return (a.quantity_min_kg || 0) - (b.quantity_min_kg || 0);
    }
    return 0;
  });

  // Calculate live counts for each filter
  const filterCounts = {
    all: items.length,
    institutional: items.filter((b) =>
      b.buyer_type?.toLowerCase().includes("institutional")
    ).length,
    processor: items.filter(
      (b) =>
        b.buyer_type?.toLowerCase().includes("processing") ||
        b.buyer_type?.toLowerCase().includes("food")
    ).length,
    mandi: items.filter(
      (b) =>
        b.buyer_type?.toLowerCase().includes("mandi") ||
        b.buyer_type?.toLowerCase().includes("apmc")
    ).length,
    exporter: items.filter((b) =>
      b.buyer_type?.toLowerCase().includes("export")
    ).length
  };

  const getBuyerIcon = (type: string = "") => {
    const t = type.toLowerCase();
    if (t.includes("processor") || t.includes("food"))
      return <Factory size={16} className="text-amber-600" />;
    if (t.includes("institutional"))
      return <Building2 size={16} className="text-emerald-600" />;
    if (t.includes("export"))
      return <Globe2 size={16} className="text-blue-600" />;
    return <Store size={16} className="text-teal-600" />;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                  <Users2 size={24} />
                </span>
                <span>{t(lang, "buyers") || "Verified Buyers Directory"}</span>
              </h1>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Market Matchmaker
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Direct Farmgate & APMC Procurement
              </span>
            </div>
            <p className="text-sm text-stone-600">
              Verified retail procurement hubs, food processing factories, and licensed APMC commission agents offering maximum payout for your harvest.
            </p>
          </div>

          {/* Farm Location Pill & Mandi Link */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl px-3.5 py-2 shadow-2xs">
              <MapPin size={15} className="text-emerald-700" />
              <span>Sourcing Near:</span>
              <span className="font-bold text-stone-900">
                {currentFarm?.location || "Kolar, Karnataka"}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => nav(`/app/market?crop=${encodeURIComponent(crop)}`)}
              className="text-xs font-semibold text-emerald-800 border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 rounded-xl h-9 cursor-pointer shadow-2xs"
            >
              <TrendingUp size={14} className="mr-1.5 text-emerald-700" />
              Compare Mandi Rates
            </Button>
          </div>
        </div>

        {/* View Switcher Tabs (Directory vs Enquiries) */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("directory")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${activeTab === "directory"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
          >
            <Building2 size={16} />
            <span>Verified Buyers Network</span>
            <span className={`text-[11px] px-2 py-0.2 rounded-full font-extrabold ${activeTab === "directory" ? "bg-emerald-950 text-emerald-200" : "bg-stone-200 text-stone-700"
              }`}>
              {items.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("enquiries")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${activeTab === "enquiries"
                ? "bg-emerald-800 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
          >
            <FileText size={16} />
            <span>My Dispatch Enquiries</span>
            {enquiries.length > 0 && (
              <span className={`text-[11px] px-2 py-0.2 rounded-full font-extrabold ${activeTab === "enquiries" ? "bg-emerald-950 text-emerald-200" : "bg-amber-100 text-amber-800"
                }`}>
                {enquiries.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "directory" ? (
          <>
            {/* Search & Quick-Select Bar */}
            <Card className="rounded-3xl border border-stone-200 bg-white shadow-2xs overflow-hidden">
              <CardContent className="p-4 sm:p-5 space-y-3">
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <Input
                      data-testid="buyer-crop-input"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Enter crop name to find verified buyers (e.g. Tomato, Chilli, Onion, Potato, Cotton, Ragi)..."
                      className="pl-10 h-11 text-sm bg-stone-50/70 border-stone-200 rounded-2xl focus:bg-white"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-2xl h-11 px-5 cursor-pointer shadow-sm"
                  >
                    {loading ? <RefreshCw size={16} className="animate-spin" /> : "Find Buyers"}
                  </Button>
                </form>

                {/* Quick Crop Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
                    Popular:
                  </span>
                  {POPULAR_CROPS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleSelectQuickCrop(c)}
                      className={`text-xs px-3 py-1 rounded-xl font-medium transition cursor-pointer shrink-0 ${crop.toLowerCase() === c.toLowerCase()
                          ? "bg-emerald-800 text-white font-bold shadow-xs"
                          : "bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200"
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Market Analysis Banner */}
            {data && (
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-stone-900 to-teal-950 text-white shadow-md space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <TrendingUp size={16} />
                    </span>
                    <span className="text-sm font-bold tracking-tight text-white">
                      Market Intelligence for {crop}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                      Verified Pricing
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-300 flex-wrap">
                    <span>
                      APMC Benchmark: <strong className="text-emerald-300 font-bold">₹{data.benchmark_mandi_price || 24.0}/kg</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Active Verified Buyers: <strong className="text-white font-bold">{items.length}</strong>
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-normal">
                  {data.market_analysis}
                </p>
              </div>
            )}

            {/* Filter Pills & Sorting Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              {/* Category Filter Pills with Dynamic Counts */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "all", label: "All Buyers", count: filterCounts.all },
                  { id: "institutional", label: "🏢 Retail & Institutional", count: filterCounts.institutional },
                  { id: "processor", label: "🏭 Food Processors", count: filterCounts.processor },
                  { id: "mandi", label: "🏪 APMC Agents", count: filterCounts.mandi },
                  { id: "exporter", label: "🌐 Exporters", count: filterCounts.exporter }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTypeFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${typeFilter === f.id
                        ? "bg-emerald-800 text-white shadow-xs font-bold"
                        : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
                      }`}
                  >
                    <span>{f.label}</span>
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${typeFilter === f.id ? "bg-emerald-950 text-emerald-200" : "bg-stone-100 text-stone-600"
                        }`}
                    >
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sorting Options */}
              <div className="flex items-center gap-2 text-xs text-stone-600 shrink-0 self-end sm:self-auto">
                <span className="font-bold flex items-center gap-1 text-stone-500">
                  <ArrowUpDown size={13} />
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-stone-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                >
                  <option value="payout">Highest Payout (₹/kg)</option>
                  <option value="distance">Nearest Distance (km)</option>
                  <option value="min_qty">Lowest Min Quantity (kg)</option>
                </select>
              </div>
            </div>

            {/* Buyers Grid */}
            {loading ? (
              <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-stone-200 shadow-2xs">
                <RefreshCw size={32} className="animate-spin mx-auto text-emerald-700" />
                <div className="text-base font-bold text-stone-900">
                  Scanning Buyer Network for {crop}...
                </div>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Locating verified wholesale mandis, institutional procurement hubs, and food processors near your farm location.
                </p>
              </div>
            ) : sortedItems.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {sortedItems.map((b: any, i: number) => {
                  const isTopPick = i === 0 && sortBy === "payout";
                  return (
                    <Card
                      key={b.id || i}
                      className={`rounded-2xl bg-white transition-all duration-200 hover:shadow-lg flex flex-col justify-between overflow-hidden ${isTopPick
                          ? "border-2 border-emerald-500 shadow-md ring-4 ring-emerald-500/10"
                          : "border border-stone-200 shadow-2xs"
                        }`}
                    >
                      <CardContent className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                        <div>
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                                {getBuyerIcon(b.buyer_type)}
                                <span>{b.buyer_type || "Verified Buyer"}</span>
                              </span>
                              {b.is_verified !== false && (
                                <span className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  <ShieldCheck size={11} className="text-emerald-600" />
                                  <span>Verified</span>
                                </span>
                              )}
                              {b.license_no && (
                                <span className="text-[10px] text-stone-400 font-mono">
                                  #{b.license_no}
                                </span>
                              )}
                            </div>

                            {isTopPick && (
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs animate-pulse">
                                🌟 Highest Payout
                              </span>
                            )}
                          </div>

                          {/* Buyer Name & Price Row */}
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <div className="font-extrabold text-lg sm:text-xl text-stone-900 tracking-tight">
                                {b.name}
                              </div>
                              <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                                <MapPin size={12} className="text-stone-400 shrink-0" />
                                <span>{b.location}</span>
                                {b.distance_km && (
                                  <span className="font-semibold text-emerald-800">
                                    • {b.distance_km} km away
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Price Callout */}
                            <div className="text-right shrink-0">
                              <div className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                                ₹{b.price_per_kg}
                                <span className="text-xs font-semibold text-stone-500">/kg</span>
                              </div>
                              {b.price_premium_vs_mandi && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 block mt-0.5">
                                  {b.price_premium_vs_mandi}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Buyer Specifications Grid */}
                          <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-150 mt-3">
                            <div>
                              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                                Min Lot Size
                              </span>
                              <span className="font-bold text-stone-800">
                                {b.quantity_min_kg?.toLocaleString() || "300"} kg
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                                Grade Accepted
                              </span>
                              <span className="font-bold text-stone-800 truncate block">
                                {b.grade || "Grade A"}
                              </span>
                            </div>
                            <div className="col-span-2 pt-1 border-t border-stone-200">
                              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                                Payment Terms
                              </span>
                              <span className="font-semibold text-emerald-900 text-[11px]">
                                💳 {b.payment_terms || "Instant Bank Transfer within 24h"}
                              </span>
                            </div>
                          </div>

                          {/* AI Matching Rationale */}
                          {b.why_suggested && (
                            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-150 text-xs text-stone-800">
                              <strong className="text-emerald-900 font-bold">Why Suggested: </strong>
                              <span>{b.why_suggested}</span>
                            </div>
                          )}
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                          <div className="text-[11px] text-stone-500 truncate flex items-center gap-1">
                            <Clock size={12} className="text-stone-400 shrink-0" />
                            <span>{b.demand_urgency || "Active Sourcing"}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Call Link */}
                            {b.phone_clean && (
                              <a
                                href={`tel:${b.phone_clean}`}
                                title={`Call ${b.contact_person || "Procurement Desk"}`}
                                className="h-9 w-9 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 flex items-center justify-center text-stone-700 hover:text-emerald-800 transition"
                              >
                                <Phone size={14} />
                              </a>
                            )}

                            {/* WhatsApp Direct Chat Link */}
                            {b.whatsapp && (
                              <a
                                href={`https://wa.me/${b.whatsapp}?text=${encodeURIComponent(
                                  `Hello, I am a farmer with ${crop} harvest available near ${currentFarm?.location || "my farm"}. Interested in direct dispatch.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Chat on WhatsApp"
                                className="h-9 w-9 rounded-xl border border-stone-200 hover:border-emerald-300 hover:bg-emerald-50 flex items-center justify-center text-emerald-700 hover:text-emerald-900 transition"
                              >
                                <MessageCircle size={14} />
                              </a>
                            )}

                            {/* Connect & Sell Button */}
                            <Button
                              size="sm"
                              onClick={() => handleOpenBuyerModal(b)}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs h-9 px-3.5 cursor-pointer shadow-xs"
                            >
                              <CheckCircle2 size={13} className="mr-1.5" />
                              Connect & Sell
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="col-span-2 text-center text-stone-500 py-16 bg-white rounded-3xl border border-stone-200">
                <Users2 size={36} className="mx-auto text-stone-300 mb-2" />
                <div className="font-bold text-stone-800 text-base">
                  No {typeFilter !== "all" ? typeFilter : ""} Buyers Found for "{crop}"
                </div>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  {typeFilter !== "all"
                    ? "Try clearing your category filter to see all buyers."
                    : "Try searching for common commercial crops like Tomato, Chilli, Onion, Potato, Cotton, or Ragi."}
                </p>
                {typeFilter !== "all" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTypeFilter("all")}
                    className="mt-3 text-xs rounded-xl cursor-pointer"
                  >
                    View All Buyers ({items.length})
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          /* My Dispatch Enquiries Tab View */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900">
                  Logged Dispatch Enquiries
                </h2>
                <p className="text-xs text-stone-500">
                  Track the real-time status of your direct sales and collection dispatches.
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => setActiveTab("directory")}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs h-9 px-4 cursor-pointer shadow-xs"
              >
                + Find Another Buyer
              </Button>
            </div>

            {loadingEnquiries ? (
              <div className="py-12 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
                <RefreshCw size={24} className="animate-spin mx-auto text-emerald-700 mb-2" />
                <span>Loading trade enquiries...</span>
              </div>
            ) : enquiries.length > 0 ? (
              <div className="grid gap-3">
                {enquiries.map((enq: any) => (
                  <Card key={enq.id} className="rounded-2xl border border-stone-200 bg-white shadow-2xs">
                    <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-base text-stone-900">
                            {enq.buyer_name}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {enq.crop}
                          </span>
                          <span className="font-mono text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                            {enq.tracking_code || enq.id?.slice(0, 8)}
                          </span>
                        </div>

                        <div className="text-xs text-stone-600 flex items-center gap-4 flex-wrap">
                          <span>
                            Quantity: <strong className="text-stone-900">{enq.quantity_kg?.toLocaleString()} kg</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Offered Rate: <strong className="text-emerald-700 font-bold">₹{enq.offered_price}/kg</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Est. Gross: <strong className="text-emerald-800 font-bold">₹{Math.round((enq.quantity_kg || 0) * (enq.offered_price || 0)).toLocaleString()}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Target Date: <strong className="text-stone-800">{enq.dispatch_date || "Within 24-48h"}</strong>
                          </span>
                        </div>

                        {enq.notes && (
                          <p className="text-[11px] text-stone-500 italic">
                            "{enq.notes}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          {enq.status || "Desk Review"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-3">
                <PackageCheck size={36} className="mx-auto text-stone-300" />
                <div className="font-bold text-stone-800 text-base">
                  No Dispatch Enquiries Logged Yet
                </div>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Browse verified buyers in the network, click "Connect & Sell", and submit a trade enquiry to get your harvest collected with guaranteed payout.
                </p>
                <Button
                  onClick={() => setActiveTab("directory")}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs h-9 px-4 cursor-pointer"
                >
                  Browse Verified Buyers
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Connect & Sell / Dispatch Enquiry Modal */}
        <Dialog open={!!selectedBuyer} onOpenChange={() => setSelectedBuyer(null)}>
          <DialogContent className="max-w-lg rounded-3xl p-5 sm:p-6">
            {selectedBuyer && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-stone-900 text-lg">
                    <Building2 className="text-emerald-700" size={22} />
                    <span>{selectedBuyer.name}</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-stone-500">
                    {selectedBuyer.buyer_type} · {selectedBuyer.location} ({selectedBuyer.distance_km} km away)
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2 text-xs">
                  {/* Offered Price & Payout Header */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Offered Farmgate Rate
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-emerald-950">
                        ₹{selectedBuyer.price_per_kg}
                        <span className="text-xs font-semibold text-emerald-700">/kg</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-200 text-emerald-900 inline-block mb-1">
                        {selectedBuyer.price_premium_vs_mandi || "+ Premium Payout"}
                      </span>
                      <span className="text-[10px] text-stone-500 block">
                        Est. Gross for {enquiryForm.quantity_kg}kg: <strong className="text-emerald-900 font-bold">₹{Math.round((Number(enquiryForm.quantity_kg) || 0) * selectedBuyer.price_per_kg).toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Dispatch Enquiry Form */}
                  <div className="space-y-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                          Quantity to Sell (kg)
                        </label>
                        <Input
                          type="number"
                          value={enquiryForm.quantity_kg}
                          onChange={(e) =>
                            setEnquiryForm({ ...enquiryForm, quantity_kg: Number(e.target.value) })
                          }
                          min={selectedBuyer.quantity_min_kg || 100}
                          className="h-9 text-xs bg-white rounded-xl border-stone-200 font-bold"
                        />
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          Min required: {selectedBuyer.quantity_min_kg} kg
                        </span>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                          Produce Quality Grade
                        </label>
                        <select
                          value={enquiryForm.grade}
                          onChange={(e) =>
                            setEnquiryForm({ ...enquiryForm, grade: e.target.value })
                          }
                          className="w-full h-9 text-xs bg-white rounded-xl border border-stone-200 font-bold px-2.5 text-stone-800"
                        >
                          <option value="Grade A (Prime Table Quality)">Grade A (Prime Table Quality)</option>
                          <option value="Grade A & B Commercial Mix">Grade A & B Commercial Mix</option>
                          <option value="Processing & Canning Grade">Processing & Canning Grade</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                          Dispatch Readiness
                        </label>
                        <select
                          value={enquiryForm.dispatch_date}
                          onChange={(e) =>
                            setEnquiryForm({ ...enquiryForm, dispatch_date: e.target.value })
                          }
                          className="w-full h-9 text-xs bg-white rounded-xl border border-stone-200 font-bold px-2.5 text-stone-800"
                        >
                          <option value="Immediate (Today)">Immediate (Today)</option>
                          <option value="Next 24-48 Hours">Next 24-48 Hours</option>
                          <option value="Within 3 to 5 Days">Within 3 to 5 Days</option>
                          <option value="Next Week Harvest">Next Week Harvest</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                          Farmer Contact Phone
                        </label>
                        <Input
                          type="tel"
                          placeholder="+91 98450 XXXXX"
                          value={enquiryForm.farmer_phone}
                          onChange={(e) =>
                            setEnquiryForm({ ...enquiryForm, farmer_phone: e.target.value })
                          }
                          className="h-9 text-xs bg-white rounded-xl border-stone-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                        Dispatch Notes / Pickup Location
                      </label>
                      <Input
                        value={enquiryForm.notes}
                        onChange={(e) =>
                          setEnquiryForm({ ...enquiryForm, notes: e.target.value })
                        }
                        placeholder="e.g. Farmgate crate pickup requested, or delivering to collection yard."
                        className="h-9 text-xs bg-white rounded-xl border-stone-200"
                      />
                    </div>
                  </div>

                  {/* Direct Contact Callout */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700">
                    <div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Procurement Officer Contact
                      </span>
                      <span className="font-mono font-bold text-emerald-900 text-xs">
                        {selectedBuyer.contact || "+91 80 4600 8920"}
                      </span>
                      {selectedBuyer.contact_person && (
                        <span className="text-[10px] text-stone-500 block">
                          {selectedBuyer.contact_person}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {selectedBuyer.phone_clean && (
                        <a
                          href={`tel:${selectedBuyer.phone_clean}`}
                          className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-800 hover:bg-emerald-50 text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <Phone size={12} className="text-emerald-700" />
                          <span>Call</span>
                        </a>
                      )}

                      {selectedBuyer.whatsapp && (
                        <a
                          href={`https://wa.me/${selectedBuyer.whatsapp}?text=${encodeURIComponent(
                            `Hello ${selectedBuyer.contact_person || ""}, I am offering ${enquiryForm.quantity_kg}kg of ${crop} (${enquiryForm.grade}) ready for dispatch.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-800 transition"
                        >
                          <MessageCircle size={12} />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        selectedBuyer.contact || selectedBuyer.phone_clean || "+91 80 4600 8920"
                      );
                      toast.success("Buyer contact copied to clipboard");
                    }}
                    className="text-xs rounded-xl cursor-pointer"
                  >
                    <Copy size={13} className="mr-1.5" />
                    Copy Contact
                  </Button>
                  <Button
                    disabled={submittingEnquiry}
                    onClick={handleConfirmEnquiry}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    {submittingEnquiry ? (
                      <RefreshCw size={14} className="animate-spin mr-1.5" />
                    ) : (
                      <CheckCircle2 size={14} className="mr-1.5" />
                    )}
                    Confirm & Register Dispatch Enquiry
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export default function BuyersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-stone-500">Loading buyers...</div>}>
      <BuyersContent />
    </Suspense>
  );
}
