import type { Attribute } from "@arkiv-network/sdk";

import { DEMO_MODIFIERS, PROJECT_ATTRIBUTE } from "./constants";

export type EntityType = "MemoryNode" | "ModifierStack" | "AgentReflection";
export type Visibility = "private" | "shared" | "public";

export type MemoryNodePayload = {
  entityType: "MemoryNode";
  project: typeof PROJECT_ATTRIBUTE;
  title: string;
  content: string;
  domain: string;
  visibility: Visibility;
  createdAt: string;
};

export type ModifierStackPayload = {
  entityType: "ModifierStack";
  project: typeof PROJECT_ATTRIBUTE;
  memoryKey: string;
  modifiers: string[];
  interpreter: string;
  context: string;
  authority: string;
  createdAt: string;
};

export type AgentReflectionPayload = {
  entityType: "AgentReflection";
  project: typeof PROJECT_ATTRIBUTE;
  memoryKey: string;
  modifierStackKey: string;
  reflection: string;
  model: string;
  createdAt: string;
};

export type ModifierVaultPayload =
  | MemoryNodePayload
  | ModifierStackPayload
  | AgentReflectionPayload;

export type ArkivEntityRecord<T extends ModifierVaultPayload = ModifierVaultPayload> = {
  key: string;
  owner?: string;
  creator?: string;
  contentType?: string;
  createdAtBlock?: bigint;
  lastModifiedAtBlock?: bigint;
  attributes: Attribute[];
  payload: T;
  txHash?: string;
};

export type CreateMemoryInput = {
  title: string;
  content: string;
  domain: string;
  visibility: Visibility;
};

export type CreateModifierStackInput = {
  memoryKey: string;
  modifiers: string[];
  interpreter: string;
  context: string;
  authority: string;
};

export type CreateAgentReflectionInput = {
  memoryKey: string;
  modifierStackKey: string;
  reflection: string;
  model: string;
};

export function normalizeModifier(modifier: string) {
  return modifier.trim().replace(/\s+/g, "-").toLowerCase();
}

export function parseModifierInput(value: string) {
  const parsed = value
    .split(/[\n,]+/)
    .map(normalizeModifier)
    .filter(Boolean);

  return Array.from(new Set(parsed));
}

export function modifierAttributeKey(modifier: string) {
  return `modifier__${normalizeModifier(modifier).replace(/[^a-z0-9_]/g, "_")}`;
}

export function createMemoryNodePayload(input: CreateMemoryInput): MemoryNodePayload {
  return {
    entityType: "MemoryNode",
    project: PROJECT_ATTRIBUTE,
    title: input.title.trim() || "Untitled MemoryNode",
    content: input.content.trim(),
    domain: input.domain.trim() || "general",
    visibility: input.visibility,
    createdAt: new Date().toISOString(),
  };
}

export function createModifierStackPayload(
  input: CreateModifierStackInput,
): ModifierStackPayload {
  const modifiers = input.modifiers.length ? input.modifiers : DEMO_MODIFIERS;

  return {
    entityType: "ModifierStack",
    project: PROJECT_ATTRIBUTE,
    memoryKey: input.memoryKey,
    modifiers: modifiers.map(normalizeModifier),
    interpreter: input.interpreter.trim() || "ModifierVault demo interpreter",
    context: input.context.trim() || "MVP demo flow",
    authority: input.authority.trim() || "wallet-owner",
    createdAt: new Date().toISOString(),
  };
}

export function createAgentReflectionPayload(
  input: CreateAgentReflectionInput,
): AgentReflectionPayload {
  return {
    entityType: "AgentReflection",
    project: PROJECT_ATTRIBUTE,
    memoryKey: input.memoryKey,
    modifierStackKey: input.modifierStackKey,
    reflection: input.reflection.trim(),
    model: input.model.trim() || "agent-simulated",
    createdAt: new Date().toISOString(),
  };
}

function baseAttributes(payload: ModifierVaultPayload): Attribute[] {
  return [
    { key: "project", value: PROJECT_ATTRIBUTE },
    { key: "entityType", value: payload.entityType },
    { key: "createdAt", value: payload.createdAt },
  ];
}

export function memoryNodeAttributes(payload: MemoryNodePayload): Attribute[] {
  return [
    ...baseAttributes(payload),
    { key: "domain", value: payload.domain },
    { key: "visibility", value: payload.visibility },
    { key: "title", value: payload.title },
  ];
}

export function modifierStackAttributes(payload: ModifierStackPayload): Attribute[] {
  return [
    ...baseAttributes(payload),
    { key: "memoryKey", value: payload.memoryKey },
    { key: "authority", value: payload.authority },
    { key: "modifierList", value: payload.modifiers.join(",") },
    ...payload.modifiers.map((modifier) => ({
      key: modifierAttributeKey(modifier),
      value: "true",
    })),
  ];
}

export function agentReflectionAttributes(payload: AgentReflectionPayload): Attribute[] {
  return [
    ...baseAttributes(payload),
    { key: "memoryKey", value: payload.memoryKey },
    { key: "modifierStackKey", value: payload.modifierStackKey },
    { key: "model", value: payload.model },
  ];
}

export function isMemoryNodePayload(
  payload: ModifierVaultPayload | unknown,
): payload is MemoryNodePayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "entityType" in payload &&
    payload.entityType === "MemoryNode" &&
    "project" in payload &&
    payload.project === PROJECT_ATTRIBUTE
  );
}

export function isModifierStackPayload(
  payload: ModifierVaultPayload | unknown,
): payload is ModifierStackPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "entityType" in payload &&
    payload.entityType === "ModifierStack" &&
    "project" in payload &&
    payload.project === PROJECT_ATTRIBUTE
  );
}

export function isAgentReflectionPayload(
  payload: ModifierVaultPayload | unknown,
): payload is AgentReflectionPayload {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "entityType" in payload &&
    payload.entityType === "AgentReflection" &&
    "project" in payload &&
    payload.project === PROJECT_ATTRIBUTE
  );
}
