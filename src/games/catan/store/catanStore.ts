import { create } from 'zustand';
import { CatanMatchState, LifecyclePhase, PlayerId, ResourceType, TerrainType } from '../domain/types';
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
  actions: LogEntry[];
}

export interface DevCard {
  id: string;
  type: 'KNIGHT' | 'VICTORY_POINT' | 'ROAD_BUILDING' | 'YEAR_OF_PLENTY' | 'MONOPOLY';
  played: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  text: string;
  timestamp: number;
}

export interface LogEntry {
  playerId: string;
  action: string;
  details?: string;
  timestamp: number;
}

interface CatanStore extends CatanMatchState {
  turnNumber: number;
  turnHistory: TurnHistoryEntry[];
  currentTurnLog: LogEntry[];
  chatMessages: ChatMessage[];
  bankInventory: Record<ResourceType | 'DEV_CARDS', number>;
  turnOrder: PlayerId[];
  setupPhase: 'NOT_STARTED' | 'DETERMINING_ORDER' | 'PLACING_FIRST' | 'PLACING_SECOND' | 'COMPLETED';
  setupRolls: Record<PlayerId, number>;
  aiConfigs: any[];
  
  rollDice: () => void;
  endTurn: () => void;
  buildSettlement: (vertexId: string) => void;
  buildRoad: (edgeId: string) => void;
  diceResult: [number, number] | null;
  diceRollId: number;
  resourceFlows: FlowingResource[];
  addResourceFlow: (flow: Omit<FlowingResource, 'id' | 'progress'>) => void;
  removeResourceFlow: (id: string) => void;
  initializeGame: (playerCount: number, aiConfigs: any[]) => void;
  
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
  updatePlayerColor: (playerId: string, color: string) => void;
  addChatMessage: (text: string, playerId?: string) => void;
  setSetupPhase: (phase: 'NOT_STARTED' | 'DETERMINING_ORDER' | 'PLACING_FIRST' | 'PLACING_SECOND' | 'COMPLETED') => void;
}

const INITIAL_PLAYERS: Record<string, any> = {
  'p1': { id: 'p1', name: 'Player 1', color: '#dc2626', resources: { WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 }, victoryPoints: 0, devCards: [], longestRoad: 0, largestArmy: 0 },
  'p2': { id: 'p2', name: 'Player 2', color: '#2563eb', resources: { WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 }, victoryPoints: 0, devCards: [], longestRoad: 0, largestArmy: 0 },
  'p3': { id: 'p3', name: 'Player 3', color: '#16a34a', resources: { WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 }, victoryPoints: 0, devCards: [], longestRoad: 0, largestArmy: 0 },
  'p4': { id: 'p4', name: 'Player 4', color: '#ca8a04', resources: { WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 }, victoryPoints: 0, devCards: [], longestRoad: 0, largestArmy: 0 },
  'p5': { id: 'p5', name: 'Player 5', color: '#9333ea', resources: { WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 }, victoryPoints: 0, devCards: [], longestRoad: 0, largestArmy: 0 },
  'p6': { id: 'p6', name: 'Player 6', color: '#0891b2', resources: { WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 }, victoryPoints: 0, devCards: [], longestRoad: 0, largestArmy: 0 },
};

const initialHexes = generateTopology(2);
const desertHex = Object.values(initialHexes).find(h => h.terrain === 'DESERT');

export const useCatanStore = create<CatanStore>((set) => ({
  phase: LifecyclePhase.LOBBY,
  hexes: initialHexes,
  vertices: {},
  edges: {},
  players: INITIAL_PLAYERS,
  activePlayerId: 'p1',
  robberHexId: desertHex?.id || Object.keys(initialHexes)[0],
  diceResult: null,
  diceRollId: 0,
  resourceFlows: [],
  uiState: {
    activeCarouselIndex: 0,
    isCarouselOpen: true,
  },
  buildMode: null,
  pendingBuild: null,
  activeTrade: null,
  bankInventory: {
    WOOD: 19, BRICK: 19, SHEEP: 19, WHEAT: 19, ORE: 19, DEV_CARDS: 25
  },
  turnOrder: [],
  setupPhase: 'NOT_STARTED',
  setupRolls: {},
  aiConfigs: [],
  robberMode: false,
  pendingRobberHexId: null,
  turnNumber: 1,
  turnHistory: [],
  currentTurnLog: [],
  chatMessages: [],

  addChatMessage: (text, playerId) => set((state) => ({
    chatMessages: [
      ...state.chatMessages,
      {
        id: Math.random().toString(36).substring(7),
        playerId: playerId || 'p1',
        text,
        timestamp: Date.now()
      }
    ]
  })),

  setSetupPhase: (phase) => set({ setupPhase: phase }),

  removeResourceFlow: (id) => set((state) => ({
    resourceFlows: state.resourceFlows.filter(f => f.id !== id)
  })),

  rollDice: () => set((state) => {
    gameEvents.dispatch({ type: 'DICE_ROLL_STARTED' });
    
    // NORMAL ROLL LOGIC
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;
    const rollerId = state.activePlayerId;

    setTimeout(() => {
      gameEvents.dispatch({ type: 'DICE_SETTLED', result: [d1, d2] });
    }, 1500);

    if (state.setupPhase === 'DETERMINING_ORDER') {
      const nextRolls = { ...state.setupRolls, [state.activePlayerId]: total };
      const unrolled = state.turnOrder.filter(id => !nextRolls[id]);
      
      setTimeout(() => {
        const s = useCatanStore.getState();
        let nextState: Partial<CatanState> = {
          setupRolls: nextRolls,
          currentTurnLog: [...s.currentTurnLog, { 
            playerId: rollerId, 
            action: `Ρίψη (Καθορισμός σειράς): ${total}`, 
            timestamp: Date.now() 
          }]
        };

        if (unrolled.length === 0) {
          // Everyone rolled, determine order and transition
          const sorted = Object.entries(nextRolls)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .map(entry => entry[0] as PlayerId);

          nextState.turnOrder = sorted;
          nextState.activePlayerId = sorted[0];
          nextState.setupPhase = 'PLACING_FIRST';
          nextState.phase = LifecyclePhase.SETUP_1;
          nextState.currentTurnLog!.push({ 
            playerId: 'SYSTEM', 
            action: `Σειρά Παιχνιδιού: ${sorted.map((id: string) => s.players[id].name).join(' > ')}`, 
            timestamp: Date.now() 
          });
        } else {
          // Next player's turn to roll
          nextState.activePlayerId = unrolled[0];
        }
        
        useCatanStore.setState(nextState);
      }, 2500); // Let the dice visually settle before advancing the setup order

      return {
        diceResult: [d1, d2],
        diceRollId: state.diceRollId + 1,
        // Don't update activePlayerId or setupRolls yet
      };
    }

    if (total === 7) {
      logs.push({ playerId: rollerId, action: `Ρίψη: 7! Ο Ληστής ενεργοποιείται.`, timestamp: Date.now() });

      Object.keys(nextPlayers).forEach(pid => {
        const p = nextPlayers[pid];
        const totalRes = Object.values(p.resources).reduce((a, b) => (a as any) + (b as any), 0) as number;
        if (totalRes > 7) {
          const toDiscard = Math.floor(totalRes / 2);
          logs.push({ playerId: pid, action: `Έχασε ${toDiscard} πόρους λόγω ληστή.`, timestamp: Date.now() });
          let remaining = toDiscard;
          const resTypes = Object.values(ResourceType);
          while(remaining > 0) {
            const rt = resTypes[Math.floor(Math.random()*resTypes.length)];
            if (p.resources[rt] > 0) {
              p.resources[rt]--;
              nextBankInventory[rt]++;
              remaining--;
            }
          }
        }
      });

      setTimeout(() => {
        const s = useCatanStore.getState();
        useCatanStore.setState({
          players: nextPlayers,
          bankInventory: nextBankInventory,
          phase: LifecyclePhase.ROBBER_MOVE, 
          robberMode: true,
          currentTurnLog: [...s.currentTurnLog, ...logs]
        });
      }, 2500);

      return { 
        diceResult: [d1, d2],
        diceRollId: state.diceRollId + 1
      };
    }

    Object.values(state.hexes).forEach(hex => {
      if (hex.numberToken === total && hex.id !== state.robberHexId && hex.terrain !== TerrainType.DESERT) {
        Object.values(state.vertices).forEach(vertex => {
          if (vertex.building) {
            const dx = vertex.position.x - hex.position.x;
            const dz = vertex.position.z - hex.position.z;
            const distSq = dx*dx + dz*dz;
            
            if (distSq < 1.2) {
              const amount = vertex.building.type === 'CITY' ? 2 : 1;
              const resType = {
                [TerrainType.FOREST]: ResourceType.WOOD,
                [TerrainType.HILLS]: ResourceType.BRICK,
                [TerrainType.PASTURE]: ResourceType.SHEEP,
                [TerrainType.FIELDS]: ResourceType.WHEAT,
                [TerrainType.MOUNTAINS]: ResourceType.ORE
              }[hex.terrain] as ResourceType;

              if (resType && nextBankInventory[resType] >= amount) {
                const ownerId = vertex.building.ownerId;
                nextPlayers[ownerId].resources[resType] += amount;
                nextBankInventory[resType] -= amount;
                
                logs.push({ 
                  playerId: ownerId, 
                  action: `Κέρδισε ${amount} x ${resType}`, 
                  details: `Από το εξάγωνο ${hex.terrain} (${total})`,
                  timestamp: Date.now() 
                });
                
                flows.push({
                  id: Math.random().toString(36).substring(7),
                  type: resType,
                  startPos: new THREE.Vector3(hex.position.x, 0.5, hex.position.z),
                  endPos: new THREE.Vector3(vertex.position.x, 2, vertex.position.z),
                  progress: 0
                });
              }
            }
          }
        });
      }
    });

    setTimeout(() => {
      const s = useCatanStore.getState();
      useCatanStore.setState({
        players: nextPlayers,
        bankInventory: nextBankInventory,
        phase: LifecyclePhase.TRADING_BUILDING,
        resourceFlows: [...s.resourceFlows, ...flows],
        currentTurnLog: [...s.currentTurnLog, { playerId: rollerId, action: `Ζαριά: ${total}`, timestamp: Date.now() }, ...logs]
      });
    }, 2500);

    return { 
      diceResult: [d1, d2], 
      diceRollId: state.diceRollId + 1
    };
  }),

  setCarouselIndex: (index) => set((state) => ({
    uiState: { ...state.uiState, activeCarouselIndex: index }
  })),

  toggleCarousel: () => set((state) => ({
    uiState: { ...state.uiState, isCarouselOpen: !state.uiState.isCarouselOpen }
  })),

  setBuildMode: (mode) => set((state) => ({ 
    buildMode: mode, 
    pendingBuild: null,
    uiState: mode ? { ...state.uiState, isCarouselOpen: true, activeCarouselIndex: 1 } : state.uiState
  })),
  
  setPendingBuild: (pending) => set((state) => ({ 
    pendingBuild: pending,
    uiState: pending ? { ...state.uiState, isCarouselOpen: true, activeCarouselIndex: 1 } : state.uiState
  })),

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
        stealLog = `Κλάπηκε πόρος από τον ${victim.name}.`;
      }
    }

    gameEvents.dispatch({ type: 'ROBBER_MOVED', hexId: state.pendingRobberHexId, targetPlayerId: stealFromPlayerId });

    return {
      robberHexId: state.pendingRobberHexId,
      robberMode: false,
      pendingRobberHexId: null,
      players: nextPlayers,
      phase: LifecyclePhase.TRADING_BUILDING,
      currentTurnLog: [...state.currentTurnLog, { playerId: state.activePlayerId, action: stealLog, timestamp: Date.now() }]
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
      currentTurnLog: [...state.currentTurnLog, { playerId: state.activePlayerId, action: tradeLog, timestamp: Date.now() }]
    };
  }),

  confirmBuild: () => set((state) => {
    if (!state.pendingBuild) return state;
    
    const { type, locationId } = state.pendingBuild;
    const nextPlayers = { ...state.players };
    const activePlayer = { ...nextPlayers[state.activePlayerId] };
    const nextResources = { ...activePlayer.resources };

    // Deduct resources and handle setup logic
    if (type === 'SETTLEMENT') {
      if (state.phase === LifecyclePhase.TRADING_BUILDING) {
        nextResources[ResourceType.WOOD] -= 1;
        nextResources[ResourceType.BRICK] -= 1;
        nextResources[ResourceType.SHEEP] -= 1;
        nextResources[ResourceType.WHEAT] -= 1;
        
        state.bankInventory[ResourceType.WOOD] += 1;
        state.bankInventory[ResourceType.BRICK] += 1;
        state.bankInventory[ResourceType.SHEEP] += 1;
        state.bankInventory[ResourceType.WHEAT] += 1;
      }
      activePlayer.victoryPoints += 1;
    } else if (type === 'CITY' && state.phase === LifecyclePhase.TRADING_BUILDING) {
      nextResources[ResourceType.WHEAT] -= 2;
      nextResources[ResourceType.ORE] -= 3;
      state.bankInventory[ResourceType.WHEAT] += 2;
      state.bankInventory[ResourceType.ORE] += 3;
      activePlayer.victoryPoints += 1;
    } else if (type === 'ROAD') {
      if (state.phase === LifecyclePhase.TRADING_BUILDING) {
        nextResources[ResourceType.WOOD] -= 1;
        nextResources[ResourceType.BRICK] -= 1;
        state.bankInventory[ResourceType.WOOD] += 1;
        state.bankInventory[ResourceType.BRICK] += 1;
      }
    }

    activePlayer.resources = nextResources;
    nextPlayers[state.activePlayerId] = activePlayer;

    gameEvents.dispatch({ 
      type: 'BUILDING_PLACED', 
      playerId: state.activePlayerId, 
      buildingType: type, 
      locationId: locationId 
    });

    const buildLog = `Χτίστηκε ${type}.`;

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
        buildMode: (type === 'SETTLEMENT' && (state.phase === LifecyclePhase.SETUP_1 || state.phase === LifecyclePhase.SETUP_2)) ? 'ROAD' : null,
        pendingBuild: null,
        currentTurnLog: [...state.currentTurnLog, { playerId: state.activePlayerId, action: buildLog, timestamp: Date.now() }]
      };
    } else if (type === 'ROAD') {
      const newState: any = {
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
        currentTurnLog: [...state.currentTurnLog, { playerId: state.activePlayerId, action: buildLog, timestamp: Date.now() }]
      };

      // Auto-advance setup turn
      if (state.phase === LifecyclePhase.SETUP_1) {
        const orderIdx = state.turnOrder.indexOf(state.activePlayerId);
        if (orderIdx === state.turnOrder.length - 1) {
          newState.phase = LifecyclePhase.SETUP_2;
          newState.setupPhase = 'PLACING_SECOND';
          newState.buildMode = 'SETTLEMENT';
        } else {
          newState.activePlayerId = state.turnOrder[orderIdx + 1];
          newState.buildMode = 'SETTLEMENT';
        }
      } else if (state.phase === LifecyclePhase.SETUP_2) {
        const orderIdx = state.turnOrder.indexOf(state.activePlayerId);
        if (orderIdx === 0) {
          newState.phase = LifecyclePhase.ROLLING;
          newState.setupPhase = 'COMPLETED';
          newState.turnNumber = 1;
          newState.currentTurnLog.push({ playerId: 'SYSTEM', action: 'Παιχνίδι Ξεκίνησε!', timestamp: Date.now() });
          newState.activePlayerId = state.turnOrder[0];
        } else {
          newState.activePlayerId = state.turnOrder[orderIdx - 1];
          newState.buildMode = 'SETTLEMENT';
        }
      }

      return newState;
    }
    return state;
  }),

  buyDevCard: () => set((state) => {
    if (state.phase !== LifecyclePhase.TRADING_BUILDING) return state;
    if (state.bankInventory.DEV_CARDS <= 0) return state;
    
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
        bankInventory: { ...state.bankInventory, DEV_CARDS: state.bankInventory.DEV_CARDS - 1 },
        currentTurnLog: [...state.currentTurnLog, { playerId: state.activePlayerId, action: `Αγόρασε Κάρτα Ανάπτυξης`, timestamp: Date.now() }]
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
            currentTurnLog: [...state.currentTurnLog, { playerId: state.activePlayerId, action: logMsg, timestamp: Date.now() }]
          };
        } else if (card.type === 'VICTORY_POINT') {
          activePlayer.victoryPoints += 1;
        } else if (card.type === 'ROAD_BUILDING') {
          activePlayer.resources[ResourceType.WOOD] += 2;
          activePlayer.resources[ResourceType.BRICK] += 2;
          logMsg += " (Κέρδισε 2 Ξύλα, 2 Τούβλα)";
        } else if (card.type === 'YEAR_OF_PLENTY') {
          activePlayer.resources[ResourceType.WHEAT] += 1;
          activePlayer.resources[ResourceType.ORE] += 1;
          logMsg += " (Κέρδισε 1 Σιτάρι, 1 Μετάλλευμα)";
        }
        
        return {
          players: nextPlayers,
          currentTurnLog: [...state.currentTurnLog, { playerId: state.activePlayerId, action: logMsg, timestamp: Date.now() }]
        };
      }
    }
    return state;
  }),

  updatePlayerColor: (playerId, color) => set((state) => ({
    players: {
      ...state.players,
      [playerId]: { ...state.players[playerId], color }
    }
  })),

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
        currentTurnLog: [...state.currentTurnLog, { playerId: state.activePlayerId, action: `Αντάλλαξε 4 ${give} για 1 ${get} με την Τράπεζα.`, timestamp: Date.now() }]
      };
    }
    return state;
  }),

  addResourceFlow: (flow) => set((state) => ({
    resourceFlows: [...state.resourceFlows, { ...flow, id: Math.random().toString(36).substring(7), progress: 0 }]
  })),

  initializeGame: (playerCount: number, aiConfigs: any[]) => set((state) => {
    const nextPlayers: Record<string, any> = {};
    const baseColors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899'];
    const playerIds: PlayerId[] = [];
    
    // Always include local player p1
    playerIds.push('p1');
    nextPlayers['p1'] = { 
      id: 'p1',
      name: 'Εσύ (P1)',
      color: baseColors[0],
      resources: { WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 },
      victoryPoints: 0,
      devCards: [],
      longestRoad: 0,
      largestArmy: 0,
      isAI: false
    };

    // Add others
    for (let i = 1; i < playerCount; i++) {
      const id = `p${i+1}` as PlayerId;
      playerIds.push(id);
      const config = (aiConfigs || []).find(c => c.id === id);
      nextPlayers[id] = {
        id,
        name: config?.isAI ? `AI ${i}` : `Παίκτης ${i+1}`,
        color: baseColors[i] || '#64748b',
        resources: { WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 },
        victoryPoints: 0,
        devCards: [],
        longestRoad: 0,
        largestArmy: 0,
        isAI: !!config?.isAI
      };
    }

    return {
      players: nextPlayers,
      activePlayerId: 'p1',
      phase: LifecyclePhase.ROLLING,
      setupPhase: 'DETERMINING_ORDER',
      turnOrder: playerIds,
      setupRolls: {},
      aiConfigs,
      bankInventory: {
        WOOD: 19, BRICK: 19, SHEEP: 19, WHEAT: 19, ORE: 19, DEV_CARDS: 25
      },
      turnNumber: 1,
      turnHistory: [],
      currentTurnLog: [],
      resourceFlows: [],
      robberMode: false,
      diceResult: null,
      vertices: {}, // Reset board
      edges: {},
      robberHexId: desertHex?.id || Object.keys(initialHexes)[0]
    };
  }),

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

  buildRoad: (edgeId) => set((state) => {
    if (state.phase !== LifecyclePhase.TRADING_BUILDING && state.phase !== LifecyclePhase.SETUP_1 && state.phase !== LifecyclePhase.SETUP_2) return state;

    return {
      edges: {
        ...state.edges,
        [edgeId]: {
          id: edgeId,
          position: { x: 0, y: 0, z: 0 },
          rotation: 0,
          road: { ownerId: state.activePlayerId }
        }
      },
      currentTurnLog: [...state.currentTurnLog, { playerId: state.activePlayerId, action: `Χτίστηκε δρόμος.`, timestamp: Date.now() }]
    };
  }),

  // Removed duplicate rollDice

  endTurn: () => set((state) => {
    // Only allow ending turn in TRADING_BUILDING or SETUP phases
    if (state.phase !== LifecyclePhase.TRADING_BUILDING && 
        state.phase !== LifecyclePhase.SETUP_1 && 
        state.phase !== LifecyclePhase.SETUP_2) return state;
    
    // Save history entry
    const historyEntry: TurnHistoryEntry = {
      turnNumber: state.turnNumber,
      playerId: state.activePlayerId,
      diceResult: state.diceResult || undefined,
      actions: [...state.currentTurnLog]
    };

    const nextLog: LogEntry[] = [{ playerId: state.activePlayerId, action: `Τέλος γύρου για τον παίκτη ${state.players[state.activePlayerId].name}`, timestamp: Date.now() }];

    if (state.phase === LifecyclePhase.SETUP_1) {
      const orderIdx = state.turnOrder.indexOf(state.activePlayerId);
      if (orderIdx === state.turnOrder.length - 1) {
        // Last player moves to SETUP_2, stays active player for snake order
        return {
          phase: LifecyclePhase.SETUP_2,
          setupPhase: 'PLACING_SECOND',
          currentTurnLog: nextLog
        };
      } else {
        return {
          activePlayerId: state.turnOrder[orderIdx + 1],
          currentTurnLog: nextLog
        };
      }
    } else if (state.phase === LifecyclePhase.SETUP_2) {
      const orderIdx = state.turnOrder.indexOf(state.activePlayerId);
      if (orderIdx === 0) {
        // First player finishes Setup 2, game starts Rolling phase
        return {
          phase: LifecyclePhase.ROLLING,
          setupPhase: 'COMPLETED',
          turnNumber: 1,
          currentTurnLog: [...nextLog, { playerId: 'SYSTEM', action: 'Παιχνίδι Ξεκίνησε!', timestamp: Date.now() }],
          activePlayerId: state.turnOrder[0]
        };
      } else {
        return {
          activePlayerId: state.turnOrder[orderIdx - 1],
          currentTurnLog: nextLog
        };
      }
    }

    const currentIndex = state.turnOrder.indexOf(state.activePlayerId);
    const nextIndex = (currentIndex + 1) % state.turnOrder.length;
    
    return {
      activePlayerId: state.turnOrder[nextIndex],
      phase: LifecyclePhase.ROLLING,
      turnNumber: state.turnNumber + 1,
      turnHistory: [...state.turnHistory, historyEntry],
      currentTurnLog: []
    };
  })
}));
