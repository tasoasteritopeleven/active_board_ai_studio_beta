import crypto from 'node:crypto';

export interface IceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

/**
 * Builds WebRTC ICE servers for STUN + TURN (coturn static or time-limited REST credentials).
 *
 * Env:
 * - TURN_URLS: comma-separated turn:/turns: URLs
 * - TURN_USERNAME + TURN_CREDENTIAL (static)
 * - TURN_USERNAME + TURN_SECRET (coturn use-auth-secret / REST HMAC)
 * - TURN_TTL_SECONDS (default 86400)
 */
export function buildIceServers(): IceServerConfig[] {
  const servers: IceServerConfig[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  const turnUrls = process.env.TURN_URLS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!turnUrls?.length) return servers;

  const username = process.env.TURN_USERNAME;
  const staticCredential = process.env.TURN_CREDENTIAL;
  const secret = process.env.TURN_SECRET;

  if (secret && username) {
    const ttl = Number(process.env.TURN_TTL_SECONDS ?? 86400);
    const expiry = Math.floor(Date.now() / 1000) + ttl;
    const tempUser = `${expiry}:${username}`;
    const credential = crypto.createHmac('sha1', secret).update(tempUser).digest('base64');
    for (const url of turnUrls) {
      servers.push({ urls: url, username: tempUser, credential });
    }
    return servers;
  }

  if (username && staticCredential) {
    for (const url of turnUrls) {
      servers.push({ urls: url, username, credential: staticCredential });
    }
    return servers;
  }

  for (const url of turnUrls) {
    servers.push({ urls: url });
  }
  return servers;
}
