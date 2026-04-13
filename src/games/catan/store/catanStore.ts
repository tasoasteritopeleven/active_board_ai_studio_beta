import { create } from 'zustand';
import { CatanMatchState, LifecyclePhase, PlayerId, ResourceType } from '../domain/types';
import { generateTopology } from '../domain/boardGenerator';
import { gameEvents } from '../core/EventBus';
import * as THREE from 'three';

export interface FlowingResource {
  id: string;
  type: ResourceType;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  progress: number;
}

export interface TradeOffer {
  give: Record<ResourceType, number>;
  get: Record<ResourceType, number>;
  status: 'DRAFT' | 'PROPOSED' | 'ACCEPTED' | 'REJECTED';
  partnerId?: PlayerId;
}

export interface TurnHistoryEntry {
  turnNumber: number;
  playerId: string;
  diceResult?: [number, number];
  actions: string[];
}

export interface DevCard {
  id: string;
  type: 'KNIGHT' | 'VICTORY_POINT' | 'ROAD_BUILDING' | 'YEAR_OF_PLENTY' | 'MONOPOLY';
  played: boolean;
}

interface CatanStore extends CatanMatchState {
  turnNumber: number;
  turnHistory: TurnHistoryEntry[];
  currentTurnLog: string[];
  
  rollDice: () => void;
  endTurn: () => void;
  buildSettlement: (vertexId: string) => void;
  diceResult: [number, number] | null;
  resourceFlows: FlowingResource[];
  addResourceFlow: (flow: Omit<FlowingResource, 'id' | 'progress'>) => void;
  removeResourceFlow: (id: string) => void;
  uiState: {
    activeCarouselIndex: number;
    isCarouselOpen: boolean;
  };
  buildMode: 'SETTLEMENT' | 'CITY' | 'ROAD' | null;
  pendingBuild: { type: 'SETTLEMENT' | 'CITY' | 'ROAD'; locationId: string } | null;
  activeTrade: TradeOffer | null;
  robberMode: boolean;
  pendingRobberHexId: string | null;
  setCarouselIndex: (index: number) => void;
  toggleCarousel: () => void;
  setBuildMode: (mode: 'SETTLEMENT' | 'CITY' | 'ROAD' | null) => void;
  setPendingBuild: (pending: { type: 'SETTLEMENT' | 'CITY' | 'ROAD'; locationId: string } | null) => void;
  confirmBuild: () => void;
  
  // Trade actions
  updateTradeDraft: (give: Record<ResourceType, number>, get: Record<ResourceType, number>) => void;
  proposeTrade: () => void;
  cancelTrade: () => void;
  executeTrade: (partnerId: PlayerId) => void;

  // Robber actions
  setPendingRobberHexId: (hexId: string | null) => void;
  confirmRobberMove: (stealFromPlayerId?: PlayerId) => void;

  // Dev Cards
  buyDevCard: () => void;
  playDevCard: (cardId: string) => void;

  // Bank Trade
  bankTrade: (give: ResourceType, get: ResourceType) => void;
}

const INITIAL_PLAYERS = {
  'p1': { id: 'p1', name: 'Player 1', color: '#dc2626', resources: { WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 }, victoryPoints: 0, devCards: [], longestRoad: 0, largestArmy: 0 },
  'p2': { id: 'p2', name: 'Player 2', color: '#2563eb', resources: { WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 }, victoryPoints: 0, devCards: [], longestRoad: 0, largestArmy: 0 },
  'p3': { id: 'p3', name: 'Player 3', color: '#16a34a', resources: { WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 }, victoryPoints: 0, devCards: [], longestRoad: 0, largestArmy: 0 },
};

const initialHexes = generateTopology(2);
const desertHex = Object.values(initialHexes).find(h => h.terrain === 'DESERT');

export const useCatanStore = create<CatanStore>((set) => ({
  phase: LifecyclePhase.ROLLING,
  hexes: initialHexes,
  vertices: {},
  edges: {},
  players: INITIAL_PLAYERS,
  activePlayerId: 'p1',
  robberHexId: desertHex?.id || Object.keys(initialHexes)[0],
  diceResult: null,
  resourceFlows: [],
  uiState: {
    activeCarouselIndex: 0,
    isCarouselOpen: true,
  },
  buildMode: null,
  pendingBuild: null,
  activeTrade: null,
  robberMode: false,
  pendingRobberHexId: null,
  turnNumber: 1,
  turnHistory: [],
  currentTurnLog: [],

  setCarouselIndex: (index) => set((state) => ({
    uiState: { ...state.uiState, activeCarouselIndex: index }
  })),

  toggleCarousel: () => set((state) => ({
    uiState: { ...state.uiState, isCarouselOpen: !state.uiState.isCarouselOpen }
  })),

  setBuildMode: (mode) => set({ buildMode: mode, pendingBuild: null }),
  
  setPendingBuild: (pending) => set({ pendingBuild: pending }),

  setPendingRobberHexId: (hexId) => set({ pendingRobberHexId: hexId }),

  confirmRobberMove: (stealFromPlayerId) => set((state) => {
    if (!state.pendingRobberHexId) return state;

    const nextPlayers = { ...state.players };
    let stealLog = 'Moved Robber.';
    
    if (stealFromPlayerId) {
      const activePlayer = { ...nextPlayers[state.activePlayerId] };
      const victim = { ...nextPlayers[stealFromPlayerId] };
      const victimResources = { ...victim.resources };
      const activeResources = { ...activePlayer.resources };

      // Find available resources to steal
      const availableResources = Object.entries(victimResources)
        .filter(([_, count]) => count > 0)
        .map(([res]) => res as ResourceType);

      if (availableResources.length > 0) {
        // Steal random resource
        const stolenRes = availableResources[Math.floor(Math.random() * availableResources.length)];
        victimResources[stolenRes] -= 1;
        activeResources[stolenRes] += 1;

        activePlayer.resources = activeResources;
        victim.resources = victimResources;
        nextPlayers[state.activePlayerId] = activePlayer;
        nextPlayers[stealFromPlayerId] = victim;
        stealLog = `Moved Robber and stole from ${victim.name}.`;
      }
    }

    gameEvents.dispatch({ type: 'ROBBER_MOVED', hexId: state.pendingRobberHexId, targetPlayerId: stealFromPlayerId });

    return {
      robberHexId: state.pendingRobberHexId,
      robberMode: false,
      pendingRobberHexId: null,
      players: nextPlayers,
      phase: LifecyclePhase.TRADING_BUILDING,
      currentTurnLog: [...state.currentTurnLog, stealLog]
    };
  }),

  updateTradeDraft: (give, get) => set({
    activeTrade: { give, get, status: 'DRAFT' }
  }),

  proposeTrade: () => set((state) => {
    if (!state.activeTrade) return state;
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const store = useCatanStore.getState();
      if (store.activeTrade?.status === 'PROPOSED') {
        // Simple AI logic: 50% chance to accept if they have the resources
        const partnerId = 'p2'; // Just pick p2 for simulation
        const partner = store.players[partnerId];
        
        let canAfford = true;
        for (const [res, amount] of Object.entries(store.activeTrade.get)) {
          if (partner.resources[res as ResourceType] < amount) {
            canAfford = false;
            break;
          }
        }

        if (canAfford && Math.random() > 0.3) {
          useCatanStore.setState({ activeTrade: { ...store.activeTrade, status: 'ACCEPTED', partnerId } });
        } else {
          useCatanStore.setState({ activeTrade: { ...store.activeTrade, status: 'REJECTED' } });
        }
      }
    }, 2000);

    return { activeTrade: { ...state.activeTrade, status: 'PROPOSED' } };
  }),

  cancelTrade: () => set({ activeTrade: null }),

  executeTrade: (partnerId) => set((state) => {
    if (!state.activeTrade || state.activeTrade.status !== 'ACCEPTED') return state;

    const nextPlayers = { ...state.players };
    const activePlayer = { ...nextPlayers[state.activePlayerId] };
    const partnerPlayer = { ...nextPlayers[partnerId] };
    
    const activeResources = { ...activePlayer.resources };
    const partnerResources = { ...partnerPlayer.resources };

    const giveStr = Object.entries(state.activeTrade.give).filter(([_, v]) => v > 0).map(([k, v]) => `${v} ${k}`).join(', ');
    const getStr = Object.entries(state.activeTrade.get).filter(([_, v]) => v > 0).map(([k, v]) => `${v} ${k}`).join(', ');
    const tradeLog = `Traded with ${partnerPlayer.name}: Gave [${giveStr}] for [${getStr}].`;

    // Active player gives, partner gets
    for (const [res, amount] of Object.entries(state.activeTrade.give)) {
      activeResources[res as ResourceType] -= amount;
      partnerResources[res as ResourceType] += amount;
    }

    // Active player gets, partner gives
    for (const [res, amount] of Object.entries(state.activeTrade.get)) {
      activeResources[res as ResourceType] += amount;
      partnerResources[res as ResourceType] -= amount;
    }

    activePlayer.resources = activeResources;
    partnerPlayer.resources = partnerResources;
    nextPlayers[state.activePlayerId] = activePlayer;
    nextPlayers[partnerId] = partnerPlayer;

    gameEvents.dispatch({ type: 'TRADE_COMPLETED', tradeId: Math.random().toString() });

    return { 
      players: nextPlayers, 
      activeTrade: null,
      currentTurnLog: [...state.currentTurnLog, tradeLog]
    };
  }),

  confirmBuild: () => set((state) => {
    if (!state.pendingBuild) return state;
    
    const { type, locationId } = state.pendingBuild;
    const nextPlayers = { ...state.players };
    const activePlayer = { ...nextPlayers[state.activePlayerId] };
    const nextResources = { ...activePlayer.resources };

    // Deduct resources
    if (type === 'SETTLEMENT' && state.phase === LifecyclePhase.TRADING_BUILDING) {
      nextResources[ResourceType.WOOD] -= 1;
      nextResources[ResourceType.BRICK] -= 1;
      nextResources[ResourceType.SHEEP] -= 1;
      nextResources[ResourceType.WHEAT] -= 1;
      activePlayer.victoryPoints += 1;
    } else if (type === 'CITY' && state.phase === LifecyclePhase.TRADING_BUILDING) {
      nextResources[ResourceType.WHEAT] -= 2;
      nextResources[ResourceType.ORE] -= 3;
      activePlayer.victoryPoints += 1; // Settlement (1) -> City (2) = +1
    } else if (type === 'ROAD' && state.phase === LifecyclePhase.TRADING_BUILDING) {
      nextResources[ResourceType.WOOD] -= 1;
      nextResources[ResourceType.BRICK] -= 1;
      activePlayer.longestRoad += 1;
    }

    activePlayer.resources = nextResources;
    nextPlayers[state.activePlayerId] = activePlayer;

    gameEvents.dispatch({ 
      type: 'BUILDING_PLACED', 
      playerId: state.activePlayerId, 
      buildingType: type, 
      locationId: locationId 
    });

    const buildLog = `Built a ${type}.`;

    if (type === 'SETTLEMENT' || type === 'CITY') {
      return {
        players: nextPlayers,
        vertices: {
          ...state.vertices,
          [locationId]: {
            id: locationId,
            position: { x: 0, y: 0, z: 0 },
            building: { type, ownerId: state.activePlayerId }
          }
        },
        buildMode: null,
        pendingBuild: null,
        currentTurnLog: [...state.currentTurnLog, buildLog]
      };
    } else if (type === 'ROAD') {
      return {
        players: nextPlayers,
        edges: {
          ...state.edges,
          [locationId]: {
            id: locationId,
            position: { x: 0, y: 0, z: 0 },
            rotation: 0,
            road: { ownerId: state.activePlayerId }
          }
        },
        buildMode: null,
        pendingBuild: null,
        currentTurnLog: [...state.currentTurnLog, buildLog]
      };
    }
    return state;
  }),

  buyDevCard: () => set((state) => {
    if (state.phase !== LifecyclePhase.TRADING_BUILDING) return state;
    
    const nextPlayers = { ...state.players };
    const activePlayer = { ...nextPlayers[state.activePlayerId] };
    const nextResources = { ...activePlayer.resources };

    if (nextResources[ResourceType.SHEEP] >= 1 && nextResources[ResourceType.WHEAT] >= 1 && nextResources[ResourceType.ORE] >= 1) {
      nextResources[ResourceType.SHEEP] -= 1;
      nextResources[ResourceType.WHEAT] -= 1;
      nextResources[ResourceType.ORE] -= 1;

      const cardTypes: DevCard['type'][] = ['KNIGHT', 'KNIGHT', 'KNIGHT', 'VICTORY_POINT', 'ROAD_BUILDING', 'YEAR_OF_PLENTY', 'MONOPOLY'];
      const randomType = cardTypes[Math.floor(Math.random() * cardTypes.length)];
      
      const newCard: DevCard = {
        id: Math.random().toString(),
        type: randomType,
        played: false
      };

      activePlayer.devCards = [...(activePlayer.devCards || []), newCard];
      activePlayer.resources = nextResources;
      nextPlayers[state.activePlayerId] = activePlayer;

      return {
        players: nextPlayers,
        currentTurnLog: [...state.currentTurnLog, `Bought a Development Card.`]
      };
    }
    return state;
  }),

  playDevCard: (cardId) => set((state) => {
    const nextPlayers = { ...state.players };
    const activePlayer = { ...nextPlayers[state.activePlayerId] };
    
    const cardIndex = activePlayer.devCards?.findIndex(c => c.id === cardId);
    if (cardIndex !== undefined && cardIndex !== -1) {
      const card = activePlayer.devCards![cardIndex];
      if (!card.played) {
        activePlayer.devCards![cardIndex].played = true;
        
        let logMsg = `Played Development Card: ${card.type}`;
        
        if (card.type === 'KNIGHT') {
          activePlayer.largestArmy += 1;
          return {
            players: nextPlayers,
            robberMode: true,
            currentTurnLog: [...state.currentTurnLog, logMsg]
          };
        } else if (card.type === 'VICTORY_POINT') {
          activePlayer.victoryPoints += 1;
        } else if (card.type === 'ROAD_BUILDING') {
          activePlayer.resources[ResourceType.WOOD] += 2;
          activePlayer.resources[ResourceType.BRICK] += 2;
          logMsg += " (Gained 2 Wood, 2 Brick)";
        } else if (card.type === 'YEAR_OF_PLENTY') {
          activePlayer.resources[ResourceType.WHEAT] += 1;
          activePlayer.resources[ResourceType.ORE] += 1;
          logMsg += " (Gained 1 Wheat, 1 Ore)";
        }
        
        return {
          players: nextPlayers,
          currentTurnLog: [...state.currentTurnLog, logMsg]
        };
      }
    }
    return state;
  }),

  bankTrade: (give, get) => set((state) => {
    if (state.phase !== LifecyclePhase.TRADING_BUILDING) return state;

    const nextPlayers = { ...state.players };
    const activePlayer = { ...nextPlayers[state.activePlayerId] };
    const nextResources = { ...activePlayer.resources };

    if (nextResources[give] >= 4) {
      nextResources[give] -= 4;
      nextResources[get] += 1;
      
      activePlayer.resources = nextResources;
      nextPlayers[state.activePlayerId] = activePlayer;

      return {
        players: nextPlayers,
        currentTurnLog: [...state.currentTurnLog, `Traded 4 ${give} for 1 ${get} with the Bank.`]
      };
    }
    return state;
  }),

  addResourceFlow: (flow) => set((state) => ({
    resourceFlows: [...state.resourceFlows, { ...flow, id: Math.random().toString(36).substring(7), progress: 0 }]
  })),

  buildSettlement: (vertexId) => set((state) => {
    if (state.phase !== LifecyclePhase.TRADING_BUILDING && state.phase !== LifecyclePhase.SETUP_1 && state.phase !== LifecyclePhase.SETUP_2) return state;
    
    gameEvents.dispatch({ 
      type: 'BUILDING_PLACED', 
      playerId: state.activePlayerId, 
      buildingType: 'SETTLEMENT', 
      locationId: vertexId 
    });

    const nextPlayers = { ...state.players };
    const activePlayer = { ...nextPlayers[state.activePlayerId] };
    const nextResources = { ...activePlayer.resources };

    // Simulate gaining resources on second setup phase
    if (state.phase === LifecyclePhase.SETUP_2) {
      nextResources[ResourceType.WOOD] += 1;
      nextResources[ResourceType.WHEAT] += 1;
      
      const [vx, vz] = vertexId.split(',').map(Number);
      
      gameEvents.dispatch({
        type: 'RESOURCE_GAINED',
        playerId: state.activePlayerId,
        resources: { [ResourceType.WOOD]: 1, [ResourceType.WHEAT]: 1 },
        position: [vx || 0, 0.5, vz || 0]
      });
    }

    activePlayer.resources = nextResources;
    activePlayer.victoryPoints += 1;
    nextPlayers[state.activePlayerId] = activePlayer;

    return {
      players: nextPlayers,
      vertices: {
        ...state.vertices,
        [vertexId]: {
          id: vertexId,
          position: { x: 0, y: 0, z: 0 },
          building: { type: 'SETTLEMENT', ownerId: state.activePlayerId }
        }
      }
    };
  }),

  removeResourceFlow: (id) => set((state) => ({
    resourceFlows: state.resourceFlows.filter(f => f.id !== id)
  })),

  rollDice: () => set((state) => {
    if (state.phase !== LifecyclePhase.ROLLING) return state;
    
    gameEvents.dispatch({ type: 'DICE_ROLL_STARTED' });
    
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    
    if (total === 7) {
      setTimeout(() => {
        gameEvents.dispatch({ type: 'DICE_SETTLED', result: [d1, d2] });
      }, 1500);

      return {
        diceResult: [d1, d2],
        robberMode: true,
        phase: LifecyclePhase.TRADING_BUILDING // Technically a sub-phase, but we use robberMode flag
      };
    }

    // Simulate resource flow
    const matchingHexes = Object.values(state.hexes).filter(h => h.numberToken === total && h.terrain !== 'DESERT' && h.id !== state.robberHexId);
    const flows: FlowingResource[] = [];
    const nextPlayers = { ...state.players };
    const activePlayer = { ...nextPlayers[state.activePlayerId] };
    const nextResources = { ...activePlayer.resources };
    
    if (matchingHexes.length > 0) {
      matchingHexes.forEach(hex => {
        let resourceType: ResourceType | null = null;
        switch (hex.terrain) {
          case 'FOREST': resourceType = ResourceType.WOOD; break;
          case 'HILLS': resourceType = ResourceType.BRICK; break;
          case 'PASTURE': resourceType = ResourceType.SHEEP; break;
          case 'FIELDS': resourceType = ResourceType.WHEAT; break;
          case 'MOUNTAINS': resourceType = ResourceType.ORE; break;
        }
        
        if (resourceType) {
          // Update state
          nextResources[resourceType] += 1;

          flows.push({
            id: Math.random().toString(36).substring(7),
            type: resourceType,
            startPos: new THREE.Vector3(hex.position.x, hex.position.y + 0.5, hex.position.z),
            endPos: new THREE.Vector3(0, 5, 5), // Fly towards camera/UI
            progress: 0
          });
          
          gameEvents.dispatch({ 
            type: 'RESOURCE_GAINED', 
            playerId: state.activePlayerId, 
            resources: { [resourceType]: 1 },
            position: [hex.position.x, hex.position.y + 0.5, hex.position.z]
          });
        }
      });
    }

    activePlayer.resources = nextResources;
    nextPlayers[state.activePlayerId] = activePlayer;

    // Delay the settled event slightly to match animation
    setTimeout(() => {
      gameEvents.dispatch({ type: 'DICE_SETTLED', result: [d1, d2] });
    }, 1500);

    return { 
      diceResult: [d1, d2],
      phase: LifecyclePhase.TRADING_BUILDING,
      resourceFlows: [...state.resourceFlows, ...flows],
      players: nextPlayers
    };
  }),

  endTurn: () => set((state) => {
    if (state.phase !== LifecyclePhase.TRADING_BUILDING) return state;
    
    // Save history entry
    const historyEntry: TurnHistoryEntry = {
      turnNumber: state.turnNumber,
      playerId: state.activePlayerId,
      diceResult: state.diceResult || undefined,
      actions: [...state.currentTurnLog]
    };

    const playerIds = Object.keys(state.players);
    const currentIndex = playerIds.indexOf(state.activePlayerId);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    
    return {
      activePlayerId: playerIds[nextIndex],
      phase: LifecyclePhase.ROLLING,
      diceResult: null,
      turnNumber: state.turnNumber + 1,
      turnHistory: [...state.turnHistory, historyEntry],
      currentTurnLog: [] // Reset log for next turn
    };
  })
}));
