"use client";
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";

export default function WeatherPage() {
  const { lang, activeFarm } = useApp();
  const [w, setW] = useState<any>(null);
  const [farm, setFarm] = useState<any>(null);

  useEffect(() => {
    const target = activeFarm || "demo-farm";
    api.get(`/farms/${target}`)
      .then((r) => {
        setFarm(r.data);
        const lat = r.data.latitude ?? 13.1373;
        const lon = r.data.longitude ?? 78.1298;
        api.get(`/weather?lat=${lat}&lon=${lon}`).then((x) => setW(x.data));
      })
      .catch(() => {
        // Fallback to default demo coordinates
        api.get(`/weather?lat=13.1373&lon=78.1298`).then((x) => setW(x.data));
      });
  }, [activeFarm]);

  const cur = w?.data?.current;
  const daily = w?.data?.daily;

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-3xl font-extrabold text-stone-900 mb-1">🌦️ {t(lang, "weather")}</h1>
        {farm && (
          <div className="text-sm font-semibold text-emerald-800 flex items-center gap-2 flex-wrap">
            <span>Location: {farm.location || "Field Location"}</span>
            <span>&bull;</span>
            <span>{farm.name}</span>
            {farm.latitude != null && farm.longitude != null && (
              <>
                <span>&bull;</span>
                <span className="font-mono text-xs text-stone-500 font-normal">
                  Coordinates: {farm.latitude}&deg;N, {farm.longitude}&deg;E
                </span>
              </>
            )}
          </div>
        )}
      </div>
      {!cur ? (
        <p className="text-stone-500 py-10">Loading weather data for farm location...</p>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <StatusBadge kind="LIVE" />
            <span className="text-xs text-stone-500">
              Open-Meteo &bull; Live Satellite & Station Data &bull; {w.fetched_at ? new Date(w.fetched_at).toLocaleString() : ""}
            </span>
          </div>
          <Card className="rounded-2xl border border-stone-200 bg-white mb-6">
            <CardContent className="p-6 sm:p-8">
              <div className="text-6xl font-black text-stone-900 mb-2">
                {Math.round(cur.temperature_2m)}°C
              </div>
              <div className="text-sm text-stone-600">
                Humidity {cur.relative_humidity_2m}% · Wind {cur.wind_speed_10m} km/h · Rain last hr{" "}
                {cur.precipitation ?? 0} mm
              </div>
            </CardContent>
          </Card>
          <h2 className="text-xl font-bold text-stone-900 mb-3">7-day {t(lang, "forecast")}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {daily?.time?.map((d: string, i: number) => (
              <Card key={d} className="rounded-xl border border-stone-200 bg-white">
                <CardContent className="p-3 text-center">
                  <div className="text-xs text-stone-500 mb-1">
                    {new Date(d).toLocaleDateString("en", { weekday: "short" })}
                  </div>
                  <div className="text-lg font-bold text-stone-800">
                    {Math.round(daily.temperature_2m_max[i])}°/
                    <span className="text-stone-500 font-normal">
                      {Math.round(daily.temperature_2m_min[i])}°
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 font-medium mt-1">
                    {daily.precipitation_sum[i]} mm
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
