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
      bg: 'bg-[#e8dcc8] hover:bg-[#f2ead8]',
      border: 'border-amber-900/25',
      text: 'text-amber-950',
      shadow: 'shadow-[0_4px_0_#c4b59a,0_8px_16px_rgba(0,0,0,0.2)]',
    };
  }
  switch (card.type) {
    case 'red':
      return {
        bg: 'bg-gradient-to-br from-red-700 to-red-900',
        border: 'border-red-950',
        text: 'text-red-50',
        shadow: 'shadow-[0_4px_0_#7f1d1d]',
      };
    case 'blue':
      return {
        bg: 'bg-gradient-to-br from-blue-700 to-blue-900',
        border: 'border-blue-950',
        text: 'text-blue-50',
        shadow: 'shadow-[0_4px_0_#1e3a8a]',
      };
    case 'assassin':
      return {
        bg: 'bg-gradient-to-br from-zinc-900 to-black',
        border: 'border-black',
        text: 'text-zinc-400',
        shadow: 'shadow-[0_4px_0_#000]',
      };
    default:
      return {
        bg: 'bg-gradient-to-br from-amber-200 to-amber-400',
        border: 'border-amber-700',
        text: 'text-amber-950',
        shadow: 'shadow-[0_4px_0_#b45309]',
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
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Spymaster key strip */}
      {spymasterView && (
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          {[
            { label: 'Κόκκινη', color: 'bg-red-600' },
            { label: 'Μπλε', color: 'bg-blue-600' },
            { label: 'Ουδέτερη', color: 'bg-amber-400' },
            { label: 'Δολοφόνος', color: 'bg-black' },
          ].map((k) => (
            <span
              key={k.label}
              className={`text-[9px] uppercase tracking-wider px-2 py-1 rounded text-white font-bold ${k.color}`}
            >
              {k.label}
            </span>
          ))}
        </div>
      )}

      {/* Felt table */}
      <div
        className="rounded-2xl p-4 md:p-6 shadow-[0_24px_48px_rgba(0,0,0,0.5),inset_0_2px_8px_rgba(255,255,255,0.06)]"
        style={{
          background:
            'radial-gradient(ellipse at center, #1a5c3a 0%, #0f3d26 55%, #082818 100%)',
        }}
      >
        <div className="grid grid-cols-5 gap-2 md:gap-3">
          {cards.map((card, index) => {
            const face = cardFace(card, spymasterView);
            return (
              <button
                key={`${card.word}-${index}`}
                type="button"
                disabled={disabled || card.revealed}
                onClick={() => onCardClick(index)}
                className={`
                  relative aspect-[4/3] rounded-lg border-2 transition-all duration-200
                  ${face.bg} ${face.border} ${face.text} ${face.shadow}
                  ${!card.revealed && !disabled ? 'hover:-translate-y-0.5 active:translate-y-0.5' : ''}
                  ${card.revealed ? 'opacity-85 scale-[0.98]' : ''}
                  flex flex-col items-center justify-center p-2
                `}
              >
                <span className="text-xs sm:text-sm md:text-base font-black uppercase tracking-widest text-center leading-tight">
                  {card.word}
                </span>
                {card.revealed && (
                  <span className="absolute bottom-1.5 right-1.5">
                    {card.type === 'assassin' && <Skull className="w-4 h-4" />}
                    {card.type === 'red' && <CheckCircle2 className="w-4 h-4" />}
                    {card.type === 'blue' && <CheckCircle2 className="w-4 h-4" />}
                    {card.type === 'neutral' && <XCircle className="w-4 h-4 opacity-60" />}
                  </span>
                )}
                {!card.revealed && spymasterView && (
                  <span
                    className={`absolute top-1 left-1 w-2 h-2 rounded-full ${
                      card.type === 'red'
                        ? 'bg-red-500'
                        : card.type === 'blue'
                          ? 'bg-blue-500'
                          : card.type === 'assassin'
                            ? 'bg-black'
                            : 'bg-amber-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
