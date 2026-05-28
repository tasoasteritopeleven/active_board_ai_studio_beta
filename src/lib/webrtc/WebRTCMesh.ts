import type { WebRTCSignalMessage } from './types';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

type SignalSender = (message: WebRTCSignalMessage) => void;

/**
 * Small-group mesh (2–6 peers). Signaling is delegated to Liveblocks broadcast.
 */
export class WebRTCMesh {
  private readonly localId: string;
  private readonly sendSignal: SignalSender;
  private readonly peers = new Map<string, RTCPeerConnection>();
  private localStream: MediaStream | null = null;
  private readonly remoteStreams = new Map<string, MediaStream>();
  private readonly listeners = new Set<(peerId: string, stream: MediaStream | null) => void>();

  constructor(localId: string, sendSignal: SignalSender) {
    this.localId = localId;
    this.sendSignal = sendSignal;
  }

  onRemoteStream(cb: (peerId: string, stream: MediaStream | null) => void) {
    this.listeners.add(cb);
    this.remoteStreams.forEach((stream, peerId) => cb(peerId, stream));
    return () => this.listeners.delete(cb);
  }

  getRemoteStream(peerId: string) {
    return this.remoteStreams.get(peerId) ?? null;
  }

  async setLocalStream(stream: MediaStream | null) {
    this.localStream = stream;

    for (const [peerId, pc] of this.peers) {
      const senders = pc.getSenders();
      for (const sender of senders) {
        pc.removeTrack(sender);
      }
      if (stream) {
        for (const track of stream.getTracks()) {
          pc.addTrack(track, stream);
        }
      }
      await this.renegotiate(peerId, pc);
    }
  }

  async connectPeer(remoteId: string) {
    if (remoteId === this.localId || this.peers.has(remoteId)) return;

    const pc = this.createPeerConnection(remoteId);
    this.peers.set(remoteId, pc);

    if (this.localStream) {
      for (const track of this.localStream.getTracks()) {
        pc.addTrack(track, this.localStream);
      }
    }

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.sendSignal({ type: 'offer', from: this.localId, to: remoteId, sdp: offer });
  }

  async disconnectPeer(remoteId: string) {
    const pc = this.peers.get(remoteId);
    if (!pc) return;
    pc.close();
    this.peers.delete(remoteId);
    this.setRemoteStream(remoteId, null);
    this.sendSignal({ type: 'hangup', from: this.localId, to: remoteId });
  }

  async handleSignal(message: WebRTCSignalMessage) {
    if (message.to !== this.localId) return;

    if (message.type === 'hangup') {
      await this.disconnectPeer(message.from);
      return;
    }

    let pc = this.peers.get(message.from);
    if (!pc && (message.type === 'offer' || message.type === 'answer')) {
      pc = this.createPeerConnection(message.from);
      this.peers.set(message.from, pc);
      if (this.localStream) {
        for (const track of this.localStream.getTracks()) {
          pc.addTrack(track, this.localStream);
        }
      }
    }
    if (!pc) {
      if (message.type === 'ice' && message.candidate) {
        const pending = this.createPeerConnection(message.from);
        this.peers.set(message.from, pending);
        await pending.addIceCandidate(message.candidate);
      }
      return;
    }

    if (message.type === 'offer' && message.sdp) {
      await pc.setRemoteDescription(message.sdp);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.sendSignal({ type: 'answer', from: this.localId, to: message.from, sdp: answer });
    } else if (message.type === 'answer' && message.sdp) {
      await pc.setRemoteDescription(message.sdp);
    } else if (message.type === 'ice' && message.candidate) {
      try {
        await pc.addIceCandidate(message.candidate);
      } catch {
        /* ignore stale ICE */
      }
    }
  }

  destroy() {
    for (const id of [...this.peers.keys()]) {
      void this.disconnectPeer(id);
    }
    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;
    this.listeners.clear();
  }

  private createPeerConnection(remoteId: string) {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        this.sendSignal({
          type: 'ice',
          from: this.localId,
          to: remoteId,
          candidate: ev.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (ev) => {
      const [stream] = ev.streams;
      if (stream) this.setRemoteStream(remoteId, stream);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.setRemoteStream(remoteId, null);
      }
    };

    return pc;
  }

  private async renegotiate(remoteId: string, pc: RTCPeerConnection) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.sendSignal({ type: 'offer', from: this.localId, to: remoteId, sdp: offer });
  }

  private setRemoteStream(peerId: string, stream: MediaStream | null) {
    if (stream) this.remoteStreams.set(peerId, stream);
    else this.remoteStreams.delete(peerId);
    this.listeners.forEach((cb) => cb(peerId, stream));
  }
}
