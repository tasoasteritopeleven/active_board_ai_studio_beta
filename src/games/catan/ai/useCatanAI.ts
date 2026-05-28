import { useEffect } from 'react';
import { useCatanStore } from '../store/catanStore';
import { LifecyclePhase } from '../domain/types';

export type AIDifficulty = 'Easy' | 'Medium' | 'Hard';
export type AIRole = 'Aggressive' | 'Defensive' | 'Balanced';

export interface AIPlayerConfig {
  id: string;
  isAI: boolean;
  difficulty: AIDifficulty;
  role: AIRole;
}

export function useCatanAI(aiConfigs: AIPlayerConfig[]) {
  const { activePlayerId, phase, rollDice, endTurn, robberMode, hexes, confirmRobberMove, setPendingRobberHexId } = useCatanStore();

  useEffect(() => {
    const aiConfig = (aiConfigs || []).find(c => c.id === activePlayerId && c.isAI);
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
            
            // Influence robber placement based on role
            let bestHex = validHexes[0];
            let maxScore = -Infinity;

            validHexes.forEach(hex => {
              let score = 0;
              let victims = new Set<string>();
              Object.values(store.vertices).forEach(v => {
                if (v.building && v.id.includes(hex.id) && v.building.ownerId !== activePlayerId) {
                  victims.add(v.building.ownerId);
                  score += v.building.type === 'CITY' ? 2 : 1;
                }
              });

              if (aiConfig.role === 'Aggressive') {
                // Aggressive: Target hexes with high probability and many opponent buildings
                const prob = 6 - Math.abs(hex.numberToken! - 7);
                score += prob * 2;
              } else if (aiConfig.role === 'Defensive') {
                // Defensive: Target hexes that produce resources we are short on (simplified)
                const prob = 6 - Math.abs(hex.numberToken! - 7);
                score += prob;
                if (victims.size > 0) score += 5; // prioritize actually stealing over just blocking
              } else {
                // Balanced: Block the leader, or high probability hexes
                const hasLeader = Array.from(victims).some(v => store.players[v].victoryPoints >= 5);
                if (hasLeader) score += 10;
                score += (6 - Math.abs(hex.numberToken! - 7));
              }

              // Add some randomness
              score += Math.random() * 2;

              if (score > maxScore) {
                maxScore = score;
                bestHex = hex;
              }
            });

            setPendingRobberHexId(bestHex.id);
            
            // Wait a bit then confirm
            setTimeout(() => {
              const currentStore = useCatanStore.getState();
              // Find someone to steal from
              const adjacentPlayers = new Set<string>();
              Object.values(currentStore.vertices).forEach(v => {
                if (v.building && v.id.includes(bestHex.id)) {
                  if (v.building.ownerId !== activePlayerId) {
                    adjacentPlayers.add(v.building.ownerId);
                  }
                }
              });
              const victimsList = Array.from(adjacentPlayers);
              const target = victimsList.length > 0 ? victimsList[Math.floor(Math.random() * victimsList.length)] : undefined;
              
              confirmRobberMove(target);
            }, 1000);
          }
        }, 1500);
      } else if (phase === LifecyclePhase.TRADING_BUILDING || phase === LifecyclePhase.SETUP_1 || phase === LifecyclePhase.SETUP_2) {
        // AI decides to build or end turn
        const reactionTime = getReactionTime(aiConfig.difficulty);
        timeoutId = setTimeout(() => {
          const store = useCatanStore.getState();
          // Extremely basic random setup placement logic
          if (phase === LifecyclePhase.SETUP_1 || phase === LifecyclePhase.SETUP_2) {
             const availableVertices = Object.keys(store.vertices).filter(vid => !store.vertices[vid].building);
             if (availableVertices.length > 0) {
               // We should technically call validate logic but we are bypassing for a quick AI hack
               const vId = availableVertices[Math.floor(Math.random() * availableVertices.length)];
               store.setPendingBuild({ type: 'SETTLEMENT', locationId: vId });
               store.confirmBuild();
             }
             const availableEdges = Object.keys(store.edges).filter(e => !store.edges[e].road);
             if (availableEdges.length > 0) {
                const eId = availableEdges[Math.floor(Math.random() * availableEdges.length)];
                store.setPendingBuild({ type: 'ROAD', locationId: eId });
                store.confirmBuild();
             }
          }
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
