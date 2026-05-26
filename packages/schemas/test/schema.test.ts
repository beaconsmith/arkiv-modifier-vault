import assert from "node:assert/strict";

import {
  PROJECT_ATTRIBUTE,
  SCHEMA_VERSION,
  agentReflectionAttributes,
  createAgentReflectionPayload,
  createMemoryNodePayload,
  createModifierStackPayload,
  memoryNodeAttributes,
  modifierAttributeKey,
  modifierStackAttributes,
  validateAgentReflectionPayload,
  validateMemoryNodePayload,
  validateModifierStackPayload,
} from "../src/index";

const createdAt = "2026-05-26T00:00:00.000Z";

const memory = createMemoryNodePayload({
  title: "Decision delay pattern",
  domain: "personal-cognition",
  contentMode: "plaintext",
  content: "I avoid decisions until I can model tradeoffs.",
  createdAt,
});

const secretMemory = "SECRET phrase that must not leave the encrypted envelope";
const encryptedMemory = createMemoryNodePayload({
  title: "Encrypted memory",
  domain: "personal-cognition",
  contentMode: "encrypted",
  content: secretMemory,
  encryptedContent: {
    algorithm: "AES-GCM",
    kdf: "PBKDF2",
    hash: "SHA-256",
    iterations: 250000,
    salt: "salt",
    iv: "iv",
    ciphertext: "opaque-ciphertext",
  },
  createdAt,
});
assert.equal(
  JSON.stringify({ ...encryptedMemory, encryptedContent: undefined }).includes(secretMemory),
  false,
  "encrypted MemoryNode builder must not mirror raw content into contentPreview",
);

const metadataOnlyMemory = createMemoryNodePayload({
  title: "Metadata-only memory",
  domain: "personal-cognition",
  contentMode: "metadata-only",
  content: secretMemory,
  createdAt,
});
assert.equal(
  JSON.stringify(metadataOnlyMemory).includes(secretMemory),
  false,
  "metadata-only MemoryNode builder must not mirror raw content into contentPreview",
);

assert.equal(PROJECT_ATTRIBUTE, "modifiervault_beaconsmith_ethns_2026");
assert.equal(SCHEMA_VERSION, "3");
assert.equal(memory.schemaVersion, "3");
assert.equal(memory.entityType, "MemoryNode");
assert.equal("project" in memory, false, "project belongs in attributes, not payload");
assert.equal(validateMemoryNodePayload(memory).success, true);
assert.equal(
  validateMemoryNodePayload({ ...memory, project: PROJECT_ATTRIBUTE }).success,
  false,
  "payload schemas must reject metadata fields that belong in Arkiv attributes",
);
assert.equal(
  validateMemoryNodePayload({ ...memory, modifierList: "route:strategy" }).success,
  false,
  "payload schemas must reject query helper fields that belong in Arkiv attributes",
);
assert.equal(
  validateMemoryNodePayload({
    ...memory,
    contentMode: "encrypted",
    content: "",
    encryptedContent: {
      algorithm: "AES-GCM",
      kdf: "PBKDF2",
      hash: "SHA-256",
      iterations: 250000,
      salt: "salt",
      iv: "iv",
      ciphertext: "ciphertext",
      project: PROJECT_ATTRIBUTE,
    },
  }).success,
  false,
  "encrypted envelopes must reject unknown fields",
);
assert.equal(
  validateMemoryNodePayload({
    ...memory,
    contentMode: "encrypted",
    encryptedContent: {
      algorithm: "AES-GCM",
      kdf: "PBKDF2",
      hash: "SHA-256",
      iterations: 250000,
      salt: "salt",
      iv: "iv",
      ciphertext: "ciphertext",
    },
  }).success,
  false,
  "encrypted MemoryNode payloads must not include raw content, even as an empty string",
);
assert.equal(
  validateMemoryNodePayload({
    ...memory,
    contentMode: "metadata-only",
    content: "",
  }).success,
  false,
  "metadata-only MemoryNode payloads must not include raw content, even as an empty string",
);

const memoryAttributes = memoryNodeAttributes(memory);
assert.deepEqual(
  memoryAttributes.filter((attribute) => attribute.key === "project"),
  [{ key: "project", value: PROJECT_ATTRIBUTE }],
);
assert.deepEqual(
  memoryAttributes.filter((attribute) => attribute.key === "schemaVersion"),
  [{ key: "schemaVersion", value: SCHEMA_VERSION }],
);
assert.deepEqual(
  memoryAttributes.filter((attribute) => attribute.key === "contentMode"),
  [{ key: "contentMode", value: "plaintext" }],
);

const stack = createModifierStackPayload({
  memoryKey: "local-memory-1",
  modifiers: ["route:strategy", "expand", "remember"],
  interpreter: "beaconsmith:v1",
  authority: "user",
  context: "Use strategy framing.",
  createdAt,
});

assert.equal(stack.schemaVersion, "3");
assert.equal(validateModifierStackPayload(stack).success, true);
assert.equal("modifierList" in Object.fromEntries(modifierStackAttributes(stack).map((a) => [a.key, a.value])), false);
assert.deepEqual(stack.modifiers, ["route:strategy", "expand", "remember"]);

const stackAttributes = modifierStackAttributes(stack);
for (const modifier of stack.modifiers) {
  assert.deepEqual(
    stackAttributes.filter((attribute) => attribute.key === modifierAttributeKey(modifier)),
    [{ key: modifierAttributeKey(modifier), value: "true" }],
  );
}

const reflection = createAgentReflectionPayload({
  memoryKey: "local-memory-1",
  modifierStackKey: "local-stack-1",
  previousReflectionKey: "local-reflection-0",
  lineageDepth: 1,
  model: "local-reflector",
  interpreter: "beaconsmith:v1",
  contentMode: "plaintext",
  reflection: "The user delays commitment to preserve tradeoff optionality.",
  promptHash: "prompt-hash",
  outputHash: "output-hash",
  createdAt,
});

assert.equal(validateAgentReflectionPayload(reflection).success, true);
assert.equal(reflection.schemaVersion, "3");
assert.equal(reflection.promptHash, "prompt-hash");
assert.equal(reflection.outputHash, "output-hash");
assert.equal(
  validateAgentReflectionPayload({
    ...reflection,
    contentMode: "encrypted",
    reflection: "",
    encryptedReflection: {
      algorithm: "AES-GCM",
      kdf: "PBKDF2",
      hash: "SHA-256",
      iterations: 250000,
      salt: "salt",
      iv: "iv",
      ciphertext: "ciphertext",
    },
  }).success,
  false,
  "encrypted AgentReflection payloads must not include raw reflection, even as an empty string",
);
assert.equal(
  validateAgentReflectionPayload({
    ...reflection,
    contentMode: "metadata-only",
    reflection: "",
  }).success,
  false,
  "metadata-only AgentReflection payloads must not include raw reflection, even as an empty string",
);
assert.deepEqual(
  agentReflectionAttributes(reflection).filter((attribute) => attribute.key === "previousReflectionKey"),
  [{ key: "previousReflectionKey", value: "local-reflection-0" }],
);

console.log("schema tests ok");
