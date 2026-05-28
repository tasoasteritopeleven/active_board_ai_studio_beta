import { useMemo, type CSSProperties } from 'react';
import { BoardGameTable } from '@/components/boardgame/BoardGameTable';
import { PhysicalDice } from '@/components/boardgame/PhysicalDice';
import { MONOPOLY_SPACES } from '../monopolyBoardData';

export interface MonopolyBoardState {
  position: number;
  playerColor: string;
  houses?: Record<number, number>;
}

interface MonopolyBoardVisualProps {
  state: MonopolyBoardState;
  onRoll?: (d1: number, d2: number) => void;
}

function spacePosition(index: number): CSSProperties {
  const side = Math.floor(index / 10);
  const onSide = index % 10;
  const pct = (onSide / 9) * 100;
  if (side === 0) return { bottom: '0', left: `${pct}%`, transform: 'translateX(-50%)' };
  if (side === 1) return { right: '0', top: `${pct}%`, transform: 'translateY(-50%)' };
  if (side === 2) return { top: '0', left: `${100 - pct}%`, transform: 'translateX(-50%)' };
  return { left: '0', top: `${100 - pct}%`, transform: 'translateY(-50%)' };
}

export function MonopolyBoardVisual({ state, onRoll }: MonopolyBoardVisualProps) {
  const pawnStyle = useMemo(() => spacePosition(state.position), [state.position]);

  return (
    <BoardGameTable>
      <div className="relative w-[min(92vw,640px)] aspect-square">
        <div
          className="absolute inset-0 rounded-sm boardgame-felt"
          style={{ margin: '3.5%' }}
        />
        <div
          className="absolute rounded-sm overflow-hidden"
          style={{ inset: '3.5%', boxShadow: 'inset 0 0 0 4px #1a1208' }}
        >
          {MONOPOLY_SPACES.map((space) => (
            <div
              key={space.index}
              className={`absolute boardgame-paper-tile flex flex-col items-center justify-end text-center ${
                space.isCorner ? 'w-[14%] h-[14%]' : 'w-[9%] h-[14%]'
              }`}
              style={spacePosition(space.index)}
            >
              {space.stripe && (
                <div
                  className="w-full h-[22%] shrink-0"
                  style={{ backgroundColor: space.stripe }}
                />
              )}
              <span className="text-[7px] sm:text-[8px] font-bold uppercase tracking-tight text-[#2a1810] px-0.5 pb-1 leading-tight">
                {space.label}
              </span>
              {(state.houses?.[space.index] ?? 0) > 0 && (
                <div className="absolute top-1 right-1 flex gap-px">
                  {Array.from({ length: state.houses![space.index] }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-[#22c55e] border border-[#14532d]" />
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="absolute inset-[14%] boardgame-felt rounded flex flex-col items-center justify-center gap-3">
            <p className="text-[#f5ecd8] font-black text-lg sm:text-2xl tracking-[0.2em] opacity-90">
              MONOPOLY
            </p>
            <PhysicalDice onRoll={onRoll} />
          </div>

          <div
            className="boardgame-pawn absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white z-20"
            style={{
              ...pawnStyle,
              backgroundColor: state.playerColor,
            }}
          />
        </div>
      </div>
    </BoardGameTable>
  );
}
