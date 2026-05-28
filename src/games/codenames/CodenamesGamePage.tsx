import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
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
import { UnityBoardCanvas } from '@/components/unity/UnityBoardCanvas';
import { CodenamesBoardVisual } from './components/CodenamesBoardVisual';

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
      const hint = await requestCodenamesHint({
        words: teamWords,
        team: game.activeTeam,
      });
      setClueWord(hint.clue);
      setClueCount(hint.count);
      toast.success(`AI: ${hint.clue} / ${hint.count}`);
    } catch {
      toast.error('Ο server AI δεν είναι διαθέσιμος. Εκκινήστε npm run dev:server με GEMINI_API_KEY.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden text-white">
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/games')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest">Codenames</h1>
            <p className="text-[10px] text-slate-500">TableForge + Gemini hints (server)</p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-center">
          <div>
            <p className="text-[10px] text-red-500 font-bold">Κόκκινη</p>
            <p className="text-xl font-bold">{game.redRemaining}</p>
          </div>
          <div>
            <p className="text-[10px] text-blue-500 font-bold">Μπλε</p>
            <p className="text-xl font-bold">{game.blueRemaining}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setGame((g) => toggleSpymasterView(g))}>
          {game.spymasterView ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
          Spymaster
        </Button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-0 overflow-hidden relative">
        <div className="flex-1 relative min-h-[400px]">
          <UnityBoardCanvas
            game="codenames"
            state={{
              words: game.cards.map((c) => ({
                text: c.word,
                type: c.type,
                revealed: c.revealed,
              })),
              isSpymaster: game.spymasterView,
            }}
            className="absolute inset-0"
            fallback={
              <CodenamesBoard3D
                gameState={game}
                onGuess={(index) => setGame((g) => guessCard(g, index))}
              />
            }
          />
        </div>

        <div className="w-full lg:w-80 bg-slate-900 border-l border-slate-800 p-4 space-y-4 overflow-y-auto shrink-0 z-10 shadow-2xl">
          <Badge className={game.activeTeam === 'red' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}>
            Σειρά: {game.activeTeam === 'red' ? 'Κόκκινη' : 'Μπλε'} — {game.phase === 'clue' ? 'Υπόδειξη' : 'Μάντεψε'}
          </Badge>

          {game.phase === 'clue' && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase text-slate-500">Υπόδειξη Spymaster</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={clueWord}
                  onChange={(e) => setClueWord(e.target.value)}
                  placeholder="Μία λέξη"
                  className="bg-slate-950 border-slate-700"
                />
                <Input
                  type="number"
                  min={1}
                  max={3}
                  value={clueCount}
                  onChange={(e) => setClueCount(Number(e.target.value))}
                  className="bg-slate-950 border-slate-700"
                />
                <Button
                  className="w-full"
                  onClick={() => {
                    setGame((g) => giveClue(g, clueWord, clueCount));
                    setClueWord('');
                  }}
                >
                  Δώσε υπόδειξη
                </Button>
                <Button variant="outline" className="w-full" disabled={aiLoading} onClick={handleAiHint}>
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  AI Υπόδειξη (Gemini)
                </Button>
              </CardContent>
            </Card>
          )}

          {game.phase === 'guess' && game.currentClue && (
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-4 space-y-3">
                <p className="text-center text-lg font-bold text-primary">
                  {game.currentClue.word} / {game.currentClue.count}
                </p>
                <p className="text-center text-xs text-slate-500">
                  Απομένουν {game.guessesLeft} μαντεψιές
                </p>
                <Button variant="secondary" className="w-full" onClick={() => setGame((g) => endGuessing(g))}>
                  Πέρασμα
                </Button>
              </CardContent>
            </Card>
          )}

          {game.winner && (
            <p className="text-center font-bold text-primary text-lg">
              Νίκη: {game.winner === 'red' ? 'Κόκκινη' : 'Μπλε'} ομάδα!
            </p>
          )}

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-4 text-[10px] text-slate-400 max-h-32 overflow-y-auto space-y-1">
              {game.log.slice(-6).map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
