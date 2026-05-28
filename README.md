# TableForge

VR-first remote board gaming platform — Catan, Risk, Monopoly, Codenames in 3D with WebRTC telepresence and optional real-time multiplayer.

## Quick start

```bash
npm install
cp .env.example .env.local
# Optional: VITE_LIVEBLOCKS_PUBLIC_KEY, GEMINI_API_KEY (server only)
npm run dev
```

- **Web app:** http://localhost:3000  
- **API (Gemini proxy):** http://localhost:3001  

## Environment

| Variable | Where | Purpose |
|----------|--------|---------|
| `VITE_LIVEBLOCKS_PUBLIC_KEY` | Client | Multiplayer rooms + WebRTC signaling |
| `GEMINI_API_KEY` | **Server only** | `/api/ai/*` — never bundled in Vite |
| `PORT` | Server | API port (default 3001) |

## Features

- **WebXR** — Enter VR on Catan & Risk (`@react-three/xr`)
- **WebRTC telepresence** — Mesh peer video via Liveblocks signaling (fallback: local camera)
- **Catan multiplayer** — Host-authoritative state sync over Liveblocks broadcast
- **Risk** — Combat, continents, VR
- **Monopoly** — Playable engine (roll, buy, rent, jail)
- **Codenames** — Full clue/guess loop + optional Gemini spymaster hints
- **Code splitting** — Lazy routes + manual chunks (`three`, `r3f`, `liveblocks`)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite + Express API concurrently |
| `npm run dev:client` | Frontend only |
| `npm run dev:server` | API only |
| `npm run build` | Production build |
| `npm run lint` | TypeScript check |

## Multiplayer

1. Set `VITE_LIVEBLOCKS_PUBLIC_KEY` in `.env.local`
2. Open Catan with room id: `/games/catan?room=my-table`
3. Host (lowest connection id) syncs game state; peers receive updates
4. Enable camera/mic on presence panels for WebRTC mesh

## AI (server-side)

```bash
curl -X POST http://localhost:3001/api/ai/codenames-hint \
  -H 'Content-Type: application/json' \
  -d '{"words":["APPLE","MOON"],"team":"red"}'
```

Gemini keys stay on the server — the Vite client never receives `GEMINI_API_KEY`.
