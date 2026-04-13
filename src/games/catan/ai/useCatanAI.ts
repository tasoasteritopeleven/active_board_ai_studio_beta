import { useEffect } from 'react';
import { useCatanStore } from '../store/catanStore';
import { LifecyclePhase } from '../domain/types';

export type AIDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface AIPlayerConfig {
  id: string;
  isAI: boolean;
  difficulty: AIDifficulty;
}

export function useCatanAI(aiConfigs: AIPlayerConfig[]) {
  const { activePlayerId, phase, rollDice, endTurn, robberMode, hexes, confirmRobberMove, setPendingRobberHexId } = useCatanStore();

  useEffect(() => {
    const aiConfig = aiConfigs.find(c => c.id === activePlayerId && c.isAI);
    if (!aiConfig) return;

    let timeoutId: NodeJS.Timeout;

    const makeMove = () => {
      if (phase === LifecyclePhase.ROLLING) {
        // AI rolls the dice
        const reactionTime = getReactionTime(aiConfig.difficulty);
        timeoutId = setTimeout(() => {
          rollDice();
        }, reactionTime);
      } else if (robberMode) {
        // AI moves the robber
        timeoutId = setTimeout(() => {
          const store = useCatanStore.getState();
          const validHexes = Object.values(store.hexes).filter(h => h.terrain !== 'DESERT' && h.terrain !== 'WATER' && h.id !== store.robberHexId);
          if (validHexes.length > 0) {
            const randomHex = validHexes[Math.floor(Math.random() * validHexes.length)];
            setPendingRobberHexId(randomHex.id);
            
            // Wait a bit then confirm
            setTimeout(() => {
              const currentStore = useCatanStore.getState();
              // Find someone to steal from
              const adjacentPlayers = new Set<string>();
              Object.values(currentStore.vertices).forEach(v => {
                if (v.building && v.id.includes(randomHex.id)) {
                  if (v.building.ownerId !== activePlayerId) {
                    adjacentPlayers.add(v.building.ownerId);
                  }
                }
              });
              const victims = Array.from(adjacentPlayers);
              const target = victims.length > 0 ? victims[Math.floor(Math.random() * victims.length)] : undefined;
              
              confirmRobberMove(target);
            }, 1000);
          }
        }, 1500);
      } else if (phase === LifecyclePhase.TRADING_BUILDING) {
        // AI decides to build or end turn
        const reactionTime = getReactionTime(aiConfig.difficulty);
        timeoutId = setTimeout(() => {
          // TODO: Implement actual building logic based on difficulty
          // For now, just end turn
          endTurn();
        }, reactionTime + 1500); // Add a bit more delay for "thinking"
      }
    };

    makeMove();

    return () => clearTimeout(timeoutId);
  }, [activePlayerId, phase, robberMode, aiConfigs, rollDice, endTurn, setPendingRobberHexId, confirmRobberMove]);
}

function getReactionTime(difficulty: AIDifficulty): number {
  switch (difficulty) {
    case 'Easy':
      return 2000 + Math.random() * 1000; // 2-3 seconds
    case 'Medium':
      return 1000 + Math.random() * 1000; // 1-2 seconds
    case 'Hard':
      return 500 + Math.random() * 500;   // 0.5-1 seconds
    default:
      return 1500;
  }
}
