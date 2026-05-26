# Arkiv Notes

ModifierVault uses Arkiv as a queryable entity graph, not just blob storage.

## Project Attribute

Every entity includes:

```txt
project = "modifiervault_beaconsmith_ethns_2026"
```

Every query includes the same project attribute so ModifierVault records do not mix with unrelated entities.

## Schema Version

Every entity payload and attribute set includes:

```txt
schemaVersion = "3"
```

The dashboard filters by schema version in normal mode. Legacy reads can still happen by direct key if needed.

## Required Attributes

Every entity has:

- `project`
- `schemaVersion`
- `entityType`
- `createdAt`

`MemoryNode` adds:

- `domain`
- `contentMode`

`ModifierStack` adds:

- `memoryKey`
- `interpreter`
- `authority`
- one repeated modifier flag per modifier value

`AgentReflection` adds:

- `memoryKey`
- `modifierStackKey`
- `previousReflectionKey` when present
- `interpreter`
- `model`
- `lineageDepth`

## Arrays In Payload Only

`modifiers: string[]` lives in the `ModifierStack` payload. Arkiv attributes are scalar. To make modifier queries possible, the attribute builder also emits one scalar flag per modifier:

```txt
modifier__route_strategy = "true"
modifier__expand = "true"
modifier__remember = "true"
```

## Relationships By Shared Keys

Arkiv entities are linked by keys rather than foreign-key constraints:

- `ModifierStack.payload.memoryKey -> MemoryNode.key`
- `AgentReflection.payload.memoryKey -> MemoryNode.key`
- `AgentReflection.payload.modifierStackKey -> ModifierStack.key`
- `AgentReflection.payload.previousReflectionKey -> AgentReflection.key`

The dashboard reconstructs the graph by querying these attributes.

## expiresIn Usage

Writes use `expiresIn`, configured by:

```txt
NEXT_PUBLIC_ARKIV_EXPIRES_IN_SECONDS
```

The default is 30 days in the dashboard constants. Production deployments should choose TTL values deliberately.

## Owner And Creator

The dashboard displays `owner` and `creator` when Arkiv metadata returns them. Local mock mode uses `local-owner` and `local-browser` so the UI can show the same proof panel shape without a wallet.

## Known SDK Quirks Handled

- Wallet signing uses the injected provider, but receipt polling is routed through the public Braga RPC to avoid hanging provider receipt polling.
- Writes include gas parameters from a public RPC balance/gas check.
- Entity keys are validated as strict hex strings in live mode; local mode uses `local-*` keys and bypasses that live-only check.
- Modifier arrays are not written as a single query attribute. Repeated scalar modifier flags are emitted instead.

