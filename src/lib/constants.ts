export const PROJECT_ATTRIBUTE = "modifiervault_beaconsmith_ethns_2026";

export const APP_NAME = "ModifierVault";
export const APP_TAGLINE = "Own your AI agent's memory, not just the chat.";

export const ARKIV_BRAGA_CHAIN_ID = 60138453102;
export const ARKIV_BRAGA_RPC_URL =
  process.env.NEXT_PUBLIC_ARKIV_RPC_URL ??
  "https://braga.hoodi.arkiv.network/rpc";
export const ARKIV_BRAGA_EXPLORER_URL =
  process.env.NEXT_PUBLIC_ARKIV_EXPLORER_URL ??
  "https://explorer.braga.hoodi.arkiv.network";

export const DEFAULT_ENTITY_TTL_SECONDS =
  Number(process.env.NEXT_PUBLIC_ARKIV_EXPIRES_IN_SECONDS) ||
  60 * 60 * 24 * 30;

export const ARKIV_CREATE_GAS_LIMIT =
  BigInt(process.env.NEXT_PUBLIC_ARKIV_CREATE_GAS_LIMIT ?? "650000");
export const ARKIV_MIN_MAX_FEE_PER_GAS_WEI =
  BigInt(process.env.NEXT_PUBLIC_ARKIV_MIN_MAX_FEE_PER_GAS_WEI ?? "2000000");
export const ARKIV_GAS_FEE_MULTIPLIER =
  BigInt(process.env.NEXT_PUBLIC_ARKIV_GAS_FEE_MULTIPLIER ?? "3");

export const DEMO_MEMORY_CONTENT =
  "Optimized codon bias scales expression rates in mRNA design maps.";

export const DEMO_MODIFIERS = [
  "scale",
  "route:codon-optimization",
  "transform:expression",
  "remember",
];
