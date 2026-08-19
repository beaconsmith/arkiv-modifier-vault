"use client";

import { useState } from "react";
import { ShieldCheck, Search, RefreshCw, ChevronDown, CheckCircle2, AlertTriangle, Clock, HelpCircle, Database } from "lucide-react";

interface LoadPassHeaderProps {
  onSearch: (reference: string) => void;
  onReset: () => void;
  onOpenHowItWorks: () => void;
  onOpenArkivInspector: () => void;
  currentSearchId?: string;
  isSearching: boolean;
}

export function LoadPassHeader({
  onSearch,
  onReset,
  onOpenHowItWorks,
  onOpenArkivInspector,
  currentSearchId,
  isSearching,
}: LoadPassHeaderProps) {
  const [headerInput, setHeaderInput] = useState("");
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleHeaderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerInput.trim()) {
      onSearch(headerInput.trim());
      setHeaderInput("");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 shadow-xs">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        
        {/* Top-left Branding & Tagline */}
        <div className="flex items-center gap-6">
          <button
            onClick={onReset}
            className="flex items-center gap-3 text-left focus:outline-none group"
            title="LOADPASS Home"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-sky-400 dark:bg-slate-800 dark:text-sky-300 shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  LOADPASS
                </span>
                <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  Ideathon Pro
                </span>
              </div>
              <span className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                Verify the right to tender
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300">
            <button
              onClick={onOpenHowItWorks}
              className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition"
            >
              How it works
            </button>

            <button
              onClick={onOpenArkivInspector}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition"
            >
              <Database className="h-3.5 w-3.5 text-sky-600" />
              <span>What is on Arkiv?</span>
            </button>
          </nav>
        </div>

        {/* Top-right Controls & Search */}
        <div className="flex items-center gap-3">
          
          {/* Compressed Search Input (when result is active) */}
          <form onSubmit={handleHeaderSubmit} className="hidden sm:flex items-center relative">
            <input
              type="text"
              value={headerInput}
              onChange={(e) => setHeaderInput(e.target.value)}
              placeholder={currentSearchId ? `Current: ${currentSearchId}` : "Check load ref (e.g. LP-4821)"}
              disabled={isSearching}
              className="h-9 w-48 md:w-56 rounded-lg border border-slate-300 bg-slate-50 pl-8 pr-3 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </form>

          {/* Demo Scenarios Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
            >
              <span>Demo scenarios</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {demoMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50">
                <div className="px-2 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Select Hackathon Demo Scenario
                </div>
                
                <button
                  onClick={() => {
                    onSearch("LP-4821");
                    setDemoMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Verified authority</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">LP-4821</span>
                </button>

                <button
                  onClick={() => {
                    onSearch("LP-7734");
                    setDemoMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Missing delegation</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400">LP-7734</span>
                </button>

                <button
                  onClick={() => {
                    onSearch("LP-5910");
                    setDemoMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Expired mandate</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-amber-700 dark:text-amber-400">LP-5910</span>
                </button>

                <button
                  onClick={() => {
                    onSearch("LP-9999");
                    setDemoMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Unknown load test</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-500">LP-9999</span>
                </button>
              </div>
            )}
          </div>

          {/* Secondary Reset Action */}
          {currentSearchId && (
            <button
              onClick={onReset}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Check another load</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
