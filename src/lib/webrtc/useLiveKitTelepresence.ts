import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Room,
  RoomEvent,
  Track,
  type RemoteParticipant,
  type RemoteTrackPublication,
} from 'livekit-client';
import { livekitUrl } from './livekitConfig';

interface LiveKitTelepresenceState {
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream | null>;
  connect: (roomName: string, identity: string, displayName: string) => Promise<void>;
  disconnect: () => void;
  setLocalMedia: (video: boolean, audio: boolean) => Promise<void>;
}

function publicationToStream(
  participant: RemoteParticipant,
  publication: RemoteTrackPublication
): MediaStream | null {
  if (publication.kind !== Track.Kind.Video && publication.kind !== Track.Kind.Audio) {
    return null;
  }
  const track = publication.track;
  if (!track) return null;
  const stream = new MediaStream();
  stream.addTrack(track.mediaStreamTrack);
  return stream;
}

export function useLiveKitTelepresence(): LiveKitTelepresenceState {
  const roomRef = useRef<Room | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream | null>>({});

  const disconnect = useCallback(() => {
    const room = roomRef.current;
    if (room) {
      room.disconnect();
      roomRef.current = null;
    }
    setLocalStream(null);
    setRemoteStreams({});
  }, []);

  const connect = useCallback(
    async (roomName: string, identity: string, displayName: string) => {
      if (!livekitUrl) throw new Error('VITE_LIVEKIT_URL not configured');

      const tokenRes = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: roomName, identity, name: displayName }),
      });
      if (!tokenRes.ok) {
        throw new Error('Failed to obtain LiveKit token');
      }
      const { token } = (await tokenRes.json()) as { token: string };

      disconnect();

      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      const upsertRemote = (participant: RemoteParticipant) => {
        const id = participant.identity;
        const stream = new MediaStream();
        participant.trackPublications.forEach((pub) => {
          const track = pub.track;
          if (track?.mediaStreamTrack) {
            stream.addTrack(track.mediaStreamTrack);
          }
        });
        setRemoteStreams((prev) => ({
          ...prev,
          [id]: stream.getTracks().length ? stream : null,
        }));
      };

      room.on(RoomEvent.TrackSubscribed, (_track, publication, participant) => {
        const stream = publicationToStream(participant, publication);
        if (stream) {
          setRemoteStreams((prev) => ({ ...prev, [participant.identity]: stream }));
        }
      });

      room.on(RoomEvent.TrackUnsubscribed, (_track, _publication, participant) => {
        setRemoteStreams((prev) => ({ ...prev, [participant.identity]: null }));
      });

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        upsertRemote(participant);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        setRemoteStreams((prev) => {
          const next = { ...prev };
          delete next[participant.identity];
          return next;
        });
      });

      await room.connect(livekitUrl, token);

      for (const p of room.remoteParticipants.values()) {
        upsertRemote(p);
      }
    },
    [disconnect]
  );

  const setLocalMedia = useCallback(async (video: boolean, audio: boolean) => {
    const room = roomRef.current;
    if (!room) return;

    await room.localParticipant.setCameraEnabled(video);
    await room.localParticipant.setMicrophoneEnabled(audio);

    const stream = new MediaStream();
    room.localParticipant.trackPublications.forEach((pub) => {
      const track = pub.track;
      if (track?.mediaStreamTrack) {
        stream.addTrack(track.mediaStreamTrack);
      }
    });
    setLocalStream(stream.getTracks().length ? stream : null);
  }, []);

  useEffect(() => () => disconnect(), [disconnect]);

  return {
    localStream,
    remoteStreams,
    connect,
    disconnect,
    setLocalMedia,
  };
}
