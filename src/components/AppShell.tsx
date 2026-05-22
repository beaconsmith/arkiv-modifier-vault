"use client";

import { BrainCircuit, DatabaseZap, Map, PlusCircle, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { APP_NAME, PROJECT_ATTRIBUTE } from "@/lib/constants";

import { WalletButton } from "./WalletButton";

const navItems = [
  { href: "/", label: "Home", icon: BrainCircuit },
  { href: "/create", label: "Create", icon: PlusCircle },
  { href: "/query", label: "Query", icon: Search },
  { href: "/atlas", label: "Atlas", icon: Map },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#f7fafc] text-slate-950">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(90deg,rgba(14,165,233,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(244,63,94,0.08)_1px,transparent_1px)] bg-[size:72px_72px]" />
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f7fafc]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)]">
              <DatabaseZap className="h-5 w-5 text-[#4cc9f0]" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-black tracking-tight">{APP_NAME}</span>
              <span className="block truncate font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                {PROJECT_ATTRIBUTE}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-600 hover:bg-white/80 hover:text-slate-950"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <WalletButton />
        </div>
      </header>
      <main className="pb-24 md:pb-0">{children}</main>
      <nav
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 gap-2 rounded-xl border border-slate-200 bg-white/92 p-2 shadow-[0_18px_45px_rgba(15,23,42,0.16)] backdrop-blur md:hidden"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`grid h-12 place-items-center rounded-lg text-xs font-semibold ${
                isActive ? "bg-slate-950 text-white" : "text-slate-600"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
