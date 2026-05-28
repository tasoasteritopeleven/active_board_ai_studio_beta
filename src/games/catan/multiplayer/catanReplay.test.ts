import { describe, it, expect } from 'vitest';
import type { CatanEvent } from '../domain/events/catanEvent';
import type { CommandId, EventId, PlayerId } from '../domain/model/catanMatchState';
import { LifecyclePhase } from '../domain/types';
import { serializeLogEntry } from './catanEventLog';
import { replayCatanLogEntries, replayDomainEventsOnSnapshot } from './catanReplay';
import type { CatanSyncSnapshot } from './catanSync';

function baseSnapshot(): CatanSyncSnapshot {
  return {
    version: 1,
    phase: LifecyclePhase.TRADING_BUILDING,
    activePlayerId: 'p1',
    turnOrder: ['p1', 'p2'],
    turnNumber: 3,
    winnerPlayerId: null,
    robberHexId: 'hex-0',
    diceResult: [3, 4],
    diceRollId: 2,
    players: {
      p1: {
        id: 'p1',
        name: 'P1',
        color: '#f00',
        resources: { WOOD: 2, BRICK: 1, SHEEP: 0, WHEAT: 0, ORE: 0 },
        victoryPoints: 2,
      },
      p2: {
        id: 'p2',
        name: 'P2',
        color: '#00f',
        resources: { WOOD: 0, BRICK: 0, SHEEP: 1, WHEAT: 1, ORE: 0 },
        victoryPoints: 1,
      },
    },
    hexes: {},
    vertices: {},
    edges: {},
    bankInventory: { WOOD: 19, BRICK: 19, SHEEP: 19, WHEAT: 19, ORE: 19, DEV_CARDS: 25 },
    setupPhase: 'COMPLETED',
    setupRolls: {},
    currentTurnLog: [],
  };
}

function diceEvent(): CatanEvent {
  return {
    eventId: 'e1' as EventId,
    commandId: 'c1' as CommandId,
    timestamp: Date.now(),
    type: 'DICE_ROLLED',
    payload: { playerId: 'p1' as PlayerId, dice1: 5, dice2: 6, total: 11 },
  };
}

describe('catanReplay', () => {
  it('replays domain events on checkpoint without extra checkpoints', () => {
    const base = baseSnapshot();
    const entries = [
      serializeLogEntry({ kind: 'checkpoint', seq: 1, snapshot: base }),
      serializeLogEntry({ kind: 'domain', seq: 2, event: diceEvent() }),
      serializeLogEntry({ kind: 'domain', seq: 3, event: diceEvent() }),
    ];

    const { snapshots, checkpointCount, domainEventCount } = replayCatanLogEntries(entries);
    expect(checkpointCount).toBe(1);
    expect(domainEventCount).toBe(2);
    expect(snapshots.length).toBe(3);
    expect(snapshots[2].diceRollId).toBeGreaterThanOrEqual(base.diceRollId);
  });

  it('replayDomainEventsOnSnapshot updates dice from reducer', () => {
    const base = baseSnapshot();
    const next = replayDomainEventsOnSnapshot(base, [diceEvent()]);
    expect(next.diceResult).toEqual([5, 6]);
    expect(next.diceRollId).toBe(base.diceRollId + 1);
  });
});
