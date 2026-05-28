import { reduceCatanEvent } from '../domain/reducers/reduceCatanEvent';
import type { CatanEvent } from '../domain/events/catanEvent';
import type { CatanMatchState } from '../domain/model/catanMatchState';
import { useCatanStore } from '../store/catanStore';
import { LifecyclePhase } from '../domain/types';

import type { CatanStoreSnapshot } from './catanStoreTypes';


/** JSON-safe snapshot synced over Liveblocks (host-authoritative). */
export interface CatanSyncSnapshot {
  version: number;
  phase: LifecyclePhase;
  activePlayerId: string;
  turnOrder: string[];
  turnNumber: number;
  winnerPlayerId: string | null;
  robberHexId: string;
  diceResult: [number, number] | null;
  diceRollId: number;
  players: CatanStoreSnapshot['players'];
  hexes: CatanStoreSnapshot['hexes'];
  vertices: CatanStoreSnapshot['vertices'];
  edges: CatanStoreSnapshot['edges'];
  bankInventory: CatanStoreSnapshot['bankInventory'];
  setupPhase: CatanStoreSnapshot['setupPhase'];
  setupRolls: CatanStoreSnapshot['setupRolls'];
  currentTurnLog: CatanStoreSnapshot['currentTurnLog'];
}

export function exportCatanSnapshot(state: CatanStoreSnapshot): CatanSyncSnapshot {
  return {
    version: Date.now(),
    phase: state.phase,
    activePlayerId: state.activePlayerId,
    turnOrder: state.turnOrder,
    turnNumber: state.turnNumber,
    winnerPlayerId: state.winnerPlayerId ?? null,
    robberHexId: state.robberHexId,
    diceResult: state.diceResult,
    diceRollId: state.diceRollId,
    players: state.players,
    hexes: state.hexes,
    vertices: state.vertices,
    edges: state.edges,
    bankInventory: state.bankInventory,
    setupPhase: state.setupPhase,
    setupRolls: state.setupRolls,
    currentTurnLog: state.currentTurnLog,
  };
}

export function applyCatanSnapshot(snapshot: CatanSyncSnapshot) {
  useCatanStore.setState({
    phase: snapshot.phase,
    activePlayerId: snapshot.activePlayerId,
    turnOrder: snapshot.turnOrder,
    turnNumber: snapshot.turnNumber,
    winnerPlayerId: snapshot.winnerPlayerId,
    robberHexId: snapshot.robberHexId,
    diceResult: snapshot.diceResult,
    diceRollId: snapshot.diceRollId,
    players: snapshot.players,
    hexes: snapshot.hexes,
    vertices: snapshot.vertices,
    edges: snapshot.edges,
    bankInventory: snapshot.bankInventory,
    setupPhase: snapshot.setupPhase,
    setupRolls: snapshot.setupRolls,
    currentTurnLog: snapshot.currentTurnLog,
  });
}

/** Apply a domain event on top of a cloned authoritative model (for event-log sync). */
export function applyCatanDomainEvent(
  model: CatanMatchState,
  event: CatanEvent
): CatanMatchState {
  return reduceCatanEvent(model, event);
}

export function parseStoredSnapshot(json: string | null | undefined): CatanSyncSnapshot | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as CatanSyncSnapshot;
  } catch {
    return null;
  }
}