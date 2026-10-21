"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Bell, Store, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export function Topbar() {
  const { user, activeOutlet, availableOutlets, switchOutlet, logout } = useAuth();
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path === "/dashboard") return "Dashboard Utama";
    if (path.startsWith("/pos")) return "Kasir POS";
    if (path.startsWith("/transactions")) return "Riwayat Transaksi";
    if (path.startsWith("/products")) return "Master Data Obat";
    if (path.startsWith("/inventory/expiry-radar")) return "Radar Kadaluarsa (FEFO)";
    if (path.startsWith("/inventory")) return "Manajemen Stok & Batch";
    if (path.startsWith("/suppliers")) return "Distributor / PBF";
    if (path.startsWith("/purchases/debts")) return "Hutang Dagang PBF";
    if (path.startsWith("/purchases")) return "Faktur Pembelian Masuk";
    if (path.startsWith("/prescriptions")) return "Resep Dokter";
    if (path.startsWith("/customers")) return "Database Pasien";
    if (path.startsWith("/reports")) return "Laporan & Rekap";
    if (path.startsWith("/ai-assistant")) return "Tanya AI Assistant";
    if (path.startsWith("/ai-insights")) return "Insight AI Analytics";
    if (path.startsWith("/settings")) return "Pengaturan Outlet";
    return "Apotek Digital";
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "owner":
        return "Owner / Pemilik";
      case "pharmacist":
        return "Apoteker (Apt)";
      case "cashier":
        return "Kasir Shift 1";
      case "inventory":
        return "Gudang Farmasi";
      case "super_admin":
        return "Super Admin";
      default:
        return "Staf Apotek";
    }
  };

  return (
    <header className="h-16 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/30 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left Search & Title */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px] text-outline">search</span>
          <input
            className="bg-transparent border-none text-xs text-on-surface placeholder:text-outline focus:outline-none w-56 md:w-64"
            placeholder="Cari obat, SKU, resep, atau nota..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-outline font-medium">Apotek</span>
          <span className="text-outline-variant">/</span>
          <span className="font-semibold text-on-surface">{getPageTitle(pathname)}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Outlet Aktif */}
        {availableOutlets.length > 0 && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-surface-container-low text-on-surface">
            <span className="material-symbols-outlined text-primary-container text-[18px]">store</span>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-on-surface-variant leading-none">Outlet Aktif</span>
              <select
                aria-label="Pilih Cabang Outlet"
                className="bg-transparent border-none text-xs font-semibold text-on-surface focus:outline-none cursor-pointer p-0"
                value={activeOutlet?.id || ""}
                onChange={(e) => switchOutlet(e.target.value)}
              >
                {availableOutlets.map((outlet) => (
                  <option key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Shift Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Shift Pagi Aktif</span>
        </div>

        {/* Notifikasi Dropdown Popover */}
        <NotificationPopover />

        <div className="h-5 w-px bg-outline-variant/40 mx-1" />

        {/* User Profile */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {user?.fullName?.charAt(0) || "U"}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-on-surface leading-tight">
              {user?.fullName || "Pengguna"}
            </span>
            <span className="text-[11px] text-on-surface-variant leading-tight">
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 text-outline hover:text-red-600 hover:bg-error-container/30 rounded-lg transition-colors ml-1"
          title="Keluar dari Aplikasi"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
        </button>
      </div>
    </header>
  );
}

// ==========================================
// NOTIFICATION POPOVER COMPONENT
// ==========================================
interface NotificationItem {
  id: string;
  type: "stock" | "fefo" | "debt" | "prescription";
  title: string;
  message: string;
  time: string;
  href: string;
  read: boolean;
  priority: "high" | "warning" | "info";
}

function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      type: "stock",
      title: "Stok Menipis (Di Bawah Safety Stock)",
      message: "Amoxicillin 500mg tersisa 4 Box. Segera lakukan pesanan ulang (Defecta).",
      time: "10 mnt yang lalu",
      href: "/inventory",
      read: false,
      priority: "high",
    },
    {
      id: "notif-2",
      type: "fefo",
      title: "Radar FEFO: Obat Mendekati Expired",
      message: "Paracetamol Sirup 60ml (Batch PCT-SYR-03) expired < 60 hari.",
      time: "1 jam yang lalu",
      href: "/inventory/expiry-radar",
      read: false,
      priority: "warning",
    },
    {
      id: "notif-3",
      type: "debt",
      title: "Jatuh Tempo Hutang PBF (H-3)",
      message: "Faktur PBF PT Kalbe Farma Rp 3.500.000 jatuh tempo tgl 22 Okt 2026.",
      time: "2 jam yang lalu",
      href: "/purchases/debts",
      read: false,
      priority: "warning",
    },
    {
      id: "notif-4",
      type: "prescription",
      title: "Resep Dokter Siap Diracik",
      message: "Resep dr. Farhan (Pasien: Ibu Rahmawati) menunggu penyerahan etiket.",
      time: "3 jam yang lalu",
      href: "/prescriptions",
      read: true,
      priority: "info",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const markItemAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "stock":
        return <span className="material-symbols-outlined text-[18px] text-red-600">inventory_2</span>;
      case "fefo":
        return <span className="material-symbols-outlined text-[18px] text-amber-600">history_toggle_off</span>;
      case "debt":
        return <span className="material-symbols-outlined text-[18px] text-blue-600">account_balance_wallet</span>;
      case "prescription":
        return <span className="material-symbols-outlined text-[18px] text-emerald-600">prescriptions</span>;
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-low transition-colors"
        title="Lihat Notifikasi"
        aria-label="Lihat Notifikasi"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 px-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-on-surface">Notifikasi Apotek</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                  {unreadCount} Baru
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-primary-container hover:underline font-semibold"
              >
                Tandai Dibaca
              </button>
            )}
          </div>

          {/* List Notifications */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-outline-variant/15 text-xs scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-xs">
                Tidak ada notifikasi baru
              </div>
            ) : (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    markItemAsRead(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-start gap-3 p-3.5 transition-colors ${
                    item.read
                      ? "bg-surface-container-lowest hover:bg-surface-container-low/50"
                      : "bg-blue-50/40 hover:bg-blue-50/70"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-surface-container-low flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span
                        className={`font-semibold truncate text-[11px] ${
                          item.read ? "text-on-surface" : "text-primary-container"
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="text-[10px] text-outline whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>

                    <p className="text-[11px] text-on-surface-variant line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-primary-container flex-shrink-0 mt-2" />
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-surface-container-low border-t border-outline-variant/20 text-center">
            <Link
              href="/inventory/expiry-radar"
              onClick={() => setIsOpen(false)}
              className="text-[11px] text-primary-container hover:underline font-semibold inline-flex items-center gap-1"
            >
              Lihat Radar &amp; Peringatan Lengkap
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
