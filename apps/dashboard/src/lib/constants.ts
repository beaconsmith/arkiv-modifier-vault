export const PROJECT_ATTRIBUTE = "modifiervault_beaconsmith_ethns_2026";
export const SCHEMA_VERSION = "3";

export const APP_NAME = "ModifierVault";
export const APP_TAGLINE = "Own the way your AI remembers.";

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

export const MODIFIERVAULT_STORAGE_MODE =
  process.env.NEXT_PUBLIC_MODIFIERVAULT_STORAGE === "arkiv" ? "arkiv" : "local";

export const ARKIV_CREATE_GAS_LIMIT =
  BigInt(process.env.NEXT_PUBLIC_ARKIV_CREATE_GAS_LIMIT ?? "650000");
export const ARKIV_MIN_MAX_FEE_PER_GAS_WEI =
  BigInt(process.env.NEXT_PUBLIC_ARKIV_MIN_MAX_FEE_PER_GAS_WEI ?? "2000000");
export const ARKIV_GAS_FEE_MULTIPLIER =
  BigInt(process.env.NEXT_PUBLIC_ARKIV_GAS_FEE_MULTIPLIER ?? "3");

export const DEMO_MEMORY_CONTENT =
  "I avoid decisions until I can model tradeoffs.";

export const DEMO_MODIFIERS = [
  "route:strategy",
  "expand",
  "remember",
];

export const DEMO_MEMORY_TITLE = "Tradeoff Modeling Pattern";
export const DEMO_MEMORY_DOMAIN = "personal-cognition";
export const DEMO_INTERPRETER = "beaconsmith:v1";
export const DEMO_CONTEXT =
  "Same base memory, reusable through explicit ModifierStacks without rewriting the memory.";
export const DEMO_AUTHORITY = "user";
