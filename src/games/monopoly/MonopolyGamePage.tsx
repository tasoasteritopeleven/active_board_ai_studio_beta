import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, DollarSign, Building2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { BoardGameTable } from '@/components/boardgame/BoardGameTable';
import { PhysicalDice } from '@/components/boardgame/PhysicalDice';
import { MonopolyBoardVisual } from './components/MonopolyBoardVisual';
import {
  buyProperty,
  createMonopolyGame,
  declineBuy,
  endTurn,
  rollDice,
  type MonopolyState,
} from './monopolyEngine';
import { BOARD } from './monopolyEngine';

export default function MonopolyGamePage() {
  const navigate = useNavigate();
  const [game, setGame] = useState<MonopolyState>(() => createMonopolyGame(4));
  const [rolling, setRolling] = useState(false);

  const current = game.players.find((p) => p.id === game.currentPlayerId)!;
  const space = BOARD[current.position];
  const owned = Object.values(game.properties).filter((p) => p.ownerId === current.id);

  const handleRoll = () => {
    setRolling(true);
    setGame((g) => rollDice(g));
    setTimeout(() => setRolling(false), 400);
  };

  const centerControls = (
    <div className="space-y-2 text-center">
      <p className="text-[9px] text-emerald-100/80 font-bold uppercase tracking-[0.2em]">
        {current.name}
      </p>
      {game.lastRoll ? (
        <PhysicalDice values={game.lastRoll} rolling={rolling} />
      ) : (
        <div className="h-12 flex items-center justify-center text-emerald-200/50 text-[10px] uppercase">
          Ρίξτε τα ζάρια
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        {game.phase === 'roll' && (
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-500 text-white font-black text-xs h-9 shadow-lg border-b-2 border-red-800"
            onClick={handleRoll}
          >
            ΡΙΞΕ ΖΑΡΙΑ
          </Button>
        )}
        {game.phase === 'buy' && space.price && (
          <>
            <Button size="sm" className="text-xs h-8 font-bold" onClick={() => setGame((g) => buyProperty(g))}>
              Αγορά ${space.price}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 border-emerald-200/30 text-emerald-50"
              onClick={() => setGame((g) => declineBuy(g))}
            >
              Πέρασμα
            </Button>
          </>
        )}
        {game.phase === 'end' && (
          <Button size="sm" variant="secondary" className="text-xs h-8" onClick={() => setGame((g) => endTurn(g))}>
            Τέλος γύρου
          </Button>
        )}
      </div>
      {game.winnerId && (
        <p className="text-amber-200 text-xs font-bold">
          Νικητής: {game.players.find((p) => p.id === game.winnerId)?.name}
        </p>
      )}
    </div>
  );

  return (
    <div className="h-[100dvh] flex flex-col bg-[#0c0a08] overflow-hidden">
      <header className="h-11 shrink-0 border-b border-amber-900/30 bg-[#1a1208]/95 flex items-center justify-between px-3 z-20">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-200/70" onClick={() => navigate('/games')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-xs font-bold text-amber-100 uppercase tracking-[0.25em]">Monopoly</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/40 text-emerald-100">
            <DollarSign className="h-3 w-3" />
            <span className="font-mono font-bold text-sm">${current.money}</span>
          </div>
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-200/70">
                  <Building2 className="h-4 w-4" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72 bg-[#1a1208] border-amber-900/30 text-amber-50">
              <h3 className="text-xs uppercase tracking-widest text-amber-500/80 font-bold mb-3">Χαρτοφυλάκιο</h3>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {owned.length === 0 && <p className="text-xs text-amber-200/50">Καμία ιδιοκτησία.</p>}
                {owned.map((p) => (
                  <div key={p.spaceIndex} className="p-2 rounded-lg bg-amber-950/30 border border-amber-800/20 text-xs">
                    <div className="h-1 rounded-full mb-1" style={{ backgroundColor: BOARD[p.spaceIndex].color }} />
                    {BOARD[p.spaceIndex].name}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-amber-900/30">
                <p className="text-[10px] uppercase text-amber-500/70 mb-2 flex items-center gap-1">
                  <History className="w-3 h-3" /> Αρχείο
                </p>
                <div className="text-[10px] text-amber-200/60 space-y-1 max-h-32 overflow-y-auto">
                  {game.log.slice(-8).map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <BoardGameTable className="flex-1">
        <div className="w-full h-full overflow-auto flex items-center justify-center py-4">
          <MonopolyBoardVisual game={game}>{centerControls}</MonopolyBoardVisual>
        </div>
      </BoardGameTable>

      <footer className="shrink-0 h-9 border-t border-amber-900/20 flex items-center justify-center gap-5 px-4 bg-[#1a1208]/90 z-20">
        {game.players
          .filter((p) => !p.bankrupt)
          .map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-1.5 text-[10px] ${p.id === game.currentPlayerId ? 'opacity-100' : 'opacity-45'}`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full border border-white/30 shadow-sm"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-amber-100/90">{p.name.split(' ')[0]}</span>
            </div>
          ))}
      </footer>
    </div>
  );
}
