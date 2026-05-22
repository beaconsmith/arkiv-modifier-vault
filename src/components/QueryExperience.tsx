"use client";

import { DatabaseZap, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  queryMemoryNodes,
  queryMemoryNodesByModifier,
  queryModifierStacks,
  readMemoryNode,
} from "@/lib/arkiv";
import { PROJECT_ATTRIBUTE } from "@/lib/constants";
import { formatDate, truncateMiddle } from "@/lib/format";
import type { ArkivEntityRecord, MemoryNodePayload, ModifierStackPayload } from "@/lib/schema";

import { EntityMeta } from "./EntityMeta";
import { ModifierToken } from "./ModifierToken";

export function QueryExperience() {
  const [memoryKey, setMemoryKey] = useState("");
  const [modifier, setModifier] = useState("");
  const [memories, setMemories] = useState<ArkivEntityRecord<MemoryNodePayload>[]>([]);
  const [stacks, setStacks] = useState<ArkivEntityRecord<ModifierStackPayload>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runQuery = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const trimmedMemoryKey = memoryKey.trim();
      const trimmedModifier = modifier.trim();

      if (trimmedMemoryKey) {
        const [memory, linkedStacks] = await Promise.all([
          readMemoryNode(trimmedMemoryKey),
          queryModifierStacks({ memoryKey: trimmedMemoryKey }),
        ]);
        setMemories([memory]);
        setStacks(linkedStacks);
        return;
      }

      if (trimmedModifier) {
        const result = await queryMemoryNodesByModifier(trimmedModifier);
        setMemories(result.memories);
        setStacks(result.stacks);
        return;
      }

      const projectMemories = await queryMemoryNodes();
      setMemories(projectMemories);
      setStacks([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Arkiv query failed.");
      setMemories([]);
      setStacks([]);
    } finally {
      setIsLoading(false);
    }
  }, [memoryKey, modifier]);

  useEffect(() => {
    let isActive = true;

    async function loadProjectMemories() {
      setIsLoading(true);
      setError(null);

      try {
        const projectMemories = await queryMemoryNodes();

        if (isActive) {
          setMemories(projectMemories);
        }
      } catch (caught) {
        if (isActive) {
          setError(caught instanceof Error ? caught.message : "Arkiv query failed.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadProjectMemories();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(360px,0.5fr)]">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Query owned memory by project, key, or modifier.
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            All searches include the required Arkiv project attribute:{" "}
            <code className="rounded-md bg-white px-2 py-1 font-mono text-sm text-slate-950 ring-1 ring-slate-200">
              {PROJECT_ATTRIBUTE}
            </code>
            .
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void runQuery();
          }}
          className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
        >
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Memory key
            <input
              value={memoryKey}
              onChange={(event) => setMemoryKey(event.target.value)}
              placeholder="0x..."
              className="input font-mono text-sm"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Modifier
            <input
              value={modifier}
              onChange={(event) => setModifier(event.target.value)}
              placeholder="route:biology"
              className="input font-mono text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Search className="h-4 w-4" aria-hidden />
            )}
            Query Arkiv
          </button>
        </form>
      </section>

      {error ? (
        <div className="rounded-lg border border-[#ff6b6b] bg-[#fff0f0] p-4 text-sm font-semibold text-[#9d0208]">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black tracking-tight">MemoryNodes</h2>
            <span className="font-mono text-sm font-bold text-slate-500">
              {memories.length} result{memories.length === 1 ? "" : "s"}
            </span>
          </div>

          {isLoading ? <Skeleton label="Loading memories from Arkiv" /> : null}
          {!isLoading && memories.length === 0 ? <EmptyState /> : null}

          {memories.map((memory) => (
            <article
              key={memory.key}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_15px_40px_rgba(15,23,42,0.07)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <Link
                    href={`/memory/${encodeURIComponent(memory.key)}`}
                    className="text-xl font-black tracking-tight text-slate-950 underline decoration-[#4cc9f0] decoration-2 underline-offset-4"
                  >
                    {memory.payload.title}
                  </Link>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{memory.payload.content}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    <span>{memory.payload.domain}</span>
                    <span>{memory.payload.visibility}</span>
                    <span>{formatDate(memory.payload.createdAt)}</span>
                  </div>
                </div>
                <span className="rounded-lg border border-slate-200 bg-[#f8fbff] px-3 py-2 font-mono text-xs font-bold text-slate-600">
                  {truncateMiddle(memory.key)}
                </span>
              </div>
            </article>
          ))}
        </div>

        <aside className="grid content-start gap-4">
          <div className="rounded-xl border border-slate-200 bg-[#fbffef] p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-slate-500">
              <DatabaseZap className="h-4 w-4 text-[#436000]" aria-hidden />
              ModifierStacks
            </div>
            <div className="grid gap-4">
              {stacks.length === 0 ? (
                <p className="text-sm leading-6 text-slate-600">
                  Enter a memory key or modifier to inspect linked stacks.
                </p>
              ) : null}
              {stacks.map((stack) => (
                <div key={stack.key} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {stack.payload.modifiers.map((item, index) => (
                      <ModifierToken key={item} modifier={item} index={index} />
                    ))}
                  </div>
                  <p className="mb-3 text-sm leading-6 text-slate-600">{stack.payload.context}</p>
                  <EntityMeta record={stack} />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function Skeleton({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 h-4 w-40 animate-pulse rounded bg-slate-200" />
      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white/72 p-8 text-center">
      <p className="text-lg font-black tracking-tight text-slate-950">No matching memories yet.</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Create the MVP demo memory, then query by project or modifier.
      </p>
    </div>
  );
}
