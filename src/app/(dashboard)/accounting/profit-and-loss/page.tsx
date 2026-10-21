"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Receipt,
  FileText,
  Printer,
  RefreshCw,
  ArrowDownRight,
  ArrowUpRight,
  PieChart as PieIcon,
  Building,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { ApiClient } from "@/lib/api";

interface ExpenseBreakdown {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

interface ProfitAndLossData {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    totalTransactions: number;
    grossSales: number;
    totalDiscount: number;
    netSales: number;
  };
  cogs: {
    totalCogs: number;
  };
  grossProfit: {
    amount: number;
    marginPercent: number;
  };
  operatingExpenses: {
    total: number;
    breakdown: ExpenseBreakdown[];
  };
  netProfit: {
    amount: number;
    marginPercent: number;
    isProfitable: boolean;
  };
}

export default function ProfitAndLossPage() {
  const [data, setData] = useState<ProfitAndLossData | null>(null);
  const [loading, setLoading] = useState(true);

  // Date filters
  const [dateRangeType, setDateRangeType] = useState<"today" | "7days" | "thisMonth" | "thisYear" | "custom">("thisMonth");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const calculateDates = (type: string) => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (type === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (type === "7days") {
      const prior = new Date();
      prior.setDate(today.getDate() - 7);
      const pYyyy = prior.getFullYear();
      const pMm = String(prior.getMonth() + 1).padStart(2, "0");
      const pDd = String(prior.getDate()).padStart(2, "0");
      setStartDate(`${pYyyy}-${pMm}-${pDd}`);
      setEndDate(todayStr);
    } else if (type === "thisMonth") {
      setStartDate(`${yyyy}-${mm}-01`);
      setEndDate(todayStr);
    } else if (type === "thisYear") {
      setStartDate(`${yyyy}-01-01`);
      setEndDate(todayStr);
    }
  };

  useEffect(() => {
    calculateDates("thisMonth");
  }, []);

  const fetchProfitAndLoss = async () => {
    try {
      setLoading(true);
      let query = "";
      if (startDate && endDate) {
        query = `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res: any = await ApiClient.get(`/accounting/profit-and-loss${query}`);
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error("Gagal memuat Laporan Laba Rugi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchProfitAndLoss();
    }
  }, [startDate, endDate]);

  const handleQuickDateChange = (type: "today" | "7days" | "thisMonth" | "thisYear") => {
    setDateRangeType(type);
    calculateDates(type);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] print:border-none print:shadow-none print:p-0">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary-container" />
            <h1 className="text-xl font-bold text-on-surface">Laporan Laba Rugi (P&L Statement)</h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Ringkasan pendapatan, HPP (COGS), beban operasional, dan laba bersih komprehensif apotek
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={fetchProfitAndLoss}
            className="p-2 border border-outline-variant/30 hover:bg-surface-container-low text-on-surface-variant rounded-xl transition"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Printer className="h-4 w-4" />
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col md:flex-row items-center justify-between gap-4 print:hidden">
        {/* Quick buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => handleQuickDateChange("today")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              dateRangeType === "today"
                ? "bg-primary-container text-white shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/20"
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => handleQuickDateChange("7days")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              dateRangeType === "7days"
                ? "bg-primary-container text-white shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/20"
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => handleQuickDateChange("thisMonth")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              dateRangeType === "thisMonth"
                ? "bg-primary-container text-white shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/20"
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => handleQuickDateChange("thisYear")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              dateRangeType === "thisYear"
                ? "bg-primary-container text-white shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant/20"
            }`}
          >
            Tahun Ini
          </button>
        </div>

        {/* Custom Date Picker */}
        <div className="flex items-center gap-2 text-xs w-full md:w-auto justify-end">
          <Calendar className="h-4 w-4 text-on-surface-variant" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setDateRangeType("custom");
            }}
            className="px-2.5 py-1.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:ring-2 focus:ring-primary-container focus:outline-none"
          />
          <span className="text-on-surface-variant">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setDateRangeType("custom");
            }}
            className="px-2.5 py-1.5 bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:ring-2 focus:ring-primary-container focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="h-10 w-10 animate-spin mx-auto text-emerald-600 mb-3" />
          <p className="text-xs font-medium">Menghitung pembukuan & laba rugi apotek...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Net Revenue */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                Pendapatan Bersih
              </span>
              <div className="text-xl font-black text-on-surface mt-1">
                Rp {Number(data.revenue.netSales).toLocaleString("id-ID")}
              </div>
              <div className="text-[11px] text-on-surface-variant mt-1 flex items-center justify-between">
                <span>{data.revenue.totalTransactions} Transaksi Kasir</span>
                {data.revenue.totalDiscount > 0 && (
                  <span className="text-red-500">
                    Diskon: Rp {Number(data.revenue.totalDiscount).toLocaleString("id-ID")}
                  </span>
                )}
              </div>
            </div>

            {/* Gross Profit */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                Laba Kotor (Gross Profit)
              </span>
              <div className="text-xl font-black text-primary-container mt-1">
                Rp {Number(data.grossProfit.amount).toLocaleString("id-ID")}
              </div>
              <div className="text-[11px] text-primary-container/80 mt-1 font-semibold">
                Gross Margin: {data.grossProfit.marginPercent}%
              </div>
            </div>

            {/* Operating Expenses */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
              <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
                Beban Operasional (Opex)
              </span>
              <div className="text-xl font-black text-amber-600 mt-1">
                Rp {Number(data.operatingExpenses.total).toLocaleString("id-ID")}
              </div>
              <div className="text-[11px] text-on-surface-variant mt-1">
                {data.operatingExpenses.breakdown.length} Pos Pengeluaran
              </div>
            </div>

            {/* Net Profit */}
            <div
              className={`rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] border ${
                data.netProfit.isProfitable
                  ? "bg-emerald-50/60 border-emerald-200"
                  : "bg-red-50/60 border-red-200"
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider block text-on-surface-variant">
                Laba Bersih (Net Profit)
              </span>
              <div
                className={`text-xl font-black mt-1 ${
                  data.netProfit.isProfitable ? "text-emerald-700" : "text-red-700"
                }`}
              >
                Rp {Number(data.netProfit.amount).toLocaleString("id-ID")}
              </div>
              <div
                className={`text-[11px] font-bold mt-1 ${
                  data.netProfit.isProfitable ? "text-emerald-600" : "text-red-600"
                }`}
              >
                Net Margin: {data.netProfit.marginPercent}%
              </div>
            </div>
          </div>

          {/* Detailed Financial Statement Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low/60 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-on-surface">
                  Rincian Laporan Laba Rugi Komprehensif
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Periode: {data.period.startDate} s/d {data.period.endDate}
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-xl uppercase">
                Standar Akuntansi Apotek
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* 1. REVENUE SECTION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-1.5">
                  <span>1. Pendapatan Usaha (Revenue)</span>
                  <span>Nominal (Rp)</span>
                </div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant py-1 pl-4">
                  <span>Penjualan Obat & Alkes Kotor (Gross Sales)</span>
                  <span className="font-mono text-on-surface">
                    Rp {Number(data.revenue.grossSales).toLocaleString("id-ID")}
                  </span>
                </div>
                {data.revenue.totalDiscount > 0 && (
                  <div className="flex items-center justify-between text-xs text-red-600 py-1 pl-4">
                    <span>Potongan / Diskon Penjualan</span>
                    <span className="font-mono">
                      (Rp {Number(data.revenue.totalDiscount).toLocaleString("id-ID")})
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs font-bold text-on-surface bg-surface-container-low/70 border border-outline-variant/20 p-2.5 rounded-xl">
                  <span>Total Pendapatan Bersih (Net Revenue)</span>
                  <span className="font-mono text-sm">
                    Rp {Number(data.revenue.netSales).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* 2. COGS / HPP */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-1.5">
                  <span>2. Harga Pokok Penjualan (HPP / COGS)</span>
                  <span>Nominal (Rp)</span>
                </div>
                <div className="flex items-center justify-between text-xs text-on-surface-variant py-1 pl-4">
                  <span>Harga Pokok Pengadaan Obat Terjual (COGS)</span>
                  <span className="font-mono text-red-600">
                    (Rp {Number(data.cogs.totalCogs).toLocaleString("id-ID")})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-primary-container bg-surface-container-low/70 p-2.5 rounded-xl border border-outline-variant/20">
                  <div>
                    <span>LABA KOTOR (GROSS PROFIT)</span>
                    <span className="text-[11px] font-normal text-on-surface-variant ml-2">
                      (Margin: {data.grossProfit.marginPercent}%)
                    </span>
                  </div>
                  <span className="font-mono text-sm text-primary-container">
                    Rp {Number(data.grossProfit.amount).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* 3. OPERATING EXPENSES */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-on-surface uppercase tracking-wider border-b border-outline-variant/20 pb-1.5">
                  <span>3. Beban Operasional Apotek (Operating Expenses)</span>
                  <span>Nominal (Rp)</span>
                </div>

                {data.operatingExpenses.breakdown.length === 0 ? (
                  <div className="py-3 text-center text-xs text-on-surface-variant italic">
                    Belum ada pencatatan biaya operasional pada periode ini.
                  </div>
                ) : (
                  <div className="space-y-1.5 pl-4">
                    {data.operatingExpenses.breakdown.map((exp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-on-surface-variant py-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
                          <span>{exp.category}</span>
                          <span className="text-[10px] text-on-surface-variant/70">({exp.count}x transaksi)</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-on-surface-variant/80 font-mono">
                            {exp.percentage}%
                          </span>
                          <span className="font-mono text-red-600">
                            (Rp {Number(exp.amount).toLocaleString("id-ID")})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-bold text-amber-700 bg-surface-container-low/70 p-2.5 rounded-xl border border-outline-variant/20">
                  <span>TOTAL BEBAN OPERASIONAL</span>
                  <span className="font-mono text-sm text-amber-700">
                    (Rp {Number(data.operatingExpenses.total).toLocaleString("id-ID")})
                  </span>
                </div>
              </div>

              {/* 4. NET PROFIT FINAL */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  data.netProfit.isProfitable
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : "bg-red-600 text-white border-red-700"
                }`}
              >
                <div>
                  <span className="text-[11px] uppercase tracking-wider opacity-90 block">
                    Hasil Akhir Pembukuan
                  </span>
                  <h4 className="text-base font-black tracking-tight">
                    LABA BERSIH OPERASIONAL (NET PROFIT)
                  </h4>
                  <span className="text-xs opacity-90">
                    Net Profit Margin: {data.netProfit.marginPercent}%
                  </span>
                </div>
                <div className="text-2xl font-black font-mono">
                  Rp {Number(data.netProfit.amount).toLocaleString("id-ID")}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
