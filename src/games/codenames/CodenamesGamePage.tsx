import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  History,
  Timer,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { TableSessionBar } from '@/components/session/TableSessionBar';
import { CodenamesBoardVisual } from './components/CodenamesBoardVisual';
import {
  createCodenamesGame,
  endGuessing,
  giveClue,
  guessCard,
  toggleSpymasterView,
  type CodenamesState,
} from './codenamesEngine';
import { requestCodenamesHint } from '@/lib/ai/client';

export default function CodenamesGamePage() {
  const navigate = useNavigate();
  const [game, setGame] = useState<CodenamesState>(() => createCodenamesGame());
  const [clueWord, setClueWord] = useState('');
  const [clueCount, setClueCount] = useState(2);
  const [aiLoading, setAiLoading] = useState(false);

  const teamWords = game.cards
    .filter((c) => !c.revealed && c.type === game.activeTeam)
    .map((c) => c.word);

  const handleAiHint = async () => {
    setAiLoading(true);
    try {
      const hint = await requestCodenamesHint({ words: teamWords, team: game.activeTeam });
      setClueWord(hint.clue);
      setClueCount(hint.count);
      toast.success(`AI: ${hint.clue} / ${hint.count}`);
    } catch {
      toast.error('Ο server AI δεν είναι διαθέσιμος.');
    } finally {
      setAiLoading(false);
    }
  };

  const cardsDisabled =
    game.winner !== null || (game.phase === 'clue' && !game.spymasterView);

  return (
    <div className="h-[100dvh] flex flex-col bg-[#0a1210] overflow-hidden">
      <header className="h-12 shrink-0 border-b border-emerald-900/40 bg-[#0d1f17]/90 backdrop-blur flex items-center justify-between px-3 z-20">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-200/70" onClick={() => navigate('/games')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Codenames</h1>
            <p className="text-[9px] text-emerald-600 font-mono">Ομαδικό παιχνίδι λέξεων</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-[8px] text-red-400 font-bold uppercase">Κόκκινη</p>
            <p className="text-lg font-black text-red-300 leading-none">{game.redRemaining}</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] text-blue-400 font-bold uppercase">Μπλε</p>
            <p className="text-lg font-black text-blue-300 leading-none">{game.blueRemaining}</p>
          </div>
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/30">
            <Timer className="h-3 w-3 text-emerald-500" />
            <span className="text-xs font-mono text-emerald-200">Live</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={game.spymasterView ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-[10px]"
            onClick={() => setGame((g) => toggleSpymasterView(g))}
          >
            {game.spymasterView ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-200/70">
                  <History className="h-4 w-4" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-80 bg-[#0d1f17] border-emerald-900/30">
              <h3 className="text-sm font-bold text-emerald-100 mb-3">Ιστορικό</h3>
              <div className="space-y-2 text-xs text-emerald-200/70 max-h-[70vh] overflow-y-auto">
                {game.log.map((l, i) => (
                  <div key={i} className="p-2 rounded bg-emerald-950/40 border border-emerald-900/20">
                    {l}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="px-3 pt-2 shrink-0">
        <TableSessionBar gameTitle="Codenames" playerCount={4} />
      </div>

      {/* Current clue banner */}
      {game.currentClue && game.phase === 'guess' && (
        <div className="shrink-0 px-4 py-2 flex justify-center">
          <Card className="bg-emerald-950/60 border-emerald-800/40 backdrop-blur max-w-md w-full">
            <CardContent className="p-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-[9px] text-emerald-500 uppercase font-bold">Υπόδειξη</p>
                <p className="text-xl font-black text-white tracking-widest">
                  {game.currentClue.word}{' '}
                  <span className="text-amber-400">{game.currentClue.count}</span>
                </p>
                <p className="text-[10px] text-emerald-400/70">Απομένουν {game.guessesLeft} επιλογές</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setGame((g) => endGuessing(g))}>
                Πέρασμα
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <main className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,#0f2a1c_0%,#061510_65%)]">
        <CodenamesBoardVisual
          cards={game.cards}
          spymasterView={game.spymasterView}
          activeTeam={game.activeTeam}
          disabled={cardsDisabled}
          onCardClick={(index) => setGame((g) => guessCard(g, index))}
        />

        {game.phase === 'clue' && (
          <Card className="mt-4 w-full max-w-sm bg-emerald-950/70 border-emerald-800/40">
            <CardContent className="p-4 space-y-3">
              <p className="text-[10px] uppercase text-emerald-500 font-bold text-center">
                Spymaster — {game.activeTeam === 'red' ? 'Κόκκινη' : 'Μπλε'}
              </p>
              <Input
                value={clueWord}
                onChange={(e) => setClueWord(e.target.value)}
                placeholder="Μία λέξη"
                className="bg-[#061510] border-emerald-800/50 text-emerald-50"
              />
              <Input
                type="number"
                min={1}
                max={3}
                value={clueCount}
                onChange={(e) => setClueCount(Number(e.target.value))}
                className="bg-[#061510] border-emerald-800/50"
              />
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setGame((g) => giveClue(g, clueWord, clueCount));
                    setClueWord('');
                  }}
                >
                  Δώσε υπόδειξη
                </Button>
                <Button variant="outline" disabled={aiLoading} onClick={handleAiHint}>
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {game.winner && (
          <p className="mt-4 text-center font-black text-xl text-amber-300 uppercase tracking-widest">
            Νίκη — {game.winner === 'red' ? 'Κόκκινη' : 'Μπλε'} ομάδα
          </p>
        )}
      </main>

      <footer className="shrink-0 py-2 border-t border-emerald-900/30 bg-[#0d1f17]/80 flex justify-center gap-6">
        <div className="flex items-center gap-2 text-[10px] text-red-300/80">
          <Users className="w-3 h-3" />
          <span>
            Κόκκινη: <strong className="text-red-200">{game.redRemaining}</strong> κάρτες
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-blue-300/80">
          <Users className="w-3 h-3" />
          <span>
            Μπλε: <strong className="text-blue-200">{game.blueRemaining}</strong> κάρτες
          </span>
        </div>
      </footer>
    </div>
  );
}
