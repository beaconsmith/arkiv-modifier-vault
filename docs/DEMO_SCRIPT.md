# Demo Script

This script is designed for local mock mode first. It can be repeated in Arkiv live mode with a funded Braga wallet.

## Local Demo

1. Run:

```bash
npm install
npm run dev
```

2. Open `http://localhost:3000/query`.

3. Confirm a `MemoryNode` titled `Tradeoff Modeling Pattern` appears.

4. Open the memory detail route.

5. Show the base memory:

```txt
I avoid decisions until I can model tradeoffs.
```

6. Show the three `ModifierStack` records:

```txt
A: ["route:strategy", "expand", "remember"]
B: ["route:product", "transform:design"]
C: ["protect", "compress"]
```

7. Explain that each stack changes interpretation without changing the base memory.

8. Show linked `AgentReflection` records and the proof panel with entity keys, owner, creator, and attributes.

9. Click export graph JSON on `/memory/[key]`.

10. Open `/sdk` and show the TypeScript usage.

11. Open `/research` and show the thesis and evidence shape.

## Arkiv Live Demo

1. Set:

```bash
NEXT_PUBLIC_MODIFIERVAULT_STORAGE=arkiv
NEXT_PUBLIC_ARKIV_RPC_URL=https://braga.hoodi.arkiv.network/rpc
NEXT_PUBLIC_ARKIV_EXPLORER_URL=https://explorer.braga.hoodi.arkiv.network
```

2. Run:

```bash
npm run dev
```

3. Open `/create`.

4. Connect a browser wallet on Arkiv Braga.

5. Save a `MemoryNode`.

6. Confirm the app writes a linked `ModifierStack`.

7. Open `/memory/[key]` and generate or manually write an `AgentReflection`.

8. Query by modifier on `/query`.

9. Run CLI smoke if a private key is configured:

```bash
npm run test:braga
```

