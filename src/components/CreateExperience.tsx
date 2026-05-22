"use client";

import { AlertCircle, ArrowRight, CheckCircle2, Loader2, LockKeyhole, PlusCircle, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  createMemoryNode,
  createModifierStack,
  getConnectedWallet,
  watchWalletConnection,
  connectWallet,
  watchDiscoveredProviders,
  getLegacyProvider,
  getActiveProviderName,
  type WalletConnection,
  type DiscoveredProvider,
} from "@/lib/arkiv";
import { DEMO_MEMORY_CONTENT, DEMO_MODIFIERS, PROJECT_ATTRIBUTE } from "@/lib/constants";
import { parseModifierInput, type Visibility } from "@/lib/schema";
import { truncateMiddle } from "@/lib/format";

import { EntityMeta } from "./EntityMeta";
import { MemoryGraph } from "./MemoryGraph";
import { ModifierToken } from "./ModifierToken";

type CreateResult = {
  memoryKey?: string;
  modifierStackKey?: string;
  memoryTx?: string;
  modifierStackTx?: string;
  memoryRecord?: Awaited<ReturnType<typeof createMemoryNode>>["record"];
  stackRecord?: Awaited<ReturnType<typeof createModifierStack>>["record"];
};

export function CreateExperience() {
  const [title, setTitle] = useState("Codon Optimization Modifier Cache");
  const [content, setContent] = useState(DEMO_MEMORY_CONTENT);
  const [domain, setDomain] = useState("biology/codon-design");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [modifiers, setModifiers] = useState(DEMO_MODIFIERS.join(", "));
  const [interpreter, setInterpreter] = useState("codon-interpreter:v1");
  const [context, setContext] = useState("mRNA sequence translation efficiency mapping");
  const [authority, setAuthority] = useState("wallet-owner");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResult | null>(null);
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [providers, setProviders] = useState<DiscoveredProvider[]>([]);

  const parsedModifiers = parseModifierInput(modifiers);

  useEffect(() => {
    let isMounted = true;

    void getConnectedWallet()
      .then((existingConnection) => {
        if (isMounted) {
          setWallet(existingConnection);
        }
      })
      .catch(() => {
        if (isMounted) {
          setWallet(null);
        }
      });

    let unwatch: (() => void) | undefined;

    try {
      unwatch = watchWalletConnection((nextConnection) => {
        if (isMounted) {
          setWallet(nextConnection);
        }
      });
    } catch {
      unwatch = undefined;
    }

    const unwatchProviders = watchDiscoveredProviders((nextProviders) => {
      if (isMounted) {
        setProviders(nextProviders);
      }
    });

    return () => {
      isMounted = false;
      unwatch?.();
      unwatchProviders();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const memoryResult = await createMemoryNode({
        title,
        content,
        domain,
        visibility,
      });

      setResult({
        memoryKey: memoryResult.entityKey,
        memoryTx: memoryResult.txHash,
        memoryRecord: memoryResult.record,
      });

      const stackResult = await createModifierStack({
        memoryKey: memoryResult.entityKey,
        modifiers: parsedModifiers,
        interpreter,
        context,
        authority,
      });

      setResult({
        memoryKey: memoryResult.entityKey,
        modifierStackKey: stackResult.entityKey,
        memoryTx: memoryResult.txHash,
        modifierStackTx: stackResult.txHash,
        memoryRecord: memoryResult.record,
        stackRecord: stackResult.record,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save to Arkiv.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.96fr)_minmax(420px,1.04fr)] lg:px-8">
      <section className="grid content-start gap-6">
        <div>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Create a portable memory and bind it to modifiers.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Every MemoryNode and ModifierStack is written with the project attribute{" "}
            <code className="rounded-md bg-white px-2 py-1 font-mono text-sm text-slate-950 ring-1 ring-slate-200">
              {PROJECT_ATTRIBUTE}
            </code>
            .
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Memory title">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="input"
                required
              />
            </Field>
            <Field label="Domain">
              <input
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                className="input"
                required
              />
            </Field>
          </div>

          <Field label="Memory content">
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="input min-h-32 resize-y"
              required
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
            <Field label="Visibility">
              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value as Visibility)}
                className="input"
              >
                <option value="private">private</option>
                <option value="shared">shared</option>
                <option value="public">public</option>
              </select>
            </Field>
            <Field label="Modifiers">
              <textarea
                value={modifiers}
                onChange={(event) => setModifiers(event.target.value)}
                className="input min-h-24 resize-y font-mono text-sm"
                required
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            {parsedModifiers.map((modifier, index) => (
              <ModifierToken key={modifier} modifier={modifier} index={index} />
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Interpreter">
              <input
                value={interpreter}
                onChange={(event) => setInterpreter(event.target.value)}
                className="input"
              />
            </Field>
            <Field label="Authority">
              <input
                value={authority}
                onChange={(event) => setAuthority(event.target.value)}
                className="input"
              />
            </Field>
            <Field label="Context">
              <input
                value={context}
                onChange={(event) => setContext(event.target.value)}
                className="input"
              />
            </Field>
          </div>

          {wallet ? (
            <div className="flex items-center gap-3 rounded-lg border border-[#80ed99] bg-[#f0fff4] p-3 text-sm text-[#006d5b]">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#38b000]" />
              <div>
                <p className="font-black">Wallet connected ({getActiveProviderName() || "Injected"}): {truncateMiddle(wallet.address, 10, 8)}</p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">Ready to sign sequential MemoryNode and ModifierStack transactions on Braga.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-lg border border-[#ffd166] bg-[#fffdf0] p-4 text-sm text-[#8a6d00]">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 shrink-0 text-[#f5a623] animate-pulse" />
                <div>
                  <p className="font-black">Wallet not connected</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Select a wallet to connect and interact on Braga testnet:</p>
                </div>
              </div>
              
              {(() => {
                const legacy = getLegacyProvider();
                const allProviders = [...providers];
                if (legacy && !providers.some((p) => p.rdns === legacy.rdns || p.name === legacy.name)) {
                  allProviders.push(legacy);
                }

                if (allProviders.length === 0) {
                  return (
                    <div className="flex gap-2 rounded border border-[#ff6b6b] bg-[#fff0f0] p-2.5 text-xs font-semibold text-[#9d0208]">
                      <AlertCircle className="h-4 w-4 shrink-0 text-[#ff6b6b]" />
                      <span>No browser wallet extensions detected. Please install MetaMask, Rabby, Coinbase Wallet, or Phantom.</span>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {allProviders.map((prov) => (
                      <button
                        key={prov.uuid}
                        type="button"
                        onClick={async () => {
                          setError(null);
                          try {
                            await connectWallet(prov.uuid);
                          } catch (err) {
                            setError(err instanceof Error ? err.message : "Connection failed");
                          }
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={prov.icon} alt="" className="h-4 w-4 rounded object-contain" />
                        <span>Connect {prov.name}</span>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {error ? (
            <div className="rounded-lg border border-[#ff6b6b] bg-[#fff0f0] p-3 text-sm font-semibold text-[#9d0208]">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <PlusCircle className="h-4 w-4" aria-hidden />
            )}
            {isSubmitting ? "Writing to Arkiv" : "Create MemoryNode + ModifierStack"}
          </button>
        </form>
      </section>

      <section className="grid content-start gap-5">
        <div className="rounded-xl border border-slate-200 bg-[#fbffef] p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-[#436000] ring-1 ring-[#b8f35a]">
              <LockKeyhole className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-xl font-black tracking-tight">Arkiv entity trace</h2>
              <p className="text-sm leading-6 text-slate-600">
                Keys, owner, creator, and transaction hashes appear as soon as the wallet confirms.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-4">
            {result?.memoryRecord ? (
              <div>
                <h3 className="mb-2 text-sm font-black uppercase tracking-[0.14em] text-slate-500">
                  MemoryNode
                </h3>
                <EntityMeta record={result.memoryRecord} txHash={result.memoryTx} />
              </div>
            ) : null}
            {result?.stackRecord ? (
              <div>
                <h3 className="mb-2 text-sm font-black uppercase tracking-[0.14em] text-slate-500">
                  ModifierStack
                </h3>
                <EntityMeta record={result.stackRecord} txHash={result.modifierStackTx} />
              </div>
            ) : null}
            {result?.modifierStackKey ? (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#06d6a0] bg-[#ebfff8] p-3 text-sm font-bold text-[#006d5b]">
                <CheckCircle2 className="h-5 w-5" aria-hidden />
                Saved graph to Arkiv Braga.
                <Link
                  href={`/memory/${encodeURIComponent(result.memoryKey ?? "")}`}
                  className="inline-flex items-center gap-1 text-slate-950 underline decoration-[#06d6a0] decoration-2 underline-offset-4"
                >
                  Open graph <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <MemoryGraph
          memory={result?.memoryRecord}
          stacks={result?.stackRecord ? [result.stackRecord] : []}
        />
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}
