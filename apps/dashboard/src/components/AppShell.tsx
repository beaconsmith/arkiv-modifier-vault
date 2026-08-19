"use client";

import { type ReactNode, useEffect } from "react";

export function AppShell({ children }: { children: ReactNode }) {

  useEffect(() => {
    // Keep light neutral theme for freight-tech SaaS aesthetic
    document.documentElement.classList.remove("dark");
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      <main className="min-h-screen">{children}</main>
    </div>
  );
}
