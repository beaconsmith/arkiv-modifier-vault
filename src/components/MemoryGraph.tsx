import { Brain, GitBranch, KeyRound, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import type {
  AgentReflectionPayload,
  ArkivEntityRecord,
  MemoryNodePayload,
  ModifierStackPayload,
} from "@/lib/schema";
import { truncateMiddle } from "@/lib/format";

import { EntityMeta } from "./EntityMeta";
import { ModifierToken } from "./ModifierToken";

export function MemoryGraph({
  memory,
  stacks,
  reflections = [],
}: {
  memory?: ArkivEntityRecord<MemoryNodePayload> | Partial<ArkivEntityRecord<MemoryNodePayload>>;
  stacks?: Array<
    ArkivEntityRecord<ModifierStackPayload> | Partial<ArkivEntityRecord<ModifierStackPayload>>
  >;
  reflections?: Array<
    ArkivEntityRecord<AgentReflectionPayload> | Partial<ArkivEntityRecord<AgentReflectionPayload>>
  >;
}) {
  const payload = memory?.payload;
  const activeStacks = stacks ?? [];

  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,107,107,0.16),transparent_28%),radial-gradient(circle_at_85%_28%,rgba(6,214,160,0.18),transparent_24%),radial-gradient(circle_at_55%_78%,rgba(67,97,238,0.13),transparent_30%)]" />
      <div className="relative grid gap-4">
        <div className="min-h-[360px] min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-[#f8fbff]/86 p-4">
          <div className="grid min-h-[320px] min-w-0 gap-3 md:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] md:items-center">
            <GraphNode
              tone="coral"
              icon={<Brain className="h-5 w-5" aria-hidden />}
              title={payload?.title ?? "MemoryNode"}
              subtitle={payload?.content ?? "Read or create a memory to reveal its payload."}
            />
            
            <div className="relative h-full min-h-[100px] min-w-0 md:min-h-0">
              <svg
                className="absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <style>{`
                  @keyframes flow-glow {
                    to {
                      stroke-dashoffset: -24;
                    }
                  }
                  .glow-line {
                    stroke: url(#line-gradient-glow);
                    stroke-width: 1.5;
                    stroke-linecap: round;
                  }
                  .pulse-line {
                    stroke: #4cc9f0;
                    stroke-width: 2;
                    stroke-dasharray: 6, 12;
                    animation: flow-glow 1.5s linear infinite;
                    filter: drop-shadow(0 0 3px #4cc9f0);
                  }
                `}</style>
                <defs>
                  <linearGradient id="line-gradient-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff6b6b" />
                    <stop offset="50%" stopColor="#4361ee" />
                    <stop offset="100%" stopColor="#06d6a0" />
                  </linearGradient>
                </defs>
                
                {activeStacks.length === 0 ? (
                  <>
                    <path d="M 0 50 C 30 50, 70 50, 100 50" className="glow-line opacity-40" />
                    <path d="M 0 50 C 30 50, 70 50, 100 50" className="pulse-line" />
                  </>
                ) : (
                  activeStacks.slice(0, 3).map((_, idx) => {
                    const yPositions = [20, 50, 80];
                    const yTarget = yPositions[idx] ?? 50;
                    const pathData = `M 0 50 C 35 50, 65 ${yTarget}, 100 ${yTarget}`;
                    return (
                      <g key={idx}>
                        <path d={pathData} className="glow-line opacity-40" />
                        <path d={pathData} className="pulse-line" />
                      </g>
                    );
                  })
                )}
              </svg>
              <div className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-md z-10 hover:scale-110 transition duration-300">
                <GitBranch className="h-4 w-4" aria-hidden />
              </div>
            </div>

            <div className="grid min-w-0 gap-3">
              {activeStacks.length ? (
                activeStacks.slice(0, 3).map((stack, index) => (
                  <GraphNode
                    key={stack.key ?? index}
                    tone={index % 2 ? "indigo" : "teal"}
                    icon={<Sparkles className="h-5 w-5" aria-hidden />}
                    title={`ModifierStack ${index + 1}`}
                    subtitle={(stack.payload?.modifiers ?? []).join(" -> ") || "Modifiers pending"}
                  />
                ))
              ) : (
                <GraphNode
                  tone="teal"
                  icon={<Sparkles className="h-5 w-5" aria-hidden />}
                  title="ModifierStack"
                  subtitle="Apply expand, route, transform, and remember modifiers."
                />
              )}
            </div>
          </div>
          {reflections.length ? (
            <div className="mt-4 rounded-lg border border-[#c7d2fe] bg-gradient-to-r from-indigo-50/80 to-blue-50/80 p-3 text-sm text-slate-700 shadow-inner backdrop-blur-sm">
              <div className="mb-1 flex items-center gap-2 font-black text-indigo-950">
                <Sparkles className="h-4 w-4 text-[#4361ee] animate-pulse" aria-hidden />
                Agent Reflection
              </div>
              <p className="italic text-slate-700">
                &ldquo;{reflections[0]?.payload?.reflection}&rdquo;
              </p>
              <div className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                <span>Model: {reflections[0]?.payload?.model}</span>
                <span>•</span>
                <span>Keys: {truncateMiddle(reflections[0]?.key, 8, 6)}</span>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="grid content-start gap-4 md:grid-cols-2">
          <div className="min-w-0 rounded-lg border border-slate-200 bg-[#fbffef] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-slate-500">
              <KeyRound className="h-4 w-4 text-[#8ac926]" aria-hidden />
              Arkiv proof
            </div>
            <EntityMeta record={memory} />
          </div>

          <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">
              Active modifiers
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(activeStacks[0]?.payload?.modifiers ?? [
                "expand",
                "route:biology",
                "transform:design",
                "remember",
              ]).map((modifier, index) => (
                <ModifierToken key={modifier} modifier={modifier} index={index} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function GraphNode({
  tone,
  icon,
  title,
  subtitle,
}: {
  tone: "coral" | "teal" | "indigo";
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  const tones = {
    coral: "border-rose-200 bg-gradient-to-br from-rose-50/90 to-rose-100/40 text-rose-950 shadow-rose-100/20 hover:shadow-rose-100/40 hover:border-rose-300",
    teal: "border-emerald-200 bg-gradient-to-br from-emerald-50/90 to-emerald-100/40 text-emerald-950 shadow-emerald-100/20 hover:shadow-emerald-100/40 hover:border-emerald-300",
    indigo: "border-indigo-200 bg-gradient-to-br from-indigo-50/90 to-indigo-100/40 text-indigo-950 shadow-indigo-100/20 hover:shadow-indigo-100/40 hover:border-indigo-300",
  };

  const iconTones = {
    coral: "bg-rose-500/10 text-rose-600",
    teal: "bg-emerald-500/10 text-emerald-600",
    indigo: "bg-indigo-500/10 text-indigo-600",
  };

  return (
    <div className={`min-w-0 overflow-hidden rounded-xl border p-4 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${tones[tone]}`}>
      <div className={`mb-3 grid h-10 w-10 place-items-center rounded-lg ${iconTones[tone]}`}>{icon}</div>
      <h3 className="break-words text-base font-black tracking-tight [overflow-wrap:anywhere]">{title}</h3>
      <p className="mt-2 overflow-hidden break-words text-sm leading-6 opacity-80 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4] [overflow-wrap:anywhere]">
        {subtitle}
      </p>
    </div>
  );
}
