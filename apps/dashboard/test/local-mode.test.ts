import assert from "node:assert/strict";

import {
  createAgentReflection,
  createMemoryNode,
  createModifierStack,
  queryMemoryNodesByModifier,
  readMemoryGraph,
  resetLocalVaultForTests,
  seedLocalDemoGraph,
} from "../src/lib/arkiv";

const createdAt = "2026-05-26T00:00:00.000Z";

resetLocalVaultForTests();
const demo = await seedLocalDemoGraph();

assert.equal(demo.memory.payload.content, "I avoid decisions until I can model tradeoffs.");
assert.equal(demo.stacks.length, 3);
assert.deepEqual(
  demo.stacks.map((stack) => stack.payload.modifiers),
  [
    ["route:strategy", "expand", "remember"],
    ["route:product", "transform:design"],
    ["protect", "compress"],
  ],
);

const reconstructed = await readMemoryGraph(demo.memory.key);
assert.equal(reconstructed.memory.key, demo.memory.key);
assert.equal(reconstructed.stacks.length, 3);
assert.equal(reconstructed.reflections.length, 3);
assert.ok(reconstructed.reflections.every((reflection) => reflection.payload.outputHash.length === 64));

const protectedResult = await queryMemoryNodesByModifier("protect");
assert.deepEqual(
  protectedResult.memories.map((memory) => memory.key),
  [demo.memory.key],
);

const memoryResult = await createMemoryNode({
  title: "Local scratch memory",
  domain: "personal-cognition",
  contentMode: "plaintext",
  content: "Local mode should not need a wallet.",
  createdAt,
});

const stackResult = await createModifierStack({
  memoryKey: memoryResult.entityKey,
  modifiers: ["route:strategy"],
  interpreter: "beaconsmith:v1",
  authority: "user",
  context: "Local smoke stack.",
  createdAt,
});

const reflectionResult = await createAgentReflection({
  memoryKey: memoryResult.entityKey,
  modifierStackKey: stackResult.entityKey,
  lineageDepth: 0,
  model: "local-reflector",
  interpreter: "beaconsmith:v1",
  contentMode: "plaintext",
  reflection: "Local reflection can be linked back into the graph.",
  createdAt,
});

const localGraph = await readMemoryGraph(memoryResult.entityKey);
assert.equal(localGraph.stacks[0].key, stackResult.entityKey);
assert.equal(localGraph.reflections[0].key, reflectionResult.entityKey);
assert.equal(localGraph.memory.owner, "local-owner");
assert.equal(localGraph.memory.creator, "local-browser");

resetLocalVaultForTests();
const defaultMemory = await createMemoryNode({
  title: "Tradeoff Modeling Pattern",
  domain: "personal-cognition",
  contentMode: "plaintext",
  content: "I avoid decisions until I can model tradeoffs.",
  createdAt,
});
await createModifierStack({
  memoryKey: defaultMemory.entityKey,
  modifiers: ["custom:journal"],
  interpreter: "custom-interpreter",
  authority: "user",
  context: "User-created non-demo stack.",
  createdAt,
});
await createModifierStack({
  memoryKey: defaultMemory.entityKey,
  modifiers: ["route:strategy", "expand", "remember"],
  interpreter: "beaconsmith:v1",
  authority: "user",
  context: "User-created default stack.",
  createdAt,
});

const repairedDemo = await seedLocalDemoGraph();
const repairedDemoStacks = repairedDemo.stacks.filter(
  (stack) => stack.payload.interpreter === "beaconsmith:v1",
);
assert.equal(
  repairedDemoStacks.length,
  3,
  "seeding must repair an incomplete default local graph with all demo stacks",
);
assert.deepEqual(
  repairedDemoStacks.map((stack) => stack.payload.modifiers),
  [
    ["route:strategy", "expand", "remember"],
    ["route:product", "transform:design"],
    ["protect", "compress"],
  ],
);
assert.equal(
  repairedDemo.reflections.some((reflection) => reflection.payload.interpreter === "custom-interpreter"),
  false,
  "demo seeding must not attach seeded reflections to custom user stacks",
);
assert.equal(
  repairedDemo.reflections.length,
  3,
  "demo seeding must create exactly one seeded reflection for each demo stack",
);

const productForWrongInterpreter = await queryMemoryNodesByModifier("route:product", 25, {
  interpreter: "wrong-interpreter",
});
assert.equal(
  productForWrongInterpreter.stacks.length,
  0,
  "local modifier search must honor interpreter filters like live mode",
);

console.log("dashboard local mode ok");
