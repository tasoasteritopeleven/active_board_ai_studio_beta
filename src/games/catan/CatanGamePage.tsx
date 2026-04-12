import { useState } from 'react';
import { 
  Home, 
  Map as MapIcon, 
  History, 
  ChevronLeft,
  Settings,
  MessageSquare,
  Building2,
  Menu,
  ArrowRightLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CatanBoard3D } from './components/CatanBoard3D';
import { Resource3D } from './components/Resource3D';
import { useCatanStore } from './store/catanStore';
import { LifecyclePhase, ResourceType } from './domain/types';
import { useCatanAI, AIPlayerConfig } from './ai/useCatanAI';
import { DiceRollButton } from '@/components/game/DiceRollButton';
import { CarouselHUD } from './components/ui/CarouselHUD';

const AI_CONFIGS: AIPlayerConfig[] = [
  { id: 'p2', isAI: true, difficulty: 'Easy' },
  { id: 'p3', isAI: true, difficulty: 'Medium' },
];

export default function CatanGamePage() {
  const navigate = useNavigate();
  const { phase, players, activePlayerId, rollDice, endTurn, diceResult } = useCatanStore();
  const activePlayer = players[activePlayerId];

  useCatanAI(AI_CONFIGS);

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="text-slate-400" onClick={() => navigate('/games')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest truncate max-w-[100px] sm:max-w-none">Catan</h1>
            <p className="hidden xs:block text-[10px] text-slate-500 font-mono">#CATAN-11</p>
          </div>
        </div>

        {/* Turn Indicator */}
        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-950 border border-slate-800 rounded-full shadow-inner">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activePlayer.color }}></div>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Current Turn:</span>
          <span className="text-sm font-black" style={{ color: activePlayer.color }}>{activePlayer.name}</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            <span className="hidden xs:inline text-xs font-bold text-white">Victory Points:</span>
            <span className="xs:hidden text-xs font-bold text-white">VP:</span>
            <span className="text-sm font-bold text-primary">{activePlayer.victoryPoints}/10</span>
          </div>
          
          <div className="flex items-center -space-x-2">
            {Object.values(players).map((p) => (
              <div 
                key={p.id} 
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-white transition-all ${
                  p.id === activePlayerId ? 'border-primary bg-primary/20 scale-110 z-10' : 'border-slate-900 bg-slate-800'
                }`}
                style={{ borderColor: p.id === activePlayerId ? p.color : undefined }}
              >
                {p.name.substring(0, 2)}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="text-slate-400">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Main Game Board Area */}
        <div className="flex-1 relative">
          <CatanBoard3D />

          {/* Turn Action Overlay */}
          {phase === LifecyclePhase.ROLLING && activePlayerId === 'p1' && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-10">
              <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl shadow-2xl text-center space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Your Turn</h2>
                <DiceRollButton onClick={rollDice} label="ROLL FOR RESOURCES" />
              </div>
            </div>
          )}

          {/* Dice Result Overlay */}
          {diceResult && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none z-10 animate-in slide-in-from-top-4 duration-500">
              <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 px-6 py-3 rounded-full shadow-2xl flex items-center gap-4">
                <div className="flex gap-2">
                  {[diceResult[0], diceResult[1]].map((val, idx) => (
                    <div key={idx} className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-inner border-t border-red-400/30 relative">
                      {/* Render dots based on value */}
                      {val === 1 && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      {val === 2 && (
                        <>
                          <div className="w-2 h-2 bg-white rounded-full absolute top-2 left-2"></div>
                          <div className="w-2 h-2 bg-white rounded-full absolute bottom-2 right-2"></div>
                        </>
                      )}
                      {val === 3 && (
                        <>
                          <div className="w-2 h-2 bg-white rounded-full absolute top-2 left-2"></div>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          <div className="w-2 h-2 bg-white rounded-full absolute bottom-2 right-2"></div>
                        </>
                      )}
                      {val === 4 && (
                        <>
                          <div className="w-2 h-2 bg-white rounded-full absolute top-2 left-2"></div>
                          <div className="w-2 h-2 bg-white rounded-full absolute top-2 right-2"></div>
                          <div className="w-2 h-2 bg-white rounded-full absolute bottom-2 left-2"></div>
                          <div className="w-2 h-2 bg-white rounded-full absolute bottom-2 right-2"></div>
                        </>
                      )}
                      {val === 5 && (
                        <>
                          <div className="w-2 h-2 bg-white rounded-full absolute top-2 left-2"></div>
                          <div className="w-2 h-2 bg-white rounded-full absolute top-2 right-2"></div>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                          <div className="w-2 h-2 bg-white rounded-full absolute bottom-2 left-2"></div>
                          <div className="w-2 h-2 bg-white rounded-full absolute bottom-2 right-2"></div>
                        </>
                      )}
                      {val === 6 && (
                        <>
                          <div className="w-2 h-2 bg-white rounded-full absolute top-2 left-2"></div>
                          <div className="w-2 h-2 bg-white rounded-full absolute top-2 right-2"></div>
                          <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-2 -translate-y-1/2"></div>
                          <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 right-2 -translate-y-1/2"></div>
                          <div className="w-2 h-2 bg-white rounded-full absolute bottom-2 left-2"></div>
                          <div className="w-2 h-2 bg-white rounded-full absolute bottom-2 right-2"></div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <div className="w-px h-8 bg-slate-700"></div>
                <div className="text-3xl font-black text-white">
                  {diceResult[0] + diceResult[1]}
                </div>
              </div>
            </div>
          )}
          
          {/* Carousel HUD (Bottom Sheet UI) */}
          {activePlayerId === 'p1' && <CarouselHUD />}
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ resources, activePlayer, phase, endTurn }: any) {
  const handleBuildRoad = () => toast.info("Select an edge on the board to build a road.");
  const handleBuildSettlement = () => toast.info("Select a highlighted corner on the board to build a settlement.");
  const handleBuildCity = () => toast.info("Select one of your existing settlements to upgrade to a city.");
  const handleBuyDevCard = () => {
    toast.success("Bought a Development Card!");
    // Explain Dev Card
    toast("Development Cards (Dev Cards) give you special abilities like Knights (to move the robber), Monopoly (to take all of one resource), or Victory Points.", { duration: 8000 });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <Home className="h-4 w-4 text-primary" />
          Resource Bank
        </h3>
        <span className="text-xs font-bold text-slate-400" style={{ color: activePlayer.color }}>{activePlayer.name}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {resources.map((res: any) => (
          <div key={res.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 group hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`rounded bg-slate-900 ${res.color} overflow-hidden`}>
                <Resource3D type={res.type} />
              </div>
              <span className="font-bold text-white text-sm">{res.name}</span>
            </div>
            <span className="text-xl font-mono font-bold text-white px-2">{res.count}</span>
          </div>
        ))}

        <div className="pt-6 space-y-3">
          <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest px-1">Build Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-16 flex-col gap-1 border-slate-800 bg-slate-950/50 hover:border-primary/50" disabled={phase !== LifecyclePhase.TRADING_BUILDING} onClick={handleBuildRoad}>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-[10px] uppercase font-bold">Road</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-1 border-slate-800 bg-slate-950/50 hover:border-primary/50" disabled={phase !== LifecyclePhase.TRADING_BUILDING} onClick={handleBuildSettlement}>
              <Home className="h-4 w-4 text-blue-400" />
              <span className="text-[10px] uppercase font-bold">Settlement</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-1 border-slate-800 bg-slate-950/50 hover:border-primary/50" disabled={phase !== LifecyclePhase.TRADING_BUILDING} onClick={handleBuildCity}>
              <Building2 className="h-4 w-4 text-yellow-400" />
              <span className="text-[10px] uppercase font-bold">City</span>
            </Button>
            <Button variant="outline" className="h-16 flex-col gap-1 border-slate-800 bg-slate-950/50 hover:border-primary/50" disabled={phase !== LifecyclePhase.TRADING_BUILDING} onClick={handleBuyDevCard}>
              <MapIcon className="h-4 w-4 text-purple-400" />
              <span className="text-[10px] uppercase font-bold">Dev Card</span>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-800 bg-slate-950/50 space-y-2">
        <TradeDialog disabled={phase !== LifecyclePhase.TRADING_BUILDING} />
        {phase === LifecyclePhase.TRADING_BUILDING && (
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={endTurn}>
            END TURN
          </Button>
        )}
      </div>
    </div>
  );
}

function TradeDialog({ disabled }: { disabled: boolean }) {
  const [tradeType, setTradeType] = useState<'bank' | 'player'>('bank');
  
  return (
    <Dialog>
      <DialogTrigger render={
        <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold" disabled={disabled}>
          TRADE RESOURCES
        </Button>
      } />
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Trade Resources</DialogTitle>
          <DialogDescription className="text-slate-400">
            Exchange resources with the bank (4:1) or propose a trade to other players.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4">
          <Button 
            variant={tradeType === 'bank' ? 'default' : 'outline'} 
            className={`flex-1 ${tradeType === 'bank' ? 'bg-primary' : 'border-slate-700'}`}
            onClick={() => setTradeType('bank')}
          >
            Bank Trade (4:1)
          </Button>
          <Button 
            variant={tradeType === 'player' ? 'default' : 'outline'} 
            className={`flex-1 ${tradeType === 'player' ? 'bg-primary' : 'border-slate-700'}`}
            onClick={() => setTradeType('player')}
          >
            Player Trade
          </Button>
        </div>

        <div className="space-y-4 py-4 border-t border-slate-800">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <p className="text-xs text-slate-400 mb-2 uppercase font-bold">Give</p>
              <div className="h-20 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500">
                Select Resource
              </div>
            </div>
            <div className="px-4">
              <ArrowRightLeft className="h-6 w-6 text-slate-500" />
            </div>
            <div className="text-center flex-1">
              <p className="text-xs text-slate-400 mb-2 uppercase font-bold">Receive</p>
              <div className="h-20 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center text-slate-500">
                Select Resource
              </div>
            </div>
          </div>
        </div>

        <Button className="w-full bg-green-600 hover:bg-green-700 font-bold" onClick={() => toast.success("Trade completed!")}>
          CONFIRM TRADE
        </Button>
      </DialogContent>
    </Dialog>
  );
}
