import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/AppContext";
import { t, LANGS } from "@/lib/i18n";
import {
  Home, Layers, Camera, Leaf, Cloud, Droplets, Zap, Flower2, Sparkles,
  ShoppingCart, Users2, PackageOpen, Wallet, BarChart3, Mic, FileText,
  Cpu, Settings as SettingsIcon, LogOut, Menu, X, TreePine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const NAV = [
  { path: "/app", key: "dashboard", icon: Home, end: true },
  { path: "/app/twin", key: "digital_twin", icon: Layers },
  { path: "/app/zones", key: "zones", icon: TreePine },
  { path: "/app/soil", key: "soil_analysis", icon: Camera },
  { path: "/app/plant", key: "crop_health", icon: Leaf },
  { path: "/app/what-grow", key: "what_grow", icon: Flower2 },
  { path: "/app/weather", key: "weather", icon: Cloud },
  { path: "/app/irrigation", key: "smart_irrigation", icon: Droplets },
  { path: "/app/whatif", key: "whatif", icon: Sparkles },
  { path: "/app/market", key: "market", icon: ShoppingCart },
  { path: "/app/buyers", key: "buyers", icon: Users2 },
  { path: "/app/production", key: "production", icon: PackageOpen },
  { path: "/app/profitability", key: "profitability", icon: Wallet },
  { path: "/app/analytics", key: "analytics", icon: BarChart3 },
  { path: "/app/ask", key: "ask", icon: Mic },
  { path: "/app/reports", key: "reports", icon: FileText },
  { path: "/app/devices", key: "devices", icon: Cpu },
  { path: "/app/settings", key: "settings", icon: SettingsIcon },
];

export default function Layout({ children, isDemo }) {
  const { user, lang, setLang, logout } = useApp();
  const [open, setOpen] = React.useState(false);
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              data-testid="mobile-menu-toggle"
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-stone-100"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-md">
                <Leaf className="text-white" size={20} />
              </div>
              <div>
                <div className="font-extrabold tracking-tight text-emerald-900 text-lg leading-none">AGRiNEX</div>
                <div className="text-[10px] text-stone-500 uppercase tracking-wider">Farm Intelligence</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDemo && (
              <span data-testid="demo-badge" className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300">
                {t(lang, "demo_label")}
              </span>
            )}
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger data-testid="lang-select" className="w-[130px] h-9 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGS.map((l) => (
                  <SelectItem key={l.code} value={l.code} data-testid={`lang-option-${l.code}`}>
                    {l.native}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {user ? (
              <Button
                data-testid="logout-btn"
                variant="outline"
                size="sm"
                onClick={() => { logout(); nav("/"); }}
              >
                <LogOut size={16} />
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-[57px] left-0 z-30 w-64 h-[calc(100vh-57px)] bg-white border-r border-stone-200 overflow-y-auto transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
        >
          <nav className="p-3 space-y-0.5">
            {NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                data-testid={`nav-${item.key}`}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "text-stone-700 hover:bg-stone-100"
                  }`
                }
              >
                <item.icon size={18} />
                <span>{t(lang, item.key)}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        {open && (
          <div
            className="fixed inset-0 top-[57px] bg-black/30 z-20 lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
