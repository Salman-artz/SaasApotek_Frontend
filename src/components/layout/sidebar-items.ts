import {
  LayoutDashboard,
  ShoppingCart,
  History,
  Pill,
  Package,
  AlertTriangle,
  Truck,
  FileSpreadsheet,
  Receipt,
  Tag,
  FileHeart,
  Users,
  BarChart3,
  TrendingUp,
  PieChart,
  Wallet,
  Bot,
  Sparkles,
  Settings,
  ClipboardList,
  ArrowLeftRight,
  BellRing,
  HeartHandshake,
  CreditCard,
} from "lucide-react";

export interface NavGroup {
  label: string;
  items: Array<{
    title: string;
    href: string;
    icon: any;
    badge?: string;
  }>;
}

export const navGroups: NavGroup[] = [
  {
    label: "UTAMA",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "PENJUALAN",
    items: [
      { title: "Kasir POS", href: "/pos", icon: ShoppingCart },
      { title: "Riwayat Transaksi", href: "/transactions", icon: History },
      { title: "Promo & Diskon", href: "/promotions", icon: Tag },
    ],
  },
  {
    label: "PRODUK & INVENTORY",
    items: [
      { title: "Katalog Obat", href: "/products", icon: Pill },
      { title: "Stok & Batch", href: "/inventory", icon: Package },
      { title: "Mutasi Cabang", href: "/inventory/transfers", icon: ArrowLeftRight },
      { title: "Radar Kadaluarsa", href: "/inventory/expiry-radar", icon: AlertTriangle },
    ],
  },
  {
    label: "PENGADAAN",
    items: [
      { title: "Buku Defecta", href: "/defecta", icon: ClipboardList, badge: "AI" },
      { title: "Supplier / PBF", href: "/suppliers", icon: Truck },
      { title: "Faktur Pembelian", href: "/purchases", icon: FileSpreadsheet },
      { title: "Hutang Dagang", href: "/purchases/debts", icon: Receipt },
    ],
  },
  {
    label: "FARMASI KLINIS",
    items: [
      { title: "Penebusan Resep", href: "/prescriptions", icon: FileHeart },
      { title: "Database Pasien", href: "/customers", icon: Users },
      { title: "Pengingat Rutin", href: "/customers/reminders", icon: BellRing, badge: "WA" },
    ],
  },
  {
    label: "LAPORAN & KEUANGAN",
    items: [
      { title: "Laporan & SIPNAP", href: "/reports", icon: BarChart3 },
      { title: "Laba Rugi (P&L)", href: "/accounting/profit-and-loss", icon: TrendingUp },
      { title: "Analisis Pareto ABC", href: "/accounting/pareto", icon: PieChart },
      { title: "Buku Kas & Biaya", href: "/accounting/expenses", icon: Wallet },
    ],
  },
  {
    label: "AI CERDAS",
    items: [
      { title: "Tanya AI", href: "/ai-assistant", icon: Bot, badge: "AI" },
      { title: "Insight AI", href: "/ai-insights", icon: Sparkles, badge: "Pro" },
    ],
  },
  {
    label: "INTEGRASI & SAAS",
    items: [
      { title: "SatuSehat Kemenkes", href: "/satusehat", icon: HeartHandshake, badge: "FHIR" },
      { title: "Billing & Paket", href: "/billing", icon: CreditCard },
      { title: "Pengaturan & Outlet", href: "/settings", icon: Settings },
    ],
  },
];
