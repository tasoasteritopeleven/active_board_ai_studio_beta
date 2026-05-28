export type MonopolySpaceType = 'go' | 'property' | 'tax' | 'chance' | 'chest' | 'jail' | 'gotojail' | 'free';

export interface MonopolySpace {
  index: number;
  name: string;
  type: MonopolySpaceType;
  price?: number;
  rent?: number;
  color?: string;
}

export interface MonopolyPlayer {
  id: string;
  name: string;
  color: string;
  money: number;
  position: number;
  inJail: boolean;
  jailTurns: number;
  bankrupt: boolean;
}

export interface MonopolyPropertyState {
  spaceIndex: number;
  ownerId: string | null;
  houses: number;
  mortgaged: boolean;
}

export interface MonopolyState {
  players: MonopolyPlayer[];
  currentPlayerId: string;
  properties: Record<number, MonopolyPropertyState>;
  turnNumber: number;
  lastRoll: [number, number] | null;
  phase: 'roll' | 'buy' | 'payrent' | 'end';
  log: string[];
  winnerId: string | null;
}

export const BOARD: MonopolySpace[] = [
  { index: 0, name: 'GO', type: 'go' },
  { index: 1, name: 'Mediterranean Ave', type: 'property', price: 60, rent: 2, color: '#8B4513' },
  { index: 2, name: 'Community Chest', type: 'chest' },
  { index: 3, name: 'Baltic Ave', type: 'property', price: 60, rent: 4, color: '#8B4513' },
  { index: 4, name: 'Income Tax', type: 'tax' },
  { index: 5, name: 'Reading Railroad', type: 'property', price: 200, rent: 25, color: '#64748b' },
  { index: 6, name: 'Oriental Ave', type: 'property', price: 100, rent: 6, color: '#06b6d4' },
  { index: 7, name: 'Chance', type: 'chance' },
  { index: 8, name: 'Vermont Ave', type: 'property', price: 100, rent: 6, color: '#06b6d4' },
  { index: 9, name: 'Connecticut Ave', type: 'property', price: 120, rent: 8, color: '#06b6d4' },
  { index: 10, name: 'Jail', type: 'jail' },
  { index: 11, name: 'St. Charles', type: 'property', price: 140, rent: 10, color: '#ec4899' },
  { index: 12, name: 'Electric Co', type: 'property', price: 150, rent: 12, color: '#eab308' },
  { index: 13, name: 'States Ave', type: 'property', price: 140, rent: 10, color: '#ec4899' },
  { index: 14, name: 'Virginia Ave', type: 'property', price: 160, rent: 12, color: '#ec4899' },
  { index: 15, name: 'Pennsylvania RR', type: 'property', price: 200, rent: 25, color: '#64748b' },
  { index: 16, name: 'St. James', type: 'property', price: 180, rent: 14, color: '#f97316' },
  { index: 17, name: 'Community Chest', type: 'chest' },
  { index: 18, name: 'Tennessee Ave', type: 'property', price: 180, rent: 14, color: '#f97316' },
  { index: 19, name: 'New York Ave', type: 'property', price: 200, rent: 16, color: '#f97316' },
  { index: 20, name: 'Free Parking', type: 'free' },
  { index: 21, name: 'Kentucky Ave', type: 'property', price: 220, rent: 18, color: '#ef4444' },
  { index: 22, name: 'Chance', type: 'chance' },
  { index: 23, name: 'Indiana Ave', type: 'property', price: 220, rent: 18, color: '#ef4444' },
  { index: 24, name: 'Illinois Ave', type: 'property', price: 240, rent: 20, color: '#ef4444' },
  { index: 25, name: 'B&O Railroad', type: 'property', price: 200, rent: 25, color: '#64748b' },
  { index: 26, name: 'Atlantic Ave', type: 'property', price: 260, rent: 22, color: '#eab308' },
  { index: 27, name: 'Ventnor Ave', type: 'property', price: 260, rent: 22, color: '#eab308' },
  { index: 28, name: 'Water Works', type: 'property', price: 150, rent: 12, color: '#eab308' },
  { index: 29, name: 'Marvin Gardens', type: 'property', price: 280, rent: 24, color: '#22c55e' },
  { index: 30, name: 'Go To Jail', type: 'gotojail' },
  { index: 31, name: 'Pacific Ave', type: 'property', price: 300, rent: 26, color: '#22c55e' },
  { index: 32, name: 'North Carolina', type: 'property', price: 300, rent: 26, color: '#22c55e' },
  { index: 33, name: 'Community Chest', type: 'chest' },
  { index: 34, name: 'Pennsylvania Ave', type: 'property', price: 320, rent: 28, color: '#22c55e' },
  { index: 35, name: 'Short Line', type: 'property', price: 200, rent: 25, color: '#64748b' },
  { index: 36, name: 'Chance', type: 'chance' },
  { index: 37, name: 'Park Place', type: 'property', price: 350, rent: 35, color: '#3b82f6' },
  { index: 38, name: 'Luxury Tax', type: 'tax' },
  { index: 39, name: 'Boardwalk', type: 'property', price: 400, rent: 50, color: '#3b82f6' },
];

const PLAYER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308'];

export function createMonopolyGame(playerCount: number): MonopolyState {
  const count = Math.min(4, Math.max(2, playerCount));
  const players: MonopolyPlayer[] = Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    name: `Παίκτης ${i + 1}`,
    color: PLAYER_COLORS[i],
    money: 1500,
    position: 0,
    inJail: false,
    jailTurns: 0,
    bankrupt: false,
  }));

  const properties: Record<number, MonopolyPropertyState> = {};
  BOARD.forEach((s) => {
    if (s.type === 'property') {
      properties[s.index] = { spaceIndex: s.index, ownerId: null, houses: 0, mortgaged: false };
    }
  });

  return {
    players,
    currentPlayerId: players[0].id,
    properties,
    turnNumber: 1,
    lastRoll: null,
    phase: 'roll',
    log: ['Το παιχνίδι ξεκίνησε. Ρίξτε τα ζάρια!'],
    winnerId: null,
  };
}

function activePlayers(state: MonopolyState) {
  return state.players.filter((p) => !p.bankrupt);
}

function nextPlayerId(state: MonopolyState): string {
  const active = activePlayers(state);
  const idx = active.findIndex((p) => p.id === state.currentPlayerId);
  return active[(idx + 1) % active.length].id;
}

function checkWinner(state: MonopolyState): string | null {
  const active = activePlayers(state);
  return active.length === 1 ? active[0].id : null;
}

export function rollDice(state: MonopolyState): MonopolyState {
  if (state.phase !== 'roll' || state.winnerId) return state;

  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const players = state.players.map((p) => ({ ...p }));
  const current = players.find((p) => p.id === state.currentPlayerId)!;
  let log = [...state.log, `${current.name} έριξε ${d1}+${d2}=${d1 + d2}`];

  if (current.inJail) {
    if (d1 === d2) {
      current.inJail = false;
      current.jailTurns = 0;
      log.push(`${current.name} ξέφυγε από τη φυλακή!`);
    } else {
      current.jailTurns += 1;
      if (current.jailTurns >= 3) {
        current.money -= 50;
        current.inJail = false;
        current.jailTurns = 0;
        log.push(`${current.name} πλήρωσε 50\$ και βγήκε από τη φυλακή.`);
      } else {
        return {
          ...state,
          players,
          lastRoll: [d1, d2],
          phase: 'end',
          log: [...log, 'Παραμένει στη φυλακή.'],
        };
      }
    }
  }

  const total = d1 + d2;
  let newPos = (current.position + total) % 40;
  if (current.position + total >= 40) {
    current.money += 200;
    log.push(`${current.name} πέρασε από GO (+200\$).`);
  }
  current.position = newPos;

  const space = BOARD[newPos];
  if (space.type === 'gotojail') {
    current.position = 10;
    current.inJail = true;
    current.jailTurns = 0;
    return { ...state, players, lastRoll: [d1, d2], phase: 'end', log: [...log, 'Πήγε στη φυλακή!'] };
  }

  if (space.type === 'tax') {
    const tax = newPos === 4 ? 200 : 100;
    current.money -= tax;
    log.push(`Φόρος -${tax}\$.`);
    return { ...state, players, lastRoll: [d1, d2], phase: 'end', log };
  }

  if (space.type === 'property') {
    const prop = state.properties[newPos];
    if (!prop?.ownerId) {
      return { ...state, players, lastRoll: [d1, d2], phase: 'buy', log };
    }
    if (prop.ownerId !== current.id && !prop.mortgaged) {
      const rent = (space.rent ?? 0) * (1 + prop.houses);
      const owner = players.find((p) => p.id === prop.ownerId)!;
      current.money -= rent;
      owner.money += rent;
      log.push(`${current.name} πλήρωσε ενοίκιο ${rent}\$ στον ${owner.name}.`);
      if (current.money < 0) {
        current.bankrupt = true;
        log.push(`${current.name} χρεωκόπησε!`);
      }
    }
  }

  const winnerId = checkWinner({ ...state, players });
  return {
    ...state,
    players,
    lastRoll: [d1, d2],
    phase: winnerId ? 'end' : 'end',
    log,
    winnerId,
  };
}

export function buyProperty(state: MonopolyState): MonopolyState {
  const current = state.players.find((p) => p.id === state.currentPlayerId)!;
  const space = BOARD[current.position];
  if (state.phase !== 'buy' || space.type !== 'property' || !space.price) return state;

  if (current.money < space.price) {
    return { ...state, phase: 'end', log: [...state.log, 'Δεν επαρκούν τα χρήματα για αγορά.'] };
  }

  const players = state.players.map((p) =>
    p.id === current.id ? { ...p, money: p.money - space.price! } : p
  );
  const properties = {
    ...state.properties,
    [current.position]: {
      ...state.properties[current.position],
      ownerId: current.id,
    },
  };

  return {
    ...state,
    players,
    properties,
    phase: 'end',
    log: [...state.log, `${current.name} αγόρασε ${space.name} για ${space.price}\$.`],
  };
}

export function declineBuy(state: MonopolyState): MonopolyState {
  if (state.phase !== 'buy') return state;
  return { ...state, phase: 'end', log: [...state.log, 'Πέρασε την αγορά.'] };
}

export function endTurn(state: MonopolyState): MonopolyState {
  if (state.phase !== 'end' && state.phase !== 'buy') return state;
  const winnerId = checkWinner(state);
  if (winnerId) {
    return { ...state, winnerId, log: [...state.log, `Νικητής: ${state.players.find((p) => p.id === winnerId)?.name}`] };
  }
  const nextId = nextPlayerId(state);
  return {
    ...state,
    currentPlayerId: nextId,
    turnNumber: state.turnNumber + 1,
    phase: 'roll',
    lastRoll: null,
    log: [...state.log, `Γύρος ${state.turnNumber + 1} — ${state.players.find((p) => p.id === nextId)?.name}`],
  };
}
