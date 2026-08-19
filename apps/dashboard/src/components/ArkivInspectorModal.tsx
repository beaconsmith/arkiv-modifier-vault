"use client";

import { useState } from "react";
import { Database, Lock, X, Play, RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";
import { ARKIV_DATA, type LoadDetails } from "@/lib/loadpassData";

interface ArkivInspectorModalProps {
  load: LoadDetails;
  isOpen: boolean;
  onClose: () => void;
  onSimulateExpiry?: () => void;
  onResetSimulatedExpiry?: () => void;
  isSimulatedExpired?: boolean;
}

export function ArkivInspectorModal({
  load,
  isOpen,
  onClose,
  onSimulateExpiry,
  onResetSimulatedExpiry,
  isSimulatedExpired,
}: ArkivInspectorModalProps) {
  const [activeTab, setActiveTab] = useState<"entities" | "privacy" | "why_arkiv">("entities");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-sky-400 dark:bg-slate-800 dark:text-sky-300">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Arkiv Entity Inspector</h3>
                <span className="rounded bg-sky-100 px-2 py-0.5 font-mono text-[11px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  Judges & Engineering View
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Inspect raw Arkiv Braga testnet records for load reference <strong className="text-slate-800 dark:text-slate-200 font-mono">{load.id}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 text-xs font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab("entities")}
            className={`border-b-2 py-3 px-4 transition ${
              activeTab === "entities"
                ? "border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400 font-extrabold"
                : "border-transparent hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            1. Arkiv Entities & Simulated Expiry
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`border-b-2 py-3 px-4 transition ${
              activeTab === "privacy"
                ? "border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400 font-extrabold"
                : "border-transparent hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            2. Privacy & Stays Off Arkiv
          </button>
          <button
            onClick={() => setActiveTab("why_arkiv")}
            className={`border-b-2 py-3 px-4 transition ${
              activeTab === "why_arkiv"
                ? "border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400 font-extrabold"
                : "border-transparent hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            3. Why Shared State?
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "entities" && (
            <div className="space-y-6">
              {/* Simulation Banner */}
              {load.status === "VERIFIED" && onSimulateExpiry && (
                <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-900 dark:bg-sky-950/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-sky-600" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-sky-900 dark:text-sky-300">
                          Interactive Rule Demo: Parent Mandate Expiry Simulation
                        </h4>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                        Demonstrate the rule: <em>A child authority cannot outlive the authority it came from.</em>
                      </p>
                    </div>

                    {isSimulatedExpired ? (
                      <button
                        onClick={onResetSimulatedExpiry}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 shrink-0"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Reset demo</span>
                      </button>
                    ) : (
                      <button
                        onClick={onSimulateExpiry}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-sky-700 shadow-sm shrink-0 active:scale-95 transition"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Simulate mandate expiry</span>
                      </button>
                    )}
                  </div>

                  {isSimulatedExpired && (
                    <div className="mt-3 pt-3 border-t border-sky-200/80 dark:border-sky-900 text-xs font-semibold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 p-3 rounded-lg flex items-start gap-2">
                      <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Parent Mandate Expired!</strong> The delegation record still exists on chain, but it can no longer provide live authority because its parent mandate reached validUntil cutoff.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Entity 1: LOAD_MANDATE */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-sky-600 px-2 py-0.5 font-mono text-xs font-bold text-white">
                      LOAD_MANDATE
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Original Shipper Grant
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${isSimulatedExpired || load.status === "EXPIRED" ? "text-amber-600" : "text-emerald-600"}`}>
                    Status: {isSimulatedExpired ? "EXPIRED (Simulated)" : load.arkivEntities.mandate.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">JSON Payload</span>
                    <pre className="mt-1 rounded-lg border border-slate-200 bg-slate-900 p-3 font-mono text-[11px] text-sky-300 overflow-x-auto">
{`{
  "type": "${load.arkivEntities.mandate.type}",
  "loadRef": "${load.arkivEntities.mandate.loadRef}",
  "brokerRef": "${load.arkivEntities.mandate.brokerRef}",
  "scope": "${load.arkivEntities.mandate.scope}",
  "delegationAllowed": ${load.arkivEntities.mandate.delegationAllowed},
  "validFrom": "${load.arkivEntities.mandate.validFrom}",
  "validUntil": "${isSimulatedExpired ? "1787140000 (EXPIRED NOW)" : load.arkivEntities.mandate.validUntil}",
  "status": "${isSimulatedExpired ? "expired" : load.arkivEntities.mandate.status}"
}`}
                    </pre>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Creator & Owner</span>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {load.arkivEntities.mandate.creator}
                      </p>
                      <code className="text-[10px] font-mono text-slate-500">
                        {load.arkivEntities.mandate.creatorAddress}
                      </code>
                    </div>

                    <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Creator Rule</span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        The broker benefiting from a mandate does not create the original mandate. The party granting the authority does.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Entity 2: DELEGATION (if exists) */}
              {load.arkivEntities.delegation && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-sky-800 px-2 py-0.5 font-mono text-xs font-bold text-white">
                        DELEGATION
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Broker-to-Broker Handoff
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${isSimulatedExpired ? "text-amber-600" : "text-emerald-600"}`}>
                      Status: {isSimulatedExpired ? "PARENT AUTHORITY EXPIRED" : load.arkivEntities.delegation.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">JSON Payload</span>
                      <pre className="mt-1 rounded-lg border border-slate-200 bg-slate-900 p-3 font-mono text-[11px] text-sky-300 overflow-x-auto">
{`{
  "type": "${load.arkivEntities.delegation.type}",
  "loadRef": "${load.arkivEntities.delegation.loadRef}",
  "parentMandateRef": "${load.arkivEntities.delegation.parentMandateRef}",
  "delegateRef": "${load.arkivEntities.delegation.delegateRef}",
  "scope": "${load.arkivEntities.delegation.scope}",
  "validUntil": "${load.arkivEntities.delegation.validUntil}",
  "status": "${isSimulatedExpired ? "parent_expired" : load.arkivEntities.delegation.status}"
}`}
                      </pre>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="rounded-lg bg-white p-2.5 border border-slate-200/80 dark:border-slate-800 dark:bg-slate-900">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Delegated By</span>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {load.arkivEntities.delegation.creator}
                        </p>
                        <code className="text-[10px] font-mono text-slate-500">
                          Parent Mandate: {load.arkivEntities.delegation.parent}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Entity 3: MANDATE_RECEIPT */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
                  <span className="rounded bg-slate-700 px-2 py-0.5 font-mono text-xs font-bold text-white">
                    MANDATE_RECEIPT
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Audit Evidence Record
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                  {load.arkivEntities.receipt.explanation}
                </p>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-slate-900 p-6 text-white dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Lock className="h-5 w-5 text-emerald-400" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                    Stays Off Arkiv (Completely Confidential)
                  </h4>
                </div>
                <p className="mt-3 text-xs text-slate-300">
                  Arkiv holds only the minimum shared authority state needed for independent verification. Commercial freight secrets never touch the public chain.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {ARKIV_DATA.staysOffArkiv.map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-lg bg-slate-800/80 p-2.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "why_arkiv" && (
            <div className="space-y-6">
              <div className="mb-4">
                <h4 className="text-base font-black text-slate-900 dark:text-white">Why Shared State?</h4>
                <p className="text-xs text-slate-500">
                  Why traditional databases fail to solve multi-party broker verification.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ARKIV_DATA.whyArkiv.map((item) => (
                  <div
                    key={item.model}
                    className={`rounded-xl border p-5 flex flex-col justify-between ${
                      item.highlight
                        ? "border-2 border-sky-600 bg-sky-50/50 dark:border-sky-500 dark:bg-sky-950/30"
                        : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">Architecture</span>
                      <h5 className="mt-1 text-base font-black text-slate-900 dark:text-white">{item.model}</h5>
                      <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">{item.subtitle}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">State Behavior</span>
                      <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">{item.problem}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-slate-900 p-4 text-center text-xs font-bold text-white">
                &ldquo;If everyone already used and trusted one freight platform, a normal database would be enough.&rdquo;
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-950 text-xs">
          <span className="text-slate-500">LOADPASS Arkiv Braga Inspector · v1.0</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Close inspector
          </button>
        </div>
      </div>
    </div>
  );
}
