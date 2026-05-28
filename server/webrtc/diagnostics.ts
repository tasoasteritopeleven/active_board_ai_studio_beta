import { buildIceServers } from './iceServers.js';

export function getWebRtcDiagnostics() {
  const iceServers = buildIceServers();
  const turnUrls = iceServers.filter((s) => {
    const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
    return urls.some((u) => String(u).startsWith('turn'));
  });

  return {
    stunCount: iceServers.length - turnUrls.length,
    turnCount: turnUrls.length,
    hasTurnTls: turnUrls.some((s) => {
      const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
      return urls.some((u) => String(u).startsWith('turns:'));
    }),
    turnConfigured: turnUrls.length > 0,
    realm: process.env.TURN_REALM ?? null,
    recommendedClientUrls: turnUrls.flatMap((s) => {
      const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
      return urls.map(String);
    }),
  };
}
