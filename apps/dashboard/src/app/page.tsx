"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Building2,
  Calendar,
  Database,
  FileSearch,
  PlusCircle,
  Copy,
  Check,
  Ban,
} from "lucide-react";

import { DEMO_LOADS, type LoadDetails } from "@/lib/loadpassData";
import { LoadPassHeader } from "@/components/LoadPassHeader";
import { AuthorityChainView } from "@/components/AuthorityChainView";
import { AuthorityChecksView } from "@/components/AuthorityChecksView";
import { EducationalComparison } from "@/components/EducationalComparison";
import { ArkivExplainer } from "@/components/ArkivExplainer";
import { ArkivInspectorModal } from "@/components/ArkivInspectorModal";
import { AuthorityDrawer } from "@/components/AuthorityDrawer";
import { HowItWorksModal } from "@/components/HowItWorksModal";
import { IssueMandateModal } from "@/components/IssueMandateModal";
import { LoadboardWidgetMockup } from "@/components/LoadboardWidgetMockup";

function LoadPassContent() {
  const searchParams = useSearchParams();
  const [inputRef, setInputRef] = useState("");
  const [activeLoad, setActiveLoad] = useState<LoadDetails | null>(null);
  const [unknownRef, setUnknownRef] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState<string>("");
  const [customLoads, setCustomLoads] = useState<Record<string, LoadDetails>>({});

  // Modals & Drawers
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isIssueMandateOpen, setIsIssueMandateOpen] = useState(false);

  // Expansions, Simulations & Share Status
  const [showChecks, setShowChecks] = useState(false);
  const [isSimulatedExpired, setIsSimulatedExpired] = useState(false);
  const [isSimulatedRevoked, setIsSimulatedRevoked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleVerify = async (reference: string) => {
    const cleanRef = reference.trim().toUpperCase();
    if (!cleanRef) return;

    setIsSearching(true);
    setActiveLoad(null);
    setUnknownRef(null);
    setShowChecks(false);
    setIsSimulatedExpired(false);
    setIsSimulatedRevoked(false);

    // Realistic Loading Stepper (~1.2s)
    setSearchStep("Finding live mandate…");
    await new Promise((resolve) => setTimeout(resolve, 400));

    setSearchStep("Checking delegation…");
    await new Promise((resolve) => setTimeout(resolve, 400));

    setSearchStep("Verifying authority chain…");
    await new Promise((resolve) => setTimeout(resolve, 400));

    setIsSearching(false);
    setSearchStep("");

    const allLoads = { ...DEMO_LOADS, ...customLoads };
    if (allLoads[cleanRef]) {
      setActiveLoad(allLoads[cleanRef]);
    } else {
      setUnknownRef(cleanRef);
    }
  };

  // Read URL query parameter on initial load
  useEffect(() => {
    const loadFromUrl = searchParams?.get("load");
    if (loadFromUrl) {
      const timer = setTimeout(() => {
        handleVerify(loadFromUrl);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleReset = () => {
    setActiveLoad(null);
    setUnknownRef(null);
    setInputRef("");
    setIsSearching(false);
    setShowChecks(false);
    setIsSimulatedExpired(false);
    setIsSimulatedRevoked(false);
    setIsInspectorOpen(false);
    setIsDrawerOpen(false);
    setIsIssueMandateOpen(false);
  };

  const handleIssueMandate = (newLoad: LoadDetails) => {
    setCustomLoads((prev) => ({ ...prev, [newLoad.id]: newLoad }));
    setActiveLoad(newLoad);
  };

  const handleCopyShareLink = () => {
    if (!activeLoad) return;
    const shareUrl = `${window.location.origin}/?load=${activeLoad.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      
      {/* Top Header Navigation Bar */}
      <LoadPassHeader
        onSearch={handleVerify}
        onReset={handleReset}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenArkivInspector={() => setIsInspectorOpen(true)}
        onOpenIssueMandate={() => setIsIssueMandateOpen(true)}
        currentSearchId={activeLoad?.id || unknownRef || undefined}
        isSearching={isSearching}
      />

      {/* Modals & Drawers */}
      {activeLoad && (
        <>
          <ArkivInspectorModal
            load={activeLoad}
            isOpen={isInspectorOpen}
            onClose={() => setIsInspectorOpen(false)}
            onSimulateExpiry={() => setIsSimulatedExpired(true)}
            onSimulateRevocation={() => setIsSimulatedRevoked(true)}
            onResetSimulations={() => {
              setIsSimulatedExpired(false);
              setIsSimulatedRevoked(false);
            }}
            isSimulatedExpired={isSimulatedExpired}
            isSimulatedRevoked={isSimulatedRevoked}
          />

          <AuthorityDrawer
            load={activeLoad}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            isSimulatedExpired={isSimulatedExpired}
          />
        </>
      )}

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      <IssueMandateModal
        isOpen={isIssueMandateOpen}
        onClose={() => setIsIssueMandateOpen(false)}
        onIssueMandate={handleIssueMandate}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* STATE A — SEARCH HERO (No load selected)                                  */}
        {/* ========================================================================= */}
        {!activeLoad && !unknownRef && !isSearching && (
          <section className="mx-auto max-w-4xl pt-6 pb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-xs font-bold text-sky-800 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300 shadow-2xs">
              <ShieldCheck className="h-4 w-4" />
              <span>Live Freight Mandate Verification</span>
            </div>

            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Check the authority behind a load before you book it.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
              Verify whether the broker offering a load has a live mandate and the right delegation to tender it to you.
            </p>

            {/* Search Input Card */}
            <div className="mt-8 mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerify(inputRef || "LP-4821");
                }}
                className="space-y-4"
              >
                <div className="text-left">
                  <label htmlFor="heroLoadInput" className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Load reference
                  </label>
                  <div className="mt-1.5 relative flex items-center">
                    <Search className="absolute left-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                    <input
                      id="heroLoadInput"
                      type="text"
                      value={inputRef}
                      onChange={(e) => setInputRef(e.target.value)}
                      placeholder="Enter load reference (e.g. LP-4821, LP-7734, LP-5910)"
                      className="w-full h-12 rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 h-12 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-700 active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verify load</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsIssueMandateOpen(true)}
                    className="h-12 px-4 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 font-bold text-xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition flex items-center gap-1.5"
                    title="Issue dynamic load mandate"
                  >
                    <PlusCircle className="h-4 w-4 text-sky-600" />
                    <span>Create load</span>
                  </button>
                </div>
              </form>

              {/* 3 Interactive Demo Shortcuts */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Demo scenarios:</span>
                
                <button
                  type="button"
                  onClick={() => handleVerify("LP-4821")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 transition"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Try verified</span>
                  <span className="font-mono text-[11px] opacity-80">(LP-4821)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVerify("LP-7734")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 transition"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  <span>Try missing</span>
                  <span className="font-mono text-[11px] opacity-80">(LP-7734)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVerify("LP-5910")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 transition"
                >
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Try expired</span>
                  <span className="font-mono text-[11px] opacity-80">(LP-5910)</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STATE B — CHECKING / LOADING STATE                                        */}
        {/* ========================================================================= */}
        {isSearching && (
          <section className="mx-auto max-w-xl py-16 text-center">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-6">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Checking authority…</h2>
                <p className="mt-1 text-sm font-semibold text-sky-600 dark:text-sky-400 animate-pulse">
                  {searchStep}
                </p>
              </div>

              <div className="space-y-2 text-xs font-bold text-slate-500 max-w-xs mx-auto text-left">
                <div className={`flex items-center gap-2 ${searchStep.includes("mandate") ? "text-sky-600" : ""}`}>
                  <span className="h-2 w-2 rounded-full bg-sky-600" />
                  <span>1. Finding live shipper mandate</span>
                </div>
                <div className={`flex items-center gap-2 ${searchStep.includes("delegation") ? "text-sky-600" : ""}`}>
                  <span className="h-2 w-2 rounded-full bg-sky-600" />
                  <span>2. Checking broker delegation permissions</span>
                </div>
                <div className={`flex items-center gap-2 ${searchStep.includes("chain") ? "text-sky-600" : ""}`}>
                  <span className="h-2 w-2 rounded-full bg-sky-600" />
                  <span>3. Verifying authority lineage integrity</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STATE F — NOT FOUND STATE                                                 */}
        {/* ========================================================================= */}
        {unknownRef && !isSearching && (
          <section className="mx-auto max-w-xl py-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <FileSearch className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">Load not found</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                LOADPASS could not find an authority record for reference <code className="font-bold text-slate-900 dark:text-white font-mono">{unknownRef}</code>.
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                This does not mean the load or broker is invalid. It means no matching shared authority record was found.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Check reference</span>
                </button>
                <button
                  onClick={() => setIsIssueMandateOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-300 bg-sky-50 px-5 py-2.5 text-xs font-bold text-sky-800 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300 transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create custom load</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STATES C, D, E — ADAPTIVE SINGLE-VIEWPORT LOAD RESULT WORKSPACE           */}
        {/* ========================================================================= */}
        {activeLoad && !isSearching && (
          <section className="space-y-6">
            
            {/* Top Compressed Header Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-lg bg-slate-900 px-3 py-1 font-mono text-sm font-black text-white dark:bg-slate-800">
                    Load {activeLoad.id}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span>Offered by:</span>
                    <strong className="text-slate-900 dark:text-white font-black">{activeLoad.offeredBy}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-sky-600" />
                    <span>Route:</span>
                    <span className="text-slate-900 dark:text-white">{activeLoad.route.origin} → {activeLoad.route.destination}</span>
                  </div>
                  <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4 dark:border-slate-800">
                    <Calendar className="h-4 w-4 text-sky-600" />
                    <span>Pickup:</span>
                    <span className="text-slate-900 dark:text-white">{activeLoad.pickup}</span>
                  </div>
                </div>
              </div>

              {/* Toolbar Actions */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <p className="text-[11px] font-semibold text-slate-400">
                  A legitimate broker is not automatically authorised to offer every load.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyShareLink}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                    title="Copy direct link for hackathon judges"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedLink ? "Link copied!" : "Share link"}</span>
                  </button>

                  <button
                    onClick={() => setIsInspectorOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300 transition"
                  >
                    <Database className="h-3.5 w-3.5" />
                    <span>Inspect Arkiv entities</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Check another load</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Side-by-Side Verification Result & Authority Flow Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT COLUMN: Main Verification Status Panel (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Result Card */}
                {(activeLoad.status === "VERIFIED" && !isSimulatedExpired && !isSimulatedRevoked) ? (
                  /* VERIFIED RESULT PANEL */
                  <div className="rounded-2xl border-2 border-emerald-500 bg-white p-6 md:p-8 shadow-xl dark:border-emerald-600 dark:bg-slate-900 relative overflow-hidden">
                    <div className="flex items-center justify-between gap-3 border-b border-emerald-100 pb-4 dark:border-slate-800">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        {activeLoad.statePill}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        Valid until {activeLoad.validUntil}
                      </span>
                    </div>

                    <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-emerald-700 dark:text-emerald-400 flex items-center gap-3">
                      <CheckCircle2 className="h-9 w-9 shrink-0 text-emerald-600" />
                      <span>{activeLoad.headline}</span>
                    </h2>

                    <p className="mt-2 text-base font-bold text-slate-800 dark:text-slate-100">
                      {activeLoad.supportingText}
                    </p>

                    {/* Primary Actions */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="h-11 px-5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>View authority chain</span>
                      </button>

                      <button
                        onClick={() => setIsInspectorOpen(true)}
                        className="h-11 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition flex items-center justify-center gap-1.5"
                      >
                        <Database className="h-4 w-4 text-sky-600" />
                        <span>Inspect Arkiv entities</span>
                      </button>
                    </div>

                    {/* Accordion: Why this was verified */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setShowChecks(!showChecks)}
                        className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 focus:outline-none"
                      >
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Why this was verified
                        </span>
                        {showChecks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>

                      {showChecks && (
                        <AuthorityChecksView checks={activeLoad.checks} onClose={() => setShowChecks(false)} />
                      )}
                    </div>
                  </div>
                ) : isSimulatedRevoked ? (
                  /* REVOKED RESULT PANEL */
                  <div className="rounded-2xl border-2 border-red-500 bg-white p-6 md:p-8 shadow-xl dark:border-red-600 dark:bg-slate-900 relative overflow-hidden">
                    <div className="flex items-center justify-between gap-3 border-b border-red-100 pb-4 dark:border-slate-800">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
                        REVOKED BY SHIPPER
                      </span>
                      <span className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1">
                        <Ban className="h-3.5 w-3.5" />
                        Revocation receipt published
                      </span>
                    </div>

                    <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-red-700 dark:text-red-400 flex items-center gap-3">
                      <Ban className="h-9 w-9 shrink-0 text-red-600" />
                      <span>○ MANDATE REVOKED</span>
                    </h2>

                    <p className="mt-2 text-base font-bold text-slate-800 dark:text-slate-100">
                      {activeLoad.shipper} published an explicit revocation receipt on Arkiv.
                    </p>

                    <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-900 dark:bg-red-950 dark:text-red-200 border border-red-200 dark:border-red-900">
                      <strong>Revocation rule output:</strong> All downstream broker delegation standing is terminated immediately across the freight network.
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => setIsInspectorOpen(true)}
                        className="h-11 px-5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition shadow-md flex items-center justify-center gap-2"
                      >
                        <Database className="h-4 w-4" />
                        <span>Inspect revocation receipt</span>
                      </button>
                    </div>
                  </div>
                ) : (activeLoad.status === "EXPIRED" || isSimulatedExpired) ? (
                  /* EXPIRED RESULT PANEL */
                  <div className="rounded-2xl border-2 border-amber-500 bg-white p-6 md:p-8 shadow-xl dark:border-amber-600 dark:bg-slate-900 relative overflow-hidden">
                    <div className="flex items-center justify-between gap-3 border-b border-amber-100 pb-4 dark:border-slate-800">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
                        EXPIRED
                      </span>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {isSimulatedExpired ? "Expired during simulation" : activeLoad.lastValid}
                      </span>
                    </div>

                    <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-amber-700 dark:text-amber-400 flex items-center gap-3">
                      <Clock className="h-9 w-9 shrink-0 text-amber-600" />
                      <span>○ AUTHORITY EXPIRED</span>
                    </h2>

                    <p className="mt-2 text-base font-bold text-slate-800 dark:text-slate-100">
                      {activeLoad.offeredBy} had authority to tender this load, but that authority is no longer live.
                    </p>

                    {isSimulatedExpired && (
                      <div className="mt-3 rounded-lg bg-amber-100 p-3 text-xs font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                        <strong>Simulated rule output:</strong> The delegation still exists as a record, but it can no longer provide live authority because its parent mandate has expired.
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="h-11 px-5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition shadow-md flex items-center justify-center gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        <span>View authority chain</span>
                      </button>

                      <button
                        onClick={() => setIsInspectorOpen(true)}
                        className="h-11 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition flex items-center justify-center gap-1.5"
                      >
                        <Database className="h-4 w-4 text-sky-600" />
                        <span>Inspect Arkiv entities</span>
                      </button>
                    </div>

                    {/* Next Steps: What should I do? */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-black uppercase text-amber-800 dark:text-amber-400 tracking-wider">
                        {activeLoad.nextSteps.title}
                      </h4>
                      <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {activeLoad.nextSteps.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  /* NOT VERIFIED / FAILED RESULT PANEL */
                  <div className="rounded-2xl border-2 border-amber-500 bg-white p-6 md:p-8 shadow-xl dark:border-amber-600 dark:bg-slate-900 relative overflow-hidden">
                    <div className="flex items-center justify-between gap-3 border-b border-amber-100 pb-4 dark:border-slate-800">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
                        UNVERIFIED
                      </span>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {activeLoad.lastValid}
                      </span>
                    </div>

                    <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-amber-700 dark:text-amber-400 flex items-center gap-3">
                      <AlertTriangle className="h-9 w-9 shrink-0 text-amber-600" />
                      <span>{activeLoad.headline}</span>
                    </h2>

                    <p className="mt-2 text-base font-bold text-slate-800 dark:text-slate-100">
                      {activeLoad.supportingText}
                    </p>
                    <p className="mt-1 text-xs font-bold text-red-600 dark:text-red-400">
                      Reason: {activeLoad.reason}
                    </p>

                    {/* Actions */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="h-11 px-5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition shadow-md flex items-center justify-center gap-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <span>View missing link</span>
                      </button>

                      <button
                        onClick={() => setIsInspectorOpen(true)}
                        className="h-11 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition flex items-center justify-center gap-1.5"
                      >
                        <Database className="h-4 w-4 text-sky-600" />
                        <span>Inspect Arkiv entities</span>
                      </button>
                    </div>

                    {/* Next Steps: Before accepting this load */}
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-black uppercase text-amber-800 dark:text-amber-400 tracking-wider">
                        {activeLoad.nextSteps.title}
                      </h4>
                      <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {activeLoad.nextSteps.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Accordion: Why this was not verified */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setShowChecks(!showChecks)}
                        className="w-full flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-400 focus:outline-none"
                      >
                        <span>Why this was not verified</span>
                        {showChecks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>

                      {showChecks && (
                        <div className="mt-3 space-y-2">
                          <AuthorityChecksView checks={activeLoad.checks} onClose={() => setShowChecks(false)} />
                          <p className="text-[11px] font-bold text-slate-500 italic">
                            LOADPASS stops here. It does not infer authority that is not present in the shared state.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: Authority Chain View (5 Cols) */}
              <div className="lg:col-span-5">
                <AuthorityChainView load={activeLoad} onClose={() => {}} />
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* CARRIER BROWSER EXTENSION MOCKUP & EDUCATIONAL SECTIONS                    */}
        {/* ========================================================================= */}
        <LoadboardWidgetMockup onSelectLoad={handleVerify} />
        <EducationalComparison />
        <ArkivExplainer />

      </main>

      {/* Slogan Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 space-y-3">
          <div className="flex items-center justify-center gap-2 font-black text-slate-900 dark:text-white text-lg">
            <ShieldCheck className="h-6 w-6 text-sky-600" />
            <span>LOADPASS</span>
          </div>

          <p className="text-sm font-black text-slate-800 dark:text-slate-200">
            A legitimate broker is not automatically authorised to offer every load.
          </p>

          <p className="text-xs font-bold text-sky-700 dark:text-sky-400">
            LOADPASS — Verify the right to tender.
          </p>

          <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
            Freight marketplaces already tell carriers what loads are available. LOADPASS makes the authority to offer one queryable too.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen grid place-items-center bg-slate-50 dark:bg-slate-950">
        <RefreshCw className="h-8 w-8 animate-spin text-sky-600" />
      </div>
    }>
      <LoadPassContent />
    </Suspense>
  );
}
