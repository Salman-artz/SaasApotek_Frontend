"use client";

import { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Search,
  Calendar,
  Percent,
  DollarSign,
  Copy,
  Check,
  Edit2,
  Trash2,
  RefreshCw,
  X,
  Users,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { ApiClient } from "@/lib/api";

interface Promotion {
  id: string;
  code: string;
  name: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: string;
  minPurchase: string;
  maxDiscount: string | null;
  startDate: string;
  endDate: string;
  customerType: "ALL" | "MEMBER" | "RESEP";
  isActive: boolean;
  usageCount: number;
  maxUsage: number | null;
  createdAt: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active">("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    discountType: "PERCENT" as "PERCENT" | "FIXED",
    discountValue: 10,
    minPurchase: 0,
    maxDiscount: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    customerType: "ALL" as "ALL" | "MEMBER" | "RESEP",
    maxUsage: 0,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res: any = await ApiClient.get(
        `/promotions?search=${encodeURIComponent(search)}${filterActive === "active" ? "&active=true" : ""}`
      );
      if (res.success) {
        setPromotions(res.data);
      }
    } catch (err: any) {
      console.error("Gagal memuat promo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [search, filterActive]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setFormData({
      code: "",
      name: "",
      discountType: "PERCENT",
      discountValue: 10,
      minPurchase: 0,
      maxDiscount: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      customerType: "ALL",
      maxUsage: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Promotion) => {
    setEditingPromo(p);
    setFormData({
      code: p.code,
      name: p.name,
      discountType: p.discountType,
      discountValue: Number(p.discountValue),
      minPurchase: Number(p.minPurchase || 0),
      maxDiscount: p.maxDiscount ? Number(p.maxDiscount) : 0,
      startDate: p.startDate,
      endDate: p.endDate,
      customerType: p.customerType,
      maxUsage: p.maxUsage || 0,
      isActive: p.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSavePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    try {
      setSubmitting(true);
      const payload: any = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        maxDiscount: formData.maxDiscount > 0 ? formData.maxDiscount : undefined,
        maxUsage: formData.maxUsage > 0 ? formData.maxUsage : undefined,
      };

      if (editingPromo) {
        await ApiClient.put(`/promotions/${editingPromo.id}`, payload);
      } else {
        await ApiClient.post("/promotions", payload);
      }

      setIsModalOpen(false);
      fetchPromotions();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan promo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await ApiClient.delete(`/promotions/${deletingId}`);
      setDeletingId(null);
      fetchPromotions();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus promo");
    }
  };

  const isPromoExpired = (endDate: string) => {
    const today = new Date().toISOString().split("T")[0];
    return endDate < today;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="h-6 w-6 text-pink-600" />
            <h1 className="text-xl font-bold text-slate-800">Promo, Voucher & Multi-Harga</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola kode diskon kasir, program potongan harga member, dan promo resep berkala
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-xl shadow-sm shadow-pink-600/30 transition"
        >
          <Plus className="h-4 w-4" />
          Buat Promo Baru
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode promo atau nama..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setFilterActive("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterActive === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Semua ({promotions.length})
            </button>
            <button
              onClick={() => setFilterActive("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterActive === "active" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Hanya Aktif
            </button>
          </div>

          <button
            onClick={fetchPromotions}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Promo Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-pink-600 mb-2" />
          <p className="text-xs">Memuat data promo...</p>
        </div>
      ) : promotions.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <Tag className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Belum Ada Program Promo</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Buat kode diskon untuk meningkatkan omset dan loyalitas pelanggan apotek Anda.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-semibold shadow-sm"
          >
            Buat Promo Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {promotions.map((p) => {
            const expired = isPromoExpired(p.endDate);
            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border transition shadow-sm overflow-hidden flex flex-col justify-between ${
                  !p.isActive || expired
                    ? "border-slate-200 opacity-70 bg-slate-50/50"
                    : "border-pink-200 hover:border-pink-400 hover:shadow-md"
                }`}
              >
                <div>
                  {/* Card Top Banner */}
                  <div className="p-5 pb-3 border-b border-slate-100 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{p.name}</span>
                        {p.isActive && !expired ? (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase">
                            Aktif
                          </span>
                        ) : expired ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-extrabold rounded-full uppercase">
                            Kadaluarsa
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-extrabold rounded-full uppercase">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Target:{" "}
                        <strong className="text-slate-700">
                          {p.customerType === "ALL"
                            ? "Semua Pelanggan"
                            : p.customerType === "MEMBER"
                            ? "Khusus Member"
                            : "Khusus Resep Dokter"}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-blue-600 rounded-lg transition"
                        title="Edit Promo"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(p.id)}
                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                        title="Hapus"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Coupon Code Strip */}
                  <div className="p-4 bg-gradient-to-r from-pink-50 via-rose-50 to-purple-50 mx-4 my-3 rounded-xl border border-dashed border-pink-300 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-pink-600 uppercase tracking-wider block">
                        KODE VOUCHER KASIR
                      </span>
                      <span className="text-base font-black font-mono tracking-wider text-pink-950">
                        {p.code}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyCode(p.code)}
                      className="px-3 py-1.5 bg-white hover:bg-pink-100 border border-pink-200 rounded-lg text-xs font-semibold text-pink-700 flex items-center gap-1 shadow-sm transition"
                    >
                      {copiedCode === p.code ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          Salin
                        </>
                      )}
                    </button>
                  </div>

                  {/* Discount Details */}
                  <div className="px-5 py-2 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Besaran Diskon:</span>
                      <strong className="text-pink-700 font-mono text-sm">
                        {p.discountType === "PERCENT"
                          ? `${Number(p.discountValue)}%`
                          : `Rp ${Number(p.discountValue).toLocaleString("id-ID")}`}
                      </strong>
                    </div>

                    {Number(p.minPurchase) > 0 && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Minimal Belanja:</span>
                        <span className="font-mono font-medium text-slate-800">
                          Rp {Number(p.minPurchase).toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}

                    {p.maxDiscount && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span>Maksimal Potongan:</span>
                        <span className="font-mono font-medium text-slate-800">
                          Rp {Number(p.maxDiscount).toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                      <span>Masa Berlaku:</span>
                      <span className="font-mono text-slate-500">
                        s/d {new Date(p.endDate).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer usage status */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Digunakan: <strong>{p.usageCount}</strong>x
                    {p.maxUsage ? ` / maks ${p.maxUsage}` : ""}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Dibuat: {new Date(p.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Promo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">
                {editingPromo ? "Edit Program Promo" : "Buat Program Promo Baru"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePromotion} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Voucher <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MERDEKA10"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Program Promo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Diskon HUT Apotek"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipe Diskon
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e: any) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  >
                    <option value="PERCENT">Persentase (%)</option>
                    <option value="FIXED">Potongan Tetap (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nilai Diskon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder={formData.discountType === "PERCENT" ? "10 (%)" : "15000 (Rp)"}
                    value={formData.discountValue || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Min Purchase & Max Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minimal Belanja (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0 jika tanpa syarat"
                    value={formData.minPurchase || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, minPurchase: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Maksimal Potongan (Rp)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Opsional batas diskon %"
                    value={formData.maxDiscount || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Berakhir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Target & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipe Pelanggan
                  </label>
                  <select
                    value={formData.customerType}
                    onChange={(e: any) =>
                      setFormData({ ...formData, customerType: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  >
                    <option value="ALL">Semua Pelanggan (Umum)</option>
                    <option value="MEMBER">Khusus Member Terdaftar</option>
                    <option value="RESEP">Khusus Resep Dokter</option>
                  </select>
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="h-4 w-4 text-pink-600 rounded border-slate-300"
                    />
                    <span>Promo Langsung Aktif</span>
                  </label>
                </div>
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
                  className="px-5 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Promo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl text-center space-y-4">
            <Trash2 className="h-10 w-10 text-red-500 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Hapus Promo Ini?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Kode voucher ini tidak akan dapat digunakan lagi di kasir POS.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
