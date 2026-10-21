"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Cross, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  CheckCircle2, 
  Activity, 
  Building2, 
  UserCheck, 
  ShoppingBag,
  Loader2
} from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("salman@apoteksehat.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Email atau password tidak sesuai");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError(null);
  };

  const isOwnerSelected = email === "salman@apoteksehat.com";
  const isKasirSelected = email === "kasir@apoteksehat.com";

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-surface text-on-surface">
      {/* Left Showcase Hero (Matching Sidebar Theme) */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-inverse-surface text-inverse-on-surface p-8 lg:p-14 flex-col justify-between relative overflow-hidden shadow-xl border-r border-outline-variant/20">
        {/* Subtle decorative glow circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-container/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#89f5e7]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />
        
        {/* Top Branding */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="h-11 w-11 rounded-xl bg-primary-container flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <span className="material-symbols-outlined text-[24px]">local_pharmacy</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-inverse-on-surface flex items-center gap-2">
              Apotek Digital
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-container/30 text-white border border-primary-container/40 font-semibold tracking-wide uppercase">
                SaaS POS
              </span>
            </h1>
            <p className="text-xs text-[#89f5e7] font-medium">
              Smart Pharmacy &amp; POS Management
            </p>
          </div>
        </div>

        {/* Center Content & Value Proposition */}
        <div className="space-y-6 relative z-10 my-auto py-8 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-inverse-on-surface text-xs font-medium backdrop-blur-sm">
            <span className="material-symbols-outlined text-[16px] text-[#89f5e7]">verified_user</span>
            <span>BPOM &amp; Kemenkes Terstandarisasi SIPNAP &amp; FEFO</span>
          </div>

          <h2 className="text-2xl lg:text-4xl font-extrabold tracking-tight leading-snug text-inverse-on-surface">
            Kelola Stok, Resep, &amp; Kasir Apotek Lebih Presisi &amp; Bebas Rugi.
          </h2>

          <p className="text-sm text-inverse-on-surface/80 leading-relaxed">
            Platform operasional apotek modern multi-outlet dengan radar kadaluarsa real-time, scan faktur PBF berbasis AI, dan rekonsiliasi kasir otomatis.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-secondary-container/20 text-[#89f5e7]">
                <span className="material-symbols-outlined text-[20px]">shield</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-inverse-on-surface">FEFO Engine</h4>
                <p className="text-[11px] text-outline-variant">Cegah obat expired &amp; rugi stok otomatis</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-primary-container/20 text-blue-300">
                <span className="material-symbols-outlined text-[20px]">smart_toy</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-inverse-on-surface">Gemini AI Assistant</h4>
                <p className="text-[11px] text-outline-variant">Prediksi defekta &amp; insight penjualan</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-primary-container/20 text-blue-300">
                <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-inverse-on-surface">Kasir POS Cepat</h4>
                <p className="text-[11px] text-outline-variant">Shift kasir, tuslah &amp; struk fleksibel</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                <span className="material-symbols-outlined text-[20px]">bar_chart</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-inverse-on-surface">Laporan Real-time</h4>
                <p className="text-[11px] text-outline-variant">Analisa laba rugi &amp; SIPNAP BPOM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info & Trust pill */}
        <div className="flex items-center justify-between text-xs text-outline-variant relative z-10 pt-4 border-t border-white/10">
          <span>© 2026 Apotek Digital Cloud SaaS</span>
          <span className="flex items-center gap-1.5 text-[#89f5e7] font-medium">
            <span className="material-symbols-outlined text-[16px]">check_circle</span> Siap Multi-Outlet
          </span>
        </div>
      </div>

      {/* Right Login Form Section */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-16 min-h-screen">
        <div className="w-full max-w-md sm:max-w-lg space-y-6">
          
          {/* Header on Mobile/Tablet */}
          <div className="flex md:hidden items-center gap-3 justify-center mb-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md">
              <Cross className="h-5 w-5 fill-current" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 block leading-tight">Apotek Digital</span>
              <span className="text-xs text-slate-500 block">Sistem Kasir & Inventori</span>
            </div>
          </div>

          <Card className="border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] bg-surface-container-lowest rounded-2xl overflow-hidden">
            <CardHeader className="space-y-1.5 pb-6 pt-7 px-6 sm:px-8 border-b border-outline-variant/20 bg-surface-container-low/50">
              <CardTitle className="text-2xl font-bold tracking-tight text-on-surface">
                Masuk ke Akun
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-on-surface-variant">
                Masukkan email dan password untuk mengelola apotek Anda.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {error && (
                <div 
                  data-testid="login-error" 
                  className="p-3.5 rounded-xl bg-error-container border border-red-200 text-xs sm:text-sm text-[#ba1a1a] font-medium flex items-start gap-2 animate-in fade-in"
                >
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Quick Demo Switcher Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    Pilih Akun Demo (1-Klik Isi)
                  </span>
                  <span className="text-[11px] text-[#006a61] font-semibold bg-[#86f2e4]/30 px-2 py-0.5 rounded-full border border-secondary-container/40">
                    Siap Digunakan
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("salman@apoteksehat.com")}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      isOwnerSelected
                        ? "border-primary-container bg-primary-container/10 text-primary-container shadow-sm ring-1 ring-primary-container"
                        : "border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isOwnerSelected ? "bg-primary-container text-white" : "bg-surface-container-low text-on-surface-variant"}`}>
                      <span className="material-symbols-outlined text-[18px]">store</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">Akun Owner</div>
                      <div className="text-[10px] text-on-surface-variant truncate">Akses Penuh SaaS</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo("kasir@apoteksehat.com")}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      isKasirSelected
                        ? "border-[#006a61] bg-[#86f2e4]/20 text-[#006a61] shadow-sm ring-1 ring-[#006a61]"
                        : "border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isKasirSelected ? "bg-[#006a61] text-white" : "bg-surface-container-low text-on-surface-variant"}`}>
                      <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">Akun Kasir</div>
                      <div className="text-[10px] text-on-surface-variant truncate">Akses POS Kasir</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-outline-variant/30 w-full" />
                <span className="bg-surface-container-lowest px-3 text-[11px] font-medium text-outline uppercase tracking-wider absolute">
                  Atau masukkan kredensial
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-on-surface">
                    Alamat Email
                  </Label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-outline">
                      mail
                    </span>
                    <Input
                      id="email"
                      data-testid="login-email"
                      type="email"
                      required
                      placeholder="nama@apoteksehat.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 border-outline-variant/50 focus-visible:ring-primary-container focus-visible:border-primary-container rounded-xl text-sm bg-surface-container-lowest"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold text-on-surface">
                      Kata Sandi
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-[11px] text-primary-container hover:underline font-semibold"
                    >
                      Lupa password?
                    </Link>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-3 text-[18px] text-outline">
                      lock
                    </span>
                    <Input
                      id="password"
                      data-testid="login-password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 border-outline-variant/50 focus-visible:ring-primary-container focus-visible:border-primary-container rounded-xl text-sm bg-surface-container-lowest"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-outline hover:text-on-surface"
                      tabIndex={-1}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  data-testid="login-submit"
                  disabled={loading}
                  className="w-full bg-primary-container hover:bg-blue-700 text-white font-semibold h-11 rounded-xl shadow-md shadow-blue-500/20 transition-all text-sm mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memverifikasi kredensial...
                    </span>
                  ) : (
                    "Masuk ke Dashboard"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Bottom Call to Action */}
          <div className="text-center space-y-2">
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Belum mendaftarkan apotek Anda?{" "}
              <Link href="/register" className="font-semibold text-primary-container hover:underline">
                Daftar Apotek Baru &amp; Coba Gratis
              </Link>
            </p>
            <p className="text-[11px] text-outline">
              Didukung oleh sistem keamanan JWT &amp; enkripsi data standar industri farmasi.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
