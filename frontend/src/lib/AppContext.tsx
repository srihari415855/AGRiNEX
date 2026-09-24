"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setToken } from "@/lib/api";

export interface Farm {
  id: string;
  name: string;
  location?: string;
  area?: number;
  area_unit?: string;
  latitude?: number;
  longitude?: number;
  water_availability?: string;
  irrigation_method?: string;
  farming_type?: string;
  is_demo?: boolean;
  zones?: any[];
}

interface User {
  id: string;
  email: string;
  name?: string;
  language?: string;
  created_at?: string;
}

interface AppContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  lang: string;
  setLang: (l: string) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string, language: string) => Promise<User>;
  logout: () => void;
  activeFarm: string | null;
  setActiveFarm: (id: string | null) => void;
  farms: Farm[];
  setFarms: React.Dispatch<React.SetStateAction<Farm[]>>;
  refreshFarms: () => Promise<void>;
}

const AppCtx = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<string>("en");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFarm, setActiveFarm] = useState<string | null>(null);
  const [farms, setFarms] = useState<Farm[]>([]);

  const refreshFarms = async () => {
    try {
      const res = await api.get("/farms");
      const list: Farm[] = res.data || [];
      setFarms(list);
      if (list.length > 0) {
        setActiveFarm((curr) => {
          const found = list.some((f) => f.id === curr);
          return found && curr ? curr : list[0].id;
        });
      }
    } catch (e) {
      console.error("Failed to load farms", e);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("agrinex_lang");
      if (savedLang) setLang(savedLang);
      const savedFarm = localStorage.getItem("agrinex_farm");
      if (savedFarm) setActiveFarm(savedFarm);

      const token = localStorage.getItem("agrinex_token");
      if (!token) {
        setLoading(false);
        return;
      }
      api.get("/auth/me")
        .then((r) => {
          setUser(r.data);
          if (r.data.language) setLang(r.data.language);
          refreshFarms();
        })
        .catch(() => {
          setToken(null);
        })
        .finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("agrinex_lang", lang);
      document.documentElement.lang = lang;
    }
  }, [lang]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (activeFarm) localStorage.setItem("agrinex_farm", activeFarm);
      else localStorage.removeItem("agrinex_farm");
    }
  }, [activeFarm]);

  const login = async (email: string, password: string) => {
    const r = await api.post("/auth/login", { email, password });
    setToken(r.data.token);
    setUser(r.data.user);
    if (r.data.user.language) setLang(r.data.user.language);
    await refreshFarms();
    return r.data.user;
  };

  const signup = async (name: string, email: string, password: string, language: string) => {
    const r = await api.post("/auth/signup", { name, email, password, language });
    setToken(r.data.token);
    setUser(r.data.user);
    setLang(language);
    await refreshFarms();
    return r.data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setActiveFarm(null);
    setFarms([]);
  };

  return (
    <AppCtx.Provider
      value={{
        user,
        setUser,
        lang,
        setLang,
        loading,
        login,
        signup,
        logout,
        activeFarm,
        setActiveFarm,
        farms,
        setFarms,
        refreshFarms,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppCtx);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
