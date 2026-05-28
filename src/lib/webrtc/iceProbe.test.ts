import { describe, it, expect, vi, beforeEach } from 'vitest';
import { probeIceConnectivity } from './iceProbe';

describe('iceProbe fallback', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        }),
      })
    );
  });

  it('returns structured result when RTCPeerConnection is unavailable', async () => {
    const original = globalThis.RTCPeerConnection;
    // @ts-ignore test env may lack WebRTC
    delete globalThis.RTCPeerConnection;

    const result = await probeIceConnectivity(1000);
    expect(result).toHaveProperty('ok');
    expect(result).toHaveProperty('durationMs');

    globalThis.RTCPeerConnection = original;
  });
});
