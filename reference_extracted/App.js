import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider, useApp } from "@/lib/AppContext";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import { Zones, ZoneDetail, ImageAnalyzer } from "@/pages/ZonesAndAnalysis";
import {
  WhatGrow, Ask, Weather, Irrigation, Market, Buyers, WhatIf,
  Production, Profitability, Devices, SettingsPage, Reports, SimplePlaceholder,
} from "@/pages/Features";

function Private({ children }) {
  const { user, loading } = useApp();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return children;
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Private><Onboarding /></Private>} />
          <Route path="/demo" element={<Dashboard demo />} />
          <Route path="/app" element={<Private><Dashboard /></Private>} />
          <Route path="/app/twin" element={<Private><Dashboard /></Private>} />
          <Route path="/app/zones" element={<Private><Zones /></Private>} />
          <Route path="/app/zones/:id" element={<Private><ZoneDetail /></Private>} />
          <Route path="/app/soil" element={<Private><ImageAnalyzer type="soil" /></Private>} />
          <Route path="/app/plant" element={<Private><ImageAnalyzer type="plant" /></Private>} />
          <Route path="/app/what-grow" element={<Private><WhatGrow /></Private>} />
          <Route path="/app/weather" element={<Private><Weather /></Private>} />
          <Route path="/app/irrigation" element={<Private><Irrigation /></Private>} />
          <Route path="/app/whatif" element={<Private><WhatIf /></Private>} />
          <Route path="/app/market" element={<Private><Market /></Private>} />
          <Route path="/app/buyers" element={<Private><Buyers /></Private>} />
          <Route path="/app/production" element={<Private><ImageAnalyzer type="production" /></Private>} />
          <Route path="/app/profitability" element={<Private><Profitability /></Private>} />
          <Route path="/app/analytics" element={<Private><SimplePlaceholder title="📊 Analytics" /></Private>} />
          <Route path="/app/ask" element={<Private><Ask /></Private>} />
          <Route path="/app/reports" element={<Private><Reports /></Private>} />
          <Route path="/app/devices" element={<Private><Devices /></Private>} />
          <Route path="/app/settings" element={<Private><SettingsPage /></Private>} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
