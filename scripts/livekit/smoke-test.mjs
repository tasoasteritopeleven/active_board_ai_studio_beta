#!/usr/bin/env node
/**
 * LiveKit smoke: mint tokens for 6 participants (validates server SDK wiring).
 * Requires LIVEKIT_API_KEY + LIVEKIT_API_SECRET in env.
 */
import 'dotenv/config';

const base = process.argv[2] ?? 'http://localhost:3001';
const room = `tableforge-smoke-${Date.now()}`;

async function main() {
  const statusRes = await fetch(`${base}/api/livekit/status`);
  const status = await statusRes.json();
  if (!status.configured) {
    console.warn('SKIP: LiveKit not configured on server');
    process.exit(0);
  }

  const identities = Array.from({ length: 6 }, (_, i) => `player-${i + 1}`);
  const tokens = [];

  for (const identity of identities) {
    const res = await fetch(`${base}/api/livekit/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, identity, name: identity }),
    });
    if (!res.ok) {
      console.error('FAIL token for', identity, await res.text());
      process.exit(1);
    }
    const { token } = await res.json();
    tokens.push({ identity, tokenLength: token.length });
  }

  console.log('OK: LiveKit tokens for room', room);
  console.table(tokens);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
