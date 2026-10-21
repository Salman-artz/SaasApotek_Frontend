"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Pill,
  Search,
  Plus,
  Barcode,
  Edit2,
  Trash2,
  FileText,
  AlertCircle,
  X,
  PlusCircle,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Printer,
  Sparkles,
} from "lucide-react";
import { BarcodePrintModal } from "@/components/barcode-print-modal";
import { generateRandomBarcode } from "@/components/barcode-generator";

interface ProductUnitItem {
  id?: string;
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
  category: string;
  requiresPrescription: boolean;
  minStockAlert: number;
  baseUnit: string;
  totalStock?: number;
  units?: ProductUnitItem[];
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

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [barcodeSearchModal, setBarcodeSearchModal] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [selectedBarcodeProduct, setSelectedBarcodeProduct] = useState<ProductItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    genericName: string;
    sku: string;
    barcode: string;
    category: string;
    requiresPrescription: boolean;
    minStockAlert: number;
    baseUnit: string;
    units: ProductUnitItem[];
  }>({
    name: "",
    genericName: "",
    sku: "",
    barcode: "",
    category: "Bebas",
    requiresPrescription: false,
    minStockAlert: 10,
    baseUnit: "Tablet",
    units: [
      { unitName: "Box", conversionFactor: 100, buyPrice: "50000", sellPrice: "70000", isBaseUnit: false },
      { unitName: "Strip", conversionFactor: 10, buyPrice: "6000", sellPrice: "8500", isBaseUnit: false },
      { unitName: "Tablet", conversionFactor: 1, buyPrice: "600", sellPrice: "1000", isBaseUnit: true },
    ],
  });

  // Fetch Products Query
  const { data, isLoading } = useQuery({
    queryKey: ["products", search, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory !== "Semua") params.append("category", selectedCategory);
      return await ApiClient.get<{ data: ProductItem[] }>(`/api/products?${params.toString()}`);
    },
  });

  const productsList = data?.data || [];

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingProduct) {
        return await ApiClient.put(`/api/products/${editingProduct.id}`, payload);
      }
      return await ApiClient.post("/api/products", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await ApiClient.delete(`/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      genericName: "",
      sku: "",
      barcode: "",
      category: "Bebas",
      requiresPrescription: false,
      minStockAlert: 10,
      baseUnit: "Tablet",
      units: [
        { unitName: "Box", conversionFactor: 100, buyPrice: "50000", sellPrice: "70000", isBaseUnit: false },
        { unitName: "Strip", conversionFactor: 10, buyPrice: "6000", sellPrice: "8500", isBaseUnit: false },
        { unitName: "Tablet", conversionFactor: 1, buyPrice: "600", sellPrice: "1000", isBaseUnit: true },
      ],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      genericName: product.genericName || "",
      sku: product.sku || "",
      barcode: product.barcode || "",
      category: product.category,
      requiresPrescription: product.requiresPrescription,
      minStockAlert: product.minStockAlert,
      baseUnit: product.baseUnit,
      units: product.units && product.units.length > 0
        ? product.units
        : [{ unitName: product.baseUnit, conversionFactor: 1, buyPrice: "0", sellPrice: "0", isBaseUnit: true }],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleAddUnitRow = () => {
    setFormData({
      ...formData,
      units: [
        ...formData.units,
        { unitName: "Satuan Baru", conversionFactor: 1, buyPrice: "0", sellPrice: "0", isBaseUnit: false },
      ],
    });
  };

  const handleRemoveUnitRow = (index: number) => {
    if (formData.units.length <= 1) {
      alert("Minimal harus ada 1 satuan!");
      return;
    }
    const updated = [...formData.units];
    updated.splice(index, 1);
    setFormData({ ...formData, units: updated });
  };

  const handleUnitChange = (index: number, field: keyof ProductUnitItem, value: any) => {
    const updated = [...formData.units];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, units: updated });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat) {
      case "Bebas":
        return "success";
      case "Bebas Terbatas":
        return "default";
      case "Keras":
      case "Narkotika":
      case "Psikotropika":
        return "destructive";
      case "Alkes":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatRupiah = (num: string | number) => {
    const val = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(val)) return "Rp 0";
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Pill className="h-6 w-6 text-blue-600" />
            Katalog Produk & Obat
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola master obat, formula generik, multi-satuan (Box $\rightarrow$ Strip $\rightarrow$ Tablet), dan batas stok kritis.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBarcodeSearchModal(true)}
            className="text-xs h-9 border-slate-300 hover:bg-slate-100"
          >
            <Barcode className="h-4 w-4 mr-1.5 text-slate-600" />
            Cari Barcode
          </Button>

          <Button
            size="sm"
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-4 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Tambah Obat Baru
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama obat, zat aktif generik, SKU, barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* Quick stats counter */}
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>
                Total: <strong className="text-slate-800">{productsList.length}</strong> produk terdaftar
              </span>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary-container text-white shadow-xs"
                    : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] bg-surface-container-lowest overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
              <Loader2 className="h-6 w-6 animate-spin text-primary-container" />
              <span className="text-xs font-medium">Memuat data produk...</span>
            </div>
          ) : productsList.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center mx-auto">
                <Pill className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-on-surface">Tidak ada produk ditemukan</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                {search
                  ? `Tidak ada obat yang cocok dengan pencarian "${search}".`
                  : "Belum ada produk pada kategori ini. Silakan tambah obat baru."}
              </p>
              <Button size="sm" onClick={openAddModal} className="text-xs bg-primary-container hover:bg-blue-700 text-white font-semibold">
                <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Obat Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-on-surface">
                <thead className="bg-surface-container-low border-b border-outline-variant/20 text-on-surface-variant uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Nama Obat &amp; Generik</th>
                    <th className="py-3.5 px-3">Golongan</th>
                    <th className="py-3.5 px-3">Satuan Dasar</th>
                    <th className="py-3.5 px-3">Multi-Satuan &amp; Harga Jual</th>
                    <th className="py-3.5 px-3 text-center">Stok Fisik</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {productsList.map((prod) => {
                    const isLowStock = (prod.totalStock || 0) <= prod.minStockAlert;

                    return (
                      <tr key={prod.id} className="hover:bg-surface-container-low/50 transition-colors">
                        {/* Name & Generic */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                            {prod.name}
                            {prod.requiresPrescription && (
                              <Badge variant="outline" className="text-[10px] text-red-600 border-red-200 px-1 py-0">
                                Wajib Resep
                              </Badge>
                            )}
                          </div>
                          {prod.genericName && (
                            <div className="text-[11px] text-slate-500 italic mt-0.5">
                              {prod.genericName}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                            {prod.barcode ? (
                              <button
                                type="button"
                                onClick={() => setSelectedBarcodeProduct(prod)}
                                className="text-blue-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                                title="Klik untuk lihat & cetak label barcode"
                              >
                                <Barcode className="w-3 h-3" /> {prod.barcode}
                              </button>
                            ) : prod.sku ? (
                              <span>SKU: {prod.sku}</span>
                            ) : (
                              "-"
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <Badge variant={getCategoryBadgeVariant(prod.category)} className="text-[10px] px-2 py-0.5">
                            {prod.category}
                          </Badge>
                        </td>

                        {/* Base Unit */}
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {prod.baseUnit}
                          </span>
                        </td>

                        {/* Units & Pricing */}
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {prod.units && prod.units.length > 0 ? (
                              prod.units.map((u, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 text-[10px] bg-blue-50/80 text-blue-900 border border-blue-100 px-2 py-0.5 rounded"
                                >
                                  <strong>{u.unitName}</strong> ({u.conversionFactor}x): {formatRupiah(u.sellPrice)}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 italic">Belum ada harga</span>
                            )}
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`font-bold text-xs ${
                                (prod.totalStock || 0) === 0
                                  ? "text-red-600"
                                  : isLowStock
                                  ? "text-amber-600"
                                  : "text-emerald-700"
                              }`}
                            >
                              {prod.totalStock || 0} {prod.baseUnit}
                            </span>
                            {isLowStock && (
                              <span className="text-[9px] text-amber-600 font-medium flex items-center gap-0.5">
                                <AlertCircle className="h-2.5 w-2.5" /> &le; min ({prod.minStockAlert})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedBarcodeProduct(prod)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors cursor-pointer"
                              title="Cetak Label & Barcode Rak"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => openEditModal(prod)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              title="Edit Produk"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Yakin ingin menghapus ${prod.name} dari katalog?`)) {
                                  deleteMutation.mutate(prod.id);
                                }
                              }}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Hapus Produk"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL: Form Tambah / Edit Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingProduct ? "Edit Informasi Obat" : "Tambah Obat / Produk Baru"}
                </h3>
                <p className="text-xs text-slate-500">
                  Lengkapi spesifikasi obat dan konfigurasi konversi multi-satuan bertingkat.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-5 space-y-5">
              {/* Basic Fields */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  1. Informasi Dasar Obat
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">Nama Paten Obat *</Label>
                    <Input
                      required
                      placeholder="Contoh: Paracetamol 500mg Kaplet"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">Nama Generik / Zat Aktif</Label>
                    <Input
                      placeholder="Contoh: Paracetamol"
                      value={formData.genericName}
                      onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">Golongan / Kategori *</Label>
                    <select
                      className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.filter((c) => c !== "Semua").map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">Satuan Terkecil (Dasar) *</Label>
                    <Input
                      required
                      placeholder="Tablet, Kapsul, Botol, Pcs"
                      value={formData.baseUnit}
                      onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
                      className="text-xs h-9"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">Batas Minimum Alert</Label>
                    <Input
                      type="number"
                      min={0}
                      value={formData.minStockAlert}
                      onChange={(e) => setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 0 })}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700">Barcode EAN / Scan</Label>
                      <button
                        type="button"
                        onClick={() => {
                          const randomCode = generateRandomBarcode();
                          setFormData({ ...formData, barcode: randomCode, sku: formData.sku || randomCode });
                        }}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                        title="Buat barcode otomatis"
                      >
                        <Sparkles className="w-3 h-3" /> Auto Barcode
                      </button>
                    </div>
                    <Input
                      placeholder="899123456001"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="text-xs h-9 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-slate-700">Kode SKU Produk</Label>
                    <Input
                      placeholder="PCT-500"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="text-xs h-9 font-mono"
                    />
                  </div>
                </div>

                {/* Flag Resep */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="requiresPrescription"
                    checked={formData.requiresPrescription}
                    onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <Label htmlFor="requiresPrescription" className="text-xs text-slate-700 font-medium cursor-pointer">
                    Obat Wajib Resep Dokter (Kasir wajib mencatat nama dokter & no resep)
                  </Label>
                </div>
              </div>

              {/* Multi Units Builder */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      2. Konversi Multi-Satuan & Harga Jual
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Contoh: 1 Box = 100 Tablet, 1 Strip = 10 Tablet, 1 Tablet = 1
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddUnitRow}
                    className="text-xs h-7 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1" /> Tambah Satuan
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.units.map((unit, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs"
                    >
                      <div className="col-span-3">
                        <Label className="text-[10px] text-slate-500 block mb-1">Nama Satuan</Label>
                        <Input
                          placeholder="Box / Strip / Tablet"
                          value={unit.unitName}
                          onChange={(e) => handleUnitChange(idx, "unitName", e.target.value)}
                          className="text-xs h-8 bg-white"
                        />
                      </div>

                      <div className="col-span-2">
                        <Label className="text-[10px] text-slate-500 block mb-1">Konversi ({formData.baseUnit})</Label>
                        <Input
                          type="number"
                          min={1}
                          value={unit.conversionFactor}
                          onChange={(e) =>
                            handleUnitChange(idx, "conversionFactor", parseInt(e.target.value) || 1)
                          }
                          className="text-xs h-8 bg-white"
                        />
                      </div>

                      <div className="col-span-3">
                        <Label className="text-[10px] text-slate-500 block mb-1">Harga Beli (HPP)</Label>
                        <Input
                          type="number"
                          value={unit.buyPrice}
                          onChange={(e) => handleUnitChange(idx, "buyPrice", e.target.value)}
                          className="text-xs h-8 bg-white"
                        />
                      </div>

                      <div className="col-span-3">
                        <Label className="text-[10px] text-slate-500 block mb-1">Harga Jual Kasir</Label>
                        <Input
                          type="number"
                          value={unit.sellPrice}
                          onChange={(e) => handleUnitChange(idx, "sellPrice", e.target.value)}
                          className="text-xs h-8 bg-white font-semibold text-blue-700"
                        />
                      </div>

                      <div className="col-span-1 text-right pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveUnitRow(idx)}
                          className="text-slate-400 hover:text-red-600 p-1"
                          title="Hapus Satuan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <Button type="button" variant="outline" size="sm" onClick={closeModal} className="text-xs h-9">
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-5 shadow-sm"
                >
                  {saveMutation.isPending ? "Menyimpan..." : "Simpan Produk"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Barcode Scanner Helper */}
      {barcodeSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Barcode className="h-5 w-5 text-blue-600" />
                Cari Obat via Barcode Scanner
              </h3>
              <button
                onClick={() => setBarcodeSearchModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Arahkan scanner USB atau ketik barcode obat untuk menemukan produk secara instan.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearch(scannedBarcode);
                setBarcodeSearchModal(false);
              }}
              className="space-y-3"
            >
              <Input
                autoFocus
                placeholder="Contoh: 899123456001"
                value={scannedBarcode}
                onChange={(e) => setScannedBarcode(e.target.value)}
                className="text-xs font-mono h-10"
              />
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-9">
                Cari Obat
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Barcode & Shelf Label Print Modal */}
      <BarcodePrintModal
        isOpen={!!selectedBarcodeProduct}
        onClose={() => setSelectedBarcodeProduct(null)}
        product={selectedBarcodeProduct}
      />
    </div>
  );
}
