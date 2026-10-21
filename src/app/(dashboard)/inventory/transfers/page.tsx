"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeftRight,
  Plus,
  RefreshCw,
  Building2,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  X,
  Truck,
  FileText,
} from "lucide-react";
import { ApiClient } from "@/lib/api";

interface TransferItem {
  id: string;
  transferCode: string;
  sourceOutletId: string;
  sourceOutletName: string;
  destinationOutletId: string;
  destinationOutletName: string;
  status: "PENDING" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  createdAt: string;
}

interface OutletItem {
  id: string;
  name: string;
}

interface ProductItem {
  id: string;
  name: string;
  baseUnit: string;
}

export default function StockTransfersPage() {
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [outlets, setOutlets] = useState<OutletItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Create Transfer
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceOutlet, setSourceOutlet] = useState("");
  const [destOutlet, setDestOutlet] = useState("");
  const [notes, setNotes] = useState("");
  const [itemsList, setItemsList] = useState<
    { productId: string; quantity: number; unitName: string }[]
  >([{ productId: "", quantity: 1, unitName: "Pcs" }]);
  const [submitting, setSubmitting] = useState(false);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      const res: any = await ApiClient.get("/transfers");
      if (res.success) {
        setTransfers(res.data);
      }
    } catch (err: any) {
      console.error("Gagal memuat mutasi cabang:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [outletsRes, productsRes]: any = await Promise.all([
        ApiClient.get("/outlets"),
        ApiClient.get("/products"),
      ]);
      if (outletsRes.data) {
        setOutlets(outletsRes.data);
        if (outletsRes.data.length >= 2) {
          setSourceOutlet(outletsRes.data[0].id);
          setDestOutlet(outletsRes.data[1].id);
        }
      }
      if (productsRes.data) {
        setProducts(productsRes.data);
        if (productsRes.data.length > 0) {
          setItemsList([{ productId: productsRes.data[0].id, quantity: 10, unitName: productsRes.data[0].baseUnit || "Pcs" }]);
        }
      }
    } catch (err) {
      console.error("Gagal memuat metadata:", err);
    }
  };

  useEffect(() => {
    fetchTransfers();
    fetchMetadata();
  }, []);

  const handleAddItemRow = () => {
    if (products.length === 0) return;
    setItemsList([
      ...itemsList,
      { productId: products[0].id, quantity: 10, unitName: products[0].baseUnit || "Pcs" },
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setItemsList(itemsList.filter((_, i) => i !== idx));
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceOutlet || !destOutlet || sourceOutlet === destOutlet) {
      alert("Pilih cabang asal dan cabang tujuan yang berbeda");
      return;
    }

    try {
      setSubmitting(true);
      const res: any = await ApiClient.post("/transfers", {
        sourceOutletId: sourceOutlet,
        destinationOutletId: destOutlet,
        notes,
        items: itemsList,
      });

      if (res.success) {
        alert(res.message || "Mutasi stok berhasil dibuat!");
        setIsModalOpen(false);
        fetchTransfers();
      }
    } catch (err: any) {
      alert(err.message || "Gagal membuat transfer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await ApiClient.put(`/transfers/${id}/status`, { status });
      fetchTransfers();
    } catch (err: any) {
      alert(err.message || "Gagal memperbarui status");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-800">Mutasi Stok Antar Cabang</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengiriman dan pemindahan persediaan obat antar outlet cabang apotek
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-600/30 transition"
        >
          <Plus className="h-4 w-4" />
          Kirim Mutasi Baru
        </button>
      </div>

      {/* Transfers List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
            <p className="text-xs">Memuat histori mutasi...</p>
          </div>
        ) : transfers.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Truck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Belum Ada Pengiriman Stok Antar Cabang</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Pindahkan stok obat dari gudang utama ke outlet cabang atau antar cabang apotek dengan mudah.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">No. Transfer</th>
                  <th className="px-4 py-3">Cabang Asal (Pengirim)</th>
                  <th className="px-4 py-3">Cabang Tujuan (Penerima)</th>
                  <th className="px-4 py-3">Waktu Mutasi</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800">
                      {t.transferCode}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {t.sourceOutletName}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {t.destinationOutletName}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      {new Date(t.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          t.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : t.status === "IN_TRANSIT"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {t.status === "IN_TRANSIT"
                          ? "Dalam Pengiriman"
                          : t.status === "COMPLETED"
                          ? "Selesai Diterima"
                          : t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.status === "IN_TRANSIT" && (
                        <button
                          onClick={() => handleUpdateStatus(t.id, "COMPLETED")}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold"
                        >
                          Konfirmasi Terima
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Buat Mutasi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Kirim Mutasi Stok Antar Cabang</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cabang Asal (Pengirim)
                  </label>
                  <select
                    value={sourceOutlet}
                    onChange={(e) => setSourceOutlet(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cabang Tujuan (Penerima)
                  </label>
                  <select
                    value={destOutlet}
                    onChange={(e) => setDestOutlet(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Daftar Obat Dikirim:</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    + Tambah Obat
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {itemsList.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          const next = [...itemsList];
                          next[idx].productId = e.target.value;
                          setItemsList(next);
                        }}
                        className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const next = [...itemsList];
                          next[idx].quantity = Number(e.target.value);
                          setItemsList(next);
                        }}
                        className="w-20 px-2 py-1.5 border border-slate-300 rounded-lg text-xs font-mono text-center"
                      />
                      {itemsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Pengiriman / Surat Jalan
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Kirim via kurir internal jam 14:00..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Memproses..." : "Kirim Mutasi Stok"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
