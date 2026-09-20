import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { Leaf } from "lucide-react";

export default function Auth() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { login, signup, lang } = useApp();
  const [tab, setTab] = useState(params.get("mode") === "signup" ? "signup" : "login");
  const [busy, setBusy] = useState(false);

  const submit = async (e, mode) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    setBusy(true);
    try {
      if (mode === "login") {
        await login(fd.get("email"), fd.get("password"));
        toast.success("Welcome back!");
      } else {
        await signup(fd.get("name"), fd.get("email"), fd.get("password"), lang);
        toast.success("Account created!");
      }
      nav("/onboarding");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 items-center justify-center shadow-lg mb-3">
            <Leaf className="text-white" size={26} />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900">AGRiNEX</h1>
          <p className="text-sm text-stone-600">{t(lang, "tagline")}</p>
        </div>
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle>Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid grid-cols-2 w-full mb-4">
                <TabsTrigger data-testid="tab-login" value="login">{t(lang, "login")}</TabsTrigger>
                <TabsTrigger data-testid="tab-signup" value="signup">{t(lang, "signup")}</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={(e) => submit(e, "login")} className="space-y-3">
                  <div>
                    <Label>{t(lang, "email")}</Label>
                    <Input data-testid="login-email" name="email" type="email" required defaultValue="shettysapthami15@gmail.com" />
                  </div>
                  <div>
                    <Label>{t(lang, "password")}</Label>
                    <Input data-testid="login-password" name="password" type="password" required defaultValue="Agrinex@2026" />
                  </div>
                  <Button data-testid="login-submit" disabled={busy} className="w-full bg-emerald-700 hover:bg-emerald-800">{busy ? "..." : t(lang, "login")}</Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={(e) => submit(e, "signup")} className="space-y-3">
                  <div>
                    <Label>{t(lang, "name")}</Label>
                    <Input data-testid="signup-name" name="name" required />
                  </div>
                  <div>
                    <Label>{t(lang, "email")}</Label>
                    <Input data-testid="signup-email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label>{t(lang, "password")}</Label>
                    <Input data-testid="signup-password" name="password" type="password" required minLength={6} />
                  </div>
                  <Button data-testid="signup-submit" disabled={busy} className="w-full bg-emerald-700 hover:bg-emerald-800">{busy ? "..." : t(lang, "signup")}</Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <button data-testid="back-to-landing" onClick={() => nav("/")} className="mt-4 w-full text-sm text-stone-600 hover:text-emerald-800">
          ← Back
        </button>
      </div>
    </div>
  );
}
