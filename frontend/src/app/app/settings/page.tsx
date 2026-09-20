"use client";

import React from "react";
import Layout from "@/components/Layout";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const { lang, setLang, user } = useApp();

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold mb-4">⚙️ {t(lang, "settings")}</h1>
      <Card className="rounded-2xl mb-4">
        <CardContent className="p-4">
          <div className="mb-3">
            <Label className="mb-1 block">{t(lang, "language")}</Label>
            <Select value={lang} onValueChange={setLang}>
              <SelectTrigger data-testid="settings-lang">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
                <SelectItem value="kn">ಕನ್ನಡ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-stone-600">
            Logged in as: <span className="font-semibold">{user?.email}</span>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
