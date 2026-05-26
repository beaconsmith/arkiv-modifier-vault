# Verification Evidence

Last verified locally during this rebuild: May 26, 2026.

## Local

```bash
npm run verify
```

Result:

- `npm run lint` passed.
- `npm run test:local` passed.
- `npm run build` passed.
- Next.js generated `/`, `/create`, `/query`, `/memory/[key]`, `/sdk`, and `/research`.

`test:local` includes:

- schema strictness and disclosure tests
- core graph tests
- SDK tests
- dashboard local-mode graph tests
- encryption/decryption smoke test

## Browser

Local browser verification loaded:

- `/`
- `/sdk`
- `/research`
- `/query`
- `/memory/local-memorynode-0001`

Observed local graph contents:

- base memory: `I avoid decisions until I can model tradeoffs.`
- modifier stack A: `route:strategy`, `expand`, `remember`
- modifier stack B: `route:product`, `transform:design`
- modifier stack C: `protect`, `compress`
- owner/creator proof metadata

## Arkiv Braga

Current project namespace:

```txt
project = "modifiervault_beaconsmith_ethns_2026"
schemaVersion = "3"
```

Live verification command:

```bash
npm run test:braga
```

`test:braga` requires `ARKIV_PRIVATE_KEY` in `.env.local`. It writes and reads:

- one `MemoryNode`
- one linked `ModifierStack`
- one linked `AgentReflection`

Then it verifies project/schema/domain/modifier/interpreter queries.
