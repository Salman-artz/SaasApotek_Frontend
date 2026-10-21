"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { User, Tenant, Outlet, MeResponse } from "@/types";
import { ApiClient } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  activeOutlet: Outlet | null;
  availableOutlets: Array<{ id: string; name: string }>;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    pharmacyName: string;
    ownerName: string;
    email: string;
    phone?: string;
    password: string;
    plan: 'starter' | 'pro' | 'enterprise';
  }) => Promise<void>;
  switchOutlet: (outletId: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [activeOutlet, setActiveOutlet] = useState<Outlet | null>(null);
  const [availableOutlets, setAvailableOutlets] = useState<Array<{ id: string; name: string }>>([]);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchMe = async () => {
    try {
      const res = await ApiClient.get<MeResponse>("/api/auth/me");
      setUser(res.user);
      setTenant(res.tenant);
      setActiveOutlet(res.activeOutlet);
      setAvailableOutlets(res.availableOutlets);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("tenant", JSON.stringify(res.tenant));
      if (res.activeOutlet) {
        localStorage.setItem("activeOutlet", JSON.stringify(res.activeOutlet));
      }
    } catch (e) {
      console.error("Failed to load user info:", e);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedTenant = localStorage.getItem("tenant");
    const storedOutlet = localStorage.getItem("activeOutlet");

    if (storedToken) {
      setTokenState(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedTenant) setTenant(JSON.parse(storedTenant));
      if (storedOutlet) setActiveOutlet(JSON.parse(storedOutlet));
      // Langsung hilangkan loading spinner jika sudah ada data lokal (instan render)
      setIsLoading(false);
      // Validasi sesi dan sinkronisasi di latar belakang
      fetchMe().catch(() => {});
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await ApiClient.post<any>("/api/auth/login", { email, password });
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("tenant", JSON.stringify(res.tenant));
      if (res.outlet) {
        localStorage.setItem("activeOutlet", JSON.stringify(res.outlet));
      }

      setTokenState(res.token);
      setUser(res.user);
      setTenant(res.tenant);
      setActiveOutlet(res.outlet || null);

      await fetchMe();
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    pharmacyName: string;
    ownerName: string;
    email: string;
    phone?: string;
    password: string;
    plan: 'starter' | 'pro' | 'enterprise';
  }) => {
    setIsLoading(true);
    try {
      const res = await ApiClient.post<any>("/api/auth/register", data);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      localStorage.setItem("tenant", JSON.stringify(res.tenant));
      if (res.outlet) {
        localStorage.setItem("activeOutlet", JSON.stringify(res.outlet));
      }

      setTokenState(res.token);
      setUser(res.user);
      setTenant(res.tenant);
      setActiveOutlet(res.outlet || null);

      await fetchMe();
      router.push("/onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  const switchOutlet = async (outletId: string) => {
    try {
      const res = await ApiClient.post<any>("/api/auth/switch-outlet", { outletId });
      localStorage.setItem("token", res.token);
      setTokenState(res.token);
      await fetchMe();
    } catch (e) {
      console.error("Switch outlet failed", e);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tenant");
    localStorage.removeItem("activeOutlet");
    setTokenState(null);
    setUser(null);
    setTenant(null);
    setActiveOutlet(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        activeOutlet,
        availableOutlets,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        register,
        switchOutlet,
        logout,
        refreshUser: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
