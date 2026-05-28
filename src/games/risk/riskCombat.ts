import type { Territory } from './RiskEngine';

export interface CombatRollResult {
  attackerLosses: number;
  defenderLosses: number;
  attackerDice: number[];
  defenderDice: number[];
}

/** Classic Risk dice: up to 3 attacker vs 2 defender, highest pairs compared. */
export function rollRiskCombat(attackerArmies: number, defenderArmies: number): CombatRollResult {
  const attackerDiceCount = Math.min(3, Math.max(0, attackerArmies - 1));
  const defenderDiceCount = Math.min(2, defenderArmies);

  const attackerDice = rollSorted(attackerDiceCount);
  const defenderDice = rollSorted(defenderDiceCount);

  let attackerLosses = 0;
  let defenderLosses = 0;

  const pairs = Math.min(attackerDice.length, defenderDice.length);
  for (let i = 0; i < pairs; i++) {
    if (attackerDice[i] > defenderDice[i]) {
      defenderLosses++;
    } else {
      attackerLosses++;
    }
  }

  return { attackerLosses, defenderLosses, attackerDice, defenderDice };
}

function rollSorted(count: number): number[] {
  const dice: number[] = [];
  for (let i = 0; i < count; i++) {
    dice.push(1 + Math.floor(Math.random() * 6));
  }
  return dice.sort((a, b) => b - a);
}

export function canAttackFrom(territory: Territory, currentPlayerId: string): boolean {
  return territory.ownerId === currentPlayerId && territory.armies > 1;
}

export function isNeighborAttack(
  territories: Territory[],
  fromId: string,
  toId: string
): boolean {
  const from = territories.find((t) => t.id === fromId);
  const to = territories.find((t) => t.id === toId);
  if (!from || !to) return false;
  return from.neighbors.includes(toId);
}

export function getContinentBonus(
  territories: Territory[],
  playerId: string,
  continents: { id: string; bonus: number }[]
): number {
  let bonus = 0;
  for (const continent of continents) {
    const inContinent = territories.filter((t) => t.continent === continent.id);
    if (inContinent.length === 0) continue;
    if (inContinent.every((t) => t.ownerId === playerId)) {
      bonus += continent.bonus;
    }
  }
  return bonus;
}
