"use client";
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Cpu, Trash2, Plus } from "lucide-react";

export default function DevicesPage() {
  const { lang } = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [f, setF] = useState({ name: "", device_type: "soil_moisture" });

  const load = async () => {
    try {
      const r = await api.get("/devices");
      setItems(r.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!f.name.trim()) return;
    try {
      await api.post("/devices", f);
      setF({ name: "", device_type: "soil_moisture" });
      load();
    } catch (e) {
      console.error(e);
    }
  };

  const del = async (id: string) => {
    try {
      await api.delete(`/devices/${id}`);
      load();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold text-stone-900 mb-1">📡 {t(lang, "devices")}</h1>
      <p className="text-sm text-stone-600 mb-4">Manage IoT sensors, gateways, and irrigation relays.</p>

      <Card className="rounded-2xl border border-stone-200 bg-white mb-6">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-2">
          <Input
            data-testid="dev-name"
            placeholder="Device name (e.g. Zone 1 Soil Sensor)"
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            className="flex-1"
          />
          <Select
            value={f.device_type}
            onValueChange={(v) => setF({ ...f, device_type: v })}
          >
            <SelectTrigger data-testid="dev-type" className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="esp32">ESP32 Gateway</SelectItem>
              <SelectItem value="soil_moisture">Soil Moisture</SelectItem>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="humidity">Humidity</SelectItem>
              <SelectItem value="water_level">Water Level</SelectItem>
              <SelectItem value="pump">Pump / Relay</SelectItem>
            </SelectContent>
          </Select>
          <Button
            data-testid="dev-add"
            onClick={add}
            className="bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer px-4"
          >
            <Plus size={16} className="mr-1" /> Add Device
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {items.map((d) => (
          <Card key={d.id} className="rounded-xl border border-stone-200 bg-white">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold text-stone-900 flex items-center gap-2">
                  <Cpu size={16} className="text-emerald-700" /> {d.name}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">
                  Type: <span className="font-medium text-stone-700">{d.device_type}</span> · Status:{" "}
                  <span className="text-emerald-700 font-semibold">{d.status}</span>
                </div>
              </div>
              <button
                onClick={() => del(d.id)}
                className="text-rose-600 hover:text-rose-800 p-2 cursor-pointer"
                data-testid={`dev-del-${d.id}`}
              >
                <Trash2 size={16} />
              </button>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-stone-500 text-center py-10">No devices added yet.</p>
        )}
      </div>
    </Layout>
  );
}
