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
  Mic,
  MicOff,
  Volume2,
  Radio,
  Play,
  Square,
  Headphones,
} from "lucide-react";
import {
  startSpeechRecognition,
  speakText,
  stopAllPlayback,
  isSpeechRecognitionSupported,
} from "@/lib/voice";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  time?: string;
  isVoice?: boolean;
  provider?: "elevenlabs" | "browser";
}

export default function AskPage() {
  const { lang, activeFarm, farms } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsProvider, setTtsProvider] = useState<"elevenlabs" | "browser" | null>(null);

  // Lazy state initializers from localStorage
  const [autoSpeak] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("agrinex_auto_speak");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  // Fixed gentle female voice (Rachel)
  const selectedVoiceId = "21m00Tcm4TlvDq8ikWAM";
  const [elevenLabsApiKey] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("agrinex_elevenlabs_key") || "";
    }
    return "";
  });

  const recognitionRef = useRef<{ stop: () => void; abort: () => void } | null>(null);
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
  }, [messages, busy, interimTranscript]);

  // Audio & speech recognition cleanup
  useEffect(() => {
    return () => {
      stopAllPlayback();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const playAudio = async (msgId: string, text: string) => {
    if (activeAudioId === msgId && isSpeaking) {
      stopAllPlayback();
      setIsSpeaking(false);
      setActiveAudioId(null);
      setTtsProvider(null);
      return;
    }

    stopAllPlayback();
    setActiveAudioId(msgId);
    setIsSpeaking(true);

    try {
      const provider = await speakText({
        text,
        voiceId: selectedVoiceId,
        language: lang,
        apiKeyOverride: elevenLabsApiKey || undefined,
        onStart: (p) => {
          setTtsProvider(p);
          setIsSpeaking(true);
        },
        onEnd: () => {
          setIsSpeaking(false);
          setActiveAudioId(null);
          setTtsProvider(null);
        },
        onError: (err) => {
          console.warn("Speech playback error:", err);
          setIsSpeaking(false);
          setActiveAudioId(null);
          setTtsProvider(null);
        },
      });
      setTtsProvider(provider);
    } catch {
      setIsSpeaking(false);
      setActiveAudioId(null);
      setTtsProvider(null);
    }
  };

  const stopSpeaking = () => {
    stopAllPlayback();
    setIsSpeaking(false);
    setActiveAudioId(null);
    setTtsProvider(null);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimTranscript("");
      return;
    }

    // Stop speaking if currently playing
    if (isSpeaking) {
      stopSpeaking();
    }

    if (!isSpeechRecognitionSupported()) {
      toast.error(
        "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    setInterimTranscript("");
    setIsListening(true);

    const rec = startSpeechRecognition({
      lang,
      onInterim: (interim) => {
        setInterimTranscript(interim);
      },
      onFinal: (finalText) => {
        setInterimTranscript("");
        setIsListening(false);
        if (finalText.trim()) {
          send(finalText.trim(), true);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setInterimTranscript("");
        const errMsg = "message" in err ? err.message : String(err);
        if (errMsg && !errMsg.includes("no-speech")) {
          toast.error("Microphone error: " + errMsg);
        }
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    recognitionRef.current = rec;
  };

  const send = async (text?: string, fromVoice = false) => {
    const msg = text || input;
    if (!msg.trim() || busy) return;

    stopSpeaking();
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimTranscript("");
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsgId = "user_" + Date.now();
    setInput("");
    setInterimTranscript("");
    setMessages((m) => [
      ...m,
      { id: userMsgId, role: "user", text: msg, time: timeStr, isVoice: fromVoice },
    ]);
    setBusy(true);

    try {
      // Build conversation history for interactive multi-turn session
      const historyPayload = messages.slice(-10).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const r = await api.post("/ask", {
        message: msg,
        language: lang,
        farm_id: activeFarm || "demo-farm",
        voice_mode: fromVoice || voiceMode,
        history: historyPayload,
      });

      const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const botMsgId = "bot_" + Date.now();
      const botReply = r.data.reply;

      setMessages((m) => [
        ...m,
        { id: botMsgId, role: "assistant", text: botReply, time: replyTime, isVoice: fromVoice },
      ]);

      // Automatically synthesize and speak response if autoSpeak is on
      if (autoSpeak || fromVoice || voiceMode) {
        setTimeout(() => {
          playAudio(botMsgId, botReply);
        }, 150);
      }
    } catch {
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
    stopSpeaking();
    setMessages([]);
    toast.success("Chat history cleared");
  };

  return (
    <Layout>
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
                <Bot size={22} />
              </span>
              {t(lang, "ask")}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
              <Sparkles size={11} className="text-emerald-700" />
              Gemini + ElevenLabs Voice
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Multimodal Agronomic Assistant: Speech-to-Text • Gemini Farm Reasoning • ElevenLabs Voice Synthesis.
          </p>
        </div>

        {/* Top Actions: Farm Pill, Voice Mode Switch, Voice Settings */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Farm Location Pill */}
          <div className="flex items-center gap-2 text-xs text-stone-600 bg-white border border-stone-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <MapPin size={13} className="text-emerald-700 shrink-0" />
            <span className="font-semibold text-stone-900">{currentFarm.name}</span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-500">{currentFarm.location || "Karnataka"}</span>
          </div>

          {/* Voice Mode Toggle Button */}
          <Button
            variant={voiceMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setVoiceMode(!voiceMode);
              if (!voiceMode) {
                toast.success("Voice Assistant Mode Activated");
              }
            }}
            className={`h-9 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
              voiceMode
                ? "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-500/20"
                : "border-stone-200 text-stone-700 hover:bg-stone-100"
            }`}
          >
            <Radio size={14} className={voiceMode ? "animate-pulse" : ""} />
            <span>{voiceMode ? t(lang, "voice_mode") : t(lang, "voice_assistant")}</span>
          </Button>

          {/* Clear Chat Button */}
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              className="h-9 px-2.5 rounded-xl border-stone-200 text-stone-500 hover:text-rose-600 hover:bg-rose-50 shadow-2xs"
              title="Clear Chat History"
            >
              <RefreshCw size={13} />
            </Button>
          )}
        </div>
      </div>

      {/* Main Interactive Container */}
      <div className="grid grid-cols-1 gap-4">
        {/* Voice Assistant Interactive Hub */}
        <div
          className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
            voiceMode
              ? "p-6 bg-gradient-to-b from-stone-900 via-stone-850 to-stone-900 text-white border-stone-800 shadow-xl"
              : "p-4 bg-gradient-to-r from-emerald-900/95 via-stone-900 to-teal-950 text-white border-emerald-900 shadow-md"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left: Dynamic Voice Sphere & Status */}
            <div className="flex items-center gap-4">
              {/* Central Pulsating Voice Orb Button */}
              <div className="relative group">
                {/* Ping wave animations when listening */}
                {isListening && (
                  <>
                    <span className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping opacity-75" />
                    <span className="absolute -inset-4 rounded-full bg-teal-400/20 animate-pulse" />
                  </>
                )}
                {/* Wave animations when speaking */}
                {isSpeaking && (
                  <span className="absolute -inset-2 rounded-full bg-teal-400/30 animate-pulse" />
                )}

                <button
                  onClick={toggleListening}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-lg cursor-pointer ${
                    isListening
                      ? "bg-gradient-to-tr from-rose-500 to-amber-500 text-white scale-105 shadow-rose-500/40 animate-pulse"
                      : isSpeaking
                      ? "bg-gradient-to-tr from-teal-500 to-emerald-400 text-stone-950 shadow-teal-500/30"
                      : busy
                      ? "bg-gradient-to-tr from-amber-500 to-emerald-600 text-white animate-spin"
                      : "bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white hover:scale-105 shadow-emerald-500/30"
                  }`}
                  title={isListening ? "Tap to stop listening" : "Tap to speak with AGRiNEX"}
                >
                  {isListening ? (
                    <MicOff size={24} className="animate-bounce" />
                  ) : isSpeaking ? (
                    <Volume2 size={24} className="animate-pulse" />
                  ) : busy ? (
                    <Sparkles size={24} />
                  ) : (
                    <Mic size={24} />
                  )}
                </button>
              </div>

              {/* Status & Info text */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">
                    {isListening
                      ? t(lang, "listening")
                      : isSpeaking
                      ? t(lang, "speaking")
                      : busy
                      ? t(lang, "thinking")
                      : t(lang, "voice_assistant")}
                  </span>
                  {isSpeaking && ttsProvider && (
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                      {ttsProvider === "elevenlabs" ? "ElevenLabs Multilingual" : "Browser TTS"}
                    </span>
                  )}
                </div>

                <div className="text-sm font-semibold text-stone-100 mt-0.5">
                  {isListening
                    ? interimTranscript || "Listening... Speak your question naturally"
                    : isSpeaking
                    ? "Speaking farm intelligence answer aloud..."
                    : busy
                    ? "Gemini is reasoning over sensors & APMC prices..."
                    : t(lang, "tap_to_speak")}
                </div>

                <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-2">
                  <span className="text-emerald-300 font-medium">Gentle Female AI Voice</span>
                  <span>•</span>
                  <span>Interactive Farm Session</span>
                </div>
              </div>
            </div>

            {/* Right: Quick Voice Controls */}
            <div className="flex items-center gap-2">
              {isSpeaking && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={stopSpeaking}
                  className="h-9 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Square size={13} />
                  <span>{t(lang, "stop_speaking")}</span>
                </Button>
              )}

              {isListening && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleListening}
                  className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/20 border-white/20 text-white font-medium text-xs"
                >
                  <MicOff size={13} className="mr-1" />
                  <span>Stop Mic</span>
                </Button>
              )}
            </div>
          </div>

          {/* Live Voice Waveform Visualizer Bar */}
          {(isListening || isSpeaking) && (
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 h-6">
                {[40, 75, 55, 90, 65, 80, 45, 95, 60, 85, 50, 70].map((h, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full ${
                      isListening ? "bg-amber-400" : "bg-emerald-400"
                    } animate-pulse`}
                    style={{
                      height: `${h}%`,
                      animationDuration: `${0.4 + (i % 5) * 0.15}s`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-mono text-stone-400">
                {isListening ? "SPEECH-TO-TEXT ACTIVE" : "ELEVENLABS AUDIO STREAMING"}
              </span>
            </div>
          )}
        </div>

        {/* Chat Log & Message History Card */}
        <Card className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden flex flex-col h-[520px]">
          {/* Scrollable Conversation Stream */}
          <CardContent className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-inner border border-emerald-200">
                  <Headphones size={28} />
                </div>
                <h3 className="text-base font-bold text-stone-900 mb-1">
                  AGRiNEX Voice & Text Assistant
                </h3>
                <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                  Speak into the microphone or type any question about your farm. The agent reasons
                  with Gemini using live farm telemetry and responds with lifelike ElevenLabs voice.
                </p>

                {/* Sample Prompt Chips */}
                <div className="text-left space-y-2">
                  <div className="text-xs font-bold text-stone-700 flex items-center gap-1.5 mb-2">
                    <HelpCircle size={14} className="text-emerald-600" />
                    Suggested Inquiries:
                  </div>
                  <div className="flex flex-col gap-2">
                    {samples.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => send(s)}
                        className="text-left text-xs bg-stone-50 hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-700 transition cursor-pointer flex items-center justify-between group"
                      >
                        <span>{s}</span>
                        <Play
                          size={12}
                          className="text-stone-400 group-hover:text-emerald-700 shrink-0 opacity-0 group-hover:opacity-100 transition"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Message Bubbles */}
            {messages.map((m) => {
              const isAssistant = m.role === "assistant";
              const isPlayingThis = activeAudioId === m.id && isSpeaking;

              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* User / Bot Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      m.role === "user"
                        ? "bg-emerald-700 text-white shadow-sm"
                        : "bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-sm"
                    }`}
                  >
                    {m.role === "user" ? <User size={15} /> : <Bot size={15} />}
                  </div>

                  {/* Message Bubble Card */}
                  <div
                    className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-emerald-700 text-white rounded-tr-none shadow-sm"
                        : "bg-stone-50 text-stone-900 border border-stone-200 rounded-tl-none shadow-sm whitespace-pre-wrap"
                    }`}
                  >
                    <div>{m.text}</div>

                    {/* Footer Row: Audio Player button, Timestamp, Voice pill */}
                    <div
                      className={`flex items-center justify-between gap-3 mt-2 pt-2 border-t text-[11px] ${
                        m.role === "user" ? "border-emerald-600/50 text-emerald-200" : "border-stone-200 text-stone-500"
                      }`}
                    >
                      {/* Left: Listen / Stop Button for Assistant Messages */}
                      {isAssistant ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => playAudio(m.id, m.text)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                              isPlayingThis
                                ? "bg-emerald-700 text-white shadow-sm"
                                : "bg-stone-200/80 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900"
                            }`}
                            title={isPlayingThis ? "Stop voice" : "Listen with ElevenLabs Voice"}
                          >
                            {isPlayingThis ? (
                              <>
                                <Square size={11} className="text-white" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 size={12} className="text-emerald-700" />
                                <span>Listen</span>
                              </>
                            )}
                          </button>

                          {isPlayingThis && (
                            <span className="flex items-center gap-0.5 h-3 ml-1">
                              <span className="w-0.5 h-2.5 bg-emerald-600 animate-pulse" />
                              <span className="w-0.5 h-3.5 bg-emerald-600 animate-pulse delay-75" />
                              <span className="w-0.5 h-2 bg-emerald-600 animate-pulse delay-150" />
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] font-medium flex items-center gap-1">
                          {m.isVoice && <Mic size={10} className="text-emerald-300" />}
                          Farmer Query
                        </span>
                      )}

                      {/* Right: Timestamp */}
                      <div className="flex items-center gap-1 text-[10px]">
                        <Clock size={10} />
                        <span>{m.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Live Interim Transcript Bubble while speaking */}
            {isListening && interimTranscript && (
              <div className="flex items-start gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 text-xs font-bold animate-pulse">
                  <Mic size={15} />
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-tr-none p-3.5 text-xs bg-amber-50 text-amber-950 border border-amber-300 italic shadow-sm">
                  <span className="font-semibold text-amber-800 not-italic block mb-0.5 text-[10px] uppercase tracking-wide">
                    Live Speech Capture:
                  </span>
                  &ldquo;{interimTranscript}&rdquo;
                </div>
              </div>
            )}

            {/* Thinking Spinner */}
            {busy && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 border border-emerald-200">
                  <Bot size={15} />
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-2xl rounded-tl-none p-3.5 text-xs text-stone-600 flex items-center gap-2">
                  <Sparkles className="animate-spin text-emerald-700" size={14} />
                  <span>AGRiNEX AI is reasoning over live telemetry & APMC prices...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Integrated Input & Speech Bar */}
          <div className="p-3 sm:p-4 border-t border-stone-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2"
            >
              {/* Quick Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition shadow-2xs shrink-0 cursor-pointer ${
                  isListening
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-800 border border-stone-200"
                }`}
                title={isListening ? "Stop listening" : "Tap to speak question"}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              {/* Text Input */}
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask or speak about crops, soil, live weather, irrigation, or market prices..."
                className="flex-1 rounded-xl h-11 text-sm bg-stone-50 border-stone-300 focus:bg-white"
                disabled={busy || isListening}
              />

              {/* Send Button */}
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
      </div>

    </Layout>
  );
}
