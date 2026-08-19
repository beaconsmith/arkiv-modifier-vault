"use client";

import { useState } from "react";
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
  FileSearch,
} from "lucide-react";

import { DEMO_LOADS, type LoadDetails } from "@/lib/loadpassData";
import { LoadPassHeader } from "@/components/LoadPassHeader";
import { AuthorityChainView } from "@/components/AuthorityChainView";
import { AuthorityChecksView } from "@/components/AuthorityChecksView";
import { EducationalComparison } from "@/components/EducationalComparison";
import { ArkivExplainer } from "@/components/ArkivExplainer";

export default function Home() {
  const [inputRef, setInputRef] = useState("");
  const [activeLoad, setActiveLoad] = useState<LoadDetails | null>(null);
  const [unknownRef, setUnknownRef] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState<string>("");

  // Expansions
  const [showChain, setShowChain] = useState(false);
  const [showChecks, setShowChecks] = useState(false);

  const handleVerify = async (reference: string) => {
    const cleanRef = reference.trim().toUpperCase();
    if (!cleanRef) return;

    setIsSearching(true);
    setActiveLoad(null);
    setUnknownRef(null);
    setShowChain(false);
    setShowChecks(false);

    // Realistic Loading Sequence (1.5 seconds)
    setSearchStep("Finding live mandate...");
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSearchStep("Checking delegation...");
    await new Promise((resolve) => setTimeout(resolve, 500));

    setSearchStep("Verifying authority chain...");
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSearching(false);
    setSearchStep("");

    if (DEMO_LOADS[cleanRef]) {
      setActiveLoad(DEMO_LOADS[cleanRef]);
    } else {
      setUnknownRef(cleanRef);
    }
  };

  const handleReset = () => {
    setActiveLoad(null);
    setUnknownRef(null);
    setInputRef("");
    setIsSearching(false);
    setShowChain(false);
    setShowChecks(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      {/* Top Navigation Header */}
      <LoadPassHeader
        onSearch={handleVerify}
        onReset={handleReset}
        currentSearchId={activeLoad?.id || unknownRef || undefined}
        isSearching={isSearching}
      />

      {/* Main 1440 x 1024 Desktop Container Workspace */}
      <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* STATE 1: SEARCH / INITIAL HERO VIEW                                      */}
        {/* ========================================================================= */}
        {!activeLoad && !unknownRef && !isSearching && (
          <section className="mx-auto max-w-4xl pt-6 pb-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1 text-xs font-bold text-sky-800 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300 shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Live Freight Mandate Verification</span>
            </div>

            <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Is this broker allowed to offer this load?
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
              LOADPASS checks the live authority chain behind a freight offer before you book it. Protect your carrier fleet from unauthorized double-brokered tenders.
            </p>

            {/* Input Card */}
            <div className="mt-8 mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerify(inputRef || "LP-4821");
                }}
                className="space-y-4"
              >
                <div className="text-left">
                  <label htmlFor="loadRefInput" className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Load reference
                  </label>
                  <div className="mt-1.5 relative flex items-center">
                    <Search className="absolute left-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                    <input
                      id="loadRefInput"
                      type="text"
                      value={inputRef}
                      onChange={(e) => setInputRef(e.target.value)}
                      placeholder="Enter load reference (e.g. LP-4821 or LP-7734)"
                      className="w-full h-12 rounded-xl border border-slate-300 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-sky-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-700 active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verify load</span>
                </button>
              </form>

              {/* Demo Shortcuts */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Quick Demos:</span>
                <button
                  type="button"
                  onClick={() => handleVerify("LP-4821")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Try verified example</span>
                  <span className="font-mono opacity-80">(LP-4821)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleVerify("LP-7734")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/60 transition"
                >
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                  <span>Try failed example</span>
                  <span className="font-mono opacity-80">(LP-7734)</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STATE 2: LOADING STATE                                                    */}
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

              {/* Progress Stepper */}
              <div className="space-y-2 text-xs font-bold text-slate-500 max-w-xs mx-auto">
                <div className={`flex items-center gap-2 ${searchStep.includes("mandate") ? "text-sky-600" : ""}`}>
                  <span className="h-2 w-2 rounded-full bg-sky-600 animate-ping" />
                  <span>1. Finding live shipper mandate</span>
                </div>
                <div className={`flex items-center gap-2 ${searchStep.includes("delegation") ? "text-sky-600" : ""}`}>
                  <span className="h-2 w-2 rounded-full bg-sky-600 animate-ping" />
                  <span>2. Checking broker delegation permissions</span>
                </div>
                <div className={`flex items-center gap-2 ${searchStep.includes("chain") ? "text-sky-600" : ""}`}>
                  <span className="h-2 w-2 rounded-full bg-sky-600 animate-ping" />
                  <span>3. Verifying authority lineage integrity</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STATE 3: UNKNOWN LOAD RESULT                                             */}
        {/* ========================================================================= */}
        {unknownRef && !isSearching && (
          <section className="mx-auto max-w-xl py-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <FileSearch className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">Load not found</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                No active authority record was found for reference <code className="font-bold text-slate-900 dark:text-white">{unknownRef}</code>.
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Check the reference and try again.</p>

              <button
                onClick={handleReset}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white transition"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Check another load</span>
              </button>
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* STATE 4 & 5: VERIFIED OR NOT VERIFIED LOAD RESULT                         */}
        {/* ========================================================================= */}
        {activeLoad && !isSearching && (
          <section className="space-y-6">
            
            {/* Top Bar: Load Summary Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="rounded-lg bg-slate-900 px-3 py-1 font-mono text-sm font-black text-white dark:bg-slate-800">
                    Load {activeLoad.id}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span>Offered by:</span>
                    <strong className="text-slate-900 dark:text-white font-extrabold">{activeLoad.offeredBy}</strong>
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
              <p className="mt-3 text-[11px] font-semibold text-slate-400">
                Protected verification query · Commercial rates & street addresses hidden.
              </p>
            </div>

            {/* Main Verification Result Card (VISUALLY MOST IMPORTANT ELEMENT) */}
            {activeLoad.status === "VERIFIED" ? (
              /* VERIFIED PANEL */
              <div className="rounded-2xl border-2 border-emerald-500 bg-white p-6 md:p-8 shadow-xl dark:border-emerald-600 dark:bg-slate-900 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        {activeLoad.statePill}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        Valid until {activeLoad.validUntil}
                      </span>
                    </div>

                    <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-emerald-700 dark:text-emerald-400 flex items-center gap-3">
                      <CheckCircle2 className="h-9 w-9 shrink-0 text-emerald-600" />
                      <span>{activeLoad.headline}</span>
                    </h2>

                    <p className="mt-2 text-base font-bold text-slate-700 dark:text-slate-200">
                      {activeLoad.supportingText}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                    <button
                      onClick={() => setShowChain(!showChain)}
                      className="h-12 px-6 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span>{showChain ? "Hide authority chain" : "View authority chain"}</span>
                    </button>

                    <button
                      onClick={handleReset}
                      className="h-10 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Check another load</span>
                    </button>
                  </div>
                </div>

                {/* Inline Accordion Trigger: Why was this verified? */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setShowChecks(!showChecks)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 focus:outline-none"
                  >
                    <span>Why was this verified?</span>
                    {showChecks ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                  <span className="text-[11px] font-semibold text-slate-400">
                    6/6 Authority checks passed
                  </span>
                </div>

                {/* Expandable Authority Checks Panel */}
                {showChecks && (
                  <AuthorityChecksView checks={activeLoad.checks} onClose={() => setShowChecks(false)} />
                )}

                {/* Expandable Authority Chain View */}
                {showChain && (
                  <AuthorityChainView load={activeLoad} onClose={() => setShowChain(false)} />
                )}
              </div>
            ) : (
              /* FAILED / UNVERIFIED PANEL */
              <div className="rounded-2xl border-2 border-amber-500 bg-white p-6 md:p-8 shadow-xl dark:border-amber-600 dark:bg-slate-900 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
                        UNVERIFIED
                      </span>
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {activeLoad.lastValid}
                      </span>
                    </div>

                    <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-amber-700 dark:text-amber-400 flex items-center gap-3">
                      <AlertTriangle className="h-9 w-9 shrink-0 text-amber-600" />
                      <span>{activeLoad.headline}</span>
                    </h2>

                    <p className="mt-2 text-base font-bold text-slate-800 dark:text-slate-100">
                      {activeLoad.supportingText}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-red-600 dark:text-red-400">
                      Reason: {activeLoad.reason}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                    <button
                      onClick={() => setShowChain(!showChain)}
                      className="h-12 px-6 rounded-xl bg-amber-600 text-white font-bold text-sm hover:bg-amber-700 active:scale-[0.99] transition shadow-md flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="h-4 w-4" />
                      <span>{showChain ? "Hide authority chain" : "View missing link"}</span>
                    </button>

                    <button
                      onClick={handleReset}
                      className="h-10 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      <span>Check another load</span>
                    </button>
                  </div>
                </div>

                {/* Inline Accordion Trigger */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setShowChecks(!showChecks)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-amber-800 hover:underline dark:text-amber-400 focus:outline-none"
                  >
                    <span>View failed checklist items</span>
                    {showChecks ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                  <span className="text-[11px] font-semibold text-amber-600">
                    Authority chain broken
                  </span>
                </div>

                {/* Expandable Authority Checks Panel */}
                {showChecks && (
                  <AuthorityChecksView checks={activeLoad.checks} onClose={() => setShowChecks(false)} />
                )}

                {/* Expandable Authority Chain View */}
                {showChain && (
                  <AuthorityChainView load={activeLoad} onClose={() => setShowChain(false)} />
                )}
              </div>
            )}
          </section>
        )}

        {/* ========================================================================= */}
        {/* EDUCATIONAL & ARCHITECTURAL SECTIONS (Always accessible)                  */}
        {/* ========================================================================= */}
        <EducationalComparison />
        <ArkivExplainer />

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 font-black text-slate-900 dark:text-white">
            <ShieldCheck className="h-5 w-5 text-sky-600" />
            <span>LOADPASS</span>
          </div>
          <p className="mt-2 text-xs font-medium text-slate-500">
            Freight Marketplace Authority Verification System · Powered by Arkiv Braga Testnet
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Verify the live authority chain behind a load before you book it.
          </p>
        </div>
      </footer>
    </div>
  );
}
