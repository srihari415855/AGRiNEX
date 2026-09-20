"use client";
import React, { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Droplets } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

export default function IrrigationPage() {
  const { lang, activeFarm } = useApp();
  const [zones, setZones] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [duration, setDuration] = useState("15");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const load = async () => {
    const target = activeFarm || "demo-farm";
    try {
      const r = await api.get(`/farms/${target}/zones`);
      setZones(r.data);
      const h = await api.get("/irrigation/history");
      setHistory(h.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, [activeFarm]);

  const start = async () => {
    try {
      await api.post("/irrigation/start", {
        zone_id: selected,
        duration_minutes: parseInt(duration) || 15,
        confirmed: true,
      });
      toast.success("Irrigation started");
      setConfirmOpen(false);
      load();
    } catch (e) {
      toast.error("Failed to start irrigation");
    }
  };

  const selectedZone = zones.find((z) => z.id === selected);

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold text-stone-900 mb-1">💧 {t(lang, "smart_irrigation")}</h1>
      <p className="text-sm text-stone-600 mb-4">
        Manual + intelligent recommendations. All physical actions require confirmation.
      </p>
      <Card className="rounded-2xl border border-stone-200 bg-white mb-6">
        <CardContent className="p-5 space-y-4">
          <div>
            <Label>Zone</Label>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger data-testid="irr-zone-select">
                <SelectValue placeholder="Choose zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.name} — {z.crop || "no crop"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t(lang, "duration_min")}</Label>
            <Input
              data-testid="irr-duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              max="120"
            />
          </div>
          <Button
            data-testid="irr-start-btn"
            onClick={() => setConfirmOpen(true)}
            disabled={!selected}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50"
          >
            <Droplets size={16} className="mr-1.5" /> {t(lang, "start_irrigation")}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Irrigation</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-stone-600">
            Start irrigation for <span className="font-semibold text-stone-900">{selectedZone?.name}</span> for{" "}
            <span className="font-semibold text-stone-900">{duration} minutes</span>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t(lang, "cancel")}
            </Button>
            <Button data-testid="irr-confirm" onClick={start} className="bg-emerald-700 hover:bg-emerald-800">
              {t(lang, "confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="rounded-2xl border border-stone-200 bg-white">
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-stone-500">No irrigation events yet.</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-sm flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold text-stone-900">
                      Zone: {zones.find((z) => z.id === h.zone_id)?.name || h.zone_id}
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      {h.created_at ? new Date(h.created_at).toLocaleString() : "Recently"}
                    </div>
                  </div>
                  <span className="text-xs text-stone-600 bg-white border border-stone-200 px-2.5 py-1 rounded-lg">
                    {h.duration_minutes} min · <span className="text-emerald-700 font-semibold uppercase text-[10px]">{h.state}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
