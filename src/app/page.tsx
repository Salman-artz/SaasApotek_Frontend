"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Clock,
  Building2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  LogIn,
  Send,
  CreditCard,
  ShoppingBag,
  DollarSign,
  Activity,
  Users,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  Lock,
  Star,
  Menu,
  X,
  Store,
  Layers,
  FileText,
} from "lucide-react";

type PlanBillingCycle = "monthly" | "yearly";
type DemoTab = "pos" | "fefo" | "ai" | "satusehat" | "reports";

export default function PromotionalSaaSDashboardPage() {
  const [billingCycle, setBillingCycle] = useState<PlanBillingCycle>("monthly");
  const [activeDemoTab, setActiveDemoTab] = useState<DemoTab>("pos");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const discountMultiplier = billingCycle === "yearly" ? 0.8 : 1;

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-sans selection:bg-primary-container selection:text-white">
      {/* ============================================================ */}
      {/* 1. TOP ANNOUNCEMENT BAR (CLEAN, NO CAPSULES)                 */}
      {/* ============================================================ */}
      <div className="bg-inverse-surface text-inverse-on-surface text-xs px-4 py-2.5 border-b border-white/5 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="bg-primary-container text-white font-bold text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wider">
              Baru
            </span>
            <span className="font-medium text-xs text-inverse-on-surface/90">
              Uji Coba Gratis 14 Hari Tanpa Kartu Kredit • Integrasi SatuSehat Kemenkes (HL7 FHIR)
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-[11px] text-[#89f5e7] font-mono hidden md:inline">
              Port 3002 (Web) • 3001 (API)
            </span>
            <Link
              href="/register"
              className="text-xs font-bold text-[#89f5e7] hover:underline flex items-center gap-1"
            >
              Daftar Sekarang <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. RESPONSIVE NAVIGATION HEADER                             */}
      {/* ============================================================ */}
      <header className="bg-surface-container-lowest/95 backdrop-blur-md border-b border-outline-variant/30 sticky top-0 z-40 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="Apotek SaaS"
              width={38}
              height={38}
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
              priority
            />
            <div>
              <div className="font-extrabold text-base tracking-tight flex items-center gap-1 leading-tight text-on-surface">
                Apotek <span className="text-primary-container">SaaS</span>
              </div>
              <p className="text-[10px] text-on-surface-variant font-medium hidden sm:block leading-none mt-0.5">
                Kelola Apotek, Lebih Mudah
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-on-surface-variant">
            <a href="#fitur" className="hover:text-primary-container transition-colors">
              Fitur Utama
            </a>
            <a href="#demo" className="hover:text-primary-container transition-colors">
              Demo Interaktif
            </a>
            <a href="#pricing" className="hover:text-primary-container transition-colors">
              Paket &amp; Harga
            </a>
            <a href="#faq" className="hover:text-primary-container transition-colors">
              FAQ
            </a>
          </nav>

          {/* Header Actions (Desktop + Mobile Toggle) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold text-on-surface hover:text-primary-container hover:bg-surface-container-low h-9 px-3"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Masuk
              </Button>
            </Link>
            <Link href="/register" className="hidden sm:inline-flex">
              <Button
                size="sm"
                className="text-xs bg-primary-container hover:bg-blue-700 text-white font-bold h-9 px-3.5 shadow-sm shadow-blue-500/20 rounded-lg"
              >
                Coba Gratis
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-on-surface hover:bg-surface-container-low transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-surface-container-lowest border-b border-outline-variant/30 px-4 py-4 space-y-3 shadow-lg">
            <div className="flex flex-col space-y-2 text-sm font-semibold text-on-surface">
              <a
                href="#fitur"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-surface-container-low"
              >
                Fitur Utama
              </a>
              <a
                href="#demo"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-surface-container-low"
              >
                Demo Interaktif
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-surface-container-low"
              >
                Paket &amp; Harga
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-surface-container-low"
              >
                FAQ
              </a>
            </div>
            <div className="pt-2 border-t border-outline-variant/20 flex flex-col gap-2">
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-primary-container hover:bg-blue-700 text-white font-bold text-xs h-10 rounded-lg">
                  Mulai Uji Coba Gratis 14 Hari
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ============================================================ */}
      {/* 3. HERO PROMOTIONAL SECTION                                  */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden pt-10 pb-14 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 bg-gradient-to-b from-surface-container-low/70 via-surface to-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          {/* Clean Top Kicker (No Capsule) */}
          <div className="text-xs font-bold uppercase tracking-wider text-primary-container">
            Sistem Manajemen Apotek Berbasis Cloud &amp; Terintegrasi Kemenkes
          </div>

          {/* Main Sales Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-on-surface tracking-tight max-w-4xl mx-auto leading-tight sm:leading-snug">
            Tingkatkan Omzet &amp; Hentikan Kerugian Obat Kedaluwarsa dengan{" "}
            <span className="text-primary-container">
              Apotek Digital SaaS
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xs sm:text-sm lg:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Software manajemen apotek &amp; kasir POS berbasis cloud modern. 
            Dilengkapi <strong>Radar FEFO anti-rugi</strong>, <strong>AI Restock Procurement</strong>, 
            dan <strong>Sinkronisasi SatuSehat Kemenkes</strong> otomatis.
          </p>

          {/* Responsive Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 max-w-md mx-auto sm:max-w-none">
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-bold bg-primary-container hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 rounded-lg">
                Mulai Berlangganan (Coba 14 Hari)
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#demo" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-11 sm:h-12 px-5 sm:px-6 text-xs sm:text-sm font-semibold border-outline-variant/60 text-on-surface hover:bg-surface-container-low rounded-lg"
              >
                Lihat Demo Dashboard
              </Button>
            </a>
          </div>

          {/* Trust Points */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-4 text-xs text-on-surface-variant font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Tanpa Biaya Pemasangan
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Standar BPOM &amp; Kemenkes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Migrasi Data Obat Gratis
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. KEY STATS IMPACT SECTION (RESPONSIVE GRID)                */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 z-10 relative w-full">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] p-4 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="p-2 sm:p-3 space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-primary-container">95%</div>
            <div className="text-xs font-bold text-on-surface">Menekan Obat Expired</div>
            <p className="text-[11px] text-on-surface-variant hidden sm:block">Peringatan dini FEFO otomatis 90 hari</p>
          </div>
          <div className="p-2 sm:p-3 space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-emerald-600">3 Detik</div>
            <div className="text-xs font-bold text-on-surface">Kecepatan Kasir POS</div>
            <p className="text-[11px] text-on-surface-variant hidden sm:block">Scan barcode SKU &amp; cetak struk</p>
          </div>
          <div className="p-2 sm:p-3 space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-[#006f66]">+35%</div>
            <div className="text-xs font-bold text-on-surface">Kenaikan Repeat Order</div>
            <p className="text-[11px] text-on-surface-variant hidden sm:block">Pengingat tebus obat WhatsApp</p>
          </div>
          <div className="p-2 sm:p-3 space-y-1">
            <div className="text-2xl sm:text-4xl font-black text-purple-600">100%</div>
            <div className="text-xs font-bold text-on-surface">Kepatuhan SatuSehat</div>
            <p className="text-[11px] text-on-surface-variant hidden sm:block">Standar HL7 FHIR Kemenkes RI</p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. INTERACTIVE LIVE DASHBOARD SHOWCASE (DEMO SECTION)        */}
      {/* ============================================================ */}
      <section id="demo" className="py-12 sm:py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-8 sm:mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-container">
            Demo Aplikasi Interaktif
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-on-surface tracking-tight">
            Lihat Bagaimana Apotek Digital Bekerja untuk Bisnis Anda
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Pilih modul di bawah untuk melihat preview antarmuka operasional apotek:
          </p>
        </div>

        {/* Demo Tabs: Horizontal Scrollable on Mobile */}
        <div className="flex overflow-x-auto pb-2 scrollbar-none sm:justify-center gap-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { id: "pos", label: "Point of Sale (Kasir)", icon: ShoppingBag },
            { id: "fefo", label: "Radar Stok FEFO", icon: Clock },
            { id: "ai", label: "AI Smart Restock", icon: Sparkles },
            { id: "satusehat", label: "Integrasi SatuSehat", icon: ShieldCheck },
            { id: "reports", label: "Laporan & Omzet", icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDemoTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDemoTab(tab.id as DemoTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? "bg-primary-container text-white shadow-sm shadow-blue-500/20"
                    : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-low"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Demo Preview Window Box */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-md overflow-hidden">
          {/* Top Window Bar */}
          <div className="bg-inverse-surface px-4 py-2.5 flex items-center justify-between text-xs text-inverse-on-surface border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="ml-2 font-mono text-[11px] text-inverse-on-surface/70 truncate">
                app.apotekdigital.id/{activeDemoTab}
              </span>
            </div>
            <Link href="/login" className="text-[#89f5e7] font-bold hover:underline text-[11px] shrink-0">
              Buka Kasir Asli &rarr;
            </Link>
          </div>

          {/* Demo Content */}
          <div className="p-4 sm:p-6 lg:p-8 bg-surface-container-low/30">
            {/* 1. POS Kasir Demo */}
            {activeDemoTab === "pos" && (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Left: Input Kasir & Table */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-lg border border-outline-variant/30 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-primary-container/10 text-primary-container flex items-center justify-center font-bold text-xs shrink-0">
                          F1
                        </div>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-on-surface">Scan Barcode / Cari Nama Obat</h4>
                          <p className="text-[11px] text-on-surface-variant">Mendukung scanner USB, Bluetooth, &amp; keyboard shortcut</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold border border-emerald-200 self-start sm:self-auto">
                        Shift Pagi (Aktif)
                      </span>
                    </div>

                    <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 overflow-x-auto shadow-2xs">
                      <table className="w-full text-left text-xs min-w-[460px]">
                        <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant/20">
                          <tr>
                            <th className="py-2 px-3">Nama Obat / SKU</th>
                            <th className="py-2 px-3">Batch &amp; Exp</th>
                            <th className="py-2 px-3 text-center">Qty</th>
                            <th className="py-2 px-3 text-right">Harga</th>
                            <th className="py-2 px-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-on-surface">
                              Amoxicillin 500mg Kap
                              <span className="block text-[10px] text-on-surface-variant font-normal">Obat Keras (Resep)</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-on-surface-variant">BCH-2024 / Mei 2027</td>
                            <td className="py-2.5 px-3 text-center font-bold">2 Strip</td>
                            <td className="py-2.5 px-3 text-right font-mono">Rp 8.000</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface">Rp 16.000</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-on-surface">
                              Paracetamol Syrup 60ml
                              <span className="block text-[10px] text-on-surface-variant font-normal">Obat Bebas (OTC)</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-[11px] text-on-surface-variant">BCH-PCT-91 / Okt 2027</td>
                            <td className="py-2.5 px-3 text-center font-bold">1 Botol</td>
                            <td className="py-2.5 px-3 text-right font-mono">Rp 12.500</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface">Rp 12.500</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right: Payment Card */}
                  <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-lg border border-outline-variant/30 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-on-surface border-b border-outline-variant/20 pb-2">
                        Ringkasan Pembayaran
                      </h4>
                      <div className="space-y-1.5 pt-2 text-xs">
                        <div className="flex justify-between text-on-surface-variant">
                          <span>Subtotal:</span>
                          <span className="font-mono font-semibold text-on-surface">Rp 28.500</span>
                        </div>
                        <div className="flex justify-between text-on-surface-variant">
                          <span>PPN Farmasi (11%):</span>
                          <span className="font-mono font-semibold text-on-surface">Rp 3.135</span>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base font-black text-on-surface pt-2 border-t border-outline-variant/20">
                          <span>Total Tagihan:</span>
                          <span className="font-mono text-primary-container">Rp 31.635</span>
                        </div>
                      </div>

                      <div className="pt-3 space-y-1.5">
                        <label className="text-[11px] font-bold text-on-surface block">Metode Bayar:</label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <button type="button" className="p-2 rounded bg-primary-container/10 border border-primary-container/30 font-bold text-primary-container text-center">
                            QRIS Dinamis
                          </button>
                          <button type="button" className="p-2 rounded bg-surface-container-low border border-outline-variant/30 font-semibold text-on-surface text-center">
                            Tunai (Cash)
                          </button>
                        </div>
                      </div>
                    </div>

                    <Link href="/login" className="pt-2">
                      <Button className="w-full bg-primary-container hover:bg-blue-700 text-white font-bold text-xs h-9 shadow-xs rounded-lg">
                        Selesaikan Nota &amp; Cetak Struk (F4)
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Radar FEFO Demo */}
            {activeDemoTab === "fefo" && (
              <div className="space-y-3">
                <div className="bg-amber-50/70 border border-amber-200 p-3 sm:p-4 rounded-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-amber-950">
                        Radar Kedaluwarsa First-Expired, First-Out (FEFO)
                      </h4>
                      <p className="text-[11px] text-amber-800">
                        Sistem otomatis menyortir batch yang harus dikeluarkan terlebih dahulu di kasir POS.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 shrink-0 hidden sm:inline-block">
                    Cegah Kerugian
                  </span>
                </div>

                <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 overflow-x-auto shadow-2xs">
                  <table className="w-full text-left text-xs min-w-[520px]">
                    <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant/20">
                      <tr>
                        <th className="py-2 px-3">Nama Obat</th>
                        <th className="py-2 px-3">No. Batch</th>
                        <th className="py-2 px-3">Tgl Expired</th>
                        <th className="py-2 px-3">Sisa Waktu</th>
                        <th className="py-2 px-3 text-center">Status Risiko</th>
                        <th className="py-2 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-on-surface">Cefixime 100mg Kapsul</td>
                        <td className="py-2.5 px-3 font-mono text-on-surface-variant">BCH-CFX-2024</td>
                        <td className="py-2.5 px-3 font-mono">15 Nov 2026</td>
                        <td className="py-2.5 px-3 font-bold text-red-600">20 Hari Lagi</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                            Kritis (&lt;30 Hari)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-[11px] font-semibold text-primary-container bg-primary-container/10 px-2 py-0.5 rounded">
                            Buat Retur PBF
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-on-surface">Ambroxol Syrup 60ml</td>
                        <td className="py-2.5 px-3 font-mono text-on-surface-variant">AMB-2024-09</td>
                        <td className="py-2.5 px-3 font-mono">28 Des 2026</td>
                        <td className="py-2.5 px-3 font-bold text-amber-600">63 Hari Lagi</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Waspada (&lt;90 Hari)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="text-[11px] font-semibold text-primary-container bg-primary-container/10 px-2 py-0.5 rounded">
                            Diskon Bundle
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. AI Restock Demo */}
            {activeDemoTab === "ai" && (
              <div className="space-y-3">
                <div className="bg-blue-50/70 p-3 sm:p-4 rounded-lg border border-blue-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-primary-container shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        Gemini AI Procurement: Tidak Ada Lagi Stok Kosong
                      </h4>
                      <p className="text-[11px] text-on-surface-variant">
                        Prediksi kuantitas pembelian obat berdasarkan tren konsumsi resep &amp; musim cuaca.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-primary-container/10 text-primary-container px-2 py-0.5 rounded border border-primary-container/20 shrink-0 hidden sm:inline-block">
                    AI Engine
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-lg border border-outline-variant/30 shadow-2xs space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-on-surface">Amoxicillin 500mg Kap</span>
                      <span className="font-bold text-emerald-700 font-mono">Rekomendasi: 50 Box</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      Laju penjualan 3.8 box/hari. Buffer stok tersisa 8 box. Jika tidak diorder dalam 2 hari,
                      apotek berisiko kehilangan potensi omzet Rp 1.200.000.
                    </p>
                    <div className="text-[10px] font-semibold text-on-surface-variant/70">Supplier: PBF Enseval</div>
                  </div>

                  <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-lg border border-outline-variant/30 shadow-2xs space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-on-surface">Screening Interaksi Obat AI</span>
                      <span className="font-bold text-purple-700 font-mono">Keamanan Pasien</span>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">
                      Mendeteksi interaksi berbahaya antar-obat resep secara instan saat kasir memasukkan item obat,
                      menghindari efek samping klinis merugikan bagi pasien.
                    </p>
                    <div className="text-[10px] font-semibold text-on-surface-variant/70">Standar Formularium Nasional</div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SatuSehat Demo */}
            {activeDemoTab === "satusehat" && (
              <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-lg border border-outline-variant/30 shadow-2xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-on-surface">
                      Kepatuhan Penuh Integrasi SatuSehat Kemenkes RI
                    </h4>
                    <p className="text-[11px] text-on-surface-variant">
                      Seluruh transaksi resep otomatis di-bundle ke format HL7 FHIR dan dikirim ke server Kemenkes.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                  <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
                    <span className="text-on-surface-variant block text-[10px]">Format Data</span>
                    <strong className="text-on-surface">HL7 FHIR Release 4</strong>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
                    <span className="text-on-surface-variant block text-[10px]">Status Integrasi</span>
                    <strong className="text-emerald-700 font-bold">100% Terverifikasi (Kemenkes)</strong>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
                    <span className="text-on-surface-variant block text-[10px]">Encounter &amp; Dispense</span>
                    <strong className="text-on-surface">Otomatis saat Kasir Cetak</strong>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Reports Demo */}
            {activeDemoTab === "reports" && (
              <div className="bg-surface-container-lowest p-4 sm:p-6 rounded-lg border border-outline-variant/30 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-on-surface">Laporan Keuangan &amp; Pajak Farmasi Otomatis</h4>
                    <p className="text-[11px] text-on-surface-variant">Laba kotor, HPP, margin per obat, hingga laporan SIPNAP narkotika &amp; psikotropika.</p>
                  </div>
                  <span className="text-[10px] font-semibold text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/30 self-start sm:self-auto">
                    Ekspor PDF / Excel
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center pt-1">
                  <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
                    <div className="text-[11px] text-on-surface-variant">Omzet Bulanan</div>
                    <div className="text-sm sm:text-base font-black text-primary-container">Rp 142.850.000</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="text-[11px] text-emerald-800">Laba Bersih</div>
                    <div className="text-sm sm:text-base font-black text-emerald-700">Rp 54.280.000</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-[11px] text-blue-800">Rata-rata Margin</div>
                    <div className="text-sm sm:text-base font-black text-blue-700">38.0%</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="text-[11px] text-purple-800">Laporan SIPNAP</div>
                    <div className="text-sm sm:text-base font-black text-purple-700">Siap Lapor BPOM</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. PRICING & SUBSCRIPTION PACKAGES (CLEAN & RESPONSIVE)     */}
      {/* ============================================================ */}
      <section id="pricing" className="py-12 sm:py-16 lg:py-20 bg-surface-container-low/50 border-t border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-container">
              Pilihan Paket Langganan
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
              Investasi Terjangkau untuk Bisnis Apotek yang Berkelanjutan
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Pilih paket yang sesuai dengan skala apotek Anda. Tanpa biaya tersembunyi, upgrade atau batalkan kapan saja.
            </p>

            {/* Billing Cycle Clean Toggle */}
            <div className="pt-3 flex items-center justify-center gap-2">
              <div className="bg-surface-container-lowest p-1 rounded-lg border border-outline-variant/30 inline-flex items-center text-xs font-bold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    billingCycle === "monthly"
                      ? "bg-primary-container text-white shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Tagihan Bulanan
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    billingCycle === "yearly"
                      ? "bg-primary-container text-white shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  Tagihan Tahunan
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2 rounded font-bold">
                    -20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid (Responsive: 1 col mobile, 2 col tablet, 3 col desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {/* 1. Paket Starter */}
            <Card className="border-outline-variant/30 rounded-xl flex flex-col justify-between shadow-xs hover:border-outline-variant/60 transition-all bg-surface-container-lowest">
              <CardHeader className="p-5 sm:p-6 pb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-on-surface bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/30">
                    Starter
                  </span>
                  <span className="text-xs text-on-surface-variant">1 Outlet</span>
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-on-surface">Apotek Mandiri</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Solusi ideal untuk apotek kecil independen yang ingin merapikan kasir dan pencatatan stok.
                </CardDescription>

                <div className="pt-3">
                  <span className="text-2xl sm:text-3xl font-black text-on-surface">
                    Rp {(199000 * discountMultiplier).toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium"> / bulan</span>
                  {billingCycle === "yearly" && (
                    <span className="block text-[11px] text-emerald-600 font-semibold mt-0.5">
                      Ditagih tahunan (Rp {(199000 * 12 * 0.8).toLocaleString("id-ID")}/thn)
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 pt-0 space-y-3 flex-1">
                <div className="border-t border-outline-variant/20 pt-3 space-y-2 text-xs text-on-surface">
                  <div className="font-bold text-on-surface mb-2">Fitur yang didapatkan:</div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>1 Outlet &amp; Maksimal 2 Akun Kasir POS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Kasir POS Cepat &amp; Cetak Struk Thermal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Radar Kedaluwarsa FEFO &amp; Kartu Stok</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Laporan Penjualan Harian &amp; 7 Hari</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>5 Obat Terlaris (Analisis Pareto ABC)</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant/40">
                    <XCircle className="w-4 h-4 text-outline-variant/40 shrink-0" />
                    <span>WhatsApp Reminder Pasien Otomatis</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant/40">
                    <XCircle className="w-4 h-4 text-outline-variant/40 shrink-0" />
                    <span>Sinkronisasi SatuSehat Kemenkes</span>
                  </div>
                </div>
              </CardContent>

              <div className="p-5 sm:p-6 pt-0">
                <Link href="/register">
                  <Button variant="outline" className="w-full text-xs font-bold h-10 border-outline-variant/50 hover:bg-surface-container-low rounded-lg text-on-surface">
                    Pilih Paket Starter
                  </Button>
                </Link>
              </div>
            </Card>

            {/* 2. Paket Pro (Paling Populer) */}
            <Card className="border-2 border-primary-container rounded-xl flex flex-col justify-between shadow-lg relative bg-surface-container-lowest">
              <div className="bg-primary-container text-white text-[10px] font-black tracking-wider uppercase py-1 text-center rounded-t-[10px]">
                Pilihan Paling Populer
              </div>

              <CardHeader className="p-5 sm:p-6 pb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-primary-container bg-primary-container/10 px-2 py-0.5 rounded border border-primary-container/20">
                    Pro
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">Hingga 3 Outlet</span>
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-on-surface">Apotek Berkembang</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Untuk apotek dengan transaksi tinggi, multi-shift kasir, dan integrasi SatuSehat Kemenkes.
                </CardDescription>

                <div className="pt-3">
                  <span className="text-2xl sm:text-3xl font-black text-primary-container">
                    Rp {(499000 * discountMultiplier).toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium"> / bulan</span>
                  {billingCycle === "yearly" && (
                    <span className="block text-[11px] text-emerald-600 font-semibold mt-0.5">
                      Ditagih tahunan (Rp {(499000 * 12 * 0.8).toLocaleString("id-ID")}/thn)
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 pt-0 space-y-3 flex-1">
                <div className="border-t border-outline-variant/20 pt-3 space-y-2 text-xs text-on-surface">
                  <div className="font-bold text-on-surface mb-2">Semua fitur Starter, ditambah:</div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" />
                    <span><strong>Hingga 3 Outlet</strong> &amp; Unlimited Kasir</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" />
                    <span><strong>Sinkronisasi SatuSehat Kemenkes</strong> (HL7 FHIR)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" />
                    <span><strong>WhatsApp Reminder Obat</strong> Otomatis ke Pasien</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" />
                    <span><strong>AI Restock Procurement</strong> Prediksi 14 Hari</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" />
                    <span>Laporan Laba Kotor, HPP, &amp; Biaya Operasional</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" />
                    <span>Integrasi QRIS Dinamis &amp; Multi-Metode Bayar</span>
                  </div>
                </div>
              </CardContent>

              <div className="p-5 sm:p-6 pt-0">
                <Link href="/register">
                  <Button className="w-full text-xs font-bold h-10 bg-primary-container hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 rounded-lg">
                    Coba Gratis Paket Pro (14 Hari)
                  </Button>
                </Link>
              </div>
            </Card>

            {/* 3. Paket Enterprise */}
            <Card className="border-outline-variant/30 rounded-xl flex flex-col justify-between shadow-xs hover:border-outline-variant/60 transition-all bg-surface-container-lowest md:col-span-2 lg:col-span-1">
              <CardHeader className="p-5 sm:p-6 pb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Enterprise
                  </span>
                  <span className="text-xs text-on-surface-variant">Jaringan Multi-Outlet</span>
                </div>
                <CardTitle className="text-lg sm:text-xl font-bold text-on-surface">Jaringan Apotek &amp; Klinik</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Kontrol terpusat untuk jaringan apotek waralaba, klinik, dan gudang distribusi farmasi.
                </CardDescription>

                <div className="pt-3">
                  <span className="text-2xl sm:text-3xl font-black text-on-surface">
                    Rp {(1299000 * discountMultiplier).toLocaleString("id-ID")}
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium"> / bulan</span>
                  {billingCycle === "yearly" && (
                    <span className="block text-[11px] text-emerald-600 font-semibold mt-0.5">
                      Ditagih tahunan (Rp {(1299000 * 12 * 0.8).toLocaleString("id-ID")}/thn)
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 pt-0 space-y-3 flex-1">
                <div className="border-t border-outline-variant/20 pt-3 space-y-2 text-xs text-on-surface">
                  <div className="font-bold text-on-surface mb-2">Semua fitur Pro, ditambah:</div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span><strong>Unlimited Outlet Cabang</strong> &amp; Gudang Utama</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span><strong>Transfer Stok Antar Outlet</strong> &amp; Approval</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span><strong>Gemini AI Assistant</strong> Skrining Interaksi Obat Klinis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Log Audit SatuSehat &amp; Laporan SIPNAP Lengkap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Dedicated Account Manager &amp; SLA Uptime 99.9%</span>
                  </div>
                </div>
              </CardContent>

              <div className="p-5 sm:p-6 pt-0">
                <Link href="/register">
                  <Button variant="outline" className="w-full text-xs font-bold h-10 border-purple-300 text-purple-900 hover:bg-purple-50 rounded-lg">
                    Pilih Paket Enterprise
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. FAQ ACCORDION                                             */}
      {/* ============================================================ */}
      <section id="faq" className="py-12 sm:py-16 bg-surface-container-low/40 border-t border-outline-variant/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-3xl font-black text-on-surface tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-xs text-on-surface-variant">
              Semua hal yang perlu Anda ketahui sebelum berlangganan Apotek Digital SaaS.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                q: "Apakah perlu membeli komputer atau server khusus untuk menjalankan aplikasi ini?",
                a: "Tidak perlu. Apotek Digital adalah SaaS berbasis cloud yang dapat diakses langsung melalui browser di laptop, PC kasir, tablet, maupun smartphone Android dan iPad.",
              },
              {
                q: "Bagaimana cara menghubungkan apotek kami ke SatuSehat Kemenkes RI?",
                a: "Sangat mudah. Anda hanya perlu memasukkan Organization ID, Client ID, dan Secret Key SatuSehat dari kemkes.go.id ke menu Pengaturan. Sistem kami otomatis mengonversi data ke standar HL7 FHIR.",
              },
              {
                q: "Bisakah kami memindahkan data obat dan stok dari sistem lama atau Excel?",
                a: "Bisa. Tim kami menyediakan template Excel gratis untuk mengimpor seluruh master produk, SKU, harga beli/jual, serta nomor batch obat dalam hitungan menit.",
              },
              {
                q: "Apakah data apotek dan resep pasien kami aman?",
                a: "Data Anda diisolasi per-tenant dan dienkripsi dengan standar industri (SSL/TLS 256-bit). Backup otomatis dilakukan setiap hari untuk menjamin keamanan operasional Anda.",
              },
              {
                q: "Apakah ada kontrak jangka panjang?",
                a: "Tidak ada ikatan kontrak kaku. Anda bisa memilih langganan bulanan dan berhenti kapan pun Anda mau.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-on-surface hover:text-primary-container transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-on-surface-variant shrink-0 transition-transform ${
                      openFaq === i ? "rotate-90 text-primary-container" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="p-3.5 sm:p-4 pt-0 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/20 bg-surface-container-low/20">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. FINAL PROMOTIONAL CTA BANNER                              */}
      {/* ============================================================ */}
      <section className="bg-inverse-surface text-inverse-on-surface py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-5 relative z-10">
          <div className="text-xs font-bold uppercase tracking-wider text-[#89f5e7]">
            Mulai Transformasi Digital Apotek Anda
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-inverse-on-surface">
            Mulai Uji Coba Gratis 14 Hari Tanpa Risiko
          </h2>
          <p className="text-xs sm:text-sm text-inverse-on-surface/80 max-w-xl mx-auto leading-relaxed">
            Bergabunglah dengan ratusan apotek modern di Indonesia yang telah menikmati efisiensi kasir,
            nol obat kedaluwarsa, dan kepatuhan SatuSehat Kemenkes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto sm:max-w-none">
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-11 sm:h-12 px-7 bg-primary-container hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 rounded-lg">
                Daftar Akun Baru Sekarang
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto h-11 sm:h-12 px-6 border-white/20 text-inverse-on-surface hover:bg-white/10 font-semibold text-xs sm:text-sm rounded-lg"
              >
                Sudah Punya Akun? Masuk
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. REGULATORY DISCLAIMER & FOOTER                           */}
      {/* ============================================================ */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant/30 py-8 sm:py-10 text-xs text-on-surface-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="p-3.5 sm:p-4 bg-surface-container-low border border-outline-variant/30 rounded-lg text-[11px] text-on-surface-variant leading-relaxed">
            <strong>Pemberitahuan Medis &amp; Regulasi Farmasi:</strong> Fitur rekomendasi AI Assistant, peramalan restock,
            dan skrining interaksi obat pada Apotek Digital SaaS dirancang sebagai alat bantu analitik operasional dan
            bukan diagnosis klinis medis. Penyerahan obat resep dan obat keras (Daftar G) wajib melalui verifikasi dan telaah
            resep oleh Apoteker Penanggung Jawab Apotek (APJ) dengan Surat Izin Praktik Apoteker (SIPA) yang sah sesuai regulasi
            BPOM dan Kementerian Kesehatan Republik Indonesia.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-outline-variant/20 pt-5 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Apotek SaaS"
                width={22}
                height={22}
                className="w-5 h-5 object-contain"
              />
              <span className="font-bold text-on-surface">Apotek <span className="text-primary-container">SaaS</span></span>
              <span>• &copy; 2026 Apotek SaaS Platform. Kelola Apotek, Lebih Mudah.</span>
            </div>
            <div className="flex items-center gap-4 text-on-surface-variant font-medium text-[11px]">
              <a href="#fitur" className="hover:underline">Fitur</a>
              <a href="#pricing" className="hover:underline">Harga</a>
              <Link href="/login" className="hover:underline">Login Kasir</Link>
              <Link href="/register" className="hover:underline">Registrasi Apotek</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
