# TableForge — Production infrastructure

## coturn on VPS (TLS / `turns:`)

1. Copy `infra/coturn/env.coturn.example` → `infra/coturn/.env.coturn` and set `TURN_SECRET`.
2. Set `external-ip` in `infra/coturn/turnserver.conf` to your VPS public/private pair.
3. Generate certs (Let's Encrypt recommended for production):
   ```bash
   ./scripts/coturn/generate-certs.sh turn.yourdomain.com
   ```
4. Start coturn:
   ```bash
   cd infra/coturn && docker compose --env-file .env.coturn up -d
   ```
5. Point TableForge API env:
   ```bash
   TURN_URLS=turn:turn.yourdomain.com:3478,turns:turn.yourdomain.com:5349
   TURN_USERNAME=tableforge
   TURN_SECRET=<same as coturn static-auth-secret>
   ```

### NAT test

- Browser: open `/ops/webrtc` and run **ICE probe** — look for `relay` in `candidateTypes`.
- CLI: `npm run test:ice`

## LiveKit Cloud (6+ participants)

1. Create a project at [https://cloud.livekit.io](https://cloud.livekit.io).
2. Set server env: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`.
3. Set client env: `VITE_LIVEKIT_URL=wss://<project>.livekit.cloud`.
4. Smoke test: `npm run test:livekit`
5. Manual: open `/ops/telepresence` in **6+ tabs** with the same room ID — mode should show **SFU**.

## Catan event-sourcing

- Routine sync uses **domain events** + `reduceCatanEvent` → Zustand.
- Checkpoints are rare: game start, setup complete, winner, every ~120 events.
- Unit tests: `npm run test:unit` (`catanReplay.test.ts`).

## E2E

```bash
npm run test:unit
npm run test:e2e   # starts API + Vite, runs Playwright
```
