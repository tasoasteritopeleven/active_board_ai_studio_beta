/**
 * DOMAIN LAYER: Branded Types & Core State Models
 */

// --- BRANDED TYPES ---
// Provides compile-time safety to prevent mixing up IDs
export type Brand<K, T> = K & { __brand: T };

export type MatchId = Brand<string, "MatchId">;
export type PlayerId = Brand<string, "PlayerId">;
export type HexId = Brand<string, "HexId">;
export type VertexId = Brand<string, "VertexId">;
export type EdgeId = Brand<string, "EdgeId">;
export type EventId = Brand<string, "EventId">;
export type CommandId = Brand<string, "CommandId">;

// --- ENUMS & CONSTANTS ---
export enum ResourceType {
  WOOD = 'WOOD',
  BRICK = 'BRICK',
  SHEEP = 'SHEEP',
  WHEAT = 'WHEAT',
  ORE = 'ORE'
}

export enum TerrainType {
  FOREST = 'FOREST',
  HILLS = 'HILLS',
  PASTURE = 'PASTURE',
  FIELDS = 'FIELDS',
  MOUNTAINS = 'MOUNTAINS',
  DESERT = 'DESERT',
  WATER = 'WATER'
}

export enum BuildingType {
  SETTLEMENT = 'SETTLEMENT',
  CITY = 'CITY'
}

export enum MatchPhase {
  LOBBY = 'LOBBY',
  SETUP = 'SETUP', // Initial two placements
  PLAYING = 'PLAYING',
  COMPLETED = 'COMPLETED'
}

export enum TurnPhase {
  IDLE = 'IDLE',
  ROLLING = 'ROLLING',
  ROBBER_PLACEMENT = 'ROBBER_PLACEMENT', // Player moving robber after 7
  ROBBER_STEALING = 'ROBBER_STEALING',   // Player choosing victim
  DISCARDING = 'DISCARDING',             // Players discarding cards on 7
  MAIN_ACTION = 'MAIN_ACTION'            // Trading, building, playing dev cards
}

// --- STATE INTERFACES ---

export interface MatchMetaState {
  matchId: MatchId;
  createdAt: number;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface RulesConfigState {
  targetVictoryPoints: number;
  maxHandSizeBeforeDiscard: number;
  allowCustomBoard: boolean;
}

export interface LifecycleState {
  matchPhase: MatchPhase;
  winnerPlayerId: PlayerId | null;
}

export interface ResourceMap {
  [ResourceType.WOOD]: number;
  [ResourceType.BRICK]: number;
  [ResourceType.SHEEP]: number;
  [ResourceType.WHEAT]: number;
  [ResourceType.ORE]: number;
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  color: string;
  resources: ResourceMap;
  victoryPoints: number;
  longestRoadSize: number;
  knightsPlayed: number;
  hasLongestRoad: boolean;
  hasLargestArmy: boolean;
  readyToPlay: boolean;
}

export interface HexState {
  id: HexId;
  q: number;
  r: number;
  s: number;
  terrain: TerrainType;
  numberToken: number | null;
}

export interface VertexBuilding {
  type: BuildingType;
  ownerId: PlayerId;
}

export interface VertexState {
  id: VertexId;
  // A string based on connecting hex coords, e.g. "x1,y1,z1_x2,y2,z2_x3,y3,z3"
  building: VertexBuilding | null;
  harborId: string | null;
}

export interface EdgeState {
  id: EdgeId;
  ownerId: PlayerId | null;
}

export interface BoardState {
  hexes: Record<HexId, HexState>;
  vertices: Record<VertexId, VertexState>;
  edges: Record<EdgeId, EdgeState>;
}

export interface TurnState {
  turnNumber: number;
  activePlayerId: PlayerId | null;
  phase: TurnPhase;
  playersDiscarding: Record<PlayerId, number>; // How many cards they need to discard
}

export interface DiceState {
  result: [number, number] | null;
  rollId: number;
}

export interface RobberState {
  hexId: HexId;
  pendingVictims: PlayerId[];
}

export interface CatanMatchState {
  meta: MatchMetaState;
  rules: RulesConfigState;
  lifecycle: LifecycleState;
  board: BoardState;
  players: Record<PlayerId, PlayerState>;
  turn: TurnState;
  dice: DiceState;
  robber: RobberState;
}

// Initial state builder
export function createInitialMatchState(matchId: MatchId): CatanMatchState {
  return {
    meta: {
      matchId,
      createdAt: Date.now(),
      status: 'ACTIVE'
    },
    rules: {
      targetVictoryPoints: 10,
      maxHandSizeBeforeDiscard: 7,
      allowCustomBoard: false
    },
    lifecycle: {
      matchPhase: MatchPhase.LOBBY,
      winnerPlayerId: null
    },
    board: {
      hexes: {},
      vertices: {},
      edges: {}
    },
    players: {},
    turn: {
      turnNumber: 0,
      activePlayerId: null,
      phase: TurnPhase.IDLE,
      playersDiscarding: {}
    },
    dice: {
      result: null,
      rollId: 0
    },
    robber: {
      // @ts-ignore
      hexId: 'none',
      pendingVictims: []
    }
  };
}
