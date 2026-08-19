"use client";

import { ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, Globe } from "lucide-react";

interface LoadboardWidgetMockupProps {
  onSelectLoad: (id: string) => void;
}

export function LoadboardWidgetMockup({ onSelectLoad }: LoadboardWidgetMockupProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-600 text-white shadow-md">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
              Enterprise Integration Roadmap
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              LOADPASS Carrier Extension
            </h3>
          </div>
        </div>

        <p className="text-xs font-semibold text-slate-500 max-w-md">
          How carriers inspect live authority directly inside DAT & Truckstop loadboard listings before clicking &quot;Book Now&quot;.
        </p>
      </div>

      {/* Simulated Freight Loadboard Container */}
      <div className="rounded-xl border border-slate-300 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-3">
        <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase tracking-wider text-slate-500">
          <span>Freight Loadboard Listing (DAT / Truckstop Simulator)</span>
          <span className="text-sky-600 dark:text-sky-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> LOADPASS Extension Active
          </span>
        </div>

        {/* Listing Row 1 (Verified) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 hover:border-sky-400 transition">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-slate-900 dark:text-white">LP-4821</span>
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200">Chicago, IL → Dallas, TX</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                53&apos; Dry Van
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Offered by: <strong className="text-slate-800 dark:text-slate-200">QuickHaul Logistics</strong> · Rate: <span className="font-mono font-bold text-slate-900 dark:text-white">$2,450</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Embedded LOADPASS Extension Pill */}
            <button
              onClick={() => onSelectLoad("LP-4821")}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 transition"
              title="Inspect on LOADPASS"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>✓ AUTHORITY VERIFIED</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </button>
          </div>
        </div>

        {/* Listing Row 2 (Missing Delegation) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 hover:border-amber-400 transition">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-slate-900 dark:text-white">LP-7734</span>
              <span className="font-bold text-xs text-slate-700 dark:text-slate-200">Atlanta, GA → Houston, TX</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                53&apos; Reefer
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Offered by: <strong className="text-slate-800 dark:text-slate-200">FastLine Brokerage</strong> · Rate: <span className="font-mono font-bold text-slate-900 dark:text-white">$3,100</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Embedded LOADPASS Extension Pill */}
            <button
              onClick={() => onSelectLoad("LP-7734")}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-black text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300 transition"
              title="Inspect on LOADPASS"
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>⚠ MISSING DELEGATION</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
