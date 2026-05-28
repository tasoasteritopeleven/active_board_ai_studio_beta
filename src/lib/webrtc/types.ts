export type WebRTCSignalType = 'offer' | 'answer' | 'ice' | 'hangup';

export interface WebRTCSignalMessage {
  type: WebRTCSignalType;
  from: string;
  to: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

export interface TelepresencePeerState {
  connectionId: number;
  userId: string;
  stream: MediaStream | null;
}
