/* app/page.tsx */
"use client";

import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import Image from "next/image";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

// SweetAlert2
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
 
type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sidebar state
  const [activeMenu, setActiveMenu] = useState<"chat" | "berkas" | "settings">("chat");

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
    } catch {
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

  // Sample data for Berkas
  const sampleFiles = [
    { nama: "Laporan 1.pdf", tanggal: "2025-05-18", ukuran: "1.2 MB" },
    { nama: "Laporan 2.docx", tanggal: "2025-05-17", ukuran: "800 KB" },
    { nama: "Laporan 3.xlsx", tanggal: "2025-05-16", ukuran: "2.1 MB" },
  ];

  return (
    <>
      <title>Ringkasan Harian Komdigi</title>
      <div className="min-h-screen bg-gradient-to-br from-[#005EA4] via-[#369DEE] to-white flex flex-row items-stretch justify-center p-0">
        {/* Sidebar */}
        <aside className="w-56 bg-white/90 border-r border-[#369DEE] flex flex-col py-8 px-4 shadow-lg z-10">
          <div className="flex items-center gap-3 mb-10 px-2">
            <Image src="/komdigi.png" alt="Komdigi Logo" height={40} width={40} className="h-10 w-auto" />
            <span className="text-lg font-bold text-[#005EA4]">Komdigi</span>
          </div>
          <nav className="flex flex-col gap-2">
            <button
              className={`text-left px-4 py-2 rounded-lg font-medium transition ${
                activeMenu === "chat"
                  ? "bg-[#369DEE] text-white shadow"
                  : "text-[#005EA4] hover:bg-[#E6F0FA]"
              }`}
              onClick={() => setActiveMenu("chat")}
            >
              Chat
            </button>
            <button
              className={`text-left px-4 py-2 rounded-lg font-medium transition ${
                activeMenu === "berkas"
                  ? "bg-[#369DEE] text-white shadow"
                  : "text-[#005EA4] hover:bg-[#E6F0FA]"
              }`}
              onClick={() => setActiveMenu("berkas")}
            >
              Berkas
            </button>
            <button
              className={`text-left px-4 py-2 rounded-lg font-medium transition ${
                activeMenu === "settings"
                  ? "bg-[#369DEE] text-white shadow"
                  : "text-[#005EA4] hover:bg-[#E6F0FA]"
              }`}
              onClick={() => setActiveMenu("settings")}
            >
              Settings
            </button>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-0">
          {activeMenu === "chat" && (
            <div className="w-[90vw] max-w-4xl bg-white rounded-xl shadow-lg flex flex-col h-[90vh] ml-0">
              {/* Logo & App Name */}
              <div className="flex items-center gap-3 px-6 pt-6 pb-2">
                <Image src="/komdigi.png" alt="Komdigi Logo" height={40} width={40} className="h-10 w-auto" />
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
                        <>
                          <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                            {msg.content}
                          </ReactMarkdown>
                          <div className="flex gap-3 mt-2 text-lg opacity-80" aria-label="Forward options">
                            <button
                              type="button"
                              title="Forward to Email"
                              aria-label="Email"
                              className="text-[#369DEE] hover:text-[#005EA4] transition-colors"
                              onClick={() => {
                                const MySwal = withReactContent(Swal);
                                MySwal.fire({
                                  title: undefined,
                                  text: undefined,
                                  html: `<div class="swal2-html-container swal2-custom-mini"><span style="margin-right:8px;"><svg width="20" height="20" fill="#369DEE" viewBox="0 0 24 24"><path d="M12 22c5.421 0 10-4.579 10-10s-4.579-10-10-10-10 4.579-10 10 4.579 10 10 10zm0-18c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8zm-1 13h2v-2h-2v2zm0-4h2v-6h-2v6z"/></svg></span><span>Konten akan dikirim ke email.</span></div>`,
                                  showConfirmButton: false,
                                  timer: 1400,
                                  customClass: {
                                    popup: "swal2-custom-mini",
                                    icon: "swal2-custom-mini",
                                    htmlContainer: "swal2-custom-mini"
                                  }
                                });
                              }}
                            >
                              <FontAwesomeIcon icon={faEnvelope} />
                            </button>
                            <button
                              type="button"
                              title="Forward to WhatsApp"
                              aria-label="WhatsApp"
                              className="text-[#369DEE] hover:text-[#005EA4] transition-colors"
                              onClick={() => {
                                const MySwal = withReactContent(Swal);
                                MySwal.fire({
                                  title: undefined,
                                  text: undefined,
                                  html: `<div class="swal2-html-container swal2-custom-mini"><span style="margin-right:8px;"><svg width="20" height="20" fill="#369DEE" viewBox="0 0 24 24"><path d="M12 22c5.421 0 10-4.579 10-10s-4.579-10-10-10-10 4.579-10 10 4.579 10 10 10zm0-18c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8zm-1 13h2v-2h-2v2zm0-4h2v-6h-2v6z"/></svg></span><span>Konten akan diteruskan ke WhatsApp.</span></div>`,
                                  showConfirmButton: false,
                                  timer: 1400,
                                  customClass: {
                                    popup: "swal2-custom-mini",
                                    icon: "swal2-custom-mini",
                                    htmlContainer: "swal2-custom-mini"
                                  }
                                });
                              }}
                            >
                              <FontAwesomeIcon icon={faWhatsapp} />
                            </button>
                            <button
                              type="button"
                              title="Export as PDF"
                              aria-label="PDF"
                              className="text-[#369DEE] hover:text-[#005EA4] transition-colors"
                              onClick={() => {
                                const MySwal = withReactContent(Swal);
                                MySwal.fire({
                                  title: undefined,
                                  text: undefined,
                                  html: `<div class="swal2-html-container swal2-custom-mini"><span style="margin-right:8px;"><svg width="20" height="20" fill="#369DEE" viewBox="0 0 24 24"><path d="M12 22c5.421 0 10-4.579 10-10s-4.579-10-10-10-10 4.579-10 10 4.579 10 10 10zm0-18c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8zm-1 13h2v-2h-2v2zm0-4h2v-6h-2v6z"/></svg></span><span>Konten akan diekspor dalam format PDF.</span></div>`,
                                  showConfirmButton: false,
                                  timer: 1400,
                                  customClass: {
                                    popup: "swal2-custom-mini",
                                    icon: "swal2-custom-mini",
                                    htmlContainer: "swal2-custom-mini"
                                  }
                                });
                              }}
                            >
                              <FontAwesomeIcon icon={faFilePdf} />
                            </button>
                          </div>
                        </>
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
          )}
          {activeMenu === "berkas" && (
            <div className="w-[90vw] max-w-4xl bg-white rounded-xl shadow-lg flex flex-col h-[90vh] ml-0 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[#005EA4]">Berkas Laporan</h2>
                <button
                  className="bg-[#369DEE] hover:bg-[#005EA4] text-white rounded-lg px-4 py-2 font-medium shadow transition"
                  onClick={() => {
                    const MySwal = withReactContent(Swal);
                    MySwal.fire({
                      title: undefined,
                      text: undefined,
                      html: `<div class="swal2-html-container swal2-custom-mini"><span style="margin-right:8px;"><svg width="20" height="20" fill="#369DEE" viewBox="0 0 24 24"><path d="M12 22c5.421 0 10-4.579 10-10s-4.579-10-10-10-10 4.579-10 10 4.579 10 10 10zm0-18c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8zm-1 13h2v-2h-2v2zm0-4h2v-6h-2v6z"/></svg></span><span>Unggah laporan di sini.</span></div>`,
                      showConfirmButton: false,
                      timer: 1400,
                      customClass: {
                        popup: "swal2-custom-mini",
                        icon: "swal2-custom-mini",
                        htmlContainer: "swal2-custom-mini"
                      }
                    });
                  }}
                >
                  + Unggah Laporan
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-[#369DEE] rounded-lg">
                  <thead>
                    <tr className="bg-[#E6F0FA] text-[#005EA4]">
                      <th className="px-4 py-2 text-left">Nama</th>
                      <th className="px-4 py-2 text-left">Tanggal Upload</th>
                      <th className="px-4 py-2 text-left">Ukuran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleFiles.map((file, idx) => (
                      <tr key={idx} className="border-t border-[#E6F0FA]">
                        <td className="px-4 py-2">{file.nama}</td>
                        <td className="px-4 py-2">{file.tanggal}</td>
                        <td className="px-4 py-2">{file.ukuran}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeMenu === "settings" && (
            <div className="w-[90vw] max-w-2xl bg-white rounded-xl shadow-lg flex flex-col h-[90vh] ml-0 p-8">
              <h2 className="text-xl font-bold text-[#005EA4] mb-6">Opsi Penerusan Laporan</h2>
              <form className="flex flex-col gap-6">
                <div>
                  <label className="block font-medium text-[#005EA4] mb-1">Email</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-[#369DEE] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#005EA4]"
                    placeholder="Masukkan email"
                  />
                  <p className="text-xs text-slate-500 mt-1">Untuk email lebih dari satu, pisahkan dengan koma</p>
                </div>
                <div>
                  <label className="block font-medium text-[#005EA4] mb-1">WhatsApp</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-[#369DEE] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#005EA4]"
                    placeholder="Masukkan nomor WhatsApp"
                  />
                  <p className="text-xs text-slate-500 mt-1">Untuk nomor lebih dari satu, pisahkan dengan koma</p>
                </div>
              </form>
              <div className="flex flex-1 items-end justify-end">
                <button
                  className="bg-[#369DEE] hover:bg-[#005EA4] text-white rounded-lg px-6 py-2 font-medium shadow transition mt-8"
                  onClick={() => {
                    const MySwal = withReactContent(Swal);
                    MySwal.fire({
                      title: undefined,
                      text: undefined,
                      html: `<div class="swal2-html-container swal2-custom-mini"><span style="margin-right:8px;"><svg width="20" height="20" fill="#369DEE" viewBox="0 0 24 24"><path d="M12 22c5.421 0 10-4.579 10-10s-4.579-10-10-10-10 4.579-10 10 4.579 10 10 10zm0-18c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8zm-1 13h2v-2h-2v2zm0-4h2v-6h-2v6z"/></svg></span><span>Setelan penerusan akan disimpan.</span></div>`,
                      showConfirmButton: false,
                      timer: 1400,
                      customClass: {
                        popup: "swal2-custom-mini",
                        icon: "swal2-custom-mini",
                        htmlContainer: "swal2-custom-mini"
                      }
                    });
                  }}
                  type="button"
                >
                  Simpan Setelan Penerusan
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
