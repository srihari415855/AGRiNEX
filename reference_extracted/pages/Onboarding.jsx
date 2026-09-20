import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t, LANGS } from "@/lib/i18n";
import { Plus, Trash2, Check } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function Onboarding() {
  const nav = useNavigate();
  const { lang, setLang, setActiveFarm } = useApp();
  const [step, setStep] = useState(1);
  const [farm, setFarm] = useState({
    name: "", location: "", area: "", area_unit: "acre",
    water_availability: "", irrigation_method: "", farming_type: "",
    latitude: "", longitude: "",
  });
  const [zones, setZones] = useState([{ name: "Zone 1", crop: "", soil_type: "", area: "" }]);
  const [busy, setBusy] = useState(false);

  const addZone = () => setZones([...zones, { name: `Zone ${zones.length + 1}`, crop: "", soil_type: "", area: "" }]);
  const rmZone = (i) => setZones(zones.filter((_, idx) => idx !== i));
  const updZone = (i, k, v) => setZones(zones.map((z, idx) => idx === i ? { ...z, [k]: v } : z));

  const finish = async () => {
    setBusy(true);
    try {
      const payload = {
        ...farm,
        area: parseFloat(farm.area) || 0,
        latitude: farm.latitude ? parseFloat(farm.latitude) : null,
        longitude: farm.longitude ? parseFloat(farm.longitude) : null,
      };
      const r = await api.post("/farms", payload);
      for (const z of zones) {
        if (!z.name.trim()) continue;
        await api.post(`/farms/${r.data.id}/zones`, {
          name: z.name, crop: z.crop || null, soil_type: z.soil_type || null,
          area: z.area ? parseFloat(z.area) : null,
        });
      }
      setActiveFarm(r.data.id);
      toast.success("Farm created!");
      nav("/app");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-stone-100 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          {[1,2,3].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${step >= s ? "bg-emerald-600" : "bg-stone-200"}`} />
          ))}
        </div>
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-1">{t(lang, "choose_language")}</h2>
                <p className="text-sm text-stone-600 mb-6">This applies to the entire app.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      data-testid={`onboard-lang-${l.code}`}
                      onClick={() => setLang(l.code)}
                      className={`p-4 rounded-xl border-2 text-left transition ${lang === l.code ? "border-emerald-600 bg-emerald-50" : "border-stone-200 hover:border-emerald-300"}`}
                    >
                      <div className="text-xl font-bold text-stone-900">{l.native}</div>
                      <div className="text-xs text-stone-500">{l.label}</div>
                      {lang === l.code && <Check className="text-emerald-600 mt-2" size={16} />}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button data-testid="onboard-step-1-next" onClick={() => setStep(2)} className="bg-emerald-700 hover:bg-emerald-800">{t(lang, "next")}</Button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-1">{t(lang, "create_farm")}</h2>
                <p className="text-sm text-stone-600 mb-4">Fill what you know. You can add rest later.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Label>{t(lang, "farm_name")}</Label><Input data-testid="onboard-farm-name" value={farm.name} onChange={(e) => setFarm({...farm, name: e.target.value})} /></div>
                  <div className="col-span-2"><Label>{t(lang, "location")}</Label><Input data-testid="onboard-farm-location" value={farm.location} onChange={(e) => setFarm({...farm, location: e.target.value})} placeholder="Village, District, State" /></div>
                  <div><Label>{t(lang, "area")}</Label><Input data-testid="onboard-farm-area" type="number" step="0.1" value={farm.area} onChange={(e) => setFarm({...farm, area: e.target.value})} /></div>
                  <div><Label>{t(lang, "area_unit")}</Label>
                    <Select value={farm.area_unit} onValueChange={(v) => setFarm({...farm, area_unit: v})}>
                      <SelectTrigger data-testid="onboard-area-unit"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="acre">Acre</SelectItem>
                        <SelectItem value="hectare">Hectare</SelectItem>
                        <SelectItem value="gunta">Gunta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Latitude</Label><Input data-testid="onboard-lat" type="number" step="0.0001" value={farm.latitude} onChange={(e) => setFarm({...farm, latitude: e.target.value})} placeholder="13.1373" /></div>
                  <div><Label>Longitude</Label><Input data-testid="onboard-lon" type="number" step="0.0001" value={farm.longitude} onChange={(e) => setFarm({...farm, longitude: e.target.value})} placeholder="78.1298" /></div>
                  <div className="col-span-2"><Label>{t(lang, "water")}</Label><Input data-testid="onboard-water" value={farm.water_availability} onChange={(e) => setFarm({...farm, water_availability: e.target.value})} placeholder="Borewell, Tank, Canal..." /></div>
                  <div className="col-span-2"><Label>{t(lang, "irrigation")}</Label><Input data-testid="onboard-irr" value={farm.irrigation_method} onChange={(e) => setFarm({...farm, irrigation_method: e.target.value})} placeholder="Drip, Sprinkler, Flood..." /></div>
                  <div className="col-span-2"><Label>{t(lang, "farming_type")}</Label><Input data-testid="onboard-type" value={farm.farming_type} onChange={(e) => setFarm({...farm, farming_type: e.target.value})} placeholder="Organic, Conventional, Mixed..." /></div>
                </div>
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(1)}>{t(lang, "back")}</Button>
                  <Button data-testid="onboard-step-2-next" onClick={() => setStep(3)} className="bg-emerald-700 hover:bg-emerald-800" disabled={!farm.name}>{t(lang, "next")}</Button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-stone-900 mb-1">{t(lang, "zones_question")}</h2>
                <p className="text-sm text-stone-600 mb-4">{t(lang, "zones_hint")}</p>
                <div className="space-y-3 mb-4">
                  {zones.map((z, i) => (
                    <div key={i} className="p-3 rounded-xl border border-stone-200 bg-stone-50">
                      <div className="grid grid-cols-2 gap-2">
                        <Input data-testid={`zone-name-${i}`} placeholder={t(lang, "zone_name")} value={z.name} onChange={(e) => updZone(i, "name", e.target.value)} />
                        <Input data-testid={`zone-area-${i}`} placeholder={t(lang, "area")} type="number" step="0.1" value={z.area} onChange={(e) => updZone(i, "area", e.target.value)} />
                        <Input data-testid={`zone-crop-${i}`} placeholder={t(lang, "zone_crop")} value={z.crop} onChange={(e) => updZone(i, "crop", e.target.value)} />
                        <Input data-testid={`zone-soil-${i}`} placeholder={t(lang, "zone_soil")} value={z.soil_type} onChange={(e) => updZone(i, "soil_type", e.target.value)} />
                      </div>
                      {zones.length > 1 && (
                        <button data-testid={`zone-remove-${i}`} onClick={() => rmZone(i)} className="mt-2 text-xs text-rose-600 flex items-center gap-1">
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <Button data-testid="add-zone-btn" variant="outline" onClick={addZone} className="w-full mb-4">
                  <Plus size={16} className="mr-1" /> {t(lang, "add_zone")}
                </Button>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>{t(lang, "back")}</Button>
                  <Button data-testid="onboard-finish" onClick={finish} disabled={busy} className="bg-emerald-700 hover:bg-emerald-800">{busy ? "..." : t(lang, "finish")}</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
