let cachedConfig: RTCConfiguration | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

const FALLBACK: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

/**
 * Fetches TURN/STUN config from TableForge API (coturn credentials minted server-side).
 */
export async function fetchRtcConfiguration(): Promise<RTCConfiguration> {
  if (cachedConfig && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const res = await fetch('/api/webrtc/ice-servers');
    if (!res.ok) {
      cachedConfig = FALLBACK;
      cachedAt = Date.now();
      return cachedConfig;
    }
    const body = (await res.json()) as { iceServers?: RTCIceServer[] };
    cachedConfig = {
      iceServers: body.iceServers?.length ? body.iceServers : FALLBACK.iceServers,
    };
    cachedAt = Date.now();
    return cachedConfig;
  } catch {
    return FALLBACK;
  }
}
