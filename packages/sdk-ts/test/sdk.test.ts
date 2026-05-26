import assert from "node:assert/strict";

import { ModifierVault } from "../src/index";

const createdAt = "2026-05-26T00:00:00.000Z";
const vault = ModifierVault.local({ owner: "0xowner", creator: "0xcreator" });

const memory = await vault.createMemory({
  title: "Tradeoff delay",
  domain: "personal-cognition",
  contentMode: "plaintext",
  content: "I avoid decisions until I can model tradeoffs.",
  createdAt,
});

const stackA = await vault.attachModifierStack({
  memoryKey: memory.key,
  modifiers: ["route:strategy", "expand", "remember"],
  interpreter: "beaconsmith:v1",
  authority: "user",
  context: "Strategy reuse.",
  createdAt,
});

const stackB = await vault.attachModifierStack({
  memoryKey: memory.key,
  modifiers: ["route:product", "transform:design"],
  interpreter: "beaconsmith:v1",
  authority: "agent",
  context: "Product design reuse.",
  createdAt,
});

const reflection = await vault.createReflection({
  memoryKey: memory.key,
  modifierStackKey: stackA.key,
  lineageDepth: 0,
  model: "local-reflector",
  interpreter: "beaconsmith:v1",
  contentMode: "plaintext",
  reflection: "As strategy, delay is useful while options are still changing.",
  createdAt,
});

assert.equal(reflection.payload.promptHash.length, 64);
assert.equal(reflection.payload.outputHash.length, 64);

const graph = await vault.queryGraph(memory.key);
assert.equal(graph.memory.key, memory.key);
assert.equal(graph.stacks.length, 2);
assert.equal(graph.reflections.length, 1);

const byModifier = await vault.searchByModifier("route:product");
assert.deepEqual(byModifier.map((record) => record.key), [stackB.key]);

const byInterpreter = await vault.searchByInterpreter("beaconsmith:v1");
assert.equal(byInterpreter.stacks.length, 2);
assert.equal(byInterpreter.reflections.length, 1);

const exported = await vault.exportGraph(memory.key);
assert.equal(exported.memory.key, memory.key);
assert.equal(exported.reflections[0].payload.memoryKey, memory.key);

console.log("sdk tests ok");
