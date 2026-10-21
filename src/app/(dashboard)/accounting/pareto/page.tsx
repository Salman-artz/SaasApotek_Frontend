"use client";

import { useState, useEffect } from "react";
import {
  PieChart,
  Search,
  Calendar,
  RefreshCw,
  Award,
  Layers,
  Sparkles,
  TrendingUp,
  Package,
  CheckCircle2,
  Info,
  Filter,
} from "lucide-react";
import { ApiClient } from "@/lib/api";

interface ParetoProduct {
  rank: number;
  productId: string;
  productName: string;
  category: string;
  baseUnit: string;
  totalQuantitySold: number;
  totalRevenue: number;
  revenueSharePercent: number;
  cumulativePercent: number;
  abcClass: "A" | "B" | "C";
}

interface ClassSummary {
  count: number;
  percentageOfSku: number;
  revenue: number;
  revenuePercent: number;
  strategy: string;
}

interface ParetoData {
  totalSystemRevenue: number;
  totalProductsSold: number;
  summary: {
    classA: ClassSummary;
    classB: ClassSummary;
    classC: ClassSummary;
  };
  products: ParetoProduct[];
}

export default function ParetoAnalysisPage() {
  const [data, setData] = useState<ParetoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState<"ALL" | "A" | "B" | "C">("ALL");

  const [dateRangeType, setDateRangeType] = useState<"today" | "7days" | "thisMonth" | "thisYear">("thisMonth");
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

  const fetchPareto = async () => {
    try {
      setLoading(true);
      let query = "";
      if (startDate && endDate) {
        query = `?startDate=${startDate}&endDate=${endDate}`;
      }
      const res: any = await ApiClient.get(`/accounting/pareto-abc${query}`);
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error("Gagal memuat Analisis Pareto:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchPareto();
    }
  }, [startDate, endDate]);

  const handleQuickDate = (type: "today" | "7days" | "thisMonth" | "thisYear") => {
    setDateRangeType(type);
    calculateDates(type);
  };

  const filteredProducts = (data?.products || []).filter((p) => {
    const matchesSearch =
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesClass = selectedClass === "ALL" || p.abcClass === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
              <PieChart className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-on-surface">Analisis Pareto / ABC 80-20</h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Klasifikasi produk berdasarkan kontribusi omset untuk efisiensi modal kerja dan pengadaan apotek
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
          <button
            onClick={() => handleQuickDate("today")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              dateRangeType === "today" ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => handleQuickDate("7days")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              dateRangeType === "7days" ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => handleQuickDate("thisMonth")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              dateRangeType === "thisMonth" ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => handleQuickDate("thisYear")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              dateRangeType === "thisYear" ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Tahun Ini
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-on-surface-variant">
          <RefreshCw className="h-10 w-10 animate-spin mx-auto text-primary-container mb-3" />
          <p className="text-xs font-medium">Mengkalkulasi klasifikasi Pareto ABC...</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* ABC 3 Class Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* KELAS A */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-5 rounded-2xl border border-emerald-700 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Kelas A (Pareto 80%)
                </span>
                <Award className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black">
                  {data.summary.classA.revenuePercent}%
                  <span className="text-xs font-normal text-emerald-200 ml-1.5">dari total omset</span>
                </div>
                <div className="text-xs text-emerald-200/90 mt-1">
                  Rp {Number(data.summary.classA.revenue).toLocaleString("id-ID")}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-800 text-[11px] text-emerald-100 flex items-center justify-between">
                <span>{data.summary.classA.count} SKU ({data.summary.classA.percentageOfSku}% produk)</span>
                <span className="text-[10px] font-semibold text-emerald-300">Fast Moving / Kunci Omset</span>
              </div>
            </div>

            {/* KELAS B */}
            <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-5 rounded-2xl border border-blue-700 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Kelas B (Moderate 15%)
                </span>
                <Layers className="h-5 w-5 text-blue-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black">
                  {data.summary.classB.revenuePercent}%
                  <span className="text-xs font-normal text-blue-200 ml-1.5">dari total omset</span>
                </div>
                <div className="text-xs text-blue-200/90 mt-1">
                  Rp {Number(data.summary.classB.revenue).toLocaleString("id-ID")}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-800 text-[11px] text-blue-100 flex items-center justify-between">
                <span>{data.summary.classB.count} SKU ({data.summary.classB.percentageOfSku}% produk)</span>
                <span className="text-[10px] font-semibold text-blue-300">Moderate Moving</span>
              </div>
            </div>

            {/* KELAS C */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5 rounded-2xl border border-slate-700 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Kelas C (Slow Moving 5%)
                </span>
                <Package className="h-5 w-5 text-amber-400" />
              </div>
              <div className="mt-3">
                <div className="text-2xl font-black">
                  {data.summary.classC.revenuePercent}%
                  <span className="text-xs font-normal text-slate-300 ml-1.5">dari total omset</span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Rp {Number(data.summary.classC.revenue).toLocaleString("id-ID")}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700 text-[11px] text-slate-300 flex items-center justify-between">
                <span>{data.summary.classC.count} SKU ({data.summary.classC.percentageOfSku}% produk)</span>
                <span className="text-[10px] font-semibold text-amber-300">Slow Moving / Low Impact</span>
              </div>
            </div>
          </div>

          {/* Strategy Recommendations Box */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] space-y-4">
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary-container" />
              Panduan Tata Kelola Stok Farmasi Berdasarkan Kelas Pareto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" />
                  Strategi Kelas A
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  {data.summary.classA.strategy}
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  Strategi Kelas B
                </div>
                <p className="text-blue-800 text-[11px] leading-relaxed">
                  {data.summary.classB.strategy}
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-600" />
                  Strategi Kelas C
                </div>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  {data.summary.classC.strategy}
                </p>
              </div>
            </div>
          </div>

          {/* Pareto Product Breakdown Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            {/* Table Controls */}
            <div className="p-4 border-b border-outline-variant/20 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-80">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant/60" />
                  <input
                    type="text"
                    placeholder="Cari obat atau kategori..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/30 text-on-surface rounded-xl text-xs focus:ring-2 focus:ring-primary-container focus:outline-none"
                  />
                </div>
              </div>

              {/* Class filter buttons */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                <span className="text-xs text-on-surface-variant font-semibold mr-1 flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5" /> Filter:
                </span>
                <button
                  onClick={() => setSelectedClass("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedClass === "ALL"
                      ? "bg-primary-container text-white"
                      : "bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  Semua ({data.products.length})
                </button>
                <button
                  onClick={() => setSelectedClass("A")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedClass === "A"
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  Kelas A ({data.summary.classA.count})
                </button>
                <button
                  onClick={() => setSelectedClass("B")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedClass === "B"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  Kelas B ({data.summary.classB.count})
                </button>
                <button
                  onClick={() => setSelectedClass("C")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedClass === "C"
                      ? "bg-amber-600 text-white"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  Kelas C ({data.summary.classC.count})
                </button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Package className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">Tidak ada produk yang cocok</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider border-b border-outline-variant/20">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">Rank</th>
                      <th className="px-4 py-3">Nama Obat</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3 text-center">Jumlah Terjual</th>
                      <th className="px-4 py-3 text-right">Total Omset (Rp)</th>
                      <th className="px-4 py-3 text-center">% Kontribusi</th>
                      <th className="px-4 py-3 text-center">% Kumulatif</th>
                      <th className="px-4 py-3 text-center">Klasifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15 text-xs text-on-surface">
                    {filteredProducts.map((p) => (
                      <tr key={p.productId} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-4 py-3 text-center font-bold text-on-surface-variant font-mono">
                          #{p.rank}
                        </td>
                        <td className="px-4 py-3 font-semibold text-on-surface">
                          {p.productName}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          <span className="px-2 py-0.5 bg-surface-container-low border border-outline-variant/30 rounded text-[11px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-on-surface">
                          {p.totalQuantitySold} {p.baseUnit}
                        </td>
                        <td className="px-4 py-3 text-right font-bold font-mono text-on-surface">
                          Rp {Number(p.totalRevenue).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-medium text-on-surface-variant">
                          {p.revenueSharePercent}%
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold text-on-surface">
                          {p.cumulativePercent}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              p.abcClass === "A"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : p.abcClass === "B"
                                ? "bg-blue-50 text-blue-800 border border-blue-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            Kelas {p.abcClass}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
