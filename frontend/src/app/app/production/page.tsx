"use client";
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PackageOpen, Trash2, Calendar, PlusCircle } from "lucide-react";

export default function ProductionPage() {
  const { lang, activeFarm } = useApp();
  const [zones, setZones] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    zone_id: "",
    crop: "",
    quantity: "",
    unit: "kg",
    quality: "Grade A",
    notes: "",
  });

  const load = async () => {
    const target = activeFarm || "demo-farm";
    try {
      const r = await api.get(`/farms/${target}/zones`);
      setZones(r.data);
      const p = await api.get("/production");
      setItems(p.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, [activeFarm]);

  const save = async () => {
    if (!form.zone_id || !form.quantity) {
      toast.error("Please select a zone and enter quantity");
      return;
    }
    try {
      await api.post("/production", {
        ...form,
        quantity: parseFloat(form.quantity),
      });
      toast.success("Harvest production record saved to database!");
      setForm({
        zone_id: "",
        crop: "",
        quantity: "",
        unit: "kg",
        quality: "Grade A",
        notes: "",
      });
      load();
    } catch (e) {
      toast.error("Failed to save production");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/production/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Harvest record removed");
    } catch (e) {
      toast.error("Failed to delete record");
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold text-stone-900 mb-1">📦 {t(lang, "production")}</h1>
      <p className="text-sm text-stone-600 mb-4">
        Track and record farm harvest yields, lot qualities, and persistent production logs.
      </p>
      
      <Card className="rounded-2xl border border-stone-200 bg-white mb-6 shadow-sm">
        <CardHeader className="border-b border-stone-100 pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-stone-900">
            <PackageOpen size={18} className="text-emerald-700" /> Log Harvest Yield
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3 pt-4">
          <Select
            value={form.zone_id}
            onValueChange={(v) => {
              const chosen = zones.find((z) => z.id === v);
              setForm({
                ...form,
                zone_id: v,
                crop: chosen?.crop ? chosen.crop.split(" ")[0] : form.crop,
              });
            }}
          >
            <SelectTrigger data-testid="prod-zone">
              <SelectValue placeholder="Select Zone" />
            </SelectTrigger>
            <SelectContent>
              {zones.map((z) => (
                <SelectItem key={z.id} value={z.id}>
                  {z.name} — {z.crop || "No crop"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            data-testid="prod-crop"
            placeholder="Crop name (e.g. Tomato, Chilli, Ragi)"
            value={form.crop}
            onChange={(e) => setForm({ ...form, crop: e.target.value })}
          />

          <Input
            data-testid="prod-qty"
            placeholder="Quantity (e.g. 500)"
            type="number"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />

          <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
              <SelectItem value="quintal">Quintals (100 kg)</SelectItem>
              <SelectItem value="tonnes">Metric Tonnes</SelectItem>
              <SelectItem value="crates">Crates (20 kg)</SelectItem>
            </SelectContent>
          </Select>

          <Input
            data-testid="prod-quality"
            placeholder="Quality (Grade A, Grade B, Organic)"
            value={form.quality}
            onChange={(e) => setForm({ ...form, quality: e.target.value })}
          />

          <Textarea
            data-testid="prod-notes"
            placeholder="Notes (harvest condition, buyer lot, storage warehouse)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="sm:col-span-2 h-20"
          />

          <Button
            data-testid="prod-save"
            onClick={save}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold sm:col-span-2 cursor-pointer flex items-center justify-center gap-2 h-10 rounded-xl"
          >
            <PlusCircle size={16} />
            Save Harvest Record to Database
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
            <Calendar size={18} className="text-emerald-700" />
            Persisted Harvest Logs ({items.length})
          </h3>
          <span className="text-xs text-stone-500">Stored in SQLite &bull; Retained across logins</span>
        </div>

        {items.map((p) => (
          <Card key={p.id} className="rounded-xl border border-stone-200 bg-white shadow-xs hover:border-emerald-300 transition-all">
            <CardContent className="p-4 flex justify-between items-center text-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 text-base">{p.crop}</span>
                  <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    {p.quantity} {p.unit}
                  </span>
                  {p.quality && (
                    <span className="text-xs bg-stone-100 px-2.5 py-0.5 rounded-full text-stone-600 font-medium">
                      {p.quality}
                    </span>
                  )}
                </div>
                {p.notes && <p className="text-xs text-stone-500 mt-1">{p.notes}</p>}
                <div className="text-[11px] text-stone-400 mt-1">
                  Logged on: {p.created_at ? new Date(p.created_at).toLocaleString() : "Recently"}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(p.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 h-8 w-8"
                title="Delete harvest record"
              >
                <Trash2 size={15} />
              </Button>
            </CardContent>
          </Card>
        ))}

        {items.length === 0 && (
          <Card className="rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-500 text-sm">
            No production entries logged yet. Add your first harvest record above.
          </Card>
        )}
      </div>
    </Layout>
  );
}
