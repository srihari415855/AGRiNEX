"use client";
import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, X, Bot, User, Volume2, Square, Sparkles, HelpCircle } from "lucide-react";
import { api } from "@/lib/api";
import { speakText, stopAllPlayback, startSpeechRecognition, isSpeechRecognitionSupported } from "@/lib/voice";
import { useApp } from "@/lib/AppContext";
import { t } from "@/lib/i18n";
import { toast } from "sonner";

type Message = {
  role: "user" | "bot";
  content: string;
  time?: string;
};

export default function AskAgrinex() {
  const { lang, activeFarm, farms } = useApp();
  const currentFarm = farms?.find((f) => f.id === activeFarm);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content:
        lang === "hi"
          ? "नमस्ते! मैं आपकी एग्रीनेक्स कृषि सहायक हूँ। मुझसे अपने खेत, मौसम, सिंचाई या मंडी भाव के बारे में पूछें।"
          : lang === "kn"
          ? "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಅಗ್ರಿನೆಕ್ಸ್ ಕೃಷಿ ಸಂಗಾತಿ. ನಿಮ್ಮ ಜಮೀನು, ಹವಾಮಾನ ಅಥವಾ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಯ ಬಗ್ಗೆ ಕೇಳಿ."
          : "Hello! I'm AGRiNEX, your farm companion. Ask me anything about your crops, live soil moisture, or mandi prices.",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<{ stop: () => void; abort: () => void } | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    return () => {
      stopAllPlayback();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    stopSpeaking();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg = textToSend.trim();
    setInput("");
    const userTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setMessages((prev) => [...prev, { role: "user", content: userMsg, time: userTime }]);
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        text: m.content,
      }));

      const res = await api.post("/ask", {
        message: userMsg,
        language: lang,
        farm_id: activeFarm || "demo-farm",
        voice_mode: false,
        history: historyPayload,
      });

      if (res.data?.reply) {
        const botReply = res.data.reply;
        const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setMessages((prev) => [...prev, { role: "bot", content: botReply, time: botTime }]);

        // Auto read out reply
        setTimeout(() => {
          setIsSpeaking(true);
          speakText({
            text: botReply,
            language: lang,
            onStart: () => setIsSpeaking(true),
            onEnd: () => setIsSpeaking(false),
            onError: () => setIsSpeaking(false),
          });
        }, 150);
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not reach AGRiNEX AI agent");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    stopSpeaking();

    if (!isSpeechRecognitionSupported()) {
      toast.error("Speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    setIsListening(true);
    const rec = startSpeechRecognition({
      lang,
      onInterim: (interim) => {
        setInput(interim);
      },
      onFinal: (finalText) => {
        setIsListening(false);
        if (finalText.trim()) {
          handleSend(finalText.trim());
        }
      },
      onError: () => {
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
    recognitionRef.current = rec;
  };

  const stopSpeaking = () => {
    stopAllPlayback();
    setIsSpeaking(false);
  };

  const quickPrompts = [
    { label: "Farm Condition", q: "How is my farm doing right now?" },
    { label: "Irrigation Check", q: "Does any zone need smart irrigation today?" },
    { label: "Mandi Rates", q: "What is today's modal market price for tomato?" },
    { label: "Weather Check", q: "What is the live weather and rain probability?" },
  ];

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-emerald-600 via-emerald-700 to-teal-800 text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50 border-2 border-white/50 cursor-pointer group"
          title="Ask AGRiNEX AI Farm Assistant"
        >
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white" />
          <Bot className="w-7 h-7 sm:w-8 sm:h-8 group-hover:rotate-6 transition-transform" />
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-4 sm:right-6 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 z-50 flex flex-col h-[520px] transition-all animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 text-white flex justify-between items-center border-b border-emerald-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>AGRiNEX AI Agent</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] text-emerald-200/80 font-medium">
                  {currentFarm?.name || "Namfarm"} &bull; Real Telemetry Connected
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs flex items-center gap-1 transition"
                  title="Stop voice"
                >
                  <Square size={12} />
                </button>
              )}
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="hover:bg-white/20 p-1.5 rounded-lg text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-stone-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                    msg.role === "user"
                      ? "bg-emerald-700 text-white rounded-tr-none"
                      : "bg-white text-stone-900 border border-stone-200 rounded-tl-none"
                  }`}
                >
                  {msg.role === "bot" && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                      <Sparkles size={11} />
                      <span>Farm Assistant</span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  {msg.time && (
                    <div
                      className={`text-[9px] mt-1 text-right ${
                        msg.role === "user" ? "text-emerald-200" : "text-stone-400"
                      }`}
                    >
                      {msg.time}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-2xs border border-stone-200 flex items-center gap-2 text-xs text-stone-600">
                  <Sparkles size={14} className="text-emerald-600 animate-spin" />
                  <span>Checking farm records and weather...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-1.5 bg-stone-100 border-t border-stone-200 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.q)}
                disabled={isLoading}
                className="whitespace-nowrap text-[10px] font-semibold bg-white hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-300 border border-stone-200 text-stone-700 px-2.5 py-1 rounded-full transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 bg-white border-t border-stone-200">
            <div className="flex items-center gap-2 bg-stone-100 rounded-2xl p-1 pr-1.5 border border-stone-200 focus-within:border-emerald-500 focus-within:bg-white transition-all">
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition shadow-2xs cursor-pointer ${
                  isListening
                    ? "bg-rose-600 text-white animate-pulse"
                    : "bg-white text-stone-700 hover:text-emerald-700 hover:bg-emerald-50 border border-stone-200"
                }`}
                title={isListening ? "Stop listening" : "Tap to speak question"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                className="flex-1 bg-transparent outline-none px-2 text-xs sm:text-sm text-stone-800 placeholder:text-stone-400"
                placeholder={isListening ? "Listening... Speak naturally" : "Ask about crops, soil, water, prices..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
              />

              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs hover:bg-emerald-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
