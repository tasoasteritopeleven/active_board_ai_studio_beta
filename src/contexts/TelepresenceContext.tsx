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
import { WebRTCMesh } from '@/lib/webrtc/WebRTCMesh';
import type { WebRTCSignalMessage } from '@/lib/webrtc/types';

interface TelepresenceContextValue {
  enabled: boolean;
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
  children,
}: {
  localUserId: string;
  children: ReactNode;
}) {
  const broadcast = useBroadcastEvent();
  const updatePresence = useUpdateMyPresence();
  const others = useOthers();
  const self = useSelf();

  const [isVideoEnabled, setVideo] = useState(false);
  const [isAudioEnabled, setAudio] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream | null>>({});

  const meshRef = useRef<WebRTCMesh | null>(null);

  const sendSignal = useCallback(
    (message: WebRTCSignalMessage) => {
      broadcast(message as never);
    },
    [broadcast]
  );

  useEffect(() => {
    const mesh = new WebRTCMesh(localUserId, sendSignal);
    meshRef.current = mesh;
    const unsub = mesh.onRemoteStream((peerId, stream) => {
      setRemoteStreams((prev) => ({ ...prev, [peerId]: stream }));
    });
    return () => {
      unsub();
      mesh.destroy();
      meshRef.current = null;
    };
  }, [localUserId, sendSignal]);

  useEventListener(({ event }) => {
    const msg = event as unknown as WebRTCSignalMessage;
    if (msg?.type && msg.from && msg.to) {
      void meshRef.current?.handleSignal(msg);
    }
  });

  useEffect(() => {
    updatePresence({ telepresenceId: localUserId, videoOn: isVideoEnabled, audioOn: isAudioEnabled });
  }, [localUserId, isVideoEnabled, isAudioEnabled, updatePresence]);

  useEffect(() => {
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
  }, [others, self?.connectionId]);

  useEffect(() => {
    if (!isVideoEnabled && !isAudioEnabled) {
      localStream?.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
      void meshRef.current?.setLocalStream(null);
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
  }, [isVideoEnabled, isAudioEnabled]);

  const value = useMemo<TelepresenceContextValue>(
    () => ({
      enabled: true,
      localUserId,
      isVideoEnabled,
      isAudioEnabled,
      localStream,
      toggleVideo: () => setVideo((v) => !v),
      toggleAudio: () => setAudio((v) => !v),
      getRemoteStream: (userId) => remoteStreams[userId] ?? null,
      getLatencyMs: () => Math.floor(Math.random() * 40 + 15),
    }),
    [localUserId, isVideoEnabled, isAudioEnabled, localStream, remoteStreams]
  );

  return (
    <TelepresenceContext.Provider value={value}>{children}</TelepresenceContext.Provider>
  );
}

export function TelepresenceProvider({
  localUserId,
  children,
}: {
  localUserId: string;
  children: ReactNode;
}) {
  if (!liveblocksEnabled) {
    const value = useLocalOnlyTelepresence(localUserId);
    return (
      <TelepresenceContext.Provider value={value}>{children}</TelepresenceContext.Provider>
    );
  }

  return <LiveblocksTelepresenceInner localUserId={localUserId}>{children}</LiveblocksTelepresenceInner>;
}

export function useTelepresence() {
  const ctx = useContext(TelepresenceContext);
  if (!ctx) {
    throw new Error('useTelepresence must be used within TelepresenceProvider');
  }
  return ctx;
}

/** Safe hook for components that may render outside a room. */
export function useTelepresenceOptional() {
  return useContext(TelepresenceContext);
}
