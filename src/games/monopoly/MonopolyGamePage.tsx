import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, DollarSign, Dice5, Building2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { TableSessionBar } from '@/components/session/TableSessionBar';
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

  const current = game.players.find((p) => p.id === game.currentPlayerId)!;
  const space = BOARD[current.position];
  const owned = Object.values(game.properties).filter((p) => p.ownerId === current.id);

  const centerControls = (
    <div className="space-y-2 text-center">
      <p className="text-[10px] text-emerald-100/90 font-bold uppercase tracking-wider truncate px-1">
        {current.name}
      </p>
      {game.lastRoll && (
        <p className="text-amber-200 font-mono text-sm font-bold">
          {game.lastRoll[0]} + {game.lastRoll[1]}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        {game.phase === 'roll' && (
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-500 text-white font-black text-xs h-9 shadow-lg"
            onClick={() => setGame((g) => rollDice(g))}
          >
            <Dice5 className="w-3 h-3 mr-1" />
            ΡΙΞΕ ΖΑΡΙΑ
          </Button>
        )}
        {game.phase === 'buy' && space.price && (
          <>
            <Button size="sm" className="text-xs h-8" onClick={() => setGame((g) => buyProperty(g))}>
              Αγορά ${space.price}
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-8 border-emerald-600/50" onClick={() => setGame((g) => declineBuy(g))}>
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
        <p className="text-amber-300 text-xs font-bold">
          Νικητής: {game.players.find((p) => p.id === game.winnerId)?.name}
        </p>
      )}
    </div>
  );

  return (
    <div className="h-[100dvh] flex flex-col bg-[#0c0a08] overflow-hidden">
      <header className="h-12 shrink-0 border-b border-amber-900/30 bg-[#1a1208]/90 backdrop-blur flex items-center justify-between px-3 z-20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-200/70" onClick={() => navigate('/games')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs font-bold text-amber-100 uppercase tracking-widest">Monopoly</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-700/30 text-emerald-200">
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
      </header>

      <div className="shrink-0 px-3 pt-2">
        <TableSessionBar gameTitle="Monopoly" playerCount={game.players.filter((p) => !p.bankrupt).length} />
      </div>

      <main className="flex-1 min-h-0 overflow-auto flex items-center justify-center bg-[radial-gradient(ellipse_at_center,#1a1510_0%,#0a0806_70%)]">
        <MonopolyBoardVisual game={game}>{centerControls}</MonopolyBoardVisual>
      </main>

      <footer className="shrink-0 h-10 border-t border-amber-900/20 flex items-center justify-center gap-4 px-4 bg-[#1a1208]/80">
        {game.players
          .filter((p) => !p.bankrupt)
          .map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-1.5 text-[10px] ${p.id === game.currentPlayerId ? 'opacity-100' : 'opacity-50'}`}
            >
              <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: p.color }} />
              <span className="text-amber-100/90">{p.name.split(' ')[0]}</span>
              <span className="font-mono text-emerald-400">${p.money}</span>
            </div>
          ))}
      </footer>
    </div>
  );
}
