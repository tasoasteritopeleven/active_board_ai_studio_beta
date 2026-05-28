import { reduceCatanEvent } from '../domain/reducers/reduceCatanEvent';
import type { CatanEvent } from '../domain/events/catanEvent';
import type { CatanLogEntry } from './catanEventLog';
import { parseLogEntry } from './catanEventLog';
import { storeSnapshotToDomainModel } from './catanDomainBridge';
import type { CatanSyncSnapshot } from './catanSync';
import type { CatanStoreSnapshot } from './catanStoreTypes';
import { LifecyclePhase } from '../domain/types';
import { MatchPhase, TurnPhase } from '../domain/model/catanMatchState';
import type { CatanMatchState as DomainMatchState } from '../domain/model/catanMatchState';
import { ResourceType } from '../domain/model/catanMatchState';
import type { ResourceType as UiResourceType } from '../domain/types';

/** Build minimal store snapshot from sync snapshot for domain conversion. */
function syncToStoreLike(base: CatanSyncSnapshot): CatanStoreSnapshot {
  return {
    ...base,
    resourceFlows: [],
    turnHistory: [],
    chatMessages: [],
    uiState: { activeCarouselIndex: 0, isCarouselOpen: true },
    buildMode: null,
    pendingBuild: null,
    activeTrade: null,
    robberMode: false,
    pendingRobberHexId: null,
    aiConfigs: [],
  } as unknown as CatanStoreSnapshot;
}

function domainResourceToUi(res: Record<ResourceType, number>): Record<UiResourceType, number> {
  return {
    WOOD: res[ResourceType.WOOD] ?? 0,
    BRICK: res[ResourceType.BRICK] ?? 0,
    SHEEP: res[ResourceType.SHEEP] ?? 0,
    WHEAT: res[ResourceType.WHEAT] ?? 0,
    ORE: res[ResourceType.ORE] ?? 0,
  };
}

function matchPhaseToLifecycle(domain: DomainMatchState): LifecyclePhase {
  if (domain.lifecycle.matchPhase === MatchPhase.COMPLETED) return LifecyclePhase.GAME_OVER;
  switch (domain.turn.phase) {
    case TurnPhase.ROLLING:
      return LifecyclePhase.ROLLING;
    case TurnPhase.ROBBER_PLACEMENT:
      return LifecyclePhase.ROBBER_MOVE;
    case TurnPhase.DISCARDING:
      return LifecyclePhase.ROBBER_DISCARD;
    case TurnPhase.MAIN_ACTION:
      return LifecyclePhase.TRADING_BUILDING;
    default:
      return LifecyclePhase.TRADING_BUILDING;
  }
}

/** Pure: domain → sync snapshot (no Zustand). */
export function domainModelToSyncSnapshot(
  domain: DomainMatchState,
  base: CatanSyncSnapshot
): CatanSyncSnapshot {
  const players = { ...base.players };
  for (const [id, dp] of Object.entries(domain.players)) {
    const existing = players[id];
    if (!existing) continue;
    players[id] = {
      ...existing,
      resources: domainResourceToUi(dp.resources),
      victoryPoints: dp.victoryPoints,
    };
  }

  const vertices = { ...base.vertices };
  for (const [id, dv] of Object.entries(domain.board.vertices)) {
    const existing = vertices[id];
    if (!existing) continue;
    vertices[id] = {
      ...existing,
      building: dv.building
        ? {
            type: dv.building.type === 'CITY' ? 'CITY' : 'SETTLEMENT',
            ownerId: dv.building.ownerId,
          }
        : undefined,
    };
  }

  const edges = { ...base.edges };
  for (const [id, de] of Object.entries(domain.board.edges)) {
    const existing = edges[id];
    if (!existing) continue;
    edges[id] = {
      ...existing,
      road: de.ownerId ? { ownerId: de.ownerId } : undefined,
    };
  }

  return {
    ...base,
    version: Date.now(),
    phase: matchPhaseToLifecycle(domain),
    activePlayerId: (domain.turn.activePlayerId as string) ?? base.activePlayerId,
    turnNumber: domain.turn.turnNumber,
    winnerPlayerId: (domain.lifecycle.winnerPlayerId as string) ?? null,
    robberHexId: domain.robber.hexId as string,
    diceResult: domain.dice.result,
    diceRollId: domain.dice.rollId,
    players,
    vertices,
    edges,
  };
}

/** Replay event log from last checkpoint (pure, for tests). */
export function replayCatanLogEntries(
  entries: string[],
  options?: { checkpointEvery?: number }
): { snapshots: CatanSyncSnapshot[]; checkpointCount: number; domainEventCount: number } {
  const parsed = entries
    .map(parseLogEntry)
    .filter((e): e is CatanLogEntry => e !== null)
    .sort((a, b) => a.seq - b.seq);

  let base: CatanSyncSnapshot | null = null;
  let domain = null as ReturnType<typeof storeSnapshotToDomainModel> | null;
  const snapshots: CatanSyncSnapshot[] = [];
  let checkpointCount = 0;
  let domainEventCount = 0;

  for (const entry of parsed) {
    if (entry.kind === 'checkpoint') {
      base = entry.snapshot;
      domain = storeSnapshotToDomainModel(syncToStoreLike(base));
      snapshots.push(base);
      checkpointCount += 1;
      continue;
    }
    if (!base || !domain) continue;
    domain = reduceCatanEvent(domain, entry.event);
    domainEventCount += 1;
    base = domainModelToSyncSnapshot(domain, base);
    snapshots.push(base);

    if (options?.checkpointEvery && domainEventCount % options.checkpointEvery === 0) {
      checkpointCount += 1;
    }
  }

  return { snapshots, checkpointCount, domainEventCount };
}

export function replayDomainEventsOnSnapshot(
  base: CatanSyncSnapshot,
  events: CatanEvent[]
): CatanSyncSnapshot {
  let domain = storeSnapshotToDomainModel(syncToStoreLike(base));
  for (const event of events) {
    domain = reduceCatanEvent(domain, event);
  }
  return domainModelToSyncSnapshot(domain, base);
}
