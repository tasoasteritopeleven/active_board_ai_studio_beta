export interface Territory {
  id: string;
  name: string;
  continent: string;
  ownerId: string | null;
  armies: number;
  position: { x: number; y: number };
  neighbors: string[];
}

export interface Player {
  id: string;
  name: string;
  color: string;
  armiesToPlace: number;
  isEliminated: boolean;
}

export interface GameState {
  territories: Territory[];
  players: Player[];
  currentPlayerId: string;
  phase: 'reinforce' | 'attack' | 'fortify';
  turnNumber: number;
  log: string[];
  attackingFrom?: string | null;
  attackingTo?: string | null;
}

export const CONTINENTS = [
  { id: 'north-america', name: 'North America', bonus: 5 },
  { id: 'south-america', name: 'South America', bonus: 2 },
  { id: 'europe', name: 'Europe', bonus: 5 },
  { id: 'africa', name: 'Africa', bonus: 3 },
  { id: 'asia', name: 'Asia', bonus: 7 },
  { id: 'australia', name: 'Australia', bonus: 2 },
];

export { rollRiskCombat, canAttackFrom, isNeighborAttack, getContinentBonus } from './riskCombat';
export type { CombatRollResult } from './riskCombat';
