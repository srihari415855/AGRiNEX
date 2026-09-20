"use client";
import React, { useEffect, useState } from "react";
import { useNavigate } from "@/lib/navigation";
import Layout from "@/components/Layout";
import DigitalTwin, { Zone } from "@/components/DigitalTwin";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/lib/AppContext";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";
import {
  Camera,
  Mic,
  Cloud,
  ShoppingCart,
  Droplets,
  Leaf,
  Sparkles,
  Edit3,
  MapPin,
  Save,
  Building,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface Farm {
  id: string;
  name: string;
  location?: string;
  area?: number;
  area_unit?: string;
  latitude?: number;
  longitude?: number;
  water_availability?: string;
  irrigation_method?: string;
  farming_type?: string;
  zones?: Zone[];
}

export default function DashboardView({ demo }: { demo?: boolean }) {
  const { lang, activeFarm, setActiveFarm, farms, setFarms, refreshFarms, user } = useApp();
  const nav = useNavigate();
  const [farm, setFarm] = useState<Farm | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit Farm Modal State
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    location: "",
    area: "5.0",
    area_unit: "acre",
    farming_type: "Mixed horticulture",
    water_availability: "Adequate",
    irrigation_method: "Drip irrigation",
  });
  const [savingFarm, setSavingFarm] = useState(false);

  // Fetch weather for specific coordinates
  const fetchWeatherForFarm = (lat?: number, lon?: number) => {
    if (lat == null || lon == null) return;
    api
      .get(`/weather?lat=${lat}&lon=${lon}`)
      .then((r) => setWeather(r.data))
      .catch((e) => console.error("Weather fetch failed", e));
  };

  // Load specific farm by ID
  const loadSpecificFarm = async (farmId: string) => {
    try {
      const fd = await api.get(`/farms/${farmId}`);
      setFarm(fd.data);
      fetchWeatherForFarm(fd.data.latitude, fd.data.longitude);

      // Trigger background sensor refresh for this farm's zones
      for (const z of fd.data.zones || []) {
        api.get(`/zones/${z.id}/sensor`).catch(() => {});
      }
    } catch (err) {
      console.error("Failed to load farm details", err);
    }
  };

  const loadInitialData = async () => {
    if (demo) {
      try {
        const r = await api.get("/demo/farm");
        setFarm(r.data);
        setFarms([r.data]);
        fetchWeatherForFarm(r.data.latitude, r.data.longitude);
      } catch (err) {
        console.error("Failed to load demo farm", err);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const r = await api.get("/farms");
      const farmList: Farm[] = r.data || [];
      setFarms(farmList);
      if (farmList.length === 0) {
        nav("/onboarding");
        return;
      }
      const target =
        activeFarm && farmList.find((f: Farm) => f.id === activeFarm)
          ? activeFarm
          : farmList[0].id;
      if (target !== activeFarm) {
        setActiveFarm(target);
      }
      await loadSpecificFarm(target);
    } catch (err) {
      console.error(err);
      if (!user) nav("/auth");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, [demo]);

  // Reactive listener: when activeFarm changes in header or switcher, update dashboard farm & weather immediately
  useEffect(() => {
    if (!demo && activeFarm) {
      loadSpecificFarm(activeFarm);
    }
  }, [activeFarm]);

  const openEditModal = () => {
    if (!farm) return;
    setEditForm({
      name: farm.name || "",
      location: farm.location || "",
      area: String(farm.area || "5.0"),
      area_unit: farm.area_unit || "acre",
      farming_type: farm.farming_type || "Mixed horticulture",
      water_availability: farm.water_availability || "Adequate",
      irrigation_method: farm.irrigation_method || "Drip irrigation",
    });
    setEditOpen(true);
  };

  const handleSaveFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farm) return;
    setSavingFarm(true);
    try {
      const res = await api.put(`/farms/${farm.id}`, {
        name: editForm.name.trim(),
        location: editForm.location.trim(),
        area: parseFloat(editForm.area) || 5.0,
        area_unit: editForm.area_unit,
        farming_type: editForm.farming_type,
        water_availability: editForm.water_availability,
        irrigation_method: editForm.irrigation_method,
      });
      toast.success(`Farm "${res.data.name}" updated successfully!`);
      setFarm(res.data);
      fetchWeatherForFarm(res.data.latitude, res.data.longitude);
      await refreshFarms();
      setEditOpen(false);
    } catch (err: any) {
      toast.error("Failed to update farm: " + (err.response?.data?.detail || err.message));
    } finally {
      setSavingFarm(false);
    }
  };

  if (loading) {
    return (
      <Layout isDemo={demo}>
        <div className="text-center py-20 text-stone-500">Loading farm intelligence...</div>
      </Layout>
    );
  }

  const current = weather?.data?.current;
  const daily = weather?.data?.daily;

  const quick = [
    { icon: Camera, label: t(lang, "soil_analysis"), path: "/app/soil", bg: "bg-amber-100", text: "text-amber-700" },
    { icon: Leaf, label: t(lang, "crop_health"), path: "/app/plant", bg: "bg-emerald-100", text: "text-emerald-700" },
    { icon: Mic, label: t(lang, "ask"), path: "/app/ask", bg: "bg-purple-100", text: "text-purple-700" },
    { icon: ShoppingCart, label: t(lang, "market"), path: "/app/market", bg: "bg-orange-100", text: "text-orange-700" },
    { icon: Droplets, label: t(lang, "smart_irrigation"), path: "/app/irrigation", bg: "bg-blue-100", text: "text-blue-700" },
    { icon: Sparkles, label: t(lang, "whatif"), path: "/app/whatif", bg: "bg-fuchsia-100", text: "text-fuchsia-700" },
  ];

  const criticalZones = farm?.zones?.filter((z) => z.status === "critical") || [];

  return (
    <Layout isDemo={demo}>
      <div className="space-y-6">
        {/* Farm Header with Edit Details Action */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black tracking-tight text-stone-900">{farm?.name}</h1>
              {!demo && (
                <Button
                  data-testid="edit-farm-btn"
                  onClick={openEditModal}
                  size="sm"
                  variant="outline"
                  className="h-8 border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit Farm Details</span>
                </Button>
              )}
            </div>
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-stone-600 mt-1">
              <span className="flex items-center gap-1 font-semibold text-stone-800">
                <MapPin size={14} className="text-emerald-600" />
                {farm?.location || "Location not set"}
              </span>
              <span>&bull;</span>
              <span>{farm?.area} {farm?.area_unit}</span>
              <span>&bull;</span>
              <span>{farm?.farming_type || "Mixed agriculture"}</span>
              <span>&bull;</span>
              <span>{farm?.zones?.length || 0} active zones</span>
              {farm?.latitude != null && farm?.longitude != null && (
                <>
                  <span>&bull;</span>
                  <span className="text-xs text-stone-400 font-mono">
                    ({farm.latitude}&deg;N, {farm.longitude}&deg;E)
                  </span>
                </>
              )}
            </div>
          </div>

          {!demo && farms.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Switch Farm:</span>
              <Select
                value={activeFarm || ""}
                onValueChange={(v) => {
                  setActiveFarm(v);
                }}
              >
                <SelectTrigger data-testid="farm-switcher" className="w-[220px] bg-stone-50 border-stone-300 font-semibold text-xs text-stone-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {farms.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      <div className="flex flex-col text-left py-0.5">
                        <span className="font-bold text-stone-900 text-xs">{f.name}</span>
                        {f.location && <span className="text-[10px] text-stone-500">{f.location}</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Quick Access Icons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quick.map((q) => (
            <button
              key={q.label}
              data-testid={`quick-${q.label.toLowerCase().replace(/\s/g, "-")}`}
              onClick={() => nav(q.path)}
              className="rounded-2xl bg-white border border-stone-200 p-4 hover:shadow-md transition text-left cursor-pointer"
            >
              <div
                className={`w-9 h-9 rounded-lg ${q.bg} ${q.text} flex items-center justify-center mb-2`}
              >
                <q.icon size={18} />
              </div>
              <div className="text-xs font-semibold text-stone-800 leading-tight">{q.label}</div>
            </button>
          ))}
        </div>

        {/* Digital Twin Map of Active Farm */}
        <DigitalTwin
          zones={farm?.zones || []}
          isDemo={demo}
          onZoneClick={(z) => nav(demo ? "/demo" : `/app/zones/${z.id}`)}
        />

        {/* Live Weather of the Active Farm's Exact Location */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="rounded-2xl border border-stone-200 bg-white">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Cloud size={18} className="text-blue-600" />
                <span>Live Weather &bull; {farm?.location || "Field Location"}</span>
              </CardTitle>
              {weather?.status === "LIVE" ? (
                <StatusBadge kind="LIVE" />
              ) : (
                <StatusBadge kind="NO_CURRENT_DATA" />
              )}
            </CardHeader>
            <CardContent>
              {current ? (
                <div>
                  <div className="flex items-end gap-3 mb-2">
                    <div className="text-4xl font-black text-stone-900">
                      {Math.round(current.temperature_2m)}°C
                    </div>
                    <div className="text-sm text-stone-600 mb-1">
                      Humidity {current.relative_humidity_2m}% &bull; Wind {current.wind_speed_10m} km/h
                    </div>
                  </div>
                  <div className="text-xs text-stone-500 mb-3">
                    {t(lang, "last_updated")}: {new Date(weather.fetched_at).toLocaleTimeString()} &bull; Source: Open-Meteo &bull; Location: {farm?.location}
                  </div>
                  {daily?.time && (
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {daily.time.slice(0, 7).map((d: string, i: number) => (
                        <div key={d} className="p-1.5 rounded bg-stone-50 border border-stone-200">
                          <div className="text-[10px] text-stone-500">
                            {new Date(d).toLocaleDateString("en", { weekday: "short" })}
                          </div>
                          <div className="text-xs font-bold text-stone-900">
                            {Math.round(daily.temperature_2m_max[i])}°
                          </div>
                          <div className="text-[10px] text-blue-600">
                            {daily.precipitation_sum[i]}mm
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-stone-500 py-4">
                  {farm?.latitude ? "Fetching live weather for coordinates..." : "Add farm latitude/longitude for live weather"}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-stone-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Field Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {criticalZones.length > 0 ? (
                <div className="space-y-2">
                  {criticalZones.map((z) => (
                    <div
                      key={z.id}
                      className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex justify-between items-center"
                    >
                      <div>
                        <span className="font-bold">{z.name}</span>: Soil moisture low (
                        {z.last_moisture != null ? `${z.last_moisture}%` : "critical"})
                      </div>
                      <button
                        onClick={() => nav(`/app/irrigation`)}
                        className="px-2 py-1 rounded bg-rose-600 text-white font-semibold cursor-pointer"
                      >
                        Irrigate
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-stone-600 py-4">All zones in {farm?.name} are within optimal parameters. No urgent alerts.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Farm Details Modal */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <Building size={18} className="text-emerald-700" />
                Edit Farm Details
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveFarm} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-stone-700">Farm Name</label>
                <Input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Green Valley Agro"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700">
                  Location (City / District / State)
                </label>
                <Input
                  required
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="e.g. Nashik, Maharashtra or Bhatkal"
                  className="mt-1"
                />
                <span className="text-[11px] text-stone-500 mt-0.5 block">
                  Live weather and satellite coordinates will automatically update to this location.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700">Area</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={editForm.area}
                    onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700">Unit</label>
                  <Select
                    value={editForm.area_unit}
                    onValueChange={(v) => setEditForm({ ...editForm, area_unit: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acre">Acre</SelectItem>
                      <SelectItem value="hectare">Hectare</SelectItem>
                      <SelectItem value="guntha">Guntha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700">Farming System</label>
                <Input
                  value={editForm.farming_type}
                  onChange={(e) => setEditForm({ ...editForm, farming_type: e.target.value })}
                  placeholder="e.g. Mixed horticulture, Organic, Precision"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700">Water Availability</label>
                  <Input
                    value={editForm.water_availability}
                    onChange={(e) => setEditForm({ ...editForm, water_availability: e.target.value })}
                    placeholder="e.g. Borewell + Tank"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700">Irrigation Method</label>
                  <Input
                    value={editForm.irrigation_method}
                    onChange={(e) => setEditForm({ ...editForm, irrigation_method: e.target.value })}
                    placeholder="e.g. Drip + Sprinkler"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditOpen(false)}
                  disabled={savingFarm}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingFarm}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5"
                >
                  <Save size={15} />
                  {savingFarm ? "Saving..." : "Save Farm Details"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
