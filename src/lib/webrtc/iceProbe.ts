import { fetchRtcConfiguration } from './fetchIceServers';

export interface IceProbeResult {
  ok: boolean;
  candidateTypes: string[];
  usedTurn: boolean;
  error?: string;
  durationMs: number;
}

/**
 * Browser ICE gather probe — detects relay (TURN) candidates when behind NAT.
 */
export async function probeIceConnectivity(timeoutMs = 8000): Promise<IceProbeResult> {
  const start = Date.now();
  const types = new Set<string>();
  let usedTurn = false;

  try {
    const config = await fetchRtcConfiguration();
    const pc = new RTCPeerConnection(config);
    pc.createDataChannel('tableforge-probe');

    const done = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('ICE gather timeout')), timeoutMs);
      pc.onicecandidate = (ev) => {
        if (!ev.candidate) {
          clearTimeout(timer);
          resolve();
          return;
        }
        const c = ev.candidate;
        if (c.type) types.add(c.type);
        if (c.type === 'relay') usedTurn = true;
      };
      pc.onicegatheringstatechange = () => {
        if (pc.iceGatheringState === 'complete') {
          clearTimeout(timer);
          resolve();
        }
      };
    });

    await pc.setLocalDescription(await pc.createOffer());
    await done;
    pc.close();

    return {
      ok: types.size > 0,
      candidateTypes: [...types],
      usedTurn,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      ok: false,
      candidateTypes: [...types],
      usedTurn,
      error: err instanceof Error ? err.message : 'ICE probe failed',
      durationMs: Date.now() - start,
    };
  }
}
