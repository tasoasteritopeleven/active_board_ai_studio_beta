#!/usr/bin/env node
/**
 * ICE/TURN smoke test — fetches TableForge ICE servers and validates TURN entries.
 * Run: node scripts/coturn/test-ice.mjs [API_BASE]
 */
const base = process.argv[2] ?? 'http://localhost:3001';

async function main() {
  const res = await fetch(`${base}/api/webrtc/ice-servers`);
  if (!res.ok) {
    console.error('FAIL: ice-servers HTTP', res.status);
    process.exit(1);
  }
  const { iceServers } = await res.json();
  const turn = (iceServers ?? []).filter((s) => {
    const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
    return urls.some((u) => String(u).startsWith('turn'));
  });

  console.log('ICE servers:', iceServers?.length ?? 0);
  console.log('TURN entries:', turn.length);
  if (turn.length) {
    console.log('TURN sample:', JSON.stringify(turn[0], null, 2));
    console.log('OK: TURN configured');
  } else {
    console.warn('WARN: no TURN URLs — strict NAT may fail (STUN-only)');
  }

  const diag = await fetch(`${base}/api/webrtc/diagnostics`);
  if (diag.ok) {
    const body = await diag.json();
    console.log('Diagnostics:', JSON.stringify(body, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
