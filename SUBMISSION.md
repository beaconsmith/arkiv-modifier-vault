# Arkiv ETH-NS Challenge Submission

Use this file as the copy-paste source for the submission form.

| Field | Value |
| --- | --- |
| Project | ModifierVault |
| Theme | AI + Privacy |
| Summary | User-owned AI memory infrastructure that models memory as a portable semantic graph of MemoryNodes, ModifierStacks, AgentReflections, and lineage metadata. |
| GitHub repo | https://github.com/beaconsmith/arkiv-modifier-vault |
| Demo link | https://modifiervault.vercel.app |
| Demo video | https://www.loom.com/share/1f42e1f0253e46bba84221ad10064ab2 |
| Team | Nzube Ndiokwelu |
| GitHub handle | `beaconsmith` |

## Technical Checklist

- Unique project attribute: `project = "modifiervault_beaconsmith_ethns_2026"`
- Schema filter: `schemaVersion = "3"`
- Entity types: `MemoryNode`, `ModifierStack`, `AgentReflection`
- Relationships: `memoryKey`, `modifierStackKey`, and `previousReflectionKey`
- Arkiv network: Braga testnet
- Local mock mode: default, walletless, same v3 payloads and attributes
- Arkiv live mode: `NEXT_PUBLIC_MODIFIERVAULT_STORAGE=arkiv`
- Payload modes: plaintext, metadata-only, encrypted
- Encryption: browser-side PBKDF2 -> AES-GCM encrypted payload envelopes
- AI: generated `AgentReflection` artifacts with `promptHash` and `outputHash`
- Local verification: `npm run verify`
- Braga verification: `npm run test:braga` with `ARKIV_PRIVATE_KEY`
