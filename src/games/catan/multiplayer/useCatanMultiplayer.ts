import '@/lib/liveblocks/liveblocks.config';
import { useCallback, useEffect, useRef } from 'react';
import { LiveList, LiveObject } from '@liveblocks/client';
import { useMutation, useOthers, useSelf, useStorage } from '@liveblocks/react';
import { liveblocksEnabled } from '@/lib/liveblocks/client';
import { useCatanStore } from '../store/catanStore';
import {
  applyCatanSnapshot,
  exportCatanSnapshot,
  parseStoredSnapshot,
  type CatanSyncSnapshot,
} from './catanSync';
import {
  deriveCatanEventsFromDiff,
  parseLogEntry,
  serializeLogEntry,
  shouldCheckpoint,
  type CatanLogEntry,
} from './catanEventLog';

const CHECKPOINT_INTERVAL = 20;

export function useCatanMultiplayer(roomEnabled: boolean) {
  const self = useSelf();
  const others = useOthers();
  const isInRoom = roomEnabled && liveblocksEnabled && Boolean(self);

  const isHost =
    isInRoom &&
    (others.length === 0 ||
      self!.connectionId <= Math.min(...others.map((o) => o.connectionId)));

  const logEntries = useStorage((root) => root.catanLog ?? []);

  const checkpointSeq = useStorage((root) => root.catanCheckpoint?.seq ?? 0);
  const checkpointJson = useStorage((root) => root.catanCheckpoint?.snapshotJson ?? '');

  const appendEntries = useMutation(
    ({ storage }, entries: CatanLogEntry[]) => {
      const log = storage.get('catanLog') as LiveList<string> | undefined;
      if (!log) return;
      for (const entry of entries) {
        log.push(serializeLogEntry(entry));
      }
    },
    []
  );

  const writeCheckpoint = useMutation(
    (
      { storage },
      snapshot: CatanSyncSnapshot,
      seq: number,
      hostConnectionId: number | null
    ) => {
      const checkpoint = storage.get('catanCheckpoint') as
        | LiveObject<{
            seq: number;
            snapshotJson: string;
            hostConnectionId: number | null;
          }>
        | undefined;
      if (!checkpoint) return;
      checkpoint.set('seq', seq);
      checkpoint.set('snapshotJson', JSON.stringify(snapshot));
      checkpoint.set('hostConnectionId', hostConnectionId);
    },
    []
  );

  const lastAppliedSeq = useRef(0);
  const hostSeq = useRef(0);
  const applyingRemote = useRef(false);
  const eventsSinceCheckpoint = useRef(0);

  const applyEntry = useCallback((entry: CatanLogEntry) => {
    if (entry.kind === 'checkpoint') {
      applyCatanSnapshot(entry.snapshot);
      return;
    }
    // Domain events are persisted for audit/replay; Zustand stays in sync via checkpoints + snapshots.
  }, []);

  useEffect(() => {
    if (!isInRoom || logEntries === undefined) return;

    const parsed = logEntries
      .map(parseLogEntry)
      .filter((e): e is CatanLogEntry => e !== null)
      .sort((a, b) => a.seq - b.seq);

    for (const entry of parsed) {
      if (entry.seq <= lastAppliedSeq.current) continue;
      if (isHost && entry.seq === hostSeq.current) continue;

      applyingRemote.current = true;
      applyEntry(entry);
      lastAppliedSeq.current = entry.seq;
      applyingRemote.current = false;
    }
  }, [logEntries, isInRoom, isHost, applyEntry]);

  useEffect(() => {
    if (!isInRoom || isHost) return;
    if (!checkpointJson || checkpointSeq <= lastAppliedSeq.current) return;

    const snapshot = parseStoredSnapshot(checkpointJson);
    if (!snapshot) return;

    applyingRemote.current = true;
    applyCatanSnapshot(snapshot);
    lastAppliedSeq.current = checkpointSeq;
    applyingRemote.current = false;
  }, [checkpointJson, checkpointSeq, isInRoom, isHost]);

  useEffect(() => {
    if (!isHost) return;

    const unsub = useCatanStore.subscribe((state, prev) => {
      if (applyingRemote.current) return;

      const domainEvents = deriveCatanEventsFromDiff(prev, state);
      const needsCheckpoint =
        shouldCheckpoint(prev, state) ||
        eventsSinceCheckpoint.current >= CHECKPOINT_INTERVAL ||
        domainEvents.length === 0;

      if (needsCheckpoint) {
        const snapshot = exportCatanSnapshot(state);
        hostSeq.current += 1;
        const entry: CatanLogEntry = {
          kind: 'checkpoint',
          seq: hostSeq.current,
          snapshot,
        };
        void appendEntries([entry]);
        void writeCheckpoint(snapshot, hostSeq.current, self?.connectionId ?? null);
        eventsSinceCheckpoint.current = 0;
        lastAppliedSeq.current = hostSeq.current;
        return;
      }

      const entries: CatanLogEntry[] = domainEvents.map((event) => {
        hostSeq.current += 1;
        eventsSinceCheckpoint.current += 1;
        return { kind: 'domain', seq: hostSeq.current, event };
      });

      if (entries.length) {
        void appendEntries(entries);
        lastAppliedSeq.current = hostSeq.current;
      }
    });

    return unsub;
  }, [isHost, appendEntries, writeCheckpoint]);

  useEffect(() => {
    if (!isHost || !isInRoom) return;
    const snap = exportCatanSnapshot(useCatanStore.getState());
    hostSeq.current += 1;
    const entry: CatanLogEntry = { kind: 'checkpoint', seq: hostSeq.current, snapshot: snap };
    void appendEntries([entry]);
    void writeCheckpoint(snap, hostSeq.current, self?.connectionId ?? null);
    lastAppliedSeq.current = hostSeq.current;
    eventsSinceCheckpoint.current = 0;
  }, [isHost, isInRoom, appendEntries, writeCheckpoint]);

  return {
    isInRoom,
    isHost,
    playerCount: isInRoom ? 1 + others.length : 1,
    eventLogLength: logEntries?.length ?? 0,
    lastSeq: lastAppliedSeq.current,
  };
}
