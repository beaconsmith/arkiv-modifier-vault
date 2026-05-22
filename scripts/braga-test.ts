import { createPublicClient, createWalletClient, jsonToPayload } from "@arkiv-network/sdk";
import { braga } from "@arkiv-network/sdk/chains";
import { eq } from "@arkiv-network/sdk/query";
import { config } from "dotenv";
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import {
  ARKIV_BRAGA_RPC_URL,
  DEFAULT_ENTITY_TTL_SECONDS,
  PROJECT_ATTRIBUTE,
} from "../src/lib/constants";
import {
  createMemoryNodePayload,
  isMemoryNodePayload,
  memoryNodeAttributes,
} from "../src/lib/schema";

config({ path: ".env.local" });
config({ path: ".env" });

const privateKey = process.env.ARKIV_PRIVATE_KEY ?? process.env.TEST_PRIVATE_KEY;

if (!privateKey) {
  throw new Error(
    "Set ARKIV_PRIVATE_KEY in .env.local to run the Braga write/read/query smoke test.",
  );
}

const account = privateKeyToAccount(privateKey as `0x${string}`);

const publicClient = createPublicClient({
  chain: braga,
  transport: http(ARKIV_BRAGA_RPC_URL),
});

const walletClient = createWalletClient({
  account,
  chain: braga,
  transport: http(ARKIV_BRAGA_RPC_URL),
});

async function main() {
  const payload = createMemoryNodePayload({
    title: `Braga smoke test ${new Date().toISOString()}`,
    content: "ModifierVault smoke test: user-owned AI memory written to Arkiv Braga.",
    domain: "contest-verification",
    visibility: "public",
  });

  const attributes = memoryNodeAttributes(payload);
  const { entityKey, txHash } = await walletClient.createEntity({
    payload: jsonToPayload(payload),
    contentType: "application/json",
    attributes,
    expiresIn: DEFAULT_ENTITY_TTL_SECONDS,
  });

  const entity = await publicClient.getEntity(entityKey);
  const storedPayload = entity.toJson();

  if (!isMemoryNodePayload(storedPayload)) {
    throw new Error("Braga readback payload did not match the MemoryNode schema.");
  }

  const queryResult = await publicClient
    .buildQuery()
    .where([eq("project", PROJECT_ATTRIBUTE), eq("entityType", "MemoryNode")])
    .withPayload()
    .withAttributes()
    .withMetadata()
    .limit(5)
    .fetch();

  const foundCreatedEntity = queryResult.entities.some((resultEntity) => {
    return resultEntity.key.toLowerCase() === entityKey.toLowerCase();
  });

  if (!foundCreatedEntity) {
    throw new Error("Braga project query did not return the entity just created.");
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        project: PROJECT_ATTRIBUTE,
        owner: entity.owner,
        creator: entity.creator,
        entityKey,
        txHash,
        queriedEntities: queryResult.entities.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
