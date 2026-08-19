"use client";

import { useState } from "react";
import { Database, Lock, ChevronDown, ChevronUp, FileCode, CheckCircle2 } from "lucide-react";
import { ARKIV_DATA } from "@/lib/loadpassData";

export function ArkivExplainer() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-sky-400 dark:bg-slate-800 dark:text-sky-300 shadow-xs">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Data Architecture & Transparency
            </span>
            <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              What LOADPASS puts on Arkiv
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white">
          <span>{isOpen ? "Collapse architectural breakdown" : "Expand architectural breakdown"}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-6 space-y-6">
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            LOADPASS records minimal, privacy-preserving cryptographic authority records on Arkiv Braga to establish an immutable, verifiable lineage without leaking commercial freight secrets.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ARKIV_DATA.records.map((rec) => (
              <div
                key={rec.name}
                className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-950 px-2 py-0.5 rounded">
                      {rec.name}
                    </span>
                    <FileCode className="h-4 w-4 text-slate-400" />
                  </div>
                  <span className="mt-2 block text-[11px] font-bold text-slate-500">{rec.creator}</span>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payload Attributes</span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {rec.fields.map((f) => (
                      <span
                        key={f}
                        className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stays Off Arkiv Note */}
          <div className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-white dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Lock className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Stays off Arkiv (Completely Private)
              </h4>
            </div>
            <p className="mt-2 text-xs text-slate-300">
              Private freight details, contracts, payments, tracking and booking remain off Arkiv.
            </p>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {ARKIV_DATA.staysOffArkiv.map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-slate-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
