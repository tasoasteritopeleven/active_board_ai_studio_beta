import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  ChevronLeft,
  DollarSign,
  History,
  Settings,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UnityBoardCanvas } from '@/components/unity/UnityBoardCanvas';
import { MonopolyBoardVisual } from './components/MonopolyBoardVisual';

export default function MonopolyGamePage() {
  const navigate = useNavigate();
  const [balance] = useState(1500);
  const [position, setPosition] = useState(0);
  const [properties] = useState([
    { name: 'Boardwalk', color: 'bg-blue-600', price: 400 },
    { name: 'Park Place', color: 'bg-blue-600', price: 350 },
    { name: 'Illinois Ave', color: 'bg-red-600', price: 240 },
  ]);

  const boardState = {
    position,
    playerColor: '#ef4444',
    houses: { 39: 2, 37: 1 } as Record<number, number>,
  };

  const handleRoll = (d1: number, d2: number) => {
    setPosition((p) => (p + d1 + d2) % 40);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-slate-400" onClick={() => navigate('/games')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-sm font-bold text-white uppercase tracking-widest">Monopoly: Classic</h1>
            <p className="text-[10px] text-slate-500 font-mono">SESSION: #MONO-42</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-500">
            <DollarSign className="h-4 w-4" />
            <span className="text-lg font-mono font-bold">${balance}</span>
          </div>
          <div className="flex items-center -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white"
              >
                P{i}
              </div>
            ))}
          </div>
        </div>

        <Button variant="ghost" size="icon" className="text-slate-400">
          <Settings className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-1 flex relative min-h-0">
        <div className="flex-1 relative min-h-0">
          <UnityBoardCanvas
            game="monopoly"
            state={boardState}
            className="absolute inset-0"
            fallback={<MonopolyBoardVisual state={boardState} onRoll={handleRoll} />}
          />
        </div>

        <aside className="w-80 border-l border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col shrink-0 z-10">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              My Portfolio
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {properties.map((prop) => (
              <div
                key={prop.name}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800 hover:border-primary/30 transition-colors"
              >
                <div className={`h-2 w-full rounded-full ${prop.color} mb-3`} />
                <div className="flex justify-between items-center">
                  <p className="font-bold text-white text-sm">{prop.name}</p>
                  <p className="text-xs font-mono text-primary">${prop.price}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-slate-500 uppercase font-bold">Game Log</span>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <History className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto text-[10px] font-mono">
              <p className="text-slate-400">
                <span className="text-primary">P1</span> on space {position}
              </p>
            </div>
          </div>
        </aside>
      </div>

      <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        <Button size="icon" className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800">
          <Building2 className="h-6 w-6" />
        </Button>
        <Button size="icon" className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800">
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
