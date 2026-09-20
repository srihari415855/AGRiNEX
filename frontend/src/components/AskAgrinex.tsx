"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, Send, X, Bot, User } from "lucide-react";

type Message = {
  role: "user" | "bot";
  content: string;
};

export default function AskAgrinex({ token }: { token: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hi! I'm AGRiNEX Assistant. Tap the mic to speak or type a question about your farm." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMsg })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "bot", content: data.reply }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateVoice = () => {
    const questions = [
      "When should I irrigate my tomatoes?",
      "What is the market price of tomato right now?",
      "Will it rain tomorrow?"
    ];
    setInput(questions[Math.floor(Math.random() * questions.length)]);
  };

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 text-white"
        >
          <Bot className="w-8 h-8" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 z-50 flex flex-col h-[500px]">
          <div className="p-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              <h3 className="font-bold text-lg">Ask AGRiNEX</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl flex items-start gap-2 ${msg.role === "user" ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm"}`}>
                  {msg.role === "bot" && <Bot className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1 pr-2">
              <button 
                onClick={handleSimulateVoice}
                className="w-10 h-10 rounded-full bg-white text-gray-500 flex items-center justify-center shadow-sm hover:text-emerald-600 transition-colors"
                title="Simulate Voice"
              >
                <Mic className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                className="flex-1 bg-transparent outline-none px-2 text-sm text-gray-700"
                placeholder="Type or tap mic..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
