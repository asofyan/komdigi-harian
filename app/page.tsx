// app/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Always scroll to the last message when messages or loading change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendPrompt = async (prompt: string) => {
    if (!prompt.trim()) return;
    setLoading(true);
    setMessages((msgs) => [...msgs, { role: "user", content: prompt }]);
    setInput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: data.result || "No response." },
      ]);
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "Error contacting API." },
      ]);
    }
    setLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSend = () => sendPrompt(input);

  const handleHelper = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    sendPrompt(`ringkasan laporan ${today}`);
  };

  return (
    <>
      <title>Ringkasan Harian Komdigi</title>
      <div className="min-h-screen bg-gradient-to-br from-[#005EA4] via-[#369DEE] to-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg flex flex-col h-[90vh]">
          {/* Logo & App Name */}
          <div className="flex items-center gap-3 px-6 pt-6 pb-2">
            <img src="/komdigi.png" alt="Komdigi Logo" className="h-10 w-auto" />
            <span className="text-xl font-bold text-[#005EA4]">Laporan Medsos Harian</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-[#F7B801] text-center mt-10 opacity-70">Mulai chat...</div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${
                    msg.role === "user"
                      ? "bg-[#005EA4] text-white"
                      : "bg-slate-100 text-slate-700 border border-slate-300"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-2xl max-w-[80%] text-sm bg-[#F7B801] text-[#005EA4] flex items-center gap-2 border border-[#369DEE]">
                  <svg className="animate-spin h-4 w-4 text-[#C41E3A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>Menunggu balasan...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-full border border-[#369DEE] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#005EA4]"
                type="text"
                placeholder="Tulis pertanyaan..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) handleSend();
                }}
                disabled={loading}
              />
              <button
                className="bg-[#369DEE] hover:bg-[#005EA4] text-white rounded-full p-2 transition disabled:opacity-50"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                aria-label="Kirim"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex justify-center">
              <button
                className="mt-1 inline-flex bg-[#369DEE] text-white rounded-full py-2 px-4 text-sm font-medium opacity-90 hover:opacity-100 transition border border-[#369DEE]"
                onClick={handleHelper}
                disabled={loading}
                aria-label="Tampilkan laporan hari ini"
              >
                Tampilkan laporan hari ini
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
