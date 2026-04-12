import { useEffect } from 'react';
import { type GameState } from '../RiskEngine';

export type AIDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface AIPlayerConfig {
  id: string;
  isAI: boolean;
  difficulty: AIDifficulty;
}

export function useRiskAI(
  gameState: GameState,
  aiConfigs: AIPlayerConfig[],
  onAction: (action: any) => void
) {
  useEffect(() => {
    const aiConfig = aiConfigs.find(c => c.id === gameState.currentPlayerId && c.isAI);
    if (!aiConfig) return;

    let timeoutId: NodeJS.Timeout;

    const makeMove = () => {
      const reactionTime = getReactionTime(aiConfig.difficulty);
      
      timeoutId = setTimeout(() => {
        // Very basic AI: just end turn for now, or perform random actions
        // In a real implementation, this would analyze the board and make strategic decisions
        // based on the difficulty level.
        console.log(`[Risk AI - ${aiConfig.difficulty}] Player ${aiConfig.id} making a move...`);
        
        // For now, just simulate ending the turn
        // onAction({ type: 'END_TURN' });
      }, reactionTime);
    };

    makeMove();

    return () => clearTimeout(timeoutId);
  }, [gameState.currentPlayerId, gameState.phase, aiConfigs, onAction]);
}

function getReactionTime(difficulty: AIDifficulty): number {
  switch (difficulty) {
    case 'Easy':
      return 2000 + Math.random() * 1000;
    case 'Medium':
      return 1000 + Math.random() * 1000;
    case 'Hard':
      return 500 + Math.random() * 500;
    default:
      return 1500;
  }
}
