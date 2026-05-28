import { CatanMatchState, BuildingType, TurnPhase } from '../model/catanMatchState';
import { CatanEvent } from '../events/catanEvent';

/**
 * Event Sourcing Reducer.
 * This should be a pure function that applies a single event to a state and returns the new state.
 */
export function reduceCatanEvent(state: CatanMatchState, event: CatanEvent): CatanMatchState {
  const newState = structuredClone(state); // Deep clone for simplicity in MVP, immer or immutable.js usually better for prod.

  switch (event.type) {
    case 'RESOURCES_DISCARDED': {
      const { playerId, resources } = event.payload;
      const player = newState.players[playerId];
      
      if (player) {
        for (const [resType, count] of Object.entries(resources)) {
          // @ts-ignore
          player.resources[resType] -= count;
        }

        if (newState.turn.playersDiscarding[playerId]) {
          delete newState.turn.playersDiscarding[playerId];
        }

        // If no one else is discarding, transition phase
        if (Object.keys(newState.turn.playersDiscarding).length === 0 && newState.turn.phase === TurnPhase.DISCARDING) {
           newState.turn.phase = TurnPhase.ROBBER_PLACEMENT;
        }
      }
      break;
    }

    case 'ROBBER_MOVED': {
      const { hexId, targetPlayerId, stolenResource, playerId } = event.payload;
      newState.robber.hexId = hexId;
      newState.turn.phase = TurnPhase.MAIN_ACTION; // After stealing, return to main turn

      if (targetPlayerId && stolenResource) {
        const victim = newState.players[targetPlayerId];
        const thief = newState.players[playerId];
        
        if (victim && thief) {
          // @ts-ignore
          victim.resources[stolenResource] -= 1;
          // @ts-ignore
          thief.resources[stolenResource] += 1;
        }
      }
      break;
    }

    case 'SETTLEMENT_PLACED': {
      const { playerId, vertexId, isInitialPlacement } = event.payload;
      
      const vertex = newState.board.vertices[vertexId] || { id: vertexId, building: null, harborId: null };
      vertex.building = { type: BuildingType.SETTLEMENT, ownerId: playerId };
      newState.board.vertices[vertexId] = vertex;

      const player = newState.players[playerId];
      if (player) {
         player.victoryPoints += 1;
         if (!isInitialPlacement) {
           // Deduction of resources would be part of command parsing or a separate resource spent event, 
           // but traditionally you could deduct here if you have a RESOURCES_SPENT event.
           // For simplicity, we assume the command handles validation and this just applies it.
         }
      }
      break;
    }

    case 'ROAD_PLACED': {
      const { playerId, edgeId, isInitialPlacement } = event.payload;
      
      const edge = newState.board.edges[edgeId] || { id: edgeId, ownerId: null };
      edge.ownerId = playerId;
      newState.board.edges[edgeId] = edge;

      // Update longest road logic would go here or be a separate event derived calculate
      break;
    }

    case 'TURN_ENDED': {
      const { nextPlayerId, newTurnNumber } = event.payload;
      newState.turn.activePlayerId = nextPlayerId;
      newState.turn.phase = TurnPhase.ROLLING;
      newState.turn.turnNumber = newTurnNumber;
      // Reset dice state
      newState.dice.result = null;
      break;
    }

    case 'DICE_ROLLED': {
      const { dice1, dice2, total } = event.payload;
      newState.dice.result = [dice1, dice2];
      newState.dice.rollId += 1;

      if (total === 7) {
        newState.turn.phase = TurnPhase.DISCARDING;
        // Logic to determine who discards would typically emit the event that tells us who discards,
        // Since event is recorded, we should calculate playersDiscarding in the command handler and put in event?
        // Or calculate here:
        for (const pk of Object.keys(newState.players)) {
          // @ts-ignore
          const p = newState.players[pk];
          const totalRes = Object.values(p.resources as Record<string, number>).reduce((sum, val) => sum + val, 0);
          if (totalRes > 7) {
            // @ts-ignore
            newState.turn.playersDiscarding[pk] = Math.floor(totalRes / 2);
          }
        }

        if (Object.keys(newState.turn.playersDiscarding).length === 0) {
           newState.turn.phase = TurnPhase.ROBBER_PLACEMENT;
        }
      } else {
         newState.turn.phase = TurnPhase.MAIN_ACTION;
         // Generate resources? That would be a separate RESOURCES_GENERATED event.
      }
      break;
    }
  }

  return newState;
}
