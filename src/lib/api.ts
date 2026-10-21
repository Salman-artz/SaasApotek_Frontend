import { API_URL } from "./constants";

export class ApiClient {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const normalizedEndpoint = endpoint.startsWith("/api")
      ? endpoint
      : `/api${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

    try {
      const response = await fetch(`${API_URL}${normalizedEndpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });

      if (response.status === 401) {
        const data = await response.json().catch(() => ({}));
        // Only redirect to /login if the request was NOT already the login endpoint
        if (!endpoint.includes('/auth/login')) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }
        }
        throw new Error(data.message || data.error || "Autentikasi Gagal");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      return data as T;
    } catch (error) {
      console.error("API Request Error:", error);
      throw error;
    }
  }

  static get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  static post<T>(endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  static put<T>(endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  static patch<T>(endpoint: string, body: any, options?: RequestInit) {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  static delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}
