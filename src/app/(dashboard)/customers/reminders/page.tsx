"use client";

import { useState, useEffect } from "react";
import {
  BellRing,
  Plus,
  Search,
  Calendar,
  Phone,
  Send,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  Pill,
  Users,
  Check,
} from "lucide-react";
import { ApiClient } from "@/lib/api";

interface ReminderItem {
  id: string;
  customerName: string;
  customerPhone: string;
  drugName: string;
  signa: string | null;
  lastDispenseDate: string;
  estimatedFinishDate: string;
  reminderDate: string;
  status: "PENDING" | "SENT" | "DISMISSED";
  sentAt: string | null;
  notes: string | null;
  createdAt: string;
}

export default function ChronicRemindersPage() {
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "sent">("upcoming");
  const [search, setSearch] = useState("");

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    drugName: "",
    signa: "1 x 1 tablet sehari sesudah makan",
    lastDispenseDate: new Date().toISOString().split("T")[0],
    daysSupply: 30,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res: any = await ApiClient.get(`/reminders?filter=${filter}`);
      if (res.success) {
        setReminders(res.data);
      }
    } catch (err: any) {
      console.error("Gagal memuat pengingat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [filter]);

  const handleSendReminder = async (id: string) => {
    try {
      const res: any = await ApiClient.post(`/reminders/${id}/send`, {});
      if (res.success && res.data?.waLink) {
        window.open(res.data.waLink, "_blank");
        fetchReminders();
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengirim pengingat");
    }
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.customerPhone || !formData.drugName) return;

    try {
      setSubmitting(true);
      const res: any = await ApiClient.post("/reminders", formData);
      if (res.success) {
        alert(res.message || "Jadwal pengingat berhasil dibuat!");
        setIsModalOpen(false);
        fetchReminders();
      }
    } catch (err: any) {
      alert(err.message || "Gagal membuat pengingat");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = reminders.filter(
    (r) =>
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.drugName.toLowerCase().includes(search.toLowerCase()) ||
      r.customerPhone.includes(search)
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="h-6 w-6 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-800">Pengingat Obat Rutin Pasien (H-3)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Layanan farmasi proaktif via WhatsApp: Kirim pengingat jadwal kontrol & perpanjangan resep obat kronis
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-purple-600/30 transition"
        >
          <Plus className="h-4 w-4" />
          Jadwalkan Pengingat Baru
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pasien atau nama obat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === "upcoming" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Perlu Kirim (H-3)
            </button>
            <button
              onClick={() => setFilter("sent")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === "sent" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Sudah Terkirim
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Semua
            </button>
          </div>

          <button
            onClick={fetchReminders}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Reminders List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-600 mb-2" />
            <p className="text-xs">Memuat jadwal pengingat...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <BellRing className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Tidak Ada Antrean Pengingat</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Jadwalkan pengingat obat rutin untuk pasien hipertensi, diabetes, jantung, dll. agar tidak terputus terapi.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Nama Pasien</th>
                  <th className="px-4 py-3">No. WhatsApp</th>
                  <th className="px-4 py-3">Obat Rutin</th>
                  <th className="px-4 py-3">Aturan Pakai</th>
                  <th className="px-4 py-3 text-center">Estimasi Habis</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Aksi WhatsApp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-bold text-slate-800 flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[11px]">
                        {r.customerName.slice(0, 2).toUpperCase()}
                      </div>
                      <span>{r.customerName}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono">
                      {r.customerPhone}
                    </td>
                    <td className="px-4 py-3 font-semibold text-purple-950">
                      {r.drugName}
                    </td>
                    <td className="px-4 py-3 text-slate-500 italic">
                      {r.signa || "-"}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-red-600">
                      {new Date(r.estimatedFinishDate).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.status === "SENT"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {r.status === "SENT" ? "Terkirim" : "Siap Kirim"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleSendReminder(r.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                          r.status === "SENT"
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        <Send className="h-3 w-3" />
                        {r.status === "SENT" ? "Kirim Ulang" : "Kirim WA (H-3)"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Jadwal Pengingat */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-purple-800 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Jadwalkan Pengingat Obat Rutin</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-purple-200 hover:text-white rounded-lg hover:bg-purple-700/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Pasien <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Budi Santoso"
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="08123456789"
                    value={formData.customerPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, customerPhone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Obat Rutin / Terapi Kronis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Amlodipine 10mg / Metformin 500mg"
                  value={formData.drugName}
                  onChange={(e) => setFormData({ ...formData, drugName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Pengambilan Terakhir
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.lastDispenseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, lastDispenseDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Persediaan Untuk (Hari)
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.daysSupply}
                    onChange={(e) =>
                      setFormData({ ...formData, daysSupply: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Aturan Pakai / Signa
                </label>
                <input
                  type="text"
                  value={formData.signa}
                  onChange={(e) => setFormData({ ...formData, signa: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Jadwalkan Pengingat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
