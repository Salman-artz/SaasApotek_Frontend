"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  Building2,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Stethoscope,
  Pill,
  Sparkles,
  Loader2,
  ShieldAlert,
  Layers,
  Activity,
  FileText,
} from "lucide-react";

interface SalesSummaryData {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  totalDiscount: number;
  totalTax: number;
  totalTuslah: number;
  paymentBreakdown: {
    cash: number;
    qris: number;
    transfer: number;
    debit: number;
  };
  prescriptionSummary: {
    prescriptionCount: number;
    nonPrescriptionCount: number;
  };
  dailyTrend: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
}

interface ProfitMarginProduct {
  productId: string;
  productName: string;
  category: string;
  baseUnit: string;
  qtySold: number;
  totalRevenue: number;
  totalHpp: number;
  grossProfit: number;
  marginPercentage: number;
}

interface ProfitMarginData {
  summary: {
    totalRevenue: number;
    totalHpp: number;
    grossProfit: number;
    marginPercentage: number;
  };
  products: ProfitMarginProduct[];
}

interface DrugMovementItem {
  productId: string;
  productName: string;
  category: string;
  baseUnit: string;
  totalQtySold: number;
  totalRevenue: number;
  transactionCount: number;
  isFastMoving: boolean;
}

interface DrugMovementData {
  fastMoving: DrugMovementItem[];
  slowMoving: DrugMovementItem[];
  all: DrugMovementItem[];
}

interface SipnapItem {
  productId: string;
  productName: string;
  genericName?: string | null;
  category: string;
  baseUnit: string;
  openingStock: number;
  totalIncoming: number;
  totalOutgoing: number;
  closingStock: number;
  incomingDetails: Array<{
    date: string;
    referenceNumber?: string | null;
    qty: number;
    notes?: string | null;
  }>;
  outgoingDetails: Array<{
    date: string;
    referenceNumber?: string | null;
    qty: number;
    notes?: string | null;
  }>;
}

interface SipnapData {
  period: {
    month: number;
    year: number;
    category: string;
    monthName: string;
  };
  items: SipnapItem[];
}

interface OutletItem {
  id: string;
  name: string;
  siaNumber?: string | null;
  sipaNumber?: string | null;
}

export default function ReportsPage() {
  // Active Tab: 'sales' | 'profit' | 'movement' | 'sipnap'
  const [activeTab, setActiveTab] = useState<"sales" | "profit" | "movement" | "sipnap">("sales");

  // Global Filters
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));

  // SIPNAP Filters
  const [sipnapMonth, setSipnapMonth] = useState(new Date().getMonth() + 1);
  const [sipnapYear, setSipnapYear] = useState(new Date().getFullYear());
  const [sipnapCategory, setSipnapCategory] = useState<"Narkotika" | "Psikotropika" | "ALL">("Narkotika");

  // 1. Fetch Outlets
  const { data: outletsData } = useQuery({
    queryKey: ["outlets"],
    queryFn: async () => {
      const res = await ApiClient.get<{ data: OutletItem[] }>("/api/outlets");
      return res.data || [];
    },
  });
  const outletsList = outletsData || [];

  // 2. Fetch Sales Summary Report
  const { data: salesData, isLoading: isSalesLoading } = useQuery({
    queryKey: ["report-sales", selectedOutlet, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedOutlet) params.append("outletId", selectedOutlet);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      return await ApiClient.get<{ data: SalesSummaryData }>(
        `/api/reports/sales-summary?${params.toString()}`
      );
    },
    enabled: activeTab === "sales",
  });
  const salesSummary = salesData?.data;

  // 3. Fetch Profit Margin Report
  const { data: profitData, isLoading: isProfitLoading } = useQuery({
    queryKey: ["report-profit", selectedOutlet, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedOutlet) params.append("outletId", selectedOutlet);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      return await ApiClient.get<{ data: ProfitMarginData }>(
        `/api/reports/profit-margins?${params.toString()}`
      );
    },
    enabled: activeTab === "profit",
  });
  const profitMargin = profitData?.data;

  // 4. Fetch Drug Movement Report
  const { data: movementData, isLoading: isMovementLoading } = useQuery({
    queryKey: ["report-movement", selectedOutlet, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedOutlet) params.append("outletId", selectedOutlet);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      return await ApiClient.get<{ data: DrugMovementData }>(
        `/api/reports/drug-movement?${params.toString()}`
      );
    },
    enabled: activeTab === "movement",
  });
  const drugMovement = movementData?.data;

  // 5. Fetch SIPNAP Report
  const { data: sipnapReportData, isLoading: isSipnapLoading } = useQuery({
    queryKey: ["report-sipnap", selectedOutlet, sipnapMonth, sipnapYear, sipnapCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedOutlet) params.append("outletId", selectedOutlet);
      params.append("month", sipnapMonth.toString());
      params.append("year", sipnapYear.toString());
      params.append("category", sipnapCategory);
      return await ApiClient.get<{ data: SipnapData }>(`/api/reports/sipnap?${params.toString()}`);
    },
    enabled: activeTab === "sipnap",
  });
  const sipnapReport = sipnapReportData?.data;

  const formatRupiah = (num: number | string) => {
    const val = typeof num === "string" ? parseFloat(num) : num;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // CSV Export Helper
  const downloadCsv = (filename: string, csvContent: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSalesCsv = () => {
    if (!salesSummary?.dailyTrend) return;
    let csv = "Tanggal,Omzet (IDR),Jumlah Transaksi\n";
    salesSummary.dailyTrend.forEach((r) => {
      csv += `"${r.date}",${r.revenue},${r.transactions}\n`;
    });
    downloadCsv(`laporan_penjualan_${startDate}_sd_${endDate}.csv`, csv);
  };

  const exportProfitCsv = () => {
    if (!profitMargin?.products) return;
    let csv = "Nama Produk,Kategori,Satuan,Qty Terjual,Omzet Penjualan (IDR),Total HPP (IDR),Laba Kotor (IDR),Margin (%)\n";
    profitMargin.products.forEach((p) => {
      csv += `"${p.productName}","${p.category}","${p.baseUnit}",${p.qtySold},${p.totalRevenue},${p.totalHpp},${p.grossProfit},${p.marginPercentage}%\n`;
    });
    downloadCsv(`laporan_laba_kotor_${startDate}_sd_${endDate}.csv`, csv);
  };

  const exportSipnapCsv = () => {
    if (!sipnapReport?.items) return;
    let csv = "No,Nama Obat,Zat Aktif,Kategori,Satuan,Stok Awal,Pemasukan (PBF),Pengeluaran (Resep),Stok Akhir\n";
    sipnapReport.items.forEach((item, idx) => {
      csv += `${idx + 1},"${item.productName}","${item.genericName || "-"}","${item.category}","${item.baseUnit}",${item.openingStock},${item.totalIncoming},${item.totalOutgoing},${item.closingStock}\n`;
    });
    downloadCsv(`laporan_sipnap_${sipnapCategory}_${sipnapMonth}_${sipnapYear}.csv`, csv);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-on-surface">
              Laporan & Analisis Farmasi
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Analisis Omzet, Laba Kotor, Fast-Moving Drugs, & Laporan Regulasi Resmi SIPNAP Kemenkes RI.
            </p>
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/30">
            <Building2 className="w-4 h-4 text-on-surface-variant/60" />
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="text-xs bg-transparent focus:outline-none font-semibold text-on-surface"
            >
              <option value="">Semua Cabang Outlet</option>
              {outletsList.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-outline-variant/30 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("sales")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "sales"
              ? "border-primary-container text-primary-container"
              : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/40"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Penjualan & Pendapatan
        </button>

        <button
          onClick={() => setActiveTab("profit")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "profit"
              ? "border-primary-container text-primary-container"
              : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/40"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Laba Kotor & Margin
        </button>

        <button
          onClick={() => setActiveTab("movement")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "movement"
              ? "border-primary-container text-primary-container"
              : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/40"
          }`}
        >
          <Activity className="w-4 h-4" />
          Fast vs Slow Moving
        </button>

        <button
          onClick={() => setActiveTab("sipnap")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "sipnap"
              ? "border-primary-container text-primary-container"
              : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/40"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          SIPNAP Kemenkes (Narkotika/Psikotropika)
        </button>
      </div>

      {/* Date Range Bar (for Sales, Profit, and Movement tabs) */}
      {activeTab !== "sipnap" && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-4 h-4 text-on-surface-variant/60" />
            <span className="font-semibold text-on-surface">Periode Tanggal:</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs h-8 w-36 bg-surface-container-low border-outline-variant/30 text-on-surface rounded-xl"
            />
            <span className="text-on-surface-variant/60">s/d</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs h-8 w-36 bg-surface-container-low border-outline-variant/30 text-on-surface rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "sales" && (
              <Button
                onClick={exportSalesCsv}
                variant="outline"
                size="sm"
                className="text-xs h-8 gap-1.5 border-outline-variant/40 text-on-surface hover:bg-surface-container-low rounded-xl"
              >
                <Download className="w-3.5 h-3.5" />
                Ekspor CSV Penjualan
              </Button>
            )}
            {activeTab === "profit" && (
              <Button
                onClick={exportProfitCsv}
                variant="outline"
                size="sm"
                className="text-xs h-8 gap-1.5 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Download className="w-3.5 h-3.5" />
                Ekspor CSV Laba Kotor
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: PENJUALAN & PENDAPATAN */}
      {/* ========================================================================= */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-emerald-100 dark:border-emerald-900 bg-white dark:bg-gray-800 shadow-sm">
              <CardContent className="p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Total Omzet Penjualan
                </span>
                <div className="mt-2 text-2xl font-black text-emerald-600">
                  {formatRupiah(salesSummary?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Dari <strong>{salesSummary?.totalTransactions || 0}</strong> transaksi sukses
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <CardContent className="p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Rata-rata Nilai Belanja (Basket Size)
                </span>
                <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">
                  {formatRupiah(salesSummary?.averageOrderValue || 0)}
                </div>
                <p className="text-xs text-gray-400 mt-1">Rata-rata pengeluaran per pasien</p>
              </CardContent>
            </Card>

            <Card className="border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <CardContent className="p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Total Diskon Diberikan
                </span>
                <div className="mt-2 text-2xl font-black text-red-600">
                  {formatRupiah(salesSummary?.totalDiscount || 0)}
                </div>
                <p className="text-xs text-gray-400 mt-1">Potongan harga promo & loyalty</p>
              </CardContent>
            </Card>

            <Card className="border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
              <CardContent className="p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Pelayanan Resep Dokter
                </span>
                <div className="mt-2 text-2xl font-black text-blue-600">
                  {salesSummary?.prescriptionSummary.prescriptionCount || 0}
                  <span className="text-sm font-normal text-gray-400 ml-1">Resep</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Non-resep: {salesSummary?.prescriptionSummary.nonPrescriptionCount || 0} transaksi
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                💵 Tunai (Cash)
              </span>
              <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {formatRupiah(salesSummary?.paymentBreakdown.cash || 0)}
              </div>
            </div>

            <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900">
              <span className="text-xs font-bold text-purple-800 dark:text-purple-400">
                📱 QRIS Dinamis
              </span>
              <div className="text-lg font-black text-purple-700 dark:text-purple-300 mt-1">
                {formatRupiah(salesSummary?.paymentBreakdown.qris || 0)}
              </div>
            </div>

            <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900">
              <span className="text-xs font-bold text-blue-800 dark:text-blue-400">
                🏦 Transfer Bank
              </span>
              <div className="text-lg font-black text-blue-700 dark:text-blue-300 mt-1">
                {formatRupiah(salesSummary?.paymentBreakdown.transfer || 0)}
              </div>
            </div>

            <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400">
                💳 Kartu Debit EDC
              </span>
              <div className="text-lg font-black text-amber-700 dark:text-amber-300 mt-1">
                {formatRupiah(salesSummary?.paymentBreakdown.debit || 0)}
              </div>
            </div>
          </div>

          {/* Daily Trend Table */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20 flex items-center justify-between">
              <h3 className="text-sm font-bold text-on-surface">
                Rincian Trend Penjualan Harian
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-on-surface">
                <thead className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
                  <tr>
                    <th className="px-4 py-3">Tanggal Transaksi</th>
                    <th className="px-4 py-3 text-center">Jumlah Transaksi</th>
                    <th className="px-4 py-3 text-right">Total Omzet Harian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15 text-xs">
                  {isSalesLoading ? (
                    <tr>
                      <td colSpan={3} className="text-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-container mx-auto" />
                      </td>
                    </tr>
                  ) : salesSummary?.dailyTrend.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-on-surface-variant">
                        Tidak ada data penjualan pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    salesSummary?.dailyTrend.map((row) => (
                      <tr key={row.date} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-on-surface">
                          {new Date(row.date).toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-on-surface">
                          {row.transactions} Struk
                        </td>
                        <td className="px-4 py-3 text-right font-black text-primary-container">
                          {formatRupiah(row.revenue)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LABA KOTOR & MARGIN KEUNTUNGAN */}
      {/* ========================================================================= */}
      {activeTab === "profit" && (
        <div className="space-y-6">
          {/* Summary Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-outline-variant/30 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] rounded-2xl">
              <CardContent className="p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Total Pendapatan (Omzet)
                </span>
                <div className="mt-2 text-2xl font-black text-on-surface">
                  {formatRupiah(profitMargin?.summary.totalRevenue || 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-outline-variant/30 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] rounded-2xl">
              <CardContent className="p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Total HPP (Modal Barang)
                </span>
                <div className="mt-2 text-2xl font-black text-red-600">
                  {formatRupiah(profitMargin?.summary.totalHpp || 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/40 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Laba Kotor (Gross Profit)
                </span>
                <div className="mt-2 text-2xl font-black text-emerald-600">
                  {formatRupiah(profitMargin?.summary.grossProfit || 0)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/40 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
                  Rata-rata Margin Laba
                </span>
                <div className="mt-2 text-2xl font-black text-purple-600">
                  {profitMargin?.summary.marginPercentage || 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profit by Product Table */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20">
              <h3 className="text-sm font-bold text-on-surface">
                Rincian Margin & Laba per Produk Obat
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-on-surface">
                <thead className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
                  <tr>
                    <th className="px-4 py-3">Nama Produk Obat</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3 text-center">Qty Terjual</th>
                    <th className="px-4 py-3 text-right">Omzet Penjualan</th>
                    <th className="px-4 py-3 text-right">Total HPP Modal</th>
                    <th className="px-4 py-3 text-right text-emerald-600 font-bold">Laba Kotor</th>
                    <th className="px-4 py-3 text-center">Margin (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15 text-xs">
                  {isProfitLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-container mx-auto" />
                      </td>
                    </tr>
                  ) : profitMargin?.products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-on-surface-variant">
                        Belum ada data penjualan pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    profitMargin?.products.map((p) => (
                      <tr key={p.productId} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-on-surface">
                          {p.productName}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px] border-outline-variant/40 text-on-surface-variant">
                            {p.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center font-bold">
                          {p.qtySold} {p.baseUnit}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatRupiah(p.totalRevenue)}
                        </td>
                        <td className="px-4 py-3 text-right text-red-500 font-medium">
                          {formatRupiah(p.totalHpp)}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-emerald-600">
                          {formatRupiah(p.grossProfit)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              p.marginPercentage >= 30
                                ? "bg-emerald-100 text-emerald-800"
                                : p.marginPercentage >= 15
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {p.marginPercentage}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: FAST-MOVING VS SLOW-MOVING DRUGS */}
      {/* ========================================================================= */}
      {activeTab === "movement" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fast Moving */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20 bg-emerald-50/40 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-bold text-emerald-900">
                  🔥 Obat Terlaris (Fast-Moving)
                </h3>
                <p className="text-[11px] text-emerald-700/80">
                  Perputaran stok tercepat, pastikan tidak kehabisan stok (stockout).
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-on-surface">
                <thead className="bg-surface-container-low text-on-surface-variant font-semibold uppercase text-[11px] border-b border-outline-variant/20">
                  <tr>
                    <th className="px-3 py-2.5">Nama Obat</th>
                    <th className="px-3 py-2.5 text-center">Terjual</th>
                    <th className="px-3 py-2.5 text-right">Total Omzet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {drugMovement?.fastMoving.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-3 py-2.5 font-semibold text-on-surface">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span>{item.productName}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center font-black text-emerald-600">
                        {item.totalQtySold} {item.baseUnit}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-on-surface">
                        {formatRupiah(item.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Slow Moving */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20 bg-amber-50/40 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  ⚠️ Obat Lambat Bergerak (Slow-Moving)
                </h3>
                <p className="text-[11px] text-amber-700/80">
                  Rendah transaksi, perhatikan tanggal kedaluwarsa & kurangi order baru.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-on-surface">
                <thead className="bg-surface-container-low text-on-surface-variant font-semibold uppercase text-[11px] border-b border-outline-variant/20">
                  <tr>
                    <th className="px-3 py-2.5">Nama Obat</th>
                    <th className="px-3 py-2.5 text-center">Terjual</th>
                    <th className="px-3 py-2.5 text-right">Total Omzet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {drugMovement?.slowMoving.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-3 py-2.5 font-semibold text-on-surface">
                        {item.productName}
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold text-on-surface-variant/60">
                        {item.totalQtySold} {item.baseUnit}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium text-on-surface">
                        {formatRupiah(item.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LAPORAN REGULASI RESMI SIPNAP KEMENKES RI */}
      {/* ========================================================================= */}
      {activeTab === "sipnap" && (
        <div className="space-y-4">
          {/* SIPNAP Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-on-surface">Bulan:</span>
                <select
                  value={sipnapMonth}
                  onChange={(e) => setSipnapMonth(parseInt(e.target.value, 10))}
                  className="border border-outline-variant/30 bg-surface-container-low rounded-xl px-2.5 py-1.5 font-semibold text-on-surface"
                >
                  {[
                    "Januari",
                    "Februari",
                    "Maret",
                    "April",
                    "Mei",
                    "Juni",
                    "Juli",
                    "Agustus",
                    "September",
                    "Oktober",
                    "November",
                    "Desember",
                  ].map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-on-surface">Tahun:</span>
                <select
                  value={sipnapYear}
                  onChange={(e) => setSipnapYear(parseInt(e.target.value, 10))}
                  className="border border-outline-variant/30 bg-surface-container-low rounded-xl px-2.5 py-1.5 font-semibold text-on-surface"
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-on-surface">Kategori:</span>
                <select
                  value={sipnapCategory}
                  onChange={(e: any) => setSipnapCategory(e.target.value)}
                  className="border border-outline-variant/30 bg-surface-container-low rounded-xl px-2.5 py-1.5 font-bold text-primary-container"
                >
                  <option value="Narkotika">🔴 Narkotika</option>
                  <option value="Psikotropika">🟣 Psikotropika</option>
                  <option value="ALL">Semua Golongan Khusus</option>
                </select>
              </div>
            </div>

            <Button
              onClick={exportSipnapCsv}
              className="bg-primary-container hover:bg-blue-700 text-white text-xs h-8 gap-1.5 shadow-sm rounded-xl"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Format SIPNAP (CSV Siap Upload)
            </Button>
          </div>

          {/* SIPNAP Official Table */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
            <div className="p-4 border-b border-outline-variant/20 bg-red-50/30">
              <h3 className="text-sm font-bold text-red-900">
                Laporan Bulanan SIPNAP Kemenkes RI — {sipnapReport?.period.monthName}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Format standar Permenkes No. 3/2015 untuk pelaporan resmi mutasi Narkotika & Psikotropika.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-on-surface">
                <thead className="bg-surface-container-low text-on-surface-variant uppercase font-semibold text-[11px] border-b border-outline-variant/20">
                  <tr>
                    <th className="px-3 py-3 text-center w-10">No</th>
                    <th className="px-4 py-3">Nama Obat & Zat Aktif</th>
                    <th className="px-3 py-3">Kategori</th>
                    <th className="px-3 py-3 text-center">Satuan</th>
                    <th className="px-3 py-3 text-center bg-surface-container-low/80">Stok Awal</th>
                    <th className="px-3 py-3 text-center text-emerald-600 bg-emerald-50/40">Pemasukan (PBF)</th>
                    <th className="px-3 py-3 text-center text-red-600 bg-red-50/40">Pengeluaran (Resep)</th>
                    <th className="px-3 py-3 text-center font-black bg-surface-container-low/80">Stok Akhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {isSipnapLoading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-container mx-auto" />
                      </td>
                    </tr>
                  ) : sipnapReport?.items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-on-surface-variant">
                        Tidak ada obat golongan {sipnapCategory} terdaftar pada sistem.
                      </td>
                    </tr>
                  ) : (
                    sipnapReport?.items.map((row, idx) => (
                      <tr key={row.productId} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-3 py-3 text-center font-bold text-on-surface">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-on-surface">
                            {row.productName}
                          </div>
                          {row.genericName && (
                            <div className="text-[10px] text-on-surface-variant/70 italic">
                              {row.genericName}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              row.category === "Narkotika"
                                ? "bg-red-100 text-red-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {row.category}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-on-surface">{row.baseUnit}</td>
                        <td className="px-3 py-3 text-center font-bold bg-surface-container-low/40 text-on-surface">
                          {row.openingStock}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-emerald-600 bg-emerald-50/20">
                          +{row.totalIncoming}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-red-600 bg-red-50/20">
                          -{row.totalOutgoing}
                        </td>
                        <td className="px-3 py-3 text-center font-black text-on-surface bg-surface-container-low/40">
                          {row.closingStock}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
