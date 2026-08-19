"use client";

import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, ShieldAlert, ArrowDown } from "lucide-react";
import type { LoadDetails } from "@/lib/loadpassData";

interface AuthorityChainViewProps {
  load: LoadDetails;
  onClose: () => void;
}

export function AuthorityChainView({ load, onClose }: AuthorityChainViewProps) {
  if (load.status === "NOT_VERIFIED") {
    return (
      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-6 dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="flex items-center justify-between border-b border-amber-200/80 pb-4 dark:border-amber-900/40">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-600 text-white shadow-xs">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Authority Chain — Disrupted</h3>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Load {load.id} · Verification Failed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Hide authority chain
          </button>
        </div>

        {/* Missing Chain Flow */}
        <div className="mt-6 grid gap-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Step 1 */}
            <div className="flex-1 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                1. Shipper
              </span>
              <h4 className="mt-1 font-bold text-slate-900 dark:text-white">Sunrise Foods</h4>
              <p className="text-xs text-slate-500">Original issuer</p>
            </div>

            <div className="hidden md:flex items-center justify-center text-slate-400">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div className="flex md:hidden justify-center text-slate-400">
              <ArrowDown className="h-5 w-5" />
            </div>

            {/* Step 2 */}
            <div className="flex-1 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                2. Authorised Broker
              </span>
              <h4 className="mt-1 font-bold text-slate-900 dark:text-white">Atlantic Freight</h4>
              <p className="text-xs text-slate-500">Has parent mandate LP-M619</p>
            </div>

            <div className="hidden md:flex items-center justify-center text-amber-500">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div className="flex md:hidden justify-center text-amber-500">
              <ArrowDown className="h-5 w-5" />
            </div>

            {/* Missing Link */}
            <div className="flex-1 rounded-lg border-2 border-dashed border-red-400 bg-red-50/80 p-4 dark:border-red-800 dark:bg-red-950/30">
              <span className="inline-block rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                MISSING AUTHORITY
              </span>
              <h4 className="mt-1 font-bold text-red-900 dark:text-red-300">No live delegation</h4>
              <p className="text-xs text-red-700 dark:text-red-400">No active link to FastLine Brokerage</p>
            </div>

            <div className="hidden md:flex items-center justify-center text-slate-300">
              <ArrowRight className="h-5 w-5" />
            </div>
            <div className="flex md:hidden justify-center text-slate-300">
              <ArrowDown className="h-5 w-5" />
            </div>

            {/* Step 4 */}
            <div className="flex-1 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 opacity-75 shadow-xs">
              <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                Current Broker
              </span>
              <h4 className="mt-1 font-bold text-slate-900 dark:text-white">FastLine Brokerage</h4>
              <p className="text-xs text-amber-600 font-semibold dark:text-amber-400">Unauthorised tender</p>
            </div>
          </div>

          {/* Warning CTA Box */}
          <div className="mt-3 rounded-lg border border-red-200 bg-white p-5 dark:border-red-900 dark:bg-slate-900 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-base font-black text-red-900 dark:text-red-300">Do not accept yet</h4>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Ask the broker for updated authority or contact the original broker before accepting the load.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50/40 p-6 dark:border-sky-900/50 dark:bg-slate-900/60 shadow-xs">
      <div className="flex items-center justify-between border-b border-sky-200/80 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-sky-600 text-white shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Authority Chain — Live Lineage</h3>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Verified record chain for load {load.id}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Hide authority chain
        </button>
      </div>

      {/* Horizontal / Vertical Lineage Flow */}
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch relative">
          {load.chain.map((step, idx) => (
            <div key={step.id} className="flex flex-col relative">
              <div className="h-full rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                      {idx + 1}. {step.role}
                    </span>
                    {step.status && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        {step.status}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-3 text-base font-black text-slate-900 dark:text-white">{step.name}</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{step.sublabel}</p>
                </div>

                {step.connector && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {step.connector.type}
                    </span>
                    <div className="mt-1.5 space-y-1">
                      {step.connector.details.map((d) => (
                        <div key={d.label} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">{d.label}:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Visual Lineage Map Badge */}
        <div className="rounded-lg border border-sky-200/80 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span className="rounded-md bg-slate-100 px-2.5 py-1 dark:bg-slate-800">ABC Foods (Shipper)</span>
            <ArrowRight className="h-3.5 w-3.5 text-sky-600" />
            <span className="rounded-md bg-slate-100 px-2.5 py-1 dark:bg-slate-800">Northstar Freight (Broker A)</span>
            <ArrowRight className="h-3.5 w-3.5 text-sky-600" />
            <span className="rounded-md bg-slate-100 px-2.5 py-1 dark:bg-slate-800">QuickHaul Logistics (Broker B)</span>
            <ArrowRight className="h-3.5 w-3.5 text-sky-600" />
            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800">
              You (Carrier)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
