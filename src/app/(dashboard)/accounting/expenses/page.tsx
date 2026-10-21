"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Plus,
  Search,
  Calendar,
  Filter,
  Trash2,
  Edit2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  X,
  CreditCard,
  Building,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { ApiClient } from "@/lib/api";

interface Expense {
  id: string;
  category: string;
  expenseDate: string;
  amount: string;
  paymentMethod: string;
  recipient: string | null;
  notes: string | null;
  receiptUrl: string | null;
  createdAt: string;
  createdBy: string | null;
}

interface LedgerEntry {
  id: string;
  date: string;
  reference: string;
  description: string;
  type: "INFLOW" | "OUTFLOW";
  category: string;
  amount: number;
  paymentMethod: string;
  balance: number;
}

interface LedgerSummary {
  totalInflow: number;
  totalOutflow: number;
  netCashflow: number;
  finalBalance: number;
  entryCount: number;
}

export default function ExpensesAndLedgerPage() {
  const [activeTab, setActiveTab] = useState<"expenses" | "ledger">("expenses");

  // Expenses Tab State
  const [expensesList, setExpensesList] = useState<Expense[]>([]);
  const [totalExpenseAmount, setTotalExpenseAmount] = useState(0);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchExpense, setSearchExpense] = useState("");
  const [expenseStartDate, setExpenseStartDate] = useState("");
  const [expenseEndDate, setExpenseEndDate] = useState("");

  // Expense Modal Form
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    category: "Gaji & Tunjangan Karyawan",
    amount: 0,
    expenseDate: new Date().toISOString().split("T")[0],
    paymentMethod: "CASH",
    recipient: "",
    notes: "",
  });
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  // General Ledger Tab State
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [ledgerSummary, setLedgerSummary] = useState<LedgerSummary | null>(null);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [ledgerStartDate, setLedgerStartDate] = useState("");
  const [ledgerEndDate, setLedgerEndDate] = useState("");

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res: any = await ApiClient.get("/expenses/categories");
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error("Gagal memuat kategori:", err);
    }
  };

  // Fetch Expenses List
  const fetchExpenses = async () => {
    try {
      setLoadingExpenses(true);
      let query = `?category=${selectedCategory}&search=${encodeURIComponent(searchExpense)}`;
      if (expenseStartDate) query += `&startDate=${expenseStartDate}`;
      if (expenseEndDate) query += `&endDate=${expenseEndDate}`;

      const res: any = await ApiClient.get(`/expenses${query}`);
      if (res.success) {
        setExpensesList(res.data);
        setTotalExpenseAmount(res.meta.totalAmount || 0);
      }
    } catch (err: any) {
      console.error("Gagal mengambil data pengeluaran:", err);
    } finally {
      setLoadingExpenses(false);
    }
  };

  // Fetch General Ledger
  const fetchLedger = async () => {
    try {
      setLoadingLedger(true);
      let query = "";
      if (ledgerStartDate && ledgerEndDate) {
        query = `?startDate=${ledgerStartDate}&endDate=${ledgerEndDate}`;
      }
      const res: any = await ApiClient.get(`/accounting/general-ledger${query}`);
      if (res.success) {
        setLedgerEntries(res.data.entries);
        setLedgerSummary(res.data.summary);
      }
    } catch (err: any) {
      console.error("Gagal memuat buku besar:", err);
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === "expenses") {
      fetchExpenses();
    } else {
      fetchLedger();
    }
  }, [activeTab, selectedCategory, searchExpense, expenseStartDate, expenseEndDate, ledgerStartDate, ledgerEndDate]);

  const handleOpenCreateExpense = () => {
    setEditingExpense(null);
    setExpenseForm({
      category: categories[0] || "Gaji & Tunjangan Karyawan",
      amount: 0,
      expenseDate: new Date().toISOString().split("T")[0],
      paymentMethod: "CASH",
      recipient: "",
      notes: "",
    });
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (exp: Expense) => {
    setEditingExpense(exp);
    setExpenseForm({
      category: exp.category,
      amount: Number(exp.amount),
      expenseDate: exp.expenseDate,
      paymentMethod: exp.paymentMethod,
      recipient: exp.recipient || "",
      notes: exp.notes || "",
    });
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseForm.amount <= 0) {
      alert("Nominal pengeluaran harus lebih besar dari 0");
      return;
    }

    try {
      setSubmittingExpense(true);
      if (editingExpense) {
        await ApiClient.put(`/expenses/${editingExpense.id}`, expenseForm);
      } else {
        await ApiClient.post("/expenses", expenseForm);
      }
      setIsExpenseModalOpen(false);
      fetchExpenses();
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan pengeluaran");
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deletingExpenseId) return;
    try {
      await ApiClient.delete(`/expenses/${deletingExpenseId}`);
      setDeletingExpenseId(null);
      fetchExpenses();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus pengeluaran");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-on-surface">Buku Kas & Biaya Operasional</h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Pencatatan pengeluaran biaya operasional apotek & jurnal mutasi arus kas (General Ledger)
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-surface-container-low rounded-xl border border-outline-variant/20">
          <button
            onClick={() => setActiveTab("expenses")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "expenses"
                ? "bg-surface-container-lowest text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Catatan Beban Biaya
          </button>
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === "ledger"
                ? "bg-surface-container-lowest text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Buku Kas (General Ledger)
          </button>
        </div>
      </div>

      {/* TAB 1: CATATAN BEBAN OPERASIONAL */}
      {activeTab === "expenses" && (
        <div className="space-y-6">
          {/* Summary & Action */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl p-5 shadow-sm sm:col-span-2 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider opacity-90 block">
                  Total Pengeluaran Beban Terfilter
                </span>
                <div className="text-2xl font-black mt-1">
                  Rp {Number(totalExpenseAmount).toLocaleString("id-ID")}
                </div>
                <span className="text-xs opacity-90 mt-0.5 block">
                  {expensesList.length} Transaksi Pembayaran Biaya
                </span>
              </div>
              <div className="p-3 bg-white/20 rounded-xl">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col justify-center items-center text-center">
              <button
                onClick={handleOpenCreateExpense}
                className="w-full py-3 bg-primary-container hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition"
              >
                <Plus className="h-4 w-4" />
                Catat Biaya Baru
              </button>
              <span className="text-[11px] text-on-surface-variant mt-2">
                Gaji, Sewa, Listrik, ATK, Kebersihan, dll.
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant/60" />
                <input
                  type="text"
                  placeholder="Cari penerima / catatan..."
                  value={searchExpense}
                  onChange={(e) => setSearchExpense(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
                />
              </div>

              {/* Category select */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-56 px-3 py-2 border border-outline-variant/30 rounded-xl text-xs bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
              >
                <option value="ALL">Semua Kategori Beban</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Date filter */}
            <div className="flex items-center gap-2 text-xs w-full md:w-auto justify-end">
              <Calendar className="h-4 w-4 text-on-surface-variant/60" />
              <input
                type="date"
                value={expenseStartDate}
                onChange={(e) => setExpenseStartDate(e.target.value)}
                className="px-2.5 py-1.5 border border-outline-variant/30 rounded-xl text-xs bg-surface-container-low text-on-surface"
              />
              <span className="text-on-surface-variant/60">s/d</span>
              <input
                type="date"
                value={expenseEndDate}
                onChange={(e) => setExpenseEndDate(e.target.value)}
                className="px-2.5 py-1.5 border border-outline-variant/30 rounded-xl text-xs bg-surface-container-low text-on-surface"
              />
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            {loadingExpenses ? (
              <div className="py-16 text-center text-on-surface-variant">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary-container mb-2" />
                <p className="text-xs">Memuat catatan pengeluaran...</p>
              </div>
            ) : expensesList.length === 0 ? (
              <div className="py-16 text-center text-on-surface-variant">
                <Wallet className="h-10 w-10 mx-auto text-on-surface-variant/40 mb-2" />
                <p className="text-xs font-semibold text-on-surface">Belum ada pengeluaran dicatat</p>
                <button
                  onClick={handleOpenCreateExpense}
                  className="mt-3 px-4 py-2 bg-primary-container hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                >
                  Catat Biaya Pertama
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-on-surface">
                  <thead className="bg-surface-container-low text-on-surface-variant font-semibold text-[11px] uppercase border-b border-outline-variant/20">
                    <tr>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Kategori Beban</th>
                      <th className="px-4 py-3">Penerima / Vendor</th>
                      <th className="px-4 py-3">Metode Bayar</th>
                      <th className="px-4 py-3 text-right">Nominal (Rp)</th>
                      <th className="px-4 py-3">Catatan</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15">
                    {expensesList.map((exp) => (
                      <tr key={exp.id} className="hover:bg-surface-container-low/40 transition">
                        <td className="px-4 py-3 text-on-surface-variant font-mono">
                          {new Date(exp.expenseDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 font-semibold text-on-surface">
                          {exp.category}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {exp.recipient || "-"}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          <span className="px-2 py-0.5 bg-surface-container-low border border-outline-variant/20 rounded-lg text-[11px] font-semibold uppercase">
                            {exp.paymentMethod}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold font-mono text-red-600">
                          Rp {Number(exp.amount).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant max-w-xs truncate">
                          {exp.notes || "-"}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditExpense(exp)}
                            className="p-1 hover:bg-surface-container-low text-on-surface-variant hover:text-primary-container rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingExpenseId(exp.id)}
                            className="p-1 hover:bg-red-50 text-on-surface-variant hover:text-red-600 rounded-lg"
                            title="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BUKU BESAR MUTASI ARUS KAS (GENERAL LEDGER) */}
      {activeTab === "ledger" && (
        <div className="space-y-6">
          {/* Ledger Metric Cards */}
          {ledgerSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Total Uang Masuk (Inflow)
                </span>
                <div className="text-xl font-black text-emerald-600 mt-1 flex items-center gap-1">
                  <ArrowDownRight className="h-5 w-5" />
                  Rp {Number(ledgerSummary.totalInflow).toLocaleString("id-ID")}
                </div>
                <span className="text-[11px] text-on-surface-variant mt-1 block">Penjualan Kasir POS</span>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Total Uang Keluar (Outflow)
                </span>
                <div className="text-xl font-black text-red-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-5 w-5" />
                  Rp {Number(ledgerSummary.totalOutflow).toLocaleString("id-ID")}
                </div>
                <span className="text-[11px] text-on-surface-variant mt-1 block">Hutang PBF + Biaya Beban</span>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                  Arus Kas Bersih (Net Cashflow)
                </span>
                <div
                  className={`text-xl font-black mt-1 ${
                    ledgerSummary.netCashflow >= 0 ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  Rp {Number(ledgerSummary.netCashflow).toLocaleString("id-ID")}
                </div>
                <span className="text-[11px] text-on-surface-variant mt-1 block">Inflow minus Outflow</span>
              </div>

              <div className="bg-inverse-surface text-inverse-on-surface rounded-2xl p-5 shadow-sm border border-outline-variant/30">
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-80 block">
                  Saldo Kas Akhir Berjalan
                </span>
                <div className="text-xl font-black font-mono mt-1 text-[#86f2e4]">
                  Rp {Number(ledgerSummary.finalBalance).toLocaleString("id-ID")}
                </div>
                <span className="text-[11px] opacity-80 mt-1 block">
                  {ledgerSummary.entryCount} Jurnal Mutasi
                </span>
              </div>
            </div>
          )}

          {/* Date Range for Ledger */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Calendar className="h-4 w-4 text-on-surface-variant/60" />
              <span className="font-semibold text-on-surface">Filter Tanggal Mutasi:</span>
              <input
                type="date"
                value={ledgerStartDate}
                onChange={(e) => setLedgerStartDate(e.target.value)}
                className="px-2.5 py-1.5 border border-outline-variant/30 rounded-xl text-xs bg-surface-container-low text-on-surface"
              />
              <span className="text-on-surface-variant/60">s/d</span>
              <input
                type="date"
                value={ledgerEndDate}
                onChange={(e) => setLedgerEndDate(e.target.value)}
                className="px-2.5 py-1.5 border border-outline-variant/30 rounded-xl text-xs bg-surface-container-low text-on-surface"
              />
            </div>

            <button
              onClick={fetchLedger}
              className="p-2 border border-outline-variant/30 hover:bg-surface-container-low text-on-surface-variant rounded-xl transition"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loadingLedger ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Ledger Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            {loadingLedger ? (
              <div className="py-16 text-center text-on-surface-variant">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary-container mb-2" />
                <p className="text-xs">Menyusun jurnal buku besar...</p>
              </div>
            ) : ledgerEntries.length === 0 ? (
              <div className="py-16 text-center text-on-surface-variant">
                <FileText className="h-10 w-10 mx-auto text-on-surface-variant/40 mb-2" />
                <p className="text-xs font-semibold text-on-surface">Belum ada mutasi keuangan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-on-surface">
                  <thead className="bg-surface-container-low text-on-surface-variant font-semibold uppercase text-[11px] border-b border-outline-variant/20">
                    <tr>
                      <th className="px-4 py-3">Waktu & Tanggal</th>
                      <th className="px-4 py-3">No. Referensi</th>
                      <th className="px-4 py-3">Keterangan Transaksi</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Metode</th>
                      <th className="px-4 py-3 text-right">Debit / Masuk (Rp)</th>
                      <th className="px-4 py-3 text-right">Kredit / Keluar (Rp)</th>
                      <th className="px-4 py-3 text-right">Saldo Berjalan (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15">
                    {ledgerEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                          {new Date(entry.date).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-slate-800">
                          {entry.reference}
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium">
                          {entry.description}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px]">
                            {entry.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <span className="px-1.5 py-0.5 bg-slate-100 font-mono rounded text-[10px] uppercase">
                            {entry.paymentMethod}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600">
                          {entry.type === "INFLOW"
                            ? `+ Rp ${Number(entry.amount).toLocaleString("id-ID")}`
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-red-600">
                          {entry.type === "OUTFLOW"
                            ? `- Rp ${Number(entry.amount).toLocaleString("id-ID")}`
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-extrabold text-slate-900">
                          Rp {Number(entry.balance).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit Pengeluaran */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">
                {editingExpense ? "Edit Pengeluaran Operasional" : "Catat Pengeluaran Operasional Baru"}
              </h2>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Beban Operasional <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nominal Biaya (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    placeholder="Contoh: 500000"
                    value={expenseForm.amount || ""}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Pengeluaran <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseForm.expenseDate}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, expenseDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="CASH">Kas Tunai (Cash Drawer)</option>
                    <option value="TRANSFER">Transfer Bank</option>
                    <option value="DEBIT">Kartu Debit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Penerima / Nama Vendor
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PLN, Pemilik Ruko, Staff..."
                    value={expenseForm.recipient}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, recipient: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Catatan Tambahan
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Pembayaran tagihan listrik bulan September..."
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submittingExpense ? "Menyimpan..." : "Simpan Pengeluaran"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExpenseId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl text-center space-y-4">
            <Trash2 className="h-10 w-10 text-red-500 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Hapus Catatan Pengeluaran?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Data yang dihapus akan otomatis disesuaikan pada buku kas dan laporan laba rugi.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeletingExpenseId(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteExpense}
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
