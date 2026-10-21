"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navGroups } from "./sidebar-items";
import { cn } from "@/lib/utils";
import { Cross } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Sidebar() {
  const pathname = usePathname();
  const { tenant } = useAuth();

  return (
    <aside className="w-[260px] bg-inverse-surface text-inverse-on-surface hidden md:flex flex-col h-screen sticky top-0 select-none z-30 shadow-[0_1px_8px_rgba(0,0,0,0.04)] justify-between">
      {/* Brand Header */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="h-16 px-4 flex items-center gap-3 bg-inverse-surface border-b border-white/5">
          <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <span className="material-symbols-outlined text-[22px]">local_pharmacy</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-inverse-on-surface tracking-tight truncate">
              {tenant?.name || "Apotek Digital"}
            </span>
            <span className="text-[11px] text-[#89f5e7] font-medium tracking-wide">
              {tenant?.plan ? `Cloud SaaS • ${tenant.plan}` : "Cloud SaaS POS"}
            </span>
          </div>
        </div>

        {/* Navigation Scrollable */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-outline-variant mb-1.5">
                {group.label}
              </div>
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all duration-150 group",
                      isActive
                        ? "bg-primary-container text-on-primary-container shadow-sm font-semibold"
                        : "text-inverse-on-surface/80 hover:bg-white/5 hover:text-inverse-on-surface"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon
                        className={cn(
                          "h-4 w-4 flex-shrink-0 transition-colors",
                          isActive
                            ? "text-white"
                            : "text-slate-400 group-hover:text-blue-300"
                        )}
                      />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                          item.badge === "AI"
                            ? "bg-purple-500/30 text-purple-200 border border-purple-400/30"
                            : "bg-secondary-container/20 text-[#89f5e7] border border-secondary-container/30"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer BPOM & Kemenkes Terstandarisasi */}
      <div className="p-3 bg-inverse-surface border-t border-white/5">
        <div className="p-2.5 rounded-lg bg-white/5 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#89f5e7] text-[20px]">
            verified_user
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[11px] text-inverse-on-surface font-semibold leading-tight">
              BPOM &amp; Kemenkes
            </span>
            <span className="text-[10px] text-outline-variant leading-tight">
              Terstandarisasi SIPNAP &amp; FEFO
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
