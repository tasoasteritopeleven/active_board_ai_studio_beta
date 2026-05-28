import { CatanMatchState, VertexId, EdgeId, PlayerId, BuildingType } from '../model/catanMatchState';

export interface PlacementRuleResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validates if a settlement can be placed at a specific vertex.
 * Incorporates the "Distance Rule" (no building 1 edge away)
 */
export function canPlaceSettlement(
  state: CatanMatchState,
  vertexId: VertexId,
  playerId: PlayerId,
  isInitialPhase: boolean
): PlacementRuleResult {
  
  // 1. Is the vertex already occupied?
  const vertex = state.board.vertices[vertexId];
  if (vertex?.building) {
    return { valid: false, reason: "Vertex is already occupied." };
  }

  // To do a real distance check, we need to know the graph.
  // In a real implementation with coordinates, we parse `vertexId` and check adjacent vertices.
  // For the sake of this example architecture, we simulate the logic.
  
  // Let's assume we have a helper 'getAdjacentVertices(vertexId, state)'
  const adjacentVertices = getAdjacentVertices(vertexId, state);
  
  // 2. Distance Rule
  for (const adjVertexId of adjacentVertices) {
    if (state.board.vertices[adjVertexId]?.building) {
      return { valid: false, reason: "Distance Rule: Too close to another building." };
    }
  }

  // 3. For non-initial phase, must connect to own road
  if (!isInitialPhase) {
    const connectedEdges = getAdjacentEdges(vertexId, state);
    const hasConnectingRoad = connectedEdges.some(edgeId => state.board.edges[edgeId]?.ownerId === playerId);
    
    if (!hasConnectingRoad) {
       return { valid: false, reason: "Must connect to one of your roads." };
    }
  }

  return { valid: true };
}

/**
 * Validates if a city can be placed.
 */
export function canPlaceCity(
  state: CatanMatchState,
  vertexId: VertexId,
  playerId: PlayerId
): PlacementRuleResult {
  
  const vertex = state.board.vertices[vertexId];
  
  if (!vertex?.building) {
    return { valid: false, reason: "Must upgrade an existing settlement." };
  }

  if (vertex.building.ownerId !== playerId) {
    return { valid: false, reason: "You do not own this settlement." };
  }

  if (vertex.building.type === BuildingType.CITY) {
    return { valid: false, reason: "This is already a city." };
  }

  return { valid: true };
}

/**
 * Validates if a road can be placed.
 */
export function canPlaceRoad(
  state: CatanMatchState,
  edgeId: EdgeId,
  playerId: PlayerId,
  isInitialPhase: boolean
): PlacementRuleResult {

  const edge = state.board.edges[edgeId];
  if (edge?.ownerId) {
    return { valid: false, reason: "Edge is already occupied by a road." };
  }

  // For initial phase, must connect to the last placed settlement for this player
  if (isInitialPhase) {
    // This requires tracking the last placed settlement in TurnState or passing it as context.
    return { valid: true }; 
  }

  // Must connect to a settlement, city, or existing road owned by player
  const adjacentVertices = getVerticesForEdge(edgeId, state);
  let connectsToOwnStructure = false;

  for (const vId of adjacentVertices) {
    const v = state.board.vertices[vId];
    if (v?.building?.ownerId === playerId) {
      connectsToOwnStructure = true;
      break;
    }
    
    // Check if other roads by this player connect here
    // And ensure there is no enemy settlement breaking the road
    if (v?.building?.ownerId !== null && v?.building?.ownerId !== playerId && v?.building) {
       // Enemy settlement blocks connection through this vertex
       continue;
    }

    const otherEdges = getAdjacentEdges(vId, state).filter(e => e !== edgeId);
    if (otherEdges.some(eId => state.board.edges[eId]?.ownerId === playerId)) {
      connectsToOwnStructure = true;
      break;
    }
  }

  if (!connectsToOwnStructure) {
     return { valid: false, reason: "Must connect to your own road or settlement." };
  }

  return { valid: true };
}

// --- Stubbed topological helpers for the sake of the domain logic pattern ---

function getAdjacentVertices(vertexId: VertexId, state: CatanMatchState): VertexId[] {
  // Parse the x,y,z coordinate from string and find neighbor points
  return []; 
}

function getAdjacentEdges(vertexId: VertexId, state: CatanMatchState): EdgeId[] {
  return [];
}

function getVerticesForEdge(edgeId: EdgeId, state: CatanMatchState): VertexId[] {
  return [];
}
