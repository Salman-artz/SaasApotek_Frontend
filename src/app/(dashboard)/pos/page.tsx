"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Barcode,
  Receipt,
  CreditCard,
  QrCode,
  DollarSign,
  User,
  Stethoscope,
  Sparkles,
  Loader2,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Pill,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent,
  Tag,
  Check,
  Share2,
} from "lucide-react";
import { PosReceiptModal, ReceiptData } from "@/components/pos-receipt-modal";

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
  requiresPrescription: boolean;
  totalStock?: number;
  units?: ProductUnitItem[];
}

interface OutletItem {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  siaNumber?: string | null;
  sipaNumber?: string | null;
}

interface CartItem {
  productId: string;
  productName: string;
  selectedUnitId: string;
  selectedUnitName: string;
  conversionFactor: number;
  quantity: number;
  unitPrice: number;
  discountPerItem: number;
  subtotal: number;
  isRacikan: boolean;
  racikanName: string;
  signa: string;
  availableUnits: ProductUnitItem[];
}

interface ShiftSummary {
  id: string;
  status: string;
  openedAt: string;
  openingCash: string | number;
  outletName: string;
  cashierName: string;
  summary?: {
    totalTransactions: number;
    cashSales: number;
    nonCashSales: number;
    totalSales: number;
    expectedCash: number;
  };
}

const CATEGORIES = [
  "Semua",
  "Bebas",
  "Bebas Terbatas",
  "Keras",
  "Narkotika",
  "Psikotropika",
  "Alkes",
  "Herbal / Jamu",
];

const QUICK_CASH_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export default function PosPage() {
  const queryClient = useQueryClient();

  // Mode: 'otc' (Obat Bebas) | 'rx' (Resep Dokter)
  const [mode, setMode] = useState<"otc" | "rx">("otc");

  // Filter & Search
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedOutlet, setSelectedOutlet] = useState("");

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [tuslahFee, setTuslahFee] = useState(0);

  // Voucher Promo State
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    name: string;
    discountType: string;
    discountValue: number;
    calculatedDiscount: number;
  } | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);

  // Customer & Doctor State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [prescriptionNumber, setPrescriptionNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris" | "transfer" | "debit">("cash");
  const [paidAmount, setPaidAmount] = useState<number>(0);

  // Shift Modal State
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftModalMode, setShiftModalMode] = useState<"open" | "close">("open");
  const [shiftCashInput, setShiftCashInput] = useState<number>(0);
  const [shiftNotes, setShiftNotes] = useState("");

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

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

  // Set default outlet
  useEffect(() => {
    if (outletsList.length > 0 && !selectedOutlet) {
      setSelectedOutlet(outletsList[0].id);
    }
  }, [outletsList, selectedOutlet]);

  // 2. Fetch Active Shift
  const { data: shiftData, isLoading: isShiftLoading } = useQuery({
    queryKey: ["current-shift", selectedOutlet],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedOutlet) params.append("outletId", selectedOutlet);
      return await ApiClient.get<{ data: ShiftSummary | null }>(`/api/transactions/shifts/current?${params.toString()}`);
    },
  });
  const currentShift = shiftData?.data;

  // 3. Fetch Products Catalog
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["pos-products", search, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory !== "Semua") params.append("category", selectedCategory);
      params.append("limit", "100");
      return await ApiClient.get<{ data: ProductItem[] }>(`/api/products?${params.toString()}`);
    },
  });
  const productsList = productsData?.data || [];

  // =========================================================================
  // MUTATIONS
  // =========================================================================

  // Open Shift Mutation
  const openShiftMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await ApiClient.post("/api/transactions/shifts/open", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-shift"] });
      setIsShiftModalOpen(false);
      setShiftCashInput(0);
      setShiftNotes("");
    },
    onError: (err: any) => {
      alert(err.message || "Gagal membuka shift kasir");
    },
  });

  // Close Shift Mutation
  const closeShiftMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await ApiClient.post("/api/transactions/shifts/close", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-shift"] });
      setIsShiftModalOpen(false);
      setShiftCashInput(0);
      setShiftNotes("");
      alert("Shift kasir berhasil ditutup.");
    },
    onError: (err: any) => {
      alert(err.message || "Gagal menutup shift kasir");
    },
  });

  // Create Transaction Mutation
  const checkoutMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await ApiClient.post<{ data: any }>("/api/transactions", payload);
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["inventory-batches"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["current-shift"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });

      // Prepare receipt data
      const trx = res.data;
      const outletObj = outletsList.find((o) => o.id === selectedOutlet);

      setReceiptData({
        id: trx.id,
        invoiceCode: trx.invoiceCode,
        outletName: outletObj?.name || "Apotek Digital",
        outletAddress: outletObj?.address,
        outletPhone: outletObj?.phone,
        outletSia: outletObj?.siaNumber,
        outletSipa: outletObj?.sipaNumber,
        cashierName: trx.cashierName || "Kasir",
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
        createdAt: trx.createdAt || new Date().toISOString(),
        items: cart.map((c) => ({
          productName: c.productName,
          unitName: c.selectedUnitName,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          discountPerItem: c.discountPerItem,
          subtotal: c.subtotal,
          isRacikan: c.isRacikan,
          racikanName: c.racikanName,
          signa: c.signa,
        })),
      });

      // Clear cart
      setCart([]);
      setDiscountAmount(0);
      setTaxAmount(0);
      setTuslahFee(0);
      setCustomerName("");
      setCustomerPhone("");
      setDoctorName("");
      setPrescriptionNumber("");
      setNotes("");
      setIsPaymentModalOpen(false);
      setIsReceiptModalOpen(true);
    },
    onError: (err: any) => {
      alert(err.message || "Gagal memproses transaksi kasir");
    },
  });

  // =========================================================================
  // CART OPERATIONS
  // =========================================================================

  const addToCart = (product: ProductItem) => {
    const existingIndex = cart.findIndex((c) => c.productId === product.id && !c.isRacikan);
    const defaultUnit = product.units?.[0] || {
      id: "default",
      unitName: product.baseUnit,
      conversionFactor: 1,
      buyPrice: "0",
      sellPrice: "0",
      isBaseUnit: true,
    };

    if (existingIndex > -1) {
      const nextCart = [...cart];
      nextCart[existingIndex].quantity += 1;
      nextCart[existingIndex].subtotal =
        nextCart[existingIndex].quantity * nextCart[existingIndex].unitPrice -
        nextCart[existingIndex].discountPerItem;
      setCart(nextCart);
    } else {
      const sellPrice = Number(defaultUnit.sellPrice || 0);
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          selectedUnitId: defaultUnit.id,
          selectedUnitName: defaultUnit.unitName,
          conversionFactor: defaultUnit.conversionFactor,
          quantity: 1,
          unitPrice: sellPrice,
          discountPerItem: 0,
          subtotal: sellPrice,
          isRacikan: mode === "rx",
          racikanName: mode === "rx" ? "Resep Dokter" : "",
          signa: mode === "rx" ? "3 x 1 Sehari Sesudah Makan" : "",
          availableUnits: product.units || [],
        },
      ]);
    }
  };

  const updateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(index);
      return;
    }
    const nextCart = [...cart];
    nextCart[index].quantity = newQty;
    nextCart[index].subtotal =
      nextCart[index].quantity * nextCart[index].unitPrice - nextCart[index].discountPerItem;
    setCart(nextCart);
  };

  const updateCartUnit = (index: number, unitId: string) => {
    const nextCart = [...cart];
    const item = nextCart[index];
    const selectedUnit = item.availableUnits.find((u) => u.id === unitId);
    if (selectedUnit) {
      item.selectedUnitId = selectedUnit.id;
      item.selectedUnitName = selectedUnit.unitName;
      item.conversionFactor = selectedUnit.conversionFactor;
      item.unitPrice = Number(selectedUnit.sellPrice || 0);
      item.subtotal = item.quantity * item.unitPrice - item.discountPerItem;
      setCart(nextCart);
    }
  };

  const updateCartSigna = (index: number, signa: string) => {
    const nextCart = [...cart];
    nextCart[index].signa = signa;
    setCart(nextCart);
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Totals calculation
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.subtotal || 0), 0) + tuslahFee;
    const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount);
    return { subtotal, grandTotal };
  }, [cart, tuslahFee, discountAmount, taxAmount]);

  const formatRupiah = (num: number | string) => {
    const val = typeof num === "string" ? parseFloat(num) : num;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    try {
      setVoucherLoading(true);
      const res: any = await ApiClient.post("/promotions/validate", {
        code: voucherInput.trim(),
        subtotal: totals.subtotal,
        customerType: mode === "rx" ? "RESEP" : customerName ? "MEMBER" : "ALL",
      });

      if (res.success && res.data) {
        setAppliedVoucher(res.data);
        setDiscountAmount(Number(res.data.calculatedDiscount));
      } else {
        alert(res.message || "Kode promo tidak valid");
      }
    } catch (err: any) {
      alert(err.message || "Gagal menerapkan kode voucher");
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setVoucherInput("");
  };

  const handleOpenPayment = () => {
    if (cart.length === 0) {
      alert("Keranjang belanja masih kosong");
      return;
    }
    setPaidAmount(totals.grandTotal);
    setIsPaymentModalOpen(true);
  };

  const handleProcessCheckout = () => {
    if (!selectedOutlet) {
      alert("Silakan pilih outlet");
      return;
    }

    checkoutMutation.mutate({
      outletId: selectedOutlet,
      shiftSessionId: currentShift?.id || null,
      customerName: customerName || (mode === "rx" ? "Pasien Resep" : "Pelanggan Umum"),
      customerPhone,
      doctorName: mode === "rx" ? doctorName : undefined,
      prescriptionNumber: mode === "rx" ? prescriptionNumber : undefined,
      isPrescription: mode === "rx",
      tuslahFee,
      discountAmount,
      taxAmount,
      paymentMethod,
      paidAmount: paymentMethod === "cash" ? paidAmount : totals.grandTotal,
      notes,
      items: cart.map((c) => ({
        productId: c.productId,
        unitId: c.selectedUnitId,
        quantity: c.quantity,
        unitPrice: c.unitPrice,
        discountPerItem: c.discountPerItem,
        isRacikan: c.isRacikan,
        racikanName: c.racikanName,
        signa: c.signa,
      })),
    });
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Shift & Outlet Status Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-on-surface-variant">Cabang Kasir:</span>
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="text-xs font-bold border border-outline-variant/30 bg-surface-container-low text-on-surface rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-primary-container"
            >
              {outletsList.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
          <button
            onClick={() => {
              setMode("otc");
              setTuslahFee(0);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              mode === "otc"
                ? "bg-primary-container text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            Obat Bebas (OTC)
          </button>
          <button
            onClick={() => {
              setMode("rx");
              setTuslahFee(5000); // default tuslah fee for prescription
            }}
            data-testid="pos-rx-mode-btn"
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              mode === "rx"
                ? "bg-[#006a61] text-white shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Resep Dokter (Rx)
          </button>
        </div>

        {/* Shift Action Button */}
        <div className="flex items-center gap-2">
          {currentShift ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Shift Aktif ({formatRupiah(currentShift.openingCash)})
              </span>
              <Button
                onClick={() => {
                  setShiftModalMode("close");
                  setShiftCashInput(currentShift.summary?.expectedCash || 0);
                  setIsShiftModalOpen(true);
                }}
                variant="outline"
                size="sm"
                className="text-xs h-8 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
              >
                Tutup Shift
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => {
                setShiftModalMode("open");
                setShiftCashInput(200000); // default opening float Rp 200.000
                setIsShiftModalOpen(true);
              }}
              size="sm"
              className="bg-primary-container hover:bg-blue-700 text-white text-xs h-8 gap-1.5 rounded-xl shadow-sm"
            >
              <Clock className="w-3.5 h-3.5" />
              Buka Shift Kasir
            </Button>
          )}
        </div>
      </div>

      {/* Main POS Grid (Left: Products, Right: Cart & Payment) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ========================================================================= */}
        {/* LEFT PANEL: CATALOG & SEARCH (7 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-3">
          {/* Search and Category Filter */}
          <div className="bg-surface-container-lowest p-4 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <Input
                data-testid="pos-search-input"
                placeholder="Scan Barcode / Ketik nama obat, SKU, atau zat aktif..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8 text-xs h-10 rounded-xl bg-surface-container-low border-outline-variant/30 text-on-surface"
                autoFocus
              />
              <Barcode className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-primary-container text-white shadow-sm"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-highest"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto pr-1">
            {isProductsLoading ? (
              <div className="col-span-3 text-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary-container mx-auto" />
                <p className="mt-2 text-xs text-on-surface-variant">Memuat katalog obat...</p>
              </div>
            ) : productsList.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-on-surface-variant">
                <Pill className="w-8 h-8 mx-auto mb-1.5 text-on-surface-variant/40" />
                <p className="text-xs font-semibold">Tidak ada obat yang cocok.</p>
              </div>
            ) : (
              productsList.map((product) => {
                const defaultUnit = product.units?.[0];
                const price = Number(defaultUnit?.sellPrice || 0);

                return (
                  <Card
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="cursor-pointer hover:border-primary-container hover:shadow-md transition-all border border-outline-variant/30 rounded-2xl overflow-hidden group bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]"
                  >
                    <CardContent className="p-3.5 space-y-2">
                      <div className="flex items-start justify-between gap-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 border-outline-variant/40 text-on-surface-variant"
                        >
                          {product.category}
                        </Badge>
                        {product.requiresPrescription && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 border border-red-200">
                            Rx
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-on-surface line-clamp-2 group-hover:text-primary-container transition-colors">
                          {product.name}
                        </h4>
                        {product.genericName && (
                          <p className="text-[10px] text-on-surface-variant/70 truncate italic">
                            {product.genericName}
                          </p>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between pt-1 border-t border-outline-variant/20">
                        <div className="font-black text-xs text-primary-container">
                          {formatRupiah(price)}
                          <span className="text-[10px] font-normal text-on-surface-variant/70">
                            /{defaultUnit?.unitName || product.baseUnit}
                          </span>
                        </div>
                        <div className="p-1 rounded-lg bg-surface-container-low text-primary-container group-hover:bg-primary-container group-hover:text-white transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: CART & CHECKOUT (5 COLS) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 p-4 flex flex-col h-full">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary-container" />
                <h3 className="font-bold text-sm text-on-surface">
                  Keranjang Kasir ({cart.length} Item)
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Kosongkan
                </button>
              )}
            </div>

            {/* If Resep Mode: Prescription Header Fields */}
            {mode === "rx" && (
              <div className="bg-surface-container-low p-3 rounded-xl my-2 text-xs space-y-2 border border-outline-variant/30">
                <div className="flex items-center gap-1.5 font-bold text-[#006a61]">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Informasi Resep Dokter & Pasien
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Nama Pasien *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-7 text-xs bg-surface-container-lowest border-outline-variant/30 text-on-surface rounded-lg"
                  />
                  <Input
                    placeholder="Nama Dokter"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="h-7 text-xs bg-surface-container-lowest border-outline-variant/30 text-on-surface rounded-lg"
                  />
                  <Input
                    placeholder="No. Resep"
                    value={prescriptionNumber}
                    onChange={(e) => setPrescriptionNumber(e.target.value)}
                    className="h-7 text-xs bg-surface-container-lowest border-outline-variant/30 text-on-surface rounded-lg"
                  />
                  <Input
                    placeholder="No. HP Pasien"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-7 text-xs bg-surface-container-lowest border-outline-variant/30 text-on-surface rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto max-h-[320px] py-2 space-y-2.5 divide-y divide-gray-100 dark:divide-gray-700/50">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-1.5 text-gray-300 dark:text-gray-600" />
                  <p className="text-xs font-semibold">Keranjang masih kosong.</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Pilih obat dari katalog di sebelah kiri.
                  </p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="pt-2 first:pt-0 space-y-1.5 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-bold text-gray-900 dark:text-white">
                          {item.productName}
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          {/* Unit Selector */}
                          <select
                            value={item.selectedUnitId}
                            onChange={(e) => updateCartUnit(idx, e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded px-1.5 py-0.5 text-[11px] font-semibold"
                          >
                            {item.availableUnits.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.unitName} (@ {formatRupiah(u.sellPrice)})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Item Total & Delete */}
                      <div className="text-right">
                        <div className="font-black text-gray-900 dark:text-white">
                          {formatRupiah(item.subtotal)}
                        </div>
                        <button
                          onClick={() => removeFromCart(idx)}
                          className="text-gray-400 hover:text-red-500 p-0.5 mt-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Qty Counter & Signa in Rx Mode */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateCartQty(idx, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateCartQty(idx, parseInt(e.target.value || "1", 10))}
                          className="w-12 h-6 text-center font-bold border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-xs"
                        />
                        <button
                          onClick={() => updateCartQty(idx, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Signa input in Resep Mode */}
                      {mode === "rx" && (
                        <Input
                          placeholder="Signa: misal 3x1 tablet sesudah makan"
                          value={item.signa}
                          onChange={(e) => updateCartSigna(idx, e.target.value)}
                          className="h-6 text-[11px] flex-1 font-mono text-emerald-700"
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Checkout Bar */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatRupiah(totals.subtotal)}
                </span>
              </div>

              {mode === "rx" && (
                <div className="flex items-center justify-between text-blue-600">
                  <span>Tuslah / Jasa Racik Resep:</span>
                  <Input
                    type="number"
                    min="0"
                    value={tuslahFee}
                    onChange={(e) => setTuslahFee(parseFloat(e.target.value || "0"))}
                    className="w-24 h-6 text-right font-bold text-xs"
                  />
                </div>
              )}

              {/* Voucher Promo Input Section */}
              <div className="pt-2 border-t border-dashed border-gray-200 dark:border-gray-700">
                {appliedVoucher ? (
                  <div className="p-2 bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-pink-800 dark:text-pink-300 font-bold">
                      <Tag className="w-3.5 h-3.5 text-pink-600" />
                      <span>{appliedVoucher.code}</span>
                      <span className="font-normal text-[11px] text-pink-600">
                        (-{formatRupiah(appliedVoucher.calculatedDiscount)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="text-pink-600 hover:text-pink-800 text-[11px] font-semibold"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    <Input
                      placeholder="Kode Promo / Voucher..."
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                      className="h-7 text-xs font-mono uppercase"
                    />
                    <Button
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={!voucherInput.trim() || voucherLoading}
                      size="sm"
                      className="h-7 px-2.5 text-xs bg-pink-600 hover:bg-pink-700 text-white font-semibold"
                    >
                      {voucherLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Pakai"
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-pink-600 font-semibold">
                  <span>Diskon Promo:</span>
                  <span>-{formatRupiah(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-base font-black text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-700">
                <span>TOTAL BAYAR:</span>
                <span className="text-emerald-600">{formatRupiah(totals.grandTotal)}</span>
              </div>

              <Button
                data-testid="pos-checkout-btn"
                onClick={handleOpenPayment}
                disabled={cart.length === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-sm shadow-md shadow-emerald-500/20 rounded-xl gap-2 mt-2"
              >
                <CreditCard className="w-4 h-4" />
                Bayar Sekarang ({formatRupiah(totals.grandTotal)})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: PEMBAYARAN MULTI-PAYMENT & KEMBALIAN */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Pembayaran Kasir POS
                </h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {/* Grand Total Display */}
              <div className="text-center bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <span className="text-xs font-semibold text-emerald-700 uppercase">
                  Total Tagihan Pelanggan
                </span>
                <div className="text-3xl font-black text-emerald-600 mt-1">
                  {formatRupiah(totals.grandTotal)}
                </div>
              </div>

              {/* Payment Method Switcher */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("cash");
                    setPaidAmount(totals.grandTotal);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === "cash"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Tunai / Cash
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("qris");
                    setPaidAmount(totals.grandTotal);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === "qris"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  QRIS Instant
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("transfer");
                    setPaidAmount(totals.grandTotal);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === "transfer"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  Transfer Bank
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethod("debit");
                    setPaidAmount(totals.grandTotal);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === "debit"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Kartu Debit
                </button>
              </div>

              {/* Cash Mode Quick Shortcuts */}
              {paymentMethod === "cash" && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold">Uang Diterima dari Pelanggan (Rp) *</Label>
                    <Input
                      type="number"
                      min={totals.grandTotal}
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(parseFloat(e.target.value || "0"))}
                      className="text-xl font-black text-emerald-600 h-11 mt-1"
                    />
                  </div>

                  {/* Quick buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      data-testid="pos-exact-cash-btn"
                      onClick={() => setPaidAmount(totals.grandTotal)}
                      className="px-2.5 py-1 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                    >
                      Uang Pas
                    </button>
                    {QUICK_CASH_AMOUNTS.filter((amt) => amt >= totals.grandTotal).map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setPaidAmount(amt)}
                        className="px-2.5 py-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
                      >
                        {formatRupiah(amt)}
                      </button>
                    ))}
                  </div>

                  {/* Kembalian Calculation */}
                  <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-xl flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-600">Kembalian:</span>
                    <span className="text-xl font-black text-emerald-600">
                      {formatRupiah(Math.max(0, paidAmount - totals.grandTotal))}
                    </span>
                  </div>
                </div>
              )}

              {/* QRIS Display Mode */}
              {paymentMethod === "qris" && (
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl space-y-2">
                  <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center">
                    <QrCode className="w-36 h-36 text-gray-800" />
                  </div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    QRIS Dinamis Nasional (GoPay, OVO, Dana, ShopeePay, BCA)
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Minta pelanggan memindai kode QR di atas untuk menyelesaikan pembayaran.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                Batal
              </Button>
              <Button
                data-testid="pos-submit-payment"
                onClick={handleProcessCheckout}
                disabled={checkoutMutation.isPending || (paymentMethod === "cash" && paidAmount < totals.grandTotal)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-sm"
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Memproses Transaksi...
                  </>
                ) : (
                  "Konfirmasi & Selesai"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SHIFT KASIR (BUKA / TUTUP SHIFT) */}
      {/* ========================================================================= */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {shiftModalMode === "open" ? "Buka Shift Kasir Baru" : "Tutup Sesi Shift Kasir"}
                </h3>
              </div>
              <button
                onClick={() => setIsShiftModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (shiftModalMode === "open") {
                  openShiftMutation.mutate({
                    outletId: selectedOutlet,
                    openingCash: shiftCashInput,
                    notes: shiftNotes,
                  });
                } else {
                  closeShiftMutation.mutate({
                    closingCash: shiftCashInput,
                    notes: shiftNotes,
                  });
                }
              }}
              className="space-y-4 pt-4 text-xs"
            >
              {shiftModalMode === "close" && currentShift?.summary && (
                <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-xl space-y-1">
                  <div className="flex justify-between">
                    <span>Modal Awal:</span>
                    <span className="font-bold">{formatRupiah(currentShift.openingCash)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Penjualan Tunai:</span>
                    <span className="font-bold text-emerald-600">
                      +{formatRupiah(currentShift.summary.cashSales)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1 font-black text-sm">
                    <span>Total Fisik Kas Seharusnya:</span>
                    <span className="text-emerald-600">
                      {formatRupiah(currentShift.summary.expectedCash)}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs font-semibold">
                  {shiftModalMode === "open"
                    ? "Modal Awal Kasir / Float (Rp) *"
                    : "Uang Fisik Kas Saat Penutupan (Rp) *"}
                </Label>
                <Input
                  required
                  type="number"
                  min="0"
                  value={shiftCashInput}
                  onChange={(e) => setShiftCashInput(parseFloat(e.target.value || "0"))}
                  className="mt-1 font-bold text-base h-10"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Catatan Shift</Label>
                <Input
                  placeholder="Misal: Shift Pagi / Kasir Petugas A"
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Button type="button" variant="outline" onClick={() => setIsShiftModalOpen(false)}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {shiftModalMode === "open" ? "Buka Shift" : "Tutup & Rekap Shift"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CETAK STRUK THERMAL RESMI */}
      {/* ========================================================================= */}
      <PosReceiptModal
        isOpen={isReceiptModalOpen}
        data={receiptData}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
}
