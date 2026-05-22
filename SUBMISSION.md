# Arkiv ETH-NS Challenge Submission

Use this file as the copy-paste source for the submission form.

| Field | Value |
| --- | --- |
| Project | ModifierVault |
| Theme | AI |
| Summary | A web3-native AI memory atlas where users write, own, read, and query agent memory entities on Arkiv Braga testnet. |
| GitHub repo | https://github.com/beaconsmith/arkiv-modifier-vault |
| Demo link | https://modifiervault.vercel.app |
| Demo video | Optional at submission; record before prize claim |
| Team | Beaconsmith Team |
| GitHub handle | `beaconsmith` |
| Prize wallet | `0x7c2435c6e148cd2d936d2afcb73ec741ec7effb2` |

## Technical Checklist

- Unique project attribute: `project = "modifiervault_beaconsmith_ethns_2026"`
- Entity types: `MemoryNode`, `ModifierStack`, `AgentReflection`
- Relationships: `memoryKey` and `modifierStackKey` attributes
- Arkiv network: Braga testnet
- Create/read/query flows: browser wallet plus Arkiv SDK
- Local verification: `npm run lint`, `npm run build`
- Braga verification: `npm run test:braga` with `ARKIV_PRIVATE_KEY`
