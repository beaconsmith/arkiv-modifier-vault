import {
  LocalMemoryStore,
  attachModifierStack,
  buildPromptFromMemoryGraph,
  createAgentReflection,
  createMemoryNode,
  exportMemoryGraph,
  hashString,
  queryMemoryGraph,
  searchByInterpreter,
  searchStacksByModifier,
  type MemoryStore,
} from "@modifiervault/core";
import type {
  CreateAgentReflectionPayloadInput,
  CreateMemoryNodePayloadInput,
  CreateModifierStackPayloadInput,
} from "@modifiervault/schemas";

export * from "@modifiervault/core";
export type * from "@modifiervault/schemas";

export type ModifierVaultOptions = {
  store: MemoryStore;
};

export type CreateReflectionInput = Omit<
  CreateAgentReflectionPayloadInput,
  "promptHash" | "outputHash"
> &
  Partial<Pick<CreateAgentReflectionPayloadInput, "promptHash" | "outputHash">>;

export class ModifierVault {
  private readonly store: MemoryStore;

  constructor(options: ModifierVaultOptions) {
    this.store = options.store;
  }

  static local(options: ConstructorParameters<typeof LocalMemoryStore>[0] = {}) {
    return new ModifierVault({ store: new LocalMemoryStore(options) });
  }

  async createMemory(input: CreateMemoryNodePayloadInput) {
    return this.store.create(createMemoryNode(input));
  }

  async attachModifierStack(input: CreateModifierStackPayloadInput) {
    return this.store.create(attachModifierStack(input));
  }

  async createReflection(input: CreateReflectionInput) {
    const graph = await queryMemoryGraph(this.store, input.memoryKey);
    const prompt = buildPromptFromMemoryGraph(graph, {
      modifierStackKey: input.modifierStackKey,
    });
    const reflectionText =
      input.reflection ??
      (input.encryptedReflection
        ? JSON.stringify(input.encryptedReflection)
        : `${input.memoryKey}:${input.modifierStackKey}`);

    return this.store.create(
      createAgentReflection({
        ...input,
        promptHash: input.promptHash ?? hashString(prompt),
        outputHash: input.outputHash ?? hashString(reflectionText),
      }),
    );
  }

  async queryGraph(memoryKey: string) {
    return queryMemoryGraph(this.store, memoryKey);
  }

  async searchByModifier(modifier: string) {
    return searchStacksByModifier(this.store, modifier);
  }

  async searchByInterpreter(interpreter: string) {
    return searchByInterpreter(this.store, interpreter);
  }

  async exportGraph(memoryKey: string) {
    return exportMemoryGraph(await this.queryGraph(memoryKey));
  }
}
