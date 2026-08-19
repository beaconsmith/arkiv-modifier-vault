"use client";

import { useState } from "react";
import { Database, Lock, X, Play, RefreshCw, ExternalLink, Ban } from "lucide-react";
import { ARKIV_DATA, type LoadDetails } from "@/lib/loadpassData";

interface ArkivInspectorModalProps {
  load: LoadDetails;
  isOpen: boolean;
  onClose: () => void;
  onSimulateExpiry?: () => void;
  onSimulateRevocation?: () => void;
  onResetSimulations?: () => void;
  isSimulatedExpired?: boolean;
  isSimulatedRevoked?: boolean;
}

export function ArkivInspectorModal({
  load,
  isOpen,
  onClose,
  onSimulateExpiry,
  onSimulateRevocation,
  onResetSimulations,
  isSimulatedExpired,
  isSimulatedRevoked,
}: ArkivInspectorModalProps) {
  const [activeTab, setActiveTab] = useState<"entities" | "privacy" | "whyArkiv">("entities");

  if (!isOpen) return null;

  const data = ARKIV_DATA[load.id as keyof typeof ARKIV_DATA] || ARKIV_DATA["LP-4821"];

  // Handle active simulation overrides in JSON payload preview
  const displayMandate = {
    ...data.mandate,
    txHash: "0x8f6516a059ca714788b37cb2195a81d2097e07f5630aa3b75f27ad960c5219d1",
    payload: {
      ...data.mandate.payload,
      status: isSimulatedRevoked
        ? "REVOKED"
        : isSimulatedExpired
        ? "EXPIRED"
        : data.mandate.payload.status,
      validUntil: isSimulatedExpired ? "2026-08-19T10:00:00Z (EXPIRED)" : data.mandate.payload.validUntil,
    },
  };

  const displayDelegation = data.delegation
    ? {
        ...data.delegation,
        txHash: "0xa507cd0ee278baa2bc97358ad8dc7cbeeea90ad743811c114482ea98929a7a92",
        payload: {
          ...data.delegation.payload,
          status: (isSimulatedExpired || isSimulatedRevoked)
            ? "PARENT_INVALIDATED"
            : data.delegation.payload.status,
        },
      }
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-sky-400 dark:bg-slate-800 dark:text-sky-300 shadow-md">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Arkiv Entity Inspector</h3>
                <span className="rounded bg-sky-100 px-2 py-0.5 font-mono text-[11px] font-bold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  {load.id}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Inspect raw cryptographic payloads stored on Arkiv Braga Testnet
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
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 dark:border-slate-800 dark:bg-slate-950/50">
          <button
            onClick={() => setActiveTab("entities")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === "entities"
                ? "border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Raw Entity Payload Records ({data.delegation ? "2 Entities" : "1 Entity"})
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === "privacy"
                ? "border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Privacy &amp; Stays Off Arkiv
          </button>

          <button
            onClick={() => setActiveTab("whyArkiv")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === "whyArkiv"
                ? "border-sky-600 text-sky-600 dark:border-sky-400 dark:text-sky-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Why Shared State?
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: RAW ENTITIES */}
          {activeTab === "entities" && (
            <div className="space-y-6">
              
              {/* Interactive State Simulation Bar */}
              <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-4 dark:border-sky-900/60 dark:bg-sky-950/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-sky-800 dark:text-sky-300">
                      Ideathon Interactive Simulator
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      Simulate live state transitions to see how Arkiv invalidates downstream authority.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {onSimulateExpiry && (
                      <button
                        onClick={onSimulateExpiry}
                        disabled={isSimulatedExpired}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-2xs ${
                          isSimulatedExpired
                            ? "bg-amber-200 text-amber-900 cursor-not-allowed"
                            : "bg-amber-600 text-white hover:bg-amber-700"
                        }`}
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Simulate expiry</span>
                      </button>
                    )}

                    {onSimulateRevocation && (
                      <button
                        onClick={onSimulateRevocation}
                        disabled={isSimulatedRevoked}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition shadow-2xs ${
                          isSimulatedRevoked
                            ? "bg-red-200 text-red-900 cursor-not-allowed"
                            : "bg-red-600 text-white hover:bg-red-700"
                        }`}
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>Simulate revocation</span>
                      </button>
                    )}

                    {(isSimulatedExpired || isSimulatedRevoked) && onResetSimulations && (
                      <button
                        onClick={onResetSimulations}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {(isSimulatedExpired || isSimulatedRevoked) && (
                  <div className="mt-3 rounded-lg bg-white p-3 text-xs border border-amber-200 dark:border-amber-900 dark:bg-slate-900">
                    <span className="font-bold text-amber-800 dark:text-amber-300">
                      Rule Evaluated: {isSimulatedRevoked ? "Shipper Explicit Revocation" : "Parent Mandate Expiry Window"}
                    </span>
                    <p className="mt-0.5 text-slate-600 dark:text-slate-400">
                      {isSimulatedRevoked
                        ? "Revocation receipt published. The parent mandate is marked REVOKED, breaking all downstream delegation standing."
                        : "Parent mandate validUntil reached. Downstream delegation remains on-chain as history, but loses live authority."}
                    </p>
                  </div>
                )}
              </div>

              {/* Entity 1: LOAD_MANDATE */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-sky-600 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
                      1. LOAD_MANDATE
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Issued by Shipper ({load.shipper})
                    </span>
                  </div>
                  
                  <a
                    href="https://explorer.braga.hoodi.arkiv.network"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-mono font-bold text-sky-600 hover:underline flex items-center gap-1"
                  >
                    <span>Braga TX: {displayMandate.txHash.slice(0, 14)}...</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Entity Key</span>
                    <code className="block font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 break-all">
                      {displayMandate.entityKey}
                    </code>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Creator Org Wallet</span>
                    <code className="block font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                      {displayMandate.creator}
                    </code>
                  </div>
                </div>

                {/* Raw JSON Preview */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Payload JSON</span>
                  <pre className="mt-1 max-h-48 overflow-x-auto rounded-lg bg-slate-900 p-3 text-[11px] font-mono text-emerald-400 leading-tight shadow-inner">
                    {JSON.stringify(displayMandate.payload, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Entity 2: DELEGATION (If exists) */}
              {displayDelegation && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-sky-600 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
                        2. DELEGATION
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Issued by Authorised Broker ({load.chain[1]?.name})
                      </span>
                    </div>

                    <a
                      href="https://explorer.braga.hoodi.arkiv.network"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-mono font-bold text-sky-600 hover:underline flex items-center gap-1"
                    >
                      <span>Braga TX: {displayDelegation.txHash.slice(0, 14)}...</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Entity Key</span>
                      <code className="block font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 break-all">
                        {displayDelegation.entityKey}
                      </code>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Parent Mandate Ref</span>
                      <code className="block font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {displayDelegation.parentRef}
                      </code>
                    </div>
                  </div>

                  {/* Raw JSON Preview */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Payload JSON</span>
                    <pre className="mt-1 max-h-48 overflow-x-auto rounded-lg bg-slate-900 p-3 text-[11px] font-mono text-emerald-400 leading-tight shadow-inner">
                      {JSON.stringify(displayDelegation.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRIVACY & STAYS OFF ARKIV */}
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-900 p-5 text-white dark:bg-slate-950">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Lock className="h-5 w-5 text-emerald-400" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                    Stays Off Arkiv (Completely Private)
                  </h4>
                </div>
                <p className="mt-2 text-xs text-slate-300">
                  LOADPASS is designed specifically so commercial freight rate data and private shipper secrets never touch the shared state.
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-slate-800/80 p-3 border border-slate-700">
                    <span className="font-bold text-white block mb-0.5">Rate Confirmations &amp; Financial Pricing</span>
                    <span className="text-slate-400 text-[11px]">Dollar rates per mile remain strictly between contracting parties.</span>
                  </div>
                  <div className="rounded-lg bg-slate-800/80 p-3 border border-slate-700">
                    <span className="font-bold text-white block mb-0.5">Shipment Addresses &amp; Facility Names</span>
                    <span className="text-slate-400 text-[11px]">Street pickup locations stay private in the broker&apos;s TMS.</span>
                  </div>
                  <div className="rounded-lg bg-slate-800/80 p-3 border border-slate-700">
                    <span className="font-bold text-white block mb-0.5">Driver &amp; Truck PII</span>
                    <span className="text-slate-400 text-[11px]">Driver names, phone numbers, and CDL numbers remain off-chain.</span>
                  </div>
                  <div className="rounded-lg bg-slate-800/80 p-3 border border-slate-700">
                    <span className="font-bold text-white block mb-0.5">Live GPS &amp; Telematics</span>
                    <span className="text-slate-400 text-[11px]">Real-time tracking stays in Samsara / ELD integrations.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WHY SHARED STATE */}
          {activeTab === "whyArkiv" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">Why Shared State for Freight Authority?</h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Traditional broker directories (FMCSA, carrier onboarding portals) store identity in siloed databases. But authority is dynamic and spans multiple independent market participants.
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900/60 dark:bg-red-950/20">
                    <span className="font-bold text-red-900 dark:text-red-300 block mb-1">Centralised Database Limitations</span>
                    <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                      <li>• Closed silos lock carriers into proprietary loadboards.</li>
                      <li>• Bad actors modify internal logs after double-brokering.</li>
                      <li>• Independent carriers cannot verify authority across platforms.</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">Arkiv Shared State Solution</span>
                    <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                      <li>• Open, queryable authority layer accessible to any carrier.</li>
                      <li>• Immutable cryptographic lineage directly from the shipper.</li>
                      <li>• Automatic expiry without reliance on central platform admins.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition"
          >
            Close inspector
          </button>
        </div>
      </div>
    </div>
  );
}
