import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/AppContext";
import { t, LANGS } from "@/lib/i18n";
import { Leaf, Camera, Mic, Layers, Cloud, ShoppingCart, ArrowRight, Sparkles } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export default function Landing() {
  const nav = useNavigate();
  const { lang, setLang, user } = useApp();

  React.useEffect(() => {
    if (user) nav("/app");
  }, [user, nav]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50 to-teal-50">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-lg">
            <Leaf className="text-white" size={22} />
          </div>
          <div>
            <div className="font-extrabold tracking-tight text-emerald-900 text-xl">AGRiNEX</div>
            <div className="text-[10px] text-stone-500 uppercase tracking-widest">Agriculture + Next Gen</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={lang} onValueChange={setLang}>
            <SelectTrigger data-testid="landing-lang-select" className="w-[140px] h-9 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGS.map((l) => (
                <SelectItem key={l.code} value={l.code}>{l.native}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button data-testid="landing-login-btn" variant="outline" onClick={() => nav("/auth")}>{t(lang, "login")}</Button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-12 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-6">
            <Sparkles size={12} /> Real-Time Digital Farm Intelligence
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 leading-[1.05] mb-6">
            {t(lang, "tagline")}
          </h1>
          <p className="text-lg text-stone-600 mb-3 leading-relaxed">
            AGRiNEX is a multilingual, voice-first, AI-powered digital operating system for your actual farm.
          </p>
          <p className="text-sm text-emerald-800 font-semibold uppercase tracking-wider mb-8">
            {t(lang, "hero_sub")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              data-testid="landing-get-started"
              size="lg"
              className="bg-emerald-700 hover:bg-emerald-800 text-white h-12 px-6 rounded-xl"
              onClick={() => nav("/auth?mode=signup")}
            >
              {t(lang, "get_started")} <ArrowRight size={18} className="ml-2" />
            </Button>
            <Button
              data-testid="landing-demo-btn"
              size="lg"
              variant="outline"
              className="h-12 px-6 rounded-xl border-emerald-300"
              onClick={() => nav("/demo")}
            >
              {t(lang, "demo_mode")}
            </Button>
          </div>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { icon: Camera, label: "Image AI" },
              { icon: Mic, label: "Voice" },
              { icon: Layers, label: "Digital Twin" },
              { icon: Cloud, label: "Weather" },
            ].map((f) => (
              <div key={f.label} className="p-3">
                <f.icon className="mx-auto text-emerald-700 mb-1.5" size={22} />
                <div className="text-xs font-semibold text-stone-700">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-3xl rounded-full" />
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white">
            <img
              src="https://images.unsplash.com/photo-1560493676-04071c5f467b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NzA1NTZ8MHwxfHNlYXJjaHwxfHxzbWFydCUyMGZhcm1pbmclMjBhZ3JpY3VsdHVyZSUyMGZpZWxkJTIwZmFybSUyMGdyZWVuJTIwY3JvcCUyMGhhcnZlc3R8ZW58MHx8fHwxNzg5MjAxNjM3fDA&ixlib=rb-4.1.0&q=85"
              alt="Smart farm"
              className="w-full h-[420px] object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Live Twin Preview</span>
                <span className="text-[10px] text-stone-500">DEMO</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {["emerald","amber","emerald","blue"].map((c,i)=>(
                  <div key={i} className={`h-10 rounded bg-${c}-100 border border-${c}-300 flex items-center justify-center`}>
                    <span className={`w-2 h-2 rounded-full bg-${c}-500`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-stone-200">
        <h2 className="text-3xl font-bold text-stone-900 mb-2">One farm. One operating system.</h2>
        <p className="text-stone-600 mb-8">Everything you need to sense, understand, decide and act — using your actual data.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            ["Farm Setup", "Create your farm and add as many zones as your farm actually needs."],
            ["Soil & Plant AI", "Upload real photos. AI analyzes what is visible — never fabricates."],
            ["Pictorial Digital Twin", "See every zone as a clickable field card with live status."],
            ["Live Weather", "Current weather + 7-day forecast from Open-Meteo."],
            ["Smart Irrigation", "Recommendations plus authorized manual control."],
            ["Market & Buyers", "Latest available mandi prices and buyer directory."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl bg-white border border-stone-200 p-5 hover:shadow-md transition">
              <h3 className="font-bold text-stone-900 mb-1">{title}</h3>
              <p className="text-sm text-stone-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center py-8 text-xs text-stone-500 border-t border-stone-200">
        AGRiNEX · Digital Operating System for the Farm · © 2026
      </footer>
    </div>
  );
}
