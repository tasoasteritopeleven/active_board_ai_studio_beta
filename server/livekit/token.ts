import { AccessToken } from 'livekit-server-sdk';

export function isLiveKitConfigured(): boolean {
  return Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET);
}

export async function createLiveKitParticipantToken(params: {
  roomName: string;
  identity: string;
  name?: string;
}): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error('LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set');
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: params.identity,
    name: params.name ?? params.identity,
    ttl: '2h',
  });

  token.addGrant({
    roomJoin: true,
    room: params.roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return await token.toJwt();
}
