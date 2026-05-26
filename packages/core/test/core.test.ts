import assert from "node:assert/strict";

import {
  LocalMemoryStore,
  attachModifierStack,
  buildPromptFromMemoryGraph,
  createAgentReflection,
  createMemoryNode,
  exportMemoryGraph,
  hashString,
  queryMemoryGraph,
  validateMemoryGraph,
} from "../src/index";

const store = new LocalMemoryStore({ owner: "0xowner", creator: "0xcreator" });
const createdAt = "2026-05-26T00:00:00.000Z";

const memoryDraft = createMemoryNode({
  title: "Tradeoff delay",
  domain: "personal-cognition",
  contentMode: "plaintext",
  content: "I avoid decisions until I can model tradeoffs.",
  createdAt,
});

const memory = await store.create(memoryDraft);

const strategyStack = await store.create(
  attachModifierStack({
    memoryKey: memory.key,
    modifiers: ["route:strategy", "expand", "remember"],
    interpreter: "beaconsmith:v1",
    authority: "user",
    context: "Convert the memory into decision strategy.",
    createdAt,
  }),
);

const productStack = await store.create(
  attachModifierStack({
    memoryKey: memory.key,
    modifiers: ["route:product", "transform:design"],
    interpreter: "beaconsmith:v1",
    authority: "agent",
    context: "Convert the memory into product design posture.",
    createdAt,
  }),
);

const prompt = buildPromptFromMemoryGraph({
  memory,
  stacks: [strategyStack, productStack],
  reflections: [],
});
const output = "Strategy reflection: model options before committing.";

await store.create(
  createAgentReflection({
    memoryKey: memory.key,
    modifierStackKey: strategyStack.key,
    lineageDepth: 0,
    model: "local-reflector",
    interpreter: "beaconsmith:v1",
    contentMode: "plaintext",
    reflection: output,
    promptHash: hashString(prompt),
    outputHash: hashString(output),
    createdAt,
  }),
);

const graph = await queryMemoryGraph(store, memory.key);

assert.equal(graph.memory.key, memory.key);
assert.equal(graph.stacks.length, 2);
assert.equal(graph.reflections.length, 1);
assert.equal(validateMemoryGraph(graph).valid, true);
assert.ok(buildPromptFromMemoryGraph(graph).includes("I avoid decisions"));
assert.ok(buildPromptFromMemoryGraph(graph).includes("route:strategy"));
assert.ok(buildPromptFromMemoryGraph(graph).includes("route:product"));

const exported = exportMemoryGraph(graph);
assert.equal(exported.schemaVersion, "3");
assert.equal(exported.project, "modifiervault_beaconsmith_ethns_2026");
assert.equal(exported.memory.key, memory.key);
assert.equal(exported.stacks[0].payload.memoryKey, memory.key);
assert.equal(exported.reflections[0].payload.modifierStackKey, strategyStack.key);

console.log("core tests ok");
