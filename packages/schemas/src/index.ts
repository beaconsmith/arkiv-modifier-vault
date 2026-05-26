import { z } from "zod";

export const PROJECT_ATTRIBUTE = "modifiervault_beaconsmith_ethns_2026";
export const SCHEMA_VERSION = "3";

export type EntityType = "MemoryNode" | "ModifierStack" | "AgentReflection";
export type ContentMode = "plaintext" | "metadata-only" | "encrypted";
export type Authority = "user" | "agent" | "shared";

export type ArkivAttributeValue = string | number;

export type ArkivAttribute = {
  key: string;
  value: ArkivAttributeValue;
};

export type EncryptedPayloadEnvelope = {
  algorithm: "AES-GCM";
  kdf: "PBKDF2";
  hash: "SHA-256";
  iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
};

export type MemoryNodePayload = {
  entityType: "MemoryNode";
  schemaVersion: typeof SCHEMA_VERSION;
  title: string;
  domain: string;
  contentMode: ContentMode;
  content?: string;
  contentPreview?: string;
  encryptedContent?: EncryptedPayloadEnvelope;
  createdAt: string;
};

export type ModifierStackPayload = {
  entityType: "ModifierStack";
  schemaVersion: typeof SCHEMA_VERSION;
  memoryKey: string;
  modifiers: string[];
  interpreter: string;
  authority: Authority;
  context: string;
  createdAt: string;
};

export type AgentReflectionPayload = {
  entityType: "AgentReflection";
  schemaVersion: typeof SCHEMA_VERSION;
  memoryKey: string;
  modifierStackKey: string;
  previousReflectionKey?: string;
  lineageDepth: number;
  model: string;
  interpreter: string;
  contentMode: ContentMode;
  reflection?: string;
  encryptedReflection?: EncryptedPayloadEnvelope;
  promptHash: string;
  outputHash: string;
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
  attributes: ArkivAttribute[];
  payload: T;
  txHash?: string;
};

export type CreateMemoryNodePayloadInput = {
  title: string;
  domain: string;
  contentMode?: ContentMode;
  content?: string;
  contentPreview?: string;
  encryptedContent?: EncryptedPayloadEnvelope;
  createdAt?: string;
};

export type CreateModifierStackPayloadInput = {
  memoryKey: string;
  modifiers: string[];
  interpreter: string;
  authority: Authority;
  context: string;
  createdAt?: string;
};

export type CreateAgentReflectionPayloadInput = {
  memoryKey: string;
  modifierStackKey: string;
  previousReflectionKey?: string;
  lineageDepth?: number;
  model: string;
  interpreter: string;
  contentMode?: ContentMode;
  reflection?: string;
  encryptedReflection?: EncryptedPayloadEnvelope;
  promptHash: string;
  outputHash: string;
  createdAt?: string;
};

const createdAtSchema = z.string().min(1);
const schemaVersionSchema = z.literal(SCHEMA_VERSION);
const contentModeSchema = z.enum(["plaintext", "metadata-only", "encrypted"]);
const authoritySchema = z.enum(["user", "agent", "shared"]);

export const encryptedPayloadEnvelopeSchema = z.object({
  algorithm: z.literal("AES-GCM"),
  kdf: z.literal("PBKDF2"),
  hash: z.literal("SHA-256"),
  iterations: z.number().int().positive(),
  salt: z.string().min(1),
  iv: z.string().min(1),
  ciphertext: z.string().min(1),
}).strict();

export const memoryNodePayloadSchema = z
  .object({
    entityType: z.literal("MemoryNode"),
    schemaVersion: schemaVersionSchema,
    title: z.string().min(1),
    domain: z.string().min(1),
    contentMode: contentModeSchema,
    content: z.string().optional(),
    contentPreview: z.string().optional(),
    encryptedContent: encryptedPayloadEnvelopeSchema.optional(),
    createdAt: createdAtSchema,
  })
  .strict()
  .superRefine((payload, context) => {
    enforceDisclosureMode(context, {
      contentMode: payload.contentMode,
      rawPath: "content",
      rawPresent: payload.content !== undefined,
      rawValue: payload.content,
      encryptedPath: "encryptedContent",
      encryptedPresent: payload.encryptedContent !== undefined,
      encryptedValue: payload.encryptedContent,
      subject: "MemoryNode",
    });
  });

export const modifierStackPayloadSchema = z.object({
  entityType: z.literal("ModifierStack"),
  schemaVersion: schemaVersionSchema,
  memoryKey: z.string().min(1),
  modifiers: z.array(z.string().min(1)).min(1),
  interpreter: z.string().min(1),
  authority: authoritySchema,
  context: z.string().min(1),
  createdAt: createdAtSchema,
}).strict();

export const agentReflectionPayloadSchema = z
  .object({
    entityType: z.literal("AgentReflection"),
    schemaVersion: schemaVersionSchema,
    memoryKey: z.string().min(1),
    modifierStackKey: z.string().min(1),
    previousReflectionKey: z.string().min(1).optional(),
    lineageDepth: z.number().int().nonnegative(),
    model: z.string().min(1),
    interpreter: z.string().min(1),
    contentMode: contentModeSchema,
    reflection: z.string().optional(),
    encryptedReflection: encryptedPayloadEnvelopeSchema.optional(),
    promptHash: z.string().min(1),
    outputHash: z.string().min(1),
    createdAt: createdAtSchema,
  })
  .strict()
  .superRefine((payload, context) => {
    enforceDisclosureMode(context, {
      contentMode: payload.contentMode,
      rawPath: "reflection",
      rawPresent: payload.reflection !== undefined,
      rawValue: payload.reflection,
      encryptedPath: "encryptedReflection",
      encryptedPresent: payload.encryptedReflection !== undefined,
      encryptedValue: payload.encryptedReflection,
      subject: "AgentReflection",
    });
  });

function enforceDisclosureMode(
  context: z.RefinementCtx,
  options: {
    contentMode: ContentMode;
    rawPath: string;
    rawPresent: boolean;
    rawValue?: string;
    encryptedPath: string;
    encryptedPresent: boolean;
    encryptedValue?: EncryptedPayloadEnvelope;
    subject: "MemoryNode" | "AgentReflection";
  },
) {
  if (options.contentMode === "plaintext") {
    if (!options.rawPresent || !options.rawValue) {
      context.addIssue({
        code: "custom",
        path: [options.rawPath],
        message: `Plaintext ${options.subject} payloads must include ${options.rawPath}.`,
      });
    }

    if (options.encryptedPresent) {
      context.addIssue({
        code: "custom",
        path: [options.encryptedPath],
        message: `Plaintext ${options.subject} payloads must not include ${options.encryptedPath}.`,
      });
    }
  }

  if (options.contentMode === "metadata-only") {
    if (options.rawPresent) {
      context.addIssue({
        code: "custom",
        path: [options.rawPath],
        message: `Metadata-only ${options.subject} payloads must not include raw ${options.rawPath}.`,
      });
    }

    if (options.encryptedPresent) {
      context.addIssue({
        code: "custom",
        path: [options.encryptedPath],
        message: `Metadata-only ${options.subject} payloads must not include ${options.encryptedPath}.`,
      });
    }
  }

  if (options.contentMode === "encrypted") {
    if (options.rawPresent) {
      context.addIssue({
        code: "custom",
        path: [options.rawPath],
        message: `Encrypted ${options.subject} payloads must not include raw ${options.rawPath}.`,
      });
    }

    if (!options.encryptedPresent) {
      context.addIssue({
        code: "custom",
        path: [options.encryptedPath],
        message: `Encrypted ${options.subject} payloads must include ${options.encryptedPath}.`,
      });
    }
  }
}

export const modifierVaultPayloadSchema = z.discriminatedUnion("entityType", [
  memoryNodePayloadSchema,
  modifierStackPayloadSchema,
  agentReflectionPayloadSchema,
]);

export function validateMemoryNodePayload(payload: unknown) {
  return memoryNodePayloadSchema.safeParse(payload);
}

export function validateModifierStackPayload(payload: unknown) {
  return modifierStackPayloadSchema.safeParse(payload);
}

export function validateAgentReflectionPayload(payload: unknown) {
  return agentReflectionPayloadSchema.safeParse(payload);
}

export function validateModifierVaultPayload(payload: unknown) {
  return modifierVaultPayloadSchema.safeParse(payload);
}

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

function createdAtOrNow(createdAt?: string) {
  return createdAt ?? new Date().toISOString();
}

function previewFromContent(content?: string, fallback = "Private memory") {
  const trimmed = content?.trim();
  if (!trimmed) return fallback;
  return `${trimmed.slice(0, 96)}${trimmed.length > 96 ? "..." : ""}`;
}

export function createMemoryNodePayload(input: CreateMemoryNodePayloadInput): MemoryNodePayload {
  const contentMode = input.contentMode ?? "plaintext";
  const content = input.content?.trim();
  const explicitPreview = input.contentPreview?.trim();
  const contentPreview =
    explicitPreview ??
    (contentMode === "plaintext"
      ? previewFromContent(content)
      : contentMode === "metadata-only"
        ? "Metadata-only memory. Raw content was not stored."
        : "Encrypted memory. Decrypt locally to view.");

  return {
    entityType: "MemoryNode",
    schemaVersion: SCHEMA_VERSION,
    title: input.title.trim() || "Untitled MemoryNode",
    domain: input.domain.trim() || "personal-cognition",
    contentMode,
    ...(contentMode === "plaintext" && content ? { content } : {}),
    ...(contentMode === "metadata-only" ? { contentPreview } : {}),
    ...(contentMode === "encrypted" ? { contentPreview } : {}),
    ...(contentMode === "encrypted" && input.encryptedContent
      ? { encryptedContent: input.encryptedContent }
      : {}),
    createdAt: createdAtOrNow(input.createdAt),
  };
}

export function createModifierStackPayload(
  input: CreateModifierStackPayloadInput,
): ModifierStackPayload {
  const modifiers = Array.from(new Set(input.modifiers.map(normalizeModifier).filter(Boolean)));

  return {
    entityType: "ModifierStack",
    schemaVersion: SCHEMA_VERSION,
    memoryKey: input.memoryKey,
    modifiers: modifiers.length ? modifiers : ["remember"],
    interpreter: input.interpreter.trim() || "modifiervault:default",
    authority: input.authority,
    context: input.context.trim() || "General memory reuse.",
    createdAt: createdAtOrNow(input.createdAt),
  };
}

export function createAgentReflectionPayload(
  input: CreateAgentReflectionPayloadInput,
): AgentReflectionPayload {
  const contentMode = input.contentMode ?? "plaintext";
  const reflection = input.reflection?.trim();

  return {
    entityType: "AgentReflection",
    schemaVersion: SCHEMA_VERSION,
    memoryKey: input.memoryKey,
    modifierStackKey: input.modifierStackKey,
    ...(input.previousReflectionKey ? { previousReflectionKey: input.previousReflectionKey } : {}),
    lineageDepth: input.lineageDepth ?? 0,
    model: input.model.trim() || "unknown-model",
    interpreter: input.interpreter.trim() || "modifiervault:default",
    contentMode,
    ...(contentMode === "plaintext" && reflection ? { reflection } : {}),
    ...(contentMode === "encrypted" && input.encryptedReflection
      ? { encryptedReflection: input.encryptedReflection }
      : {}),
    promptHash: input.promptHash,
    outputHash: input.outputHash,
    createdAt: createdAtOrNow(input.createdAt),
  };
}

function baseAttributes(payload: ModifierVaultPayload): ArkivAttribute[] {
  return [
    { key: "project", value: PROJECT_ATTRIBUTE },
    { key: "schemaVersion", value: payload.schemaVersion },
    { key: "entityType", value: payload.entityType },
    { key: "createdAt", value: payload.createdAt },
  ];
}

export function memoryNodeAttributes(payload: MemoryNodePayload): ArkivAttribute[] {
  return [
    ...baseAttributes(payload),
    { key: "domain", value: payload.domain },
    { key: "contentMode", value: payload.contentMode },
  ];
}

export function modifierStackAttributes(payload: ModifierStackPayload): ArkivAttribute[] {
  return [
    ...baseAttributes(payload),
    { key: "memoryKey", value: payload.memoryKey },
    { key: "interpreter", value: payload.interpreter },
    { key: "authority", value: payload.authority },
    ...payload.modifiers.map((modifier) => ({
      key: modifierAttributeKey(modifier),
      value: "true",
    })),
  ];
}

export function agentReflectionAttributes(payload: AgentReflectionPayload): ArkivAttribute[] {
  return [
    ...baseAttributes(payload),
    { key: "memoryKey", value: payload.memoryKey },
    { key: "modifierStackKey", value: payload.modifierStackKey },
    ...(payload.previousReflectionKey
      ? [{ key: "previousReflectionKey", value: payload.previousReflectionKey }]
      : []),
    { key: "interpreter", value: payload.interpreter },
    { key: "model", value: payload.model },
    { key: "lineageDepth", value: String(payload.lineageDepth) },
  ];
}

export function getMemoryDisplayContent(payload: MemoryNodePayload) {
  if (payload.contentMode === "encrypted") {
    return payload.contentPreview ?? "Encrypted memory. Decrypt locally to view.";
  }

  if (payload.contentMode === "metadata-only") {
    return payload.contentPreview ?? "Metadata-only memory. Private content was not stored.";
  }

  return payload.content ?? payload.contentPreview ?? "";
}

export function getReflectionDisplayText(payload: AgentReflectionPayload) {
  if (payload.contentMode === "encrypted") {
    return "Encrypted reflection. Decrypt locally to view the interpretation artifact.";
  }

  if (payload.contentMode === "metadata-only") {
    return "Metadata-only reflection. Private interpretation was not stored.";
  }

  return payload.reflection ?? "";
}

export function isMemoryNodePayload(payload: unknown): payload is MemoryNodePayload {
  return validateMemoryNodePayload(payload).success;
}

export function isModifierStackPayload(payload: unknown): payload is ModifierStackPayload {
  return validateModifierStackPayload(payload).success;
}

export function isAgentReflectionPayload(payload: unknown): payload is AgentReflectionPayload {
  return validateAgentReflectionPayload(payload).success;
}
