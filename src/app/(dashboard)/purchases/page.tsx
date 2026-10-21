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
  FileSpreadsheet,
  Truck,
  Plus,
  Search,
  Calendar,
  DollarSign,
  AlertTriangle,
  FileText,
  Printer,
  X,
  Trash2,
  CheckCircle2,
  Clock,
  Building2,
  CreditCard,
  History,
  Layers,
  Sparkles,
  Loader2,
  Info,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import {
  PurchaseOrderPrintModal,
  PurchaseOrderPrintData,
} from "@/components/purchase-order-print-modal";

interface SupplierItem {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
}

interface OutletItem {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  siaNumber?: string | null;
  sipaNumber?: string | null;
}

interface ProductUnitItem {
  id: string;
  unitName: string;
  conversionFactor: number;
  buyPrice: string | number;
  sellPrice: string | number;
  isBaseUnit: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  genericName?: string | null;
  sku?: string | null;
  barcode?: string | null;
  baseUnit: string;
  category: string;
  units?: ProductUnitItem[];
}

interface PurchaseInvoiceItem {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  totalAmount: string | number;
  paidAmount: string | number;
  paymentStatus: "unpaid" | "partial" | "paid";
  scanInvoiceUrl?: string | null;
  outletId: string;
  outletName: string;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string | null;
  createdAt: string;
}

interface PurchaseInvoiceDetail extends PurchaseInvoiceItem {
  supplierAddress?: string | null;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productSku?: string | null;
    batchId: string;
    batchNumber: string;
    expiredDate: string;
    unitId: string;
    unitName: string;
    conversionFactor: number;
    quantity: number;
    pricePerUnit: string | number;
    discount: string | number;
    subtotal: string | number;
  }>;
  payments: Array<{
    id: string;
    paymentDate: string;
    amount: string | number;
    paymentMethod: string;
    referenceNumber?: string | null;
    notes?: string | null;
    userName?: string | null;
    createdAt: string;
  }>;
}

interface PurchaseOrderItem {
  id: string;
  orderNumber: string;
  orderType: "REGULAR" | "PRECURSOR" | "OOT" | "PSYCHOTROPIC" | "NARCOTIC";
  orderDate: string;
  status: "DRAFT" | "SENT" | "RECEIVED" | "CANCELLED";
  apaName?: string | null;
  apaSipa?: string | null;
  notes?: string | null;
  outletId: string;
  outletName: string;
  outletSia?: string | null;
  outletSipa?: string | null;
  supplierId: string;
  supplierName: string;
  supplierPhone?: string | null;
  supplierAddress?: string | null;
  createdAt: string;
}

interface DebtSummary {
  totalOutstanding: number;
  overdue: { count: number; amount: number };
  dueThisWeek: { count: number; amount: number };
  totalPaid: number;
  totalInvoices: number;
}

export default function PurchasesPage() {
  const queryClient = useQueryClient();

  // Active Tab: 'invoices' | 'orders' | 'debts'
  const [activeTab, setActiveTab] = useState<"invoices" | "orders" | "debts">("invoices");

  // Filters
  const [search, setSearch] = useState("");
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [orderTypeFilter, setOrderTypeFilter] = useState("ALL");

  // Modals state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<PurchaseInvoiceItem | null>(null);

  // SP Print Preview Modal state
  const [printOrderData, setPrintOrderData] = useState<PurchaseOrderPrintData | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Form: Invoice Form State
  const [invoiceForm, setInvoiceForm] = useState<{
    outletId: string;
    supplierId: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    includePpn: boolean;
    invoiceDiscount: number;
    paidAmount: number;
    scanInvoiceUrl: string;
    items: Array<{
      productId: string;
      unitId: string;
      quantity: number;
      pricePerUnit: number;
      discount: number;
      subtotal: number;
      batchNumber: string;
      expiredDate: string;
    }>;
  }>({
    outletId: "",
    supplierId: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    includePpn: false,
    invoiceDiscount: 0,
    paidAmount: 0,
    scanInvoiceUrl: "",
    items: [
      {
        productId: "",
        unitId: "",
        quantity: 1,
        pricePerUnit: 0,
        discount: 0,
        subtotal: 0,
        batchNumber: "",
        expiredDate: "",
      },
    ],
  });

  // Form: Purchase Order (SP) Form State
  const [orderForm, setOrderForm] = useState<{
    outletId: string;
    supplierId: string;
    orderType: "REGULAR" | "PRECURSOR" | "OOT" | "PSYCHOTROPIC" | "NARCOTIC";
    orderDate: string;
    apaName: string;
    apaSipa: string;
    notes: string;
    items: Array<{
      productId: string;
      quantity: number;
      unitName: string;
      dosageForm: string;
      strength: string;
      notes: string;
    }>;
  }>({
    outletId: "",
    supplierId: "",
    orderType: "REGULAR",
    orderDate: new Date().toISOString().slice(0, 10),
    apaName: "",
    apaSipa: "",
    notes: "",
    items: [
      {
        productId: "",
        quantity: 1,
        unitName: "Box",
        dosageForm: "Tablet",
        strength: "",
        notes: "",
      },
    ],
  });

  // Form: Payment Form State
  const [paymentForm, setPaymentForm] = useState<{
    paymentDate: string;
    amount: number;
    paymentMethod: "BANK_TRANSFER" | "CASH" | "GIRO";
    referenceNumber: string;
    notes: string;
  }>({
    paymentDate: new Date().toISOString().slice(0, 10),
    amount: 0,
    paymentMethod: "BANK_TRANSFER",
    referenceNumber: "",
    notes: "",
  });

  // =========================================================================
  // QUERIES
  // =========================================================================

  // 1. Fetch Outlets
  const { data: outletsData } = useQuery({
    queryKey: ["outlets"],
    queryFn: async () => {
      const res = await ApiClient.get<{ data: OutletItem[] }>("/api/outlets");
      return res.data || [];
    },
  });
  const outletsList = outletsData || [];

  // 2. Fetch Suppliers
  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers-list"],
    queryFn: async () => {
      const res = await ApiClient.get<{ data: SupplierItem[] }>("/api/suppliers");
      return res.data || [];
    },
  });
  const suppliersList = suppliersData || [];

  // 3. Fetch Products with Units
  const { data: productsData } = useQuery({
    queryKey: ["products-with-units"],
    queryFn: async () => {
      const res = await ApiClient.get<{ data: ProductItem[] }>("/api/products?limit=100");
      return res.data || [];
    },
  });
  const productsList = productsData || [];

  // 4. Fetch Invoices
  const { data: invoicesData, isLoading: isInvoicesLoading } = useQuery({
    queryKey: ["purchase-invoices", search, selectedOutlet, selectedSupplier, paymentStatusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedOutlet) params.append("outletId", selectedOutlet);
      if (selectedSupplier) params.append("supplierId", selectedSupplier);
      if (paymentStatusFilter !== "ALL") params.append("paymentStatus", paymentStatusFilter);
      return await ApiClient.get<{ data: PurchaseInvoiceItem[]; meta: any }>(
        `/api/purchases/invoices?${params.toString()}`
      );
    },
  });
  const invoiceList = invoicesData?.data || [];

  // 5. Fetch Invoice Detail
  const { data: invoiceDetailData, isLoading: isInvoiceDetailLoading } = useQuery({
    queryKey: ["purchase-invoice-detail", viewInvoiceId],
    queryFn: async () => {
      if (!viewInvoiceId) return null;
      return await ApiClient.get<{ data: PurchaseInvoiceDetail }>(`/api/purchases/invoices/${viewInvoiceId}`);
    },
    enabled: !!viewInvoiceId,
  });

  // 6. Fetch Purchase Orders (SP)
  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["purchase-orders", search, selectedOutlet, selectedSupplier, orderTypeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedOutlet) params.append("outletId", selectedOutlet);
      if (selectedSupplier) params.append("supplierId", selectedSupplier);
      if (orderTypeFilter !== "ALL") params.append("orderType", orderTypeFilter);
      return await ApiClient.get<{ data: PurchaseOrderItem[]; meta: any }>(
        `/api/purchases/orders?${params.toString()}`
      );
    },
    enabled: activeTab === "orders",
  });
  const orderList = ordersData?.data || [];

  // 7. Fetch Debts Summary
  const { data: debtsData, isLoading: isDebtsLoading } = useQuery({
    queryKey: ["debts-summary", selectedOutlet],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedOutlet) params.append("outletId", selectedOutlet);
      return await ApiClient.get<{ data: DebtSummary }>(`/api/purchases/debts/summary?${params.toString()}`);
    },
  });
  const debtSummary = debtsData?.data;

  // =========================================================================
  // MUTATIONS
  // =========================================================================

  // Create Invoice Mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await ApiClient.post("/api/purchases/invoices", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["debts-summary"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-batches"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsInvoiceModalOpen(false);
      resetInvoiceForm();
    },
    onError: (err: any) => {
      alert(err.message || "Gagal menyimpan faktur pembelian");
    },
  });

  // Create Order Mutation
  const createOrderMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await ApiClient.post("/api/purchases/orders", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      setIsOrderModalOpen(false);
      resetOrderForm();
    },
    onError: (err: any) => {
      alert(err.message || "Gagal membuat Surat Pesanan");
    },
  });

  // Pay Debt Mutation
  const payDebtMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return await ApiClient.post(`/api/purchases/invoices/${id}/payments`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["debts-summary"] });
      queryClient.invalidateQueries({ queryKey: ["purchase-invoice-detail"] });
      setIsPaymentModalOpen(false);
      setSelectedInvoiceForPayment(null);
      setPaymentForm({
        paymentDate: new Date().toISOString().slice(0, 10),
        amount: 0,
        paymentMethod: "BANK_TRANSFER",
        referenceNumber: "",
        notes: "",
      });
    },
    onError: (err: any) => {
      alert(err.message || "Gagal menyimpan pembayaran hutang");
    },
  });

  // =========================================================================
  // CALCULATIONS & HELPERS
  // =========================================================================

  const formatRupiah = (num: number | string) => {
    const val = typeof num === "string" ? parseFloat(num) : num;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const calculateInvoiceTotals = useMemo(() => {
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const afterDiscount = Math.max(0, subtotal - (invoiceForm.invoiceDiscount || 0));
    const ppn = invoiceForm.includePpn ? afterDiscount * 0.11 : 0;
    const grandTotal = afterDiscount + ppn;
    const remaining = Math.max(0, grandTotal - (invoiceForm.paidAmount || 0));
    return { subtotal, ppn, grandTotal, remaining };
  }, [invoiceForm]);

  const resetInvoiceForm = () => {
    setInvoiceForm({
      outletId: outletsList[0]?.id || "",
      supplierId: suppliersList[0]?.id || "",
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      includePpn: false,
      invoiceDiscount: 0,
      paidAmount: 0,
      scanInvoiceUrl: "",
      items: [
        {
          productId: "",
          unitId: "",
          quantity: 1,
          pricePerUnit: 0,
          discount: 0,
          subtotal: 0,
          batchNumber: "",
          expiredDate: "",
        },
      ],
    });
  };

  const resetOrderForm = () => {
    setOrderForm({
      outletId: outletsList[0]?.id || "",
      supplierId: suppliersList[0]?.id || "",
      orderType: "REGULAR",
      orderDate: new Date().toISOString().slice(0, 10),
      apaName: "",
      apaSipa: "",
      notes: "",
      items: [
        {
          productId: "",
          quantity: 1,
          unitName: "Box",
          dosageForm: "Tablet",
          strength: "",
          notes: "",
        },
      ],
    });
  };

  const handleInvoiceItemChange = (index: number, field: string, value: any) => {
    const items = [...invoiceForm.items];
    const current = { ...items[index], [field]: value };

    if (field === "productId") {
      const prod = productsList.find((p) => p.id === value);
      if (prod && prod.units && prod.units.length > 0) {
        current.unitId = prod.units[0].id;
        current.pricePerUnit = Number(prod.units[0].buyPrice || 0);
      }
    }

    if (field === "unitId") {
      const prod = productsList.find((p) => p.id === current.productId);
      const selectedUnit = prod?.units?.find((u) => u.id === value);
      if (selectedUnit) {
        current.pricePerUnit = Number(selectedUnit.buyPrice || 0);
      }
    }

    // Calculate subtotal
    const qty = current.quantity || 0;
    const price = current.pricePerUnit || 0;
    const disc = current.discount || 0;
    current.subtotal = Math.max(0, qty * price - disc);

    items[index] = current;
    setInvoiceForm({ ...invoiceForm, items });
  };

  const addInvoiceItemRow = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [
        ...invoiceForm.items,
        {
          productId: "",
          unitId: "",
          quantity: 1,
          pricePerUnit: 0,
          discount: 0,
          subtotal: 0,
          batchNumber: "",
          expiredDate: "",
        },
      ],
    });
  };

  const removeInvoiceItemRow = (index: number) => {
    if (invoiceForm.items.length <= 1) return;
    const next = invoiceForm.items.filter((_, i) => i !== index);
    setInvoiceForm({ ...invoiceForm, items: next });
  };

  const handleOrderItemChange = (index: number, field: string, value: any) => {
    const items = [...orderForm.items];
    items[index] = { ...items[index], [field]: value };
    setOrderForm({ ...orderForm, items });
  };

  const addOrderItemRow = () => {
    setOrderForm({
      ...orderForm,
      items: [
        ...orderForm.items,
        {
          productId: "",
          quantity: 1,
          unitName: "Box",
          dosageForm: "Tablet",
          strength: "",
          notes: "",
        },
      ],
    });
  };

  const removeOrderItemRow = (index: number) => {
    if (orderForm.items.length <= 1) return;
    const next = orderForm.items.filter((_, i) => i !== index);
    setOrderForm({ ...orderForm, items: next });
  };

  const openOrderPrint = async (orderId: string) => {
    try {
      const res = await ApiClient.get<{ data: PurchaseOrderPrintData }>(`/api/purchases/orders/${orderId}`);
      if (res.data) {
        setPrintOrderData(res.data);
        setIsPrintModalOpen(true);
      }
    } catch (e: any) {
      alert("Gagal memuat format cetak SP");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-on-surface">
                Pengadaan & Faktur Pembelian PBF
              </h1>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Surat Pesanan Resmi BPOM, Penerimaan Barang Otomatis Batch, & Buku Hutang Dagang (AP).
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              if (outletsList.length > 0 && !invoiceForm.outletId) {
                setInvoiceForm((p) => ({ ...p, outletId: outletsList[0].id }));
              }
              if (suppliersList.length > 0 && !invoiceForm.supplierId) {
                setInvoiceForm((p) => ({ ...p, supplierId: suppliersList[0].id }));
              }
              setIsInvoiceModalOpen(true);
            }}
            className="bg-primary-container hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm rounded-xl text-xs"
          >
            <Plus className="w-4 h-4" />
            Input Faktur Pembelian
          </Button>

          <Button
            onClick={() => {
              if (outletsList.length > 0 && !orderForm.outletId) {
                setOrderForm((p) => ({ ...p, outletId: outletsList[0].id }));
              }
              if (suppliersList.length > 0 && !orderForm.supplierId) {
                setOrderForm((p) => ({ ...p, supplierId: suppliersList[0].id }));
              }
              setIsOrderModalOpen(true);
            }}
            variant="outline"
            className="border-outline-variant/40 text-on-surface hover:bg-surface-container-low flex items-center gap-2 rounded-xl text-xs"
          >
            <FileText className="w-4 h-4" />
            Buat Surat Pesanan (SP)
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant/30 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("invoices")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "invoices"
              ? "border-primary-container text-primary-container"
              : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/40"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Faktur Pembelian PBF
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "orders"
              ? "border-primary-container text-primary-container"
              : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/40"
          }`}
        >
          <FileText className="w-4 h-4" />
          Surat Pesanan (SP) Resmi
        </button>

        <button
          onClick={() => setActiveTab("debts")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "debts"
              ? "border-primary-container text-primary-container"
              : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant/40"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Buku Hutang Dagang (AP)
          {debtSummary && debtSummary.overdue.count > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-700 font-bold rounded-full">
              {debtSummary.overdue.count} Overdue
            </span>
          )}
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-on-surface-variant/60" />
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="text-xs border border-outline-variant/30 bg-surface-container-low rounded-xl px-2.5 py-1.5 text-on-surface focus:ring-2 focus:ring-primary-container"
            >
              <option value="">Semua Cabang</option>
              {outletsList.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-on-surface-variant/60" />
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="text-xs border border-outline-variant/30 bg-surface-container-low rounded-xl px-2.5 py-1.5 text-on-surface focus:ring-2 focus:ring-primary-container"
            >
              <option value="">Semua Distributor PBF</option>
              {suppliersList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {activeTab === "invoices" && (
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="text-xs border border-outline-variant/30 bg-surface-container-low rounded-xl px-2.5 py-1.5 text-on-surface focus:ring-2 focus:ring-primary-container"
            >
              <option value="ALL">Semua Status Bayar</option>
              <option value="unpaid">🔴 Belum Lunas (Hutang)</option>
              <option value="partial">🟡 Sebagian (Partial)</option>
              <option value="paid">🟢 Lunas (Paid)</option>
            </select>
          )}

          {activeTab === "orders" && (
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
              className="text-xs border border-outline-variant/30 bg-surface-container-low rounded-xl px-2.5 py-1.5 text-on-surface focus:ring-2 focus:ring-primary-container"
            >
              <option value="ALL">Semua Tipe SP</option>
              <option value="REGULAR">SP Reguler (Standar)</option>
              <option value="PRECURSOR">SP Prekursor Farmasi</option>
              <option value="OOT">SP Obat-Obat Tertentu (OOT)</option>
              <option value="PSYCHOTROPIC">SP Psikotropika</option>
              <option value="NARCOTIC">SP Narkotika</option>
            </select>
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
          <Input
            placeholder={activeTab === "invoices" ? "Cari No. Faktur / PBF..." : "Cari No. SP..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-surface-container-low border-outline-variant/30 text-on-surface rounded-xl"
          />
        </div>
      </div>

      {/* TAB 1: FAKTUR PEMBELIAN */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-on-surface">
                <thead className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
                  <tr>
                    <th className="px-4 py-3.5">No. Faktur PBF</th>
                    <th className="px-4 py-3.5">Distributor & Cabang</th>
                    <th className="px-4 py-3.5">Tgl Faktur / Jatuh Tempo</th>
                    <th className="px-4 py-3.5 text-right">Total Faktur</th>
                    <th className="px-4 py-3.5 text-right">Sisa Hutang</th>
                    <th className="px-4 py-3.5 text-center">Status Bayar</th>
                    <th className="px-4 py-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {isInvoicesLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                        <p className="mt-2 text-gray-500 text-xs">Memuat daftar faktur pembelian...</p>
                      </td>
                    </tr>
                  ) : invoiceList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500">
                        <FileSpreadsheet className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="font-medium">Belum ada faktur pembelian yang tercatat.</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Klik &ldquo;Input Faktur Pembelian&rdquo; untuk menerima barang dari distributor.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    invoiceList.map((inv) => {
                      const total = Number(inv.totalAmount || 0);
                      const paid = Number(inv.paidAmount || 0);
                      const remaining = Math.max(0, total - paid);

                      return (
                        <tr key={inv.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-4 py-3.5 font-mono text-xs font-bold text-on-surface">
                            {inv.invoiceNumber}
                          </td>
                          <td className="px-4 py-3.5 text-xs">
                            <div className="font-bold text-on-surface">
                              {inv.supplierName}
                            </div>
                            <div className="text-on-surface-variant/70 mt-0.5">{inv.outletName}</div>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-on-surface">
                            <div>
                              Faktur:{" "}
                              {new Date(inv.invoiceDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-on-surface-variant/70 mt-0.5">
                              Jatuh Tempo:{" "}
                              {inv.dueDate
                                ? new Date(inv.dueDate).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right font-black text-xs text-on-surface">
                            {formatRupiah(total)}
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold text-xs">
                            {remaining > 0 ? (
                              <span className="text-red-600 font-semibold">{formatRupiah(remaining)}</span>
                            ) : (
                              <span className="text-emerald-600">Rp 0 (Lunas)</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {inv.paymentStatus === "paid" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Lunas
                              </span>
                            ) : inv.paymentStatus === "partial" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                <Clock className="w-3 h-3 text-amber-600" />
                                Sebagian
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                                Belum Lunas
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Button
                                onClick={() => setViewInvoiceId(inv.id)}
                                variant="ghost"
                                size="sm"
                                className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-xs px-2.5 h-8"
                              >
                                Detail
                              </Button>
                              {remaining > 0 && (
                                <Button
                                  onClick={() => {
                                    setSelectedInvoiceForPayment(inv);
                                    setPaymentForm({
                                      paymentDate: new Date().toISOString().slice(0, 10),
                                      amount: remaining,
                                      paymentMethod: "BANK_TRANSFER",
                                      referenceNumber: "",
                                      notes: "",
                                    });
                                    setIsPaymentModalOpen(true);
                                  }}
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 h-8 gap-1"
                                >
                                  <CreditCard className="w-3 h-3" />
                                  Bayar
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SURAT PESANAN (SP) RESMI */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-on-surface">
                <thead className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
                  <tr>
                    <th className="px-4 py-3.5">Nomor SP</th>
                    <th className="px-4 py-3.5">Tipe Surat Pesanan</th>
                    <th className="px-4 py-3.5">Tujuan Distributor (PBF)</th>
                    <th className="px-4 py-3.5">Apoteker APA & Outlet</th>
                    <th className="px-4 py-3.5">Tgl Pesanan</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-center">Aksi Dokumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {isOrdersLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-container mx-auto" />
                        <p className="mt-2 text-on-surface-variant text-xs">Memuat daftar Surat Pesanan...</p>
                      </td>
                    </tr>
                  ) : orderList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-on-surface-variant">
                        <FileText className="w-10 h-10 text-on-surface-variant/40 mx-auto mb-2" />
                        <p className="font-medium text-on-surface">Belum ada Surat Pesanan yang diterbitkan.</p>
                        <p className="text-xs text-on-surface-variant mt-1">
                          Klik &ldquo;Buat Surat Pesanan (SP)&rdquo; untuk memesan obat ke PBF resmi.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    orderList.map((order) => (
                      <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs font-bold text-on-surface">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-3.5 text-xs">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                              order.orderType === "NARCOTIC"
                                ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                                : order.orderType === "PSYCHOTROPIC"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                                : order.orderType === "PRECURSOR"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            }`}
                          >
                            {order.orderType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {order.supplierName}
                          </div>
                          <div className="text-gray-400 text-[11px]">{order.supplierPhone || "-"}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {order.apaName || "Apoteker APA"}
                          </div>
                          <div className="text-gray-400 text-[11px]">{order.outletName}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs">
                          {new Date(order.orderDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <Button
                            onClick={() => openOrderPrint(order.id)}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 h-8 gap-1.5"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Cetak SP
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

      {/* TAB 3: BUKU HUTANG DAGANG (AP) */}
      {activeTab === "debts" && (
        <div className="space-y-6">
          {/* AP KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-red-700 dark:text-red-400">
                    Total Hutang Berjalan
                  </span>
                  <div className="p-2 bg-red-100 dark:bg-red-900/60 rounded-lg text-red-600 dark:text-red-300">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-red-700 dark:text-red-300">
                    {formatRupiah(debtSummary?.totalOutstanding || 0)}
                  </div>
                  <p className="text-xs text-red-600/80 mt-1">Sisa tagihan yang harus dibayar ke PBF</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                    Lewat Jatuh Tempo (Overdue)
                  </span>
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/60 rounded-lg text-orange-600 dark:text-orange-300">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-orange-700 dark:text-orange-300">
                    {formatRupiah(debtSummary?.overdue.amount || 0)}
                  </div>
                  <p className="text-xs text-orange-600/80 mt-1">
                    <strong>{debtSummary?.overdue.count || 0} Faktur</strong> sudah melewati TOP
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Jatuh Tempo 7 Hari ke Depan
                  </span>
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/60 rounded-lg text-amber-600 dark:text-amber-300">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-amber-700 dark:text-amber-300">
                    {formatRupiah(debtSummary?.dueThisWeek.amount || 0)}
                  </div>
                  <p className="text-xs text-amber-600/80 mt-1">
                    <strong>{debtSummary?.dueThisWeek.count || 0} Faktur</strong> jatuh tempo minggu ini
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Total Sudah Dibayar
                  </span>
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 rounded-lg text-emerald-600 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {formatRupiah(debtSummary?.totalPaid || 0)}
                  </div>
                  <p className="text-xs text-emerald-600/80 mt-1">Pembayaran faktur sukses tersalurkan</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Aging Schedule Table */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-container" />
              Daftar Faktur Hutang Dagang yang Belum Lunas
            </h3>

            <div className="bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-on-surface">
                  <thead className="bg-surface-container-low text-on-surface-variant text-[11px] uppercase font-semibold border-b border-outline-variant/20">
                    <tr>
                      <th className="px-4 py-3.5">No. Faktur</th>
                      <th className="px-4 py-3.5">Distributor PBF</th>
                      <th className="px-4 py-3.5">Tgl Jatuh Tempo</th>
                      <th className="px-4 py-3.5 text-right">Total Faktur</th>
                      <th className="px-4 py-3.5 text-right">Sudah Dibayar</th>
                      <th className="px-4 py-3.5 text-right text-red-600 font-bold">Sisa Hutang</th>
                      <th className="px-4 py-3.5 text-center">Aksi Bayar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15">
                    {invoiceList.filter((i) => i.paymentStatus !== "paid").length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-on-surface-variant">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                          <p className="font-semibold text-emerald-600">Luar biasa! Semua faktur pembelian telah lunas.</p>
                        </td>
                      </tr>
                    ) : (
                      invoiceList
                        .filter((i) => i.paymentStatus !== "paid")
                        .map((inv) => {
                          const total = Number(inv.totalAmount || 0);
                          const paid = Number(inv.paidAmount || 0);
                          const remaining = total - paid;
                          const isOverdue = inv.dueDate ? new Date(inv.dueDate) < new Date() : false;

                          return (
                            <tr key={inv.id} className="hover:bg-surface-container-low/50 transition-colors">
                              <td className="px-4 py-3.5 font-mono text-xs font-bold text-on-surface">
                                {inv.invoiceNumber}
                              </td>
                              <td className="px-4 py-3.5 text-xs font-bold text-on-surface">
                                {inv.supplierName}
                              </td>
                              <td className="px-4 py-3.5 text-xs">
                                <div className={isOverdue ? "text-red-600 font-bold flex items-center gap-1" : ""}>
                                  {isOverdue && <AlertTriangle className="w-3.5 h-3.5" />}
                                  {inv.dueDate
                                    ? new Date(inv.dueDate).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "-"}
                                </div>
                                {isOverdue && <span className="text-[10px] text-red-500 font-semibold">Lewat Jatuh Tempo</span>}
                              </td>
                              <td className="px-4 py-3.5 text-right font-medium text-xs">
                                {formatRupiah(total)}
                              </td>
                              <td className="px-4 py-3.5 text-right font-medium text-xs text-emerald-600">
                                {formatRupiah(paid)}
                              </td>
                              <td className="px-4 py-3.5 text-right font-black text-xs text-red-600">
                                {formatRupiah(remaining)}
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <Button
                                  onClick={() => {
                                    setSelectedInvoiceForPayment(inv);
                                    setPaymentForm({
                                      paymentDate: new Date().toISOString().slice(0, 10),
                                      amount: remaining,
                                      paymentMethod: "BANK_TRANSFER",
                                      referenceNumber: "",
                                      notes: "",
                                    });
                                    setIsPaymentModalOpen(true);
                                  }}
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 h-8 gap-1 shadow-sm"
                                >
                                  <CreditCard className="w-3 h-3" />
                                  Lunasi Hutang
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: INPUT FAKTUR PEMBELIAN BARU & AUTO BATCH RECEIVING */}
      {/* ========================================================================= */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-5xl w-full p-6 border border-outline-variant/30 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary-container/10 rounded-xl text-primary-container">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface">
                    Penerimaan Faktur Pembelian PBF
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Catat nomor faktur distributor, buat batch otomatis, dan perbarui stok masuk.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Validate items
                for (const item of invoiceForm.items) {
                  if (!item.productId) {
                    alert("Harap pilih produk obat untuk semua baris item");
                    return;
                  }
                  if (!item.batchNumber) {
                    alert("Harap isi nomor batch untuk semua produk");
                    return;
                  }
                  if (!item.expiredDate) {
                    alert("Harap isi tanggal expired batch untuk semua produk");
                    return;
                  }
                }

                createInvoiceMutation.mutate({
                  outletId: invoiceForm.outletId,
                  supplierId: invoiceForm.supplierId,
                  invoiceNumber: invoiceForm.invoiceNumber,
                  invoiceDate: invoiceForm.invoiceDate,
                  dueDate: invoiceForm.dueDate,
                  totalAmount: calculateInvoiceTotals.grandTotal,
                  paidAmount: invoiceForm.paidAmount,
                  scanInvoiceUrl: invoiceForm.scanInvoiceUrl,
                  items: invoiceForm.items.map((it) => ({
                    productId: it.productId,
                    unitId: it.unitId,
                    quantity: it.quantity,
                    pricePerUnit: it.pricePerUnit,
                    discount: it.discount,
                    subtotal: it.subtotal,
                    batchNumber: it.batchNumber,
                    expiredDate: it.expiredDate,
                  })),
                });
              }}
              className="flex-1 flex flex-col overflow-hidden pt-4 space-y-4"
            >
              {/* Header Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-surface-container-low p-4 rounded-xl text-xs border border-outline-variant/20">
                <div>
                  <Label className="text-[11px] font-semibold text-on-surface">Cabang Outlet *</Label>
                  <select
                    required
                    value={invoiceForm.outletId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, outletId: e.target.value })}
                    className="mt-1 w-full border border-outline-variant/30 bg-surface-container-lowest text-on-surface rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-primary-container"
                  >
                    {outletsList.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-on-surface">Distributor PBF *</Label>
                  <select
                    required
                    value={invoiceForm.supplierId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, supplierId: e.target.value })}
                    className="mt-1 w-full border border-outline-variant/30 bg-surface-container-lowest text-on-surface rounded-xl px-2.5 py-1.5 text-xs focus:ring-2 focus:ring-primary-container"
                  >
                    {suppliersList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-[11px] font-semibold text-on-surface">Nomor Faktur PBF *</Label>
                  <Input
                    required
                    placeholder="Contoh: INV-PBF-2026-99"
                    value={invoiceForm.invoiceNumber}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                    className="mt-1 text-xs h-8 font-mono bg-surface-container-lowest border-outline-variant/30 text-on-surface rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[11px] font-semibold text-on-surface">Tgl Faktur *</Label>
                    <Input
                      required
                      type="date"
                      value={invoiceForm.invoiceDate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })}
                      className="mt-1 text-xs h-8 bg-surface-container-lowest border-outline-variant/30 text-on-surface rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold text-on-surface">Jatuh Tempo</Label>
                    <Input
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                      className="mt-1 text-xs h-8 bg-surface-container-lowest border-outline-variant/30 text-on-surface rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="flex-1 overflow-y-auto border border-outline-variant/30 rounded-xl bg-surface-container-lowest">
                <table className="w-full text-left text-xs text-on-surface">
                  <thead className="bg-surface-container-low text-on-surface-variant uppercase font-semibold text-[11px] sticky top-0 border-b border-outline-variant/20">
                    <tr>
                      <th className="px-3 py-2.5 w-48">Produk Obat</th>
                      <th className="px-3 py-2.5 w-28">Satuan Beli</th>
                      <th className="px-3 py-2.5 w-20 text-center">Jumlah</th>
                      <th className="px-3 py-2.5 w-28 text-right">Harga Beli</th>
                      <th className="px-3 py-2.5 w-24 text-right">Diskon (Rp)</th>
                      <th className="px-3 py-2.5 w-28 text-right">Subtotal</th>
                      <th className="px-3 py-2.5 w-32">No. Batch Baru</th>
                      <th className="px-3 py-2.5 w-32">Expired Date</th>
                      <th className="px-2 py-2.5 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/15">
                    {invoiceForm.items.map((item, idx) => {
                      const selectedProduct = productsList.find((p) => p.id === item.productId);
                      const availableUnits = selectedProduct?.units || [];

                      return (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                          {/* Product select */}
                          <td className="px-3 py-2">
                            <select
                              required
                              value={item.productId}
                              onChange={(e) => handleInvoiceItemChange(idx, "productId", e.target.value)}
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md px-2 py-1 text-xs"
                            >
                              <option value="">-- Pilih Obat --</option>
                              {productsList.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Unit select */}
                          <td className="px-3 py-2">
                            <select
                              required
                              value={item.unitId}
                              onChange={(e) => handleInvoiceItemChange(idx, "unitId", e.target.value)}
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md px-2 py-1 text-xs"
                            >
                              {availableUnits.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.unitName} (x{u.conversionFactor})
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Quantity */}
                          <td className="px-3 py-2 text-center">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleInvoiceItemChange(idx, "quantity", parseInt(e.target.value || "1", 10))
                              }
                              className="h-7 text-center font-bold text-xs"
                            />
                          </td>

                          {/* Price per unit */}
                          <td className="px-3 py-2 text-right">
                            <Input
                              type="number"
                              min="0"
                              value={item.pricePerUnit}
                              onChange={(e) =>
                                handleInvoiceItemChange(idx, "pricePerUnit", parseFloat(e.target.value || "0"))
                              }
                              className="h-7 text-right text-xs"
                            />
                          </td>

                          {/* Discount */}
                          <td className="px-3 py-2 text-right">
                            <Input
                              type="number"
                              min="0"
                              value={item.discount}
                              onChange={(e) =>
                                handleInvoiceItemChange(idx, "discount", parseFloat(e.target.value || "0"))
                              }
                              className="h-7 text-right text-xs"
                            />
                          </td>

                          {/* Subtotal */}
                          <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white">
                            {formatRupiah(item.subtotal)}
                          </td>

                          {/* Batch Number */}
                          <td className="px-3 py-2">
                            <Input
                              required
                              placeholder="Batch #..."
                              value={item.batchNumber}
                              onChange={(e) => handleInvoiceItemChange(idx, "batchNumber", e.target.value)}
                              className="h-7 font-mono text-xs"
                            />
                          </td>

                          {/* Expired Date */}
                          <td className="px-3 py-2">
                            <Input
                              required
                              type="date"
                              value={item.expiredDate}
                              onChange={(e) => handleInvoiceItemChange(idx, "expiredDate", e.target.value)}
                              className="h-7 text-xs"
                            />
                          </td>

                          {/* Delete row */}
                          <td className="px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeInvoiceItemRow(idx)}
                              disabled={invoiceForm.items.length <= 1}
                              className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add row button & Totals Summary */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
                <Button
                  type="button"
                  onClick={addInvoiceItemRow}
                  variant="outline"
                  size="sm"
                  className="text-xs text-emerald-600 border-dashed border-emerald-600 hover:bg-emerald-50 gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Baris Obat
                </Button>

                <div className="w-full sm:w-80 bg-gray-50 dark:bg-gray-900/60 p-3.5 rounded-xl text-xs space-y-2 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal Barang:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatRupiah(calculateInvoiceTotals.subtotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={invoiceForm.includePpn}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, includePpn: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>PPN 11%:</span>
                    </label>
                    <span className="font-semibold">{formatRupiah(calculateInvoiceTotals.ppn)}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-black text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span>Total Tagihan:</span>
                    <span className="text-emerald-600">{formatRupiah(calculateInvoiceTotals.grandTotal)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-semibold">Bayar Awal (DP / Tunai):</span>
                    <Input
                      type="number"
                      min="0"
                      max={calculateInvoiceTotals.grandTotal}
                      value={invoiceForm.paidAmount}
                      onChange={(e) =>
                        setInvoiceForm({ ...invoiceForm, paidAmount: parseFloat(e.target.value || "0") })
                      }
                      className="w-32 h-7 text-right font-bold text-xs"
                    />
                  </div>

                  <div className="flex justify-between text-red-600 font-bold pt-1 border-t border-dashed border-gray-300">
                    <span>Sisa Hutang:</span>
                    <span>{formatRupiah(calculateInvoiceTotals.remaining)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Button type="button" variant="outline" onClick={() => setIsInvoiceModalOpen(false)}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={createInvoiceMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {createInvoiceMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Menerima Barang...
                    </>
                  ) : (
                    "Simpan Faktur & Terima Stok"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: FORM BUAT SURAT PESANAN (SP) BARU */}
      {/* ========================================================================= */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full p-6 border border-gray-100 dark:border-gray-700 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Penerbitan Surat Pesanan (SP) Obat Resmi
                  </h2>
                  <p className="text-xs text-gray-500">
                    Format resmi baku sesuai regulasi BPOM RI untuk pengadaan apotek.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                for (const it of orderForm.items) {
                  if (!it.productId) {
                    alert("Harap pilih produk obat untuk semua baris pesanan");
                    return;
                  }
                }
                createOrderMutation.mutate({
                  outletId: orderForm.outletId,
                  supplierId: orderForm.supplierId,
                  orderType: orderForm.orderType,
                  orderDate: orderForm.orderDate,
                  apaName: orderForm.apaName,
                  apaSipa: orderForm.apaSipa,
                  notes: orderForm.notes,
                  items: orderForm.items,
                });
              }}
              className="flex-1 flex flex-col overflow-hidden pt-4 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-900/50 p-3.5 rounded-xl text-xs">
                <div>
                  <Label className="text-[11px] font-semibold">Tipe Surat Pesanan (SP) *</Label>
                  <select
                    value={orderForm.orderType}
                    onChange={(e: any) => setOrderForm({ ...orderForm, orderType: e.target.value })}
                    className="mt-1 w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-2.5 py-1.5 font-bold text-xs"
                  >
                    <option value="REGULAR">SP Reguler (Standar)</option>
                    <option value="PRECURSOR">SP Prekursor Farmasi</option>
                    <option value="OOT">SP Obat-Obat Tertentu (OOT)</option>
                    <option value="PSYCHOTROPIC">SP Psikotropika</option>
                    <option value="NARCOTIC">SP Narkotika</option>
                  </select>
                </div>

                <div>
                  <Label className="text-[11px] font-semibold">Tujuan Distributor PBF *</Label>
                  <select
                    required
                    value={orderForm.supplierId}
                    onChange={(e) => setOrderForm({ ...orderForm, supplierId: e.target.value })}
                    className="mt-1 w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-2.5 py-1.5 text-xs"
                  >
                    {suppliersList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-[11px] font-semibold">Outlet Apotek Pemesan *</Label>
                  <select
                    required
                    value={orderForm.outletId}
                    onChange={(e) => setOrderForm({ ...orderForm, outletId: e.target.value })}
                    className="mt-1 w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-2.5 py-1.5 text-xs"
                  >
                    {outletsList.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-[11px] font-semibold">Tgl Pesanan *</Label>
                  <Input
                    required
                    type="date"
                    value={orderForm.orderDate}
                    onChange={(e) => setOrderForm({ ...orderForm, orderDate: e.target.value })}
                    className="mt-1 text-xs h-8"
                  />
                </div>
              </div>

              {/* Items in SP */}
              <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl">
                <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 uppercase font-semibold sticky top-0">
                    <tr>
                      <th className="px-3 py-2.5">Nama Obat / Zat Aktif</th>
                      <th className="px-3 py-2.5 w-24">Bentuk Sediaan</th>
                      <th className="px-3 py-2.5 w-24">Kekuatan/Dosis</th>
                      <th className="px-3 py-2.5 w-20 text-center">Jumlah</th>
                      <th className="px-3 py-2.5 w-24">Satuan</th>
                      <th className="px-3 py-2.5">Keterangan</th>
                      <th className="px-2 py-2.5 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {orderForm.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">
                          <select
                            required
                            value={item.productId}
                            onChange={(e) => handleOrderItemChange(idx, "productId", e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md px-2 py-1 text-xs"
                          >
                            <option value="">-- Pilih Obat --</option>
                            {productsList.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            placeholder="Tablet / Sirup"
                            value={item.dosageForm}
                            onChange={(e) => handleOrderItemChange(idx, "dosageForm", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            placeholder="500 mg"
                            value={item.strength}
                            onChange={(e) => handleOrderItemChange(idx, "strength", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleOrderItemChange(idx, "quantity", parseInt(e.target.value || "1", 10))
                            }
                            className="h-7 text-center font-bold text-xs"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            placeholder="Box / Botol"
                            value={item.unitName}
                            onChange={(e) => handleOrderItemChange(idx, "unitName", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            placeholder="Opsional"
                            value={item.notes}
                            onChange={(e) => handleOrderItemChange(idx, "notes", e.target.value)}
                            className="h-7 text-xs"
                          />
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeOrderItemRow(idx)}
                            disabled={orderForm.items.length <= 1}
                            className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <Button
                  type="button"
                  onClick={addOrderItemRow}
                  variant="outline"
                  size="sm"
                  className="text-xs text-emerald-600 border-dashed border-emerald-600 hover:bg-emerald-50 gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Baris Obat
                </Button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Button type="button" variant="outline" onClick={() => setIsOrderModalOpen(false)}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Menerbitkan SP...
                    </>
                  ) : (
                    "Terbitkan Surat Pesanan"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BAYAR HUTANG FAKTUR */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && selectedInvoiceForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Pembayaran Hutang Faktur
                  </h2>
                  <p className="text-xs text-gray-400 font-mono">
                    {selectedInvoiceForPayment.invoiceNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl my-3 text-xs space-y-1">
              <div className="font-semibold text-gray-900 dark:text-white">
                PBF: {selectedInvoiceForPayment.supplierName}
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Total Faktur: {formatRupiah(selectedInvoiceForPayment.totalAmount)}</span>
                <span className="font-bold text-red-600">
                  Sisa Hutang:{" "}
                  {formatRupiah(
                    Number(selectedInvoiceForPayment.totalAmount) - Number(selectedInvoiceForPayment.paidAmount)
                  )}
                </span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                payDebtMutation.mutate({
                  id: selectedInvoiceForPayment.id,
                  payload: paymentForm,
                });
              }}
              className="space-y-4"
            >
              <div>
                <Label className="text-xs font-semibold">Tgl Pembayaran *</Label>
                <Input
                  required
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="mt-1 text-sm"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Nominal Pembayaran (Rp) *</Label>
                <Input
                  required
                  type="number"
                  min="1"
                  max={
                    Number(selectedInvoiceForPayment.totalAmount) - Number(selectedInvoiceForPayment.paidAmount)
                  }
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value || "0") })
                  }
                  className="mt-1 font-bold text-base text-emerald-600"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Metode Pembayaran</Label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e: any) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="BANK_TRANSFER">Transfer Bank</option>
                  <option value="CASH">Tunai (Kasir)</option>
                  <option value="GIRO">Giro / Cek</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">No. Rekening / No. Referensi Transfer</Label>
                <Input
                  placeholder="Contoh: TRF-BCA-992182"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                  className="mt-1 text-sm font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={payDebtMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {payDebtMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                      Memproses...
                    </>
                  ) : (
                    "Simpan Pembayaran"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: DETAIL FAKTUR PEMBELIAN LENGKAP */}
      {/* ========================================================================= */}
      {viewInvoiceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full p-6 border border-gray-100 dark:border-gray-700 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-emerald-600">
                    Faktur #{invoiceDetailData?.data.invoiceNumber}
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-none text-xs">
                    {invoiceDetailData?.data.paymentStatus}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Distributor: <strong>{invoiceDetailData?.data.supplierName}</strong> • Cabang:{" "}
                  <strong>{invoiceDetailData?.data.outletName}</strong>
                </p>
              </div>
              <button
                onClick={() => setViewInvoiceId(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              {isInvoiceDetailLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                </div>
              ) : (
                <>
                  {/* Items received */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Daftar Obat yang Diterima ke Stok
                    </h4>
                    <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-lg">
                      <thead className="bg-gray-50 dark:bg-gray-900 uppercase font-semibold">
                        <tr>
                          <th className="px-3 py-2">Produk Obat</th>
                          <th className="px-3 py-2">No. Batch</th>
                          <th className="px-3 py-2">Expired</th>
                          <th className="px-3 py-2 text-center">Jumlah Beli</th>
                          <th className="px-3 py-2 text-right">Harga Satuan</th>
                          <th className="px-3 py-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {invoiceDetailData?.data.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">
                              {item.productName}
                            </td>
                            <td className="px-3 py-2 font-mono text-[11px]">{item.batchNumber}</td>
                            <td className="px-3 py-2 text-[11px]">
                              {new Date(item.expiredDate).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="px-3 py-2 text-center font-bold">
                              {item.quantity} {item.unitName}
                            </td>
                            <td className="px-3 py-2 text-right">{formatRupiah(item.pricePerUnit)}</td>
                            <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white">
                              {formatRupiah(item.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Payment history */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Riwayat Pembayaran Cicilan Hutang
                    </h4>
                    {invoiceDetailData?.data.payments.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Belum ada pembayaran untuk faktur ini.</p>
                    ) : (
                      <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-lg">
                        <thead className="bg-gray-50 dark:bg-gray-900 uppercase font-semibold">
                          <tr>
                            <th className="px-3 py-2">Tanggal Bayar</th>
                            <th className="px-3 py-2">Metode</th>
                            <th className="px-3 py-2">No. Bukti/Ref</th>
                            <th className="px-3 py-2 text-right">Nominal Bayar</th>
                            <th className="px-3 py-2">Petugas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                          {invoiceDetailData?.data.payments.map((p) => (
                            <tr key={p.id}>
                              <td className="px-3 py-2">
                                {new Date(p.paymentDate).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="px-3 py-2 font-semibold">{p.paymentMethod}</td>
                              <td className="px-3 py-2 font-mono text-[11px]">{p.referenceNumber || "-"}</td>
                              <td className="px-3 py-2 text-right font-black text-emerald-600">
                                {formatRupiah(p.amount)}
                              </td>
                              <td className="px-3 py-2 text-gray-500">{p.userName || "Admin"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <Button variant="outline" onClick={() => setViewInvoiceId(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: SP PRINT PREVIEW MODAL */}
      {/* ========================================================================= */}
      <PurchaseOrderPrintModal
        isOpen={isPrintModalOpen}
        data={printOrderData}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
}
