"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingDown,
  AlertTriangle,
  Package,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
  Building2,
  CheckCircle2,
  Boxes,
} from "lucide-react";
import { ApiClient } from "@/lib/api";

interface LowStockItem {
  name: string;
  category: string;
  minStock: number;
  currentStock: number;
  isLow: boolean;
}

interface InsightsData {
  totalAnalyzed: number;
  lowStockCount: number;
  lowStockItems: LowStockItem[];
  aiRecommendation: string;
}

export default function AiInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InsightsData | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res: any = await ApiClient.get("/ai/restock-insights");
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error("Gagal memuat AI insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center text-primary-container shadow-inner">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-on-surface">AI Smart Restock & Procurement Advisor</h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
            Sistem rekomendasi pengadaan cerdas berbasis Gemini AI: Mencegah stockout obat esensial dan mengoptimalkan perputaran modal kerja apotek.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Perbarui Analisis AI
        </button>
      </div>

      {loading ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-16 text-center shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <RefreshCw className="h-10 w-10 text-primary-container animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-bold text-on-surface">Menghitung Proyeksi Stok & Konsumsi Obat</h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Gemini AI sedang menganalisis batas minimum stok dan menyusun rekomendasi order ke PBF...
          </p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Total SKU Dianalisis
                </span>
                <span className="text-2xl font-black text-on-surface mt-1 block">
                  {data.totalAnalyzed}
                </span>
                <span className="text-[11px] text-on-surface-variant mt-0.5 block">Katalog Obat Aktif</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Boxes className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Stok Kritis / Di Bawah Min
                </span>
                <span className="text-2xl font-black text-red-600 mt-1 block">
                  {data.lowStockCount}
                </span>
                <span className="text-[11px] text-red-500 font-medium mt-0.5 block">
                  Perlu Segera Restock PBF
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">
                  Aksi Restock Cepat
                </span>
                <Link
                  href="/purchases"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-container hover:underline mt-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Buat Surat Pesanan (SP)
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <span className="text-[11px] text-on-surface-variant mt-1 block">Surat Pesanan BPOM</span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* AI Strategic Recommendation Box */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary-container" />
              <h2 className="text-sm font-bold tracking-wide uppercase text-on-surface">
                Rekomendasi Strategis AI Konsultan Farmasi
              </h2>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 text-xs text-on-surface leading-relaxed whitespace-pre-wrap font-sans">
              {data.aiRecommendation}
            </div>
          </div>

          {/* Low Stock Items Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/60">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Daftar Obat Perlu Restock ({data.lowStockItems.length})
                </h3>
              </div>
              <Link
                href="/purchases"
                className="px-3 py-1.5 bg-primary-container hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                Order ke PBF
              </Link>
            </div>

            {data.lowStockItems.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-on-surface">Semua Stok Obat Aman</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Tidak ada obat yang berada di bawah batas minimum stok saat ini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low text-on-surface-variant font-semibold text-[11px] uppercase tracking-wider border-b border-outline-variant/20">
                    <tr>
                      <th className="px-4 py-3">Nama Obat</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3 text-center">Batas Minimum</th>
                      <th className="px-4 py-3 text-center">Stok Saat Ini</th>
                      <th className="px-4 py-3 text-center">Status Defisit</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15 text-xs text-on-surface">
                    {data.lowStockItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-on-surface flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 text-on-surface-variant" />
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          <span className="px-2 py-0.5 bg-surface-container-low border border-outline-variant/30 rounded text-[11px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-on-surface-variant font-mono">
                          {item.minStock}
                        </td>
                        <td className="px-4 py-3 text-center font-bold font-mono text-red-600">
                          {item.currentStock}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 bg-red-50 border border-red-200 text-red-700 font-bold rounded text-[10px] uppercase">
                            Defisit {Math.max(0, item.minStock - item.currentStock)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href="/purchases"
                            className="inline-flex items-center gap-1 text-primary-container hover:underline font-semibold text-[11px]"
                          >
                            Order <ArrowRight className="h-3 w-3" />
                          </Link>
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
