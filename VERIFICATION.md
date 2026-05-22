# Verification Evidence

Last verified: May 22, 2026.

## Local

```bash
npm run verify
```

Result:

- `npm run lint` passed.
- `npm run build` passed.
- `npm audit --audit-level=moderate` found 0 vulnerabilities.
- Next.js generated `/`, `/atlas`, `/create`, `/query`, and `/memory/[key]`.

## Vercel

Production alias:

```txt
https://modifiervault.vercel.app
```

Latest inspected production deployment:

```txt
dpl_3UtNVT1KiTytFtvetMxXYyPGhKYg
https://modifiervault-18yvz7avn-beaconsmiths-projects.vercel.app
status: READY
```

HTTP route checks:

- `/` returned `200 OK`.
- `/create` returned `200 OK`.
- `/query` returned `200 OK`.

Runtime logs:

- `vercel logs --since 30m --level error` returned no logs.

## Arkiv Braga

Public query used:

```txt
project = "modifiervault_beaconsmith_ethns_2026"
```

The query returned existing Braga entities for all three app entity types:

| Entity type | Example key | Owner / creator |
| --- | --- | --- |
| MemoryNode | `0xdf89d7349f831122d746a3dd95a9edf094ec50cbe0e614b86fdfee9e4d02113f` | `0x53cdd33d878a08b07dc1a9d061d49241bee9b52f` |
| ModifierStack | `0x36ba584a4b28ee636d14d57b908188bc463f00b388e0c45cf5dca22c7c3a0d6f` | `0x53cdd33d878a08b07dc1a9d061d49241bee9b52f` |
| AgentReflection | `0xa554ef2ed9c832160cb57a3c0942837b6fd82f2e26cf90498c41ae0c96a140c5` | `0x53cdd33d878a08b07dc1a9d061d49241bee9b52f` |

This verifies that the project attribute is queryable on Braga and that the app's relationship attributes are present in public entity metadata.
