import { CheckCircle2, Skull, XCircle } from 'lucide-react';
import type { CodenamesCard } from '../codenamesEngine';

interface CodenamesBoardVisualProps {
  cards: CodenamesCard[];
  spymasterView: boolean;
  activeTeam: 'red' | 'blue';
  onCardClick: (index: number) => void;
  disabled?: boolean;
}

function cardFace(card: CodenamesCard, spymasterView: boolean) {
  if (!card.revealed && !spymasterView) {
    return {
      surface: 'card-stock text-amber-950 border-amber-900/20',
      ink: 'text-amber-950',
    };
  }
  switch (card.type) {
    case 'red':
      return { surface: 'bg-gradient-to-br from-red-600 to-red-900 border-red-950 text-red-50', ink: '' };
    case 'blue':
      return { surface: 'bg-gradient-to-br from-blue-600 to-blue-900 border-blue-950 text-blue-50', ink: '' };
    case 'assassin':
      return { surface: 'bg-gradient-to-br from-zinc-800 to-black border-black text-zinc-300', ink: '' };
    default:
      return {
        surface: 'bg-gradient-to-br from-amber-100 to-amber-300 border-amber-600 text-amber-950',
        ink: '',
      };
  }
}

export function CodenamesBoardVisual({
  cards,
  spymasterView,
  onCardClick,
  disabled,
}: CodenamesBoardVisualProps) {
  return (
    <div className="relative w-full max-w-3xl mx-auto px-2">
      {spymasterView && (
        <div className="mb-3 flex justify-center">
          <div className="inline-flex rounded-lg border-2 border-amber-900/40 bg-board-paper px-3 py-2 shadow-lg board-fold-shadow gap-3 text-[9px] font-bold uppercase tracking-wider text-amber-950">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> Κόκκινη
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Μμπλε
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Ουδέτερη
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-black" /> Δολοφόνος
            </span>
          </div>
        </div>
      )}

      <div className="rounded-2xl p-3 md:p-5 bg-felt-green border-4 border-emerald-950/50 shadow-[0_20px_50px_rgba(0,0,0,0.55),inset_0_2px_12px_rgba(255,255,255,0.06)]">
        <div className="rounded-xl p-2 md:p-3 bg-emerald-950/20 border border-emerald-900/30">
          <div className="grid grid-cols-5 gap-2 md:gap-2.5">
            {cards.map((card, index) => {
              const face = cardFace(card, spymasterView);
              const hidden = !card.revealed && !spymasterView;
              const rotation = hidden ? (index % 2 === 0 ? -0.8 : 0.8) : 0;

              return (
                <button
                  key={`${card.word}-${index}`}
                  type="button"
                  disabled={disabled || card.revealed}
                  onClick={() => onCardClick(index)}
                  style={{ transform: `rotate(${rotation}deg)` }}
                  className={`
                    relative aspect-[5/4] rounded-lg border-2 overflow-hidden
                    transition-all duration-200
                    ${face.surface} ${face.ink}
                    ${hidden && !disabled ? 'hover:-translate-y-1 hover:rotate-0 hover:shadow-xl active:translate-y-0.5' : ''}
                    ${card.revealed ? 'card-revealed-animate opacity-95 scale-[0.98]' : ''}
                    flex flex-col items-center justify-center p-1.5 md:p-2
                  `}
                >
                  <span className="relative z-10 text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.12em] text-center leading-tight">
                    {card.word}
                  </span>

                  {card.revealed && (
                    <span className="absolute bottom-1 right-1 z-10 opacity-90">
                      {card.type === 'assassin' && <Skull className="w-3.5 h-3.5" />}
                      {card.type === 'red' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {card.type === 'blue' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {card.type === 'neutral' && <XCircle className="w-3.5 h-3.5 opacity-70" />}
                    </span>
                  )}

                  {!card.revealed && spymasterView && (
                    <span
                      className={`absolute top-1.5 left-1.5 z-10 w-2.5 h-2.5 rounded-full border border-black/20 shadow-sm ${
                        card.type === 'red'
                          ? 'bg-red-600'
                          : card.type === 'blue'
                            ? 'bg-blue-600'
                            : card.type === 'assassin'
                              ? 'bg-black'
                              : 'bg-amber-400'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-center text-[9px] text-emerald-200/40 uppercase tracking-[0.35em] mt-3">
        25 χαρτίνες λέξεων · Codenames
      </p>
    </div>
  );
}
