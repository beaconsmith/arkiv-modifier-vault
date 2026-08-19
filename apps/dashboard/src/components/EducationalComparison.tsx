"use client";

import { ShieldAlert, ShieldCheck } from "lucide-react";

export function EducationalComparison() {
  return (
    <section className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
          Key Industry Distinction
        </span>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Broker Identity vs. Load Authority
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Why traditional broker directory checks are not enough to prevent double-brokering.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Existing broker checks */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Standard Industry Tools
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Existing broker checks</h3>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-white p-4 border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Primary Question Asked</span>
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
              &ldquo;Is this a legitimate broker?&rdquo;
            </p>
          </div>

          <ul className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span>FMCSA registration, MC number, and bond status</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span>Company identity, phone numbers, and domain names</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span>Credit scores, payment history, and user reviews</span>
            </li>
          </ul>
          <p className="mt-4 text-xs font-medium text-slate-500 italic">
            Limitations: A legitimate broker is not automatically authorised to offer every load.
          </p>
        </div>

        {/* Right Column: LOADPASS */}
        <div className="rounded-xl border-2 border-sky-600 bg-sky-50/40 p-6 dark:border-sky-500 dark:bg-sky-950/20 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 rounded-bl-xl bg-sky-600 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            LOADPASS Innovation
          </div>

          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-sky-600 text-white shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                Live Authority Verification
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">LOADPASS</h3>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-white p-4 border border-sky-200 dark:border-sky-900 dark:bg-slate-900">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wide">Primary Question Answered</span>
            <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
              &ldquo;Is this broker authorised to offer <span className="bg-sky-200 dark:bg-sky-900 px-1.5 py-0.5 rounded text-sky-950 dark:text-sky-100 font-extrabold underline decoration-sky-600 underline-offset-4">THIS load</span>?&rdquo;
            </p>
          </div>

          <ul className="mt-4 space-y-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
              <span>Load-specific mandate directly from the original shipper</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
              <span>Verifiable delegation permission granted to downstream brokers</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
              <span>Real-time expiration window and active state validation</span>
            </li>
          </ul>
          <p className="mt-4 text-xs font-bold text-sky-800 dark:text-sky-300">
            LOADPASS verifies the exact chain of authority behind the specific load before booking.
          </p>
        </div>
      </div>
    </section>
  );
}
