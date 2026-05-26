# Evidence

Last local verification in this rebuild:

```bash
npm run verify
```

Result:

- Dashboard lint passed.
- Schema tests passed.
- Core graph tests passed.
- SDK tests passed.
- Dashboard local-mode tests passed.
- Local smoke test passed.
- Dashboard production build passed.

The build generated these routes:

- `/`
- `/create`
- `/query`
- `/memory/[key]`
- `/sdk`
- `/research`

Browser verification also loaded:

- `/`
- `/sdk`
- `/research`
- `/query`
- `/memory/local-memorynode-0001`

The local graph showed:

- `route:strategy`
- `route:product`
- `protect`
- owner/creator proof metadata

## What The Tests Cover

`packages/schemas/test/schema.test.ts`

- project constant and schema version
- strict payload validation
- disclosure mode mutual exclusion
- no raw secret leakage into private-mode previews
- required repeated modifier attributes
- lineage attributes

`packages/core/test/core.test.ts`

- local graph creation
- graph query and export
- prompt construction
- graph validation

`packages/sdk-ts/test/sdk.test.ts`

- `ModifierVault.local()`
- create memory
- attach stacks
- create reflection with hashes
- search by modifier
- search by interpreter
- export graph

`apps/dashboard/test/local-mode.test.ts`

- dashboard-facing local adapter
- seeded demo graph
- graph reconstruction
- owner and creator metadata
- repair of incomplete local demo graphs
- protection against attaching seeded demo reflections to custom stacks
- local modifier search filters

## Live Braga Evidence

Verified on the **Arkiv Braga** testnet.

### Verification Metadata
- **Verification Timestamp**: 2026-05-26T09:57:44Z
- **Owner / Creator Address**: `0x53cdd33d878a08b07dc1a9d061d49241bee9b52f`
- **Project Namespace**: `modifiervault_beaconsmith_ethns_2026`
- **Schema Version**: `3`

### Created Entities & Blockchain Transactions

1. **MemoryNode**
   - **Entity Key**: `0xa070f6cf9767c53c540a876e5fb800d616f3e9c19e6ebffa56a4c92ddfd78af6`
   - **Transaction Hash**: `0x8f6516a059ca714788b37cb2195a81d2097e07f5630aa3b75f27ad960c5219d1`
   - **Braga Explorer Links**: [Entity](https://explorer.braga.hoodi.arkiv.network/entity/0xa070f6cf9767c53c540a876e5fb800d616f3e9c19e6ebffa56a4c92ddfd78af6) | [Tx](https://explorer.braga.hoodi.arkiv.network/tx/0x8f6516a059ca714788b37cb2195a81d2097e07f5630aa3b75f27ad960c5219d1)

2. **ModifierStack**
   - **Entity Key**: `0x0e3f580e34ceeed5edc91c773de0073df78f0dbf5f76d32755cdf619f35be739`
   - **Transaction Hash**: `0xa507cd0ee278baa2bc97358ad8dc7cbeeea90ad743811c114482ea98929a7a92`
   - **Braga Explorer Links**: [Entity](https://explorer.braga.hoodi.arkiv.network/entity/0x0e3f580e34ceeed5edc91c773de0073df78f0dbf5f76d32755cdf619f35be739) | [Tx](https://explorer.braga.hoodi.arkiv.network/tx/0xa507cd0ee278baa2bc97358ad8dc7cbeeea90ad743811c114482ea98929a7a92)

3. **AgentReflection**
   - **Entity Key**: `0xe11cf9a0665a5deeb1bee864d3d86b25a8beac24ba51a29495a788b8db6e12c2`
   - **Transaction Hash**: `0xb1e946a11f8c2da4b0477990b26bc1199bbe480c252cd7105e2fcae84bed6294`
   - **Braga Explorer Links**: [Entity](https://explorer.braga.hoodi.arkiv.network/entity/0xe11cf9a0665a5deeb1bee864d3d86b25a8beac24ba51a29495a788b8db6e12c2) | [Tx](https://explorer.braga.hoodi.arkiv.network/tx/0xb1e946a11f8c2da4b0477990b26bc1199bbe480c252cd7105e2fcae84bed6294)

### Verified Queries

All queries fetched successfully (1 result):
- **MemoryNode Query**: filtered by project, schemaVersion, entityType, domain (`1` result).
- **ModifierStack Query**: filtered by project, schemaVersion, entityType, interpreter, modifier `route:strategy` (`1` result).
- **AgentReflection Query**: filtered by project, schemaVersion, entityType, memoryKey, modifierStackKey, interpreter (`1` result).

