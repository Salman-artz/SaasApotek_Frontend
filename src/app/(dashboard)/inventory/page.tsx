"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Calendar,
  AlertTriangle,
  Search,
  Plus,
  ArrowUpDown,
  History,
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Layers,
  Activity,
  Sparkles,
  Loader2,
  Building2,
  X,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Info,
} from "lucide-react";

interface BatchItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  productBarcode: string | null;
  baseUnit: string;
  category: string;
  outletId: string;
  outletName: string;
  batchNumber: string;
  expiredDate: string;
  stockInBaseUnit: number;
  costPerBaseUnit: string | number;
  daysUntilExpiry: number;
  expiryStatus: "EXPIRED" | "CRITICAL_3M" | "WARNING_6M" | "SAFE";
  estimatedValue: number;
}

interface ExpiryRadarSummary {
  totalBatchesWithStock: number;
  totalAssetValue: number;
  totalAtRiskValue: number;
  expired: { count: number; value: number };
  critical: { count: number; value: number };
  warning: { count: number; value: number };
  safe: { count: number; value: number };
}

interface StockMutationItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  baseUnit: string;
  batchId: string | null;
  batchNumber: string | null;
  expiredDate: string | null;
  outletId: string;
  outletName: string;
  type: string;
  referenceType: string | null;
  referenceNumber: string | null;
  qtyIn: number;
  qtyOut: number;
  balanceAfter: number;
  notes: string | null;
  userName: string | null;
  createdAt: string;
}

interface OpnameSession {
  id: string;
  opnameNumber: string;
  status: string;
  totalItems: number;
  totalVariance: number;
  notes: string | null;
  outletId: string;
  outletName: string;
  conductedBy: string | null;
  conductorName: string | null;
  createdAt: string;
}

interface OpnameItemDetail {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  baseUnit: string;
  batchId: string | null;
  batchNumber: string | null;
  expiredDate: string | null;
  systemStock: number;
  physicalStock: number;
  variance: number;
  reason: string | null;
}

interface ProductSimple {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  baseUnit: string;
  category: string;
}

interface OutletItem {
  id: string;
  name: string;
}

export default function InventoryPage() {
  const queryClient = useQueryClient();

  // Active Tab: 'batches' | 'radar' | 'mutations' | 'opname'
  const [activeTab, setActiveTab] = useState<"batches" | "radar" | "mutations" | "opname">("batches");

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedProductFilter, setSelectedProductFilter] = useState("");

  // Modals state
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [selectedBatchForAdjustment, setSelectedBatchForAdjustment] = useState<BatchItem | null>(null);
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);
  const [viewOpnameDetailId, setViewOpnameDetailId] = useState<string | null>(null);

  // Form: Add Batch State
  const [newBatchForm, setNewBatchForm] = useState({
    productId: "",
    outletId: "",
    batchNumber: "",
    expiredDate: "",
    stockInBaseUnit: 0,
    costPerBaseUnit: 0,
    notes: "",
  });

  // Form: Adjustment State
  const [adjustmentForm, setAdjustmentForm] = useState<{
    type: "ADJUSTMENT_IN" | "ADJUSTMENT_OUT";
    qty: number;
    notes: string;
  }>({
    type: "ADJUSTMENT_IN",
    qty: 1,
    notes: "",
  });

  // Form: Opname Creation State
  const [opnameOutletId, setOpnameOutletId] = useState("");
  const [opnameNotes, setOpnameNotes] = useState("");
  const [opnameDraftItems, setOpnameDraftItems] = useState<
    Array<{
      productId: string;
      batchId?: string;
      productName: string;
      batchNumber: string;
      systemStock: number;
      physicalStock: number;
      reason: string;
    }>
  >([]);

  // 1. Fetch Outlets
  const { data: outletsData } = useQuery({
    queryKey: ["outlets"],
    queryFn: async () => {
      const res = await ApiClient.get<{ data: OutletItem[] }>("/api/outlets");
      return res.data || [];
    },
  });
  const outletsList = outletsData || [];

  // 2. Fetch Products (for dropdowns)
  const { data: productsData } = useQuery({
    queryKey: ["products-list"],
    queryFn: async () => {
      const res = await ApiClient.get<{ data: ProductSimple[] }>("/api/products?limit=100");
      return res.data || [];
    },
  });
  const productsList = productsData || [];

  // 3. Fetch Batches (FEFO View)
  const { data: batchesData, isLoading: isBatchesLoading } = useQuery({
    queryKey: ["inventory-batches", search, selectedOutlet, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedOutlet) params.append("outletId", selectedOutlet);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      return await ApiClient.get<{ data: BatchItem[]; meta: any }>(`/api/inventory/batches?${params.toString()}`);
    },
  });
  const batchList = batchesData?.data || [];

  // 4. Fetch Expiry Radar Summary
  const { data: radarData, isLoading: isRadarLoading } = useQuery({
    queryKey: ["expiry-radar", selectedOutlet],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedOutlet) params.append("outletId", selectedOutlet);
      return await ApiClient.get<{ data: ExpiryRadarSummary }>(`/api/inventory/expiry-radar?${params.toString()}`);
    },
  });
  const radarSummary = radarData?.data;

  // 5. Fetch Stock Mutations (Kartu Stok)
  const { data: mutationsData, isLoading: isMutationsLoading } = useQuery({
    queryKey: ["stock-cards", selectedProductFilter, selectedOutlet],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedProductFilter) params.append("productId", selectedProductFilter);
      if (selectedOutlet) params.append("outletId", selectedOutlet);
      return await ApiClient.get<{ data: StockMutationItem[]; meta: any }>(`/api/inventory/stock-cards?${params.toString()}`);
    },
    enabled: activeTab === "mutations",
  });
  const mutationList = mutationsData?.data || [];

  // 6. Fetch Opnames
  const { data: opnamesData, isLoading: isOpnamesLoading } = useQuery({
    queryKey: ["stock-opnames", selectedOutlet],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedOutlet) params.append("outletId", selectedOutlet);
      return await ApiClient.get<{ data: OpnameSession[]; meta: any }>(`/api/inventory/opnames?${params.toString()}`);
    },
    enabled: activeTab === "opname",
  });
  const opnamesList = opnamesData?.data || [];

  // 7. Fetch Opname Detail (When clicked)
  const { data: opnameDetailData, isLoading: isOpnameDetailLoading } = useQuery({
    queryKey: ["stock-opname-detail", viewOpnameDetailId],
    queryFn: async () => {
      if (!viewOpnameDetailId) return null;
      return await ApiClient.get<{ data: OpnameSession & { items: OpnameItemDetail[] } }>(
        `/api/inventory/opnames/${viewOpnameDetailId}`
      );
    },
    enabled: !!viewOpnameDetailId,
  });

  // MUTATIONS (Create batch, Adjust, Submit Opname)
  const addBatchMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await ApiClient.post("/api/inventory/batches", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-batches"] });
      queryClient.invalidateQueries({ queryKey: ["expiry-radar"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsAddBatchOpen(false);
      setNewBatchForm({
        productId: "",
        outletId: "",
        batchNumber: "",
        expiredDate: "",
        stockInBaseUnit: 0,
        costPerBaseUnit: 0,
        notes: "",
      });
    },
    onError: (err: any) => {
      alert(err.message || "Gagal menambahkan batch obat");
    },
  });

  const adjustStockMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await ApiClient.post("/api/inventory/adjustments", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-batches"] });
      queryClient.invalidateQueries({ queryKey: ["expiry-radar"] });
      queryClient.invalidateQueries({ queryKey: ["stock-cards"] });
      setIsAdjustmentOpen(false);
      setSelectedBatchForAdjustment(null);
      setAdjustmentForm({ type: "ADJUSTMENT_IN", qty: 1, notes: "" });
    },
    onError: (err: any) => {
      alert(err.message || "Gagal menyesuaikan stok");
    },
  });

  const submitOpnameMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await ApiClient.post("/api/inventory/opnames", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-batches"] });
      queryClient.invalidateQueries({ queryKey: ["expiry-radar"] });
      queryClient.invalidateQueries({ queryKey: ["stock-opnames"] });
      queryClient.invalidateQueries({ queryKey: ["stock-cards"] });
      setIsOpnameModalOpen(false);
      setOpnameDraftItems([]);
      setOpnameNotes("");
    },
    onError: (err: any) => {
      alert(err.message || "Gagal menyimpan stock opname");
    },
  });

  // Helpers
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBadge = (status: "EXPIRED" | "CRITICAL_3M" | "WARNING_6M" | "SAFE", days: number) => {
    switch (status) {
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800">
            <XCircle className="w-3 h-3 text-red-600" />
            Expired ({Math.abs(days)} hr lalu)
          </span>
        );
      case "CRITICAL_3M":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            <AlertTriangle className="w-3 h-3 text-orange-600" />
            Kritis ({days} hr)
          </span>
        );
      case "WARNING_6M":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Waspada ({days} hr)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Aman ({days} hr)
          </span>
        );
    }
  };

  // Handler to prepare Opname items from current batches
  const handleStartOpname = () => {
    const targetOutlet = selectedOutlet || (outletsList[0]?.id || "");
    setOpnameOutletId(targetOutlet);

    // Populate draft items from current loaded batches for that outlet
    const targetBatches = selectedOutlet
      ? batchList
      : batchList.filter((b) => !targetOutlet || b.outletId === targetOutlet);

    const initialDraft = targetBatches.map((b) => ({
      productId: b.productId,
      batchId: b.id,
      productName: b.productName,
      batchNumber: b.batchNumber,
      systemStock: b.stockInBaseUnit,
      physicalStock: b.stockInBaseUnit,
      reason: "",
    }));

    setOpnameDraftItems(initialDraft);
    setOpnameNotes("");
    setIsOpnameModalOpen(true);
  };

  const handleOpnameStockChange = (index: number, val: number) => {
    const next = [...opnameDraftItems];
    next[index].physicalStock = isNaN(val) ? 0 : val;
    setOpnameDraftItems(next);
  };

  const handleOpnameReasonChange = (index: number, val: string) => {
    const next = [...opnameDraftItems];
    next[index].reason = val;
    setOpnameDraftItems(next);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary-container rounded-xl text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <span className="material-symbols-outlined text-[24px]">inventory_2</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-on-surface">
                Manajemen Stok &amp; Batch Obat
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                FEFO Engine, Radar Kedaluwarsa, Kartu Stok Digital, &amp; Stock Opname Terintegrasi.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={() => {
              if (outletsList.length > 0 && !newBatchForm.outletId) {
                setNewBatchForm((prev) => ({ ...prev, outletId: outletsList[0].id }));
              }
              setIsAddBatchOpen(true);
            }}
            className="bg-primary-container hover:bg-blue-700 text-white font-semibold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Batch Awal
          </Button>

          <Button
            onClick={handleStartOpname}
            variant="outline"
            className="border-outline-variant/60 text-on-surface hover:bg-surface-container-low text-xs h-10 px-4 rounded-xl flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
            Mulai Stock Opname
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-outline-variant/20 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("batches")}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "batches"
              ? "border-primary-container text-primary-container"
              : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/50"
          }`}
        >
          <Layers className="w-4 h-4" />
          Stok & Batch (FEFO View)
        </button>

        <button
          onClick={() => setActiveTab("radar")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "radar"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:border-gray-300"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Radar Kedaluwarsa
          {radarSummary && radarSummary.expired.count + radarSummary.critical.count > 0 && (
            <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 font-bold rounded-full">
              {radarSummary.expired.count + radarSummary.critical.count}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("mutations")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "mutations"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:border-gray-300"
          }`}
        >
          <History className="w-4 h-4" />
          Kartu Stok (Audit Trail)
        </button>

        <button
          onClick={() => setActiveTab("opname")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "opname"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:border-gray-300"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Riwayat Stock Opname
        </button>
      </div>

      {/* Global Outlet Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="material-symbols-outlined text-[20px] text-primary-container">store</span>
          <span className="text-xs font-semibold text-on-surface">Cabang / Outlet:</span>
          <select
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            className="text-xs border border-outline-variant/50 bg-surface-container-lowest rounded-xl px-3 py-1.5 focus:border-primary-container focus:outline-none text-on-surface font-medium cursor-pointer"
          >
            <option value="">Semua Outlet</option>
            {outletsList.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        {activeTab === "batches" && (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-2 text-[16px] text-outline">search</span>
              <Input
                placeholder="Cari obat / no batch..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs border-outline-variant/50 bg-surface-container-lowest rounded-xl"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-outline-variant/50 bg-surface-container-lowest rounded-xl px-3 py-1.5 focus:border-primary-container focus:outline-none text-on-surface font-medium cursor-pointer"
            >
              <option value="ALL">Semua Status Expired</option>
              <option value="EXPIRED">🔴 Sudah Expired</option>
              <option value="CRITICAL_3M">🟠 Kritis &lt; 3 Bulan</option>
              <option value="WARNING_6M">🟡 Waspada 3-6 Bulan</option>
              <option value="SAFE">🟢 Aman &gt; 6 Bulan</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: FEFO BATCHES VIEW */}
      {activeTab === "batches" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary-container">auto_awesome</span>
              Urutan otomatis <strong>FEFO (First Expired First Out)</strong>: batch dengan tanggal kedaluwarsa terdekat berada paling atas.
            </span>
            <span>Total: <strong className="text-on-surface">{batchList.length}</strong> Batch Aktif</span>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-on-surface">
                <thead className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20 tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Nama Produk Obat</th>
                    <th className="px-4 py-3.5">No. Batch</th>
                    <th className="px-4 py-3.5">Status &amp; Tgl Kedaluwarsa</th>
                    <th className="px-4 py-3.5 text-right">Stok Fisik</th>
                    <th className="px-4 py-3.5 text-right">HPP / Unit</th>
                    <th className="px-4 py-3.5 text-right">Nilai Aset</th>
                    <th className="px-4 py-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {isBatchesLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                        <p className="mt-2 text-gray-500 text-xs">Memuat data batch stok...</p>
                      </td>
                    </tr>
                  ) : batchList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500">
                        <Package className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="font-medium">Tidak ada batch obat yang sesuai kriteria.</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Klik tombol &ldquo;Tambah Batch Awal&rdquo; untuk mendaftarkan stok fisik pertama.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    batchList.map((batch) => (
                      <tr
                        key={batch.id}
                        className={`hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors ${
                          batch.expiryStatus === "EXPIRED"
                            ? "bg-red-50/40 dark:bg-red-950/20"
                            : batch.expiryStatus === "CRITICAL_3M"
                            ? "bg-orange-50/40 dark:bg-orange-950/20"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {batch.productName}
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                              <span>SKU: {batch.productSku || "-"}</span>
                              <span>•</span>
                              <span>{batch.outletName}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {batch.batchNumber}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            <div className="font-medium text-xs text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              {new Date(batch.expiredDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                            {getStatusBadge(batch.expiryStatus, batch.daysUntilExpiry)}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span
                            className={`font-bold text-sm ${
                              batch.stockInBaseUnit <= 5
                                ? "text-red-600 dark:text-red-400"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {batch.stockInBaseUnit}
                          </span>{" "}
                          <span className="text-xs text-gray-500">{batch.baseUnit}</span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium text-xs">
                          {formatRupiah(Number(batch.costPerBaseUnit || 0))}
                        </td>
                        <td className="px-4 py-3.5 text-right font-semibold text-xs text-gray-900 dark:text-gray-100">
                          {formatRupiah(batch.estimatedValue)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <Button
                            onClick={() => {
                              setSelectedBatchForAdjustment(batch);
                              setAdjustmentForm({ type: "ADJUSTMENT_IN", qty: 1, notes: "" });
                              setIsAdjustmentOpen(true);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-xs px-2.5 h-8 gap-1"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            Koreksi
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXPIRY RADAR DASHBOARD */}
      {activeTab === "radar" && (
        <div className="space-y-6">
          {/* Radar Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Expired */}
            <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                    🔴 Kedaluwarsa (Expired)
                  </span>
                  <div className="p-2 bg-red-100 dark:bg-red-900/60 rounded-lg text-red-600 dark:text-red-300">
                    <XCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-red-700 dark:text-red-300">
                    {radarSummary?.expired.count || 0}{" "}
                    <span className="text-sm font-normal text-red-600">Batch</span>
                  </div>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1 font-medium">
                    Estimasi Kerugian:{" "}
                    <strong>{formatRupiah(radarSummary?.expired.value || 0)}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Kritis < 3 Bulan */}
            <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                    🟠 Kritis (&lt; 3 Bulan)
                  </span>
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/60 rounded-lg text-orange-600 dark:text-orange-300">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-orange-700 dark:text-orange-300">
                    {radarSummary?.critical.count || 0}{" "}
                    <span className="text-sm font-normal text-orange-600">Batch</span>
                  </div>
                  <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-1 font-medium">
                    Nilai Aset Berisiko:{" "}
                    <strong>{formatRupiah(radarSummary?.critical.value || 0)}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Waspada 3 - 6 Bulan */}
            <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    🟡 Waspada (3 - 6 Bulan)
                  </span>
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-lg text-amber-600 dark:text-amber-300">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-300">
                    {radarSummary?.warning.count || 0}{" "}
                    <span className="text-sm font-normal text-amber-600">Batch</span>
                  </div>
                  <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1 font-medium">
                    Total Nilai:{" "}
                    <strong>{formatRupiah(radarSummary?.warning.value || 0)}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Aman > 6 Bulan */}
            <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    🟢 Aman (&gt; 6 Bulan)
                  </span>
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg text-emerald-600 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {radarSummary?.safe.count || 0}{" "}
                    <span className="text-sm font-normal text-emerald-600">Batch</span>
                  </div>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1 font-medium">
                    Nilai Stok Sehat:{" "}
                    <strong>{formatRupiah(radarSummary?.safe.value || 0)}</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Recommendation Banner */}
          {radarSummary && (radarSummary.expired.count > 0 || radarSummary.critical.count > 0) && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-start gap-4">
              <div className="p-2.5 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Rekomendasi Tindakan Cepat (FEFO Alert)
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Terdapat <strong>{radarSummary.expired.count + radarSummary.critical.count} batch obat</strong> dengan nilai aset sebesar{" "}
                  <strong className="text-red-600">{formatRupiah(radarSummary.totalAtRiskValue)}</strong> yang perlu tindakan:
                </p>
                <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1 pt-1">
                  <li><strong>Tarik Obat Expired</strong> dari rak penjualan untuk dilakukan pemusnahan resmi / retur PBF.</li>
                  <li><strong>Aktifkan Diskon Promosi</strong> untuk obat status Kritis (&lt; 3 Bulan) agar terjual sebelum lewat masa edar.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Priority At-Risk Table */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Daftar Batch Berisiko Tinggi (Perlu Tindakan)
            </h3>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-200 text-xs uppercase font-semibold border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3">Nama Produk</th>
                      <th className="px-4 py-3">No. Batch</th>
                      <th className="px-4 py-3">Kedaluwarsa</th>
                      <th className="px-4 py-3 text-right">Sisa Stok</th>
                      <th className="px-4 py-3 text-right">Nilai Risiko</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {batchList.filter((b) => b.expiryStatus === "EXPIRED" || b.expiryStatus === "CRITICAL_3M").length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                          <p className="font-semibold text-emerald-600">Hebat! Tidak ada batch obat yang kritis atau kedaluwarsa.</p>
                        </td>
                      </tr>
                    ) : (
                      batchList
                        .filter((b) => b.expiryStatus === "EXPIRED" || b.expiryStatus === "CRITICAL_3M")
                        .map((batch) => (
                          <tr key={batch.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30">
                            <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                              {batch.productName}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs">{batch.batchNumber}</td>
                            <td className="px-4 py-3 text-xs">
                              {new Date(batch.expiredDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-red-600">
                              {batch.stockInBaseUnit} {batch.baseUnit}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-xs text-gray-900 dark:text-gray-100">
                              {formatRupiah(batch.estimatedValue)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {getStatusBadge(batch.expiryStatus, batch.daysUntilExpiry)}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KARTU STOK (AUDIT TRAIL MUTASI) */}
      {activeTab === "mutations" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Filter Produk:</span>
              <select
                value={selectedProductFilter}
                onChange={(e) => setSelectedProductFilter(e.target.value)}
                className="text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none min-w-[200px]"
              >
                <option value="">Semua Produk</option>
                {productsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-gray-500">
              Total Mutasi: <strong>{mutationList.length}</strong> catatan
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-200 text-xs uppercase font-semibold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3.5">Waktu & Tanggal</th>
                    <th className="px-4 py-3.5">Produk & Batch</th>
                    <th className="px-4 py-3.5">Tipe & No Dokumen</th>
                    <th className="px-4 py-3.5 text-right text-emerald-600">Masuk (+)</th>
                    <th className="px-4 py-3.5 text-right text-red-600">Keluar (-)</th>
                    <th className="px-4 py-3.5 text-right font-bold">Saldo Akhir</th>
                    <th className="px-4 py-3.5">Keterangan / Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {isMutationsLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                        <p className="mt-2 text-gray-500 text-xs">Memuat kartu stok mutasi...</p>
                      </td>
                    </tr>
                  ) : mutationList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500">
                        <History className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="font-medium">Belum ada riwayat mutasi stok.</p>
                      </td>
                    </tr>
                  ) : (
                    mutationList.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {new Date(m.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                          <div className="text-gray-400">
                            {new Date(m.createdAt).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {m.productName}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1 font-mono">
                            <span>Batch: {m.batchNumber || "-"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="inline-block px-2 py-0.5 rounded font-semibold text-[11px] bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            {m.type}
                          </span>
                          <div className="text-gray-500 font-mono text-[11px] mt-0.5">
                            {m.referenceNumber || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-bold text-emerald-600">
                          {m.qtyIn > 0 ? `+${m.qtyIn}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-bold text-red-600">
                          {m.qtyOut > 0 ? `-${m.qtyOut}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-black text-gray-900 dark:text-white">
                          {m.balanceAfter} <span className="font-normal text-gray-400">{m.baseUnit}</span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="text-gray-700 dark:text-gray-300 font-medium">
                            {m.notes || "-"}
                          </div>
                          <div className="text-gray-400 text-[11px]">
                            Oleh: {m.userName || "System"}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STOCK OPNAME HISTORY */}
      {activeTab === "opname" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Riwayat Sesi Stock Opname
              </h3>
              <p className="text-xs text-gray-500">
                Catatan audit stok berkala untuk memastikan akurasi saldo fisik dan sistem.
              </p>
            </div>
            <Button
              onClick={handleStartOpname}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 text-xs"
            >
              <Plus className="w-4 h-4" />
              Sesi Opname Baru
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-200 text-xs uppercase font-semibold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3.5">No. Dokumen Opname</th>
                    <th className="px-4 py-3.5">Tanggal Audit</th>
                    <th className="px-4 py-3.5">Outlet</th>
                    <th className="px-4 py-3.5 text-center">Total Item</th>
                    <th className="px-4 py-3.5 text-right">Total Selisih</th>
                    <th className="px-4 py-3.5">Petugas & Catatan</th>
                    <th className="px-4 py-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {isOpnamesLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                        <p className="mt-2 text-gray-500 text-xs">Memuat riwayat opname...</p>
                      </td>
                    </tr>
                  ) : opnamesList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500">
                        <FileCheck className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="font-medium">Belum ada sesi stock opname yang tersimpan.</p>
                      </td>
                    </tr>
                  ) : (
                    opnamesList.map((session) => (
                      <tr key={session.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-gray-900 dark:text-white">
                          {session.opnameNumber}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-600 dark:text-gray-300">
                          {new Date(session.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3.5 text-xs">{session.outletName}</td>
                        <td className="px-4 py-3.5 text-center font-bold text-xs">
                          {session.totalItems} Item
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs">
                          <span
                            className={`font-black ${
                              session.totalVariance === 0
                                ? "text-emerald-600"
                                : session.totalVariance < 0
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          >
                            {session.totalVariance > 0 ? `+${session.totalVariance}` : session.totalVariance}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {session.conductorName || "Petugas"}
                          </div>
                          <div className="text-gray-400 text-[11px] truncate max-w-xs">
                            {session.notes || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <Button
                            onClick={() => setViewOpnameDetailId(session.id)}
                            variant="ghost"
                            size="sm"
                            className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-xs px-2.5 h-8"
                          >
                            Lihat Detail
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: TAMBAH BATCH AWAL */}
      {isAddBatchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600">
                  <Package className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Tambah Batch Obat Awal
                </h2>
              </div>
              <button
                onClick={() => setIsAddBatchOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addBatchMutation.mutate(newBatchForm);
              }}
              className="space-y-4 pt-4"
            >
              <div>
                <Label className="text-xs font-semibold">Pilih Produk Obat *</Label>
                <select
                  required
                  value={newBatchForm.productId}
                  onChange={(e) => setNewBatchForm({ ...newBatchForm, productId: e.target.value })}
                  className="mt-1 w-full text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">-- Pilih Produk --</option>
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.baseUnit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Cabang Outlet *</Label>
                <select
                  required
                  value={newBatchForm.outletId}
                  onChange={(e) => setNewBatchForm({ ...newBatchForm, outletId: e.target.value })}
                  className="mt-1 w-full text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {outletsList.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Nomor Batch *</Label>
                  <Input
                    required
                    placeholder="Contoh: BTH-2026-001"
                    value={newBatchForm.batchNumber}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, batchNumber: e.target.value })}
                    className="mt-1 font-mono text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tgl Kedaluwarsa *</Label>
                  <Input
                    required
                    type="date"
                    value={newBatchForm.expiredDate}
                    onChange={(e) => setNewBatchForm({ ...newBatchForm, expiredDate: e.target.value })}
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Stok Fisik Awal *</Label>
                  <Input
                    required
                    type="number"
                    min="0"
                    value={newBatchForm.stockInBaseUnit}
                    onChange={(e) =>
                      setNewBatchForm({
                        ...newBatchForm,
                        stockInBaseUnit: parseInt(e.target.value || "0", 10),
                      })
                    }
                    className="mt-1 text-sm font-bold"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">HPP / Satuan (Rp)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newBatchForm.costPerBaseUnit}
                    onChange={(e) =>
                      setNewBatchForm({
                        ...newBatchForm,
                        costPerBaseUnit: parseFloat(e.target.value || "0"),
                      })
                    }
                    className="mt-1 text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Catatan</Label>
                <Input
                  placeholder="Opsional: Stok awal sistem / penyerahan gudang"
                  value={newBatchForm.notes}
                  onChange={(e) => setNewBatchForm({ ...newBatchForm, notes: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddBatchOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={addBatchMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {addBatchMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Batch"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: QUICK STOK ADJUSTMENT */}
      {isAdjustmentOpen && selectedBatchForAdjustment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600">
                  <ArrowUpDown className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Koreksi Cepat Stok Batch
                  </h2>
                  <p className="text-xs text-gray-400 font-mono">
                    Batch: {selectedBatchForAdjustment.batchNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustmentOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl my-3 text-xs space-y-1">
              <div className="font-semibold text-gray-900 dark:text-white">
                {selectedBatchForAdjustment.productName}
              </div>
              <div className="text-gray-500">
                Stok Saat Ini:{" "}
                <strong className="text-emerald-600">
                  {selectedBatchForAdjustment.stockInBaseUnit} {selectedBatchForAdjustment.baseUnit}
                </strong>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                adjustStockMutation.mutate({
                  batchId: selectedBatchForAdjustment.id,
                  type: adjustmentForm.type,
                  qty: adjustmentForm.qty,
                  notes: adjustmentForm.notes,
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label className="text-xs font-semibold">Tipe Penyesuaian</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setAdjustmentForm({ ...adjustmentForm, type: "ADJUSTMENT_IN" })}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      adjustmentForm.type === "ADJUSTMENT_IN"
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Tambah Stok (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentForm({ ...adjustmentForm, type: "ADJUSTMENT_OUT" })}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      adjustmentForm.type === "ADJUSTMENT_OUT"
                        ? "border-red-600 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    Kurangi Stok (-)
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Jumlah Koreksi ({selectedBatchForAdjustment.baseUnit}) *</Label>
                <Input
                  required
                  type="number"
                  min="1"
                  value={adjustmentForm.qty}
                  onChange={(e) =>
                    setAdjustmentForm({
                      ...adjustmentForm,
                      qty: parseInt(e.target.value || "1", 10),
                    })
                  }
                  className="mt-1 font-bold text-base"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Alasan Penyesuaian *</Label>
                <Input
                  required
                  placeholder="Misal: Barang pecah/rusak, sampel uji klinis, selisih fisik"
                  value={adjustmentForm.notes}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdjustmentOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={adjustStockMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {adjustStockMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Memproses...
                    </>
                  ) : (
                    "Simpan Koreksi"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MULAI STOCK OPNAME FORM */}
      {isOpnameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full p-6 border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Formulir Stock Opname Fisik
                  </h2>
                  <p className="text-xs text-gray-500">
                    Bandingkan stok fisik di rak obat dengan catatan sistem.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpnameModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold">Outlet:</span>
                <select
                  value={opnameOutletId}
                  onChange={(e) => setOpnameOutletId(e.target.value)}
                  className="text-xs border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-emerald-500"
                >
                  {outletsList.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-80">
                <Input
                  placeholder="Catatan umum sesi opname..."
                  value={opnameNotes}
                  onChange={(e) => setOpnameNotes(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>

            {/* Table of items to count */}
            <div className="flex-1 overflow-y-auto py-3">
              <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-gray-200 uppercase font-semibold sticky top-0">
                  <tr>
                    <th className="px-3 py-2.5">Produk & No. Batch</th>
                    <th className="px-3 py-2.5 text-center">Stok Sistem</th>
                    <th className="px-3 py-2.5 text-center">Stok Fisik Aktual</th>
                    <th className="px-3 py-2.5 text-center">Selisih</th>
                    <th className="px-3 py-2.5">Alasan / Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {opnameDraftItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400">
                        Tidak ada batch terdaftar untuk di-opname pada outlet ini.
                      </td>
                    </tr>
                  ) : (
                    opnameDraftItems.map((item, idx) => {
                      const variance = item.physicalStock - item.systemStock;
                      return (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                          <td className="px-3 py-2.5">
                            <div className="font-bold text-gray-900 dark:text-white">
                              {item.productName}
                            </div>
                            <div className="font-mono text-[11px] text-gray-400">
                              Batch: {item.batchNumber}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-center font-bold text-gray-700 dark:text-gray-300">
                            {item.systemStock}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <input
                              type="number"
                              min="0"
                              value={item.physicalStock}
                              onChange={(e) =>
                                handleOpnameStockChange(idx, parseInt(e.target.value, 10))
                              }
                              className="w-20 text-center font-black text-sm border border-emerald-500 rounded-md py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className={`font-black text-xs px-2 py-0.5 rounded-full ${
                                variance === 0
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                  : variance < 0
                                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              }`}
                            >
                              {variance > 0 ? `+${variance}` : variance}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <input
                              placeholder={variance !== 0 ? "Wajib isi alasan selisih" : "Sesuai"}
                              value={item.reason}
                              onChange={(e) => handleOpnameReasonChange(idx, e.target.value)}
                              className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500">
                Total <strong>{opnameDraftItems.length}</strong> batch obat dihitung.
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpnameModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  onClick={() => {
                    if (!opnameOutletId) {
                      alert("Silakan pilih outlet");
                      return;
                    }
                    submitOpnameMutation.mutate({
                      outletId: opnameOutletId,
                      notes: opnameNotes,
                      items: opnameDraftItems.map((item) => ({
                        productId: item.productId,
                        batchId: item.batchId,
                        systemStock: item.systemStock,
                        physicalStock: item.physicalStock,
                        reason: item.reason,
                      })),
                    });
                  }}
                  disabled={submitOpnameMutation.isPending || opnameDraftItems.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {submitOpnameMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Sinkronisasi DB...
                    </>
                  ) : (
                    "Simpan & Sinkronkan Stok"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DETAIL SESI STOCK OPNAME */}
      {viewOpnameDetailId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-gray-100 dark:border-gray-700 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-emerald-600">
                    {opnameDetailData?.data.opnameNumber}
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-none text-xs">
                    {opnameDetailData?.data.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Cabang: <strong>{opnameDetailData?.data.outletName}</strong> • Petugas:{" "}
                  <strong>{opnameDetailData?.data.conductorName || "Petugas"}</strong>
                </p>
              </div>
              <button
                onClick={() => setViewOpnameDetailId(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3">
              {isOpnameDetailLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                </div>
              ) : (
                <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2">Produk & Batch</th>
                      <th className="px-3 py-2 text-center">Stok Sistem</th>
                      <th className="px-3 py-2 text-center">Stok Fisik</th>
                      <th className="px-3 py-2 text-center">Selisih</th>
                      <th className="px-3 py-2">Alasan Penyesuaian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {opnameDetailData?.data.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2 font-medium">
                          <div className="text-gray-900 dark:text-white">{item.productName}</div>
                          <div className="text-gray-400 font-mono text-[11px]">
                            Batch: {item.batchNumber || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-center">{item.systemStock}</td>
                        <td className="px-3 py-2 text-center font-bold">{item.physicalStock}</td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`font-black ${
                              item.variance === 0
                                ? "text-emerald-600"
                                : item.variance < 0
                                ? "text-red-600"
                                : "text-blue-600"
                            }`}
                          >
                            {item.variance > 0 ? `+${item.variance}` : item.variance}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-gray-500">{item.reason || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <Button variant="outline" onClick={() => setViewOpnameDetailId(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
