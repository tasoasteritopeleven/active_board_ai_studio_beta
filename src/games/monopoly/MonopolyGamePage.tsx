import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dice5, 
  Building2, 
  User, 
  History, 
  DollarSign,
  ChevronLeft,
  Settings,
  MessageSquare,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MonopolyGamePage() {
  const navigate = useNavigate();
  const [balance] = useState(1500);
  const [properties] = useState([
    { name: 'Boardwalk', color: 'bg-blue-600', price: 400 },
    { name: 'Park Place', color: 'bg-blue-600', price: 350 },
    { name: 'Illinois Ave', color: 'bg-red-600', price: 240 },
  ]);

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
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
              <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white">
                P{i}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-slate-400">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Main Game Board Area (Placeholder for 3D/2D Board) */}
        <div className="flex-1 bg-slate-900 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 opacity-50"></div>
          
          {/* Mock Board Layout */}
          <div className="relative w-[600px] h-[600px] border-4 border-slate-800 rounded-xl bg-slate-950/50 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-primary mx-auto animate-pulse">
                <Dice5 className="h-12 w-12" />
              </div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Your Turn</h2>
              <p className="text-slate-500">Roll the dice to move your piece</p>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-12 h-14 text-xl shadow-xl shadow-primary/20">
                ROLL DICE
              </Button>
            </div>

            {/* Corner Squares */}
            <div className="absolute top-0 left-0 w-20 h-20 border-r border-b border-slate-800 bg-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-500">GO</div>
            <div className="absolute top-0 right-0 w-20 h-20 border-l border-b border-slate-800 bg-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-500">JAIL</div>
            <div className="absolute bottom-0 left-0 w-20 h-20 border-r border-t border-slate-800 bg-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-500">PARKING</div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-l border-t border-slate-800 bg-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-500">GO TO JAIL</div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-80 border-l border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              My Portfolio
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {properties.map((prop) => (
              <div key={prop.name} className="p-3 rounded-lg bg-slate-950 border border-slate-800 group hover:border-primary/30 transition-colors">
                <div className={`h-2 w-full rounded-full ${prop.color} mb-3`}></div>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-white text-sm">{prop.name}</p>
                  <p className="text-xs font-mono text-primary">${prop.price}</p>
                </div>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-slate-800"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-slate-500 uppercase font-bold">Game Log</span>
              <Button variant="ghost" size="icon" className="h-6 w-6"><History className="h-4 w-4" /></Button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto text-[10px] font-mono pr-2 custom-scrollbar">
              <p className="text-slate-400"><span className="text-primary">P1</span> rolled a 7</p>
              <p className="text-slate-400"><span className="text-primary">P1</span> landed on Boardwalk</p>
              <p className="text-slate-400"><span className="text-primary">P1</span> bought Boardwalk for $400</p>
              <p className="text-slate-400"><span className="text-blue-400">P2</span> rolled a 4</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Controls Overlay */}
      <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        <Button size="icon" className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 shadow-2xl">
          <Building2 className="h-6 w-6" />
        </Button>
        <Button size="icon" className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 shadow-2xl">
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
