import { fetchRtcConfiguration } from './fetchIceServers';
import { WebRTCMesh } from './WebRTCMesh';
import type { WebRTCSignalMessage } from './types';

type SignalSender = (message: WebRTCSignalMessage) => void;

/** Mesh peer with TURN/STUN from the TableForge API. */
export async function createWebRTCMesh(
  localId: string,
  sendSignal: SignalSender
): Promise<WebRTCMesh> {
  const rtcConfiguration = await fetchRtcConfiguration();
  return new WebRTCMesh(localId, sendSignal, rtcConfiguration);
}
