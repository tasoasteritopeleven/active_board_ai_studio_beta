import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  History,
  ChevronLeft,
  Settings,
  Eye,
  EyeOff,
  Timer,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UnityBoardCanvas } from '@/components/unity/UnityBoardCanvas';
import {
  CodenamesBoardVisual,
  type CodenamesCard,
} from './components/CodenamesBoardVisual';

export default function CodenamesGamePage() {
  const navigate = useNavigate();
  const [isSpymaster, setIsSpymaster] = useState(false);
  const [redScore] = useState(8);
  const [blueScore] = useState(7);

  const [words, setWords] = useState<CodenamesCard[]>([
    { text: 'APPLE', type: 'red', revealed: true },
    { text: 'SPACE', type: 'blue', revealed: false },
    { text: 'DOG', type: 'neutral', revealed: true },
    { text: 'BOMB', type: 'assassin', revealed: false },
    { text: 'WATER', type: 'red', revealed: false },
    { text: 'FIRE', type: 'blue', revealed: true },
    { text: 'ROBOT', type: 'red', revealed: true },
    { text: 'GREEN', type: 'neutral', revealed: false },
    { text: 'PIZZA', type: 'blue', revealed: false },
    { text: 'MOON', type: 'red', revealed: false },
    { text: 'STAR', type: 'blue', revealed: true },
    { text: 'COLD', type: 'neutral', revealed: false },
    { text: 'WAR', type: 'red', revealed: false },
    { text: 'PEACE', type: 'blue', revealed: false },
    { text: 'LIFE', type: 'neutral', revealed: true },
    { text: 'DEATH', type: 'assassin', revealed: false },
    { text: 'KING', type: 'red', revealed: false },
    { text: 'QUEEN', type: 'blue', revealed: false },
    { text: 'JACK', type: 'neutral', revealed: false },
    { text: 'ACE', type: 'red', revealed: true },
    { text: 'CLUB', type: 'blue', revealed: false },
    { text: 'HEART', type: 'neutral', revealed: false },
    { text: 'SPADE', type: 'red', revealed: false },
    { text: 'DIAMOND', type: 'blue', revealed: true },
    { text: 'GOLD', type: 'neutral', revealed: false },
  ]);

  const boardState = { words, isSpymaster };

  const handleCardClick = (index: number) => {
    setWords((prev) =>
      prev.map((w, i) => (i === index ? { ...w, revealed: true } : w)),
    );
  };

  const boardFallback = (
    <CodenamesBoardVisual state={boardState} onCardClick={handleCardClick} />
  );

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-400" onClick={() => navigate('/games')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-sm font-bold text-white uppercase tracking-widest">Codenames: Online</h1>
            <p className="text-[10px] text-slate-500 font-mono">SESSION: #CODE-99</p>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] text-red-500 uppercase font-bold">Red Team</p>
              <p className="text-xl font-bold text-white">{redScore}</p>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-center">
              <p className="text-[10px] text-blue-500 uppercase font-bold">Blue Team</p>
              <p className="text-xl font-bold text-white">{blueScore}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            <Timer className="h-4 w-4 text-primary" />
            <span className="text-sm font-mono font-bold text-white">01:42</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isSpymaster ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsSpymaster(!isSpymaster)}
          >
            {isSpymaster ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            Spymaster Mode
          </Button>
          <Sheet>
            <SheetTrigger>
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:text-white cursor-pointer">
                <History className="h-5 w-5" />
              </div>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] bg-slate-950 border-slate-800">
              <p className="p-4 text-white font-bold">Game History</p>
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="icon" className="text-slate-400">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 relative min-h-0">
        <UnityBoardCanvas
          game="codenames"
          state={boardState}
          className="absolute inset-0"
          fallback={boardFallback}
        />

        <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none z-10 px-4">
          <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-sm max-w-md pointer-events-auto">
            <CardContent className="p-3 flex items-center justify-between gap-4">
              <p className="text-sm font-bold text-white tracking-wider">
                GALAXY <span className="text-primary">3</span>
              </p>
              <Button size="sm">END TURN</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-center gap-4 shrink-0 z-10">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-950 border border-slate-800">
          <Users className="h-4 w-4 text-slate-500" />
          <span className="text-xs text-slate-400">
            Red: <span className="text-white font-bold">3</span>
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-950 border border-slate-800">
          <Users className="h-4 w-4 text-slate-500" />
          <span className="text-xs text-slate-400">
            Blue: <span className="text-white font-bold">2</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
