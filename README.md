# TableForge

**TableForge** is a VR-first web platform for remote board gaming. Play classic titles in immersive 3D with telepresence, real-time rooms (optional), and production-oriented architecture.

## Features

| Area | Status |
|------|--------|
| **Catan 3D** | Playable local MVP — dice, building, trade, robber, AI bots, **WebXR VR** |
| **Risk 3D** | 3D world map, reinforce phases, **combat resolution**, continent bonuses, VR |
| **Monopoly / Codenames** | Early UI shells |
| **WebXR** | Enter VR on supported headsets (Chrome + Quest, etc.) |
| **Telepresence** | Local webcam panels in 3D scene |
| **Liveblocks** | Optional multiplayer rooms via `VITE_LIVEBLOCKS_PUBLIC_KEY` |
| **PWA** | Installable manifest for tablets / venue kiosks |

## Quick start

```bash
npm install
cp .env.example .env.local   # optional: GEMINI_API_KEY, VITE_LIVEBLOCKS_PUBLIC_KEY
npm run dev
```

Open http://localhost:3000

## Environment

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Reserved for AI features (server-side proxy recommended) |
| `VITE_LIVEBLOCKS_PUBLIC_KEY` | Enables Liveblocks `RoomProvider` for lobbies |
| `APP_URL` | Hosted URL for OAuth callbacks |

## Scripts

- `npm run dev` — development server (port 3000)
- `npm run build` — production build
- `npm run lint` — TypeScript check
- `npm run preview` — preview production build

## Architecture

- **React 19 + Vite 6 + TypeScript**
- **React Three Fiber** + **Rapier** physics + **@react-three/xr** for WebXR
- **Zustand** (Catan state) / React state (Risk)
- **shadcn / Radix** UI, **Framer Motion**
- Domain layer under `src/games/catan/domain/` (event reducers — integration in progress)

## VR usage

On a WebXR-capable browser and headset, open **Catan** or **Risk** and click **Είσοδος VR**. Desktop mouse/touch orbit controls remain available outside VR.

## License

See repository license. Game names (Catan, Risk, etc.) are trademarks of their respective owners; this project is an independent fan/technical demo.
