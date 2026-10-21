"use client";

import { useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
  Info,
  Pill,
  Plus,
  Trash2,
  RefreshCw,
  Stethoscope,
  BookOpen,
} from "lucide-react";
import { ApiClient } from "@/lib/api";

interface InteractionDetail {
  drugPair: string;
  severity: "MINOR" | "MODERATE" | "MAJOR" | "CONTRAINDICATED";
  mechanism: string;
  clinicalEffect: string;
  recommendation: string;
}

interface InteractionResult {
  hasInteractions: boolean;
  severityLevel: "NONE" | "MINOR" | "MODERATE" | "MAJOR" | "CONTRAINDICATED";
  summary: string;
  details: InteractionDetail[];
  allergyWarnings: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function AiAssistantPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "interaction">("chat");

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Halo! Saya adalah **AI Asisten Farmasi Apotek Digital** yang didukung oleh Google Gemini 3.8 Flash. Saya siap membantu Anda menganalisis dosis obat, interaksi klinis, signa aturan pakai, hingga regulasi kefarmasian BPOM & Kemenkes.",
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Interaction Checker State
  const [drugList, setDrugList] = useState<string[]>(["Aspirin", "Warfarin"]);
  const [currentDrugInput, setCurrentDrugInput] = useState("");
  const [patientAllergies, setPatientAllergies] = useState("");
  const [interactionResult, setInteractionResult] = useState<InteractionResult | null>(null);
  const [checkingInteraction, setCheckingInteraction] = useState(false);

  const quickPrompts = [
    "Dosis lazim & efek samping Captopril untuk hipertensi",
    "Aturan minum antibiotik Amoxicillin sesudah makan",
    "Perbedaan sediaan Paracetamol sirup vs drops untuk anak",
    "Regulasi penyimpanan obat Golongan Prekursor & OOT di apotek",
  ];

  // Send Chat Message
  const handleSendChat = async (questionToSend?: string) => {
    const q = (questionToSend || inputQuestion).trim();
    if (!q || chatLoading) return;

    const userTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: q, timestamp: userTime }];
    setMessages(newMessages);
    setInputQuestion("");
    setChatLoading(true);

    try {
      const res: any = await ApiClient.post("/ai/ask", { question: q });
      if (res.success) {
        const botTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.data.answer, timestamp: botTime },
        ]);
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      const errorTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Terjadi kesalahan: ${err.message || "Gagal menghubungi AI. Pastikan Gemini API Key aktif."}`,
          timestamp: errorTime,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Add Drug to list
  const handleAddDrug = () => {
    if (!currentDrugInput.trim()) return;
    if (!drugList.includes(currentDrugInput.trim())) {
      setDrugList([...drugList, currentDrugInput.trim()]);
    }
    setCurrentDrugInput("");
  };

  // Remove Drug from list
  const handleRemoveDrug = (index: number) => {
    setDrugList(drugList.filter((_, idx) => idx !== index));
  };

  // Run Drug Interaction Check
  const handleCheckInteraction = async () => {
    if (drugList.length < 2) {
      alert("Masukkan minimal 2 nama obat untuk memeriksa potensi interaksi.");
      return;
    }

    try {
      setCheckingInteraction(true);
      setInteractionResult(null);
      const res: any = await ApiClient.post("/ai/check-interaction", {
        drugNames: drugList,
        patientAllergies: patientAllergies.trim() || undefined,
      });

      if (res.success) {
        setInteractionResult(res.data);
      } else {
        alert(res.message || "Gagal memeriksa interaksi");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat memproses interaksi");
    } finally {
      setCheckingInteraction(false);
    }
  };

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case "CONTRAINDICATED":
        return {
          bg: "bg-red-900 text-white border-red-950",
          icon: <ShieldAlert className="h-4 w-4" />,
          label: "KONTRAINDIKASI MUTLAK",
        };
      case "MAJOR":
        return {
          bg: "bg-red-600 text-white border-red-700",
          icon: <AlertTriangle className="h-4 w-4" />,
          label: "INTERAKSI BERAT (MAJOR)",
        };
      case "MODERATE":
        return {
          bg: "bg-amber-500 text-white border-amber-600",
          icon: <AlertCircle className="h-4 w-4" />,
          label: "INTERAKSI SEDANG (MODERATE)",
        };
      case "MINOR":
        return {
          bg: "bg-blue-600 text-white border-blue-700",
          icon: <Info className="h-4 w-4" />,
          label: "INTERAKSI RINGAN (MINOR)",
        };
      default:
        return {
          bg: "bg-emerald-600 text-white border-emerald-700",
          icon: <CheckCircle className="h-4 w-4" />,
          label: "TIDAK ADA INTERAKSI BERBAHAYA",
        };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container shadow-inner">
              <Bot className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-on-surface">AI Assistant & Clinical Checker</h1>
            <span className="text-[10px] font-bold bg-primary-container/10 text-primary-container border border-primary-container/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 max-w-xl">
            Konsultasi farmakologi cerdas, telaah resep evidence-based, dan skrining interaksi obat multi-regimen otomatis untuk Apoteker.
          </p>
        </div>

        {/* Tab Toggle Buttons */}
        <div className="flex p-1 bg-surface-container-low border border-outline-variant/30 rounded-xl">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "chat"
                ? "bg-primary-container text-white shadow"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Bot className="h-4 w-4" />
            Tanya AI Farmasi
          </button>
          <button
            onClick={() => setActiveTab("interaction")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "interaction"
                ? "bg-primary-container text-white shadow"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Stethoscope className="h-4 w-4" />
            Cek Interaksi Obat
          </button>
        </div>
      </div>

      {/* TAB 1: CHAT ASISTEN FARMASI */}
      {activeTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Prompts Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 text-xs font-bold text-on-surface mb-3">
                <BookOpen className="h-4 w-4 text-primary-container" />
                Contoh Topik Klinis
              </div>
              <div className="space-y-2">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendChat(prompt)}
                    className="w-full text-left p-2.5 rounded-xl border border-outline-variant/20 hover:border-primary-container hover:bg-surface-container-low text-on-surface text-xs transition"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Disclaimer Klinis
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                AI Asisten Farmasi dirancang sebagai referensi pendukung telaah klinis. Keputusan peracikan dan penyerahan obat tetap berada di bawah wewenang Apoteker Penanggung Jawab (SIPA aktif).
              </p>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-3 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col h-[650px] overflow-hidden">
            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    m.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      m.role === "user"
                        ? "bg-primary-container text-white shadow"
                        : "bg-surface-container-low text-primary-container border border-outline-variant/30"
                    }`}
                  >
                    {m.role === "user" ? "Anda" : <Bot className="h-4 w-4" />}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary-container text-white rounded-tr-none shadow-sm"
                        : "bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-tl-none whitespace-pre-wrap"
                    }`}
                  >
                    {m.content}
                    <div
                      className={`text-[10px] mt-1.5 text-right ${
                        m.role === "user" ? "text-blue-200" : "text-on-surface-variant"
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-surface-container-low text-primary-container flex items-center justify-center flex-shrink-0 border border-outline-variant/30">
                    <Bot className="h-4 w-4 animate-bounce" />
                  </div>
                  <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl px-4 py-3 text-xs text-on-surface-variant rounded-tl-none flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary-container" />
                    <span>Gemini AI sedang menelaah farmakologi obat...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-surface-container-low/60 border-t border-outline-variant/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Tanyakan obat, dosis lazim, interaksi, atau regulasi BPOM..."
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  disabled={chatLoading}
                  className="flex-1 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputQuestion.trim() || chatLoading}
                  className="px-5 py-2.5 bg-primary-container hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition"
                >
                  <Send className="h-4 w-4" />
                  Kirim
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CEK INTERAKSI OBAT CERDAS */}
      {activeTab === "interaction" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] space-y-4">
              <div>
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <Pill className="h-4 w-4 text-primary-container" />
                  Daftar Obat dalam Resep / Regimen
                </h3>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Tambahkan minimal 2 nama obat untuk ditelaah interaksinya.
                </p>
              </div>

              {/* Add Drug Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik nama obat (cth: Ciprofloxacin)..."
                  value={currentDrugInput}
                  onChange={(e) => setCurrentDrugInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDrug();
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddDrug}
                  className="px-3 py-2 bg-primary-container hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Tambah
                </button>
              </div>

              {/* Drug Tags List */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-semibold text-on-surface-variant block">
                  Obat Terpilih ({drugList.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {drugList.map((drug, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs font-medium"
                    >
                      <Pill className="h-3 w-3 text-primary-container" />
                      <span>{drug}</span>
                      <button
                        onClick={() => handleRemoveDrug(index)}
                        className="p-0.5 hover:bg-surface-container text-on-surface-variant rounded-full transition"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient Allergies Optional */}
              <div className="pt-2 border-t border-outline-variant/20">
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Riwayat Alergi Pasien (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Alergi Golongan Penisilin, Sulfa"
                  value={patientAllergies}
                  onChange={(e) => setPatientAllergies(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleCheckInteraction}
                disabled={checkingInteraction || drugList.length < 2}
                className="w-full py-3 bg-primary-container hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {checkingInteraction ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Menganalisis Interaksi dengan Gemini AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analisis Interaksi Obat Sekarang
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7">
            {checkingInteraction ? (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 text-center shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                <RefreshCw className="h-10 w-10 text-primary-container animate-spin mx-auto mb-3" />
                <h4 className="text-sm font-bold text-on-surface">Menelaah Farmakokinetik & Farmakodinamik</h4>
                <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
                  Gemini AI sedang memeriksa potensi ikatan CYP450, absorpsi, dan sinergisme/antagonisme klinis...
                </p>
              </div>
            ) : interactionResult ? (
              <div className="space-y-4">
                {/* Result Header Badge */}
                {(() => {
                  const badge = getSeverityBadge(interactionResult.severityLevel);
                  return (
                    <div
                      className={`p-5 rounded-2xl border flex items-start gap-4 shadow-sm ${badge.bg}`}
                    >
                      <div className="p-2 bg-white/20 rounded-xl">{badge.icon}</div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                          Tingkat Keparahan Interaksi
                        </div>
                        <h3 className="text-base font-extrabold mt-0.5">{badge.label}</h3>
                        <p className="text-xs mt-1 opacity-90 leading-relaxed">
                          {interactionResult.summary}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Allergy Warnings */}
                {interactionResult.allergyWarnings && interactionResult.allergyWarnings.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-red-900 uppercase">
                        Peringatan Kontraindikasi Alergi Pasien
                      </h4>
                      <ul className="list-disc list-inside text-xs text-red-800 mt-1 space-y-0.5">
                        {interactionResult.allergyWarnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Detailed Pairs */}
                {interactionResult.details && interactionResult.details.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      Detail Interaksi Per Pasangan Obat ({interactionResult.details.length})
                    </h4>

                    {interactionResult.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 space-y-3 shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
                      >
                        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                          <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                            <Pill className="h-4 w-4 text-primary-container" />
                            {detail.drugPair}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${
                              detail.severity === "MAJOR"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : detail.severity === "MODERATE"
                                ? "bg-amber-50 text-amber-800 border border-amber-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {detail.severity}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
                              Mekanisme Farmakologi:
                            </span>
                            <p className="text-on-surface mt-0.5">{detail.mechanism}</p>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase block">
                              Dampak Klinis pada Pasien:
                            </span>
                            <p className="text-on-surface mt-0.5">{detail.clinicalEffect}</p>
                          </div>

                          <div className="bg-emerald-50/70 border border-emerald-200/60 p-3 rounded-xl text-emerald-900">
                            <span className="text-[10px] font-bold uppercase tracking-wide block">
                              💡 Saran & Rekomendasi Apoteker:
                            </span>
                            <p className="text-xs font-medium mt-0.5">{detail.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 text-center text-on-surface-variant shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                <Stethoscope className="h-12 w-12 mx-auto text-outline-variant mb-3" />
                <h4 className="text-sm font-bold text-on-surface">Belum Ada Analisis</h4>
                <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
                  Pilih obat di panel sebelah kiri lalu klik "Analisis Interaksi Obat Sekarang" untuk mendapatkan laporan telaah klinis terstruktur.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
