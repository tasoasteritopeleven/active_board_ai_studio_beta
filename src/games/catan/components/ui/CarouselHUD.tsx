import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatanStore } from '../../store/catanStore';
import { ResourceType, LifecyclePhase } from '../../domain/types';
import { ChevronUp, ChevronDown, Hammer, ArrowRightLeft, Scroll, BarChart3, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CARDS = [
  { id: 'resources', title: 'Resources', icon: Package },
  { id: 'build', title: 'Build', icon: Hammer },
  { id: 'trade_bank', title: 'Bank Trade', icon: ArrowRightLeft },
  { id: 'trade_player', title: 'Player Trade', icon: ArrowRightLeft },
  { id: 'dev_cards', title: 'Dev Cards', icon: Scroll },
  { id: 'stats', title: 'Stats', icon: BarChart3 },
];

export function CarouselHUD() {
  const { uiState, setCarouselIndex, toggleCarousel, players, activePlayerId, phase, robberMode, pendingRobberHexId, confirmRobberMove, vertices } = useCatanStore();
  const activePlayer = players[activePlayerId];
  const constraintsRef = useRef(null);
  
  const [dragStart, setDragStart] = useState(0);

  const handleDragEnd = (e: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold && uiState.activeCarouselIndex < CARDS.length - 1) {
      setCarouselIndex(uiState.activeCarouselIndex + 1);
    } else if (info.offset.x > swipeThreshold && uiState.activeCarouselIndex > 0) {
      setCarouselIndex(uiState.activeCarouselIndex - 1);
    } else if (info.offset.y > swipeThreshold) {
      // Swipe down to close
      if (uiState.isCarouselOpen) toggleCarousel();
    } else if (info.offset.y < -swipeThreshold) {
      // Swipe up to open
      if (!uiState.isCarouselOpen) toggleCarousel();
    }
  };

  // If robber mode is active, override the HUD with Robber UI
  if (robberMode) {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-50 p-4 pb-8 pointer-events-none">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-md mx-auto pointer-events-auto"
        >
          <div className="bg-slate-900/90 backdrop-blur-xl border-t-4 border-red-500 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-8 h-10 bg-slate-900 rounded-t-full relative">
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 rounded-full"></div>
                </div>
              </div>
              
              {!pendingRobberHexId ? (
                <>
                  <h3 className="text-2xl font-black text-white">Move the Robber!</h3>
                  <p className="text-slate-400">Select a new hex on the board to place the robber.</p>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-black text-white">Steal Resource</h3>
                  <p className="text-slate-400">Select a player to steal from.</p>
                  
                  <div className="flex flex-col gap-2 mt-4">
                    {/* Find adjacent players to the pending hex */}
                    {(() => {
                      const adjacentPlayers = new Set<string>();
                      Object.values(vertices).forEach(v => {
                        if (v.building && v.id.includes(pendingRobberHexId)) {
                          if (v.building.ownerId !== activePlayerId) {
                            adjacentPlayers.add(v.building.ownerId);
                          }
                        }
                      });

                      const victims = Array.from(adjacentPlayers);

                      if (victims.length === 0) {
                        return (
                          <Button 
                            className="w-full h-12 text-lg font-bold bg-red-600 hover:bg-red-700"
                            onClick={() => confirmRobberMove()}
                          >
                            Place Robber (No one to steal from)
                          </Button>
                        );
                      }

                      return victims.map(vid => (
                        <Button 
                          key={vid}
                          className="w-full h-12 text-lg font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700"
                          onClick={() => confirmRobberMove(vid)}
                        >
                          Steal from {players[vid].name}
                        </Button>
                      ));
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const activeCard = CARDS[uiState.activeCarouselIndex];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none flex flex-col items-center">
      {/* Toggle Button */}
      <div className="pointer-events-auto mb-2">
        <Button 
          variant="secondary" 
          size="icon" 
          className="rounded-full shadow-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white w-12 h-12"
          onClick={toggleCarousel}
        >
          {uiState.isCarouselOpen ? <ChevronDown /> : <ChevronUp />}
        </Button>
      </div>

      {/* Carousel Container */}
      <AnimatePresence>
        {uiState.isCarouselOpen && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-md pointer-events-auto bg-slate-900/95 backdrop-blur-xl border-t border-x border-slate-700 rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ height: '40vh', minHeight: '300px' }}
          >
            {/* Header / Navigation Dots */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <activeCard.icon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-white tracking-tight">{activeCard.title}</h3>
              </div>
              <div className="flex gap-1.5">
                {CARDS.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-2 rounded-full transition-all duration-300 ${idx === uiState.activeCarouselIndex ? 'w-6 bg-primary' : 'w-2 bg-slate-700'}`}
                  />
                ))}
              </div>
            </div>

            {/* Swipeable Content Area */}
            <motion.div 
              ref={constraintsRef}
              className="flex-1 relative overflow-hidden touch-pan-y"
            >
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 w-full h-full flex items-center justify-center p-4"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={uiState.activeCarouselIndex}
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                  >
                    {/* Card Content Switcher */}
                    {uiState.activeCarouselIndex === 0 && <ResourcesCard player={activePlayer} />}
                    {uiState.activeCarouselIndex === 1 && <BuildCard phase={phase} />}
                    {uiState.activeCarouselIndex === 2 && <BankTradeCard />}
                    {uiState.activeCarouselIndex === 3 && <PlayerTradeCard />}
                    {uiState.activeCarouselIndex === 4 && <DevCardsCard />}
                    {uiState.activeCarouselIndex === 5 && <StatsCard player={activePlayer} />}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Card Components ---

function ResourcesCard({ player }: { player: any }) {
  const res = [
    { name: 'Wood', count: player.resources.WOOD, color: 'bg-green-600' },
    { name: 'Brick', count: player.resources.BRICK, color: 'bg-orange-600' },
    { name: 'Sheep', count: player.resources.SHEEP, color: 'bg-lime-500' },
    { name: 'Wheat', count: player.resources.WHEAT, color: 'bg-yellow-500' },
    { name: 'Ore', count: player.resources.ORE, color: 'bg-slate-500' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 h-full content-center">
      {res.map(r => (
        <div key={r.name} className="flex flex-col items-center justify-center bg-slate-800/50 rounded-2xl p-3 border border-slate-700/50">
          <div className={`w-10 h-10 rounded-full ${r.color} flex items-center justify-center mb-2 shadow-inner`}>
            <span className="text-white font-bold text-lg">{r.count}</span>
          </div>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{r.name}</span>
        </div>
      ))}
    </div>
  );
}

function BuildCard({ phase }: { phase: LifecyclePhase }) {
  const canBuild = phase === LifecyclePhase.TRADING_BUILDING || phase === LifecyclePhase.SETUP_1 || phase === LifecyclePhase.SETUP_2;
  const { buildMode, setBuildMode, pendingBuild, confirmBuild } = useCatanStore();
  
  if (pendingBuild) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <Hammer className="w-12 h-12 text-primary animate-bounce" />
        <div>
          <h4 className="text-white font-bold text-lg">Confirm Placement</h4>
          <p className="text-slate-400 text-sm">Place {pendingBuild.type.toLowerCase()} here?</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1 h-12 text-lg font-bold border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setBuildMode(null)}>Cancel</Button>
          <Button className="flex-1 h-12 text-lg font-bold bg-primary hover:bg-primary/90 text-white" onClick={confirmBuild}>Confirm</Button>
        </div>
      </div>
    );
  }

  if (buildMode) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <Hammer className="w-12 h-12 text-primary animate-pulse" />
        <div>
          <h4 className="text-white font-bold text-lg">Select Location</h4>
          <p className="text-slate-400 text-sm">Tap a highlighted spot on the board to place your {buildMode.toLowerCase()}.</p>
        </div>
        <Button variant="outline" className="w-full h-12 text-lg font-bold border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => setBuildMode(null)}>Cancel Build</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full justify-center">
      <Button disabled={!canBuild} onClick={() => setBuildMode('ROAD')} className="h-14 text-lg font-bold justify-start px-6 bg-slate-800 hover:bg-slate-700 border border-slate-700">
        <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center mr-4">R</div>
        Build Road <span className="ml-auto text-xs text-slate-400 font-normal">1W, 1B</span>
      </Button>
      <Button disabled={!canBuild} onClick={() => setBuildMode('SETTLEMENT')} className="h-14 text-lg font-bold justify-start px-6 bg-slate-800 hover:bg-slate-700 border border-slate-700">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-4">S</div>
        Build Settlement <span className="ml-auto text-xs text-slate-400 font-normal">1W, 1B, 1S, 1Wh</span>
      </Button>
      <Button disabled={!canBuild} onClick={() => setBuildMode('CITY')} className="h-14 text-lg font-bold justify-start px-6 bg-slate-800 hover:bg-slate-700 border border-slate-700">
        <div className="w-8 h-8 bg-slate-400 rounded flex items-center justify-center mr-4">C</div>
        Build City <span className="ml-auto text-xs text-slate-400 font-normal">2Wh, 3O</span>
      </Button>
    </div>
  );
}

function BankTradeCard() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
      <ArrowRightLeft className="w-12 h-12 text-slate-500" />
      <div>
        <h4 className="text-white font-bold text-lg">Bank Trade (4:1)</h4>
        <p className="text-slate-400 text-sm">Select 4 identical resources to trade for 1 of any resource.</p>
      </div>
      <Button className="w-full h-12 text-lg font-bold">Initiate Trade</Button>
    </div>
  );
}

function PlayerTradeCard() {
  const { activeTrade, updateTradeDraft, proposeTrade, cancelTrade, executeTrade, players, activePlayerId } = useCatanStore();
  const activePlayer = players[activePlayerId];

  // Initialize draft if none exists
  if (!activeTrade) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <ArrowRightLeft className="w-12 h-12 text-primary" />
        <div>
          <h4 className="text-white font-bold text-lg">Player Trade</h4>
          <p className="text-slate-400 text-sm">Propose a trade to other players.</p>
        </div>
        <Button 
          className="w-full h-12 text-lg font-bold"
          onClick={() => updateTradeDraft(
            { WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 },
            { WOOD: 0, BRICK: 0, SHEEP: 0, WHEAT: 0, ORE: 0 }
          )}
        >
          Create Offer
        </Button>
      </div>
    );
  }

  if (activeTrade.status === 'PROPOSED') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <ArrowRightLeft className="w-12 h-12 text-primary animate-pulse" />
        <div>
          <h4 className="text-white font-bold text-lg">Offer Sent</h4>
          <p className="text-slate-400 text-sm">Waiting for other players to respond...</p>
        </div>
        <Button variant="outline" className="w-full h-12 text-lg font-bold border-slate-700 text-slate-300" onClick={cancelTrade}>Cancel Offer</Button>
      </div>
    );
  }

  if (activeTrade.status === 'ACCEPTED') {
    const partner = players[activeTrade.partnerId!];
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
          <ArrowRightLeft className="w-8 h-8 text-green-500" />
        </div>
        <div>
          <h4 className="text-white font-bold text-lg">Trade Accepted!</h4>
          <p className="text-slate-400 text-sm">{partner.name} accepted your offer.</p>
        </div>
        <Button className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700" onClick={() => executeTrade(activeTrade.partnerId!)}>Execute Trade</Button>
      </div>
    );
  }

  if (activeTrade.status === 'REJECTED') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
          <ArrowRightLeft className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h4 className="text-white font-bold text-lg">Trade Rejected</h4>
          <p className="text-slate-400 text-sm">No players accepted your offer.</p>
        </div>
        <Button variant="outline" className="w-full h-12 text-lg font-bold border-slate-700 text-slate-300" onClick={cancelTrade}>Dismiss</Button>
      </div>
    );
  }

  // DRAFT STATE
  const resources = ['WOOD', 'BRICK', 'SHEEP', 'WHEAT', 'ORE'] as const;
  const colors: Record<string, string> = {
    WOOD: 'bg-green-600', BRICK: 'bg-orange-600', SHEEP: 'bg-lime-500', WHEAT: 'bg-yellow-500', ORE: 'bg-slate-500'
  };

  const handleAdjust = (type: 'give' | 'get', res: string, delta: number) => {
    const current = activeTrade[type][res as keyof typeof activeTrade.give];
    const newVal = Math.max(0, current + delta);
    
    // Check if player has enough to give
    if (type === 'give' && newVal > activePlayer.resources[res as keyof typeof activePlayer.resources]) {
      return;
    }

    updateTradeDraft(
      { ...activeTrade.give, [res]: type === 'give' ? newVal : activeTrade.give[res as keyof typeof activeTrade.give] },
      { ...activeTrade.get, [res]: type === 'get' ? newVal : activeTrade.get[res as keyof typeof activeTrade.get] }
    );
  };

  const totalGive = Object.values(activeTrade.give).reduce((a, b) => a + b, 0);
  const totalGet = Object.values(activeTrade.get).reduce((a, b) => a + b, 0);
  const isValidOffer = totalGive > 0 && totalGet > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-white font-bold">Trade Builder</h4>
        <button onClick={cancelTrade} className="text-xs text-slate-400 hover:text-white">Cancel</button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 text-xs font-bold text-slate-400 text-center mb-1">
          <div>YOU GIVE</div>
          <div className="w-8"></div>
          <div>YOU WANT</div>
        </div>
        
        {resources.map(res => (
          <div key={res} className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center bg-slate-800/50 p-1.5 rounded-lg border border-slate-700/50">
            {/* Give Column */}
            <div className="flex items-center justify-between bg-slate-900/50 rounded px-1">
              <button onClick={() => handleAdjust('give', res, -1)} className="w-6 h-6 text-slate-400 hover:text-white">-</button>
              <span className={`font-bold ${activeTrade.give[res] > 0 ? 'text-red-400' : 'text-slate-500'}`}>{activeTrade.give[res]}</span>
              <button onClick={() => handleAdjust('give', res, 1)} className="w-6 h-6 text-slate-400 hover:text-white">+</button>
            </div>
            
            {/* Resource Icon */}
            <div className={`w-8 h-8 rounded-full ${colors[res]} flex items-center justify-center shadow-inner text-[10px] font-black text-white`}>
              {res.substring(0, 2)}
            </div>
            
            {/* Get Column */}
            <div className="flex items-center justify-between bg-slate-900/50 rounded px-1">
              <button onClick={() => handleAdjust('get', res, -1)} className="w-6 h-6 text-slate-400 hover:text-white">-</button>
              <span className={`font-bold ${activeTrade.get[res] > 0 ? 'text-green-400' : 'text-slate-500'}`}>{activeTrade.get[res]}</span>
              <button onClick={() => handleAdjust('get', res, 1)} className="w-6 h-6 text-slate-400 hover:text-white">+</button>
            </div>
          </div>
        ))}
      </div>

      <Button 
        disabled={!isValidOffer} 
        onClick={proposeTrade}
        className="w-full h-12 mt-2 text-lg font-bold bg-primary hover:bg-primary/90"
      >
        Propose Trade
      </Button>
    </div>
  );
}

function DevCardsCard() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
      <Scroll className="w-12 h-12 text-purple-500" />
      <div>
        <h4 className="text-white font-bold text-lg">Development Cards</h4>
        <p className="text-slate-400 text-sm">You have no development cards.</p>
      </div>
      <Button className="w-full h-12 text-lg font-bold bg-purple-600 hover:bg-purple-700">Buy Card (1S, 1Wh, 1O)</Button>
    </div>
  );
}

function StatsCard({ player }: { player: any }) {
  return (
    <div className="flex flex-col justify-center h-full space-y-4">
      <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <span className="text-slate-300 font-bold">Victory Points</span>
        <span className="text-2xl font-black text-primary">{player.victoryPoints}</span>
      </div>
      <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <span className="text-slate-300 font-bold">Longest Road</span>
        <span className="text-xl font-bold text-white">0</span>
      </div>
      <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
        <span className="text-slate-300 font-bold">Largest Army</span>
        <span className="text-xl font-bold text-white">0</span>
      </div>
    </div>
  );
}
