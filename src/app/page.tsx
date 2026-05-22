import { ArrowRight, DatabaseZap, Eye, Fingerprint, GitBranch, LockKeyhole } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { MemoryGraph } from "@/components/MemoryGraph";
import { ModifierToken } from "@/components/ModifierToken";
import { APP_TAGLINE, DEMO_MEMORY_CONTENT, DEMO_MODIFIERS, PROJECT_ATTRIBUTE } from "@/lib/constants";
import type { ArkivEntityRecord, MemoryNodePayload, ModifierStackPayload } from "@/lib/schema";

export default function Home() {
  const previewMemoryKey = "preview-memory-key";
  const previewMemory: Partial<ArkivEntityRecord<MemoryNodePayload>> = {
    key: previewMemoryKey,
    payload: {
      entityType: "MemoryNode" as const,
      project: PROJECT_ATTRIBUTE,
      title: "Base Modifier Cache",
      content: DEMO_MEMORY_CONTENT,
      domain: "biology/design",
      visibility: "private" as const,
      createdAt: new Date("2026-05-22T00:00:00.000Z").toISOString(),
    },
    attributes: [],
  };

  const previewStack: Partial<ArkivEntityRecord<ModifierStackPayload>> = {
    key: "preview-stack-key",
    payload: {
      entityType: "ModifierStack" as const,
      project: PROJECT_ATTRIBUTE,
      memoryKey: previewMemoryKey,
      modifiers: DEMO_MODIFIERS,
      interpreter: "atlas-interpreter:v1",
      context: "mRNA sequence translation efficiency mapping",
      authority: "wallet-owner",
      createdAt: new Date("2026-05-22T00:00:01.000Z").toISOString(),
    },
    attributes: [],
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid min-h-[calc(100vh-220px)] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-black tracking-tight text-slate-950 sm:text-7xl">
            {APP_TAGLINE}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            ModifierVault writes MemoryNodes and ModifierStacks to Arkiv Braga so agent context can
            be portable, inspectable, and owned by the wallet that created it.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/create"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Create demo memory <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/query"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-black text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-950"
            >
              Query Arkiv graph
            </Link>
          </div>
          <div className="mt-7 flex flex-wrap gap-2">
            {DEMO_MODIFIERS.map((modifier, index) => (
              <ModifierToken key={modifier} modifier={modifier} index={index} />
            ))}
          </div>
        </div>

        <MemoryGraph memory={previewMemory} stacks={[previewStack]} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          icon={<Fingerprint className="h-5 w-5" aria-hidden />}
          title="User-owned"
          body="Memory belongs to the wallet, not the chat surface."
        />
        <FeatureCard
          icon={<GitBranch className="h-5 w-5" aria-hidden />}
          title="Composable"
          body="Stacks keep interpretation separate from the base memory."
        />
        <FeatureCard
          icon={<Eye className="h-5 w-5" aria-hidden />}
          title="Inspectable"
          body="Keys, owners, creators, attributes, and payloads are visible."
        />
        <FeatureCard
          icon={<LockKeyhole className="h-5 w-5" aria-hidden />}
          title="Privacy-aware"
          body="Visibility lives in the entity model for agent-side policy."
        />
      </section>

      <section className="mb-16 rounded-xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <div className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-center">
          <div>
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-[#4cc9f0]">
              <DatabaseZap className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="text-3xl font-black tracking-tight">Built for Arkiv ETHNS Braga.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The app uses one unique project attribute on every entity and every query.
            </p>
          </div>
          <code className="block break-all rounded-lg border border-slate-200 bg-[#f8fbff] p-4 font-mono text-sm font-bold text-slate-700">
            {PROJECT_ATTRIBUTE}
          </code>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_15px_40px_rgba(15,23,42,0.06)]">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-[#edf1ff] text-[#2337a6]">
        {icon}
      </div>
      <h2 className="text-lg font-black tracking-tight text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </article>
  );
}
