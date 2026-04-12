export type GameEvent = 
  | { type: 'DICE_ROLL_STARTED' }
  | { type: 'DICE_SETTLED'; result: [number, number] }
  | { type: 'RESOURCE_GAINED'; playerId: string; resources: Record<string, number>; position?: [number, number, number] }
  | { type: 'BUILDING_PLACED'; playerId: string; buildingType: 'SETTLEMENT' | 'CITY' | 'ROAD'; locationId: string }
  | { type: 'ROBBER_MOVED'; hexId: string; targetPlayerId?: string }
  | { type: 'TRADE_PROPOSED'; tradeId: string }
  | { type: 'TRADE_COMPLETED'; tradeId: string }
  | { type: 'ERROR'; message: string };

type EventCallback = (event: GameEvent) => void;

class EventBus {
  private listeners: Set<EventCallback> = new Set();

  dispatch(event: GameEvent) {
    this.listeners.forEach(listener => listener(event));
  }

  subscribe(callback: EventCallback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const gameEvents = new EventBus();
