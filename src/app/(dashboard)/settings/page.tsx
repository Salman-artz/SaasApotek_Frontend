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
  Settings,
  Building2,
  Users,
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  Lock,
  Mail,
  Phone,
  MapPin,
  FileText,
  UserCheck,
} from "lucide-react";

interface OutletItem {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  siaNumber?: string | null;
  sipaNumber?: string | null;
  isActive: boolean;
  createdAt: string;
}

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  role: "owner" | "super_admin" | "pharmacist" | "cashier" | "inventory";
  outletId?: string | null;
  outletName?: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();

  // Active Tab: 'outlets' | 'users' | 'profile'
  const [activeTab, setActiveTab] = useState<"outlets" | "users" | "profile">("outlets");

  // Modals state
  const [isOutletModalOpen, setIsOutletModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<OutletItem | null>(null);

  // Form State: Outlet
  const [outletForm, setOutletForm] = useState({
    name: "",
    address: "",
    phone: "",
    siaNumber: "",
    sipaNumber: "",
  });

  // Form State: User
  const [userForm, setUserForm] = useState<{
    fullName: string;
    email: string;
    password: string;
    role: "pharmacist" | "cashier" | "inventory" | "owner";
    outletId: string;
  }>({
    fullName: "",
    email: "",
    password: "",
    role: "pharmacist",
    outletId: "",
  });

  // 1. Fetch Outlets
  const { data: outletsData, isLoading: isOutletsLoading } = useQuery({
    queryKey: ["settings-outlets"],
    queryFn: async () => {
      const res = await ApiClient.get<{ data: OutletItem[] }>("/api/outlets");
      return res.data || [];
    },
  });
  const outletsList = outletsData || [];

  // 2. Fetch Users
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ["settings-users"],
    queryFn: async () => {
      const res = await ApiClient.get<{ data: UserItem[] }>("/api/users");
      return res.data || [];
    },
  });
  const usersList = usersData || [];

  // Mutations
  const saveOutletMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingOutlet) {
        return await ApiClient.put(`/api/outlets/${editingOutlet.id}`, payload);
      }
      return await ApiClient.post("/api/outlets", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings-outlets"] });
      queryClient.invalidateQueries({ queryKey: ["outlets"] });
      setIsOutletModalOpen(false);
      setEditingOutlet(null);
      setOutletForm({ name: "", address: "", phone: "", siaNumber: "", sipaNumber: "" });
    },
    onError: (err: any) => {
      alert(err.message || "Gagal menyimpan data cabang outlet");
    },
  });

  const saveUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await ApiClient.post("/api/users", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings-users"] });
      setIsUserModalOpen(false);
      setUserForm({ fullName: "", email: "", password: "", role: "pharmacist", outletId: "" });
    },
    onError: (err: any) => {
      alert(err.message || "Gagal menambahkan user pegawai");
    },
  });

  const openAddOutlet = () => {
    setEditingOutlet(null);
    setOutletForm({ name: "", address: "", phone: "", siaNumber: "", sipaNumber: "" });
    setIsOutletModalOpen(true);
  };

  const openEditOutlet = (outlet: OutletItem) => {
    setEditingOutlet(outlet);
    setOutletForm({
      name: outlet.name,
      address: outlet.address || "",
      phone: outlet.phone || "",
      siaNumber: outlet.siaNumber || "",
      sipaNumber: outlet.sipaNumber || "",
    });
    setIsOutletModalOpen(true);
  };

  const openAddUser = () => {
    setUserForm({
      fullName: "",
      email: "",
      password: "",
      role: "pharmacist",
      outletId: outletsList[0]?.id || "",
    });
    setIsUserModalOpen(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "owner":
      case "super_admin":
        return <Badge className="bg-emerald-100 text-emerald-800 border-none text-[11px]">Owner / Direktur</Badge>;
      case "pharmacist":
        return <Badge className="bg-blue-100 text-blue-800 border-none text-[11px]">Apoteker (APA)</Badge>;
      case "cashier":
        return <Badge className="bg-purple-100 text-purple-800 border-none text-[11px]">Kasir POS</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-none text-[11px]">Staf Gudang</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pengaturan & Multi-Cabang Apotek
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kelola legalitas outlet apotek (SIA, SIPA), staf & peran hak akses pengguna.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("outlets")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "outlets"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:border-gray-300"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Cabang Outlet Apotek ({outletsList.length})
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "users"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:border-gray-300"
          }`}
        >
          <Users className="w-4 h-4" />
          Staf & Hak Akses User ({usersList.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CABANG OUTLET APOTEK */}
      {/* ========================================================================= */}
      {activeTab === "outlets" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Daftar cabang apotek resmi dengan legalitas Surat Izin Apotek (SIA) dan SIPA APA.
            </p>
            <Button
              onClick={openAddOutlet}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Cabang Baru
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isOutletsLoading ? (
              <div className="col-span-3 text-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
              </div>
            ) : outletsList.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-gray-400">
                Belum ada cabang outlet terdaftar.
              </div>
            ) : (
              outletsList.map((outlet) => (
                <Card
                  key={outlet.id}
                  className="border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm rounded-2xl overflow-hidden hover:border-emerald-500 transition-all"
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-xl text-emerald-600">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                            {outlet.name}
                          </h3>
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Cabang Aktif
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => openEditOutlet(outlet)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-emerald-600"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{outlet.address || "Belum ada alamat"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{outlet.phone || "Belum ada telepon"}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] pt-1">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        <span>SIA: {outlet.siaNumber || "Belum diatur"}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <Shield className="w-3.5 h-3.5 text-blue-600" />
                        <span>SIPA: {outlet.sipaNumber || "Belum diatur"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: STAF & HAK AKSES USER */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Daftar akun pegawai dengan Role-Based Access Control (RBAC).
            </p>
            <Button
              onClick={openAddUser}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Pegawai Baru
            </Button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-xs uppercase font-semibold border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3.5">Nama Pegawai</th>
                    <th className="px-4 py-3.5">Email Akun</th>
                    <th className="px-4 py-3.5">Peran / Hak Akses</th>
                    <th className="px-4 py-3.5">Penempatan Cabang</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-xs">
                  {isUsersLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                      </td>
                    </tr>
                  ) : usersList.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-400">
                        Belum ada pegawai yang terdaftar.
                      </td>
                    </tr>
                  ) : (
                    usersList.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3.5 font-bold text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                              {user.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <span>{user.fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-gray-500">{user.email}</td>
                        <td className="px-4 py-3.5">{getRoleBadge(user.role)}</td>
                        <td className="px-4 py-3.5 font-medium">{user.outletName || "Semua Cabang"}</td>
                        <td className="px-4 py-3.5 text-center">
                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <CheckCircle2 className="w-3 h-3" /> Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500">
                              <XCircle className="w-3 h-3" /> Nonaktif
                            </span>
                          )}
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

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH / EDIT OUTLET */}
      {/* ========================================================================= */}
      {isOutletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {editingOutlet ? "Edit Cabang Outlet" : "Tambah Cabang Outlet Baru"}
                </h3>
              </div>
              <button
                onClick={() => setIsOutletModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveOutletMutation.mutate(outletForm);
              }}
              className="space-y-3.5 pt-4 text-xs"
            >
              <div>
                <Label className="text-xs font-semibold">Nama Cabang / Outlet *</Label>
                <Input
                  required
                  placeholder="Contoh: Apotek Digital - Cabang Utama"
                  value={outletForm.name}
                  onChange={(e) => setOutletForm({ ...outletForm, name: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Alamat Lengkap</Label>
                <Input
                  placeholder="Jl. Sehat Sejahtera No. 88"
                  value={outletForm.address}
                  onChange={(e) => setOutletForm({ ...outletForm, address: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">No. Telepon</Label>
                <Input
                  placeholder="021-5551234 / 0812xxxx"
                  value={outletForm.phone}
                  onChange={(e) => setOutletForm({ ...outletForm, phone: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">No. Surat Izin Apotek (SIA)</Label>
                <Input
                  placeholder="Contoh: 445/SIA/2026/001"
                  value={outletForm.siaNumber}
                  onChange={(e) => setOutletForm({ ...outletForm, siaNumber: e.target.value })}
                  className="mt-1 text-xs font-mono"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">No. SIPA Apoteker (APA)</Label>
                <Input
                  placeholder="Contoh: 19940101/SIPA/2026/01"
                  value={outletForm.sipaNumber}
                  onChange={(e) => setOutletForm({ ...outletForm, sipaNumber: e.target.value })}
                  className="mt-1 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Button type="button" variant="outline" onClick={() => setIsOutletModalOpen(false)}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={saveOutletMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {saveOutletMutation.isPending ? "Menyimpan..." : "Simpan Cabang"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: TAMBAH PEGAWAI / USER */}
      {/* ========================================================================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Tambah Staf Pegawai Baru
                </h3>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveUserMutation.mutate(userForm);
              }}
              className="space-y-3.5 pt-4 text-xs"
            >
              <div>
                <Label className="text-xs font-semibold">Nama Lengkap *</Label>
                <Input
                  required
                  placeholder="Contoh: apt. Budi Santoso, S.Farm"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Email Login *</Label>
                <Input
                  required
                  type="email"
                  placeholder="budi@apotek.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Password Akun *</Label>
                <Input
                  required
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Peran / Hak Akses *</Label>
                <select
                  value={userForm.role}
                  onChange={(e: any) => setUserForm({ ...userForm, role: e.target.value })}
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-2.5 py-2 text-xs font-semibold"
                >
                  <option value="pharmacist">Apoteker Pengelola Apotek (APA)</option>
                  <option value="cashier">Kasir POS</option>
                  <option value="inventory">Staf Gudang / Logistik</option>
                  <option value="owner">Owner / Direktur</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Penempatan Cabang Outlet *</Label>
                <select
                  value={userForm.outletId}
                  onChange={(e) => setUserForm({ ...userForm, outletId: e.target.value })}
                  className="mt-1 w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg px-2.5 py-2 text-xs"
                >
                  {outletsList.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <Button type="button" variant="outline" onClick={() => setIsUserModalOpen(false)}>
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={saveUserMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {saveUserMutation.isPending ? "Menyimpan..." : "Tambah Pegawai"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
