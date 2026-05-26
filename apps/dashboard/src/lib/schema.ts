import {
  PROJECT_ATTRIBUTE,
  SCHEMA_VERSION,
  agentReflectionAttributes,
  createAgentReflectionPayload as createStrictAgentReflectionPayload,
  createMemoryNodePayload as createStrictMemoryNodePayload,
  createModifierStackPayload as createStrictModifierStackPayload,
  getMemoryDisplayContent,
  getReflectionDisplayText,
  isAgentReflectionPayload,
  isMemoryNodePayload,
  isModifierStackPayload,
  memoryNodeAttributes,
  modifierAttributeKey,
  modifierStackAttributes,
  normalizeModifier,
  parseModifierInput,
  validateAgentReflectionPayload,
  validateMemoryNodePayload,
  validateModifierStackPayload,
  type AgentReflectionPayload,
  type ArkivEntityRecord,
  type Authority,
  type ContentMode,
  type CreateAgentReflectionPayloadInput,
  type CreateMemoryNodePayloadInput,
  type CreateModifierStackPayloadInput,
  type EncryptedPayloadEnvelope,
  type MemoryNodePayload,
  type ModifierStackPayload,
  type ModifierVaultPayload,
} from "@modifiervault/schemas";

export {
  PROJECT_ATTRIBUTE,
  SCHEMA_VERSION,
  agentReflectionAttributes,
  getMemoryDisplayContent,
  getReflectionDisplayText,
  isAgentReflectionPayload,
  isMemoryNodePayload,
  isModifierStackPayload,
  memoryNodeAttributes,
  modifierAttributeKey,
  modifierStackAttributes,
  normalizeModifier,
  parseModifierInput,
  validateAgentReflectionPayload,
  validateMemoryNodePayload,
  validateModifierStackPayload,
};

export type {
  AgentReflectionPayload,
  ArkivEntityRecord,
  Authority,
  ContentMode,
  EncryptedPayloadEnvelope,
  MemoryNodePayload,
  ModifierStackPayload,
  ModifierVaultPayload,
};

export type Visibility = "private" | "shared" | "public";

export type CreateMemoryInput = CreateMemoryNodePayloadInput & {
  visibility?: Visibility;
};

export type CreateModifierStackInput = Omit<CreateModifierStackPayloadInput, "authority"> & {
  authority: Authority | string;
};

export type CreateAgentReflectionInput = Omit<
  CreateAgentReflectionPayloadInput,
  "authority" | "interpreter" | "promptHash" | "outputHash"
> & {
  authority?: Authority | string;
  interpreter?: string;
  context?: string;
  promptHash?: string;
  outputHash?: string;
};

function normalizeAuthority(value?: Authority | string): Authority {
  if (value === "agent" || value === "shared" || value === "user") {
    return value;
  }

  return "user";
}

function validationMessage(result: ReturnType<typeof validateMemoryNodePayload>) {
  return result.success ? "" : result.error.issues.map((issue) => issue.message).join("; ");
}

export function createMemoryNodePayload(input: CreateMemoryInput): MemoryNodePayload {
  const payload = createStrictMemoryNodePayload(input);
  const validation = validateMemoryNodePayload(payload);

  if (!validation.success) {
    throw new Error(validationMessage(validation));
  }

  return payload;
}

export function createModifierStackPayload(
  input: CreateModifierStackInput,
): ModifierStackPayload {
  const payload = createStrictModifierStackPayload({
    ...input,
    authority: normalizeAuthority(input.authority),
  });
  const validation = validateModifierStackPayload(payload);

  if (!validation.success) {
    throw new Error(validation.error.issues.map((issue) => issue.message).join("; "));
  }

  return payload;
}

export function createAgentReflectionPayload(
  input: CreateAgentReflectionInput,
): AgentReflectionPayload {
  const payload = createStrictAgentReflectionPayload({
    memoryKey: input.memoryKey,
    modifierStackKey: input.modifierStackKey,
    previousReflectionKey: input.previousReflectionKey,
    lineageDepth: input.lineageDepth,
    model: input.model,
    interpreter: input.interpreter ?? "modifiervault:default",
    contentMode: input.contentMode,
    reflection: input.contentMode === "encrypted" ? undefined : input.reflection,
    encryptedReflection: input.contentMode === "encrypted" ? input.encryptedReflection : undefined,
    promptHash: input.promptHash ?? "",
    outputHash: input.outputHash ?? "",
    createdAt: input.createdAt,
  });
  const validation = validateAgentReflectionPayload(payload);

  if (!validation.success) {
    throw new Error(validation.error.issues.map((issue) => issue.message).join("; "));
  }

  return payload;
}

export function getMemoryContentMode(payload: MemoryNodePayload) {
  return payload.contentMode;
}

export function isV2Payload(payload: ModifierVaultPayload | unknown) {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "schemaVersion" in payload &&
    payload.schemaVersion === SCHEMA_VERSION
  );
}
