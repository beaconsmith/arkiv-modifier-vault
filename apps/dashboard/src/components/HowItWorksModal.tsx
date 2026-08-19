"use client";

import { X, ShieldCheck } from "lucide-react";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-600 text-white shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">How LOADPASS Works</h3>
              <p className="text-xs font-semibold text-slate-500">
                4-step verification of live freight tender authority
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex items-start gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sky-600 text-xs font-black text-white">
              1
            </span>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Shipper grants authority</h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                The original shipper issues a cryptographic <code className="font-mono text-sky-600">LOAD_MANDATE</code> record specifying who may tender the load, allowed scope, delegation permissions, and validity lifetime.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex items-start gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sky-600 text-xs font-black text-white">
              2
            </span>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Permitted broker delegates authority</h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                When parent mandate permits delegation, the authorised broker creates a <code className="font-mono text-sky-600">DELEGATION</code> payload to pass tender authority to a downstream broker partner.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex items-start gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sky-600 text-xs font-black text-white">
              3
            </span>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Carrier checks the live chain</h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Before booking a load offer, the carrier queries LOADPASS to verify the live authority lineage back to the shipper in under 5 seconds.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex items-start gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sky-600 text-xs font-black text-white">
              4
            </span>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Authority expires when market life ends</h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Mandates and delegations have explicit validity windows. Once expired or revoked, downstream authority automatically ceases.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
