import { createHash } from "node:crypto";

import {
  PROJECT_ATTRIBUTE,
  SCHEMA_VERSION,
  agentReflectionAttributes,
  createAgentReflectionPayload,
  createMemoryNodePayload,
  createModifierStackPayload,
  getMemoryDisplayContent,
  getReflectionDisplayText,
  memoryNodeAttributes,
  modifierAttributeKey,
  modifierStackAttributes,
  validateAgentReflectionPayload,
  validateMemoryNodePayload,
  validateModifierStackPayload,
  type AgentReflectionPayload,
  type ArkivAttribute,
  type ArkivEntityRecord,
  type CreateAgentReflectionPayloadInput,
  type CreateMemoryNodePayloadInput,
  type CreateModifierStackPayloadInput,
  type MemoryNodePayload,
  type ModifierStackPayload,
  type ModifierVaultPayload,
} from "@modifiervault/schemas";

export * from "@modifiervault/schemas";

export type EntityDraft<T extends ModifierVaultPayload = ModifierVaultPayload> = {
  payload: T;
  attributes: ArkivAttribute[];
  contentType: "application/json";
};

export type MemoryGraph = {
  memory: ArkivEntityRecord<MemoryNodePayload>;
  stacks: Array<ArkivEntityRecord<ModifierStackPayload>>;
  reflections: Array<ArkivEntityRecord<AgentReflectionPayload>>;
};

export type MemoryGraphExport = MemoryGraph & {
  project: typeof PROJECT_ATTRIBUTE;
  schemaVersion: typeof SCHEMA_VERSION;
  exportedAt: string;
};

export type MemoryGraphValidation = {
  valid: boolean;
  issues: string[];
};

export interface MemoryStore {
  create<T extends ModifierVaultPayload>(draft: EntityDraft<T>): Promise<ArkivEntityRecord<T>>;
  get<T extends ModifierVaultPayload>(key: string): Promise<ArkivEntityRecord<T> | null>;
  query<T extends ModifierVaultPayload>(
    filters: Record<string, string | number | boolean>,
  ): Promise<Array<ArkivEntityRecord<T>>>;
}

export type LocalMemoryStoreOptions = {
  owner?: string;
  creator?: string;
};

export class LocalMemoryStore implements MemoryStore {
  private readonly records = new Map<string, ArkivEntityRecord>();
  private readonly owner?: string;
  private readonly creator?: string;
  private sequence = 0;

  constructor(options: LocalMemoryStoreOptions = {}) {
    this.owner = options.owner;
    this.creator = options.creator;
  }

  async create<T extends ModifierVaultPayload>(draft: EntityDraft<T>): Promise<ArkivEntityRecord<T>> {
    this.sequence += 1;
    const key = `local-${draft.payload.entityType.toLowerCase()}-${this.sequence}`;
    const record: ArkivEntityRecord<T> = {
      key,
      owner: this.owner,
      creator: this.creator,
      contentType: draft.contentType,
      attributes: draft.attributes,
      payload: draft.payload,
    };

    this.records.set(key, record);
    return record;
  }

  async get<T extends ModifierVaultPayload>(key: string): Promise<ArkivEntityRecord<T> | null> {
    return (this.records.get(key) as ArkivEntityRecord<T> | undefined) ?? null;
  }

  async query<T extends ModifierVaultPayload>(
    filters: Record<string, string | number | boolean>,
  ): Promise<Array<ArkivEntityRecord<T>>> {
    return Array.from(this.records.values())
      .filter((record) =>
        Object.entries(filters).every(([key, value]) =>
          record.attributes.some(
            (attribute) => attribute.key === key && String(attribute.value) === String(value),
          ),
        ),
      )
      .sort((a, b) => b.payload.createdAt.localeCompare(a.payload.createdAt)) as Array<
      ArkivEntityRecord<T>
    >;
  }
}

export function hashString(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export type EncryptedPayloadEnvelope = {
  algorithm: "AES-GCM";
  kdf: "PBKDF2";
  hash: "SHA-256";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
};

const ENCRYPTION_ITERATIONS = 250_000;
const SALT_BYTES = 16;
const IV_BYTES = 12;

function getCrypto() {
  const cryptoImpl = globalThis.crypto;
  if (!cryptoImpl?.subtle) {
    throw new Error("Web Crypto is not available in this runtime.");
  }
  return cryptoImpl;
}

function bytesToBase64(bytes: Uint8Array) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(value, "base64"));
  }

  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function deriveAesKey(passphrase: string, salt: Uint8Array) {
  if (!passphrase.trim()) {
    throw new Error("A passphrase is required for encrypted payloads.");
  }

  const cryptoImpl = getCrypto();
  const encoder = new TextEncoder();
  const material = await cryptoImpl.subtle.importKey(
    "raw",
    toArrayBuffer(encoder.encode(passphrase)),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return cryptoImpl.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: toArrayBuffer(salt),
      iterations: ENCRYPTION_ITERATIONS,
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptString(
  plaintext: string,
  passphrase: string,
): Promise<EncryptedPayloadEnvelope> {
  const cryptoImpl = getCrypto();
  const salt = cryptoImpl.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = cryptoImpl.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveAesKey(passphrase, salt);
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await cryptoImpl.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(encoded),
  );

  return {
    algorithm: "AES-GCM",
    kdf: "PBKDF2",
    hash: "SHA-256",
    iterations: ENCRYPTION_ITERATIONS,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

export async function decryptString(envelope: EncryptedPayloadEnvelope, passphrase: string) {
  if (
    envelope.algorithm !== "AES-GCM" ||
    envelope.kdf !== "PBKDF2" ||
    envelope.hash !== "SHA-256" ||
    envelope.iterations !== ENCRYPTION_ITERATIONS
  ) {
    throw new Error("Unsupported encrypted payload format.");
  }

  const cryptoImpl = getCrypto();
  const salt = base64ToBytes(envelope.salt);
  const iv = base64ToBytes(envelope.iv);
  const key = await deriveAesKey(passphrase, salt);
  const plaintext = await cryptoImpl.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(base64ToBytes(envelope.ciphertext)),
  );

  return new TextDecoder().decode(plaintext);
}

export function createMemoryNode(input: CreateMemoryNodePayloadInput): EntityDraft<MemoryNodePayload> {
  const payload = createMemoryNodePayload(input);
  const validation = validateMemoryNodePayload(payload);
  if (!validation.success) {
    throw new Error(validation.error.issues.map((issue) => issue.message).join("; "));
  }

  return {
    payload,
    attributes: memoryNodeAttributes(payload),
    contentType: "application/json",
  };
}

export function attachModifierStack(
  input: CreateModifierStackPayloadInput,
): EntityDraft<ModifierStackPayload> {
  const payload = createModifierStackPayload(input);
  const validation = validateModifierStackPayload(payload);
  if (!validation.success) {
    throw new Error(validation.error.issues.map((issue) => issue.message).join("; "));
  }

  return {
    payload,
    attributes: modifierStackAttributes(payload),
    contentType: "application/json",
  };
}

export function createAgentReflection(
  input: CreateAgentReflectionPayloadInput,
): EntityDraft<AgentReflectionPayload> {
  const payload = createAgentReflectionPayload(input);
  const validation = validateAgentReflectionPayload(payload);
  if (!validation.success) {
    throw new Error(validation.error.issues.map((issue) => issue.message).join("; "));
  }

  return {
    payload,
    attributes: agentReflectionAttributes(payload),
    contentType: "application/json",
  };
}

export async function queryMemoryGraph(store: MemoryStore, memoryKey: string): Promise<MemoryGraph> {
  const memory = await store.get<MemoryNodePayload>(memoryKey);
  if (!memory) {
    throw new Error(`MemoryNode not found for key: ${memoryKey}`);
  }

  const [stacks, reflections] = await Promise.all([
    store.query<ModifierStackPayload>({
      project: PROJECT_ATTRIBUTE,
      schemaVersion: SCHEMA_VERSION,
      entityType: "ModifierStack",
      memoryKey,
    }),
    store.query<AgentReflectionPayload>({
      project: PROJECT_ATTRIBUTE,
      schemaVersion: SCHEMA_VERSION,
      entityType: "AgentReflection",
      memoryKey,
    }),
  ]);

  return { memory, stacks, reflections };
}

export function validateMemoryGraph(graph: MemoryGraph): MemoryGraphValidation {
  const issues: string[] = [];
  const stackKeys = new Set(graph.stacks.map((stack) => stack.key));

  if (graph.memory.payload.entityType !== "MemoryNode") {
    issues.push("Graph root is not a MemoryNode.");
  }

  for (const stack of graph.stacks) {
    if (stack.payload.memoryKey !== graph.memory.key) {
      issues.push(`ModifierStack ${stack.key} points at ${stack.payload.memoryKey}.`);
    }
  }

  for (const reflection of graph.reflections) {
    if (reflection.payload.memoryKey !== graph.memory.key) {
      issues.push(`AgentReflection ${reflection.key} points at ${reflection.payload.memoryKey}.`);
    }

    if (!stackKeys.has(reflection.payload.modifierStackKey)) {
      issues.push(
        `AgentReflection ${reflection.key} points at missing ModifierStack ${reflection.payload.modifierStackKey}.`,
      );
    }

    if (!reflection.payload.promptHash || !reflection.payload.outputHash) {
      issues.push(`AgentReflection ${reflection.key} is missing lineage hashes.`);
    }
  }

  return { valid: issues.length === 0, issues };
}

export function exportMemoryGraph(graph: MemoryGraph): MemoryGraphExport {
  return {
    project: PROJECT_ATTRIBUTE,
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    memory: graph.memory,
    stacks: graph.stacks,
    reflections: graph.reflections,
  };
}

export function buildPromptFromMemoryGraph(
  graph: MemoryGraph,
  options: { modifierStackKey?: string } = {},
) {
  const stacks = options.modifierStackKey
    ? graph.stacks.filter((stack) => stack.key === options.modifierStackKey)
    : graph.stacks;
  const priorReflections = graph.reflections
    .slice()
    .sort((a, b) => a.payload.lineageDepth - b.payload.lineageDepth)
    .map((reflection) => getReflectionDisplayText(reflection.payload))
    .filter(Boolean)
    .slice(-5);

  return [
    "You are generating an AgentReflection for ModifierVault.",
    "ModifierVault is user-owned AI memory infrastructure, represented as a portable semantic graph.",
    "",
    `MemoryKey: ${graph.memory.key}`,
    `Memory: ${getMemoryDisplayContent(graph.memory.payload)}`,
    "",
    "ModifierStacks:",
    ...stacks.map((stack) =>
      [
        `- Key: ${stack.key}`,
        `  Modifiers: ${stack.payload.modifiers.join(" -> ")}`,
        `  Interpreter: ${stack.payload.interpreter}`,
        `  Authority: ${stack.payload.authority}`,
        `  Context: ${stack.payload.context}`,
      ].join("\n"),
    ),
    "",
    priorReflections.length
      ? `Prior reflections:\n${priorReflections.map((item, index) => `${index + 1}. ${item}`).join("\n")}`
      : "Prior reflections: none",
    "",
    "Return a compact semantic interpretation artifact. Do not mutate the base memory.",
  ].join("\n");
}

export async function searchStacksByModifier(store: MemoryStore, modifier: string) {
  return store.query<ModifierStackPayload>({
    project: PROJECT_ATTRIBUTE,
    schemaVersion: SCHEMA_VERSION,
    entityType: "ModifierStack",
    [modifierAttributeKey(modifier)]: "true",
  });
}

export async function searchByInterpreter(store: MemoryStore, interpreter: string) {
  const [stacks, reflections] = await Promise.all([
    store.query<ModifierStackPayload>({
      project: PROJECT_ATTRIBUTE,
      schemaVersion: SCHEMA_VERSION,
      entityType: "ModifierStack",
      interpreter,
    }),
    store.query<AgentReflectionPayload>({
      project: PROJECT_ATTRIBUTE,
      schemaVersion: SCHEMA_VERSION,
      entityType: "AgentReflection",
      interpreter,
    }),
  ]);

  return { stacks, reflections };
}
