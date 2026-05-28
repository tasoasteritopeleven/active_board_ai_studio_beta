import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dice5,
  ChevronLeft,
  DollarSign,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  const navigate = useNavigate();
  const [game, setGame] = useState<MonopolyState>(() => createMonopolyGame(4));

  const current = game.players.find((p) => p.id === game.currentPlayerId)!;
  const space = BOARD[current.position];
  const owned = Object.values(game.properties).filter((p) => p.ownerId === current.id);

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden text-white">
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-400" onClick={() => navigate('/games')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest">Monopoly Classic</h1>
            <p className="text-[10px] text-slate-500 font-mono">TableForge Engine v1</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500">
          <DollarSign className="h-4 w-4" />
          <span className="font-mono font-bold">${current.money}</span>
        </div>
        <Badge className="bg-primary/20 text-primary border-primary/20 uppercase text-[10px]">
          {game.phase === 'roll' ? 'Ρίψη' : game.phase === 'buy' ? 'Αγορά' : 'Τέλος'}
        </Badge>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800 relative min-h-[280px]">
          <div className="text-center space-y-4 p-6">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto">
              <Dice5 className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold">{space.name}</h2>
            <p className="text-slate-400 text-sm">
              Θέση {current.position}/39 • Γύρος {game.turnNumber}
            </p>
            {game.lastRoll && (
              <p className="text-primary font-mono text-lg">
                Ζάρια: {game.lastRoll[0]} + {game.lastRoll[1]} = {game.lastRoll[0] + game.lastRoll[1]}
              </p>
            )}
            <div className="flex flex-wrap gap-2 justify-center">
              {game.phase === 'roll' && (
                <Button
                  className="bg-primary text-white font-bold"
                  onClick={() => setGame((g) => rollDice(g))}
                >
                  ΡΙΞΤΕ ΤΑ ΖΑΡΙΑ
                </Button>
              )}
              {game.phase === 'buy' && space.price && (
                <>
                  <Button onClick={() => setGame((g) => buyProperty(g))}>
                    Αγορά ${space.price}
                  </Button>
                  <Button variant="outline" onClick={() => setGame((g) => declineBuy(g))}>
                    Πέρασμα
                  </Button>
                </>
              )}
              {game.phase === 'end' && (
                <Button variant="secondary" onClick={() => setGame((g) => endTurn(g))}>
                  Τέλος Γύρου
                </Button>
              )}
            </div>
            {game.winnerId && (
              <p className="text-primary font-bold text-lg">
                Νικητής: {game.players.find((p) => p.id === game.winnerId)?.name}
              </p>
            )}
          </div>
        </div>

        <div className="w-full lg:w-80 space-y-4 overflow-y-auto">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-slate-500 uppercase">Παίκτες</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {game.players.map((p) => (
                <div
                  key={p.id}
                  className={`flex justify-between text-sm p-2 rounded-lg ${p.id === game.currentPlayerId ? 'bg-primary/10 border border-primary/30' : 'bg-slate-950'}`}
                >
                  <span style={{ color: p.color }}>{p.name}</span>
                  <span className="font-mono">${p.money}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-slate-500 uppercase flex items-center gap-2">
                <Building2 className="h-3 w-3" /> Ιδιοκτησίες
              </CardTitle>
            </CardHeader>
            <CardContent className="text-[10px] text-slate-400 space-y-1 max-h-32 overflow-y-auto">
              {owned.length === 0 && <p>Καμία ακίνητη περιουσία ακόμα.</p>}
              {owned.map((p) => (
                <div key={p.spaceIndex}>{BOARD[p.spaceIndex].name}</div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-slate-500 uppercase">Αρχείο</CardTitle>
            </CardHeader>
            <CardContent className="text-[10px] text-slate-400 space-y-1 max-h-40 overflow-y-auto">
              {game.log.slice(-8).map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
