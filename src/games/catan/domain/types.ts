export type PlayerId = string;
export type HexId = string;
export type VertexId = string;
export type EdgeId = string;

export enum TerrainType {
  FOREST = 'FOREST',
  HILLS = 'HILLS',
  PASTURE = 'PASTURE',
  FIELDS = 'FIELDS',
  MOUNTAINS = 'MOUNTAINS',
  DESERT = 'DESERT',
  WATER = 'WATER'
}

export enum ResourceType {
  WOOD = 'WOOD',
  BRICK = 'BRICK',
  SHEEP = 'SHEEP',
  WHEAT = 'WHEAT',
  ORE = 'ORE'
}

export enum LifecyclePhase {
  SETUP_1 = 'SETUP_1',
  SETUP_2 = 'SETUP_2',
  ROLLING = 'ROLLING',
  TRADING_BUILDING = 'TRADING_BUILDING',
  ROBBER_MOVE = 'ROBBER_MOVE',
  ROBBER_DISCARD = 'ROBBER_DISCARD',
  GAME_OVER = 'GAME_OVER'
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface HexTile {
  id: HexId;
  q: number;
  r: number;
  s: number;
  terrain: TerrainType;
  numberToken?: number;
  letterToken?: string;
  position: Vec3;
}

export interface Vertex {
  id: VertexId;
  position: Vec3;
  building?: {
    type: 'SETTLEMENT' | 'CITY';
    ownerId: PlayerId;
  };
  harbor?: ResourceType | 'ANY';
}

export interface Edge {
  id: EdgeId;
  position: Vec3;
  rotation: number;
  road?: {
    ownerId: PlayerId;
  };
}

export interface Player {
  id: PlayerId;
  name: string;
  color: string;
  resources: Record<ResourceType, number>;
  victoryPoints: number;
  devCards?: any[];
  longestRoad?: number;
  largestArmy?: number;
}

export interface CatanMatchState {
  phase: LifecyclePhase;
  hexes: Record<HexId, HexTile>;
  vertices: Record<VertexId, Vertex>;
  edges: Record<EdgeId, Edge>;
  players: Record<PlayerId, Player>;
  activePlayerId: PlayerId;
  robberHexId: HexId;
}

export type CatanCommand = 
  | { type: 'ROLL_DICE' }
  | { type: 'BUILD_SETTLEMENT'; vertexId: VertexId; playerId: PlayerId }
  | { type: 'BUILD_ROAD'; edgeId: EdgeId; playerId: PlayerId }
  | { type: 'END_TURN'; playerId: PlayerId };
