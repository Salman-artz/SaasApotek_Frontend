"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Truck,
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  X,
  Loader2,
  Building2,
} from "lucide-react";

interface SupplierItem {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  isActive: boolean;
}

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  // Query suppliers
  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      return await ApiClient.get<{ data: SupplierItem[] }>(`/api/suppliers?${params.toString()}`);
    },
  });

  const suppliersList = data?.data || [];

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingSupplier) {
        return await ApiClient.put(`/api/suppliers/${editingSupplier.id}`, payload);
      }
      return await ApiClient.post("/api/suppliers", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      closeModal();
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await ApiClient.delete(`/api/suppliers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({ name: "", phone: "", address: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (sup: SupplierItem) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      phone: sup.phone || "",
      address: sup.address || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
              <Truck className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-on-surface tracking-tight">
              Distributor / PBF (Pedagang Besar Farmasi)
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Daftar distributor resmi farmasi untuk pengadaan obat dan pencatatan faktur masuk.
          </p>
        </div>

        <Button
          size="sm"
          onClick={openAddModal}
          className="bg-primary-container hover:bg-blue-700 text-white text-xs h-9 px-4 shadow-sm rounded-xl"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Tambah PBF Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant/60" />
            <Input
              placeholder="Cari nama distributor, kontak, atau alamat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9 bg-surface-container-low border-outline-variant/30 text-on-surface rounded-xl"
            />
          </div>
          <div className="text-xs text-on-surface-variant">
            Total: <strong className="text-on-surface font-semibold">{suppliersList.length}</strong> distributor terdaftar
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <Loader2 className="h-6 w-6 animate-spin text-primary-container" />
            <span className="text-xs font-medium">Memuat data distributor...</span>
          </div>
        ) : suppliersList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-surface-container-low text-primary-container flex items-center justify-center mx-auto">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-on-surface">Tidak ada distributor</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
              {search ? `Tidak ditemukan distributor "${search}".` : "Belum ada distributor terdaftar."}
            </p>
            <Button size="sm" onClick={openAddModal} className="text-xs bg-primary-container hover:bg-blue-700 text-white rounded-xl shadow-sm">
              <Plus className="h-3.5 w-3.5 mr-1" /> Tambah PBF Pertama
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-on-surface">
              <thead className="bg-surface-container-low border-b border-outline-variant/20 text-on-surface-variant uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Nama Distributor / PBF</th>
                  <th className="py-3.5 px-3">Kontak / Telepon</th>
                  <th className="py-3.5 px-3">Alamat Gudang / Kantor</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15">
                {suppliersList.map((sup) => (
                  <tr key={sup.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-on-surface text-xs">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary-container flex-shrink-0" />
                        <span>{sup.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-on-surface-variant">
                      {sup.phone ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Phone className="h-3.5 w-3.5 text-on-surface-variant/60" />
                          <span>{sup.phone}</span>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant/40 italic">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-on-surface-variant max-w-xs truncate">
                      {sup.address ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <MapPin className="h-3.5 w-3.5 text-on-surface-variant/60 flex-shrink-0" />
                          <span className="truncate">{sup.address}</span>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant/40 italic">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Badge variant="success" className="text-[10px] px-2 py-0.5">
                        Aktif
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(sup)}
                          className="p-1.5 text-on-surface-variant hover:text-primary-container hover:bg-surface-container-low rounded-lg transition-colors"
                          title="Edit Distributor"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus ${sup.name}?`)) {
                              deleteMutation.mutate(sup.id);
                            }
                          }}
                          className="p-1.5 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Distributor"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Tambah / Edit Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-md w-full border border-outline-variant/30 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/20 bg-surface-container-low">
              <h3 className="text-sm font-bold text-on-surface">
                {editingSupplier ? "Edit Data Distributor / PBF" : "Tambah Distributor / PBF Baru"}
              </h3>
              <button onClick={closeModal} className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container-highest">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-on-surface">Nama Distributor / PBF *</Label>
                <Input
                  required
                  placeholder="Contoh: PT. Kimia Farma Trading"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-xs h-9 bg-surface-container-lowest border-outline-variant/30 text-on-surface rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-on-surface">Nomor Telepon / WhatsApp</Label>
                <Input
                  placeholder="Contoh: 021-3847709 / 08123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="text-xs h-9 bg-surface-container-lowest border-outline-variant/30 text-on-surface rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-on-surface">Alamat Kantor / Gudang</Label>
                <Input
                  placeholder="Contoh: Jl. Budi Utomo No. 1, Jakarta Pusat"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="text-xs h-9 bg-surface-container-lowest border-outline-variant/30 text-on-surface rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={closeModal} className="text-xs h-9 border-outline-variant/40 rounded-xl text-on-surface hover:bg-surface-container-low">
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  size="sm"
                  className="bg-primary-container hover:bg-blue-700 text-white text-xs h-9 px-4 rounded-xl shadow-sm"
                >
                  {saveMutation.isPending ? "Menyimpan..." : "Simpan Distributor"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
