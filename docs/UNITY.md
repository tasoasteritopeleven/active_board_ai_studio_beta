# TableForge — Unity WebGL boards (production)

Physical tabletop rendering for **Monopoly**, **Codenames**, and **Risk** uses **Unity 2022.3 LTS** embedded via `react-unity-webgl`.

## Rendering tiers (automatic)

| Tier | When | Technology |
|------|------|------------|
| 1 | `public/unity/TableForge/Build/TableForge.loader.js` exists | Unity WebGL |
| 2 | Always (fallback) | React Three Fiber 3D boards |
| 3 | Optional | CSS/paper `*BoardVisual` components |

`BoardGameViewport` orchestrates Unity → 3D → 2D.

## Project layout

| Path | Purpose |
|------|---------|
| `unity/TableForgeBoardGames/` | Unity 2022.3 LTS project |
| `Assets/Scripts/Core/GameBoardDirector.cs` | Table, lighting, game switch |
| `Assets/Scripts/Core/TableForgeMaterials.cs` | Shared PBR materials |
| `Assets/Scripts/Games/*BoardBuilder.cs` | Procedural boards |
| `Assets/Scripts/Bridge/TableForgeJsBridge.cs` | React ↔ Unity JSON |
| `public/unity/TableForge/Build/` | WebGL output (CI or local) |

## React protocol

**React → Unity** (`SendMessage('TableForgeJsBridge', 'ReceiveFromReact', json)`):

```json
{"cmd":"init","game":"monopoly"}
{"cmd":"state","state":"{\"position\":5,\"playerColor\":\"#ef4444\",\"houses\":{\"39\":2}}"}
```

Codenames state should include `words[]` with `text`, `type`, `revealed`, plus `isSpymaster`.

Risk state should include `territories:[{id,ownerId,armies}]`.

**Unity → React**:

```json
{"type":"ready","game":"monopoly"}
```

## Local build

1. Install [Unity 2022.3 LTS](https://unity.com/releases/editor/whats-new/2022.3.0)
2. Open `unity/TableForgeBoardGames`
3. **TableForge → Create Main Scene** (once)
4. **TableForge → Build WebGL (CI)**
5. Copy `unity/TableForgeBoardGames/Build/WebGL/*` → `public/unity/TableForge/Build/`

```bash
npm run dev   # client :3000 + API :3001 — uses 3D/CSS until Unity build exists
```

## CI (GitHub Actions)

Workflow: `.github/workflows/unity-webgl.yml`

Required repository secrets:

| Secret | Description |
|--------|-------------|
| `UNITY_LICENSE` | Contents of `.ulf` activation file |
| `UNITY_EMAIL` | Unity account email |
| `UNITY_PASSWORD` | Unity account password |

On success, artifacts are copied to `public/unity/TableForge/Build/` and uploaded as `tableforge-webgl`.

Without secrets, the app runs fully on **R3F + CSS fallbacks** — no regression.

## Production checklist

- [ ] Unity secrets configured
- [ ] Unity WebGL workflow green on `main`
- [ ] `TableForge.loader.js` committed or deployed with static assets
- [ ] `npm run build` bundles `dist/server.cjs` + Vite client
- [ ] Smoke-test Monopoly / Codenames / Risk in browser
