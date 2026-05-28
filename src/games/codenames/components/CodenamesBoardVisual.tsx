import { BoardGameTable } from '@/components/boardgame/BoardGameTable';

export type CodenamesCard = {
  text: string;
  type: 'red' | 'blue' | 'neutral' | 'assassin';
  revealed: boolean;
};

export interface CodenamesBoardState {
  words: CodenamesCard[];
  isSpymaster: boolean;
}

interface CodenamesBoardVisualProps {
  state: CodenamesBoardState;
  onCardClick?: (index: number) => void;
}

function cardFace(card: CodenamesCard, isSpymaster: boolean) {
  if (!card.revealed && !isSpymaster) {
    return 'boardgame-card-stock text-[#1a1a1a] hover:-translate-y-0.5 transition-transform';
  }
  const map = {
    red: 'bg-red-900/80 border-red-500 text-red-100',
    blue: 'bg-blue-900/80 border-blue-500 text-blue-100',
    neutral: 'bg-stone-600/80 border-stone-400 text-stone-100',
    assassin: 'bg-black border-stone-700 text-stone-400',
  };
  return `${map[card.type]} border-2`;
}

export function CodenamesBoardVisual({ state, onCardClick }: CodenamesBoardVisualProps) {
  return (
    <BoardGameTable>
      <div className="relative w-[min(95vw,720px)] p-4 sm:p-6">
        <div className="boardgame-felt rounded-lg p-4 sm:p-6 shadow-2xl">
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {state.words.map((card, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onCardClick?.(i)}
                disabled={card.revealed}
                className={`h-16 sm:h-24 rounded-md flex items-center justify-center font-bold text-[10px] sm:text-sm tracking-widest uppercase ${cardFace(card, state.isSpymaster)}`}
              >
                {card.text}
              </button>
            ))}
          </div>
          {state.isSpymaster && (
            <div className="mt-4 flex justify-center gap-3 text-[10px] uppercase tracking-widest text-[#c9e4d4]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" /> Red
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Blue
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-stone-400" /> Neutral
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-black border border-stone-600" /> Assassin
              </span>
            </div>
          )}
        </div>
      </div>
    </BoardGameTable>
  );
}
