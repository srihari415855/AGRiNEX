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
import { Droplets, Square, AlertCircle, CheckCircle2, Waves, Activity, RefreshCw } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

export default function IrrigationPage() {
  const { lang, activeFarm } = useApp();
  const [zones, setZones] = useState<any[]>([]);
  const [selected, setSelected] = useState("");
  const [duration, setDuration] = useState("15");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [stopConfirmOpen, setStopConfirmOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [stopping, setStopping] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const target = activeFarm || "demo-farm";
    setLoading(true);
    try {
      const r = await api.get(`/farms/${target}/zones`);
      setZones(r.data);
      if (!selected && r.data?.length > 0) {
        setSelected(r.data[0].id);
      }
      const h = await api.get("/irrigation/history");
      setHistory(h.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
      toast.success("Irrigation started successfully");
      setConfirmOpen(false);
      load();
    } catch (e) {
      toast.error("Failed to start irrigation");
    }
  };

  const stop = async (zoneId?: string, eventId?: string) => {
    setStopping(true);
    try {
      await api.post("/irrigation/stop", {
        zone_id: zoneId || selected || undefined,
        event_id: eventId || undefined,
      });
      toast.success("Irrigation stopped. Solenoid valve closed.");
      setStopConfirmOpen(false);
      load();
    } catch (e) {
      toast.error("Failed to stop irrigation");
    } finally {
      setStopping(false);
    }
  };

  const selectedZone = zones.find((z) => z.id === selected);
  const isSelectedRunning = history.some((h) => h.zone_id === selected && h.state === "running");
  const runningEvents = history.filter((h) => h.state === "running");

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
              <span className="text-blue-600">💧</span> {t(lang, "smart_irrigation")}
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Precision moisture-driven valve control. Start, schedule, or stop irrigation cycles with safety confirmation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {runningEvents.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setStopConfirmOpen(true)}
                disabled={stopping}
                className="h-9 px-3.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Square size={13} className="fill-current" />
                <span>Stop All Active ({runningEvents.length})</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={load}
              disabled={loading}
              className="h-9 px-3 text-xs font-semibold text-stone-700 rounded-xl"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>

        {/* Global Active Running Banner if any */}
        {runningEvents.length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/5 border border-blue-300 text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
              </span>
              <div>
                <span className="font-extrabold text-sm text-blue-900">
                  {runningEvents.length} Zone{runningEvents.length > 1 ? "s" : ""} Currently Irrigating
                </span>
                <p className="text-xs text-blue-700 mt-0.5">
                  Valves are actively flowing water. You can halt any zone or trigger emergency stop below.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => stop()}
              disabled={stopping}
              className="h-8 px-4 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer rounded-xl shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Square size={13} className="fill-current" />
              <span>{stopping ? "Stopping..." : "Halt All Irrigation"}</span>
            </Button>
          </div>
        )}

        {/* Control Card */}
        <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs">
          <CardContent className="p-5 space-y-4">
            <div>
              <Label className="text-xs font-bold text-stone-700">Target Field Zone</Label>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger data-testid="irr-zone-select" className="mt-1 h-10 rounded-xl">
                  <SelectValue placeholder="Choose zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => {
                    const isRunning = history.some((h) => h.zone_id === z.id && h.state === "running");
                    return (
                      <SelectItem key={z.id} value={z.id}>
                        {z.name} — {z.crop || "no crop"} {isRunning ? "💧 (FLOWING)" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Zone Live Flow Status */}
            {isSelectedRunning && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Waves size={16} className="text-blue-600 animate-pulse" />
                  <span className="font-bold">Active Water Discharge for {selectedZone?.name}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-mono font-bold text-[10px]">
                  VALVE OPEN
                </span>
              </div>
            )}

            <div>
              <Label className="text-xs font-bold text-stone-700">{t(lang, "duration_min")}</Label>
              <Input
                data-testid="irr-duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                max="120"
                className="mt-1 h-10 rounded-xl"
              />
            </div>

            {/* Action Buttons: Start and Stop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                data-testid="irr-start-btn"
                onClick={() => setConfirmOpen(true)}
                disabled={!selected || isSelectedRunning}
                className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs"
              >
                <Droplets size={16} />
                <span>{t(lang, "start_irrigation")}</span>
              </Button>

              <Button
                data-testid="irr-stop-btn"
                onClick={() => setStopConfirmOpen(true)}
                disabled={!selected || !isSelectedRunning || stopping}
                className={`h-11 font-bold cursor-pointer rounded-xl flex items-center justify-center gap-2 shadow-xs transition ${
                  isSelectedRunning
                    ? "bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-400/40"
                    : "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                }`}
              >
                <Square size={15} className={isSelectedRunning ? "fill-current" : ""} />
                <span>{stopping ? "Closing Valve..." : t(lang, "stop_irrigation")}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Start Confirmation Dialog */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-stone-900">
                <Droplets size={20} className="text-blue-600" />
                <span>Confirm Irrigation Cycle</span>
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-stone-600 leading-relaxed">
              Open solenoid valves and start irrigation for{" "}
              <span className="font-bold text-stone-900">{selectedZone?.name}</span> for{" "}
              <span className="font-bold text-blue-700">{duration} minutes</span>?
            </p>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)} className="rounded-xl">
                {t(lang, "cancel")}
              </Button>
              <Button
                data-testid="irr-confirm"
                onClick={start}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              >
                {t(lang, "confirm")} & Open Valve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stop Confirmation Dialog */}
        <Dialog open={stopConfirmOpen} onOpenChange={setStopConfirmOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-700">
                <Square size={18} className="fill-current text-rose-600" />
                <span>Stop Irrigation Cycle</span>
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-stone-600 leading-relaxed">
              Immediately close valve and halt water flow for{" "}
              <span className="font-bold text-stone-900">
                {selectedZone?.name || "all active zones"}
              </span>?
            </p>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStopConfirmOpen(false)} className="rounded-xl">
                {t(lang, "cancel")}
              </Button>
              <Button
                data-testid="irr-stop-confirm"
                onClick={() => stop(selected)}
                disabled={stopping}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl"
              >
                {stopping ? "Closing..." : "Stop Irrigation Now"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Irrigation Telemetry & History */}
        <Card className="rounded-2xl border border-stone-200 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-stone-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Activity size={18} className="text-stone-500" />
              <span>Irrigation Log & Valve Activity</span>
            </CardTitle>
            <span className="text-xs font-semibold text-stone-400 font-mono">
              {history.length} Cycles Recorded
            </span>
          </CardHeader>
          <CardContent className="p-5">
            {history.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-6">No irrigation events logged yet.</p>
            ) : (
              <div className="space-y-2.5">
                {history.map((h) => {
                  const zName = zones.find((z) => z.id === h.zone_id)?.name || h.zone_id;
                  const isRunning = h.state === "running";

                  return (
                    <div
                      key={h.id}
                      className={`p-3.5 rounded-xl border text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                        isRunning
                          ? "bg-blue-50/70 border-blue-300 ring-1 ring-blue-400/30"
                          : "bg-stone-50/60 border-stone-200"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-stone-900">{zName}</span>
                          {isRunning && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              Running Now
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {h.created_at ? new Date(h.created_at).toLocaleString() : "Recently"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <span className="text-xs text-stone-600 bg-white border border-stone-200 px-2.5 py-1 rounded-lg font-mono">
                          {h.duration_minutes} min
                        </span>

                        {isRunning ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => stop(h.zone_id, h.id)}
                            disabled={stopping}
                            className="h-8 px-3 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer rounded-xl flex items-center gap-1.5 shadow-2xs"
                          >
                            <Square size={11} className="fill-current" />
                            <span>Stop Valve</span>
                          </Button>
                        ) : (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border ${
                              h.state === "stopped"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200"
                            }`}
                          >
                            {h.state || "completed"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
