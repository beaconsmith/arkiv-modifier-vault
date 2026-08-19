"use client";

import { X, Clock, ShieldCheck, ArrowDown, Building2, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";
import type { LoadDetails } from "@/lib/loadpassData";

interface AuthorityDrawerProps {
  load: LoadDetails;
  isOpen: boolean;
  onClose: () => void;
  isSimulatedExpired?: boolean;
}

export function AuthorityDrawer({
  load,
  isOpen,
  onClose,
  isSimulatedExpired,
}: AuthorityDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-950">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Authority chain</h3>
              <p className="text-xs font-semibold text-slate-500">
                Who authorised whom for load <strong className="text-slate-800 dark:text-slate-200 font-mono">{load.id}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Expiry Simulation Notice if active */}
            {isSimulatedExpired && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                <strong>Simulated Expiry Active:</strong> Mandate validUntil time was reached during interactive demo.
              </div>
            )}

            {/* Vertical Flow Links */}
            <div className="space-y-4">
              {load.status === "NOT_VERIFIED" && load.missingChain ? (
                /* Unverified Missing Flow */
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">1. Shipper</span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Sunrise Foods</h4>
                    <p className="text-xs text-slate-500">Issued parent mandate LP-M619</p>
                  </div>

                  <div className="flex justify-center text-slate-400">
                    <ArrowDown className="h-4 w-4" />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">2. Authorised Broker</span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Atlantic Freight</h4>
                    <p className="text-xs text-slate-500">Delegation rights: Allowed</p>
                  </div>

                  <div className="flex justify-center text-red-500">
                    <ArrowDown className="h-4 w-4 animate-bounce" />
                  </div>

                  <div className="rounded-xl border-2 border-dashed border-red-400 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                    <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                      MISSING DELEGATION
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-red-900 dark:text-red-300">No live record found</h4>
                    <p className="text-xs text-red-700 dark:text-red-400">Authority chain broken at Atlantic Freight → FastLine Brokerage step.</p>
                  </div>

                  <div className="flex justify-center text-slate-300">
                    <ArrowDown className="h-4 w-4" />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 opacity-75 dark:border-slate-800 dark:bg-slate-950">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">3. Offering Broker</span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">FastLine Brokerage</h4>
                    <p className="text-xs font-semibold text-amber-600">Unverified tender offer</p>
                  </div>
                </div>
              ) : (
                /* Verified & Expired Flow Links */
                load.chain.map((step, idx) => (
                  <div key={step.id} className="space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {idx + 1}. {step.role}
                        </span>
                        {step.creatorId && (
                          <code className="text-[10px] font-mono text-slate-400">{step.creatorId}</code>
                        )}
                      </div>

                      <h4 className="mt-2 text-base font-black text-slate-900 dark:text-white">{step.name}</h4>
                      <p className="text-xs text-slate-500">{step.sublabel}</p>

                      {step.connector && (
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs">
                          <span className="font-mono text-[10px] font-bold text-sky-700 dark:text-sky-400">
                            {step.connector.type} {step.connector.ref ? `· ${step.connector.ref}` : ""}
                          </span>
                          {step.connector.details.map((d) => (
                            <div key={d.label} className="flex justify-between text-[11px]">
                              <span className="text-slate-500">{d.label}:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{d.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {idx < load.chain.length - 1 && (
                      <div className="flex justify-center text-sky-600 dark:text-sky-400">
                        <ArrowDown className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Compact Timeline */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 dark:border-slate-800">
                <Clock className="h-4 w-4 text-sky-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Authority Lifecycle Timeline
                </h4>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                {load.timeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="font-mono text-[10px] font-bold text-slate-500 shrink-0 w-16 pt-0.5">
                      {item.time}
                    </span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        item.status === "active"
                          ? "bg-sky-600 animate-ping"
                          : item.status === "completed"
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`} />
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                        {item.event}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
            <button
              onClick={onClose}
              className="w-full h-10 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition"
            >
              Close drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
