import { useCallback } from 'react';
import { toast } from 'sonner';
import {
  type GameState,
  CONTINENTS,
  rollRiskCombat,
  canAttackFrom,
  isNeighborAttack,
  getContinentBonus,
} from './RiskEngine';

export function useRiskGameActions(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState>>,
  selectedTerritory: string | null,
  setSelectedTerritory: (id: string | null) => void
) {
  const advanceToNextPlayer = useCallback((prev: GameState): GameState => {
    const activeIdx = prev.players.findIndex((p) => p.id === prev.currentPlayerId);
    const nextPlayer = prev.players[(activeIdx + 1) % prev.players.length];
    const territoryCount = prev.territories.filter((t) => t.ownerId === nextPlayer.id).length;
    const baseReinforce = Math.max(3, Math.floor(territoryCount / 3));
    const continentBonus = getContinentBonus(prev.territories, nextPlayer.id, CONTINENTS);
    const armiesToPlace = baseReinforce + continentBonus;

    const winner = prev.territories.every((t) => t.ownerId === prev.currentPlayerId)
      ? prev.players.find((p) => p.id === prev.currentPlayerId)
      : undefined;

    if (winner) {
      toast.success(`${winner.name} κέρδισε το παιχνίδι!`);
      return {
        ...prev,
        phase: 'reinforce',
        log: [`🏆 ΝΙΚΗΤΗΣ: ${winner.name}`, ...prev.log],
      };
    }

    return {
      ...prev,
      currentPlayerId: nextPlayer.id,
      phase: 'reinforce',
      turnNumber: prev.turnNumber + 1,
      attackingFrom: null,
      attackingTo: null,
      players: prev.players.map((p) =>
        p.id === nextPlayer.id ? { ...p, armiesToPlace } : { ...p, armiesToPlace: 0 }
      ),
      log: [
        `Γύρος ${prev.turnNumber + 1}: ${nextPlayer.name} (+${armiesToPlace} στρατεύματα)`,
        ...prev.log,
      ],
    };
  }, []);

  const handleTerritoryClick = useCallback(
    (territoryId: string) => {
      setSelectedTerritory(territoryId);

      setGameState((prev) => {
        if (prev.phase !== 'attack') return prev;

        const clicked = prev.territories.find((t) => t.id === territoryId);
        if (!clicked) return prev;

        if (!prev.attackingFrom) {
          if (!canAttackFrom(clicked, prev.currentPlayerId)) {
            toast.error('Επιλέξτε περιοχή με 2+ στρατεύματα που σας ανήκει.');
            return prev;
          }
          return { ...prev, attackingFrom: territoryId, attackingTo: null };
        }

        if (prev.attackingFrom === territoryId) {
          return { ...prev, attackingFrom: null, attackingTo: null };
        }

        if (clicked.ownerId === prev.currentPlayerId) {
          if (canAttackFrom(clicked, prev.currentPlayerId)) {
            return { ...prev, attackingFrom: territoryId, attackingTo: null };
          }
          return prev;
        }

        if (!isNeighborAttack(prev.territories, prev.attackingFrom, territoryId)) {
          toast.error('Μπορείτε να επιτεθείτε μόνο σε γειτονικές περιοχές.');
          return prev;
        }

        return { ...prev, attackingTo: territoryId };
      });
    },
    [setGameState, setSelectedTerritory]
  );

  const handleExecuteAttack = useCallback(() => {
    setGameState((prev) => {
      const fromId = prev.attackingFrom;
      const toId = prev.attackingTo ?? selectedTerritory;
      if (!fromId || !toId) {
        toast.error('Επιλέξτε πηγή και στόχο επίθεσης.');
        return prev;
      }

      const source = prev.territories.find((t) => t.id === fromId);
      const target = prev.territories.find((t) => t.id === toId);
      if (!source || !target) return prev;

      if (!canAttackFrom(source, prev.currentPlayerId)) return prev;
      if (target.ownerId === prev.currentPlayerId) {
        toast.error('Ο στόχος πρέπει να ανήκει σε αντίπαλο.');
        return prev;
      }
      if (!isNeighborAttack(prev.territories, fromId, toId)) return prev;

      const combat = rollRiskCombat(source.armies, target.armies);
      const nextTerritories = prev.territories.map((t) => ({ ...t }));

      const applyLoss = (id: string, loss: number) => {
        const t = nextTerritories.find((x) => x.id === id);
        if (t) t.armies = Math.max(0, t.armies - loss);
      };

      applyLoss(fromId, combat.attackerLosses);
      applyLoss(toId, combat.defenderLosses);

      const updatedTarget = nextTerritories.find((t) => t.id === toId)!;
      const updatedSource = nextTerritories.find((t) => t.id === fromId)!;
      let logMsg = `${prev.players.find((p) => p.id === prev.currentPlayerId)?.name}: ${source.name} → ${target.name}`;

      if (updatedTarget.armies === 0) {
        updatedTarget.ownerId = prev.currentPlayerId;
        updatedTarget.armies = 1;
        updatedSource.armies = Math.max(1, updatedSource.armies - 1);
        logMsg += ' — Κατάκτηση!';
        toast.success(`Κατακτήθηκε το ${target.name}!`);
      } else {
        toast.info(`Μάχη: -${combat.attackerLosses} επιθέτη, -${combat.defenderLosses} αμυνόμενος`);
      }

      return {
        ...prev,
        territories: nextTerritories,
        attackingFrom: updatedSource.armies > 1 ? fromId : null,
        attackingTo: null,
        log: [logMsg, ...prev.log],
      };
    });
  }, [selectedTerritory, setGameState]);

  const handleEndPhase = useCallback(() => {
    setGameState((prev) => {
      const player = prev.players.find((p) => p.id === prev.currentPlayerId);
      if (prev.phase === 'reinforce' && player && player.armiesToPlace > 0) {
        toast.error(`Έχετε ακόμα ${player.armiesToPlace} στρατεύματα για ανάπτυξη!`);
        return prev;
      }

      if (prev.phase === 'fortify') {
        return advanceToNextPlayer({ ...prev, attackingFrom: null, attackingTo: null });
      }

      const nextPhase =
        prev.phase === 'reinforce' ? 'attack' : prev.phase === 'attack' ? 'fortify' : 'reinforce';

      const phaseNames: Record<string, string> = {
        reinforce: 'ΕΝΙΣΧΥΣΗ',
        attack: 'ΕΠΙΘΕΣΗ',
        fortify: 'ΟΧΥΡΩΣΗ',
      };

      toast.info(`Η φάση άλλαξε σε ${phaseNames[nextPhase]}`);

      return {
        ...prev,
        phase: nextPhase,
        attackingFrom: nextPhase === 'attack' ? prev.attackingFrom : null,
        attackingTo: null,
        log: [`Η φάση άλλαξε σε ${phaseNames[nextPhase]}`, ...prev.log],
      };
    });
  }, [advanceToNextPlayer, setGameState]);

  return { handleTerritoryClick, handleExecuteAttack, handleEndPhase };
}
