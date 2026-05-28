import { LifecyclePhase } from '../domain/types';
import type { Player } from '../domain/types';

export const CATAN_WIN_VP = 10;

export function findCatanWinner(players: Record<string, Player>): Player | null {
  const list = Object.values(players);
  const winner = list.find((p) => p.victoryPoints >= CATAN_WIN_VP);
  return winner ?? null;
}

export function catanVictoryPatch(players: Record<string, Player>, currentTurnLog: { playerId: string; action: string; timestamp: number }[]) {
  const winner = findCatanWinner(players);
  if (!winner) return null;

  return {
    phase: LifecyclePhase.GAME_OVER,
    winnerPlayerId: winner.id,
    currentTurnLog: [
      ...currentTurnLog,
      {
        playerId: 'SYSTEM',
        action: `🏆 ${winner.name} κέρδισε με ${winner.victoryPoints} Πόντους Νίκης!`,
        timestamp: Date.now(),
      },
    ],
  };
}
