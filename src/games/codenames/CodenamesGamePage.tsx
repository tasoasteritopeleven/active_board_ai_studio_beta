import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  History, 
  ChevronLeft,
  Settings,
  MessageSquare,
  Eye,
  EyeOff,
  Timer,
  CheckCircle2,
  XCircle,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function CodenamesGamePage() {
  const navigate = useNavigate();
  const [isSpymaster, setIsSpymaster] = useState(false);
  const [redScore] = useState(8);
  const [blueScore] = useState(7);

  const mockHistory = [
    { team: 'red', type: 'clue', clue: 'GALAXY', number: 3, timestamp: '10:05 AM' },
    { team: 'red', type: 'guess', word: 'ROBOT', result: 'red', timestamp: '10:06 AM' },
    { team: 'red', type: 'guess', word: 'STAR', result: 'blue', timestamp: '10:06 AM', endedTurn: true },
    { team: 'blue', type: 'clue', clue: 'OCEAN', number: 2, timestamp: '10:08 AM' },
    { team: 'blue', type: 'guess', word: 'WATER', result: 'red', timestamp: '10:09 AM', endedTurn: true },
    { team: 'red', type: 'clue', clue: 'FRUIT', number: 1, timestamp: '10:10 AM' },
    { team: 'red', type: 'guess', word: 'APPLE', result: 'red', timestamp: '10:11 AM' },
    { team: 'red', type: 'pass', timestamp: '10:12 AM', endedTurn: true },
  ];

  const words = [
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
  ];

  const getCardStyle = (word: any) => {
    if (!word.revealed && !isSpymaster) return 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200';
    
    const base = 'border-2';
    if (word.type === 'red') return `${base} bg-red-950/40 border-red-500 text-red-200`;
    if (word.type === 'blue') return `${base} bg-blue-950/40 border-blue-500 text-blue-200`;
    if (word.type === 'neutral') return `${base} bg-slate-700/40 border-slate-500 text-slate-300`;
    if (word.type === 'assassin') return `${base} bg-black border-slate-900 text-slate-500`;
    return '';
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
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
            <div className="h-8 w-px bg-slate-800"></div>
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
            className={isSpymaster ? 'bg-primary text-primary-foreground' : 'border-slate-700 text-slate-400'}
          >
            {isSpymaster ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
            Spymaster Mode
          </Button>

          <Sheet>
            <SheetTrigger>
              <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 text-slate-400 hover:text-white cursor-pointer">
                <History className="h-5 w-5" />
              </div>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] bg-slate-950 border-l border-slate-800 p-0 flex flex-col">
              <div className="p-4 border-b border-slate-800 shrink-0">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Game History
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {mockHistory.map((item, idx) => (
                  <div key={idx} className="relative pl-6 pb-2">
                    {/* Timeline Line */}
                    {idx < mockHistory.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-slate-800"></div>
                    )}
                    
                    {/* Timeline Dot */}
                    <div 
                      className={`absolute left-[6px] top-1.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                        item.team === 'red' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                    ></div>

                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold uppercase ${item.team === 'red' ? 'text-red-500' : 'text-blue-500'}`}>
                          {item.team} Team
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                      </div>
                      
                      {item.type === 'clue' && (
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-sm font-bold tracking-widest">{item.clue}</span>
                          <span className="text-xs text-slate-400 border border-slate-700 px-1.5 rounded bg-slate-800">
                            {item.number}
                          </span>
                        </div>
                      )}

                      {item.type === 'guess' && item.word && item.result && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-300">Guessed</span>
                          <span className="text-sm font-bold tracking-widest text-white">{item.word}</span>
                          <span className="text-xs text-slate-500">→</span>
                          <div className={`w-3 h-3 rounded-full ${
                            item.result === 'red' ? 'bg-red-500' :
                            item.result === 'blue' ? 'bg-blue-500' :
                            item.result === 'assassin' ? 'bg-black border border-slate-700' :
                            'bg-slate-500'
                          }`}></div>
                          <span className="text-xs text-slate-400 capitalize">
                            {item.result === item.team ? 'Success' : 'Miss'}
                            {item.endedTurn && ' • Turn Ended'}
                          </span>
                        </div>
                      )}

                      {item.type === 'pass' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400 italic">Passed their turn</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          <Button variant="ghost" size="icon" className="text-slate-400">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto w-full space-y-8">
          {/* Clue Display */}
          <div className="flex justify-center">
            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm w-full max-w-md">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">S</div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Current Clue</p>
                    <p className="text-xl font-bold text-white tracking-wider">GALAXY <span className="text-primary">3</span></p>
                  </div>
                </div>
                <Button className="bg-primary hover:bg-primary/90">END TURN</Button>
              </CardContent>
            </Card>
          </div>

          {/* Word Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
            {words.map((word, i) => (
              <Card 
                key={i} 
                className={`h-24 md:h-32 flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${getCardStyle(word)} shadow-lg`}
              >
                <CardContent className="p-2 text-center">
                  <p className="text-sm md:text-lg font-bold tracking-widest uppercase">{word.text}</p>
                  {word.revealed && (
                    <div className="mt-2 flex justify-center">
                      {word.type === 'red' && <CheckCircle2 className="h-4 w-4 text-red-500" />}
                      {word.type === 'blue' && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                      {word.type === 'neutral' && <XCircle className="h-4 w-4 text-slate-500" />}
                      {word.type === 'assassin' && <XCircle className="h-4 w-4 text-black" />}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <footer className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-md flex justify-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-950 border border-slate-800">
          <Users className="h-4 w-4 text-slate-500" />
          <span className="text-xs text-slate-400">Red Team: <span className="text-white font-bold">3 Online</span></span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-950 border border-slate-800">
          <Users className="h-4 w-4 text-slate-500" />
          <span className="text-xs text-slate-400">Blue Team: <span className="text-white font-bold">2 Online</span></span>
        </div>
      </footer>
    </div>
  );
}
