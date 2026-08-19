"use client";

import { useState } from "react";
import { X, ShieldCheck, Sparkles, PlusCircle } from "lucide-react";
import type { LoadDetails } from "@/lib/loadpassData";

interface IssueMandateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssueMandate: (newLoad: LoadDetails) => void;
}

export function IssueMandateModal({
  isOpen,
  onClose,
  onIssueMandate,
}: IssueMandateModalProps) {
  const [loadId, setLoadId] = useState(`LP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [shipper, setShipper] = useState("Cargill Food Solutions");
  const [broker, setBroker] = useState("North American Logistics");
  const [origin, setOrigin] = useState("Memphis, TN");
  const [destination, setDestination] = useState("Atlanta, GA");
  const [validHours, setValidHours] = useState(12);
  const [allowDelegation, setAllowDelegation] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date();
    const expiry = new Date(now.getTime() + validHours * 60 * 60 * 1000);
    const validUntilFormatted = `${expiry.getUTCHours().toString().padStart(2, '0')}:${expiry.getUTCMinutes().toString().padStart(2, '0')} UTC`;

    const customLoad: LoadDetails = {
      id: loadId.toUpperCase(),
      offeredBy: broker,
      shipper: shipper,
      status: "VERIFIED",
      statePill: "LIVE MANDATE",
      headline: "✓ AUTHORITY VERIFIED",
      supportingText: `${broker} has a live shipper mandate from ${shipper} to tender this load.`,
      validUntil: validUntilFormatted,
      route: { origin, destination },
      pickup: "Today · 15:00 EST",
      equipment: "53' Dry Van",
      checks: [
        { title: "Shipper Mandate", subtitle: `${shipper} issued LOAD_MANDATE`, status: "pass" },
        { title: "Broker Authority", subtitle: `${broker} is target of mandate`, status: "pass" },
        { title: "Delegation Permission", subtitle: allowDelegation ? "Delegation explicitly allowed" : "Direct tender only", status: "pass" },
        { title: "Validity Window", subtitle: `Active until ${validUntilFormatted}`, status: "pass" },
        { title: "Arkiv State Anchor", subtitle: "Braga Block #14,892,102 verified", status: "pass" },
      ],
      chain: [
        {
          id: "m-custom",
          role: "SHIPPER",
          name: shipper,
          sublabel: "Issued parent mandate",
          creatorId: "0x8f2...a19e",
          connector: {
            type: "LOAD_MANDATE",
            ref: `${loadId}-M01`,
            details: [
              { label: "Broker Target", value: broker },
              { label: "Delegation", value: allowDelegation ? "Allowed" : "Prohibited" },
              { label: "Valid Until", value: validUntilFormatted },
            ],
          },
        },
        {
          id: "b-custom",
          role: "OFFERING BROKER",
          name: broker,
          sublabel: "Authorised tender partner",
          creatorId: "0x3c1...9b21",
        },
      ],
      timeline: [
        { time: "NOW", event: "Custom Mandate Published to Arkiv", status: "active" },
        { time: validUntilFormatted, event: "Mandate Expiration Window", status: "future" },
      ],
      nextSteps: {
        title: "Verified Tender Guidance",
        items: [
          "Load authority is live and verified directly back to the shipper.",
          "You may accept this rate confirmation with cryptographic proof of authority.",
        ],
      },
    };

    onIssueMandate(customLoad);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Issue Load Mandate</h3>
              <p className="text-xs font-semibold text-slate-500">Create a dynamic Arkiv mandate record for testing</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
          <div>
            <label className="block uppercase text-slate-500 mb-1">Load Reference ID</label>
            <input
              type="text"
              value={loadId}
              onChange={(e) => setLoadId(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 font-mono font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block uppercase text-slate-500 mb-1">Shipper Name</label>
              <input
                type="text"
                value={shipper}
                onChange={(e) => setShipper(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block uppercase text-slate-500 mb-1">Authorised Broker</label>
              <input
                type="text"
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block uppercase text-slate-500 mb-1">Origin City</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block uppercase text-slate-500 mb-1">Destination City</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block uppercase text-slate-500 mb-1">Validity Duration</label>
              <select
                value={validHours}
                onChange={(e) => setValidHours(Number(e.target.value))}
                className="w-full h-10 rounded-lg border border-slate-300 bg-slate-50 px-3 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value={4}>4 Hours</option>
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowDelegation}
                  onChange={(e) => setAllowDelegation(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="font-bold text-slate-700 dark:text-slate-200">Allow Broker Delegation</span>
              </label>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-slate-300 bg-white font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-sky-600 text-white font-bold hover:bg-sky-700 shadow-md flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Issue Arkiv Mandate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
