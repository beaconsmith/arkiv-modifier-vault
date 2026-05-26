import { Code2, DatabaseZap, Download, GitBranch, Search } from "lucide-react";
import type { ReactNode } from "react";

import { PROJECT_ATTRIBUTE, SCHEMA_VERSION } from "@/lib/constants";

const sdkExample = `import { ModifierVault } from "@modifiervault/sdk-ts";

const vault = ModifierVault.local({ owner: "0xowner" });

const memory = await vault.createMemory({
  title: "Tradeoff delay",
  domain: "personal-cognition",
  contentMode: "plaintext",
  content: "I avoid decisions until I can model tradeoffs.",
});

const stack = await vault.attachModifierStack({
  memoryKey: memory.key,
  modifiers: ["route:strategy", "expand", "remember"],
  interpreter: "beaconsmith:v1",
  authority: "user",
  context: "Reuse this as a decision strategy.",
});

await vault.createReflection({
  memoryKey: memory.key,
  modifierStackKey: stack.key,
  lineageDepth: 0,
  model: "local-reflector",
  interpreter: "beaconsmith:v1",
  contentMode: "plaintext",
  reflection: "Delay preserves optionality until tradeoffs are visible.",
});

const graph = await vault.exportGraph(memory.key);`;

const arkivExample = `// Live mode uses the same payload and attribute builders.
// Set NEXT_PUBLIC_MODIFIERVAULT_STORAGE=arkiv in the dashboard app.
// The app writes entities with:
// - project=${PROJECT_ATTRIBUTE}
// - schemaVersion=${SCHEMA_VERSION}
// - entityType
// - createdAt
// plus entity-specific query attributes.`;

export default function SdkPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_360px]">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            TypeScript SDK
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Create, interpret, query, and export user-owned memory graphs without binding the
            graph model to the dashboard UI.
          </p>
        </div>
        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <MetaRow label="package" value="@modifiervault/sdk-ts" />
          <MetaRow label="project" value={PROJECT_ATTRIBUTE} />
          <MetaRow label="schema" value={SCHEMA_VERSION} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-slate-500">
            <Code2 className="h-4 w-4 text-indigo-600" aria-hidden />
            Local graph API
          </div>
          <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-xs leading-6 text-slate-100">
            <code>{sdkExample}</code>
          </pre>
        </article>

        <aside className="grid content-start gap-4">
          <Capability
            icon={<DatabaseZap className="h-4 w-4" aria-hidden />}
            title="Same entity contract"
            body="The SDK uses the same v3 schemas and Arkiv attribute builders as the dashboard."
          />
          <Capability
            icon={<Search className="h-4 w-4" aria-hidden />}
            title="Queryable modifiers"
            body="Arrays stay in payload; each modifier also becomes an individual query attribute."
          />
          <Capability
            icon={<GitBranch className="h-4 w-4" aria-hidden />}
            title="Lineage included"
            body="Reflections carry previousReflectionKey, lineageDepth, promptHash, and outputHash."
          />
          <Capability
            icon={<Download className="h-4 w-4" aria-hidden />}
            title="Portable export"
            body="Exported graphs keep payloads, attributes, keys, owner, creator, and links together."
          />
        </aside>
      </section>

      <section className="rounded-xl border border-slate-200 bg-[#fbffef] p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-slate-500">
          <DatabaseZap className="h-4 w-4 text-emerald-600" aria-hidden />
          Arkiv live mode
        </div>
        <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-xs leading-6 text-slate-800">
          <code>{arkivExample}</code>
        </pre>
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

function Capability({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-black text-slate-950">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
          {icon}
        </span>
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </article>
  );
}
