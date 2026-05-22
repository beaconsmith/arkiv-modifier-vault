import { ArrowDownRight, Eye, Fingerprint, GitBranch, LockKeyhole, Sparkles } from "lucide-react";
import Image from "next/image";

import { APP_TAGLINE, DEMO_MODIFIERS, PROJECT_ATTRIBUTE } from "@/lib/constants";

import { ModifierToken } from "./ModifierToken";

const atlasSteps = [
  {
    title: "MemoryNode",
    body: "The base payload captures a user-owned fact, preference, insight, or research fragment.",
    icon: Fingerprint,
    tone: "border-[#ff6b6b] bg-[#fff0f0]",
  },
  {
    title: "ModifierStack",
    body: "Modifiers declare how an agent may expand, route, transform, and remember the memory.",
    icon: GitBranch,
    tone: "border-[#06d6a0] bg-[#ebfff8]",
  },
  {
    title: "Arkiv proof",
    body: "Entity keys, owner, creator, payload, and attributes stay inspectable on Braga testnet.",
    icon: Eye,
    tone: "border-[#4361ee] bg-[#edf1ff]",
  },
  {
    title: "Portable context",
    body: "A future agent can rehydrate memory from the user-owned graph instead of a platform silo.",
    icon: LockKeyhole,
    tone: "border-[#b8f35a] bg-[#f5ffe6]",
  },
];

export function AtlasScene() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1.08fr)] lg:items-center">
        <div>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Modifiers are an atlas layer for AI memory.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{APP_TAGLINE}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {DEMO_MODIFIERS.map((modifier, index) => (
              <ModifierToken key={modifier} modifier={modifier} index={index} />
            ))}
          </div>
          <p className="mt-5 break-all rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs font-bold text-slate-500">
            {PROJECT_ATTRIBUTE}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
          <Image
            src="/semantic-atlas.png"
            alt="Abstract semantic atlas of user-owned AI memory nodes and privacy layers"
            width={1536}
            height={864}
            priority
            className="h-auto w-full"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {atlasSteps.map((step, index) => {
          const Icon = step.icon;

          return (
            <article key={step.title} className={`rounded-xl border p-5 ${step.tone}`}>
              <div className="mb-5 flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-white text-slate-950 shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="font-mono text-xs font-black text-slate-400">
                  0{index + 1}
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-950">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{step.body}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_72px_1fr] lg:items-center">
          <div className="rounded-lg border border-[#ff6b6b] bg-[#fff0f0] p-5">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-[#9d0208]">
              <Sparkles className="h-4 w-4" aria-hidden />
              Prompt memory
            </div>
            <p className="mt-3 text-xl font-black tracking-tight text-slate-950">
              Codon Optimization Modifier Cache
            </p>
          </div>
          <div className="hidden justify-center lg:flex">
            <ArrowDownRight className="h-8 w-8 text-slate-400" aria-hidden />
          </div>
          <div className="rounded-lg border border-[#06d6a0] bg-[#ebfff8] p-5">
            <div className="flex flex-wrap gap-2">
              {DEMO_MODIFIERS.map((modifier, index) => (
                <ModifierToken key={modifier} modifier={modifier} index={index} />
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">
              The stack does not overwrite the memory. It describes how an agent should interpret it
              while preserving the original Arkiv key.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
