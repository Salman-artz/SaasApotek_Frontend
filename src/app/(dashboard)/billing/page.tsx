"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Check,
  Zap,
  Building2,
  Package,
  History,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Receipt,
} from "lucide-react";
import { ApiClient } from "@/lib/api";

interface PlanCatalog {
  id: string;
  name: string;
  price: number;
  popular?: boolean;
  maxOutlets: number;
  maxProducts: number;
  maxMonthlyTrx: number;
  features: string[];
}

interface SubscriptionData {
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  quota: {
    outlets: { current: number; max: number };
    products: { current: number; max: number };
    monthlyTrx: { current: number; max: number };
  };
  catalog: PlanCatalog[];
}

export default function BillingPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res: any = await ApiClient.get("/billing/current-plan");
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error("Gagal memuat info langganan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleUpgrade = async (planId: string) => {
    try {
      setUpgradingPlan(planId);
      const res: any = await ApiClient.post("/billing/upgrade", {
        plan: planId,
        billingCycle,
      });

      if (res.success) {
        alert(res.message || "Paket SaaS berhasil di-upgrade!");
        fetchSubscription();
      }
    } catch (err: any) {
      alert(err.message || "Gagal melakukan upgrade");
    } finally {
      setUpgradingPlan(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-800">Paket Langganan & Kuota SaaS</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Kelola paket langganan sistem Apotek Digital, kuota cabang, kapasitas produk, dan riwayat tagihan
          </p>
        </div>

        <button
          onClick={fetchSubscription}
          className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-2" />
          <p className="text-xs">Memuat informasi akun SaaS...</p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Current Plan & Quota Usage Overview */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 border border-indigo-800 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/80 pb-6">
              <div>
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                  Paket Langganan Aktif
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-2xl font-black tracking-tight">SaaS {data.plan}</h2>
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold uppercase">
                    {data.status}
                  </span>
                </div>
                <p className="text-xs text-indigo-200/80 mt-1">
                  Berlaku hingga <strong>{new Date(data.endDate).toLocaleDateString("id-ID")}</strong> ({data.daysRemaining} hari tersisa)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-indigo-300">Siklus Tagihan:</span>
                <div className="flex p-1 bg-slate-800 rounded-xl border border-slate-700">
                  <button
                    onClick={() => setBillingCycle("MONTHLY")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      billingCycle === "MONTHLY" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Bulanan
                  </button>
                  <button
                    onClick={() => setBillingCycle("ANNUAL")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                      billingCycle === "ANNUAL" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Tahunan <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1 rounded">Hemat 20%</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quota Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              {/* Outlets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-indigo-200 font-semibold">
                    <Building2 className="h-4 w-4" /> Outlet Cabang
                  </span>
                  <span className="font-mono">
                    {data.quota.outlets.current} / {data.quota.outlets.max}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (data.quota.outlets.current / data.quota.outlets.max) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Products SKU */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-indigo-200 font-semibold">
                    <Package className="h-4 w-4" /> Kapasitas SKU Obat
                  </span>
                  <span className="font-mono">
                    {data.quota.products.current} / {data.quota.products.max}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (data.quota.products.current / data.quota.products.max) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Monthly Trx */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-indigo-200 font-semibold">
                    <Receipt className="h-4 w-4" /> Transaksi Kasir / Bulan
                  </span>
                  <span className="font-mono">
                    {data.quota.monthlyTrx.current} / {data.quota.monthlyTrx.max}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${Math.min(100, (data.quota.monthlyTrx.current / data.quota.monthlyTrx.max) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Plans Catalog */}
          <div>
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="text-xl font-bold text-slate-800">Tingkatkan Performa Apotek Anda</h2>
              <p className="text-xs text-slate-500 mt-1">
                Pilih paket SaaS yang sesuai dengan skala bisnis apotek mandiri maupun jaringan multi-cabang.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.catalog.map((plan) => {
                const isCurrent = data.plan === plan.id;
                const displayPrice =
                  billingCycle === "ANNUAL"
                    ? Math.round((plan.price * 10) / 12)
                    : plan.price;

                return (
                  <div
                    key={plan.id}
                    className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-sm transition relative ${
                      plan.popular
                        ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-md"
                        : "border-slate-200"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow">
                        Paling Populer
                      </span>
                    )}

                    <div>
                      <h3 className="text-base font-bold text-slate-800">{plan.name}</h3>
                      <div className="mt-3">
                        <span className="text-3xl font-black text-slate-900">
                          Rp {displayPrice.toLocaleString("id-ID")}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">/ bulan</span>
                      </div>

                      <div className="mt-6 space-y-2.5 pt-4 border-t border-slate-100">
                        {plan.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                            <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-100">
                      {isCurrent ? (
                        <button
                          disabled
                          className="w-full py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold cursor-default"
                        >
                          Paket Saat Ini
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpgrade(plan.id)}
                          disabled={upgradingPlan === plan.id}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                            plan.popular
                              ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30"
                              : "bg-slate-900 hover:bg-slate-800 text-white"
                          }`}
                        >
                          {upgradingPlan === plan.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Memproses...
                            </>
                          ) : (
                            <>
                              Pilih {plan.name} <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
