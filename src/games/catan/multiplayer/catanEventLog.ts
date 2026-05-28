import type { CatanEvent } from '../domain/events/catanEvent';
import type { CommandId, EdgeId, EventId, HexId, PlayerId, VertexId } from '../domain/model/catanMatchState';
import type { CatanStoreSnapshot } from './catanStoreTypes';
import type { CatanSyncSnapshot } from './catanSync';

export type CatanLogEntry =
  | { kind: 'checkpoint'; seq: number; snapshot: CatanSyncSnapshot }
  | { kind: 'domain'; seq: number; event: CatanEvent };

export function serializeLogEntry(entry: CatanLogEntry): string {
  return JSON.stringify(entry);
}

export function parseLogEntry(raw: string): CatanLogEntry | null {
  try {
    const parsed = JSON.parse(raw) as CatanLogEntry;
    if (parsed?.kind === 'checkpoint' && parsed.snapshot) return parsed;
    if (parsed?.kind === 'domain' && parsed.event?.type) return parsed;
    return null;
  } catch {
    return null;
  }
}

function newEventId(): EventId {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` as EventId;
}

function newCommandId(): CommandId {
  return `cmd-${Date.now()}` as CommandId;
}

/** Derive domain events from Zustand diffs (host authoritative). */
export function deriveCatanEventsFromDiff(
  prev: CatanStoreSnapshot,
  next: CatanStoreSnapshot
): CatanEvent[] {
  const events: CatanEvent[] = [];
  const timestamp = Date.now();

  if (next.diceRollId > prev.diceRollId && next.diceResult) {
    events.push({
      eventId: newEventId(),
      commandId: newCommandId(),
      timestamp,
      type: 'DICE_ROLLED',
      payload: {
        playerId: prev.activePlayerId as PlayerId,
        dice1: next.diceResult[0],
        dice2: next.diceResult[1],
        total: next.diceResult[0] + next.diceResult[1],
      },
    });
  }

  if (next.turnNumber > prev.turnNumber) {
    events.push({
      eventId: newEventId(),
      commandId: newCommandId(),
      timestamp,
      type: 'TURN_ENDED',
      payload: {
        endedPlayerId: prev.activePlayerId as PlayerId,
        nextPlayerId: next.activePlayerId as PlayerId,
        newTurnNumber: next.turnNumber,
      },
    });
  }

  if (next.robberHexId !== prev.robberHexId) {
    events.push({
      eventId: newEventId(),
      commandId: newCommandId(),
      timestamp,
      type: 'ROBBER_MOVED',
      payload: {
        playerId: prev.activePlayerId as PlayerId,
        hexId: next.robberHexId as HexId,
      },
    });
  }

  for (const vertexId of Object.keys(next.vertices)) {
    const nextBuilding = next.vertices[vertexId]?.building;
    const prevBuilding = prev.vertices[vertexId]?.building;
    if (nextBuilding && !prevBuilding) {
      events.push({
        eventId: newEventId(),
        commandId: newCommandId(),
        timestamp,
        type: 'SETTLEMENT_PLACED',
        payload: {
          playerId: nextBuilding.ownerId as PlayerId,
          vertexId: vertexId as VertexId,
          isInitialPlacement: next.setupPhase !== 'COMPLETED',
        },
      });
    }
  }

  for (const edgeId of Object.keys(next.edges)) {
    const nextRoad = next.edges[edgeId]?.road;
    const prevRoad = prev.edges[edgeId]?.road;
    if (nextRoad && !prevRoad) {
      events.push({
        eventId: newEventId(),
        commandId: newCommandId(),
        timestamp,
        type: 'ROAD_PLACED',
        payload: {
          playerId: nextRoad.ownerId as PlayerId,
          edgeId: edgeId as EdgeId,
          isInitialPlacement: next.setupPhase !== 'COMPLETED',
        },
      });
    }
  }

  return events;
}

/** Significant state change that should force a storage checkpoint. */
export function shouldCheckpoint(prev: CatanStoreSnapshot, next: CatanStoreSnapshot): boolean {
  return (
    prev.phase !== next.phase ||
    prev.setupPhase !== next.setupPhase ||
    prev.winnerPlayerId !== next.winnerPlayerId ||
    Object.keys(prev.players).length !== Object.keys(next.players).length
  );
}
