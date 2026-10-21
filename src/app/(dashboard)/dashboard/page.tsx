"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, activeOutlet } = useAuth();
  const [period, setPeriod] = useState<"today" | "7d" | "30d">("7d");

  const isCashier = user?.role === "cashier";

  if (isCashier) {
    return <CashierDashboardView user={user} activeOutlet={activeOutlet} />;
  }

  return <OwnerDashboardView user={user} activeOutlet={activeOutlet} period={period} setPeriod={setPeriod} />;
}

// ==========================================
// 1. CASHIER DASHBOARD (GOOGLE STITCH LAYOUT)
// ==========================================
function CashierDashboardView({ user, activeOutlet }: { user: any; activeOutlet: any }) {
  const [isClosingShift, setIsClosingShift] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Shift Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Shift Aktif • Shift Pagi
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              Terminal: POS-01 • {activeOutlet?.name || "Apotek Sehat"}
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-on-surface">
            Kasir: {user?.fullName || "Siti Rahma"}
          </h2>

          <div className="flex flex-wrap items-center gap-6 pt-1 text-xs text-on-surface-variant">
            <div>
              Modal Awal: <strong className="text-on-surface font-semibold">Rp 500.000</strong>
            </div>
            <div className="h-3 w-px bg-outline-variant/40" />
            <div>
              Total Transaksi Sesi Ini: <strong className="text-primary-container font-semibold">42 Transaksi</strong>
            </div>
            <div className="h-3 w-px bg-outline-variant/40" />
            <div>
              Penerimaan Kas: <strong className="text-emerald-600 font-semibold">Rp 3.840.500</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsClosingShift(true)}
            className="text-xs h-10 border-outline-variant/50 text-on-surface hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[18px] mr-1.5">lock_clock</span>
            Tutup Shift (F4)
          </Button>

          <Link href="/pos">
            <Button className="bg-primary-container hover:bg-blue-700 text-white text-xs h-10 px-5 shadow-sm font-semibold">
              <span className="material-symbols-outlined text-[18px] mr-1.5">point_of_sale</span>
              Buka Kasir / Mulai POS (F1)
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Main Action Cards (Stitch Spec) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Buka Kasir */}
        <Link href="/pos" className="group">
          <div className="h-full bg-surface-container-lowest border border-outline-variant/30 hover:border-primary-container/60 rounded-2xl p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary-container text-white flex items-center justify-center shadow-md shadow-blue-500/20 mb-4 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[26px]">point_of_sale</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-base text-on-surface group-hover:text-primary-container transition-colors">
                  Buka Kasir / POS
                </h3>
                <span className="px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-mono text-xs font-semibold">
                  F1
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Layani transaksi penjualan obat resep dan obat bebas. Scan barcode SKU atau cari nama obat dengan cepat.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs font-semibold text-primary-container">
              <span>Masuk Terminal Kasir</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </div>
        </Link>

        {/* Card 2: Riwayat Transaksi Shift */}
        <Link href="/transactions" className="group">
          <div className="h-full bg-surface-container-lowest border border-outline-variant/30 hover:border-[#006a61]/50 rounded-2xl p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#86f2e4]/30 text-[#006a61] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[26px]">receipt_long</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-base text-on-surface group-hover:text-[#006a61] transition-colors">
                  Riwayat Shift Ini
                </h3>
                <span className="px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-mono text-xs font-semibold">
                  F2
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Daftar 42 transaksi berhasil pada shift aktif ini. Cetak ulang struk kasir thermal, cek nota, atau retur item.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs font-semibold text-[#006a61]">
              <span>Lihat Semua Struk Shift</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </div>
          </div>
        </Link>

        {/* Card 3: Rekonsiliasi Kas */}
        <div
          onClick={() => setIsClosingShift(true)}
          className="group cursor-pointer h-full bg-surface-container-lowest border border-outline-variant/30 hover:border-amber-400 rounded-2xl p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[26px]">account_balance_wallet</span>
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base text-on-surface group-hover:text-amber-800 transition-colors">
                Hitung Kas &amp; Tutup
              </h3>
              <span className="px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant font-mono text-xs font-semibold">
                F4
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Rekonsiliasi uang fisik di laci kasir (drawer) sebelum serah terima ke kasir shift berikutnya.
            </p>
          </div>
          <div className="pt-4 mt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs font-semibold text-amber-800">
            <span>Buka Form Serah Terima</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown Pill Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] text-on-surface-variant font-medium">Tunai / Uang Fisik</div>
          <div className="text-lg font-bold text-on-surface mt-1">Rp 2.450.000</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">28 Transaksi</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] text-on-surface-variant font-medium">QRIS Dinamis</div>
          <div className="text-lg font-bold text-on-surface mt-1">Rp 1.140.500</div>
          <div className="text-[10px] text-primary-container font-semibold mt-0.5">11 Transaksi</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] text-on-surface-variant font-medium">EDC Debit / Kredit</div>
          <div className="text-lg font-bold text-on-surface mt-1">Rp 250.000</div>
          <div className="text-[10px] text-purple-600 font-semibold mt-0.5">3 Transaksi</div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-4 shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
          <div className="text-[11px] text-on-surface-variant font-medium">Resep Dokter Dilayani</div>
          <div className="text-lg font-bold text-on-surface mt-1">14 Resep</div>
          <div className="text-[10px] text-teal-600 font-semibold mt-0.5">100% Selesai Diracik</div>
        </div>
      </div>

      {/* Tabel Transaksi Terakhir di Sesi Ini */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-on-surface">Transaksi Terakhir Shift Ini</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Pantau nota kasir secara live real-time
            </p>
          </div>
          <Link href="/transactions">
            <Button variant="ghost" size="sm" className="text-xs text-primary-container hover:text-blue-700">
              Lihat Seluruh Riwayat
              <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container-low text-on-surface-variant font-semibold uppercase text-[10px] tracking-wider border-b border-outline-variant/20">
              <tr>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">No. Nota</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Tipe</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-3 px-4 text-on-surface-variant">14:23 WIB</td>
                <td className="py-3 px-4 font-mono font-medium">TRX-20261019-0042</td>
                <td className="py-3 px-4 font-medium">Ibu Rahmawati</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold">
                    Resep Dokter
                  </span>
                </td>
                <td className="py-3 px-4">QRIS (Gopay)</td>
                <td className="py-3 px-4 font-bold text-right">Rp 125.000</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                    Lunas
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-primary-container hover:underline text-xs font-semibold inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    Struk
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-3 px-4 text-on-surface-variant">14:15 WIB</td>
                <td className="py-3 px-4 font-mono font-medium">TRX-20261019-0041</td>
                <td className="py-3 px-4 font-medium">Bpk. Hendra Gunawan</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-surface-container-low text-on-surface text-[10px] font-semibold">
                    Obat Bebas (OTC)
                  </span>
                </td>
                <td className="py-3 px-4">Tunai / Cash</td>
                <td className="py-3 px-4 font-bold text-right">Rp 48.500</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                    Lunas
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-primary-container hover:underline text-xs font-semibold inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    Struk
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-3 px-4 text-on-surface-variant">13:58 WIB</td>
                <td className="py-3 px-4 font-mono font-medium">TRX-20261019-0040</td>
                <td className="py-3 px-4 font-medium">Umum / Tanpa Nama</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-surface-container-low text-on-surface text-[10px] font-semibold">
                    Alkes / Sanitasi
                  </span>
                </td>
                <td className="py-3 px-4">QRIS (BCA)</td>
                <td className="py-3 px-4 font-bold text-right">Rp 32.000</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                    Lunas
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-primary-container hover:underline text-xs font-semibold inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    Struk
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Keyboard Shortcut Helper Bar (Stitch Spec) */}
      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 font-semibold text-on-surface">
          <span className="material-symbols-outlined text-[18px] text-primary-container">keyboard</span>
          <span>Shortcut Keyboard Kasir:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-lowest border border-outline-variant/40 font-mono text-[11px]">
            <kbd className="font-bold text-primary-container">F1</kbd> Transaksi Baru
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-lowest border border-outline-variant/40 font-mono text-[11px]">
            <kbd className="font-bold text-primary-container">F2</kbd> Cari Obat
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-lowest border border-outline-variant/40 font-mono text-[11px]">
            <kbd className="font-bold text-primary-container">F4</kbd> Pelanggan
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-lowest border border-outline-variant/40 font-mono text-[11px]">
            <kbd className="font-bold text-primary-container">F8</kbd> Bayar Tunai
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-lowest border border-outline-variant/40 font-mono text-[11px]">
            <kbd className="font-bold text-primary-container">F9</kbd> QRIS
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-container-lowest border border-outline-variant/40 font-mono text-[11px]">
            <kbd className="font-bold text-red-600">Esc</kbd> Batalkan
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. OWNER OVERVIEW DASHBOARD (STITCH LAYOUT)
// ==========================================
function OwnerDashboardView({
  user,
  activeOutlet,
  period,
  setPeriod,
}: {
  user: any;
  activeOutlet: any;
  period: "today" | "7d" | "30d";
  setPeriod: (val: "today" | "7d" | "30d") => void;
}) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Filter & Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">
            Ikhtisar Performa Apotek 📊
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Pantau arus kas omzet, margin kotor, perputaran obat terlaris, dan radar FEFO seluruh cabang.
          </p>
        </div>

        {/* Period Filter Tabs */}
        <div className="flex items-center p-1 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-medium">
          <button
            onClick={() => setPeriod("today")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              period === "today"
                ? "bg-surface-container-lowest text-primary-container shadow-xs font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setPeriod("7d")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              period === "7d"
                ? "bg-surface-container-lowest text-primary-container shadow-xs font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => setPeriod("30d")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              period === "30d"
                ? "bg-surface-container-lowest text-primary-container shadow-xs font-bold"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* KPI 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Omzet Bersih */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Omzet Penjualan
            </span>
            <div className="w-9 h-9 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-on-surface">Rp 28.450.000</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-semibold">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+12.5%</span>
              <span className="text-on-surface-variant font-normal">vs periode lalu</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Estimasi Laba Kotor */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Estimasi Laba Kotor
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#86f2e4]/30 text-[#006a61] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">savings</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-on-surface">Rp 8.820.000</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#006a61] font-semibold">
              <span className="px-1.5 py-0.2 rounded bg-[#86f2e4]/40 text-[#006a61]">Margin 31%</span>
              <span className="text-on-surface-variant font-normal">Sehat</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Total Transaksi & Basket Size */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Total Transaksi
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">receipt</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-on-surface">312 Nota</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-on-surface-variant">
              <span>Avg Keranjang:</span>
              <strong className="text-on-surface font-semibold">Rp 91.185</strong>
            </div>
          </div>
        </div>

        {/* KPI 4: Stok Kritis & Kadaluarsa */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Radar Kritis (FEFO)
            </span>
            <div className="w-9 h-9 rounded-xl bg-error-container text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-[#ba1a1a]">8 SKU Kritis</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[#ba1a1a] font-medium">
              <span>3 Batch &lt; 60 hari expired</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Row: Chart & Payment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Visual (2 Cols) */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[20px]">show_chart</span>
                Tren Penjualan 7 Hari Terakhir
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Total omzet harian dari kasir dan pesanan resep dokter
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Puncak: Sabtu (Rp 5.2 Jt)
            </span>
          </div>

          {/* Clean Responsive SVG Chart */}
          <div className="h-56 w-full pt-4 flex items-end justify-between gap-3 px-2 border-b border-outline-variant/30 pb-2">
            {[
              { day: "Sen", val: 3.4, height: "65%" },
              { day: "Sel", val: 3.8, height: "72%" },
              { day: "Rab", val: 4.1, height: "78%" },
              { day: "Kam", val: 3.6, height: "68%" },
              { day: "Jum", val: 4.8, height: "90%" },
              { day: "Sab", val: 5.2, height: "100%", active: true },
              { day: "Min", val: 3.55, height: "67%" },
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-mono text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                  Rp {item.val}M
                </div>
                <div
                  style={{ height: item.height }}
                  className={`w-full max-w-[42px] rounded-t-lg transition-all ${
                    item.active
                      ? "bg-primary-container shadow-md shadow-blue-500/30"
                      : "bg-surface-container-high hover:bg-primary-container/70"
                  }`}
                />
                <span className="text-xs font-semibold text-on-surface-variant">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
            <span>Rata-rata Penjualan: <strong>Rp 4.064.000 / hari</strong></span>
            <Link href="/reports" className="text-primary-container hover:underline font-semibold flex items-center gap-1">
              Lihat Detail Laporan Keuangan
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Payment Methods & AI Assistant (1 Col) */}
        <div className="space-y-6">
          {/* Payment Proportion */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.04)] space-y-4">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006a61] text-[20px]">donut_large</span>
              Kanal Pembayaran
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-on-surface">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-container" /> QRIS Dinamis
                  </span>
                  <span>45% (Rp 12.8M)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-on-surface">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Tunai / Cash
                  </span>
                  <span>35% (Rp 9.9M)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "35%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span className="flex items-center gap-1.5 text-on-surface">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> EDC / Transfer Bank
                  </span>
                  <span>20% (Rp 5.7M)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: "20%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Advisor Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/60 rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.02)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary-container text-[18px]">smart_toy</span>
                Tanya AI Assistant
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-primary-container text-[10px] font-bold">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              &quot;Stok Paracetamol Sirup diprediksi habis dalam 3 hari ke depan berdasarkan lonjakan flu musim ini. Disarankan buat PO ke PBF Kalbe Farma.&quot;
            </p>
            <Link href="/ai-assistant" className="block">
              <Button className="w-full bg-primary-container hover:bg-blue-700 text-white text-xs h-9 font-semibold">
                Buka Konsultasi AI
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Selling Medicines & FEFO Expiry Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Best Selling Medicines */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[20px]">award_star</span>
              Obat Terlaris (Pareto Top 5)
            </h3>
            <span className="text-xs text-on-surface-variant font-medium">Berdasarkan Volume Nota</span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { name: "Paracetamol 500mg (Strip)", sold: "340 Strip", revenue: "Rp 1.700.000", rank: 1 },
              { name: "Amoxicillin 500mg Kapsul", sold: "210 Strip", revenue: "Rp 1.680.000", rank: 2 },
              { name: "Vitamin C 500mg IPI", sold: "185 Botol", revenue: "Rp 1.295.000", rank: 3 },
              { name: "Antasida Doen Tablet Kunyah", sold: "160 Strip", revenue: "Rp 800.000", rank: 4 },
              { name: "Cetirizine 10mg Box", sold: "142 Strip", revenue: "Rp 710.000", rank: 5 },
            ].map((item) => (
              <div
                key={item.rank}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center font-bold text-xs">
                    {item.rank}
                  </div>
                  <div>
                    <div className="font-semibold text-on-surface">{item.name}</div>
                    <div className="text-[11px] text-on-surface-variant">{item.sold} terjual</div>
                  </div>
                </div>
                <span className="font-bold text-on-surface">{item.revenue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FEFO Expiry Radar Critical */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">farsight_digital</span>
              Radar Kadaluarsa FEFO Terdekat
            </h3>
            <Link href="/inventory/expiry-radar">
              <Button variant="ghost" size="sm" className="text-xs text-primary-container hover:text-blue-700">
                Lihat Radar Lengkap
                <span className="material-symbols-outlined text-[16px] ml-1">arrow_forward</span>
              </Button>
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface">Amoxicillin 500mg</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[10px]">
                    Exp &lt; 30 Hari
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant mt-1">
                  Batch: <strong>AMX-2024-09</strong> • Exp: <span className="text-red-600 font-semibold">15 Nov 2026</span> • Sisa: 4 Box
                </div>
              </div>
              <Button size="sm" variant="outline" className="text-xs h-8 border-red-300 text-red-700 hover:bg-red-100">
                Opsi Retur PBF
              </Button>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface">Paracetamol Sirup 60ml</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                    Exp &lt; 90 Hari
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant mt-1">
                  Batch: <strong>PCT-SYR-03</strong> • Exp: <span className="text-amber-700 font-semibold">28 Feb 2027</span> • Sisa: 12 Botol
                </div>
              </div>
              <Button size="sm" variant="outline" className="text-xs h-8 border-amber-300 text-amber-800 hover:bg-amber-100">
                Promokan Kasir
              </Button>
            </div>

            <div className="p-3.5 rounded-xl border border-outline-variant/30 bg-surface-container-low/40 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface">Omeprazole 20mg</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-semibold text-[10px]">
                    Exp &lt; 180 Hari
                  </span>
                </div>
                <div className="text-[11px] text-on-surface-variant mt-1">
                  Batch: <strong>OMZ-221A</strong> • Exp: <span>10 Mar 2027</span> • Sisa: 8 Strip
                </div>
              </div>
              <Button size="sm" variant="outline" className="text-xs h-8 border-outline-variant/60 text-on-surface hover:bg-surface-container-low">
                Detail Batch
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
