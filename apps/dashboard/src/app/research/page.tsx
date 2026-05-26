import { BrainCircuit, Fingerprint, GitBranch, KeyRound, LockKeyhole } from "lucide-react";

import { PROJECT_ATTRIBUTE, SCHEMA_VERSION } from "@/lib/constants";

const principles = [
  {
    icon: Fingerprint,
    title: "User-owned state",
    body: "Memory is represented as portable records with owner and creator metadata when Arkiv returns it.",
  },
  {
    icon: GitBranch,
    title: "Semantic reuse frames",
    body: "ModifierStacks interpret a MemoryNode without mutating the underlying memory.",
  },
  {
    icon: BrainCircuit,
    title: "Interpretation artifacts",
    body: "AgentReflections are generated artifacts with lineage, prompt hash, and output hash.",
  },
  {
    icon: LockKeyhole,
    title: "Disclosure boundaries",
    body: "Plaintext, metadata-only, and encrypted modes are explicit; encrypted payloads do not hide metadata.",
  },
];

export default function ResearchPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_360px]">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Research Notes
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            ModifierVault treats AI memory as user-owned infrastructure: a semantic graph that can
            be inspected, exported, queried, and reinterpreted outside one platform&apos;s hidden state.
          </p>
        </div>
        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-slate-500">
            <KeyRound className="h-4 w-4 text-emerald-600" aria-hidden />
            Namespace
          </div>
          <dl className="grid gap-3">
            <MetaRow label="project" value={PROJECT_ATTRIBUTE} />
            <MetaRow label="schemaVersion" value={SCHEMA_VERSION} />
          </dl>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {principles.map((principle) => {
          const Icon = principle.icon;
          return (
            <article key={principle.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-[#4cc9f0]">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-4 text-base font-black text-slate-950">{principle.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{principle.body}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black tracking-tight text-slate-950">Demo Scenario</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Base memory: <span className="font-semibold text-slate-950">&ldquo;I avoid decisions until I can model tradeoffs.&rdquo;</span>
          </p>
          <div className="mt-4 grid gap-3">
            <Lens label="A" modifiers='["route:strategy", "expand", "remember"]' />
            <Lens label="B" modifiers='["route:product", "transform:design"]' />
            <Lens label="C" modifiers='["protect", "compress"]' />
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-[#fbffef] p-5 shadow-sm">
          <h2 className="text-xl font-black tracking-tight text-slate-950">Evidence Shape</h2>
          <ul className="mt-3 grid gap-3 text-sm leading-6 text-slate-700">
            <li>MemoryNode write/read returns the same v3 payload and Arkiv key.</li>
            <li>ModifierStack is linked by `memoryKey` and queryable by each modifier attribute.</li>
            <li>AgentReflection is linked by `memoryKey` plus `modifierStackKey`.</li>
            <li>`/memory/[key]` reconstructs the graph from shared keys.</li>
            <li>Export JSON preserves payloads, attributes, owner, creator, and lineage fields.</li>
          </ul>
        </article>
      </section>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</dt>
      <dd className="break-all font-mono text-sm font-bold text-slate-800">{value}</dd>
    </div>
  );
}

function Lens({ label, modifiers }: { label: string; modifiers: string }) {
  return (
    <div className="grid gap-1 rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Stack {label}</div>
      <code className="break-all text-xs font-bold text-slate-800">{modifiers}</code>
    </div>
  );
}
