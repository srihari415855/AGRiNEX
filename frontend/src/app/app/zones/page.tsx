"use client";
import React, { useEffect, useState } from "react";
import { useNavigate } from "@/lib/navigation";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

export default function ZonesPage() {
  const { lang, activeFarm } = useApp();
  const nav = useNavigate();
  const [zones, setZones] = useState<any[]>([]);
  const [newZone, setNewZone] = useState({ name: "", crop: "", soil_type: "", area: "" });

  const load = async () => {
    if (!activeFarm) return;
    try {
      const r = await api.get(`/farms/${activeFarm}/zones`);
      setZones(r.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, [activeFarm]);

  const add = async () => {
    if (!newZone.name.trim()) return;
    try {
      await api.post(`/farms/${activeFarm}/zones`, {
        name: newZone.name,
        crop: newZone.crop || null,
        soil_type: newZone.soil_type || null,
        area: newZone.area ? parseFloat(newZone.area) : null,
      });
      setNewZone({ name: "", crop: "", soil_type: "", area: "" });
      toast.success("Zone added");
      load();
    } catch (e) {
      toast.error("Failed to add zone");
    }
  };

  const del = async (id: string) => {
    try {
      await api.delete(`/zones/${id}`);
      toast.success("Zone deleted");
      load();
    } catch (e) {
      toast.error("Failed to delete zone");
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-stone-900">{t(lang, "zones")}</h1>
        <Card className="rounded-2xl border border-stone-200 bg-white">
          <CardHeader>
            <CardTitle>{t(lang, "add_zone")}</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 lg:grid-cols-5 gap-2">
            <Input
              data-testid="new-zone-name"
              placeholder={t(lang, "zone_name")}
              value={newZone.name}
              onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
            />
            <Input
              data-testid="new-zone-area"
              placeholder={t(lang, "area")}
              type="number"
              value={newZone.area}
              onChange={(e) => setNewZone({ ...newZone, area: e.target.value })}
            />
            <Input
              data-testid="new-zone-crop"
              placeholder={t(lang, "zone_crop")}
              value={newZone.crop}
              onChange={(e) => setNewZone({ ...newZone, crop: e.target.value })}
            />
            <Input
              data-testid="new-zone-soil"
              placeholder={t(lang, "zone_soil")}
              value={newZone.soil_type}
              onChange={(e) => setNewZone({ ...newZone, soil_type: e.target.value })}
            />
            <Button
              data-testid="add-zone-submit"
              onClick={add}
              className="bg-emerald-700 hover:bg-emerald-800 cursor-pointer"
            >
              <Plus size={16} className="mr-1" /> Add
            </Button>
          </CardContent>
        </Card>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {zones.map((z) => (
            <Card key={z.id} className="rounded-2xl border border-stone-200 bg-white">
              <CardContent className="p-4">
                <div className="flex justify-between mb-2 items-center">
                  <div className="font-bold text-stone-900">{z.name}</div>
                  <button
                    data-testid={`del-zone-${z.id}`}
                    onClick={() => del(z.id)}
                    className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="text-xs text-stone-600 mb-3">
                  {z.crop || "—"} · {z.soil_type || "—"} · {z.area || "—"} {z.area_unit || "acre"}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => nav(`/app/zones/${z.id}`)}
                  data-testid={`view-zone-${z.id}`}
                  className="w-full sm:w-auto"
                >
                  View
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
