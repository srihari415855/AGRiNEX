import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import DigitalTwin from "@/components/DigitalTwin";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/AppContext";
import { api } from "@/lib/api";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { Camera, Mic, Cloud, ShoppingCart, Droplets, Leaf, Sparkles } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function Dashboard({ demo }) {
  const { lang, activeFarm, setActiveFarm, user } = useApp();
  const nav = useNavigate();
  const [farms, setFarms] = useState([]);
  const [farm, setFarm] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadFarms = async () => {
    if (demo) {
      const r = await api.get("/demo/farm");
      setFarm(r.data);
      setFarms([r.data]);
      setLoading(false);
      return;
    }
    try {
      const r = await api.get("/farms");
      setFarms(r.data);
      if (r.data.length === 0) { nav("/onboarding"); return; }
      const target = activeFarm && r.data.find(f => f.id === activeFarm) ? activeFarm : r.data[0].id;
      setActiveFarm(target);
      const fd = await api.get(`/farms/${target}`);
      setFarm(fd.data);
      // load sensor data for each zone in background
      for (const z of fd.data.zones || []) {
        api.get(`/zones/${z.id}/sensor`).catch(() => {});
      }
      // reload after sensors
      setTimeout(async () => {
        const fd2 = await api.get(`/farms/${target}`);
        setFarm(fd2.data);
      }, 800);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadFarms(); }, [demo]);

  useEffect(() => {
    if (!farm || !farm.latitude || !farm.longitude) return;
    api.get(`/weather?lat=${farm.latitude}&lon=${farm.longitude}`).then(r => setWeather(r.data)).catch(() => {});
  }, [farm]);

  if (loading) return <Layout isDemo={demo}><div className="text-center py-20 text-stone-500">Loading...</div></Layout>;

  const current = weather?.data?.current;
  const daily = weather?.data?.daily;

  const quick = [
    { icon: Camera, label: t(lang, "soil_analysis"), path: "/app/soil", color: "amber" },
    { icon: Leaf, label: t(lang, "crop_health"), path: "/app/plant", color: "emerald" },
    { icon: Mic, label: t(lang, "ask"), path: "/app/ask", color: "purple" },
    { icon: ShoppingCart, label: t(lang, "market"), path: "/app/market", color: "orange" },
    { icon: Droplets, label: t(lang, "smart_irrigation"), path: "/app/irrigation", color: "blue" },
    { icon: Sparkles, label: t(lang, "whatif"), path: "/app/whatif", color: "fuchsia" },
  ];

  return (
    <Layout isDemo={demo}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-stone-900">{farm?.name}</h1>
            <p className="text-sm text-stone-600">{farm?.location} · {farm?.area} {farm?.area_unit} · {farm?.zones?.length || 0} zones</p>
          </div>
          {!demo && farms.length > 1 && (
            <Select value={activeFarm} onValueChange={(v) => { setActiveFarm(v); setLoading(true); }}>
              <SelectTrigger data-testid="farm-switcher" className="w-[240px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {farms.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quick.map(q => (
            <button
              key={q.label}
              data-testid={`quick-${q.label.toLowerCase().replace(/\s/g, '-')}`}
              onClick={() => nav(q.path)}
              className={`rounded-2xl bg-white border border-stone-200 p-4 hover:shadow-md transition text-left`}
            >
              <div className={`w-9 h-9 rounded-lg bg-${q.color}-100 text-${q.color}-700 flex items-center justify-center mb-2`}>
                <q.icon size={18} />
              </div>
              <div className="text-xs font-semibold text-stone-800 leading-tight">{q.label}</div>
            </button>
          ))}
        </div>

        <DigitalTwin
          zones={farm?.zones || []}
          isDemo={demo}
          onZoneClick={(z) => nav(demo ? "/demo" : `/app/zones/${z.id}`)}
        />

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base"><Cloud size={18} className="text-blue-600" /> {t(lang, "weather")}</CardTitle>
              {weather?.status === "LIVE" ? <StatusBadge kind="LIVE" /> : <StatusBadge kind="NO_CURRENT_DATA" />}
            </CardHeader>
            <CardContent>
              {current ? (
                <div>
                  <div className="flex items-end gap-3 mb-2">
                    <div className="text-4xl font-black text-stone-900">{Math.round(current.temperature_2m)}°C</div>
                    <div className="text-sm text-stone-600 mb-1">Humidity {current.relative_humidity_2m}% · Wind {current.wind_speed_10m} km/h</div>
                  </div>
                  <div className="text-xs text-stone-500 mb-3">{t(lang, "last_updated")}: {new Date(weather.fetched_at).toLocaleTimeString()} · Source: Open-Meteo</div>
                  {daily?.time && (
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {daily.time.slice(0, 7).map((d, i) => (
                        <div key={d} className="p-1.5 rounded bg-stone-50 border border-stone-200">
                          <div className="text-[10px] text-stone-500">{new Date(d).toLocaleDateString('en', {weekday:'short'})}</div>
                          <div className="text-xs font-bold">{Math.round(daily.temperature_2m_max[i])}°</div>
                          <div className="text-[10px] text-blue-600">{daily.precipitation_sum[i]}mm</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-stone-500 py-4">
                  {farm?.latitude ? "Fetching weather..." : "Add farm latitude/longitude for live weather"}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(farm?.zones || []).filter(z => z.status === "critical" || z.status === "attention").slice(0, 5).map(z => (
                <div key={z.id} className={`p-3 rounded-lg border ${z.status === "critical" ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"}`}>
                  <div className="text-sm font-semibold">{z.name}: {z.status === "critical" ? "Critical moisture" : "Needs attention"}</div>
                  <div className="text-xs text-stone-600">Moisture: {z.last_moisture}% · Consider irrigation</div>
                </div>
              ))}
              {(farm?.zones || []).every(z => z.status === "healthy" || z.status === "no_data" || z.status === "irrigating") && (
                <div className="text-sm text-stone-500 py-2">No critical alerts. All zones look okay.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
