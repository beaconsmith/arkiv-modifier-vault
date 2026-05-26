import { ModifierVault } from "@modifiervault/sdk-ts";

async function main() {
  const vault = ModifierVault.local({ owner: "local-owner", creator: "local-example" });

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

  const graph = await vault.exportGraph(memory.key);
  console.log(JSON.stringify(graph, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
