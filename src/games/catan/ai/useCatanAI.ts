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
  const { activePlayerId, phase, rollDice, endTurn } = useCatanStore();

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
      } else if (phase === LifecyclePhase.TRADING_BUILDING) {
        // AI decides to build or end turn
        const reactionTime = getReactionTime(aiConfig.difficulty);
        timeoutId = setTimeout(() => {
          // TODO: Implement actual building logic based on difficulty
          // For now, just end turn
          endTurn();
        }, reactionTime + 1000); // Add a bit more delay for "thinking"
      }
    };

    makeMove();

    return () => clearTimeout(timeoutId);
  }, [activePlayerId, phase, aiConfigs, rollDice, endTurn]);
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
