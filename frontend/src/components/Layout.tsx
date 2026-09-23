"use client";
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "@/lib/navigation";
import { useApp } from "@/lib/AppContext";
import { t, LANGS } from "@/lib/i18n";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Home, Layers, Camera, Leaf, Cloud, Droplets, Flower2, Sparkles,
  ShoppingCart, Users2, PackageOpen, Wallet, BarChart3, MessageSquare, FileText,
  Cpu, Settings as SettingsIcon, LogOut, Menu, X, TreePine, Building, PlusCircle,
  Clock, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

const NAV = [
  { path: "/app", key: "dashboard", icon: Home, end: true },
  { path: "/app/twin", key: "digital_twin", icon: Layers },
  { path: "/app/zones", key: "zones", icon: TreePine },
  { path: "/app/soil", key: "soil_analysis", icon: Camera },
  { path: "/app/plant", key: "crop_health", icon: Leaf },
  { path: "/app/what-grow", key: "what_grow", icon: Flower2 },
  { path: "/app/weather", key: "weather", icon: Cloud },
  { path: "/app/irrigation", key: "smart_irrigation", icon: Droplets },
  { path: "/app/whatif", key: "whatif", icon: Sparkles },
  { path: "/app/market", key: "market", icon: ShoppingCart },
  { path: "/app/buyers", key: "buyers", icon: Users2 },
  { path: "/app/production", key: "production", icon: PackageOpen },
  { path: "/app/profitability", key: "profitability", icon: Wallet },
  { path: "/app/analytics", key: "analytics", icon: BarChart3 },
  { path: "/app/ask", key: "ask", icon: MessageSquare },
  { path: "/app/reports", key: "reports", icon: FileText },
  { path: "/app/devices", key: "devices", icon: Cpu },
  { path: "/app/settings", key: "settings", icon: SettingsIcon },
];

export default function Layout({
  children,
  isDemo,
}: {
  children: React.ReactNode;
  isDemo?: boolean;
}) {
  const { user, lang, setLang, logout, farms, activeFarm, setActiveFarm, refreshFarms } = useApp();
  const [open, setOpen] = useState(false);
  const [addFarmOpen, setAddFarmOpen] = useState(false);
  const [creatingFarm, setCreatingFarm] = useState(false);
  const [newFarm, setNewFarm] = useState({
    name: "",
    location: "Kolar, Karnataka",
    area: "5.0",
    farming_type: "Mixed horticulture",
    water_availability: "Adequate",
    irrigation_method: "Drip irrigation",
  });

  const nav = useNavigate();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarm.name.trim()) {
      toast.error("Farm name is required");
      return;
    }
    setCreatingFarm(true);
    try {
      const res = await api.post("/farms", {
        name: newFarm.name,
        location: newFarm.location,
        area: parseFloat(newFarm.area) || 5.0,
        area_unit: "acre",
        farming_type: newFarm.farming_type,
        water_availability: newFarm.water_availability,
        irrigation_method: newFarm.irrigation_method,
      });
      toast.success(`Farm "${res.data.name}" added successfully!`);
      await refreshFarms();
      setActiveFarm(res.data.id);
      setAddFarmOpen(false);
      setNewFarm({
        name: "",
        location: "Kolar, Karnataka",
        area: "5.0",
        farming_type: "Mixed horticulture",
        water_availability: "Adequate",
        irrigation_method: "Drip irrigation",
      });
    } catch (err: any) {
      toast.error("Failed to add farm: " + (err.message || "Unknown error"));
    } finally {
      setCreatingFarm(false);
    }
  };

  const currentFarmObj = farms.find((f) => f.id === activeFarm);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              data-testid="mobile-menu-toggle"
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-stone-100 cursor-pointer"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => nav(isDemo ? "/demo" : "/app")}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-md">
                <Leaf className="text-white" size={20} />
              </div>
              <div>
                <div className="font-extrabold tracking-tight text-emerald-900 text-lg leading-none">AGRiNEX</div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wider">Farm Intelligence</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Real-time Synchronized Digital Farm Clock */}
            {now && (
              <div
                data-testid="live-clock-pill"
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100/90 border border-stone-200/90 text-stone-700 shadow-2xs"
                title="Synchronized Farm Local Time (IST, UTC+05:30)"
              >
                <Clock size={13} className="text-emerald-600 animate-pulse" />
                <span className="text-xs font-bold font-mono tracking-tight text-stone-800">
                  {now.toLocaleTimeString("en-US", {
                    timeZone: "Asia/Kolkata",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                  })}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded font-mono">
                  IST (UTC+05:30)
                </span>
                <span className="text-stone-300">•</span>
                <span className="text-xs text-stone-600 font-medium">
                  {now.toLocaleDateString("en-US", {
                    timeZone: "Asia/Kolkata",
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}

            {!isDemo && user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddFarmOpen(true)}
                className="hidden md:flex items-center gap-1.5 h-9 text-xs font-semibold text-emerald-800 border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100"
              >
                <PlusCircle size={14} />
                <span>Add Farm</span>
              </Button>
            )}

            {isDemo && (
              <span
                data-testid="demo-badge"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300"
              >
                {t(lang, "demo_label")}
              </span>
            )}
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger data-testid="lang-select" className="w-[120px] h-9 bg-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGS.map((l) => (
                  <SelectItem key={l.code} value={l.code} data-testid={`lang-option-${l.code}`}>
                    {l.native}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {user ? (
              <Button
                data-testid="logout-btn"
                variant="outline"
                size="sm"
                className="h-9 px-2.5"
                onClick={() => {
                  logout();
                  nav("/");
                }}
                title="Logout"
              >
                <LogOut size={16} />
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-[57px] left-0 z-30 w-64 h-[calc(100vh-57px)] bg-white border-r border-stone-200 overflow-y-auto transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          {/* Mobile Farm Selector */}
          {!isDemo && user && farms.length > 0 && (
            <div className="p-3 border-b border-stone-100 sm:hidden">
              <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Active Farm</label>
              <Select
                value={activeFarm || ""}
                onValueChange={(val) => {
                  if (val === "new") setAddFarmOpen(true);
                  else setActiveFarm(val);
                }}
              >
                <SelectTrigger className="w-full h-8 text-xs bg-stone-50">
                  <SelectValue placeholder="Select Farm" />
                </SelectTrigger>
                <SelectContent>
                  {farms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                  <SelectItem value="new" className="text-emerald-700 font-bold">+ Add Farm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <nav className="p-3 space-y-0.5">
            {NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                data-testid={`nav-${item.key}`}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "text-stone-700 hover:bg-stone-100"
                  }`
                }
              >
                <item.icon size={18} />
                <span>{t(lang, item.key)}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        {open && (
          <div
            className="fixed inset-0 top-[57px] bg-black/30 z-20 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Add New Farm Dialog */}
      <Dialog open={addFarmOpen} onOpenChange={setAddFarmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-stone-900">
              <Building className="text-emerald-700" size={20} />
              Add New Farm
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFarm} className="space-y-3 pt-2">
            <div>
              <Label className="text-xs font-semibold">Farm Name *</Label>
              <Input
                placeholder="e.g. Kolar Green Valley Farm"
                value={newFarm.name}
                onChange={(e) => setNewFarm({ ...newFarm, name: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Location / Place *</Label>
              <Input
                placeholder="e.g. Kolar, Karnataka (or Mysuru, Shimoga, etc.)"
                value={newFarm.location}
                onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
                required
                className="mt-1"
              />
              <p className="text-[10px] text-stone-500 mt-0.5">
                Coordinates and live weather will be automatically resolved by AI for this place.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Total Area (Acres)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={newFarm.area}
                  onChange={(e) => setNewFarm({ ...newFarm, area: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Farming Type</Label>
                <Input
                  value={newFarm.farming_type}
                  onChange={(e) => setNewFarm({ ...newFarm, farming_type: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Water Availability</Label>
                <Input
                  value={newFarm.water_availability}
                  onChange={(e) => setNewFarm({ ...newFarm, water_availability: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Primary Irrigation</Label>
                <Input
                  value={newFarm.irrigation_method}
                  onChange={(e) => setNewFarm({ ...newFarm, irrigation_method: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter className="pt-3">
              <Button type="button" variant="ghost" onClick={() => setAddFarmOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creatingFarm} className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">
                {creatingFarm ? "Creating..." : "Save Farm"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
