import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dices, 
  History, 
  Package, 
  ChevronUp, 
  ChevronDown, 
  ArrowRightLeft, 
  MessageSquare, 
  Users, 
  Zap, 
  Target, 
  Shield,
  LayoutGrid,
  Info,
  Hammer,
  Send
} from 'lucide-react';
import { useCatanStore } from '../store/catanStore';
import { LifecyclePhase, ResourceType } from '../domain/types';
import { Button } from '@/components/ui/button';
import { DiceRollButton } from '@/components/game/DiceRollButton';

export function GuidanceHUD() {
  const { phase, setupPhase, activePlayerId, players } = useCatanStore();
  const activePlayer = players[activePlayerId];
  const isMyTurn = activePlayerId === 'p1';

  const getGuidance = () => {
    switch (phase) {
      case LifecyclePhase.LOBBY: return 'Περιμένουμε τους παίκτες στο λόμπι...';
      case LifecyclePhase.ROLLING: 
        if (setupPhase === 'DETERMINING_ORDER') {
          return isMyTurn ? 'Ρίξε τα ζάρια για τη σειρά σου!' : `Ο παίκτης ${activePlayer.name} καθορίζει σειρά...`;
        }
        return isMyTurn ? 'Είναι η σειρά σου! Ρίξε τα ζάρια.' : `Σειρά του ${activePlayer.name}: Ρίχνει ζάρια...`;
      case LifecyclePhase.TRADING_BUILDING: return isMyTurn ? 'Μπορείς να ανταλλάξεις πόρους ή να χτίσεις.' : `Σειρά του ${activePlayer.name}: Ανταλλάσσει/Χτίζει...`;
      case LifecyclePhase.ROBBER_MOVE: return isMyTurn ? 'Τοποθέτησε τον ληστή σε ένα εξάγωνο.' : `Ο ${activePlayer.name} μετακινεί τον ληστή...`;
      case LifecyclePhase.SETUP_1:
      case LifecyclePhase.SETUP_2: return isMyTurn ? 'Τοποθέτησε έναν οικισμό και έναν δρόμο.' : `Ο ${activePlayer.name} τοποθετεί οικισμό/δρόμο...`;
      default: return 'Catan Universe';
    }
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        key={phase + activePlayerId}
        className="bg-slate-900/90 backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-2xl shadow-2xl flex items-center gap-4 transition-all"
      >
        <div className="w-6 h-6 rounded-full flex items-center justify-center animate-pulse shadow-sm" style={{ backgroundColor: activePlayer?.color }}>
           <Info className="w-3 h-3 text-white" />
        </div>
        <p className="text-[10px] font-medium text-white uppercase tracking-[0.2em] whitespace-nowrap">
           {getGuidance()}
        </p>
      </motion.div>
    </div>
  );
}

export function HistoryLogWidget() {
  const { currentTurnLog, players } = useCatanStore();
  const [expanded, setExpanded] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded) logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentTurnLog, expanded]);

  return (
    <div className={`absolute top-20 right-6 z-30 transition-all duration-500 pointer-events-auto ${expanded ? 'h-[400px] w-80' : 'h-10 w-44'}`}>
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/5 rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden transition-all duration-500 ring-1 ring-white/10">
        <button 
          onClick={() => setExpanded(!expanded)}
          className="h-10 px-4 shrink-0 flex items-center justify-between hover:bg-white/5 transition-colors group"
        >
          <div className="flex items-center gap-2">
            <History className={`w-3.5 h-3.5 transition-transform ${expanded ? 'text-primary rotate-180' : 'text-slate-500 group-hover:text-white'}`} />
            <span className="text-[9px] font-medium text-white tracking-[0.2em] uppercase truncate">{expanded ? 'Ιστορικο Ενεργειων' : 'Ιστορικο'}</span>
          </div>
          {expanded ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
              {currentTurnLog.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-slate-500 gap-2">
                   <Zap className="w-6 h-6" />
                   <span className="text-[9px] font-black uppercase tracking-widest text-center">Καμία ενέργεια ακόμη</span>
                </div>
              ) : (
                currentTurnLog.map((entry, idx) => {
                  const player = players[entry.playerId];
                  return (
                    <div key={idx} className="flex gap-3 animate-in slide-in-from-right-4 duration-300">
                      <div className="w-0.5 rounded-full bg-slate-800 shrink-0" style={{ backgroundColor: player?.color + '40' }} />
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-tighter truncate" style={{ color: player?.color }}>{player?.name}</span>
                          <span className="text-[8px] text-slate-600 font-mono shrink-0">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed group-hover:text-white transition-colors">{entry.action}</p>
                        {entry.details && (
                          <div className="bg-slate-950/80 p-2 rounded-xl border border-white/5 text-[9px] text-slate-500 italic mt-1 leading-snug">
                            {entry.details}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={logEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ResourceDashboard() {
  const { players, bankInventory } = useCatanStore();
  const player = players['p1'];

  const resources = [
    { type: ResourceType.WOOD, name: 'Ξύλο', color: '#166534', icon: '🌲' },
    { type: ResourceType.BRICK, name: 'Τούβλο', color: '#991b1b', icon: '🧱' },
    { type: ResourceType.SHEEP, name: 'Πρόβατο', color: '#4d7c0f', icon: '🐑' },
    { type: ResourceType.WHEAT, name: 'Σιτάρι', color: '#ca8a04', icon: '🌾' },
    { type: ResourceType.ORE, name: 'Μετάλλευμα', color: '#334155', icon: '⛏️' }
  ];

  return (
    <div className="absolute top-20 left-6 z-30 pointer-events-auto">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-4 shadow-2xl flex flex-col gap-3 min-w-[120px] ring-1 ring-white/5">
        <div className="flex items-center gap-3 px-2 mb-1">
           <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shadow-inner">
              <Package className="w-3 h-3 text-slate-400" />
           </div>
           <div className="flex flex-col">
              <span className="text-[7px] font-medium text-slate-500 uppercase tracking-[0.2em]">Αποθήκη</span>
              <span className="text-[9px] font-semibold text-white uppercase tracking-tight">Πόροι</span>
           </div>
        </div>
        
        {resources.map((res) => (
          <div key={res.type} className="flex flex-col group">
             <div className="flex items-center justify-between px-2 py-1 rounded-lg transition-all hover:bg-white/5 relative overflow-hidden">
                <div className="flex items-center gap-2 relative z-10">
                   <span className="text-[10px] group-hover:scale-110 transition-transform">{res.icon}</span>
                   <span className="text-[9px] font-medium text-slate-400 group-hover:text-white transition-colors uppercase tracking-tight">{res.name}</span>
                </div>
                <div className="flex items-center gap-1.5 relative z-10">
                   <motion.span 
                      key={player.resources[res.type]}
                      initial={{ scale: 1.2, color: '#fff' }}
                      animate={{ scale: 1, color: '#0ea5e9' }}
                      className="text-[10px] font-semibold"
                   >
                     {player.resources[res.type]}
                   </motion.span>
                   <span className="text-[7px] font-bold text-slate-700">/</span>
                   <span className="text-[8px] font-semibold text-slate-600">{bankInventory[res.type]}</span>
                </div>
                <div className="absolute bottom-0 left-0 h-[100%] w-0 group-hover:w-full transition-all duration-700 bg-gradient-to-r from-white/5 to-transparent opacity-50" />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DesktopBuildConfirmOverlay() {
  const { pendingBuild, confirmBuild, setBuildMode } = useCatanStore();

  if (!pendingBuild) return null;

  return (
    <div className="absolute inset-x-0 bottom-40 z-[60] hidden md:flex items-center justify-center pointer-events-none">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-primary/30 p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 min-w-[300px]"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Hammer className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h4 className="text-white font-bold tracking-widest uppercase text-sm">Επιβεβαιωση</h4>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest">Τοποθετηση {pendingBuild.type === 'SETTLEMENT' ? 'Οικισμου' : pendingBuild.type === 'CITY' ? 'Πολης' : 'Δρομου'}</p>
          </div>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1 bg-slate-800/50 border-white/10 text-white" onClick={() => setBuildMode(null)}>Ακυρωση</Button>
          <Button className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" onClick={confirmBuild}>ΟΚ</Button>
        </div>
      </motion.div>
    </div>
  );
}

export function GameBottomBar() {
  const { phase, activePlayerId, rollDice, endTurn, diceResult, robberMode } = useCatanStore();
  const isMyTurn = activePlayerId === 'p1';

  return (
    <div className="h-24 md:h-28 border-t border-white/5 bg-slate-900/80 backdrop-blur-2xl px-6 flex items-center justify-center z-40 pointer-events-auto shrink-0 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.1),transparent_70%)]" />
      
      <div className="max-w-[1200px] w-full flex items-center justify-between gap-2 md:gap-6 relative z-10">
        <div className="flex items-center gap-1 md:gap-4 flex-1 justify-start">
           <ActionButton 
              icon={<Hammer />} 
              label="Χτίσιμο" 
              disabled={!isMyTurn || (phase !== LifecyclePhase.TRADING_BUILDING && phase !== LifecyclePhase.SETUP_1 && phase !== LifecyclePhase.SETUP_2)} 
              onClick={() => {
                const store = useCatanStore.getState();
                store.setCarouselIndex(1); // Build index
                if (!store.uiState.isCarouselOpen) store.toggleCarousel();
              }} 
           />
           <ActionButton 
              icon={<ArrowRightLeft />} 
              label="Ανταλλαγή" 
              disabled={!isMyTurn || phase !== LifecyclePhase.TRADING_BUILDING} 
              onClick={() => {
                const store = useCatanStore.getState();
                store.setCarouselIndex(2); // Trade index
                if (!store.uiState.isCarouselOpen) store.toggleCarousel();
              }} 
           />
           <ActionButton 
              icon={<LayoutGrid />} 
              label="Ανάπτυξη" 
              disabled={!isMyTurn || phase !== LifecyclePhase.TRADING_BUILDING}
              onClick={() => {
                const store = useCatanStore.getState();
                store.setCarouselIndex(4); // Dev cards index
                if (!store.uiState.isCarouselOpen) store.toggleCarousel();
              }} 
           />
        </div>

        <div className="flex items-center gap-6">
           <AnimatePresence mode="wait">
             {diceResult && (
               <motion.div 
                 key="dice-result"
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ opacity: 0, scale: 0.5 }}
                 className="flex gap-4"
               >
                  <DiceFace value={diceResult[0]} />
                  <DiceFace value={diceResult[1]} />
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end">
           <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
             <Button 
                onClick={endTurn}
                disabled={!isMyTurn || phase === LifecyclePhase.ROLLING || robberMode}
                className="bg-primary hover:bg-primary/90 border border-white/10 text-white font-medium px-6 md:px-10 h-12 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-20 disabled:grayscale ring-1 ring-white/10"
             >
                Τέλος Γύρου
             </Button>
           </motion.div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, disabled }: { icon: React.ReactNode, label: string, onClick?: () => void, disabled?: boolean }) {
  return (
    <motion.button
      whileHover={disabled ? {} : { y: -3, scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-300 w-20 md:w-24 relative group ${disabled ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:bg-white/5 cursor-pointer'}`}
    >
      <div className={`w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl transition-all duration-500 border ${disabled ? 'bg-slate-800 border-slate-700' : 'bg-slate-800/80 group-hover:bg-primary group-hover:text-white border-white/5 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] shadow-lg shadow-black/40 outline outline-0'}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { className: "w-4 h-4 md:w-5 md:h-5 transition-colors duration-500" })}
      </div>
      <span className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.1em] group-hover:text-white transition-colors">{label}</span>
      {!disabled && <div className="absolute top-0 left-0 w-full h-full bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />}
    </motion.button>
  );
}

function DiceFace({ value }: { value: number }) {
  return (
    <motion.div 
      initial={{ rotate: -20, scale: 0.5 }}
      animate={{ rotate: 0, scale: 1 }}
      className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-[0.75rem] shadow-2xl shadow-white/10 border-b-4 border-slate-300 flex items-center justify-center relative ring-1 ring-black/5"
    >
      <div className="grid grid-cols-3 grid-rows-3 w-8 h-8 md:w-10 md:h-10 gap-1.5 p-1">
        {value === 1 && <div className="col-start-2 row-start-2 w-full h-full bg-slate-900 rounded-full shadow-inner" />}
        {value === 2 && (
          <>
            <div className="col-start-1 row-start-1 w-full h-full bg-slate-900 rounded-full shadow-inner" />
            <div className="col-start-3 row-start-3 w-full h-full bg-slate-900 rounded-full shadow-inner" />
          </>
        )}
        {value === 3 && (
          <>
            <div className="col-start-1 row-start-1 w-full h-full bg-slate-900 rounded-full shadow-inner" />
            <div className="col-start-2 row-start-2 w-full h-full bg-slate-900 rounded-full shadow-inner" />
            <div className="col-start-3 row-start-3 w-full h-full bg-slate-900 rounded-full shadow-inner" />
          </>
        )}
        {value === 4 && (
          <>
            <div className="col-start-1 row-start-1 w-full h-full bg-slate-900 rounded-full shadow-inner" />
            <div className="col-start-3 row-start-1 w-full h-full bg-slate-900 rounded-full shadow-inner" />
            <div className="col-start-1 row-start-3 w-full h-full bg-slate-900 rounded-full shadow-inner" />
            <div className="col-start-3 row-start-3 w-full h-full bg-slate-900 rounded-full shadow-inner" />
          </>
        )}
        {value === 5 && (
          <>
            <div className="col-start-1 row-start-1 w-full h-full bg-slate-900 rounded-full shadow-inner" />
            <div className="col-start-3 row-start-1 w-full h-full bg-slate-900 rounded-full shadow-inner" />
            <div className="col-start-2 row-start-2 w-full h-full bg-slate-900 rounded-full shadow-inner" />
            <div className="col-start-1 row-start-3 w-full h-full bg-slate-900 rounded-full shadow-inner" />
            <div className="col-start-3 row-start-3 w-full h-full bg-slate-900 rounded-full shadow-inner" />
          </>
        )}
        {value === 6 && (
          <>
            <div className="col-start-1 row-start-1 w-full h-full bg-slate-900 rounded-full shadow-inner" />
            <div className="col-start-3 row-start-1 w-full h-full bg-slate-900 rounded-full shadow-inner" />
            <div className="col-start-1 row-start-2 w-full h-full bg-slate-900 rounded-full shadow-inner" />
            <div className="col-start-3 row-start-2 w-full h-full bg-slate-900 rounded-full shadow-inner" />
            <div className="col-start-1 row-start-3 w-full h-full bg-slate-900 rounded-full shadow-inner" />
            <div className="col-start-3 row-start-3 w-full h-full bg-slate-900 rounded-full shadow-inner" />
          </>
        )}
      </div>
    </motion.div>
  );
}

export function PlayerTelepresenceOverlay() {
  const { players, activePlayerId } = useCatanStore();
  
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
       {Object.values(players).map((player, idx) => {
          const positions = [
             'bottom-32 md:bottom-36 left-1/2 -translate-x-1/2', // You (P1)
             'top-28 md:top-32 left-4 md:left-12',
             'top-16 md:top-20 left-1/2 -translate-x-1/2',
             'top-28 md:top-32 right-4 md:right-12',
             'top-1/2 -translate-y-1/2 right-4 md:right-10',
             'top-1/2 -translate-y-1/2 left-4 md:left-10'
          ];
          const pos = positions[idx % positions.length];
          const isActive = player.id === activePlayerId;
          const isLocal = player.id === 'p1';

          return (
            <motion.div
              key={player.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute ${pos} flex flex-col items-center gap-2 pointer-events-auto`}
            >
               <div className="relative group">
                  <div 
                     className={`w-14 h-14 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden border-2 transition-all duration-500 shadow-2xl shadow-black/80 ${isActive ? 'scale-110 border-white ring-[6px] ring-primary/40' : 'border-slate-800/80 grayscale-[0.8] opacity-60 group-hover:opacity-100 group-hover:grayscale-0'}`}
                     style={{ backgroundColor: player.color + '30' }}
                  >
                     <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <Users className="w-8 h-8 text-white/20" />
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  </div>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="active-ping"
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full border-2 border-slate-950 flex items-center justify-center shadow-lg shadow-primary/40"
                    >
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    </motion.div>
                  )}

                  {isLocal && (
                    <div className="absolute -bottom-1 -right-1 bg-slate-900 border border-slate-800 rounded-lg px-1.5 py-0.5 text-[8px] font-black text-white uppercase tracking-widest shadow-xl ring-1 ring-white/10">YOU</div>
                  )}
               </div>

               <div className="bg-slate-900/90 backdrop-blur-xl border border-white/5 px-3 py-1.5 rounded-xl shadow-2xl flex flex-col items-center min-w-[90px] ring-1 ring-white/10">
                  <span className="text-[9px] font-semibold text-white uppercase tracking-[0.05em] whitespace-nowrap">{player.name}</span>
                  <div className="flex items-center gap-2 mt-0.5 opacity-80">
                     <span className="text-[8px] font-bold text-primary tracking-tighter">{player.victoryPoints} ΠΝ</span>
                     <div className="w-1 h-1 rounded-full bg-slate-700" />
                     <span className="text-[8px] font-medium text-slate-400 tracking-tighter">{Object.values(player.resources).reduce((a:any, b:any) => a+b, 0)} cards</span>
                  </div>
               </div>
            </motion.div>
          );
       })}
    </div>
  );
}

export function SetupPromptOverlay() {
  const { phase, setupPhase, activePlayerId, players, buildMode } = useCatanStore();
  
  if (phase !== LifecyclePhase.SETUP_1 && phase !== LifecyclePhase.SETUP_2) return null;

  const isMyTurn = activePlayerId === 'p1';
  const player = players[activePlayerId];

  return (
    <div className="absolute top-24 inset-x-0 z-40 flex justify-center pointer-events-none">
       <motion.div 
         initial={{ y: -50, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         className="bg-slate-900/80 backdrop-blur-md border px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border-primary/30"
       >
         <div className="w-4 h-4 rounded-full animate-pulse" style={{ backgroundColor: player.color }} />
         <div>
           <p className="text-white text-sm font-bold uppercase tracking-widest text-center">
             {isMyTurn ? 'Η ΣΕΙΡΑ ΣΟΥ!' : `ΠΑΙΖΕΙ: ${player.name}`}
           </p>
           <p className="text-primary text-xs font-semibold tracking-widest mt-1 text-center">
             {(phase === LifecyclePhase.SETUP_1 || phase === LifecyclePhase.SETUP_2) && (
               buildMode === 'SETTLEMENT' ? 'ΤΟΠΟΘΕΤΗΣΕ ΟΙΚΙΣΜΟ' : buildMode === 'ROAD' ? 'ΤΟΠΟΘΕΤΗΣΕ ΔΡΟΜΟ' : 'ΠΕΡΙΜΕΝΕ'
             )}
           </p>
         </div>
       </motion.div>
    </div>
  );
}

export function ManualOrderRollOverlay() {
  const { players, turnOrder, setupPhase, aiConfigs } = useCatanStore();
  const [results, setResults] = useState<Record<string, number>>({});
  const [rollingFor, setRollingFor] = useState<string | null>(null);

  const unrolledPlayers = turnOrder.filter(id => !results[id]);
  const activeRoller = unrolledPlayers.length > 0 ? unrolledPlayers[0] : null;
  const isDone = unrolledPlayers.length === 0;

  useEffect(() => {
    if (isDone) {
      const timeout = setTimeout(() => {
        useCatanStore.getState().submitAllSetupRolls(results);
      }, 1500); // Shorter wait time
      return () => clearTimeout(timeout);
    }
  }, [isDone, results]);

  useEffect(() => {
    if (!activeRoller) return;
    const isAI = (aiConfigs || []).find(c => c.id === activeRoller && c.isAI) || activeRoller !== 'p1';
    
    // Automatically roll for AI or non-local players
    if (isAI && !rollingFor) {
      setRollingFor(activeRoller);
      const tId = setTimeout(() => {
        setResults(prev => ({...prev, [activeRoller]: Math.floor(Math.random() * 11) + 2 + Math.random() * 0.1}));
        setRollingFor(null);
      }, 800);
      return () => clearTimeout(tId);
    }
  }, [activeRoller, aiConfigs, rollingFor]);

  const handleManualRoll = () => {
    if (!activeRoller || rollingFor) return;
    
    // Ensure we only click for p1
    if (activeRoller !== 'p1') return;

    setRollingFor(activeRoller);
    setTimeout(() => {
      setResults(prev => ({...prev, [activeRoller]: Math.floor(Math.random() * 11) + 2 + Math.random() * 0.1}));
      setRollingFor(null);
    }, 400);
  };

  if (setupPhase !== 'DETERMINING_ORDER') return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-[60] flex flex-col items-center justify-center p-4 md:p-8 pointer-events-auto cursor-pointer"
      onPointerDown={() => {
        if (!isDone && activeRoller === 'p1') {
          handleManualRoll();
        }
      }}
      onClick={() => {
        if (!isDone && activeRoller === 'p1') {
          handleManualRoll();
        }
      }}
      style={{ touchAction: 'manipulation' }}
    >
       <div className="max-w-4xl w-full flex flex-col items-center gap-12 pointer-events-auto relative z-10">
          <div className="text-center space-y-4">
             <motion.button 
               animate={rollingFor && !isDone ? { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] } : {}}
               transition={{ repeat: Infinity, duration: 1 }}
               disabled={!!rollingFor || isDone || activeRoller !== 'p1'}
               className={`inline-block border-2 p-8 rounded-[3rem] shadow-2xl transition-all outline-none select-none relative z-50 ${!rollingFor && !isDone && activeRoller === 'p1' ? 'bg-primary/20 border-primary/50 hover:bg-primary/30 cursor-pointer hover:scale-105 active:scale-95' : 'bg-primary/10 border-primary/30 grayscale opacity-50'}`}
             >
                <Dices className={`w-20 h-20 text-primary pointer-events-none ${rollingFor && !isDone ? 'animate-bounce' : ''}`} />
             </motion.button>
             <h2 className="text-2xl md:text-3xl font-light text-white tracking-[0.2em] uppercase leading-none">Καθορισμός Σειράς</h2>
             <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase pt-2 transition-all">
                {isDone ? 'Η σειρά καθορίστηκε' : 
                  activeRoller === 'p1' ? 'Η σειρά σου! Κάνε κλικ στο ζάρι για να ρίξεις!' :
                  `Ο Παίκτης ${players[activeRoller]?.name} ρίχνει τα ζάρια...`
                }
             </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 w-full pointer-events-auto relative z-10">
             {turnOrder.map((id, idx) => {
               const hasRolled = results[id] !== undefined;
               const isRollingNow = rollingFor === id;

               return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  onPointerDown={() => {
                    if (activeRoller === id && id === 'p1') {
                      handleManualRoll();
                    }
                  }}
                  onClick={() => {
                    if (activeRoller === id && id === 'p1') {
                      handleManualRoll();
                    }
                  }}
                  style={{ touchAction: 'manipulation' }}
                  className={`flex flex-col items-center gap-4 p-6 rounded-[2.5rem] border-2 transition-all duration-500 shadow-2xl relative overflow-hidden select-none ${!hasRolled ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-900 border-white/10 ring-2 ring-primary/20'} ${activeRoller === id && !hasRolled ? 'ring-2 ring-emerald-500/50 shadow-emerald-500/20 shadow-xl cursor-pointer hover:bg-slate-800/80' : ''}`}
                >
                   <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-xl shadow-inner relative z-10" style={{ backgroundColor: players[id].color }}>
                      {players[id].name.charAt(0)}
                   </div>
                   <div className="text-center relative z-10">
                      <p className="text-[11px] font-black text-white uppercase tracking-tighter truncate w-24">
                        {players[id].name}
                      </p>
                   </div>

                   <AnimatePresence mode="wait">
                      {isRollingNow ? (
                        <motion.div 
                           key="rolling"
                           animate={{ scale: [1, 1.1, 1] }} 
                           transition={{ repeat: Infinity, duration: 0.3 }}
                           className="flex gap-1 h-[36px] items-center"
                        >
                           <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse" />
                           <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse delay-75" />
                           <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse delay-150" />
                        </motion.div>
                      ) : hasRolled ? (
                        <motion.div 
                           key="result"
                           initial={{ scale: 0, opacity: 0, rotate: -45 }}
                           animate={{ scale: 1, opacity: 1, rotate: 0 }}
                           className="text-3xl font-light text-primary tracking-widest h-[36px] flex items-center"
                        >
                           {Math.floor(results[id])}
                        </motion.div>
                      ) : (
                        <div key="wait" className="h-[36px] flex items-center text-slate-600 text-[10px] uppercase font-bold tracking-widest">
                           Αναμονη
                        </div>
                      )}
                   </AnimatePresence>
                </motion.div>
               );
             })}
          </div>
       </div>
    </motion.div>
  );
}

export function CarouselHUD() {
  const [activeTab, setActiveTab] = useState<'resources' | 'history' | 'players' | 'chat'>('resources');
  
  const tabs = [
    { id: 'resources', icon: <Package />, label: 'Πόροι' },
    { id: 'history', icon: <History />, label: 'Ιστορικό' },
    { id: 'players', icon: <Users />, label: 'Παίκτες' },
    { id: 'chat', icon: <MessageSquare />, label: 'Chat' }
  ] as const;

  return (
    <div className="absolute bottom-32 left-4 right-4 z-30 pointer-events-none">
       <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden pointer-events-auto h-48 ring-1 ring-white/10">
          <div className="flex items-center gap-1 p-2 bg-slate-950/50">
             {tabs.map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all duration-300 ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' : 'text-slate-500 hover:text-white'}`}
               >
                 {React.cloneElement(tab.icon as React.ReactElement<any>, { className: "w-4 h-4" })}
                 <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-hidden relative">
             <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute inset-0 p-4 overflow-y-auto custom-scrollbar"
                >
                   {activeTab === 'resources' && <ResourceDashboardInCarousel />}
                   {activeTab === 'history' && <HistoryInCarousel />}
                   {activeTab === 'players' && <PlayersInCarousel />}
                   {activeTab === 'chat' && <ChatInCarousel />}
                </motion.div>
             </AnimatePresence>
          </div>
       </div>
    </div>
  );
}

function HistoryInCarousel() {
  const { currentTurnLog, players } = useCatanStore();
  return (
    <div className="space-y-3">
      {currentTurnLog.length === 0 ? (
        <div className="text-center py-8 text-[10px] text-slate-500 uppercase font-black">Κανένα συμβάν</div>
      ) : (
        currentTurnLog.slice(-10).map((entry, idx) => (
          <div key={idx} className="flex gap-2 text-[10px]">
            <span className="font-black whitespace-nowrap" style={{ color: players[entry.playerId]?.color }}>{players[entry.playerId]?.name}:</span>
            <span className="text-slate-300">{entry.action}</span>
          </div>
        ))
      )}
    </div>
  );
}

function PlayersInCarousel() {
  const { players, activePlayerId } = useCatanStore();
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.values(players).map(p => (
        <div key={p.id} className={`p-2 rounded-xl border ${p.id === activePlayerId ? 'bg-primary/20 border-primary/50' : 'bg-slate-950/50 border-white/5'}`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[10px] font-black text-white truncate">{p.name}</span>
          </div>
          <div className="flex gap-2 mt-1 opacity-60">
            <span className="text-[9px] font-bold text-primary">{p.victoryPoints} ΠΝ</span>
            <span className="text-[9px] font-bold text-slate-400">{Object.values(p.resources).reduce((a:any, b:any) => a+b, 0)} R</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatInCarousel() {
  const { chatMessages, addChatMessage } = useCatanStore();
  const [msg, setMsg] = useState('');
  
  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {chatMessages.slice(-5).map(m => (
          <div key={m.id} className="text-[10px]">
            <span className="font-black text-slate-500">{m.playerId}: </span>
            <span className="text-slate-200">{m.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-1 h-8">
        <input 
          value={msg} 
          onChange={e => setMsg(e.target.value)}
          className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-2 text-[10px] outline-none"
          placeholder="Πες κάτι..."
        />
        <Button size="icon" className="h-full aspect-square" onClick={() => { if(msg) { addChatMessage(msg); setMsg(''); } }}>
          <Send className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function ResourceDashboardInCarousel() {
  const { players } = useCatanStore();
  const player = players['p1'];
  
  const resources = [
    { type: ResourceType.WOOD, name: 'Ξύλο', icon: '🌲' },
    { type: ResourceType.BRICK, name: 'Τούβλο', icon: '🧱' },
    { type: ResourceType.SHEEP, name: 'Πρόβατο', icon: '🐑' },
    { type: ResourceType.WHEAT, name: 'Σιτάρι', icon: '🌾' },
    { type: ResourceType.ORE, name: 'Μετάλλευμα', icon: '⛏️' }
  ];

  return (
    <div className="grid grid-cols-5 gap-3">
       {resources.map(res => (
          <div key={res.type} className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl border border-white/5">
             <span className="text-xl">{res.icon}</span>
             <span className="text-sm font-black text-white">{player.resources[res.type]}</span>
             <span className="text-[8px] font-bold text-slate-500 uppercase truncate w-full text-center">{res.name}</span>
          </div>
       ))}
    </div>
  );
}

export function ActivePlayerRollOverlay() {
  const { phase, setupPhase, activePlayerId, rollDice } = useCatanStore();
  const isMyTurn = activePlayerId === 'p1';

  if (phase !== LifecyclePhase.ROLLING || !isMyTurn) return null;

  const btnText = setupPhase === 'DETERMINING_ORDER' ? 'Καθορισμος Σειρας' : 'Ριξε Ζαρια';

  return (
    <div className="absolute inset-x-0 bottom-40 z-50 flex items-center justify-center pointer-events-none">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        className="pointer-events-auto"
      >
        <button
          onClick={rollDice}
          className="group relative flex items-center gap-4 bg-primary text-white pl-6 pr-8 py-4 rounded-[2rem] shadow-[0_0_50px_rgba(14,165,233,0.4)] border border-white/20 hover:scale-105 active:scale-95 transition-all overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Dices className="w-8 h-8 group-hover:animate-bounce drop-shadow-md" />
          <span className="text-xl font-light uppercase tracking-[0.2em] whitespace-nowrap drop-shadow-sm">{btnText}</span>
        </button>
      </motion.div>
    </div>
  );
}
