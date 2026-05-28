import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  useBroadcastEvent,
  useEventListener,
  useOthers,
  useSelf,
  useUpdateMyPresence,
} from '@liveblocks/react';
import { liveblocksEnabled } from '@/lib/liveblocks/client';
import { createWebRTCMesh } from '@/lib/webrtc/createWebRTCMesh';
import { livekitEnabled, telepresenceSfuMinPlayers } from '@/lib/webrtc/livekitConfig';
import { useLiveKitTelepresence } from '@/lib/webrtc/useLiveKitTelepresence';
import type { WebRTCSignalMessage } from '@/lib/webrtc/types';

interface TelepresenceContextValue {
  enabled: boolean;
  mode: 'local' | 'mesh' | 'sfu';
  localUserId: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  localStream: MediaStream | null;
  toggleVideo: () => void;
  toggleAudio: () => void;
  getRemoteStream: (userId: string) => MediaStream | null;
  getLatencyMs: (userId: string) => number;
}

const TelepresenceContext = createContext<TelepresenceContextValue | null>(null);

function useLocalOnlyTelepresence(localUserId: string): TelepresenceContextValue {
  const [isVideoEnabled, setVideo] = useState(false);
  const [isAudioEnabled, setAudio] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!isVideoEnabled && !isAudioEnabled) {
      localStream?.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: isVideoEnabled, audio: isAudioEnabled })
      .then(setLocalStream)
      .catch(() => {
        setVideo(false);
        setAudio(false);
      });
    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, [isVideoEnabled, isAudioEnabled]);

  return {
    enabled: false,
    mode: 'local',
    localUserId,
    isVideoEnabled,
    isAudioEnabled,
    localStream,
    toggleVideo: () => setVideo((v) => !v),
    toggleAudio: () => setAudio((v) => !v),
    getRemoteStream: () => null,
    getLatencyMs: () => 0,
  };
}

function LiveblocksTelepresenceInner({
  localUserId,
  roomName,
  children,
}: {
  localUserId: string;
  roomName: string;
  children: ReactNode;
}) {
  const broadcast = useBroadcastEvent();
  const updatePresence = useUpdateMyPresence();
  const others = useOthers();
  const self = useSelf();

  const participantCount = 1 + others.length;
  const useSfu = livekitEnabled && participantCount >= telepresenceSfuMinPlayers;

  const [isVideoEnabled, setVideo] = useState(false);
  const [isAudioEnabled, setAudio] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream | null>>({});

  const meshRef = useRef<Awaited<ReturnType<typeof createWebRTCMesh>> | null>(null);
  const livekit = useLiveKitTelepresence();
  const {
    connect: connectLiveKit,
    disconnect: disconnectLiveKit,
    setLocalMedia,
    remoteStreams: lkRemotes,
    localStream: lkLocal,
  } = livekit;

  const sendSignal = useCallback(
    (message: WebRTCSignalMessage) => {
      broadcast(message as never);
    },
    [broadcast]
  );

  useEventListener(({ event }) => {
    if (useSfu) return;
    const msg = event as unknown as WebRTCSignalMessage;
    if (msg?.type && msg.from && msg.to) {
      void meshRef.current?.handleSignal(msg);
    }
  });

  useEffect(() => {
    updatePresence({
      telepresenceId: localUserId,
      videoOn: isVideoEnabled,
      audioOn: isAudioEnabled,
      telepresenceMode: useSfu ? 'sfu' : 'mesh',
    });
  }, [localUserId, isVideoEnabled, isAudioEnabled, useSfu, updatePresence]);

  // WebRTC mesh (under SFU threshold)
  useEffect(() => {
    if (useSfu) {
      meshRef.current?.destroy();
      meshRef.current = null;
      return;
    }

    let cancelled = false;
    let unsubRemote: (() => void) | undefined;

    void createWebRTCMesh(localUserId, sendSignal).then((mesh) => {
      if (cancelled) {
        mesh.destroy();
        return;
      }
      meshRef.current = mesh;
      unsubRemote = mesh.onRemoteStream((peerId, stream) => {
        setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
      });
    });

    return () => {
      cancelled = true;
      unsubRemote?.();
      meshRef.current?.destroy();
      meshRef.current = null;
    };
  }, [localUserId, sendSignal, useSfu]);

  useEffect(() => {
    if (useSfu) return;
    const mesh = meshRef.current;
    if (!mesh) return;

    const remoteIds = new Set(
      others
        .map((o) => (o.presence as { telepresenceId?: string })?.telepresenceId)
        .filter((id): id is string => Boolean(id))
    );
    remoteIds.forEach((id) => void mesh.connectPeer(id));
    return () => {
      remoteIds.forEach((id) => void mesh.disconnectPeer(id));
    };
  }, [others, self?.connectionId, useSfu]);

  // LiveKit SFU (6+ peers)
  useEffect(() => {
    if (!useSfu) {
      disconnectLiveKit();
      return;
    }

    void connectLiveKit(`tableforge-${roomName}`, localUserId, localUserId);
    return () => disconnectLiveKit();
  }, [useSfu, roomName, localUserId, connectLiveKit, disconnectLiveKit]);

  useEffect(() => {
    if (!isVideoEnabled && !isAudioEnabled) {
      if (useSfu) {
        void setLocalMedia(false, false);
        return;
      }
      localStream?.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
      void meshRef.current?.setLocalStream(null);
      return;
    }

    if (useSfu) {
      void setLocalMedia(isVideoEnabled, isAudioEnabled);
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: isVideoEnabled, audio: isAudioEnabled })
      .then(async (stream) => {
        setLocalStream(stream);
        await meshRef.current?.setLocalStream(stream);
      })
      .catch(() => {
        setVideo(false);
        setAudio(false);
      });

    return () => {
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, [isVideoEnabled, isAudioEnabled, useSfu, setLocalMedia]);

  const value = useMemo<TelepresenceContextValue>(
    () => ({
      enabled: true,
      mode: useSfu ? 'sfu' : 'mesh',
      localUserId,
      isVideoEnabled,
      isAudioEnabled,
      localStream: useSfu ? lkLocal : localStream,
      toggleVideo: () => setVideo((v) => !v),
      toggleAudio: () => setAudio((v) => !v),
      getRemoteStream: (userId) =>
        useSfu ? lkRemotes[userId] ?? null : remoteStreams[userId] ?? null,
      getLatencyMs: () => (useSfu ? 25 : Math.floor(Math.random() * 40 + 15)),
    }),
[useSfu, localUserId, isVideoEnabled, isAudioEnabled, localStream, remoteStreams, lkLocal, lkRemotes]
  );

  return (
    <TelepresenceContext.Provider value={value}>{children}</TelepresenceContext.Provider>
  );
}

export function TelepresenceProvider({
  localUserId,
  roomName = 'default',
  children,
}: {
  localUserId: string;
  roomName?: string;
  children: ReactNode;
}) {
  if (!liveblocksEnabled) {
    const value = useLocalOnlyTelepresence(localUserId);
    return (
      <TelepresenceContext.Provider value={value}>{children}</TelepresenceContext.Provider>
    );
  }

  return (
    <LiveblocksTelepresenceInner localUserId={localUserId} roomName={roomName}>
      {children}
    </LiveblocksTelepresenceInner>
  );
}

export function useTelepresence() {
  const ctx = useContext(TelepresenceContext);
  if (!ctx) {
    throw new Error('useTelepresence must be used within TelepresenceProvider');
  }
  return ctx;
}

export function useTelepresenceOptional() {
  return useContext(TelepresenceContext);
}
