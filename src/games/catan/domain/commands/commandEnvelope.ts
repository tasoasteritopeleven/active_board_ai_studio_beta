import { Brand, CommandId, EventId, PlayerId, HexId, VertexId, EdgeId, ResourceType } from '../model/catanMatchState';

export interface CommandEnvelope<TType extends string = string, TPayload = unknown> {
  commandId: CommandId;
  playerId: PlayerId;
  timestamp: number;
  type: TType;
  payload: TPayload;
}

// Commands list
export type PlaceInitialSettlementCommand = CommandEnvelope<'PLACE_INITIAL_SETTLEMENT', { vertexId: VertexId }>;
export type PlaceInitialRoadCommand = CommandEnvelope<'PLACE_INITIAL_ROAD', { edgeId: EdgeId }>;

export type RollDiceCommand = CommandEnvelope<'ROLL_DICE', undefined>;

export type DiscardResourcesCommand = CommandEnvelope<'DISCARD_RESOURCES', { 
  resources: Partial<Record<ResourceType, number>> 
}>;

export type MoveRobberCommand = CommandEnvelope<'MOVE_ROBBER', { 
  hexId: HexId, 
  targetPlayerId?: PlayerId 
}>;

export type PlaceSettlementCommand = CommandEnvelope<'PLACE_SETTLEMENT', { vertexId: VertexId }>;
export type PlaceCityCommand = CommandEnvelope<'PLACE_CITY', { vertexId: VertexId }>;
export type PlaceRoadCommand = CommandEnvelope<'PLACE_ROAD', { edgeId: EdgeId }>;

export type EndTurnCommand = CommandEnvelope<'END_TURN', undefined>;

export type CatanCommand = 
  | PlaceInitialSettlementCommand
  | PlaceInitialRoadCommand
  | RollDiceCommand
  | DiscardResourcesCommand
  | MoveRobberCommand
  | PlaceSettlementCommand
  | PlaceCityCommand
  | PlaceRoadCommand
  | EndTurnCommand;

// Result mapping
export interface CommandResult {
  success: boolean;
  eventsEmitted: EventId[];
  error?: string;
}
