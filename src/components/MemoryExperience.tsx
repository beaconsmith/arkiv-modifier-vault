"use client";

import { 
  Loader2, 
  RefreshCw, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Wallet,
  LockKeyhole,
  WandSparkles,
  Download,
  CornerDownRight,
  Plus
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
import { DEMO_AUTHORITY, DEMO_CONTEXT, DEMO_INTERPRETER, DEMO_MODIFIERS } from "@/lib/constants";
import { decryptString, encryptString } from "@/lib/crypto";
import { truncateMiddle } from "@/lib/format";
import type {
  AgentReflectionPayload,
  ArkivEntityRecord,
  ContentMode,
  MemoryNodePayload,
  ModifierStackPayload,
} from "@/lib/schema";
import { getMemoryContentMode, getMemoryDisplayContent, getReflectionDisplayText } from "@/lib/schema";

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
    id: "cognition",
    name: "Cognition Cartographer",
    text: "This memory describes a recursive decision style: hold contradictions in view, wait for a pattern, then commit only after the pattern stabilizes.",
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

const MODIFIER_DESCRIPTIONS: Record<string, string> = {
  "expand:": "Expands the memory with additional details, reasoning, or context.",
  "route:": "Routes the cognition flow to specific safety, logic, or storage targets.",
  "transform:": "Transforms the style, tone, format, or diction of the memory.",
  "remember": "Reinforces memory retention and persistence in the agent's context."
};

function getModifierDescription(modifier: string): string {
  const clean = modifier.toLowerCase().trim();
  if (clean.startsWith("remember")) {
    return MODIFIER_DESCRIPTIONS["remember"];
  }
  for (const prefix of ["expand:", "route:", "transform:"]) {
    if (clean.startsWith(prefix)) {
      return MODIFIER_DESCRIPTIONS[prefix] + ` (Sub-behavior: ${modifier.slice(prefix.length)})`;
    }
  }
  return "Applies a custom behavioral transformation filter to the prompt.";
}

export function MemoryExperience() {
  const params = useParams<{ key: string }>();
  const memoryKey = useMemo(() => decodeURIComponent(params.key ?? ""), [params.key]);
  const [graph, setGraph] = useState<GraphState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Agent reflection form states
  const [reflectionText, setReflectionText] = useState("");
  const [selectedModel, setSelectedModel] = useState("groq");
  const [selectedPersona, setSelectedPersona] = useState("custom");
  const [selectedStackKey, setSelectedStackKey] = useState("");
  const [replyToKey, setReplyToKey] = useState<string | undefined>();
  const [decryptedMemory, setDecryptedMemory] = useState("");
  const [decryptPassphrase, setDecryptPassphrase] = useState("");
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false);
  const [promptHash, setPromptHash] = useState<string | undefined>();
  const [generatedModel, setGeneratedModel] = useState("groq");
  const [encryptReflection, setEncryptReflection] = useState(false);
  const [reflectionPassphrase, setReflectionPassphrase] = useState("");
  const [isSubmittingReflection, setIsSubmittingReflection] = useState(false);
  const [isCreatingStack, setIsCreatingStack] = useState(false);
  const [reflectionError, setReflectionError] = useState<string | null>(null);
  const [stackError, setStackError] = useState<string | null>(null);
  const [reflectionSuccess, setReflectionSuccess] = useState(false);
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [providers, setProviders] = useState<DiscoveredProvider[]>([]);
  const effectiveSelectedStackKey = selectedStackKey || graph?.stacks[0]?.key || "";
  const selectedStack = graph?.stacks.find((stack) => stack.key === effectiveSelectedStackKey);
  const memoryContentMode = graph ? getMemoryContentMode(graph.memory.payload) : "plaintext";
  const memoryForAi =
    memoryContentMode === "encrypted"
      ? decryptedMemory
      : graph
        ? getMemoryDisplayContent(graph.memory.payload)
        : "";

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
        interpreter: DEMO_INTERPRETER,
        context: DEMO_CONTEXT,
        authority: DEMO_AUTHORITY,
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

  const handleDecryptMemory = async () => {
    if (!graph?.memory.payload.encryptedContent) return;
    setIsDecrypting(true);
    setDecryptError(null);

    try {
      const decrypted = await decryptString(graph.memory.payload.encryptedContent, decryptPassphrase);
      setDecryptedMemory(decrypted);
      setEncryptReflection(true);
      if (!reflectionPassphrase) {
        setReflectionPassphrase(decryptPassphrase);
      }
    } catch (err) {
      setDecryptError(err instanceof Error ? err.message : "Could not decrypt memory.");
      setDecryptedMemory("");
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleGenerateReflection = async () => {
    if (!graph || !selectedStack) return;

    const content = memoryForAi.trim();
    if (!content || memoryContentMode === "metadata-only") {
      setReflectionError("Decrypt or provide plaintext memory content before generating an AgentReflection.");
      return;
    }

    setIsGeneratingReflection(true);
    setReflectionError(null);
    setReflectionSuccess(false);

    try {
      const response = await fetch("/api/reflections/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          memoryContent: content,
          modifiers: selectedStack.payload.modifiers,
          interpreter: selectedStack.payload.interpreter,
          context: selectedStack.payload.context,
          authority: selectedStack.payload.authority,
          priorReflections: graph.reflections
            .map((reflection) => getReflectionDisplayText(reflection.payload))
            .filter((reflection) => !reflection.startsWith("Encrypted"))
            .slice(0, 5),
        }),
      });

      const data = (await response.json()) as {
        reflection?: string;
        promptHash?: string;
        model?: string;
        error?: string;
      };

      if (!response.ok || !data.reflection) {
        throw new Error(data.error ?? "AgentReflection generation failed.");
      }

      setReflectionText(data.reflection);
      setPromptHash(data.promptHash);
      setGeneratedModel(data.model ?? "groq");
      setSelectedModel(data.model ?? "groq");
      setSelectedPersona("custom");
    } catch (err) {
      setReflectionError(err instanceof Error ? err.message : "AgentReflection generation failed.");
    } finally {
      setIsGeneratingReflection(false);
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
      if (encryptReflection && !reflectionPassphrase.trim()) {
        throw new Error("Enter a reflection passphrase before writing an encrypted reflection.");
      }

      const targetStack = graph.stacks.find((stack) => stack.key === stackKey);
      const parentReflection = replyToKey
        ? graph.reflections.find((r) => r.key === replyToKey)
        : graph.reflections[0];
      const encryptedReflection = encryptReflection
        ? await encryptString(reflectionText.trim(), reflectionPassphrase)
        : undefined;
      const reflectionContentMode: ContentMode = encryptReflection ? "encrypted" : "plaintext";

      await createAgentReflection({
        memoryKey,
        modifierStackKey: stackKey,
        reflection: reflectionText.trim(),
        model: generatedModel || selectedModel,
        interpreter: targetStack?.payload.interpreter,
        context: targetStack?.payload.context,
        authority: targetStack?.payload.authority,
        contentMode: reflectionContentMode,
        encryptedReflection,
        previousReflectionKey: parentReflection?.key,
        lineageDepth: (parentReflection?.payload.lineageDepth ?? -1) + 1,
        promptHash,
      });

      setReflectionSuccess(true);
      setReflectionText("");
      setSelectedPersona("custom");
      setPromptHash(undefined);
      setReplyToKey(undefined);
      await loadGraph();
    } catch (err) {
      setReflectionError(err instanceof Error ? err.message : "Failed to write agent reflection to Arkiv Braga.");
    } finally {
      setIsSubmittingReflection(false);
    }
  };

  const handleExportGraph = () => {
    if (!graph) return;
    const dataStr = JSON.stringify(graph, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `memory-graph-${graph.memory.key.slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reflectionsByParent = useMemo(() => {
    const map = new Map<string, ArkivEntityRecord<AgentReflectionPayload>[]>();
    if (!graph) return map;
    for (const ref of graph.reflections) {
      const parent = ref.payload.previousReflectionKey || "root";
      if (!map.has(parent)) {
        map.set(parent, []);
      }
      map.get(parent)!.push(ref);
    }
    return map;
  }, [graph]);

  const rootReflections = useMemo(() => {
    if (!graph) return [];
    const keys = new Set(graph.reflections.map((r) => r.key));
    return graph.reflections.filter(
      (r) => !r.payload.previousReflectionKey || !keys.has(r.payload.previousReflectionKey)
    );
  }, [graph]);

  const renderReflectionNode = (
    reflection: ArkivEntityRecord<AgentReflectionPayload>,
    depth: number = 0
  ) => {
    const children = reflectionsByParent.get(reflection.key) || [];
    const sortedChildren = [...children].sort(
      (a, b) => new Date(a.payload.createdAt).getTime() - new Date(b.payload.createdAt).getTime()
    );

    return (
      <div key={reflection.key} className="relative mt-4">
        <div 
          className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 relative overflow-hidden shadow-sm transition-all hover:shadow"
          style={{ marginLeft: `${Math.min(depth, 4) * 1.5}rem` }}
        >
          {depth > 0 && (
            <div className="absolute left-[-1.25rem] top-6 w-[1.25rem] border-t-2 border-dashed border-indigo-200" />
          )}
          <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-bl">
            {reflection.payload.model}
          </div>
          <p className="text-sm italic text-slate-700 mt-2">
            &ldquo;{getReflectionDisplayText(reflection.payload)}&rdquo;
          </p>
          <div className="mt-4 grid gap-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>Interpreter: {reflection.payload.interpreter ?? "legacy"}</span>
            <span>Lineage depth: {reflection.payload.lineageDepth ?? 0}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>{new Date(reflection.payload.createdAt).toLocaleDateString()}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setReplyToKey(reflection.key);
                  const formElement = document.querySelector("form");
                  if (formElement) {
                    formElement.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                <CornerDownRight className="h-3 w-3" />
                Reply
              </button>
              <a
                href={`/create?content=${encodeURIComponent(getReflectionDisplayText(reflection.payload))}&title=Reflection-${reflection.key.slice(2, 10)}&domain=${encodeURIComponent(graph?.memory.payload.domain || "")}`}
                className="inline-flex items-center gap-1 font-bold text-slate-600 hover:text-slate-800 hover:underline"
              >
                <Plus className="h-3 w-3" />
                Use as memory
              </a>
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
        </div>
        {sortedChildren.map((child) => renderReflectionNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Your Memory + Interpretations
          </h1>
          <p className="mt-3 break-all font-mono text-sm font-bold text-slate-500">{memoryKey}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExportGraph}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-black text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-950"
          >
            <Download className="h-4 w-4" />
            Export graph as JSON
          </button>
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
        </div>
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
                {memoryContentMode === "encrypted" ? (
                  <div className="mt-5 rounded-lg border p-4 transition-all">
                    {!decryptedMemory ? (
                      <div className="border-l-4 border-amber-500 bg-amber-50 p-4 mb-4 rounded">
                        <div className="flex gap-2">
                          <LockKeyhole className="h-5 w-5 text-amber-600 shrink-0" />
                          <div>
                            <h4 className="text-sm font-black text-amber-800">This memory is encrypted</h4>
                            <p className="mt-1 text-xs font-semibold leading-relaxed text-amber-700">
                              Only the passphrase holder can read this. The encrypted blob is public on Arkiv, but unreadable without your key.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-l-4 border-emerald-500 bg-emerald-50 p-4 mb-4 rounded">
                        <div className="flex gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                          <div>
                            <h4 className="text-sm font-black text-emerald-800">Decrypted locally — never sent to a server</h4>
                            <p className="mt-1 text-xs font-semibold leading-relaxed text-emerald-700">
                              Content is decrypted in your browser session using web crypto.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!decryptedMemory ? (
                      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                        <input
                          type="password"
                          value={decryptPassphrase}
                          onChange={(event) => setDecryptPassphrase(event.target.value)}
                          className="input"
                          placeholder="Enter memory passphrase"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => void handleDecryptMemory()}
                          disabled={isDecrypting || !decryptPassphrase.trim()}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-black text-white disabled:opacity-60"
                        >
                          {isDecrypting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                          Decrypt Memory
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 font-sans text-base leading-relaxed text-slate-800">
                        {decryptedMemory}
                      </div>
                    )}
                    {decryptError ? (
                      <p className="mt-3 text-sm font-semibold text-[#9d0208]">{decryptError}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 text-lg leading-8 text-slate-700">{getMemoryDisplayContent(graph.memory.payload)}</p>
                )}
                <dl className="mt-5 grid gap-3 sm:grid-cols-4">
                  <MiniMeta label="Category" value={graph.memory.payload.domain} />
                  <MiniMeta label="Visibility" value={graph.memory.payload.visibility} />
                  <MiniMeta label="Storage Mode" value={memoryContentMode} />
                  <MiniMeta label="Created" value={graph.memory.payload.createdAt} />
                </dl>
              </article>

              {/* Agent Reflection Sandbox Panel */}
              <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Sparkles className="h-5 w-5 text-[#4361ee]" aria-hidden />
                  <h2 className="text-xl font-black text-slate-950">AI Interpretations</h2>
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

                    {replyToKey && (
                      <div className="flex items-center justify-between rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-2 text-xs font-bold text-indigo-700 mb-1">
                        <span>
                          Replying to parent interpretation: <code className="font-mono text-xs">{truncateMiddle(replyToKey, 8, 6)}</code>
                        </span>
                        <button
                          type="button"
                          onClick={() => setReplyToKey(undefined)}
                          className="text-indigo-500 hover:text-indigo-800"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-bold text-slate-700">
                        <span>Interpretation layer</span>
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
                        <span>Choose a starting point (optional)</span>
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

                    <div className="rounded-lg border border-slate-200 bg-[#f8fbff] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-black text-slate-950">Generate semantic interpretation</p>
                          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                            Groq reads the selected memory, stack, interpreter, context, authority, and visible lineage.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleGenerateReflection()}
                          disabled={
                            isGeneratingReflection ||
                            !selectedStack ||
                            !memoryForAi.trim() ||
                            memoryContentMode === "metadata-only"
                          }
                          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isGeneratingReflection ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          ) : (
                            <WandSparkles className="h-4 w-4" aria-hidden />
                          )}
                          {memoryContentMode === "encrypted" && !decryptedMemory
                            ? "Decrypt first"
                            : "Generate with Groq"}
                        </button>
                      </div>
                    </div>

                    {reflectionText && selectedStack && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 mt-2">
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-3">
                          Transformation Trace
                        </h3>
                        <div className="relative border-l-2 border-slate-300 pl-4 space-y-4">
                          {/* Original Memory */}
                          <div className="relative">
                            <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-400" />
                            <h4 className="text-xs font-bold text-slate-500">Original Memory Content</h4>
                            <p className="text-sm text-slate-700 mt-1 max-h-24 overflow-y-auto bg-white p-2 rounded border border-slate-200">
                              {memoryForAi}
                            </p>
                          </div>

                          {/* Modifiers */}
                          {selectedStack.payload.modifiers.map((mod, idx) => (
                            <div key={mod} className="relative">
                              <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#4cc9f0]" />
                              <h4 className="text-xs font-bold text-slate-800">
                                Modifier {idx + 1}: <code className="text-xs text-rose-600 bg-rose-50 px-1 py-0.5 rounded font-mono">{mod}</code>
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {getModifierDescription(mod)}
                              </p>
                            </div>
                          ))}

                          {/* Final Reflection */}
                          <div className="relative">
                            <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            <h4 className="text-xs font-bold text-emerald-600">Final Generated Reflection</h4>
                            <p className="text-sm text-slate-700 mt-1 max-h-32 overflow-y-auto bg-emerald-50/50 p-2 rounded border border-emerald-200">
                              {reflectionText}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

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

                    <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[auto_1fr] sm:items-center">
                      <label className="inline-flex items-center gap-2 text-sm font-black text-slate-700">
                        <input
                          type="checkbox"
                          checked={encryptReflection}
                          onChange={(event) => setEncryptReflection(event.target.checked)}
                          className="h-4 w-4"
                        />
                        Encrypt reflection
                      </label>
                      {encryptReflection ? (
                        <input
                          type="password"
                          value={reflectionPassphrase}
                          onChange={(event) => setReflectionPassphrase(event.target.value)}
                          className="input"
                          placeholder="Reflection passphrase"
                          autoComplete="new-password"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-slate-500">
                          Plaintext reflections are public on Braga.
                        </p>
                      )}
                    </div>

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
                        {isSubmittingReflection ? "Signing Reflection Transaction..." : "Save this Interpretation to Blockchain"}
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
                AI Interpretations History ({graph.reflections.length})
              </h2>
              {graph.reflections.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500 italic">No interpretations written yet. Run the Sandbox form above to write the first interpretation.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {rootReflections.map((root) => renderReflectionNode(root, 0))}
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
