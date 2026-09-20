import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setToken } from "@/lib/api";

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState(localStorage.getItem("agrinex_lang") || "en");
  const [loading, setLoading] = useState(true);
  const [activeFarm, setActiveFarm] = useState(
    localStorage.getItem("agrinex_farm") || null
  );

  useEffect(() => {
    const token = localStorage.getItem("agrinex_token");
    if (!token) { setLoading(false); return; }
    api.get("/auth/me").then((r) => {
      setUser(r.data);
      if (r.data.language) setLang(r.data.language);
    }).catch(() => { setToken(null); }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem("agrinex_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    if (activeFarm) localStorage.setItem("agrinex_farm", activeFarm);
    else localStorage.removeItem("agrinex_farm");
  }, [activeFarm]);

  const login = async (email, password) => {
    const r = await api.post("/auth/login", { email, password });
    setToken(r.data.token);
    setUser(r.data.user);
    if (r.data.user.language) setLang(r.data.user.language);
    return r.data.user;
  };

  const signup = async (name, email, password, language) => {
    const r = await api.post("/auth/signup", { name, email, password, language });
    setToken(r.data.token);
    setUser(r.data.user);
    setLang(language);
    return r.data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setActiveFarm(null);
  };

  return (
    <AppCtx.Provider value={{ user, setUser, lang, setLang, loading, login, signup, logout, activeFarm, setActiveFarm }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
