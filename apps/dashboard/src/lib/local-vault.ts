import {
  DEMO_INTERPRETER,
  DEMO_MEMORY_CONTENT,
  DEMO_MEMORY_DOMAIN,
  DEMO_MEMORY_TITLE,
  PROJECT_ATTRIBUTE,
  SCHEMA_VERSION,
} from "./constants";
import { hashString } from "./crypto";
import {
  agentReflectionAttributes,
  createAgentReflectionPayload,
  createMemoryNodePayload,
  createModifierStackPayload,
  isAgentReflectionPayload,
  isMemoryNodePayload,
  isModifierStackPayload,
  memoryNodeAttributes,
  modifierAttributeKey,
  modifierStackAttributes,
  type AgentReflectionPayload,
  type ArkivEntityRecord,
  type CreateAgentReflectionInput,
  type CreateMemoryInput,
  type CreateModifierStackInput,
  type MemoryNodePayload,
  type ModifierStackPayload,
  type ModifierVaultPayload,
} from "./schema";

type LocalVaultState = {
  sequence: number;
  records: ArkivEntityRecord[];
};

const STORAGE_KEY = "modifiervault.local.v3";
let memoryState: LocalVaultState | null = null;

function emptyState(): LocalVaultState {
  return { sequence: 0, records: [] };
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function loadState(): LocalVaultState {
  if (!canUseLocalStorage()) {
    memoryState ??= emptyState();
    return memoryState;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return emptyState();

  try {
    const parsed = JSON.parse(raw) as LocalVaultState;
    return {
      sequence: Number.isFinite(parsed.sequence) ? parsed.sequence : 0,
      records: Array.isArray(parsed.records) ? parsed.records : [],
    };
  } catch {
    return emptyState();
  }
}

function saveState(state: LocalVaultState) {
  memoryState = state;
  if (canUseLocalStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

function nextLocalKey(state: LocalVaultState, entityType: ModifierVaultPayload["entityType"]) {
  state.sequence += 1;
  return `local-${entityType.toLowerCase()}-${state.sequence.toString().padStart(4, "0")}`;
}

function createLocalRecord<T extends ModifierVaultPayload>(
  state: LocalVaultState,
  payload: T,
  attributes: ArkivEntityRecord<T>["attributes"],
): ArkivEntityRecord<T> {
  const key = nextLocalKey(state, payload.entityType);
  return {
    key,
    owner: "local-owner",
    creator: "local-browser",
    contentType: "application/json",
    attributes,
    payload,
    txHash: `local-tx-${state.sequence.toString().padStart(4, "0")}`,
  };
}

function upsertRecord(state: LocalVaultState, record: ArkivEntityRecord) {
  state.records = [record, ...state.records.filter((existing) => existing.key !== record.key)];
  saveState(state);
}

function queryRecords<T extends ModifierVaultPayload>(
  filters: Record<string, string | number>,
  options: { owner?: string; creator?: string; limit?: number } = {},
) {
  const records = loadState().records
    .filter((record) => {
      if (options.owner && record.owner !== options.owner) return false;
      if (options.creator && record.creator !== options.creator) return false;

      return Object.entries(filters).every(([key, value]) =>
        record.attributes.some(
          (attribute) => attribute.key === key && String(attribute.value) === String(value),
        ),
      );
    })
    .sort((a, b) => b.payload.createdAt.localeCompare(a.payload.createdAt));

  return records.slice(0, options.limit ?? records.length) as Array<ArkivEntityRecord<T>>;
}

function outputHashSeed(input: CreateAgentReflectionInput) {
  if (input.contentMode === "encrypted" && input.encryptedReflection) {
    return JSON.stringify(input.encryptedReflection);
  }

  return input.reflection ?? "";
}

async function reflectionHashes(input: CreateAgentReflectionInput) {
  const outputSeed = outputHashSeed(input);
  const promptSeed = [
    input.memoryKey,
    input.modifierStackKey,
    input.previousReflectionKey ?? "",
    input.lineageDepth ?? 0,
    input.model,
    input.interpreter ?? "",
    outputSeed,
  ].join("\n");

  return {
    promptHash: input.promptHash ?? (await hashString(promptSeed)),
    outputHash: input.outputHash ?? (await hashString(outputSeed)),
  };
}

export function resetLocalVaultForTests() {
  memoryState = emptyState();
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export async function localCreateMemoryNode(input: CreateMemoryInput) {
  const state = loadState();
  const payload = createMemoryNodePayload(input);
  const record = createLocalRecord(state, payload, memoryNodeAttributes(payload));
  upsertRecord(state, record);

  return {
    entityKey: record.key,
    txHash: record.txHash,
    record,
  };
}

export async function localCreateModifierStack(input: CreateModifierStackInput) {
  const state = loadState();
  const payload = createModifierStackPayload(input);
  const record = createLocalRecord(state, payload, modifierStackAttributes(payload));
  upsertRecord(state, record);

  return {
    entityKey: record.key,
    txHash: record.txHash,
    record,
  };
}

export async function localCreateAgentReflection(input: CreateAgentReflectionInput) {
  const state = loadState();
  const hashes = await reflectionHashes(input);
  const payload = createAgentReflectionPayload({
    ...input,
    promptHash: hashes.promptHash,
    outputHash: hashes.outputHash,
  });
  const record = createLocalRecord(state, payload, agentReflectionAttributes(payload));
  upsertRecord(state, record);

  return {
    entityKey: record.key,
    txHash: record.txHash,
    record,
  };
}

export async function localReadEntityByKey<T extends ModifierVaultPayload>(key: string) {
  const record = loadState().records.find((candidate) => candidate.key === key);
  if (!record) {
    throw new Error(`Local ModifierVault entity not found: ${key}`);
  }

  return record as ArkivEntityRecord<T>;
}

export async function localReadMemoryNode(key: string) {
  const record = await localReadEntityByKey<MemoryNodePayload>(key);
  if (!isMemoryNodePayload(record.payload)) {
    throw new Error("Local entity exists, but it is not a ModifierVault MemoryNode.");
  }

  return record;
}

export async function localQueryMemoryNodes(options: {
  domain?: string;
  contentMode?: string;
  owner?: string;
  creator?: string;
  limit?: number;
} = {}) {
  await seedLocalDemoGraph();
  const filters: Record<string, string> = {
    project: PROJECT_ATTRIBUTE,
    schemaVersion: SCHEMA_VERSION,
    entityType: "MemoryNode",
  };

  if (options.domain?.trim()) filters.domain = options.domain.trim();
  if (options.contentMode) filters.contentMode = options.contentMode;

  return queryRecords<MemoryNodePayload>(filters, options).filter((record) =>
    isMemoryNodePayload(record.payload),
  );
}

export async function localQueryModifierStacks(options: {
  memoryKey?: string;
  modifier?: string;
  interpreter?: string;
  authority?: string;
  limit?: number;
} = {}) {
  await seedLocalDemoGraph();
  const filters: Record<string, string> = {
    project: PROJECT_ATTRIBUTE,
    schemaVersion: SCHEMA_VERSION,
    entityType: "ModifierStack",
  };

  if (options.memoryKey) filters.memoryKey = options.memoryKey;
  if (options.modifier) filters[modifierAttributeKey(options.modifier)] = "true";
  if (options.interpreter?.trim()) filters.interpreter = options.interpreter.trim();
  if (options.authority?.trim()) filters.authority = options.authority.trim();

  return queryRecords<ModifierStackPayload>(filters, { limit: options.limit }).filter((record) =>
    isModifierStackPayload(record.payload),
  );
}

export async function localQueryAgentReflections(options: {
  memoryKey?: string;
  modifierStackKey?: string;
  interpreter?: string;
  previousReflectionKey?: string;
  limit?: number;
} = {}) {
  await seedLocalDemoGraph();
  const filters: Record<string, string> = {
    project: PROJECT_ATTRIBUTE,
    schemaVersion: SCHEMA_VERSION,
    entityType: "AgentReflection",
  };

  if (options.memoryKey) filters.memoryKey = options.memoryKey;
  if (options.modifierStackKey) filters.modifierStackKey = options.modifierStackKey;
  if (options.interpreter?.trim()) filters.interpreter = options.interpreter.trim();
  if (options.previousReflectionKey) filters.previousReflectionKey = options.previousReflectionKey;

  return queryRecords<AgentReflectionPayload>(filters, { limit: options.limit }).filter((record) =>
    isAgentReflectionPayload(record.payload),
  );
}

export async function localQueryMemoryNodesByModifier(
  modifier: string,
  limit = 25,
  options: Omit<Parameters<typeof localQueryModifierStacks>[0], "modifier" | "limit"> = {},
) {
  const stacks = await localQueryModifierStacks({ ...options, modifier, limit });
  const keys = Array.from(new Set(stacks.map((stack) => stack.payload.memoryKey)));
  const memories = await Promise.all(keys.map((key) => localReadMemoryNode(key)));

  return { stacks, memories };
}

export async function localReadMemoryGraph(memoryKey: string) {
  await seedLocalDemoGraph();
  return readLocalMemoryGraphUnsafe(memoryKey);
}

async function readLocalMemoryGraphUnsafe(memoryKey: string) {
  const memory = await localReadMemoryNode(memoryKey);
  const stacks = queryRecords<ModifierStackPayload>({
    project: PROJECT_ATTRIBUTE,
    schemaVersion: SCHEMA_VERSION,
    entityType: "ModifierStack",
    memoryKey,
  })
    .filter((record) => isModifierStackPayload(record.payload))
    .sort((left, right) => left.key.localeCompare(right.key));
  const reflections = queryRecords<AgentReflectionPayload>({
    project: PROJECT_ATTRIBUTE,
    schemaVersion: SCHEMA_VERSION,
    entityType: "AgentReflection",
    memoryKey,
  })
    .filter((record) => isAgentReflectionPayload(record.payload))
    .sort(
      (left, right) =>
        left.payload.lineageDepth - right.payload.lineageDepth ||
        left.key.localeCompare(right.key),
    );

  return { memory, stacks, reflections };
}

export async function seedLocalDemoGraph() {
  const createdAt = "2026-05-26T00:00:00.000Z";
  const stackInputs: Array<Omit<CreateModifierStackInput, "memoryKey" | "createdAt">> = [
    {
      modifiers: ["route:strategy", "expand", "remember"],
      interpreter: DEMO_INTERPRETER,
      authority: "user",
      context: "Interpret the memory as a reusable decision strategy.",
    },
    {
      modifiers: ["route:product", "transform:design"],
      interpreter: DEMO_INTERPRETER,
      authority: "agent",
      context: "Interpret the memory as a product design posture.",
    },
    {
      modifiers: ["protect", "compress"],
      interpreter: DEMO_INTERPRETER,
      authority: "shared",
      context: "Preserve only the smallest safe summary of the memory.",
    },
  ];

  const existing = loadState().records.find(
    (record) =>
      record.payload.entityType === "MemoryNode" &&
      record.payload.schemaVersion === SCHEMA_VERSION &&
      "title" in record.payload &&
      record.payload.title === DEMO_MEMORY_TITLE &&
      record.payload.domain === DEMO_MEMORY_DOMAIN &&
      record.payload.contentMode === "plaintext" &&
      record.payload.content === DEMO_MEMORY_CONTENT,
  ) as ArkivEntityRecord<MemoryNodePayload> | undefined;

  const memory =
    existing ??
    (
      await localCreateMemoryNode({
        title: DEMO_MEMORY_TITLE,
        domain: DEMO_MEMORY_DOMAIN,
        contentMode: "plaintext",
        content: DEMO_MEMORY_CONTENT,
        createdAt,
      })
    ).record;

  const currentGraph = await readLocalMemoryGraphUnsafe(memory.key);
  const stacks = [...currentGraph.stacks];
  const demoStacks: Array<ArkivEntityRecord<ModifierStackPayload>> = [];

  for (const input of stackInputs) {
    const existingStack = stacks.find(
      (stack) =>
        stack.payload.interpreter === input.interpreter &&
        stack.payload.authority === input.authority &&
        sameModifiers(stack.payload.modifiers, input.modifiers),
    );

    if (existingStack) {
      demoStacks.push(existingStack);
      continue;
    }

    const createdStack = (
      await localCreateModifierStack({
        memoryKey: memory.key,
        createdAt,
        ...input,
      })
    ).record;
    stacks.push(createdStack);
    demoStacks.push(createdStack);
  }

  const reflectionTexts = [
    "Strategy: delay is a deliberate option-preserving tactic until tradeoffs are visible.",
    "Product: the same memory becomes a design rule for showing comparison surfaces before forcing action.",
    "Protected summary: the user prefers tradeoff models before commitment.",
  ];
  const reflections = [];
  let previousReflectionKey: string | undefined;

  for (const [index, stack] of demoStacks.entries()) {
    const reflectionText = reflectionTexts[index];
    if (!reflectionText) continue;
    const existingReflection = currentGraph.reflections.find(
      (reflection) =>
        reflection.payload.modifierStackKey === stack.key &&
        reflection.payload.reflection === reflectionText,
    );

    if (existingReflection) {
      reflections.push(existingReflection);
      previousReflectionKey = existingReflection.key;
      continue;
    }

    const created = await localCreateAgentReflection({
      memoryKey: memory.key,
      modifierStackKey: stack.key,
      previousReflectionKey,
      lineageDepth: index,
      model: "local-reflector",
      interpreter: stack.payload.interpreter,
      contentMode: "plaintext",
      reflection: reflectionText,
      createdAt,
    });
    reflections.push(created.record);
    previousReflectionKey = created.record.key;
  }

  return readLocalMemoryGraphUnsafe(memory.key);
}

function sameModifiers(left: string[], right: string[]) {
  return left.length === right.length && left.every((modifier, index) => modifier === right[index]);
}
