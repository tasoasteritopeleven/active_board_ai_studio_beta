import { useMemo, useState } from 'react';
import { DollarSign, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhysicalTableLayout } from '@/components/boardgame/PhysicalTableLayout';
import { BoardGameViewport } from '@/components/boardgame/BoardGameViewport';
import { MonopolyBoardVisual } from './components/MonopolyBoardVisual';
import MonopolyBoard3D from './MonopolyBoard3D';
import {
  BOARD,
  buyProperty,
  createMonopolyGame,
  declineBuy,
  endTurn,
  rollDice,
  type MonopolyState,
} from './monopolyEngine';

export default function MonopolyGamePage() {
  const [game, setGame] = useState<MonopolyState>(() => createMonopolyGame(4));

  const current = game.players.find((p) => p.id === game.currentPlayerId)!;
  const space = BOARD[current.position];
  const owned = Object.values(game.properties).filter((p) => p.ownerId === current.id);

  const boardState = useMemo(() => {
    const houses: Record<number, number> = {};
    Object.values(game.properties).forEach((p) => {
      if (p.houses > 0) houses[p.spaceIndex] = p.houses;
    });
    return {
      position: current.position,
      playerColor: current.color,
      houses,
    };
  }, [game.properties, current.position, current.color]);

  const visual2D = (
    <MonopolyBoardVisual
      state={boardState}
      onRoll={() => setGame((g) => rollDice(g))}
    />
  );

  return (
    <PhysicalTableLayout
      title="Monopoly"
      subtitle="TableForge · 40-space classic board"
      headerRight={
        <>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm font-mono font-bold">
            <DollarSign className="h-3.5 w-3.5" />
            ${current.money}
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/20 uppercase text-[9px]">
            {game.phase === 'roll' ? 'Ρίψη' : game.phase === 'buy' ? 'Αγορά' : 'Τέλος'}
          </Badge>
        </>
      }
      board={
        <BoardGameViewport
          game="monopoly"
          state={boardState}
          className="absolute inset-0"
          render3D={<MonopolyBoard3D gameState={game} />}
          render2D={visual2D}
        />
      }
      actionDock={
        <div className="space-y-2 text-center">
          {game.lastRoll && (
            <p className="text-primary font-mono text-sm font-bold">
              🎲 {game.lastRoll[0]} + {game.lastRoll[1]} = {game.lastRoll[0] + game.lastRoll[1]}
            </p>
          )}
          <h2 className="text-lg font-black uppercase tracking-tight">{space.name}</h2>
          <p className="text-[10px] text-slate-400 font-mono">
            Θέση {current.position}/39 · Γύρος {game.turnNumber}
          </p>
          <div className="flex flex-wrap gap-2 justify-center pt-1">
            {game.phase === 'roll' && (
              <Button
                className="bg-primary hover:bg-primary/90 font-bold uppercase tracking-widest"
                onClick={() => setGame((g) => rollDice(g))}
              >
                Ρίξτε τα ζάρια
              </Button>
            )}
            {game.phase === 'buy' && space.price && (
              <>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-500 font-bold"
                  onClick={() => setGame((g) => buyProperty(g))}
                >
                  Αγορά ${space.price}
                </Button>
                <Button variant="outline" onClick={() => setGame((g) => declineBuy(g))}>
                  Πέρασμα
                </Button>
              </>
            )}
            {game.phase === 'end' && (
              <Button variant="secondary" className="font-bold uppercase" onClick={() => setGame((g) => endTurn(g))}>
                Τέλος γύρου
              </Button>
            )}
          </div>
        </div>
      }
      sidebar={
        <div className="p-4 space-y-4">
          <Card className="bg-slate-950/80 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-slate-500 uppercase">Παίκτες</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {game.players.map((p) => (
                <div
                  key={p.id}
                  className={`flex justify-between text-sm p-2 rounded-lg ${
                    p.id === game.currentPlayerId
                      ? 'bg-primary/10 border border-primary/30'
                      : 'bg-slate-900'
                  }`}
                >
                  <span style={{ color: p.color }}>{p.name}</span>
                  <span className="font-mono">${p.money}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-slate-950/80 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-slate-500 uppercase flex items-center gap-2">
                <Building2 className="h-3 w-3" /> Ιδιοκτησίες
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[10px] text-slate-400 space-y-1 max-h-28 overflow-y-auto">
              {owned.length === 0 && <p>Καμία ακίνητη περιουσία.</p>}
              {owned.map((p) => (
                <div key={p.spaceIndex}>
                  {BOARD[p.spaceIndex].name}
                  {p.houses > 0 ? ` (${p.houses}🏠)` : ''}
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-slate-950/80 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-slate-500 uppercase">Αρχείο</CardTitle>
            </CardHeader>
            <CardContent className="text-[10px] text-slate-400 space-y-1 max-h-36 overflow-y-auto">
              {game.log.slice(-10).map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
