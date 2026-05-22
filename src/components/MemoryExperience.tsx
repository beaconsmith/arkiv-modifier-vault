"use client";

import { 
  Loader2, 
  RefreshCw, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Wallet
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { 
  readMemoryGraph, 
  createAgentReflection, 
  createModifierStack,
  arkivExplorerEntityUrl,
  getConnectedWallet,
  watchWalletConnection,
  connectWallet,
  watchDiscoveredProviders,
  getLegacyProvider,
  type WalletConnection,
  type DiscoveredProvider
} from "@/lib/arkiv";
import { DEMO_MODIFIERS } from "@/lib/constants";
import { truncateMiddle } from "@/lib/format";
import type {
  AgentReflectionPayload,
  ArkivEntityRecord,
  MemoryNodePayload,
  ModifierStackPayload,
} from "@/lib/schema";

import { EntityMeta } from "./EntityMeta";
import { MemoryGraph } from "./MemoryGraph";
import { ModifierToken } from "./ModifierToken";

type GraphState = {
  memory: ArkivEntityRecord<MemoryNodePayload>;
  stacks: ArkivEntityRecord<ModifierStackPayload>[];
  reflections: ArkivEntityRecord<AgentReflectionPayload>[];
};

const REFLECTION_PERSONAS = [
  {
    id: "custom",
    name: "✍️ Custom Reflection",
    text: "",
  },
  {
    id: "biology",
    name: "🧬 Bioinformatics Assistant",
    text: "Synthesized codon bias map. Determined that routing translation efficiency increases protein expression yield by 24%.",
  },
  {
    id: "optimizer",
    name: "⚡ Graph Optimizer Node",
    text: "ModifierStack pipeline successfully evaluated. Sequence latency optimized. Context flow resolved across all modifier levels.",
  },
  {
    id: "security",
    name: "🛡️ Integrity Validator",
    text: "Attribute keys containing colons or hyphens sanitized. Nonce collision hazards bypassed. Graph transaction records have been audited and verified on Braga.",
  },
];

export function MemoryExperience() {
  const params = useParams<{ key: string }>();
  const memoryKey = useMemo(() => decodeURIComponent(params.key ?? ""), [params.key]);
  const [graph, setGraph] = useState<GraphState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Agent reflection form states
  const [reflectionText, setReflectionText] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [selectedPersona, setSelectedPersona] = useState("custom");
  const [selectedStackKey, setSelectedStackKey] = useState("");
  const [isSubmittingReflection, setIsSubmittingReflection] = useState(false);
  const [isCreatingStack, setIsCreatingStack] = useState(false);
  const [reflectionError, setReflectionError] = useState<string | null>(null);
  const [stackError, setStackError] = useState<string | null>(null);
  const [reflectionSuccess, setReflectionSuccess] = useState(false);
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [providers, setProviders] = useState<DiscoveredProvider[]>([]);
  const effectiveSelectedStackKey = selectedStackKey || graph?.stacks[0]?.key || "";

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

  const loadGraph = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const nextGraph = await readMemoryGraph(memoryKey);
      setGraph(nextGraph);
      return nextGraph;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not read memory graph.");
      setGraph(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [memoryKey]);

  useEffect(() => {
    let isActive = true;

    async function loadInitialGraph() {
      setIsLoading(true);
      setError(null);

      try {
        const nextGraph = await readMemoryGraph(memoryKey);

        if (isActive) {
          setGraph(nextGraph);
        }
      } catch (caught) {
        if (isActive) {
          setError(caught instanceof Error ? caught.message : "Could not read memory graph.");
          setGraph(null);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialGraph();

    return () => {
      isActive = false;
    };
  }, [memoryKey]);

  const handlePersonaChange = (personaId: string) => {
    setSelectedPersona(personaId);
    const persona = REFLECTION_PERSONAS.find((p) => p.id === personaId);
    if (persona && personaId !== "custom") {
      setReflectionText(persona.text);
    } else if (personaId === "custom") {
      setReflectionText("");
    }
  };

  const availableProviders = () => {
    const legacy = getLegacyProvider();
    const allProviders = [...providers];
    if (legacy && !providers.some((p) => p.rdns === legacy.rdns || p.name === legacy.name)) {
      allProviders.push(legacy);
    }
    return allProviders;
  };

  const handleConnectProvider = async (providerUuid: string) => {
    setReflectionError(null);
    setStackError(null);

    try {
      await connectWallet(providerUuid);
    } catch (err) {
      setReflectionError(err instanceof Error ? err.message : "Connection failed");
      setStackError(err instanceof Error ? err.message : "Connection failed");
    }
  };

  const handleCreateDefaultStack = async () => {
    if (!graph) return;

    setIsCreatingStack(true);
    setStackError(null);
    setReflectionSuccess(false);

    try {
      const result = await createModifierStack({
        memoryKey,
        modifiers: DEMO_MODIFIERS,
        interpreter: "agent-reflection-layer:v1",
        context: "Interpretation layer for user-owned agent reflections",
        authority: "wallet-owner",
      });

      setSelectedStackKey(result.entityKey);
      const createdStack = result.record;
      setGraph((current) => {
        if (!current || current.stacks.some((stack) => stack.key === createdStack.key)) {
          return current;
        }

        return {
          ...current,
          stacks: [createdStack, ...current.stacks],
        };
      });

      const refreshedGraph = await loadGraph();
      if (!refreshedGraph?.stacks.some((stack) => stack.key === createdStack.key)) {
        setGraph((current) => {
          if (!current || current.stacks.some((stack) => stack.key === createdStack.key)) {
            return current;
          }

          return {
            ...current,
            stacks: [createdStack, ...current.stacks],
          };
        });
      }
    } catch (err) {
      setStackError(err instanceof Error ? err.message : "Could not create a modifier stack.");
    } finally {
      setIsCreatingStack(false);
    }
  };

  const handleCreateReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    const stackKey = selectedStackKey || graph?.stacks[0]?.key;
    if (!graph || !stackKey) return;
    setIsSubmittingReflection(true);
    setReflectionError(null);
    setReflectionSuccess(false);

    try {
      await createAgentReflection({
        memoryKey,
        modifierStackKey: stackKey,
        reflection: reflectionText.trim(),
        model: selectedModel,
      });

      setReflectionSuccess(true);
      setReflectionText("");
      setSelectedPersona("custom");
      await loadGraph();
    } catch (err) {
      setReflectionError(err instanceof Error ? err.message : "Failed to write agent reflection to Arkiv Braga.");
    } finally {
      setIsSubmittingReflection(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Memory graph
          </h1>
          <p className="mt-3 break-all font-mono text-sm font-bold text-slate-500">{memoryKey}</p>
        </div>
        <button
          type="button"
          onClick={() => void loadGraph()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-black text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-950"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden />
          )}
          Refresh graph
        </button>
      </section>

      {error ? (
        <div className="rounded-lg border border-[#ff6b6b] bg-[#fff0f0] p-4 text-sm font-semibold text-[#9d0208]">
          {error}
        </div>
      ) : null}

      {isLoading && !graph ? (
        <div className="grid min-h-[420px] place-items-center rounded-xl border border-slate-200 bg-white">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#4361ee]" aria-hidden />
            <p className="mt-3 text-sm font-bold text-slate-500">Reading Arkiv graph</p>
          </div>
        </div>
      ) : null}

      {graph ? (
        <>
          <MemoryGraph
            memory={graph.memory}
            stacks={graph.stacks}
            reflections={graph.reflections}
          />

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
            <div className="grid gap-5">
              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-2xl font-black tracking-tight">{graph.memory.payload.title}</h2>
                <p className="mt-3 text-lg leading-8 text-slate-700">{graph.memory.payload.content}</p>
                <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                  <MiniMeta label="Domain" value={graph.memory.payload.domain} />
                  <MiniMeta label="Visibility" value={graph.memory.payload.visibility} />
                  <MiniMeta label="Created" value={graph.memory.payload.createdAt} />
                </dl>
              </article>

              {/* Agent Reflection Sandbox Panel */}
              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="h-5 w-5 text-[#4361ee]" aria-hidden />
                  <h2 className="text-xl font-black text-slate-950">Agent reflections</h2>
                </div>

                {graph.stacks.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-[#f8fbff] p-5">
                    <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-white text-[#4361ee] ring-1 ring-slate-200">
                      <Sparkles className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="grid gap-4">
                      <p className="font-black text-slate-950">This memory is waiting for an interpretation layer.</p>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                        Create a linked modifier stack, then write the first agent reflection against it.
                      </p>
                      {stackError ? (
                        <div className="rounded-lg border border-[#ff6b6b] bg-[#fff0f0] p-3 text-sm font-semibold text-[#9d0208]">
                          {stackError}
                        </div>
                      ) : null}
                      {wallet ? (
                        <button
                          type="button"
                          onClick={() => void handleCreateDefaultStack()}
                          disabled={isCreatingStack}
                          className="inline-flex h-11 w-fit items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isCreatingStack ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          ) : (
                            <Sparkles className="h-4 w-4" aria-hidden />
                          )}
                          {isCreatingStack ? "Creating modifier stack" : "Create interpretation layer"}
                        </button>
                      ) : (
                        <div className="grid gap-3">
                          <p className="text-sm font-semibold text-slate-600">
                            Connect a wallet to add the modifier stack for this memory.
                          </p>
                          {availableProviders().length === 0 ? (
                            <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                              No browser wallet detected.
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {availableProviders().map((prov) => (
                                <button
                                  key={prov.uuid}
                                  type="button"
                                  onClick={() => void handleConnectProvider(prov.uuid)}
                                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={prov.icon} alt="" className="h-4 w-4 rounded object-contain" />
                                  <span>Connect {prov.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleCreateReflection} className="grid gap-4">
                    {reflectionSuccess && (
                      <div className="flex items-center gap-3 rounded-lg border border-[#06d6a0] bg-[#ebfff8] p-3 text-sm font-bold text-[#006d5b]">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#06d6a0]" />
                        Reflection successfully recorded on Braga testnet!
                      </div>
                    )}

                    {reflectionError && (
                      <div className="flex items-center gap-3 rounded-lg border border-[#ff6b6b] bg-[#fff0f0] p-3 text-sm font-semibold text-[#9d0208]">
                        <AlertCircle className="h-5 w-5 shrink-0 text-[#ff6b6b]" />
                        <span className="break-words">{reflectionError}</span>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-bold text-slate-700">
                        <span>Target ModifierStack</span>
                        <select
                          value={effectiveSelectedStackKey}
                          onChange={(e) => setSelectedStackKey(e.target.value)}
                          className="input"
                          required
                        >
                          {graph.stacks.map((stack, idx) => (
                            <option key={stack.key} value={stack.key}>
                              Stack {idx + 1} ({truncateMiddle(stack.key, 8, 6)})
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="grid gap-2 text-sm font-bold text-slate-700">
                        <span>Agent Persona Preset</span>
                        <select
                          value={selectedPersona}
                          onChange={(e) => handlePersonaChange(e.target.value)}
                          className="input"
                        >
                          {REFLECTION_PERSONAS.map((persona) => (
                            <option key={persona.id} value={persona.id}>
                              {persona.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-bold text-slate-700">
                        <span>AI Model Tier</span>
                        <select
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="input"
                          required
                        >
                          <option value="gemini-2.5-flash">gemini-2.5-flash (Fast & Efficient)</option>
                          <option value="gemini-2.5-pro">gemini-2.5-pro (High Reasoning)</option>
                          <option value="claude-3-5-sonnet">claude-3-5-sonnet (Agentic Focus)</option>
                          <option value="gpt-4o">gpt-4o (Omni Reasoning)</option>
                        </select>
                      </label>
                    </div>

                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      <span>Reflection Text</span>
                      <textarea
                        value={reflectionText}
                        onChange={(e) => {
                          setReflectionText(e.target.value);
                          setSelectedPersona("custom");
                        }}
                        className="input min-h-24 font-mono text-sm"
                        placeholder="Type your reflection or choose a preset above..."
                        required
                      />
                    </label>

                    {wallet ? (
                      <button
                        type="submit"
                        disabled={isSubmittingReflection || !reflectionText.trim()}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmittingReflection ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <Send className="h-4 w-4" aria-hidden />
                        )}
                        {isSubmittingReflection ? "Signing Reflection Transaction..." : "Write Agent Reflection"}
                      </button>
                    ) : (
                      <div className="flex flex-col gap-3 rounded-lg border border-[#ffd166] bg-[#fffdf0] p-4 text-sm text-[#8a6d00] mt-2">
                        <div className="flex items-center gap-3">
                          <Wallet className="h-5 w-5 shrink-0 text-[#f5a623] animate-pulse" />
                          <div>
                            <p className="font-bold">Wallet connection required</p>
                            <p className="text-xs text-slate-500 mt-0.5">Please connect your wallet to record reflections on Braga:</p>
                          </div>
                        </div>
                        {(() => {
                          const providersForReflection = availableProviders();

                          if (providersForReflection.length === 0) {
                            return (
                              <div className="flex gap-2 rounded border border-[#ff6b6b] bg-[#fff0f0] p-2.5 text-xs font-semibold text-[#9d0208]">
                                <AlertCircle className="h-4 w-4 shrink-0 text-[#ff6b6b]" />
                                <span>No browser wallet extensions detected. Please install MetaMask, Rabby, Coinbase Wallet, or Phantom.</span>
                              </div>
                            );
                          }

                          return (
                            <div className="flex flex-wrap gap-2 mt-1">
                              {providersForReflection.map((prov) => (
                                <button
                                  key={prov.uuid}
                                  type="button"
                                  onClick={() => void handleConnectProvider(prov.uuid)}
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
                  </form>
                )}
              </article>
            </div>

            <aside className="grid gap-4 content-start">
              {graph.stacks.map((stack, index) => (
                <div key={stack.key} className="rounded-xl border border-slate-200 bg-[#fbffef] p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-slate-500">
                    ModifierStack {index + 1}
                  </h3>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {stack.payload.modifiers.map((item, itemIndex) => (
                      <ModifierToken key={item} modifier={item} index={itemIndex} />
                    ))}
                  </div>
                  <p className="mb-4 text-sm leading-6 text-slate-600">{stack.payload.context}</p>
                  <EntityMeta record={stack} />
                </div>
              ))}
            </aside>

            {/* Agent Reflections History */}
            <article className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2 shadow-sm">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#4361ee]" aria-hidden />
                Agent Reflections History ({graph.reflections.length})
              </h2>
              {graph.reflections.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500 italic">No agent reflections written yet. Run the Sandbox form above to write the first reflection.</p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {graph.reflections.map((reflection) => (
                    <div key={reflection.key} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-bl">
                        {reflection.payload.model}
                      </div>
                      <p className="text-sm italic text-slate-700 mt-2">
                        &ldquo;{reflection.payload.reflection}&rdquo;
                      </p>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Created: {new Date(reflection.payload.createdAt).toLocaleDateString()}</span>
                        <a 
                          href={arkivExplorerEntityUrl(reflection.key)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[10px] hover:text-[#4361ee] underline"
                        >
                          Trace {truncateMiddle(reflection.key, 6, 4)}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      ) : null}
    </div>
  );
}

function MiniMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-[#f8fbff] p-3">
      <dt className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</dt>
      <dd className="mt-1 break-words text-sm font-bold text-slate-800">{value}</dd>
    </div>
  );
}
