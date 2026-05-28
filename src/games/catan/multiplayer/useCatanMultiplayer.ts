import { useCallback, useEffect, useRef } from 'react';
import { useBroadcastEvent, useEventListener, useOthers, useSelf } from '@liveblocks/react';
import { liveblocksEnabled } from '@/lib/liveblocks/client';
import { useCatanStore } from '../store/catanStore';
import {
  applyCatanSnapshot,
  exportCatanSnapshot,
  parseStoredSnapshot,
  type CatanSyncSnapshot,
} from './catanSync';

const SYNC_EVENT = 'CATAN_STATE_SYNC';

interface CatanSyncEvent {
  type: typeof SYNC_EVENT;
  snapshot: CatanSyncSnapshot;
  hostConnectionId: number;
}

export function useCatanMultiplayer(roomEnabled: boolean) {
  const self = useSelf();
  const others = useOthers();
  const broadcast = useBroadcastEvent();
  const isInRoom = roomEnabled && liveblocksEnabled && Boolean(self);

  const isHost =
    isInRoom &&
    (others.length === 0 ||
      self!.connectionId <= Math.min(...others.map((o) => o.connectionId)));

  const lastVersion = useRef(0);
  const applyingRemote = useRef(false);

  const pushSnapshot = useCallback(
    (snapshot: CatanSyncSnapshot) => {
      if (!isHost || !self) return;
      const event: CatanSyncEvent = {
        type: SYNC_EVENT,
        snapshot,
        hostConnectionId: self.connectionId,
      };
      broadcast(event as never);
    },
    [broadcast, isHost, self]
  );

  useEventListener(({ event }) => {
    const msg = event as unknown as CatanSyncEvent;
    if (msg?.type !== SYNC_EVENT || !msg.snapshot) return;
    if (isHost && msg.hostConnectionId === self?.connectionId) return;
    if (msg.snapshot.version <= lastVersion.current) return;

    applyingRemote.current = true;
    lastVersion.current = msg.snapshot.version;
    applyCatanSnapshot(msg.snapshot);
    applyingRemote.current = false;
  });

  useEffect(() => {
    if (!isHost) return;

    const unsub = useCatanStore.subscribe((state, prev) => {
      if (applyingRemote.current) return;
      if (
        state.phase === prev.phase &&
        state.turnNumber === prev.turnNumber &&
        state.diceRollId === prev.diceRollId &&
        state.winnerPlayerId === prev.winnerPlayerId
      ) {
        return;
      }
      const snap = exportCatanSnapshot(state);
      if (snap.version <= lastVersion.current) return;
      lastVersion.current = snap.version;
      pushSnapshot(snap);
    });

    return unsub;
  }, [isHost, pushSnapshot]);

  useEffect(() => {
    if (!isHost || !isInRoom) return;
    const snap = exportCatanSnapshot(useCatanStore.getState());
    pushSnapshot(snap);
  }, [isHost, isInRoom, pushSnapshot]);

  return {
    isInRoom,
    isHost,
    playerCount: isInRoom ? 1 + others.length : 1,
  };
}
