import { CommandId, EventId, PlayerId, HexId, VertexId, EdgeId, ResourceType, TurnPhase, MatchPhase } from '../model/catanMatchState';

export interface EventEnvelope<TType extends string = string, TPayload = unknown> {
  eventId: EventId;
  commandId: CommandId;
  timestamp: number;
  type: TType;
  payload: TPayload;
}

export type ResourcesDiscardedEvent = EventEnvelope<'RESOURCES_DISCARDED', {
  playerId: PlayerId;
  resources: Partial<Record<ResourceType, number>>;
}>;

export type RobberMovedEvent = EventEnvelope<'ROBBER_MOVED', {
  playerId: PlayerId;
  hexId: HexId;
  targetPlayerId?: PlayerId;
  stolenResource?: ResourceType;
}>;

export type SettlementPlacedEvent = EventEnvelope<'SETTLEMENT_PLACED', {
  playerId: PlayerId;
  vertexId: VertexId;
  isInitialPlacement: boolean;
}>;

export type RoadPlacedEvent = EventEnvelope<'ROAD_PLACED', {
  playerId: PlayerId;
  edgeId: EdgeId;
  isInitialPlacement: boolean;
}>;

export type TurnEndedEvent = EventEnvelope<'TURN_ENDED', {
  endedPlayerId: PlayerId;
  nextPlayerId: PlayerId;
  newTurnNumber: number;
}>;

export type DiceRolledEvent = EventEnvelope<'DICE_ROLLED', {
  playerId: PlayerId;
  dice1: number;
  dice2: number;
  total: number;
}>;

export type CatanEvent = 
  | ResourcesDiscardedEvent
  | RobberMovedEvent
  | SettlementPlacedEvent
  | RoadPlacedEvent
  | TurnEndedEvent
  | DiceRolledEvent;
