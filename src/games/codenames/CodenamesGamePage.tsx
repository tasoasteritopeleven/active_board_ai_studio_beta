import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { BoardGameTable } from '@/components/boardgame/BoardGameTable';
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
    <div className="h-[100dvh] flex flex-col bg-[#061510] overflow-hidden">
      <header className="h-11 shrink-0 border-b border-emerald-900/40 bg-[#0a1a14]/95 flex items-center justify-between px-3 z-30">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/games')}>
          <ChevronLeft className="h-4 w-4 text-emerald-200/70" />
        </Button>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-10 rounded bg-gradient-to-b from-red-600 to-red-800 border border-red-950 flex flex-col items-center justify-center shadow-md">
              <span className="text-[7px] font-bold text-red-100">RED</span>
              <span className="text-lg font-black text-white leading-none">{game.redRemaining}</span>
            </div>
            <div className="w-8 h-10 rounded bg-gradient-to-b from-blue-600 to-blue-800 border border-blue-950 flex flex-col items-center justify-center shadow-md">
              <span className="text-[7px] font-bold text-blue-100">BLUE</span>
              <span className="text-lg font-black text-white leading-none">{game.blueRemaining}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={game.spymasterView ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-[10px]"
            onClick={() => setGame((g) => toggleSpymasterView(g))}
          >
            {game.spymasterView ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            <span className="ml-1 hidden sm:inline">Spymaster</span>
          </Button>
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-200/70">
                  <History className="h-4 w-4" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-80 bg-[#0a1a14] border-emerald-900/40">
              <h3 className="text-sm font-bold text-emerald-100 mb-3">Ιστορικό παρτίδας</h3>
              <div className="space-y-2 text-xs text-emerald-200/70 max-h-[70vh] overflow-y-auto">
                {game.log.map((l, i) => (
                  <div key={i} className="p-2 rounded bg-emerald-950/50 border border-emerald-900/30">
                    {l}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {game.currentClue && game.phase === 'guess' && (
        <div className="shrink-0 z-20 flex justify-center py-2 px-4">
          <div className="inline-flex items-center gap-4 px-5 py-2 rounded-full bg-board-paper border-2 border-amber-900/30 shadow-lg board-fold-shadow">
            <span className="text-[9px] uppercase text-amber-800 font-bold tracking-widest">Υπόδειξη</span>
            <span className="text-xl font-black text-amber-950 tracking-widest">
              {game.currentClue.word}{' '}
              <span className="text-red-700">{game.currentClue.count}</span>
            </span>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setGame((g) => endGuessing(g))}>
              Πέρασμα
            </Button>
          </div>
        </div>
      )}

      <BoardGameTable variant="felt" className="flex-1" tilt>
        <div className="w-full h-full overflow-y-auto flex flex-col items-center justify-center py-4 px-2">
          <CodenamesBoardVisual
            cards={game.cards}
            spymasterView={game.spymasterView}
            activeTeam={game.activeTeam}
            disabled={cardsDisabled}
            onCardClick={(index) => setGame((g) => guessCard(g, index))}
          />

          {game.phase === 'clue' && (
            <div className="mt-4 w-full max-w-sm rounded-xl border-2 border-amber-900/30 bg-board-paper p-4 shadow-xl board-fold-shadow">
              <p className="text-[10px] uppercase text-amber-800 font-bold text-center mb-3 tracking-widest">
                Κάρτα Spymaster — {game.activeTeam === 'red' ? 'Κόκκινη' : 'Μπλε'}
              </p>
              <div className="space-y-2">
                <Input
                  value={clueWord}
                  onChange={(e) => setClueWord(e.target.value)}
                  placeholder="Μία λέξη"
                  className="bg-white/80 border-amber-900/20 text-amber-950 font-bold uppercase"
                />
                <Input
                  type="number"
                  min={1}
                  max={3}
                  value={clueCount}
                  onChange={(e) => setClueCount(Number(e.target.value))}
                  className="bg-white/80 border-amber-900/20"
                />
                <div className="flex gap-2 pt-1">
                  <Button
                    className="flex-1 font-bold"
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
              </div>
            </div>
          )}

          {game.winner && (
            <p className="mt-4 font-black text-xl text-amber-200 uppercase tracking-widest drop-shadow-lg">
              Νίκη — {game.winner === 'red' ? 'Κόκκινη' : 'Μπλε'}
            </p>
          )}
        </div>
      </BoardGameTable>
    </div>
  );
}
