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
import {
  DEMO_AUTHORITY,
  DEMO_CONTEXT,
  DEMO_INTERPRETER,
  DEMO_MEMORY_CONTENT,
  DEMO_MEMORY_DOMAIN,
  DEMO_MEMORY_TITLE,
  DEMO_MODIFIERS,
  PROJECT_ATTRIBUTE,
} from "@/lib/constants";
import { encryptString } from "@/lib/crypto";
import { parseModifierInput, type ContentMode, type Visibility } from "@/lib/schema";
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
  const [title, setTitle] = useState(DEMO_MEMORY_TITLE);
  const [content, setContent] = useState(DEMO_MEMORY_CONTENT);
  const [domain, setDomain] = useState(DEMO_MEMORY_DOMAIN);
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [contentMode, setContentMode] = useState<ContentMode>("encrypted");
  const [passphrase, setPassphrase] = useState("");
  const [modifiers, setModifiers] = useState(DEMO_MODIFIERS.join(", "));
  const [interpreter, setInterpreter] = useState(DEMO_INTERPRETER);
  const [context, setContext] = useState(DEMO_CONTEXT);
  const [authority, setAuthority] = useState(DEMO_AUTHORITY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateResult | null>(null);
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [providers, setProviders] = useState<DiscoveredProvider[]>([]);

  const parsedModifiers = parseModifierInput(modifiers);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const c = searchParams.get("content");
      const t = searchParams.get("title");
      const d = searchParams.get("domain") || searchParams.get("category");
      setTimeout(() => {
        if (c) setContent(c);
        if (t) setTitle(t);
        if (d) setDomain(d);
      }, 0);
    }
  }, []);

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
      if (contentMode === "encrypted" && !passphrase.trim()) {
        throw new Error("Enter a passphrase before creating an encrypted memory.");
      }

      const encryptedContent =
        contentMode === "encrypted" ? await encryptString(content, passphrase) : undefined;

      const memoryResult = await createMemoryNode({
        title,
        content,
        domain,
        visibility,
        contentMode,
        encryptedContent,
        contentPreview:
          contentMode === "plaintext"
            ? content
            : `${content.slice(0, 96)}${content.length > 96 ? "..." : ""}`,
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
          <h1 className="max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            Save a memory your AI will carry with it
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
            Every memory and modifier you save is linked to your project&apos;s unique identifier, like a special tag:{" "}
            <code className="rounded-md bg-white dark:bg-slate-950 px-2 py-1 font-mono text-sm text-slate-950 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-slate-800">
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
            <Field label="What's on your mind?">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="input"
                required
              />
            </Field>
            <Field label="Category">
              <input
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                placeholder="What kind of memory is this? (e.g. personal thoughts, work notes)"
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

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="How Private Should It Be?">
              <select
                value={contentMode}
                onChange={(event) => {
                  const nextMode = event.target.value as ContentMode;
                  setContentMode(nextMode);
                  if (nextMode === "encrypted") {
                    setVisibility("private");
                  }
                }}
                className="input"
              >
                <option value="plaintext">Public (readable by anyone)</option>
                <option value="metadata-only">Private content, public labels</option>
                <option value="encrypted">Encrypted (only you can read)</option>
              </select>
            </Field>
            <Field label="Who Can See This?">
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
            {contentMode === "encrypted" ? (
              <div className="grid gap-2">
                <Field label="Your Secret Key">
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(event) => setPassphrase(event.target.value)}
                    className="input"
                    autoComplete="new-password"
                    required
                  />
                </Field>
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                  🔒 Your content is encrypted right here in your browser before it ever leaves your computer. This means even Arkiv can&apos;t read your private thoughts!
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-[#f8fbff] dark:bg-slate-900/50 p-3 text-xs font-semibold leading-5 text-slate-600 dark:text-slate-400">
                {contentMode === "metadata-only"
                  ? "Only a preview of your memory's details and search tags will be visible."
                  : "The full content of your memory will be publicly visible on Arkiv."}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-[0.8fr_1.2fr]">
            <Field label="How should your AI interpret this?">
              <textarea
                value={modifiers}
                onChange={(event) => setModifiers(event.target.value)}
                placeholder="Add modifiers here, like 'be encouraging', 'summarize', 'explain simply'. Use commas to separate them."
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
            <Field label="Interpreter (which AI model?)">
              <input
                value={interpreter}
                onChange={(event) => setInterpreter(event.target.value)}
                className="input"
              />
            </Field>
            <Field label="Authority (source of info)">
              <input
                value={authority}
                onChange={(event) => setAuthority(event.target.value)}
                className="input"
              />
            </Field>
            <Field label="Context (background info)">
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
                <p className="font-black">✓ Wallet connected ({getActiveProviderName() || "Injected"}): {truncateMiddle(wallet.address, 10, 8)}</p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">You&apos;re all set! Your wallet will sign two small transactions to save your memory and its instructions.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-lg border border-[#ffd166] bg-[#fffdf0] p-4 text-sm text-[#8a6d00]">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 shrink-0 text-[#f5a623] animate-pulse" />
                <div>
                  <p className="font-black">No wallet connected yet</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">Connect your digital wallet to save this memory. Pick one below:</p>
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
            {isSubmitting ? "Saving your memory…" : "Save to Arkiv Blockchain"}
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
              <h2 className="text-xl font-black tracking-tight">Your memory&apos;s record</h2>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                Once your wallet confirms, your memory&apos;s unique ID and transaction receipt appear here.
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
