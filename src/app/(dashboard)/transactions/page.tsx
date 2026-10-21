"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  History,
  Search,
  Calendar,
  DollarSign,
  Receipt,
  Printer,
  CreditCard,
  QrCode,
  CheckCircle2,
  Stethoscope,
  Pill,
  Building2,
  Loader2,
  Filter,
  ArrowRight,
} from "lucide-react";
import { PosReceiptModal, ReceiptData } from "@/components/pos-receipt-modal";

interface TransactionRow {
  id: string;
  invoiceCode: string;
  customerName: string;
  customerPhone?: string | null;
  doctorName?: string | null;
  prescriptionNumber?: string | null;
  isPrescription: boolean;
  tuslahFee: string | number;
  totalSubtotal: string | number;
  discountAmount: string | number;
  taxAmount: string | number;
  grandTotal: string | number;
  paidAmount: string | number;
  changeAmount: string | number;
  paymentMethod: string;
  paymentStatus: string;
  outletId: string;
  outletName: string;
  outletAddress?: string | null;
  outletPhone?: string | null;
  outletSia?: string | null;
  outletSipa?: string | null;
  cashierId: string;
  cashierName: string;
  createdAt: string;
}

interface TodaySummary {
  totalRevenue: number;
  totalTransactions: number;
  totalCash: number;
  totalNonCash: number;
  prescriptionCount: number;
}

interface OutletItem {
  id: string;
  name: string;
}

export default function TransactionsHistoryPage() {
  const [search, setSearch] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("ALL");
  const [isPrescriptionFilter, setIsPrescriptionFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Receipt Modal State for reprint
  const [selectedReceiptData, setSelectedReceiptData] = useState<ReceiptData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // 1. Fetch Outlets
  const { data: outletsData } = useQuery({
    queryKey: ["outlets"],
    queryFn: async () => {
      const res = await ApiClient.get<{ data: OutletItem[] }>("/api/outlets");
      return res.data || [];
    },
  });
  const outletsList = outletsData || [];

  // 2. Fetch Today Summary
  const { data: summaryData } = useQuery({
    queryKey: ["today-summary", selectedOutlet],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedOutlet) params.append("outletId", selectedOutlet);
      return await ApiClient.get<{ data: TodaySummary }>(`/api/transactions/today-summary?${params.toString()}`);
    },
  });
  const todaySummary = summaryData?.data;

  // 3. Fetch Transactions
  const { data: trxData, isLoading } = useQuery({
    queryKey: [
      "transactions-list",
      search,
      selectedOutlet,
      paymentMethodFilter,
      isPrescriptionFilter,
      startDate,
      endDate,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedOutlet) params.append("outletId", selectedOutlet);
      if (paymentMethodFilter !== "ALL") params.append("paymentMethod", paymentMethodFilter);
      if (isPrescriptionFilter !== "ALL") params.append("isPrescription", isPrescriptionFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      return await ApiClient.get<{ data: TransactionRow[]; meta: any }>(
        `/api/transactions?${params.toString()}`
      );
    },
  });
  const transactionList = trxData?.data || [];

  const formatRupiah = (num: number | string) => {
    const val = typeof num === "string" ? parseFloat(num) : num;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleOpenReceipt = async (id: string) => {
    try {
      const res = await ApiClient.get<{ data: any }>(`/api/transactions/${id}`);
      if (res.data) {
        const trx = res.data;
        setSelectedReceiptData({
          id: trx.id,
          invoiceCode: trx.invoiceCode,
          outletName: trx.outletName,
          outletAddress: trx.outletAddress,
          outletPhone: trx.outletPhone,
          outletSia: trx.outletSia,
          outletSipa: trx.outletSipa,
          cashierName: trx.cashierName,
          customerName: trx.customerName,
          customerPhone: trx.customerPhone,
          doctorName: trx.doctorName,
          prescriptionNumber: trx.prescriptionNumber,
          isPrescription: trx.isPrescription,
          tuslahFee: trx.tuslahFee,
          totalSubtotal: trx.totalSubtotal,
          discountAmount: trx.discountAmount,
          taxAmount: trx.taxAmount,
          grandTotal: trx.grandTotal,
          paidAmount: trx.paidAmount,
          changeAmount: trx.changeAmount,
          paymentMethod: trx.paymentMethod,
          createdAt: trx.createdAt,
          items: trx.items || [],
        });
        setIsReceiptModalOpen(true);
      }
    } catch (e: any) {
      alert("Gagal memuat rincian struk");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-primary-container text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
              Riwayat Transaksi Penjualan Kasir
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Histori penjualan kasir, reprint struk thermal, dan rekap omzet harian.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Hari Ini */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-outline-variant/30 bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Omzet Penjualan Hari Ini
              </span>
              <div className="p-2 bg-primary-container/10 rounded-xl text-primary-container">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-on-surface">
                {formatRupiah(todaySummary?.totalRevenue || 0)}
              </div>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                <strong>{todaySummary?.totalTransactions || 0}</strong> Transaksi sukses
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-outline-variant/30 bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Pembayaran Tunai
              </span>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-on-surface">
                {formatRupiah(todaySummary?.totalCash || 0)}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Total kas fisik di drawer</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-outline-variant/30 bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Non-Tunai (QRIS / EDC)
              </span>
              <div className="p-2 bg-purple-100 rounded-xl text-purple-700">
                <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-purple-700">
                {formatRupiah(todaySummary?.totalNonCash || 0)}
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Dana masuk rekening</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-outline-variant/30 bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Penebusan Resep Dokter
              </span>
              <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
                <span className="material-symbols-outlined text-[20px]">prescriptions</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-amber-800">
                {todaySummary?.prescriptionCount || 0}
                <span className="text-xs font-normal text-on-surface-variant ml-1">Resep</span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Pelayanan resep klinis</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            className="text-xs border border-outline-variant/50 bg-surface-container-lowest rounded-xl px-2.5 py-1.5 focus:border-primary-container text-on-surface font-medium cursor-pointer"
          >
            <option value="">Semua Cabang</option>
            {outletsList.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>

          <select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="text-xs border border-outline-variant/50 bg-surface-container-lowest rounded-xl px-2.5 py-1.5 focus:border-primary-container text-on-surface font-medium cursor-pointer"
          >
            <option value="ALL">Semua Metode Bayar</option>
            <option value="cash">Tunai (Cash)</option>
            <option value="qris">QRIS</option>
            <option value="transfer">Transfer Bank</option>
            <option value="debit">Kartu Debit</option>
          </select>

          <select
            value={isPrescriptionFilter}
            onChange={(e) => setIsPrescriptionFilter(e.target.value)}
            className="text-xs border border-outline-variant/50 bg-surface-container-lowest rounded-xl px-2.5 py-1.5 focus:border-primary-container text-on-surface font-medium cursor-pointer"
          >
            <option value="ALL">Semua Layanan</option>
            <option value="false">Obat Bebas (Non-Resep)</option>
            <option value="true">Resep Dokter (Rx)</option>
          </select>

          <div className="flex items-center gap-1">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs h-8 w-32 border-outline-variant/50 rounded-xl"
            />
            <span className="text-outline text-xs">-</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs h-8 w-32 border-outline-variant/50 rounded-xl"
            />
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined w-4 h-4 absolute left-3 top-2 text-[16px] text-outline">search</span>
          <Input
            placeholder="Cari No. Struk / Pasien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-8 text-xs border-outline-variant/50 rounded-xl"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-on-surface">
            <thead className="bg-surface-container-low border-b border-outline-variant/20 text-on-surface-variant uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3.5">No. Struk Invoice</th>
                <th className="px-4 py-3.5">Waktu Transaksi</th>
                <th className="px-4 py-3.5">Pelanggan / Pasien</th>
                <th className="px-4 py-3.5">Layanan</th>
                <th className="px-4 py-3.5">Metode Bayar</th>
                <th className="px-4 py-3.5 text-right">Total Transaksi</th>
                <th className="px-4 py-3.5 text-center">Aksi Struk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                    <p className="mt-2 text-gray-500 text-xs">Memuat riwayat transaksi...</p>
                  </td>
                </tr>
              ) : transactionList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    <History className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="font-medium">Belum ada transaksi pada periode ini.</p>
                  </td>
                </tr>
              ) : (
                transactionList.map((trx) => (
                  <tr key={trx.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-gray-900 dark:text-white">
                      {trx.invoiceCode}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div>
                        {new Date(trx.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-gray-400">
                        {new Date(trx.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {trx.customerName || "Umum"}
                      </div>
                      <div className="text-gray-400 text-[11px]">{trx.outletName} • Kasir: {trx.cashierName}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      {trx.isPrescription ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                          <Stethoscope className="w-3 h-3 text-blue-600" />
                          Resep Dokter
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          <Pill className="w-3 h-3 text-gray-500" />
                          Obat Bebas
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <span className="uppercase font-bold text-gray-800 dark:text-gray-200">
                        {trx.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-black text-xs text-emerald-600">
                      {formatRupiah(trx.grandTotal)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Button
                        onClick={() => handleOpenReceipt(trx.id)}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 h-8 gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Struk
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS Receipt Modal */}
      <PosReceiptModal
        isOpen={isReceiptModalOpen}
        data={selectedReceiptData}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
}
