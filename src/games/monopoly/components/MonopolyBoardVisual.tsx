import type { ReactNode } from 'react';
import type { MonopolyPlayer, MonopolySpace, MonopolyState } from '../monopolyEngine';
import { BOARD } from '../monopolyEngine';

const CORNER = 76;
const EDGE_W = 54;
const EDGE_H = 76;

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

function SpaceCell({
  space,
  owner,
  isCurrent,
  playerColor,
}: {
  space: MonopolySpace;
  owner?: MonopolyPlayer;
  isCurrent: boolean;
  playerColor?: string;
}) {
  const isCorner = ['go', 'jail', 'free', 'gotojail'].includes(space.type);
  const colorBar = space.color && space.type === 'property';
  const vertical =
    !isCorner && ((space.index >= 11 && space.index <= 19) || (space.index >= 31 && space.index <= 39));

  return (
    <div
      className={`relative border border-amber-950/40 bg-[#f5e6c8] text-amber-950 overflow-hidden shadow-inner ${
        isCurrent ? 'ring-2 ring-amber-500 z-10' : ''
      }`}
    >
      {colorBar && (
        <div className="absolute top-0 left-0 right-0 h-[20%] min-h-[8px]" style={{ backgroundColor: space.color }} />
      )}
      <div
        className={`flex flex-col items-center justify-center h-full p-0.5 ${colorBar ? 'pt-[22%]' : ''}`}
      >
        <span
          className={`font-bold uppercase text-center leading-tight ${
            isCorner ? 'text-[7px] sm:text-[8px]' : 'text-[5px] sm:text-[6px]'
          }`}
          style={
            vertical
              ? { writingMode: 'vertical-rl', transform: space.index <= 19 ? 'rotate(180deg)' : undefined }
              : undefined
          }
        >
          {space.name}
        </span>
        {space.price && <span className="text-[5px] font-mono opacity-70">${space.price}</span>}
      </div>
      {owner && (
        <div
          className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-amber-900/40"
          style={{ backgroundColor: owner.color }}
        />
      )}
      {isCurrent && playerColor && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md z-20"
          style={{ backgroundColor: playerColor }}
        />
      )}
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
    <div className="relative flex items-center justify-center p-2 md:p-6 min-h-0">
      <div
        className="relative rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
        style={{
          width: BOARD_W + 20,
          height: BOARD_H + 20,
          background: 'linear-gradient(145deg, #4a3520, #1a1208)',
          padding: 10,
        }}
      >
        <div
          className="relative bg-[#1a6b38] rounded-sm"
          style={{ width: BOARD_W, height: BOARD_H }}
        >
          {BOARD.map((space) => {
            const pos = spaceAt(space.index);
            const prop = game.properties[space.index];
            const owner = prop?.ownerId
              ? game.players.find((p) => p.id === prop.ownerId)
              : undefined;
            const playersHere = game.players.filter((p) => !p.bankrupt && p.position === space.index);

            return (
              <div
                key={space.index}
                className="absolute"
                style={{ left: pos.left, top: pos.top, width: pos.w, height: pos.h }}
              >
                <SpaceCell
                  space={space}
                  owner={owner}
                  isCurrent={current?.position === space.index}
                  playerColor={playersHere[0]?.color ?? current?.color}
                />
              </div>
            );
          })}

          <div
            className="absolute flex flex-col items-center justify-center"
            style={{
              left: CORNER,
              top: CORNER,
              width: EDGE_W * 9,
              height: EDGE_W * 9,
              background: 'linear-gradient(135deg, #0d4d2a, #1a6b38 50%, #0d4d2a)',
            }}
          >
            <h2
              className="text-xl md:text-3xl font-black text-red-600 drop-shadow-[1px_1px_0_#fff]"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              MONOPOLY
            </h2>
            <p className="text-[9px] text-emerald-100/70 uppercase tracking-[0.3em]">TableForge</p>
            <div className="mt-3 w-full px-3">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
