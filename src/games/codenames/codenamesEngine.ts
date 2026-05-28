export type CardType = 'red' | 'blue' | 'neutral' | 'assassin';

export interface CodenamesCard {
  word: string;
  type: CardType;
  revealed: boolean;
}

export interface CodenamesState {
  cards: CodenamesCard[];
  redRemaining: number;
  blueRemaining: number;
  startingTeam: 'red' | 'blue';
  activeTeam: 'red' | 'blue';
  phase: 'clue' | 'guess';
  currentClue: { word: string; count: number } | null;
  guessesLeft: number;
  spymasterView: boolean;
  winner: 'red' | 'blue' | null;
  log: string[];
}

const WORD_BANK = [
  'APPLE', 'SPACE', 'DOG', 'BOMB', 'WATER', 'FIRE', 'ROBOT', 'GREEN', 'PIZZA', 'MOON',
  'STAR', 'COLD', 'WAR', 'PEACE', 'LIFE', 'DEATH', 'KING', 'QUEEN', 'JACK', 'ACE',
  'CLUB', 'HEART', 'SPADE', 'DIAMOND', 'GOLD', 'SILVER', 'IRON', 'WOOD', 'STONE', 'RIVER',
  'OCEAN', 'DESERT', 'FOREST', 'MOUNTAIN', 'CASTLE', 'KNIGHT', 'DRAGON', 'MAGIC', 'BOOK', 'PEN',
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createCodenamesGame(): CodenamesState {
  const startingTeam: 'red' | 'blue' = Math.random() > 0.5 ? 'red' : 'blue';
  const words = shuffle(WORD_BANK).slice(0, 25);
  const types: CardType[] = [
    ...Array(9).fill(startingTeam),
    ...Array(8).fill(startingTeam === 'red' ? 'blue' : 'red'),
    ...Array(7).fill('neutral'),
    'assassin',
  ];
  const shuffledTypes = shuffle(types) as CardType[];

  const cards: CodenamesCard[] = words.map((word, i) => ({
    word,
    type: shuffledTypes[i],
    revealed: false,
  }));

  const redRemaining = cards.filter((c) => c.type === 'red' && !c.revealed).length;
  const blueRemaining = cards.filter((c) => c.type === 'blue' && !c.revealed).length;

  return {
    cards,
    redRemaining,
    blueRemaining,
    startingTeam,
    activeTeam: startingTeam,
    phase: 'clue',
    currentClue: null,
    guessesLeft: 0,
    spymasterView: false,
    winner: null,
    log: [`Η ${startingTeam === 'red' ? 'Κόκκινη' : 'Μπλε'} ομάδα ξεκινάει.`],
  };
}

export function toggleSpymasterView(state: CodenamesState): CodenamesState {
  return { ...state, spymasterView: !state.spymasterView };
}

export function giveClue(state: CodenamesState, word: string, count: number): CodenamesState {
  if (state.phase !== 'clue' || state.winner) return state;
  const clue = word.trim().toUpperCase();
  if (!clue || count < 1) return state;
  return {
    ...state,
    phase: 'guess',
    currentClue: { word: clue, count },
    guessesLeft: count + 1,
    log: [...state.log, `${state.activeTeam.toUpperCase()} spymaster: "${clue}" / ${count}`],
  };
}

function teamRemaining(cards: CodenamesCard[], team: CardType) {
  return cards.filter((c) => c.type === team && !c.revealed).length;
}

export function guessCard(state: CodenamesState, index: number): CodenamesState {
  if (state.phase !== 'guess' || state.winner) return state;
  const card = state.cards[index];
  if (!card || card.revealed) return state;

  const cards = state.cards.map((c, i) => (i === index ? { ...c, revealed: true } : c));
  let winner: 'red' | 'blue' | null = null;
  let activeTeam = state.activeTeam;
  let phase: CodenamesState['phase'] = 'guess';
  let guessesLeft = state.guessesLeft - 1;
  const log = [...state.log, `Μάντεψε: ${card.word} → ${card.type}`];

  if (card.type === 'assassin') {
    winner = state.activeTeam === 'red' ? 'blue' : 'red';
    return {
      ...state,
      cards,
      winner,
      redRemaining: teamRemaining(cards, 'red'),
      blueRemaining: teamRemaining(cards, 'blue'),
      log: [...log, 'Ασσασίνος! Η αντίπαλη ομάδα κερδίζει.'],
    };
  }

  if (card.type === state.activeTeam) {
    const redRemaining = teamRemaining(cards, 'red');
    const blueRemaining = teamRemaining(cards, 'blue');
    if (redRemaining === 0) winner = 'red';
    if (blueRemaining === 0) winner = 'blue';
    if (winner) {
      return { ...state, cards, winner, redRemaining, blueRemaining, log: [...log, `Νίκη της ${winner}!`] };
    }
    if (guessesLeft <= 0) {
      activeTeam = state.activeTeam === 'red' ? 'blue' : 'red';
      phase = 'clue';
      guessesLeft = 0;
      return {
        ...state,
        cards,
        activeTeam,
        phase,
        currentClue: null,
        guessesLeft,
        redRemaining,
        blueRemaining,
        log: [...log, 'Τέλος γύρου μάντεψης.'],
      };
    }
    return {
      ...state,
      cards,
      guessesLeft,
      redRemaining: teamRemaining(cards, 'red'),
      blueRemaining: teamRemaining(cards, 'blue'),
      log,
    };
  }

  activeTeam = state.activeTeam === 'red' ? 'blue' : 'red';
  phase = 'clue';
  return {
    ...state,
    cards,
    activeTeam,
    phase,
    currentClue: null,
    guessesLeft: 0,
    redRemaining: teamRemaining(cards, 'red'),
    blueRemaining: teamRemaining(cards, 'blue'),
    log: [...log, 'Λάθος χρώμα — αλλαγή σειράς.'],
  };
}

export function endGuessing(state: CodenamesState): CodenamesState {
  if (state.phase !== 'guess') return state;
  const activeTeam = state.activeTeam === 'red' ? 'blue' : 'red';
  return {
    ...state,
    activeTeam,
    phase: 'clue',
    currentClue: null,
    guessesLeft: 0,
    log: [...state.log, 'Η ομάδα πέρασε.'],
  };
}
