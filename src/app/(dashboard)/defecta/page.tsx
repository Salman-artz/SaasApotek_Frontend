"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  Truck,
  Plus,
  Trash2,
  CheckCircle2,
  Search,
  Building2,
  X,
} from "lucide-react";
import { ApiClient } from "@/lib/api";

interface DefectaItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  baseUnit: string;
  supplierId: string | null;
  supplierName: string | null;
  currentStock: string;
  minStock: string;
  suggestedQty: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  status: string;
  notes: string | null;
  createdAt: string;
}

interface SupplierItem {
  id: string;
  name: string;
}

export default function DefectaPage() {
  const [items, setItems] = useState<DefectaItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");

  // Selection for SP generation
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSpModalOpen, setIsSpModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [orderType, setOrderType] = useState<"REGULER" | "PREKURSOR" | "OOT" | "PSIKOTROPIKA" | "NARKOTIKA">("REGULER");
  const [spNotes, setSpNotes] = useState("");
  const [generatingSp, setGeneratingSp] = useState(false);

  const fetchDefecta = async () => {
    try {
      setLoading(true);
      const res: any = await ApiClient.get("/defecta");
      if (res.success) {
        setItems(res.data);
      }
    } catch (err: any) {
      console.error("Gagal memuat defecta:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res: any = await ApiClient.get("/suppliers");
      if (res.success) {
        setSuppliers(res.data);
        if (res.data.length > 0) setSelectedSupplierId(res.data[0].id);
      }
    } catch (err) {
      console.error("Gagal memuat suppliers:", err);
    }
  };

  useEffect(() => {
    fetchDefecta();
    fetchSuppliers();
  }, []);

  const handleSyncDefecta = async () => {
    try {
      setSyncing(true);
      const res: any = await ApiClient.post("/defecta/sync", {});
      alert(res.message || "Penyusunan buku defecta selesai!");
      fetchDefecta();
    } catch (err: any) {
      alert(err.message || "Gagal menyusun defecta");
    } finally {
      setSyncing(false);
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const handleGenerateSp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0 || !selectedSupplierId) {
      alert("Pilih minimal 1 obat dan Supplier / PBF tujuan");
      return;
    }

    try {
      setGeneratingSp(true);
      const res: any = await ApiClient.post("/defecta/generate-sp", {
        defectaIds: selectedIds,
        supplierId: selectedSupplierId,
        orderType,
        notes: spNotes,
      });

      if (res.success) {
        alert(res.message || "Surat Pesanan berhasil dibuat!");
        setIsSpModalOpen(false);
        setSelectedIds([]);
        fetchDefecta();
      }
    } catch (err: any) {
      alert(err.message || "Gagal menerbitkan Surat Pesanan");
    } finally {
      setGeneratingSp(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await ApiClient.delete(`/defecta/${id}`);
      fetchDefecta();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus item");
    }
  };

  const filteredItems = items.filter(
    (i) =>
      i.productName.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-on-surface">Buku Defecta Pintar & Otomasi Order PBF</h1>
            <span className="text-[10px] font-bold bg-primary-container/10 text-primary-container border border-primary-container/20 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> AI Forecasting
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 max-w-xl">
            Deteksi otomatis obat habis / mendekati batas minimum stok dan generate Surat Pesanan (SP) resmi ke PBF dalam satu klik.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSyncDefecta}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-container hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Memindai Stok..." : "Scan & Sinkronkan Defecta"}
          </button>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant/60" />
          <input
            type="text"
            placeholder="Cari obat di buku defecta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-on-surface-variant">
            Terpilih: <strong className="text-on-surface">{selectedIds.length}</strong> obat
          </span>

          <button
            onClick={() => setIsSpModalOpen(true)}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-container hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Terbitkan Surat Pesanan (SP)
          </button>
        </div>
      </div>

      {/* Defecta Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-on-surface-variant">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary-container mb-2" />
            <p className="text-xs">Memuat daftar defecta...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-on-surface-variant">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-on-surface">Buku Defecta Bersih</h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
              Semua persediaan obat masih aman di atas batas minimum stok. Klik &quot;Scan & Sinkronkan Defecta&quot; untuk pemindaian ulang.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-on-surface">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold text-[11px] uppercase border-b border-outline-variant/20">
                <tr>
                  <th className="px-4 py-3 text-center w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredItems.length && filteredItems.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded text-primary-container"
                    />
                  </th>
                  <th className="px-4 py-3">Nama Obat</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3 text-center">Stok Saat Ini</th>
                  <th className="px-4 py-3 text-center">Batas Minimum</th>
                  <th className="px-4 py-3 text-center">Rekomendasi Order</th>
                  <th className="px-4 py-3 text-center">Prioritas</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-surface-container-low/40 transition ${
                        isSelected ? "bg-primary-container/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded text-primary-container"
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold text-on-surface">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant">
                        <span className="px-2 py-0.5 bg-surface-container-low rounded-lg text-[11px] border border-outline-variant/20">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold font-mono text-red-600">
                        {Number(item.currentStock)} {item.baseUnit}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-on-surface-variant">
                        {Number(item.minStock)} {item.baseUnit}
                      </td>
                      <td className="px-4 py-3 text-center font-bold font-mono text-emerald-700">
                        +{Number(item.suggestedQty)} {item.baseUnit}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.priority === "CRITICAL"
                              ? "bg-red-100 text-red-700 border border-red-200"
                              : item.priority === "HIGH"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-blue-100 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 hover:bg-red-50 text-on-surface-variant hover:text-red-600 rounded-lg transition"
                          title="Hapus dari Defecta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Terbitkan Surat Pesanan (SP) */}
      {isSpModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                <h3 className="text-sm font-bold">Terbitkan Surat Pesanan (SP) Resmi</h3>
              </div>
              <button
                onClick={() => setIsSpModalOpen(false)}
                className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateSp} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <span className="font-semibold text-slate-600 block">Obat Terpilih:</span>
                <span className="font-bold text-emerald-700 block">
                  {selectedIds.length} item obat dari buku defecta
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Supplier / Pedagang Besar Farmasi (PBF) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Format Surat Pesanan BPOM
                </label>
                <select
                  value={orderType}
                  onChange={(e: any) => setOrderType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="REGULER">SP Reguler (Obat Bebas & Keras)</option>
                  <option value="PREKURSOR">SP Prekursor Farmasi</option>
                  <option value="OOT">SP Obat-Obat Tertentu (OOT)</option>
                  <option value="PSIKOTROPIKA">SP Psikotropika</option>
                  <option value="NARKOTIKA">SP Narkotika</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan untuk PBF / Apoteker
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Mohon dikirim batch dengan ED minimal 2 tahun ke depan..."
                  value={spNotes}
                  onChange={(e) => setSpNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSpModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={generatingSp}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {generatingSp ? "Menerbitkan SP..." : "Terbitkan SP Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
