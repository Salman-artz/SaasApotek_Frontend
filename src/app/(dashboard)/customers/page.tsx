"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  AlertTriangle,
  FileText,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  Clock,
  Stethoscope,
  Receipt,
  X,
  CheckCircle2,
  RefreshCw,
  HeartPulse,
} from "lucide-react";
import { ApiClient } from "@/lib/api";

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  allergies: string | null;
  notes: string | null;
  createdAt: string;
}

interface MedicationHistoryItem {
  transactionId: string;
  invoiceCode: string;
  doctorName: string | null;
  prescriptionNumber: string | null;
  isPrescription: boolean;
  grandTotal: number;
  paymentMethod: string;
  createdAt: string;
}

interface CustomerDetail extends Customer {
  medicationHistory: MedicationHistoryItem[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    allergies: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // PMR (Patient Medication Record) Modal
  const [selectedPMR, setSelectedPMR] = useState<CustomerDetail | null>(null);
  const [loadingPMR, setLoadingPMR] = useState(false);

  // Delete modal
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res: any = await ApiClient.get(
        `/customers?search=${encodeURIComponent(search)}&page=${page}&limit=12`
      );
      if (res.success) {
        setCustomers(res.data);
        setTotalPages(res.meta.totalPages || 1);
        setTotalCount(res.meta.total || 0);
      }
    } catch (err) {
      console.error("Gagal mengambil data pasien:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setFormData({
      name: "",
      phone: "",
      address: "",
      allergies: "",
      notes: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone || "",
      address: c.address || "",
      allergies: c.allergies || "",
      notes: c.notes || "",
    });
    setIsFormOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSubmitting(true);
      if (editingCustomer) {
        await ApiClient.put(`/customers/${editingCustomer.id}`, formData);
      } else {
        await ApiClient.post("/customers", formData);
      }
      setIsFormOpen(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan data pasien");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await ApiClient.delete(`/customers/${deletingId}`);
      setDeletingId(null);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus pasien");
    }
  };

  const handleOpenPMR = async (customerId: string) => {
    try {
      setLoadingPMR(true);
      setSelectedPMR(null);
      const res: any = await ApiClient.get(`/customers/${customerId}`);
      if (res.success) {
        setSelectedPMR(res.data);
      }
    } catch (err: any) {
      alert(err.message || "Gagal memuat rekam medis pasien");
    } finally {
      setLoadingPMR(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-on-surface">Database Pasien & PMR</h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Manajemen data pelanggan, riwayat alergi klinis, dan Patient Medication Record (PMR)
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
        >
          <Plus className="h-4 w-4" />
          Tambah Pasien Baru
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-on-surface-variant/60" />
          <input
            type="text"
            placeholder="Cari nama, no. HP, atau alergi..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary-container focus:outline-none shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <span>Total: <strong className="text-on-surface font-semibold">{totalCount}</strong> pasien</span>
          <button
            onClick={() => fetchCustomers()}
            className="p-1.5 hover:bg-surface-container-low rounded-lg text-on-surface-variant transition"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Customer Grid / Table */}
      {loading ? (
        <div className="py-16 text-center text-on-surface-variant">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary-container mb-2" />
          <p className="text-xs">Memuat data pasien...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 text-center shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <Users className="h-12 w-12 mx-auto text-on-surface-variant/40 mb-3" />
          <p className="text-sm font-semibold text-on-surface">Belum Ada Data Pasien</p>
          <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
            Catat pasien untuk memantau riwayat alergi obat dan rekam medis penggunaan obat secara digital.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm"
          >
            Tambah Pasien Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div
              key={c.id}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 hover:border-primary-container/60 hover:shadow-md transition group flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-primary-container/10 text-primary-container font-bold flex items-center justify-center text-sm">
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-on-surface">{c.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-0.5">
                        <Phone className="h-3 w-3" />
                        <span>{c.phone || "Tidak ada no. telp"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1 hover:bg-surface-container-low text-on-surface-variant hover:text-primary-container rounded-lg"
                      title="Edit Data"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(c.id)}
                      className="p-1 hover:bg-red-50 text-on-surface-variant hover:text-red-600 rounded-lg"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Address */}
                {c.address && (
                  <div className="flex items-start gap-1.5 text-xs text-on-surface-variant mt-3">
                    <MapPin className="h-3 w-3 mt-0.5 text-on-surface-variant/60 flex-shrink-0" />
                    <span className="line-clamp-2">{c.address}</span>
                  </div>
                )}

                {/* Allergies Highlight */}
                {c.allergies ? (
                  <div className="mt-3.5 p-2 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-red-800 uppercase tracking-wide">
                        Riwayat Alergi:
                      </span>
                      <p className="text-xs font-medium text-red-700">{c.allergies}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3.5 p-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-[11px] text-on-surface-variant flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Tidak ada catatan alergi</span>
                  </div>
                )}

                {/* Notes */}
                {c.notes && (
                  <p className="text-xs text-on-surface-variant mt-2 italic bg-surface-container-low p-2 rounded-xl border border-outline-variant/20 line-clamp-2">
                    "{c.notes}"
                  </p>
                )}
              </div>

              {/* Action Button: Open PMR */}
              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="text-[10px] text-on-surface-variant">
                  Terdaftar: {new Date(c.createdAt).toLocaleDateString("id-ID")}
                </span>
                <button
                  onClick={() => handleOpenPMR(c.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#86f2e4]/20 hover:bg-[#86f2e4]/30 text-[#006a61] text-xs font-semibold rounded-lg border border-[#86f2e4]/40 transition"
                >
                  <HeartPulse className="h-3.5 w-3.5" />
                  Rekam PMR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-xl text-xs font-medium disabled:opacity-40 hover:bg-surface-container-low transition"
          >
            Sebelumnya
          </button>
          <span className="text-xs text-on-surface-variant">
            Halaman {page} dari {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-xl text-xs font-medium disabled:opacity-40 hover:bg-surface-container-low transition"
          >
            Selanjutnya
          </button>
        </div>
      )}

      {/* Modal Form Tambah / Edit */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-outline-variant/30">
            <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
              <h2 className="text-sm font-bold text-on-surface">
                {editingCustomer ? "Edit Data Pasien" : "Tambah Pasien Baru"}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-highest"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Nama Lengkap Pasien <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="text"
                    placeholder="08123456789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Riwayat Alergi Obat
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Amoxicillin, Paracetamol"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="w-full px-3 py-2 border border-red-300 bg-red-50/40 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-none text-red-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Alamat Domisili
                </label>
                <textarea
                  rows={2}
                  placeholder="Jl. Merdeka No. 10, Kelurahan..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Catatan Klinis / Penyakit Bawaan
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Riwayat Hipertensi, DM Tipe 2, Hamil trimester 2..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-low text-xs font-medium rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm disabled:opacity-50 transition"
                >
                  {submitting ? "Menyimpan..." : "Simpan Data Pasien"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PMR Modal (Patient Medication Record Timeline) */}
      {(selectedPMR || loadingPMR) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-outline-variant/30">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-inverse-surface text-inverse-on-surface flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HeartPulse className="h-6 w-6 text-[#86f2e4]" />
                <div>
                  <h2 className="text-sm font-bold">Patient Medication Record (PMR)</h2>
                  <p className="text-[11px] text-inverse-on-surface/70">
                    {selectedPMR ? selectedPMR.name : "Memuat data..."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPMR(null)}
                className="p-1 text-inverse-on-surface/70 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingPMR ? (
              <div className="p-12 text-center text-on-surface-variant">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary-container mb-2" />
                <p className="text-xs">Memuat riwayat rekam medis pasien...</p>
              </div>
            ) : selectedPMR ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Clinical Warning Card */}
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-on-surface-variant font-semibold block">Kontak & Alamat:</span>
                    <p className="text-on-surface font-medium">{selectedPMR.phone || "-"}</p>
                    <p className="text-on-surface-variant text-[11px] mt-0.5">{selectedPMR.address || "Alamat tidak dicatat"}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-on-surface-variant font-semibold block">Alergi & Peringatan:</span>
                    {selectedPMR.allergies ? (
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded-lg text-[11px] border border-red-300">
                        ⚠️ Alergi: {selectedPMR.allergies}
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-medium">Tidak ada riwayat alergi</span>
                    )}
                    {selectedPMR.notes && (
                      <p className="text-on-surface-variant text-[11px] mt-1 italic">
                        Catatan: {selectedPMR.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Medication Timeline */}
                <div>
                  <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary-container" />
                    Riwayat Penebusan Obat & Resep
                  </h4>

                  {selectedPMR.medicationHistory.length === 0 ? (
                    <div className="text-center py-8 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/40">
                      <Receipt className="h-8 w-8 mx-auto text-on-surface-variant/40 mb-2" />
                      <p className="text-xs text-on-surface-variant font-medium">
                        Belum ada riwayat transaksi obat untuk pasien ini.
                      </p>
                    </div>
                  ) : (
                    <div className="relative border-l-2 border-primary-container/30 pl-4 space-y-4 ml-2">
                      {selectedPMR.medicationHistory.map((item) => (
                        <div key={item.transactionId} className="relative group">
                          {/* Dot */}
                          <div className="absolute -left-[23px] top-1.5 h-3.5 w-3.5 rounded-full bg-primary-container border-2 border-surface-container-lowest shadow-sm" />

                          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3.5 hover:border-primary-container/60 hover:shadow-sm transition">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-on-surface font-mono">
                                  {item.invoiceCode}
                                </span>
                                {item.isPrescription ? (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-700 border border-purple-200 rounded uppercase">
                                    Resep Dokter
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium px-1.5 py-0.5 bg-surface-container-low text-primary-container rounded">
                                    OTC Bebas
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-on-surface-variant">
                                {new Date(item.createdAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            {item.isPrescription && (
                              <div className="mt-2 text-xs text-on-surface-variant flex items-center gap-4 bg-purple-50/50 p-2 rounded-lg border border-purple-100">
                                <div className="flex items-center gap-1.5">
                                  <Stethoscope className="h-3.5 w-3.5 text-purple-600" />
                                  <span>Dokter: <strong>{item.doctorName || "-"}</strong></span>
                                </div>
                                <div>
                                  <span>No. Resep: <strong>{item.prescriptionNumber || "-"}</strong></span>
                                </div>
                              </div>
                            )}

                            <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-outline-variant/20">
                              <span className="text-on-surface-variant">
                                Metode: <strong className="uppercase">{item.paymentMethod}</strong>
                              </span>
                              <span className="font-bold text-primary-container">
                                Rp {Number(item.grandTotal).toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Modal Footer */}
            <div className="p-4 bg-surface-container-low border-t border-outline-variant/20 flex justify-end">
              <button
                onClick={() => setSelectedPMR(null)}
                className="px-4 py-2 bg-inverse-surface hover:bg-slate-800 text-inverse-on-surface text-xs font-semibold rounded-xl transition"
              >
                Tutup Rekam Medis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full shadow-xl text-center space-y-4 border border-outline-variant/30">
            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-on-surface">Hapus Data Pasien?</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Tindakan ini tidak dapat dibatalkan. Riwayat transaksi sebelumnya tetap tercatat di sistem.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 border border-outline-variant/40 text-on-surface-variant text-xs font-semibold rounded-xl hover:bg-surface-container-low transition"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition"
              >
                Ya, Hapus Pasien
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
