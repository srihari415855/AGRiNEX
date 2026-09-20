import React, { useEffect, useState, useRef } from "react";
import Layout from "@/components/Layout";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Mic, MicOff, Send, Volume2, Sparkles, Droplets, ShoppingCart, Users2, Cpu, Trash2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function WhatGrow() {
  const { lang, activeFarm } = useApp();
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(null);
  const go = async () => {
    setBusy(true);
    try {
      const r = await api.post("/recommend/crop", { farm_id: activeFarm, language: lang });
      setData(r.data);
    } catch (e) { toast.error("Failed"); } finally { setBusy(false); }
  };
  return (
    <Layout>
      <h1 className="text-3xl font-extrabold mb-1">🌱 {t(lang, "what_grow")}</h1>
      <p className="text-sm text-stone-600 mb-4">AGRiNEX uses your farm context + current weather to suggest crops.</p>
      <Button data-testid="recommend-btn" onClick={go} disabled={busy} className="mb-4 bg-emerald-700 hover:bg-emerald-800">{busy ? t(lang, "generating") : t(lang, "recommend_crops")}</Button>
      {data && (
        <div className="space-y-3">
          <div className="flex gap-2 flex-wrap"><StatusBadge kind="INDICATIVE" /><StatusBadge kind="AI_IMAGE_ANALYSIS">AI RECOMMENDATION</StatusBadge></div>
          {data.structured?.crops ? (
            <div className="grid md:grid-cols-2 gap-3">
              {data.structured.crops.map((c, i) => (
                <Card key={i} className="rounded-2xl">
                  <CardContent className="p-4">
                    <div className="flex justify-between mb-2">
                      <div className="font-bold text-lg">{c.name}</div>
                      <div className="text-emerald-700 font-bold">{c.suitability_score}/100</div>
                    </div>
                    <div className="text-xs text-stone-600 space-y-1">
                      <div>💧 Water: {c.water_requirement}</div>
                      <div>🌱 Soil: {c.soil_compatibility}</div>
                      <div>📅 Season: {c.season_suitability}</div>
                      <div>💰 Est. cost/acre: ₹{c.estimated_input_cost_per_acre_inr}</div>
                      <div>📈 Margin: {c.indicative_margin_note}</div>
                      <div>⚠️ Risks: {c.major_risks}</div>
                      <div className="pt-2 border-t border-stone-200 text-emerald-800 font-medium">Why: {c.why_recommended}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl"><CardContent className="p-4"><pre className="whitespace-pre-wrap text-sm">{data.raw}</pre></CardContent></Card>
          )}
        </div>
      )}
    </Layout>
  );
}

export function Ask() {
  const { lang, activeFarm } = useApp();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const recRef = useRef(null);

  const speak = (text) => {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    const map = { en: "en-IN", hi: "hi-IN", kn: "kn-IN" };
    u.lang = map[lang] || "en-IN";
    window.speechSynthesis.speak(u);
  };

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: msg }]);
    setBusy(true);
    try {
      const r = await api.post("/ask", { message: msg, language: lang, farm_id: activeFarm });
      setMessages(m => [...m, { role: "assistant", text: r.data.reply }]);
      speak(r.data.reply);
    } catch (e) { toast.error("Failed"); } finally { setBusy(false); }
  };

  const startListen = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.error("Voice not supported in this browser"); return; }
    const r = new SR();
    r.lang = { en: "en-IN", hi: "hi-IN", kn: "kn-IN" }[lang] || "en-IN";
    r.interimResults = false;
    r.onresult = (e) => { const txt = e.results[0][0].transcript; setInput(txt); send(txt); };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start();
    recRef.current = r;
    setListening(true);
  };
  const stopListen = () => { recRef.current?.stop(); setListening(false); };

  const samples = [
    "How is my farm?", "What should I grow?", "Does any zone need irrigation?",
    "What is the current tomato price?", "Any critical alerts today?",
  ];

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold mb-1">🎙️ {t(lang, "ask")}</h1>
      <p className="text-sm text-stone-600 mb-4">Multilingual voice + text assistant that uses your actual farm data.</p>
      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <div className="h-[420px] overflow-y-auto space-y-3 mb-3 p-2">
            {messages.length === 0 && (
              <div className="text-center text-stone-500 py-8">
                <Sparkles className="mx-auto mb-2 text-emerald-600" size={28} />
                <p className="text-sm mb-3">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {samples.map((s, i) => (
                    <button key={i} data-testid={`ask-sample-${i}`} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100">{s}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-emerald-700 text-white" : "bg-stone-100 text-stone-900"}`}>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  {m.role === "assistant" && (
                    <button onClick={() => speak(m.text)} className="mt-1 text-xs text-emerald-700 hover:text-emerald-900 flex items-center gap-1"><Volume2 size={12} /> Listen</button>
                  )}
                </div>
              </div>
            ))}
            {busy && <div className="text-xs text-stone-500">AGRiNEX is thinking...</div>}
          </div>
          <div className="flex gap-2">
            <Input data-testid="ask-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder={t(lang, "ask_prompt")} />
            <Button data-testid="ask-send-btn" onClick={() => send()} disabled={busy} className="bg-emerald-700 hover:bg-emerald-800"><Send size={16} /></Button>
            <Button data-testid="ask-mic-btn" onClick={listening ? stopListen : startListen} variant={listening ? "destructive" : "outline"}>
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}

export function Weather() {
  const { lang, activeFarm } = useApp();
  const [w, setW] = useState(null);
  const [farm, setFarm] = useState(null);
  useEffect(() => {
    if (!activeFarm) return;
    api.get(`/farms/${activeFarm}`).then(r => {
      setFarm(r.data);
      if (r.data.latitude) api.get(`/weather?lat=${r.data.latitude}&lon=${r.data.longitude}`).then(x => setW(x.data));
    });
  }, [activeFarm]);
  const cur = w?.data?.current, daily = w?.data?.daily;
  return (
    <Layout>
      <h1 className="text-3xl font-extrabold mb-4">🌦️ {t(lang, "weather")}</h1>
      {!farm?.latitude ? <p className="text-stone-500">Add latitude/longitude to your farm to see weather.</p> : !cur ? <p>Loading...</p> : (
        <div>
          <div className="flex items-center gap-2 mb-3"><StatusBadge kind="LIVE" /><span className="text-xs text-stone-500">Open-Meteo · {new Date(w.fetched_at).toLocaleString()}</span></div>
          <Card className="rounded-2xl mb-4"><CardContent className="p-6">
            <div className="text-6xl font-black mb-2">{Math.round(cur.temperature_2m)}°C</div>
            <div className="text-sm text-stone-600">Humidity {cur.relative_humidity_2m}% · Wind {cur.wind_speed_10m} km/h · Rain last hr {cur.precipitation} mm</div>
          </CardContent></Card>
          <h2 className="text-xl font-bold mb-2">7-day {t(lang, "forecast")}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
            {daily.time.map((d, i) => (
              <Card key={d} className="rounded-xl"><CardContent className="p-3 text-center">
                <div className="text-xs text-stone-500">{new Date(d).toLocaleDateString('en', {weekday:'short'})}</div>
                <div className="text-lg font-bold">{Math.round(daily.temperature_2m_max[i])}°/{Math.round(daily.temperature_2m_min[i])}°</div>
                <div className="text-xs text-blue-600">{daily.precipitation_sum[i]}mm</div>
              </CardContent></Card>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}

export function Irrigation() {
  const { lang, activeFarm } = useApp();
  const [zones, setZones] = useState([]);
  const [selected, setSelected] = useState("");
  const [duration, setDuration] = useState(15);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [history, setHistory] = useState([]);

  const load = async () => {
    if (!activeFarm) return;
    const r = await api.get(`/farms/${activeFarm}/zones`);
    setZones(r.data);
    const h = await api.get("/irrigation/history");
    setHistory(h.data);
  };
  useEffect(() => { load(); }, [activeFarm]);

  const start = async () => {
    try {
      await api.post("/irrigation/start", { zone_id: selected, duration_minutes: parseInt(duration), confirmed: true });
      toast.success("Irrigation started");
      setConfirmOpen(false);
      load();
    } catch (e) { toast.error("Failed"); }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold mb-1">💧 {t(lang, "smart_irrigation")}</h1>
      <p className="text-sm text-stone-600 mb-4">Manual + intelligent recommendations. All physical actions require confirmation.</p>
      <Card className="rounded-2xl mb-4"><CardContent className="p-4 space-y-3">
        <div><Label>Zone</Label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger data-testid="irr-zone-select"><SelectValue placeholder="Choose zone" /></SelectTrigger>
            <SelectContent>{zones.map(z => <SelectItem key={z.id} value={z.id}>{z.name} — {z.crop || "no crop"}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>{t(lang, "duration_min")}</Label>
          <Input data-testid="irr-duration" type="number" value={duration} onChange={e => setDuration(e.target.value)} min="1" max="120" />
        </div>
        <Button data-testid="irr-start-btn" onClick={() => setConfirmOpen(true)} disabled={!selected} className="w-full bg-blue-700 hover:bg-blue-800"><Droplets size={16} className="mr-1" /> {t(lang, "start_irrigation")}</Button>
      </CardContent></Card>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirm Irrigation</DialogTitle></DialogHeader>
          <p className="text-sm">Start irrigation for {zones.find(z => z.id === selected)?.name} for {duration} minutes?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>{t(lang, "cancel")}</Button>
            <Button data-testid="irr-confirm" onClick={start} className="bg-emerald-700">{t(lang, "confirm")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Card className="rounded-2xl"><CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent>
          {history.length === 0 ? <p className="text-sm text-stone-500">No irrigation events yet.</p> :
            <div className="space-y-2">{history.map(h => (
              <div key={h.id} className="p-2 rounded bg-stone-50 border border-stone-200 text-sm flex justify-between">
                <span>Zone: {zones.find(z => z.id === h.zone_id)?.name || h.zone_id}</span>
                <span>{h.duration_minutes} min · {h.state}</span>
              </div>
            ))}</div>}
        </CardContent>
      </Card>
    </Layout>
  );
}

export function Market() {
  const { lang } = useApp();
  const [crop, setCrop] = useState("Tomato");
  const [data, setData] = useState(null);
  const load = async () => { const r = await api.get(`/market?crop=${crop}`); setData(r.data); };
  useEffect(() => { load(); }, [crop]);
  const sorted = data ? [...data.items].sort((a,b) => b.modal - a.modal) : [];
  return (
    <Layout>
      <h1 className="text-3xl font-extrabold mb-1">🛒 {t(lang, "market")}</h1>
      <div className="flex items-center gap-2 mb-4">
        <StatusBadge kind="RECENT">LATEST AVAILABLE</StatusBadge>
        {data && <span className="text-xs text-stone-500">Market date: {data.market_data_date} · Source: {data.source}</span>}
      </div>
      <Card className="rounded-2xl mb-4"><CardContent className="p-4">
        <Label>Search crop</Label>
        <Input data-testid="market-crop-input" value={crop} onChange={e => setCrop(e.target.value)} placeholder="Tomato, Chilli, Paddy..." />
      </CardContent></Card>
      <Card className="rounded-2xl">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-stone-100 text-left"><th className="p-3">Market</th><th className="p-3">Min</th><th className="p-3">Max</th><th className="p-3">Modal</th><th className="p-3">Unit</th><th className="p-3">{t(lang, "distance")}</th></tr></thead>
            <tbody>
              {sorted.map((m, i) => (
                <tr key={i} className="border-t border-stone-200">
                  <td className="p-3"><div className="font-semibold">{m.market}</div><div className="text-xs text-stone-500">{m.state}</div></td>
                  <td className="p-3">₹{m.price_min}</td>
                  <td className="p-3">₹{m.price_max}</td>
                  <td className="p-3 font-bold text-emerald-700">₹{m.modal}</td>
                  <td className="p-3">/{m.unit}</td>
                  <td className="p-3">{m.distance_km} km</td>
                </tr>
              ))}
              {sorted.length === 0 && <tr><td colSpan="6" className="p-6 text-center text-stone-500">No data for this crop.</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </Layout>
  );
}

export function Buyers() {
  const { lang } = useApp();
  const [crop, setCrop] = useState("Tomato");
  const [data, setData] = useState(null);
  useEffect(() => { api.get(`/buyers?crop=${crop}`).then(r => setData(r.data)); }, [crop]);
  return (
    <Layout>
      <h1 className="text-3xl font-extrabold mb-1">🤝 {t(lang, "buyers")}</h1>
      <div className="flex items-center gap-2 mb-4"><StatusBadge kind="RECENT" />{data && <span className="text-xs text-stone-500">{data.source}</span>}</div>
      <Card className="rounded-2xl mb-4"><CardContent className="p-4"><Input data-testid="buyer-crop-input" value={crop} onChange={e => setCrop(e.target.value)} placeholder="Search crop..." /></CardContent></Card>
      <div className="grid md:grid-cols-2 gap-3">
        {(data?.items || []).map((b, i) => (
          <Card key={i} className="rounded-2xl"><CardContent className="p-4">
            <div className="font-bold">{b.name}</div>
            <div className="text-xs text-stone-500 mb-2">{b.location} · Grade {b.grade}</div>
            <div className="text-sm">Wants: {b.crop} · Min {b.quantity_min_kg} kg</div>
            <div className="text-lg font-bold text-emerald-700 mt-1">₹{b.price_per_kg}/kg</div>
            <div className="text-xs text-stone-500 mt-1">Listed: {b.listed_on} · {b.contact}</div>
          </CardContent></Card>
        ))}
        {(!data?.items?.length) && <div className="col-span-2 text-center text-stone-500 py-6">NO CURRENT BUYER DATA FOUND</div>}
      </div>
    </Layout>
  );
}

export function WhatIf() {
  const { lang, activeFarm } = useApp();
  const [scenario, setScenario] = useState("no_rain");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      const r = await api.post("/whatif", { farm_id: activeFarm, scenario, language: lang });
      setResult(r.data);
    } finally { setBusy(false); }
  };
  return (
    <Layout>
      <h1 className="text-3xl font-extrabold mb-1">🔮 {t(lang, "whatif")}</h1>
      <p className="text-sm text-stone-600 mb-4">All results are clearly labelled SIMULATION.</p>
      <Card className="rounded-2xl mb-4"><CardContent className="p-4 space-y-3">
        <Label>{t(lang, "scenario")}</Label>
        <Select value={scenario} onValueChange={setScenario}>
          <SelectTrigger data-testid="whatif-scenario"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="no_rain">No rain for 2 weeks</SelectItem>
            <SelectItem value="heavy_rain">Heavy rain (100mm)</SelectItem>
            <SelectItem value="high_temp">High temperature (40°C+)</SelectItem>
            <SelectItem value="low_water">Water tank at 20%</SelectItem>
            <SelectItem value="irrigate_now">Irrigate all zones now</SelectItem>
            <SelectItem value="delay_irrigation">Delay irrigation by 3 days</SelectItem>
          </SelectContent>
        </Select>
        <Button data-testid="whatif-run" onClick={run} disabled={busy} className="bg-purple-700 hover:bg-purple-800"><Sparkles size={16} className="mr-1" />{busy ? t(lang, "generating") : t(lang, "simulate")}</Button>
      </CardContent></Card>
      {result && (
        <Card className="rounded-2xl"><CardHeader className="flex-row items-center justify-between"><CardTitle className="text-base">Simulation Result</CardTitle><StatusBadge kind="SIMULATED" /></CardHeader>
          <CardContent><div className="whitespace-pre-wrap text-sm">{result.result}</div></CardContent>
        </Card>
      )}
    </Layout>
  );
}

export function Production() {
  const { lang, activeFarm } = useApp();
  const [zones, setZones] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ zone_id: "", crop: "", quantity: "", unit: "kg", quality: "", notes: "" });
  const load = async () => {
    if (activeFarm) { const r = await api.get(`/farms/${activeFarm}/zones`); setZones(r.data); }
    const p = await api.get("/production"); setItems(p.data);
  };
  useEffect(() => { load(); }, [activeFarm]);
  const save = async () => {
    if (!form.zone_id || !form.quantity) { toast.error("Fill zone and quantity"); return; }
    await api.post("/production", { ...form, quantity: parseFloat(form.quantity) });
    toast.success("Saved");
    setForm({ zone_id: "", crop: "", quantity: "", unit: "kg", quality: "", notes: "" });
    load();
  };
  return (
    <Layout>
      <h1 className="text-3xl font-extrabold mb-1">📦 {t(lang, "production")}</h1>
      <Card className="rounded-2xl mb-4"><CardHeader><CardTitle>Record Production</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-2">
          <Select value={form.zone_id} onValueChange={v => setForm({...form, zone_id: v})}>
            <SelectTrigger data-testid="prod-zone"><SelectValue placeholder="Zone" /></SelectTrigger>
            <SelectContent>{zones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent>
          </Select>
          <Input data-testid="prod-crop" placeholder="Crop" value={form.crop} onChange={e => setForm({...form, crop: e.target.value})} />
          <Input data-testid="prod-qty" placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
          <Input data-testid="prod-unit" placeholder="Unit" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
          <Input data-testid="prod-quality" placeholder="Quality" value={form.quality} onChange={e => setForm({...form, quality: e.target.value})} />
          <Textarea data-testid="prod-notes" placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
          <Button data-testid="prod-save" onClick={save} className="bg-emerald-700 hover:bg-emerald-800">Save</Button>
        </CardContent>
      </Card>
      <div className="space-y-2">{items.map(p => (
        <Card key={p.id} className="rounded-xl"><CardContent className="p-3 flex justify-between text-sm">
          <span>{p.crop} — {p.quantity} {p.unit}</span>
          <span className="text-stone-500">{new Date(p.created_at).toLocaleDateString()}</span>
        </CardContent></Card>
      ))}</div>
    </Layout>
  );
}

export function Profitability() {
  const { lang, activeFarm } = useApp();
  const [zones, setZones] = useState([]);
  const [f, setF] = useState({ zone_id: "", crop: "", quantity: "", price_per_unit: "", seed_cost: "", fertilizer_cost: "", labour_cost: "", water_cost: "", transport_cost: "", other_cost: "" });
  const [result, setResult] = useState(null);
  useEffect(() => { if (activeFarm) api.get(`/farms/${activeFarm}/zones`).then(r => setZones(r.data)); }, [activeFarm]);
  const calc = async () => {
    const body = Object.fromEntries(Object.entries(f).map(([k, v]) => [k, ["zone_id", "crop"].includes(k) ? v : parseFloat(v) || 0]));
    const r = await api.post("/profitability", body); setResult(r.data);
  };
  return (
    <Layout>
      <h1 className="text-3xl font-extrabold mb-1">💰 {t(lang, "profitability")}</h1>
      <div className="mb-3"><StatusBadge kind="INDICATIVE" /></div>
      <Card className="rounded-2xl mb-4"><CardContent className="p-4 grid sm:grid-cols-2 gap-2">
        <Select value={f.zone_id} onValueChange={v => setF({...f, zone_id: v})}>
          <SelectTrigger data-testid="prof-zone"><SelectValue placeholder="Zone" /></SelectTrigger>
          <SelectContent>{zones.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}</SelectContent>
        </Select>
        <Input placeholder="Crop" value={f.crop} onChange={e => setF({...f, crop: e.target.value})} data-testid="prof-crop" />
        <Input placeholder="Quantity" type="number" value={f.quantity} onChange={e => setF({...f, quantity: e.target.value})} data-testid="prof-qty" />
        <Input placeholder="Price per unit" type="number" value={f.price_per_unit} onChange={e => setF({...f, price_per_unit: e.target.value})} data-testid="prof-price" />
        {["seed_cost","fertilizer_cost","labour_cost","water_cost","transport_cost","other_cost"].map(k => (
          <Input key={k} placeholder={k.replace(/_/g,' ')} type="number" value={f[k]} onChange={e => setF({...f, [k]: e.target.value})} data-testid={`prof-${k}`} />
        ))}
        <Button data-testid="prof-calc" onClick={calc} className="bg-emerald-700 sm:col-span-2">Calculate</Button>
      </CardContent></Card>
      {result && (
        <Card className="rounded-2xl"><CardContent className="p-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div><div className="text-xs text-stone-500">{t(lang, "revenue")}</div><div className="text-2xl font-black text-emerald-700">₹{result.revenue}</div></div>
            <div><div className="text-xs text-stone-500">{t(lang, "cost")}</div><div className="text-2xl font-black text-rose-700">₹{result.total_cost}</div></div>
            <div><div className="text-xs text-stone-500">{t(lang, "margin")}</div><div className="text-2xl font-black">₹{result.margin}</div></div>
          </div>
          <div className="text-xs text-center mt-2 text-stone-500">{result.note}</div>
        </CardContent></Card>
      )}
    </Layout>
  );
}

export function Devices() {
  const { lang } = useApp();
  const [items, setItems] = useState([]);
  const [f, setF] = useState({ name: "", device_type: "soil_moisture" });
  const load = async () => { const r = await api.get("/devices"); setItems(r.data); };
  useEffect(() => { load(); }, []);
  const add = async () => { if (!f.name) return; await api.post("/devices", f); setF({name:"", device_type:"soil_moisture"}); load(); };
  const del = async (id) => { await api.delete(`/devices/${id}`); load(); };
  return (
    <Layout>
      <h1 className="text-3xl font-extrabold mb-1">📡 {t(lang, "devices")}</h1>
      <Card className="rounded-2xl mb-4"><CardContent className="p-4 flex gap-2">
        <Input data-testid="dev-name" placeholder="Device name" value={f.name} onChange={e => setF({...f, name: e.target.value})} />
        <Select value={f.device_type} onValueChange={v => setF({...f, device_type: v})}>
          <SelectTrigger data-testid="dev-type" className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="esp32">ESP32</SelectItem>
            <SelectItem value="soil_moisture">Soil Moisture</SelectItem>
            <SelectItem value="temperature">Temperature</SelectItem>
            <SelectItem value="humidity">Humidity</SelectItem>
            <SelectItem value="water_level">Water Level</SelectItem>
            <SelectItem value="pump">Pump/Relay</SelectItem>
          </SelectContent>
        </Select>
        <Button data-testid="dev-add" onClick={add} className="bg-emerald-700"><Plus size={16} /></Button>
      </CardContent></Card>
      <div className="space-y-2">
        {items.map(d => (
          <Card key={d.id} className="rounded-xl"><CardContent className="p-3 flex justify-between items-center">
            <div><div className="font-semibold flex items-center gap-2"><Cpu size={14} />{d.name}</div><div className="text-xs text-stone-500">{d.device_type} · {d.status}</div></div>
            <button onClick={() => del(d.id)} className="text-rose-600" data-testid={`dev-del-${d.id}`}><Trash2 size={14} /></button>
          </CardContent></Card>
        ))}
        {items.length === 0 && <p className="text-sm text-stone-500 text-center py-6">No devices added yet.</p>}
      </div>
    </Layout>
  );
}

export function SettingsPage() {
  const { lang, setLang, user } = useApp();
  return (
    <Layout>
      <h1 className="text-3xl font-extrabold mb-4">⚙️ {t(lang, "settings")}</h1>
      <Card className="rounded-2xl mb-4"><CardContent className="p-4">
        <div className="mb-3"><Label>{t(lang, "language")}</Label>
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger data-testid="settings-lang"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="hi">हिन्दी</SelectItem><SelectItem value="kn">ಕನ್ನಡ</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="text-sm text-stone-600">Logged in as: <span className="font-semibold">{user?.email}</span></div>
      </CardContent></Card>
    </Layout>
  );
}

export function SimplePlaceholder({ title, icon }) {
  const { lang } = useApp();
  return <Layout><h1 className="text-3xl font-extrabold mb-3">{title}</h1><p className="text-sm text-stone-500">Available as part of your farm reports and analytics.</p></Layout>;
}

export function Reports() {
  const { lang, activeFarm } = useApp();
  const [r, setR] = useState(null);
  useEffect(() => { if (activeFarm) api.get(`/reports/farm/${activeFarm}`).then(x => setR(x.data)); }, [activeFarm]);
  return (
    <Layout>
      <h1 className="text-3xl font-extrabold mb-4">📄 {t(lang, "reports")}</h1>
      {!r ? <p>Loading...</p> : (
        <div className="space-y-3">
          <Card className="rounded-2xl"><CardHeader><CardTitle>{r.farm.name}</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <div>Location: {r.farm.location}</div>
              <div>Area: {r.farm.area} {r.farm.area_unit}</div>
              <div>Zones: {r.zones.length}</div>
              <div>Analyses: {r.analyses.length}</div>
              <div>Production entries: {r.production.length}</div>
              <div>Irrigation events: {r.irrigation.length}</div>
              <div className="text-xs text-stone-500 mt-3">Generated: {new Date(r.generated_at).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </Layout>
  );
}
