"use client";

import { Check, X, ShieldCheck } from "lucide-react";
import type { VerificationCheck } from "@/lib/loadpassData";

interface AuthorityChecksViewProps {
  checks: VerificationCheck[];
  onClose: () => void;
}

export function AuthorityChecksView({ checks, onClose }: AuthorityChecksViewProps) {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-sky-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Authority Checks</h3>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          Close details
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {checks.map((check) => (
          <div
            key={check.id}
            className={`flex items-center gap-3 rounded-lg border p-3 text-xs font-semibold ${
              check.passed
                ? "border-emerald-200/80 bg-emerald-50/40 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300"
                : "border-red-200/80 bg-red-50/40 text-red-900 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300"
            }`}
          >
            {check.passed ? (
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
                <Check className="h-3.5 w-3.5" />
              </span>
            ) : (
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-600 text-white">
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <span>{check.text}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[12px] leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border border-slate-200/70 dark:border-slate-800">
        <strong>Important distinction:</strong> LOADPASS verifies the authority records behind this load. It does not certify the broker&apos;s general licensing, reputation or trustworthiness.
      </div>
    </div>
  );
}
