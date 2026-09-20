"use client";

import React, { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { toast } from "sonner";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Clock,
  MapPin,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
  time?: string;
}

export default function AskPage() {
  const { lang, activeFarm, farms } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentFarm = farms.find((f) => f.id === activeFarm) || {
    name: "Namfarm",
    location: "Bhatkal, Karnataka",
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, busy]);

  const send = async (text?: string) => {
    const msg = text || input;
    if (!msg.trim() || busy) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg, time: timeStr }]);
    setBusy(true);

    try {
      const r = await api.post("/ask", {
        message: msg,
        language: lang,
        farm_id: activeFarm || "demo-farm",
      });
      const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((m) => [...m, { role: "assistant", text: r.data.reply, time: replyTime }]);
    } catch (e: any) {
      toast.error("Failed to get response from AI agent");
    } finally {
      setBusy(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const samples = [
    "What is today's exact date, current time, and live weather?",
    "How is my farm and does any zone need irrigation today?",
    "What are the current APMC Mandi prices for my area?",
    "What crop is best suited for my soil and current weather?",
    "How do I prevent early blight in tomato crops?",
  ];

  const clearChat = () => {
    setMessages([]);
    toast.success("Chat history cleared");
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 flex items-center gap-2">
            💬 {t(lang, "ask")}
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Text-based agronomic AI advisor powered by Google Gemini 2.5 Flash, grounded in your real-time farm telemetry.
          </p>
        </div>

        {/* Real-time farm location pill */}
        <div className="flex items-center gap-2 text-xs text-stone-600 bg-white border border-stone-200 rounded-xl px-3 py-2 shadow-sm">
          <MapPin size={14} className="text-emerald-700 shrink-0" />
          <span className="font-semibold text-stone-900">{currentFarm.name}</span>
          <span className="text-stone-400">&bull;</span>
          <span>{currentFarm.location || "Karnataka"}</span>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="h-6 px-1.5 text-[10px] text-stone-400 hover:text-stone-700 ml-1"
              title="Clear Chat"
            >
              <RefreshCw size={11} />
            </Button>
          )}
        </div>
      </div>

      <Card className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Messages Scroll Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-10 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Bot size={24} />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-1">
                AGRiNEX Text Intelligence Assistant
              </h3>
              <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                Ask any question about your crops, live weather, soil moisture, irrigation schedules,
                or mandi market prices in English, Hindi, or Kannada.
              </p>

              <div className="text-left space-y-2">
                <div className="text-xs font-bold text-stone-700 flex items-center gap-1.5 mb-2">
                  <HelpCircle size={14} className="text-emerald-600" />
                  Suggested Questions:
                </div>
                <div className="flex flex-col gap-2">
                  {samples.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => send(s)}
                      className="text-left text-xs bg-stone-50 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-700 transition cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  m.role === "user"
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-sm"
                }`}
              >
                {m.role === "user" ? <User size={15} /> : <Bot size={15} />}
              </div>

              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-emerald-700 text-white rounded-tr-none shadow-sm"
                    : "bg-stone-50 text-stone-900 border border-stone-200 rounded-tl-none shadow-sm whitespace-pre-wrap font-normal"
                }`}
              >
                {m.text}
                {m.time && (
                  <div
                    className={`text-[10px] mt-1.5 text-right flex items-center justify-end gap-1 ${
                      m.role === "user" ? "text-emerald-200" : "text-stone-400"
                    }`}
                  >
                    <Clock size={10} />
                    {m.time}
                  </div>
                )}
              </div>
            </div>
          ))}

          {busy && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 border border-emerald-200">
                <Bot size={15} />
              </div>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-stone-500 flex items-center gap-2">
                <Sparkles className="animate-spin text-emerald-700" size={14} />
                <span>AGRiNEX AI is analyzing live farm sensors & weather...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Text Input Area */}
        <div className="p-3 sm:p-4 border-t border-stone-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about crops, soil, live weather, irrigation, or market prices..."
              className="flex-1 rounded-xl h-11 text-sm bg-stone-50 border-stone-300 focus:bg-white"
              disabled={busy}
            />
            <Button
              type="submit"
              disabled={!input.trim() || busy}
              className="h-11 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center gap-1.5 shadow-sm"
            >
              {busy ? (
                <Sparkles className="animate-spin" size={16} />
              ) : (
                <Send size={16} />
              )}
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </Card>
    </Layout>
  );
}
