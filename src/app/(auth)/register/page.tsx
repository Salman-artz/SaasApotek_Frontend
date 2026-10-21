"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    pharmacyName: "",
    ownerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    plan: "pro" as "starter" | "pro" | "enterprise",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      await register({
        pharmacyName: formData.pharmacyName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        plan: formData.plan,
      });
    } catch (err: any) {
      setError(err.message || "Gagal melakukan registrasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-surface text-on-surface relative">
      {/* Top Banner decoration */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-inverse-surface pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 my-8">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary-container flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <span className="material-symbols-outlined text-[24px]">local_pharmacy</span>
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold text-inverse-on-surface tracking-tight leading-tight">Apotek Digital</h1>
            <span className="text-xs text-[#89f5e7] font-medium">Registrasi Akun Tenant Baru</span>
          </div>
        </div>

        <Card className="border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] bg-surface-container-lowest rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4 border-b border-outline-variant/20 bg-surface-container-low/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-on-surface">
                  Daftarkan Apotek Anda
                </CardTitle>
                <CardDescription className="text-xs text-on-surface-variant mt-1">
                  Mulai digitalisasi stok, resep, dan kasir apotek dalam hitungan menit.
                </CardDescription>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-container/10 text-primary-container text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Trial 14 Hari</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-error-container border border-red-200 text-xs text-[#ba1a1a] font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Section 1: Apotek & Pemilik */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  1. Informasi Apotek &amp; Pemilik
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="pharmacyName" className="text-xs font-semibold text-on-surface">
                      Nama Apotek / Brand *
                    </Label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                        store
                      </span>
                      <Input
                        id="pharmacyName"
                        required
                        placeholder="Contoh: Apotek Kimia Medika"
                        value={formData.pharmacyName}
                        onChange={(e) => setFormData({ ...formData, pharmacyName: e.target.value })}
                        className="pl-9 text-xs h-10 border-outline-variant/50 focus-visible:ring-primary-container rounded-xl bg-surface-container-lowest"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ownerName" className="text-xs font-semibold text-on-surface">
                      Nama Pemilik / Apoteker *
                    </Label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                        person
                      </span>
                      <Input
                        id="ownerName"
                        required
                        placeholder="Contoh: apt. Budi Santoso, S.Farm"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        className="pl-9 text-xs h-10 border-outline-variant/50 focus-visible:ring-primary-container rounded-xl bg-surface-container-lowest"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-on-surface">
                      Email Akun (Untuk Login) *
                    </Label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                        mail
                      </span>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="pemilik@apotek.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-9 text-xs h-10 border-outline-variant/50 focus-visible:ring-primary-container rounded-xl bg-surface-container-lowest"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold text-on-surface">
                      No. WhatsApp Aktif
                    </Label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                        call
                      </span>
                      <Input
                        id="phone"
                        placeholder="08123456789"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-9 text-xs h-10 border-outline-variant/50 focus-visible:ring-primary-container rounded-xl bg-surface-container-lowest"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Keamanan */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  2. Kata Sandi Akun
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-xs font-semibold text-on-surface">
                      Kata Sandi *
                    </Label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                        lock
                      </span>
                      <Input
                        id="password"
                        type="password"
                        required
                        placeholder="Minimal 6 karakter"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-9 text-xs h-10 border-outline-variant/50 focus-visible:ring-primary-container rounded-xl bg-surface-container-lowest"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs font-semibold text-on-surface">
                      Konfirmasi Kata Sandi *
                    </Label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                        lock_reset
                      </span>
                      <Input
                        id="confirmPassword"
                        type="password"
                        required
                        placeholder="Ulangi kata sandi"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-9 text-xs h-10 border-outline-variant/50 focus-visible:ring-primary-container rounded-xl bg-surface-container-lowest"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Paket Langganan */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  3. Pilih Paket Layanan
                </h4>

                <div className="grid grid-cols-3 gap-2.5">
                  <div
                    onClick={() => setFormData({ ...formData, plan: "starter" })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.plan === "starter"
                        ? "border-primary-container bg-primary-container/10"
                        : "border-outline-variant/40 hover:border-outline bg-surface-container-lowest"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-on-surface">Starter</span>
                      {formData.plan === "starter" && <Check className="h-3.5 w-3.5 text-primary-container" />}
                    </div>
                    <div className="text-[11px] text-on-surface-variant">1 Outlet, Kasir POS, FEFO</div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, plan: "pro" })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all relative ${
                      formData.plan === "pro"
                        ? "border-primary-container bg-primary-container/10"
                        : "border-outline-variant/40 hover:border-outline bg-surface-container-lowest"
                    }`}
                  >
                    <div className="absolute -top-2 right-2 px-1.5 py-0.2 rounded bg-primary-container text-white text-[9px] font-bold">
                      POPULER
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-on-surface">Pro</span>
                      {formData.plan === "pro" && <Check className="h-3.5 w-3.5 text-primary-container" />}
                    </div>
                    <div className="text-[11px] text-on-surface-variant">Multi Outlet + AI Faktur</div>
                  </div>

                  <div
                    onClick={() => setFormData({ ...formData, plan: "enterprise" })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.plan === "enterprise"
                        ? "border-primary-container bg-primary-container/10"
                        : "border-outline-variant/40 hover:border-outline bg-surface-container-lowest"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-on-surface">Enterprise</span>
                      {formData.plan === "enterprise" && <Check className="h-3.5 w-3.5 text-primary-container" />}
                    </div>
                    <div className="text-[11px] text-on-surface-variant">Klinis, SatuSehat, AI</div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-container hover:bg-blue-700 text-white font-semibold h-11 rounded-xl shadow-md shadow-blue-500/20 mt-4 text-sm"
              >
                {loading ? "Membuat Akun Apotek..." : "Daftar & Lanjutkan Setup Cabang"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-on-surface-variant mt-6">
          Sudah memiliki akun?{" "}
          <Link href="/login" className="font-semibold text-primary-container hover:underline">
            Masuk ke Akun
          </Link>
        </p>
      </div>
    </div>
  );
}
