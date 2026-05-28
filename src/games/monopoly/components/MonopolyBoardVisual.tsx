import type { ReactNode } from 'react';
import type { MonopolyPlayer, MonopolySpace, MonopolyState } from '../monopolyEngine';
import { BOARD } from '../monopolyEngine';

const CORNER = 84;
const EDGE_W = 58;
const EDGE_H = 84;

export const BOARD_W = CORNER * 2 + EDGE_W * 9;
export const BOARD_H = BOARD_W;

function spaceAt(index: number): { left: number; top: number; w: number; h: number } {
  if (index === 0) return { left: 0, top: BOARD_H - CORNER, w: CORNER, h: CORNER };
  if (index >= 1 && index <= 9) {
    return { left: CORNER + (index - 1) * EDGE_W, top: BOARD_H - CORNER, w: EDGE_W, h: CORNER };
  }
  if (index === 10) return { left: CORNER + 9 * EDGE_W, top: BOARD_H - CORNER, w: CORNER, h: CORNER };
  if (index >= 11 && index <= 19) {
    const k = index - 11;
    return { left: BOARD_W - CORNER, top: BOARD_H - CORNER - (k + 1) * EDGE_W, w: CORNER, h: EDGE_W };
  }
  if (index === 20) return { left: BOARD_W - CORNER, top: 0, w: CORNER, h: CORNER };
  if (index >= 21 && index <= 29) {
    const k = index - 21;
    return { left: BOARD_W - CORNER - (k + 1) * EDGE_W, top: 0, w: EDGE_W, h: CORNER };
  }
  if (index === 30) return { left: 0, top: 0, w: CORNER, h: CORNER };
  if (index >= 31 && index <= 39) {
    const k = index - 31;
    return { left: 0, top: CORNER + k * EDGE_W, w: CORNER, h: EDGE_W };
  }
  return { left: 0, top: 0, w: CORNER, h: CORNER };
}

function CornerArt({ space }: { space: MonopolySpace }) {
  if (space.type === 'go') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-1 text-center">
        <span className="text-[9px] font-black text-red-700 tracking-tighter">GO</span>
        <span className="text-lg leading-none">→</span>
        <span className="text-[6px] font-bold text-amber-900/80">COLLECT $200</span>
      </div>
    );
  }
  if (space.type === 'jail') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-0.5">
        <span className="text-[7px] font-black uppercase text-amber-950">Jail</span>
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-1 h-5 bg-amber-950/60 rounded-sm" />
          ))}
        </div>
        <span className="text-[5px] text-amber-900/70">Just Visiting</span>
      </div>
    );
  }
  if (space.type === 'free') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-1">
        <span className="text-[7px] font-black text-emerald-800 uppercase leading-tight">Free</span>
        <span className="text-[7px] font-black text-emerald-800 uppercase leading-tight">Parking</span>
        <span className="text-xl mt-0.5">🅿️</span>
      </div>
    );
  }
  if (space.type === 'gotojail') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-1">
        <span className="text-[6px] font-black text-red-900 uppercase leading-tight">Go To</span>
        <span className="text-[7px] font-black text-red-900 uppercase">Jail</span>
        <span className="text-base">👮</span>
      </div>
    );
  }
  return null;
}

function MonopolyPawn({ color }: { color: string }) {
  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[70%] z-30 pointer-events-none"
      style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.4))' }}
    >
      <div
        className="w-3 h-3 rounded-full border-2 border-white/90"
        style={{ backgroundColor: color }}
      />
      <div
        className="w-0 h-0 mx-auto border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent"
        style={{ borderTopColor: color }}
      />
    </div>
  );
}

function SpaceCell({
  space,
  owner,
  houses,
  isCurrent,
  playerColor,
}: {
  space: MonopolySpace;
  owner?: MonopolyPlayer;
  houses?: number;
  isCurrent: boolean;
  playerColor?: string;
}) {
  const isCorner = ['go', 'jail', 'free', 'gotojail'].includes(space.type);
  const colorBar = space.color && space.type === 'property';
  const vertical =
    !isCorner && ((space.index >= 11 && space.index <= 19) || (space.index >= 31 && space.index <= 39));

  if (isCorner) {
    return (
      <div
        className={`relative h-full bg-board-paper border border-amber-950/50 board-fold-shadow overflow-hidden ${
          isCurrent ? 'ring-2 ring-amber-500 z-20' : ''
        }`}
      >
        <CornerArt space={space} />
        {isCurrent && playerColor && <MonopolyPawn color={playerColor} />}
      </div>
    );
  }

  return (
    <div
      className={`relative h-full bg-board-paper border border-amber-950/35 overflow-hidden board-fold-shadow ${
        isCurrent ? 'ring-2 ring-amber-500 z-20' : ''
      }`}
    >
      {colorBar && (
        <div
          className="absolute top-0 left-0 right-0 h-[24%] min-h-[10px] border-b border-black/10"
          style={{ backgroundColor: space.color }}
        />
      )}
      <div className={`flex flex-col items-center justify-center h-full px-0.5 ${colorBar ? 'pt-[26%]' : ''}`}>
        <span
          className="font-bold uppercase text-center leading-[1.1] text-[5px] sm:text-[6px] text-amber-950"
          style={
            vertical
              ? { writingMode: 'vertical-rl', transform: space.index <= 19 ? 'rotate(180deg)' : undefined }
              : undefined
          }
        >
          {space.name}
        </span>
        {space.price != null && (
          <span className="text-[5px] font-mono text-amber-900/75 mt-0.5">${space.price}</span>
        )}
      </div>
      {houses != null && houses > 0 && (
        <div className="absolute bottom-0.5 left-0.5 right-0.5 flex justify-center gap-px">
          {Array.from({ length: Math.min(4, houses) }).map((_, i) => (
            <div key={i} className="w-1.5 h-2 bg-emerald-700 rounded-sm border border-emerald-900/40" />
          ))}
        </div>
      )}
      {owner && !houses && (
        <div
          className="absolute bottom-1 right-1 w-2 h-2 rounded-sm border border-amber-950/30"
          style={{ backgroundColor: owner.color }}
        />
      )}
      {isCurrent && playerColor && <MonopolyPawn color={playerColor} />}
    </div>
  );
}

interface MonopolyBoardVisualProps {
  game: MonopolyState;
  children?: ReactNode;
}

export function MonopolyBoardVisual({ game, children }: MonopolyBoardVisualProps) {
  const current = game.players.find((p) => p.id === game.currentPlayerId);

  return (
    <div className="relative flex items-center justify-center p-3 md:p-8 select-none">
      {/* Wood rail + folded board */}
      <div
        className="relative rounded-lg p-3 md:p-4 risk-table-frame"
        style={{
          background: 'linear-gradient(160deg, #5c4028 0%, #2a1c10 40%, #3d2918 100%)',
        }}
      >
        <div
          className="relative rounded-sm overflow-hidden border-2 border-amber-950/60 board-fold-shadow"
          style={{ width: BOARD_W, height: BOARD_H }}
        >
          <div className="absolute inset-0 bg-monopoly-green" />
          {BOARD.map((space) => {
            const pos = spaceAt(space.index);
            const prop = game.properties[space.index];
            const owner = prop?.ownerId
              ? game.players.find((p) => p.id === prop.ownerId)
              : undefined;

            return (
              <div
                key={space.index}
                className="absolute"
                style={{ left: pos.left, top: pos.top, width: pos.w, height: pos.h }}
              >
                <SpaceCell
                  space={space}
                  owner={owner}
                  houses={prop?.houses}
                  isCurrent={current?.position === space.index}
                  playerColor={
                    game.players.find((p) => p.position === space.index && !p.bankrupt)?.color ??
                    current?.color
                  }
                />
              </div>
            );
          })}

          <div
            className="absolute flex flex-col items-center justify-center border-4 border-amber-950/20"
            style={{
              left: CORNER,
              top: CORNER,
              width: EDGE_W * 9,
              height: EDGE_W * 9,
            }}
          >
            <div className="absolute inset-0 bg-monopoly-green opacity-95" />
            <div className="absolute inset-3 border border-emerald-900/30 rounded-sm pointer-events-none" />
            <h2
              className="relative z-10 text-2xl md:text-4xl font-black text-center leading-none"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: '#dc2626',
                textShadow: '2px 2px 0 #fff, 3px 3px 0 rgba(0,0,0,0.2)',
                letterSpacing: '0.02em',
              }}
            >
              MONOPOLY
            </h2>
            <div className="relative z-10 mt-3 w-full max-w-[240px] px-2">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
