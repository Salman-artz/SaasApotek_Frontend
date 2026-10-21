// Types matching Apotek Digital SaaS Database & API

export type UserRole = 'super_admin' | 'owner' | 'pharmacist' | 'cashier' | 'inventory';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  outletId?: string | null;
  outletName?: string;
  isActive?: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'starter' | 'pro' | 'enterprise';
}

export interface Outlet {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  siaNumber?: string | null;
  sipaNumber?: string | null;
  isActive?: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
  tenant: Tenant;
  outlet?: Outlet | null;
}

export interface MeResponse {
  user: User;
  tenant: Tenant;
  activeOutlet: Outlet | null;
  availableOutlets: Array<{ id: string; name: string }>;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  genericName?: string | null;
  sku?: string | null;
  barcode?: string | null;
  category: string;
  requiresPrescription: boolean;
  minStockAlert: number;
  baseUnit: string;
  isActive: boolean;
  units?: ProductUnit[];
  batches?: ProductBatch[];
}

export interface ProductUnit {
  id: string;
  productId: string;
  unitName: string;
  conversionFactor: number;
  buyPrice: string | number;
  sellPrice: string | number;
  isBaseUnit: boolean;
}

export interface ProductBatch {
  id: string;
  tenantId: string;
  outletId: string;
  productId: string;
  batchNumber: string;
  expiredDate: string;
  stockInBaseUnit: number;
  costPerBaseUnit: string | number;
}
