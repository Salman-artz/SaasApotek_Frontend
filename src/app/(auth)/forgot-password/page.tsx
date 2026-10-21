"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-surface text-on-surface">
      <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <span className="material-symbols-outlined text-[24px]">local_pharmacy</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-base text-on-surface tracking-tight">Apotek Digital</span>
            <span className="text-[11px] text-[#006a61] font-semibold">Pemulihan Akun Apotek</span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Lupa Kata Sandi?</h2>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Masukkan alamat email yang terdaftar pada apotek Anda. Kami akan mengirimkan tautan verifikasi untuk mengatur ulang kata sandi.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <span className="material-symbols-outlined text-[20px] text-emerald-600">mark_email_read</span>
              Tautan Terkirim!
            </div>
            <p className="leading-relaxed">
              Jika email <strong>{email}</strong> terdaftar di sistem, tautan pemulihan kata sandi telah dikirim. Silakan periksa kotak masuk atau folder spam Anda.
            </p>
            <Link href="/login" className="block pt-2">
              <Button variant="outline" className="w-full text-xs h-9 border-emerald-300 text-emerald-800 hover:bg-emerald-100">
                Kembali ke Halaman Masuk
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-on-surface">
                Email Terdaftar
              </Label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-outline">
                  mail
                </span>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="contoh: owner@apotek.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-xs h-10 border-outline-variant/50 focus:border-primary-container"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-container hover:bg-blue-700 text-white font-semibold text-xs h-10 shadow-sm"
            >
              {loading ? "Mengirim Tautan..." : "Kirim Tautan Pemulihan"}
            </Button>

            <div className="text-center pt-2">
              <Link href="/login" className="text-xs font-semibold text-primary-container hover:underline inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Kembali ke Halaman Masuk
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
