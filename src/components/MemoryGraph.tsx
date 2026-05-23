"use client";

import { Brain, KeyRound, Sparkles } from "lucide-react";
import { type ReactNode, useMemo } from "react";

import { DEMO_MODIFIERS } from "@/lib/constants";
import { getMemoryDisplayContent, getReflectionDisplayText } from "@/lib/schema";
import type {
  AgentReflectionPayload,
  ArkivEntityRecord,
  MemoryNodePayload,
  ModifierStackPayload,
} from "@/lib/schema";

import { EntityMeta } from "./EntityMeta";
import { ModifierToken } from "./ModifierToken";

interface NodePosition {
  x: number;
  y: number;
}

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
  const activeStacks = useMemo(() => stacks ?? [], [stacks]);

  // Default dimensions
  const nodeWidth = 240;
  const nodeHeight = 110;

  // Static positions — no dragging (removed drag handlers that caused continuous re-renders)
  const positions = useMemo<Record<string, NodePosition>>(() => {
    const pos: Record<string, NodePosition> = {
      memory: { x: 30, y: 150 },
    };

    if (activeStacks.length > 0) {
      activeStacks.slice(0, 3).forEach((stack, idx) => {
        const key = stack.key ?? `stack-${idx}`;
        const yPos = activeStacks.length === 1 ? 150 : activeStacks.length === 2 ? [90, 210][idx] : [50, 160, 270][idx];
        pos[key] = { x: 310, y: yPos };
      });
    } else {
      pos["stack-empty"] = { x: 310, y: 150 };
    }

    const visibleRefs = reflections.slice(0, 3);
    if (visibleRefs.length > 0) {
      visibleRefs.forEach((ref, idx) => {
        const key = ref.key ?? `ref-${idx}`;
        const yPos = visibleRefs.length === 1 ? 150 : visibleRefs.length === 2 ? [90, 210][idx] : [50, 160, 270][idx];
        pos[key] = { x: 590, y: yPos };
      });
    } else {
      pos["ref-empty"] = { x: 590, y: 150 };
    }

    return pos;
  }, [activeStacks, reflections]);

  // Helper to draw bezier path between two nodes
  const getBezierPath = (startId: string, endId: string) => {
    const start = positions[startId];
    const end = positions[endId];
    if (!start || !end) return "";

    const x1 = start.x + nodeWidth;
    const y1 = start.y + nodeHeight / 2;
    const x2 = end.x;
    const y2 = end.y + nodeHeight / 2;

    const controlOffset = Math.abs(x2 - x1) * 0.5;
    return `M ${x1} ${y1} C ${x1 + controlOffset} ${y1}, ${x2 - controlOffset} ${y2}, ${x2} ${y2}`;
  };

  // Positions for lines
  const memoryPos = positions["memory"];

  return (
    <section
      data-testid="memory-graph"
      className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] select-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,107,107,0.12),transparent_28%),radial-gradient(circle_at_85%_28%,rgba(6,214,160,0.14),transparent_24%),radial-gradient(circle_at_55%_78%,rgba(67,97,238,0.1),transparent_30%)] pointer-events-none" />

      <div className="relative min-h-[400px] w-full overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800 bg-[#f8fbff]/70 dark:bg-slate-900/40 p-4">
        
        {/* SVG Connector overlay */}
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            .glow-line {
              stroke: url(#line-gradient-glow);
              stroke-width: 2;
              stroke-linecap: round;
            }
            .static-line {
              stroke: #4cc9f0;
              stroke-width: 2;
              stroke-dasharray: 6, 12;
              opacity: 0.6;
            }
          `}</style>
          <defs>
            <linearGradient id="line-gradient-glow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="50%" stopColor="#4361ee" />
              <stop offset="100%" stopColor="#06d6a0" />
            </linearGradient>
          </defs>

          {/* Links: Memory to Stacks */}
          {memoryPos && (
            <>
              {activeStacks.length === 0 ? (
                positions["stack-empty"] && (
                  <g>
                    <path d={getBezierPath("memory", "stack-empty")} className="glow-line opacity-40" />
                    <path d={getBezierPath("memory", "stack-empty")} className="static-line" />
                  </g>
                )
              ) : (
                activeStacks.slice(0, 3).map((stack, idx) => {
                  const key = stack.key ?? `stack-${idx}`;
                  return positions[key] ? (
                    <g key={key}>
                      <path d={getBezierPath("memory", key)} className="glow-line opacity-40" />
                      <path d={getBezierPath("memory", key)} className="static-line" />
                    </g>
                  ) : null;
                })
              )}
            </>
          )}

          {/* Links: Stacks to Reflections */}
          {activeStacks.slice(0, 3).map((stack, sIdx) => {
            const sKey = stack.key ?? `stack-${sIdx}`;
            return reflections.slice(0, 3).map((ref, rIdx) => {
              const rKey = ref.key ?? `ref-${rIdx}`;
              return positions[sKey] && positions[rKey] ? (
                <g key={`${sKey}-${rKey}`}>
                  <path d={getBezierPath(sKey, rKey)} className="glow-line opacity-30" />
                  <path d={getBezierPath(sKey, rKey)} className="static-line opacity-80" />
                </g>
              ) : null;
            });
          })}
        </svg>

        {/* Nodes layer */}
        <div className="absolute inset-0 pointer-events-none">
          
          {/* Memory Node */}
          {positions["memory"] && (
            <div
              className="absolute"
              style={{
                left: `${positions["memory"].x}px`,
                top: `${positions["memory"].y}px`,
                width: `${nodeWidth}px`,
                height: `${nodeHeight}px`,
              }}
            >
              <GraphNode
                tone="coral"
                icon={<Brain className="h-5 w-5" aria-hidden />}
                title={payload?.title ?? "MemoryNode"}
                subtitle={payload ? getMemoryDisplayContent(payload as MemoryNodePayload) : "Read or create a memory to reveal its payload."}
              />
            </div>
          )}

          {/* Stack Nodes */}
          {activeStacks.length ? (
            activeStacks.slice(0, 3).map((stack, index) => {
              const key = stack.key ?? `stack-${index}`;
              const pos = positions[key];
              return pos ? (
                <div
                  key={key}
                  className="absolute"
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: `${nodeWidth}px`,
                    height: `${nodeHeight}px`,
                  }}
                >
                  <GraphNode
                    tone={index % 2 ? "indigo" : "teal"}
                    icon={<Sparkles className="h-5 w-5" aria-hidden />}
                    title={`ModifierStack ${index + 1}`}
                    subtitle={(stack.payload?.modifiers ?? []).join(" -> ") || "Modifiers pending"}
                  />
                </div>
              ) : null;
            })
          ) : (
            positions["stack-empty"] && (
              <div
                className="absolute"
                style={{
                  left: `${positions["stack-empty"].x}px`,
                  top: `${positions["stack-empty"].y}px`,
                  width: `${nodeWidth}px`,
                  height: `${nodeHeight}px`,
                }}
              >
                <GraphNode
                  tone="teal"
                  icon={<Sparkles className="h-5 w-5" aria-hidden />}
                  title="ModifierStack"
                  subtitle="Apply expand, route, transform, and remember modifiers."
                />
              </div>
            )
          )}

          {/* Reflection Nodes */}
          {reflections.length ? (
            reflections.slice(0, 3).map((reflection, index) => {
              const key = reflection.key ?? `ref-${index}`;
              const pos = positions[key];
              return pos ? (
                <div
                  key={key}
                  className="absolute"
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    width: `${nodeWidth}px`,
                    height: `${nodeHeight}px`,
                  }}
                >
                  <GraphNode
                    tone="indigo"
                    icon={<Sparkles className="h-5 w-5" aria-hidden />}
                    title={`Interpretation ${index + 1}`}
                    subtitle={reflection.payload ? getReflectionDisplayText(reflection.payload as AgentReflectionPayload) : ""}
                  />
                </div>
              ) : null;
            })
          ) : (
            positions["ref-empty"] && (
              <div
                className="absolute"
                style={{
                  left: `${positions["ref-empty"].x}px`,
                  top: `${positions["ref-empty"].y}px`,
                  width: `${nodeWidth}px`,
                  height: `${nodeHeight}px`,
                }}
              >
                <GraphNode
                  tone="indigo"
                  icon={<Sparkles className="h-5 w-5" aria-hidden />}
                  title="Interpretation"
                  subtitle="Save interpretations to execute modifiers."
                />
              </div>
            )
          )}
        </div>
      </div>

      <aside className="grid content-start gap-4 md:grid-cols-2 mt-4">
        <div
          data-testid="memory-graph-proof"
          className="min-w-0 rounded-lg border border-slate-200 dark:border-slate-800 bg-[#fbffef] dark:bg-slate-900/30 p-4"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-slate-500">
            <KeyRound className="h-4 w-4 text-[#8ac926]" aria-hidden />
            Arkiv proof
          </div>
          <EntityMeta record={memory} />
        </div>

        <div
          data-testid="memory-graph-active-modifiers"
          className="min-w-0 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4"
        >
          <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">
            Active modifiers
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(activeStacks[0]?.payload?.modifiers ?? DEMO_MODIFIERS).map((modifier, index) => (
              <ModifierToken key={modifier} modifier={modifier} index={index} />
            ))}
          </div>
        </div>
      </aside>
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
    coral: "border-rose-200 dark:border-rose-900/60 bg-gradient-to-br from-rose-50/90 to-rose-100/40 dark:from-rose-950/40 dark:to-rose-900/20 text-rose-950 dark:text-rose-100 shadow-rose-100/20 hover:shadow-rose-100/40 hover:border-rose-300 dark:hover:border-rose-800 cursor-grab active:cursor-grabbing",
    teal: "border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/90 to-emerald-100/40 dark:from-emerald-950/40 dark:to-emerald-900/20 text-emerald-950 dark:text-emerald-100 shadow-emerald-100/20 hover:shadow-emerald-100/40 hover:border-emerald-300 dark:hover:border-emerald-800 cursor-grab active:cursor-grabbing",
    indigo: "border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/90 to-indigo-100/40 dark:from-indigo-950/40 dark:to-indigo-900/20 text-indigo-950 dark:text-indigo-100 shadow-indigo-100/20 hover:shadow-indigo-100/40 hover:border-indigo-300 dark:hover:border-indigo-800 cursor-grab active:cursor-grabbing",
  };

  const iconTones = {
    coral: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    teal: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  };

  return (
    <div
      className={`h-full min-w-0 overflow-hidden rounded-xl border p-3 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md ${tones[tone]}`}
    >
      <div className="flex items-start gap-2.5">
        <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${iconTones[tone]}`}>{icon}</div>
        <div className="min-w-0">
          <h3 className="break-words text-xs font-black tracking-tight [overflow-wrap:anywhere] leading-4">{title}</h3>
          <p className="mt-1 overflow-hidden break-words text-[10px] leading-3.5 opacity-80 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] [overflow-wrap:anywhere]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
