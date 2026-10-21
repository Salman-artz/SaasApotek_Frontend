"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { AuthProvider } from "@/hooks/use-auth";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false, // Hindari fetch ulang saat klik window lain
            refetchOnMount: false, // Gunakan cache yang ada jika belum stale
            retry: 1,
            staleTime: 60 * 1000, // Data valid selama 1 menit (instant render saat ganti tab)
            gcTime: 5 * 60 * 1000, // Cache disimpan 5 menit di memori
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
