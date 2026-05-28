import { reduceCatanEvent } from '../domain/reducers/reduceCatanEvent';
import type { CatanEvent } from '../domain/events/catanEvent';
import type {
  CatanMatchState as DomainMatchState,
  EdgeId,
  HexId,
  MatchId,
  PlayerId,
  ResourceType as DomainResourceType,
  VertexId,
} from '../domain/model/catanMatchState';
import { BuildingType, MatchPhase, ResourceType, TurnPhase } from '../domain/model/catanMatchState';
import { LifecyclePhase, type ResourceType as UiResourceType } from '../domain/types';
import { useCatanStore } from '../store/catanStore';
import type { CatanStoreSnapshot } from './catanStoreTypes';
import type { CatanSyncSnapshot } from './catanSync';

const MATCH_ID = 'tableforge-match' as MatchId;

function uiResourceToDomain(res: Record<UiResourceType, number>): Record<DomainResourceType, number> {
  return {
    [ResourceType.WOOD]: res.WOOD ?? 0,
    [ResourceType.BRICK]: res.BRICK ?? 0,
    [ResourceType.SHEEP]: res.SHEEP ?? 0,
    [ResourceType.WHEAT]: res.WHEAT ?? 0,
    [ResourceType.ORE]: res.ORE ?? 0,
  };
}

function domainResourceToUi(res: Record<DomainResourceType, number>): Record<UiResourceType, number> {
  return {
    WOOD: res[ResourceType.WOOD] ?? 0,
    BRICK: res[ResourceType.BRICK] ?? 0,
    SHEEP: res[ResourceType.SHEEP] ?? 0,
    WHEAT: res[ResourceType.WHEAT] ?? 0,
    ORE: res[ResourceType.ORE] ?? 0,
  };
}

function lifecycleToMatchPhase(phase: LifecyclePhase): MatchPhase {
  switch (phase) {
    case LifecyclePhase.LOBBY:
      return MatchPhase.LOBBY;
    case LifecyclePhase.SETUP_1:
    case LifecyclePhase.SETUP_2:
      return MatchPhase.SETUP;
    case LifecyclePhase.GAME_OVER:
      return MatchPhase.COMPLETED;
    default:
      return MatchPhase.PLAYING;
  }
}

function turnPhaseFromLifecycle(phase: LifecyclePhase): TurnPhase {
  switch (phase) {
    case LifecyclePhase.ROLLING:
      return TurnPhase.ROLLING;
    case LifecyclePhase.ROBBER_MOVE:
      return TurnPhase.ROBBER_PLACEMENT;
    case LifecyclePhase.ROBBER_DISCARD:
      return TurnPhase.DISCARDING;
    case LifecyclePhase.TRADING_BUILDING:
      return TurnPhase.MAIN_ACTION;
    default:
      return TurnPhase.IDLE;
  }
}

/** Map Zustand snapshot → domain model used by reduceCatanEvent. */
export function storeSnapshotToDomainModel(snapshot: CatanStoreSnapshot): DomainMatchState {
  const players: DomainMatchState['players'] = {};
  for (const [id, p] of Object.entries(snapshot.players)) {
    players[id as PlayerId] = {
      id: id as PlayerId,
      name: p.name,
      color: p.color,
      resources: uiResourceToDomain(p.resources),
      victoryPoints: p.victoryPoints ?? 0,
      longestRoadSize: p.longestRoad ?? 0,
      knightsPlayed: p.largestArmy ?? 0,
      hasLongestRoad: false,
      hasLargestArmy: false,
      readyToPlay: true,
    };
  }

  const vertices: DomainMatchState['board']['vertices'] = {};
  for (const [id, v] of Object.entries(snapshot.vertices)) {
    vertices[id as VertexId] = {
      id: id as VertexId,
      building: v.building
        ? {
            type: v.building.type === 'CITY' ? BuildingType.CITY : BuildingType.SETTLEMENT,
            ownerId: v.building.ownerId as PlayerId,
          }
        : null,
      harborId: null,
    };
  }

  const edges: DomainMatchState['board']['edges'] = {};
  for (const [id, e] of Object.entries(snapshot.edges)) {
    edges[id as EdgeId] = {
      id: id as EdgeId,
      ownerId: (e.road?.ownerId as PlayerId) ?? null,
    };
  }

  const hexes: DomainMatchState['board']['hexes'] = {};
  for (const [id, h] of Object.entries(snapshot.hexes)) {
    hexes[id as HexId] = {
      id: id as HexId,
      q: h.q,
      r: h.r,
      s: h.s,
      terrain: h.terrain as DomainMatchState['board']['hexes'][HexId]['terrain'],
      numberToken: h.numberToken ?? null,
    };
  }

  return {
    meta: { matchId: MATCH_ID, createdAt: Date.now(), status: 'ACTIVE' },
    rules: { targetVictoryPoints: 10, maxHandSizeBeforeDiscard: 7, allowCustomBoard: false },
    lifecycle: {
      matchPhase: lifecycleToMatchPhase(snapshot.phase),
      winnerPlayerId: (snapshot.winnerPlayerId as PlayerId) ?? null,
    },
    board: { hexes, vertices, edges },
    players,
    turn: {
      turnNumber: snapshot.turnNumber,
      activePlayerId: snapshot.activePlayerId as PlayerId,
      phase: turnPhaseFromLifecycle(snapshot.phase),
      playersDiscarding: {},
    },
    dice: {
      result: snapshot.diceResult,
      rollId: snapshot.diceRollId,
    },
    robber: {
      hexId: snapshot.robberHexId as HexId,
      pendingVictims: [],
    },
  };
}

/** Apply domain model fields back into Zustand (preserves UI-only state). */
export function applyDomainModelToStore(domain: DomainMatchState) {
  const current = useCatanStore.getState();
  const nextPlayers = { ...current.players };

  for (const [id, dp] of Object.entries(domain.players)) {
    const existing = nextPlayers[id];
    if (!existing) continue;
    nextPlayers[id] = {
      ...existing,
      resources: domainResourceToUi(dp.resources),
      victoryPoints: dp.victoryPoints,
      longestRoad: dp.longestRoadSize,
      largestArmy: dp.knightsPlayed,
    };
  }

  const nextVertices = { ...current.vertices };
  for (const [id, dv] of Object.entries(domain.board.vertices)) {
    const existing = nextVertices[id];
    if (!existing) continue;
    nextVertices[id] = {
      ...existing,
      building: dv.building
        ? {
            type: dv.building.type === 'CITY' ? 'CITY' : 'SETTLEMENT',
            ownerId: dv.building.ownerId,
          }
        : undefined,
    };
  }

  const nextEdges = { ...current.edges };
  for (const [id, de] of Object.entries(domain.board.edges)) {
    const existing = nextEdges[id];
    if (!existing) continue;
    nextEdges[id] = {
      ...existing,
      road: de.ownerId ? { ownerId: de.ownerId } : undefined,
    };
  }

  let phase = current.phase;
  switch (domain.turn.phase) {
    case TurnPhase.ROLLING:
      phase = LifecyclePhase.ROLLING;
      break;
    case TurnPhase.ROBBER_PLACEMENT:
      phase = LifecyclePhase.ROBBER_MOVE;
      break;
    case TurnPhase.DISCARDING:
      phase = LifecyclePhase.ROBBER_DISCARD;
      break;
    case TurnPhase.MAIN_ACTION:
      phase = LifecyclePhase.TRADING_BUILDING;
      break;
    default:
      break;
  }

  if (domain.lifecycle.matchPhase === MatchPhase.COMPLETED) {
    phase = LifecyclePhase.GAME_OVER;
  }

  useCatanStore.setState({
    players: nextPlayers,
    vertices: nextVertices,
    edges: nextEdges,
    activePlayerId: domain.turn.activePlayerId ?? current.activePlayerId,
    turnNumber: domain.turn.turnNumber,
    phase,
    diceResult: domain.dice.result,
    diceRollId: domain.dice.rollId,
    robberHexId: domain.robber.hexId as string,
    winnerPlayerId: domain.lifecycle.winnerPlayerId as string | null,
  });
}

export function applyDomainEventToStore(event: CatanEvent) {
  const domain = storeSnapshotToDomainModel(useCatanStore.getState());
  const next = reduceCatanEvent(domain, event);
  applyDomainModelToStore(next);
}
