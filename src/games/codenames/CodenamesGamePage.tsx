import { useMemo, useState } from 'react';
import { Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { PhysicalTableLayout } from '@/components/boardgame/PhysicalTableLayout';
import { BoardGameViewport } from '@/components/boardgame/BoardGameViewport';
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
import CodenamesBoard3D from './CodenamesBoard3D';

export default function CodenamesGamePage() {
  const [game, setGame] = useState<CodenamesState>(() => createCodenamesGame());
  const [clueWord, setClueWord] = useState('');
  const [clueCount, setClueCount] = useState(2);
  const [aiLoading, setAiLoading] = useState(false);

  const teamWords = game.cards
    .filter((c) => !c.revealed && c.type === game.activeTeam)
    .map((c) => c.word);

  const boardState = useMemo(
    () => ({
      words: game.cards.map((c) => ({
        text: c.word,
        type: c.type,
        revealed: c.revealed,
      })),
      isSpymaster: game.spymasterView,
    }),
    [game.cards, game.spymasterView],
  );

  const handleAiHint = async () => {
    setAiLoading(true);
    try {
      const hint = await requestCodenamesHint({
        words: teamWords,
        team: game.activeTeam,
      });
      setClueWord(hint.clue);
      setClueCount(hint.count);
      toast.success(`AI: ${hint.clue} / ${hint.count}`);
    } catch {
      toast.error('Ο server AI δεν είναι διαθέσιμος (npm run dev + GEMINI_API_KEY).');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <PhysicalTableLayout
      title="Codenames"
      subtitle="25 κάρτες · felt tabletop"
      headerRight={
        <>
          <div className="flex gap-4 text-center text-sm">
            <div>
              <p className="text-[9px] text-red-500 font-bold uppercase">Κόκκινη</p>
              <p className="font-bold">{game.redRemaining}</p>
            </div>
            <div>
              <p className="text-[9px] text-blue-500 font-bold uppercase">Μπλε</p>
              <p className="font-bold">{game.blueRemaining}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setGame((g) => toggleSpymasterView(g))}>
            {game.spymasterView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </>
      }
      board={
        <BoardGameViewport
          game="codenames"
          state={boardState}
          className="absolute inset-0"
          render3D={
            <CodenamesBoard3D
              gameState={game}
              onGuess={(index) => setGame((g) => guessCard(g, index))}
            />
          }
          render2D={
            <CodenamesBoardVisual
              state={boardState}
              onCardClick={(index) => setGame((g) => guessCard(g, index))}
            />
          }
        />
      }
      actionDock={
        <div className="space-y-2">
          {game.phase === 'clue' && (
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={clueWord}
                onChange={(e) => setClueWord(e.target.value)}
                placeholder="Υπόδειξη (μία λέξη)"
                className="bg-slate-950 border-slate-700 text-sm"
              />
              <Input
                type="number"
                min={1}
                max={3}
                value={clueCount}
                onChange={(e) => setClueCount(Number(e.target.value))}
                className="w-16 bg-slate-950 border-slate-700"
              />
              <Button
                className="shrink-0"
                onClick={() => {
                  setGame((g) => giveClue(g, clueWord, clueCount));
                  setClueWord('');
                }}
              >
                Δώσε
              </Button>
            </div>
          )}
          {game.phase === 'guess' && game.currentClue && (
            <div className="text-center">
              <p className="font-bold text-primary text-lg">
                {game.currentClue.word} / {game.currentClue.count}
              </p>
              <Button variant="secondary" size="sm" className="mt-2" onClick={() => setGame((g) => endGuessing(g))}>
                Πέρασμα
              </Button>
            </div>
          )}
          {game.winner && (
            <p className="text-center font-bold text-primary">
              Νίκη: {game.winner === 'red' ? 'Κόκκινη' : 'Μπλε'}
            </p>
          )}
        </div>
      }
      sidebar={
        <div className="p-4 space-y-4">
          <Badge className={game.activeTeam === 'red' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}>
            {game.activeTeam === 'red' ? 'Κόκκινη' : 'Μπλε'} — {game.phase === 'clue' ? 'Υπόδειξη' : 'Μάντεψε'}
          </Badge>
          {game.phase === 'clue' && (
            <Card className="bg-slate-950/80 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase text-slate-500">AI Spymaster</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" disabled={aiLoading} onClick={handleAiHint}>
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Gemini hint
                </Button>
              </CardContent>
            </Card>
          )}
          <Card className="bg-slate-950/80 border-slate-800">
            <CardContent className="pt-4 text-[10px] text-slate-400 max-h-48 overflow-y-auto space-y-1">
              {game.log.slice(-8).map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </CardContent>
          </Card>
        </div>
      }
    />
  );
}
