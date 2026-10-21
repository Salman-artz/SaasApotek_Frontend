"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ApiClient } from "@/lib/api";

export default function OnboardingPage() {
  const { activeOutlet, refreshUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    address: "Jl. Kesehatan No. 123, Jakarta Selatan",
    phone: "021-7890123",
    siaNumber: "SIA/1234/DKI/2026",
    sipaNumber: "SIPA/5678/DKI/2026",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await ApiClient.post("/api/auth/onboarding", formData);
      await refreshUser();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan informasi outlet");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-surface text-on-surface relative">
      <div className="absolute top-0 left-0 right-0 h-64 bg-inverse-surface pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 my-8">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary-container flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <span className="material-symbols-outlined text-[24px]">local_pharmacy</span>
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold text-inverse-on-surface tracking-tight leading-tight">Apotek Digital</h1>
            <span className="text-xs text-[#89f5e7] font-medium">Langkah Awal: Setup Cabang Utama</span>
          </div>
        </div>

        <Card className="border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] bg-surface-container-lowest rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-4 border-b border-outline-variant/20 bg-surface-container-low/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-on-surface">
                  Lengkapi Data Outlet &amp; Perizinan
                </CardTitle>
                <CardDescription className="text-xs text-on-surface-variant mt-1">
                  Data ini akan tercetak pada kop faktur, struk kasir, dan laporan SIPNAP resmi BPOM.
                </CardDescription>
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-semibold text-on-surface">
                  Alamat Lengkap Outlet / Cabang *
                </Label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                    location_on
                  </span>
                  <Input
                    id="address"
                    required
                    placeholder="Jl. Sudirman No. 45, Kebayoran Baru, Jakarta"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="pl-9 text-xs h-10 border-outline-variant/50 focus-visible:ring-primary-container rounded-xl bg-surface-container-lowest"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-on-surface">
                  Nomor Telepon / WhatsApp Outlet *
                </Label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                    call
                  </span>
                  <Input
                    id="phone"
                    required
                    placeholder="021-5551234 / 08123456789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-9 text-xs h-10 border-outline-variant/50 focus-visible:ring-primary-container rounded-xl bg-surface-container-lowest"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="siaNumber" className="text-xs font-semibold text-on-surface">
                    No. SIA (Surat Izin Apotek)
                  </Label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                      badge
                    </span>
                    <Input
                      id="siaNumber"
                      placeholder="Contoh: 503/SIA/012/DPMPTSP"
                      value={formData.siaNumber}
                      onChange={(e) => setFormData({ ...formData, siaNumber: e.target.value })}
                      className="pl-9 text-xs h-10 border-outline-variant/50 focus-visible:ring-primary-container rounded-xl bg-surface-container-lowest"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sipaNumber" className="text-xs font-semibold text-on-surface">
                    No. SIPA (Apoteker Penanggung Jawab)
                  </Label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                      verified
                    </span>
                    <Input
                      id="sipaNumber"
                      placeholder="Contoh: 19900101/SIPA_31.71/2024"
                      value={formData.sipaNumber}
                      onChange={(e) => setFormData({ ...formData, sipaNumber: e.target.value })}
                      className="pl-9 text-xs h-10 border-outline-variant/50 focus-visible:ring-primary-container rounded-xl bg-surface-container-lowest"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  className="w-full sm:w-auto text-xs text-on-surface-variant hover:text-on-surface"
                >
                  Lewati untuk Sekarang
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-primary-container hover:bg-blue-700 text-white font-semibold text-xs h-10 px-6 rounded-xl shadow-sm"
                >
                  {loading ? "Menyimpan Data..." : "Simpan & Masuk Dashboard"}
                  <span className="material-symbols-outlined text-[16px] ml-1.5">arrow_forward</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
