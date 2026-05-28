// Catan Game Page - Enhanced UI Version
import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  Settings, 
  History, 
  Users, 
  MessageSquare, 
  Book, 
  ArrowRightLeft, 
  X, 
  Send, 
  Info,
  Clock,
  Zap,
  Shield,
  Target,
  Trophy,
  Dices
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CatanBoard3D } from './components/CatanBoard3D';
import { useCatanStore } from './store/catanStore';
import { LifecyclePhase, ResourceType } from './domain/types';
import { useCatanAI, AIPlayerConfig } from './ai/useCatanAI';
import { DiceRollButton } from '@/components/game/DiceRollButton';
import { AudioSystem } from './core/AudioSystem';
import { 
  GuidanceHUD, 
  HistoryLogWidget, 
  ResourceDashboard, 
  GameBottomBar, 
  PlayerTelepresenceOverlay,
  CarouselHUD,
  ActivePlayerRollOverlay,
  DesktopBuildConfirmOverlay,
  SetupPromptOverlay
} from './components/GameUI';

export default function CatanGamePage() {
  const navigate = useNavigate();
  const { 
    players, 
    activePlayerId, 
    phase, 
    setupPhase, 
    initializeGame, 
    turnOrder,
    diceResult,
    robberMode,
    currentTurnLog,
    rollDice,
    endTurn,
    bankInventory
  } = useCatanStore();

  const [showCatanSetup, setShowCatanSetup] = useState(true);
  const [playerCount, setPlayerCount] = useState(4);
  const [aiConfigs, setAiConfigs] = useState<AIPlayerConfig[]>([
    { id: 'p2', isAI: true, difficulty: 'Medium', role: 'Balanced' },
    { id: 'p3', isAI: true, difficulty: 'Medium', role: 'Balanced' },
    { id: 'p4', isAI: true, difficulty: 'Medium', role: 'Balanced' },
    { id: 'p5', isAI: true, difficulty: 'Medium', role: 'Balanced' },
    { id: 'p6', isAI: true, difficulty: 'Medium', role: 'Balanced' },
  ]);

  const activePlayer = players[activePlayerId];
  if (!activePlayer) return null;

  const handleStartGame = () => {
    initializeGame(playerCount, aiConfigs);
    setShowCatanSetup(false);
  };

  // Run AI logic for automated opponents
  useCatanAI(aiConfigs);

  return (
    <div className="h-[100dvh] w-full bg-slate-950 overflow-hidden relative text-white selection:bg-primary/20">
      <AnimatePresence>
        <ActivePlayerRollOverlay key="active-roll" />
        {phase === LifecyclePhase.LOBBY && showCatanSetup && (
          <motion.div 
            key="lobby-overlay"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/98 backdrop-blur-3xl z-50 flex items-center justify-center p-4 md:p-8 touch-none"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 md:p-10 max-w-[1000px] w-full grid grid-cols-1 lg:grid-cols-2 gap-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar relative z-10 transition-all duration-700">
              <div className="space-y-6">
                <div className="space-y-2 text-left relative">
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/30 mb-1">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Catan Universe</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-light text-white tracking-[0.1em] uppercase leading-tight">Ρυθμίσεις Λόμπι</h2>
                  <p className="text-[10px] text-slate-500 font-medium tracking-[0.2em] uppercase">Ξεκινήστε την αποικιοποίηση</p>
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-slate-950/40 rounded-3xl border border-white/5 space-y-4 shadow-sm backdrop-blur-sm">
                    <div className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-semibold flex items-center gap-2">
                       <div className="w-1 h-1 rounded-full bg-primary" />
                       Χρώμα Παικτη
                    </div>
                    <div className="flex flex-wrap gap-2 justify-start">
                      {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#ec4899', '#f97316', '#06b6d4'].map(c => (
                        <button 
                          key={c} 
                          onClick={() => useCatanStore.getState().updatePlayerColor('p1', c)} 
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-300 hover:scale-110 ${players['p1'].color === c ? 'border-white scale-110 shadow-lg shadow-white/10' : 'border-transparent opacity-50 hover:opacity-100'}`} 
                          style={{ backgroundColor: c }} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-5 bg-slate-950/40 rounded-3xl border border-white/5 space-y-4 shadow-sm backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                       <div className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-semibold flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-primary" />
                          Αριθμός Παικτών
                       </div>
                       <span className="text-primary font-bold text-[10px] bg-primary/10 px-3 py-1 rounded-full border border-primary/20 tracking-widest">{playerCount} ΠΑΙΚΤΕΣ</span>
                    </div>
                    <div className="flex gap-2">
                      {[3, 4, 5, 6].map(n => (
                        <button
                          key={n}
                          onClick={() => setPlayerCount(n)}
                          className={`flex-1 py-3 rounded-xl text-[11px] font-bold transition-all border ${playerCount === n ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10' : 'bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800'}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 relative hidden lg:block">
                  <Button 
                    onClick={handleStartGame}
                    className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold h-14 text-[11px] uppercase tracking-[0.3em] shadow-xl rounded-2xl transition-all active:scale-95 transition-colors"
                  >
                    ΕΝΑΡΞΗ ΠΑΙΧΝΙΔΙΟΥ
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                 <div className="bg-slate-950/40 rounded-[2rem] border border-white/5 p-6 shadow-sm flex flex-col flex-1 min-h-[400px] backdrop-blur-sm">
                    <div className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-semibold flex items-center gap-2 mb-4">
                      <div className="w-1 h-1 rounded-full bg-primary" />
                      Διαμόρφωση Αντιπάλων
                    </div>
                    <div className="space-y-3 mb-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                       {aiConfigs.slice(0, playerCount - 1).map((config, index) => (
                         <div key={config.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-900/20 rounded-2xl border border-white/5 hover:bg-slate-900/40 transition-colors gap-3">
                           <div className="flex items-center gap-4">
                              <div className="w-4 h-4 rounded-full shadow-sm ring-1 ring-white/10" style={{ backgroundColor: players[config.id]?.color || '#94a3b8' }} />
                              <div>
                                <p className="text-[11px] font-bold text-slate-100 uppercase tracking-tight">{config.isAI ? `AI ${index + 1}` : `ΠΑΙΚΤΗΣ ${index + 2}`}</p>
                                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest leading-none mt-1">
                                  {config.isAI ? 'MEDIUM / BALANCED' : 'ΤΟΠΙΚΟΣ ΠΑΙΚΤΗΣ'}
                                </p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2 shrink-0">
                               <button 
                                 onClick={() => {
                                   const next = [...aiConfigs];
                                   next[index].isAI = !next[index].isAI;
                                   setAiConfigs(next);
                                 }}
                                 className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors ${config.isAI ? 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'}`}
                               >
                                 {config.isAI ? 'BOT' : 'ΑΝΘΡΩΠΟΣ'}
                               </button>
                               {config.isAI && (
                                 <select 
                                   value={config.difficulty}
                                   onChange={(e) => {
                                     const next = [...aiConfigs];
                                     next[index].difficulty = e.target.value as any;
                                     setAiConfigs(next);
                                   }}
                                   className="bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-[9px] font-bold uppercase text-slate-300 outline-none focus:ring-1 ring-primary/30 h-[28px]"
                                 >
                                   <option value="Easy">EASY</option>
                                   <option value="Medium">MED</option>
                                   <option value="Hard">HARD</option>
                                 </select>
                               )}
                           </div>
                         </div>
                       ))}
                    </div>
                    
                    <div className="mt-auto lg:hidden">
                       <Button 
                        onClick={handleStartGame}
                        className="w-full bg-white text-slate-950 font-bold h-14 text-[11px] uppercase tracking-[0.3em] shadow-xl rounded-2xl"
                      >
                        ΕΝΑΡΞΗ ΠΑΙΧΝΙΔΙΟΥ
                      </Button>
                    </div>
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AudioSystem />

      {/* Layer 0: Background 3D Scene - Always fills the screen */}
      <div className="absolute inset-0 z-0 bg-slate-950">
        <CatanBoard3D />
      </div>

      {/* Layer 1: Global HUD Overlays - Floating UI */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Floating Header */}
        <div className="absolute top-0 inset-x-0 p-4 md:p-6 flex items-start justify-between">
           <div className="flex items-center gap-4 pointer-events-auto">
              <button 
                onClick={() => navigate('/games')}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/5 text-slate-400 hover:text-white transition-all hover:scale-110 active:scale-95 shadow-2xl"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div className="hidden sm:flex flex-col">
                <span className="text-[10px] font-medium text-primary leading-none uppercase tracking-[0.2em]">Catan</span>
                <span className="text-[8px] font-medium text-slate-500 leading-none uppercase tracking-[0.2em]">Universe</span>
              </div>
           </div>

           <div className="flex items-center gap-2 pointer-events-auto">
              <div className="bg-slate-900/40 backdrop-blur-xl h-8 md:h-10 px-4 rounded-xl flex items-center gap-2 border border-white/5 shadow-lg">
                 <Trophy className="w-3 h-3 text-primary" />
                 <span className="text-[10px] font-medium text-white tracking-widest">{activePlayer.victoryPoints} VP</span>
              </div>
              <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-slate-900/40 backdrop-blur-xl rounded-xl border border-white/5 text-slate-400 hover:text-white transition-all hover:scale-105">
                 <Settings className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Game HUDs */}
        <GuidanceHUD />
        <PlayerTelepresenceOverlay />
        
        <div className="hidden md:block">
           <HistoryLogWidget />
           <ResourceDashboard />
        </div>
      </div>

      {/* Layer 2: Mobile/Tablet Carousel HUD */}
      <div className="block">
        <CarouselHUD />
      </div>

      <SetupPromptOverlay />
      <DesktopBuildConfirmOverlay />

      {/* Layer 3: Main Action Bar - Bottom of the screen */}
      <div className="absolute inset-x-0 bottom-0 z-40 pointer-events-none">
        <GameBottomBar />
      </div>
    </div>
  );
}

function ChatPanel({ hideControls }: { hideControls?: boolean }) {
  const { chatMessages, addChatMessage, players } = useCatanStore();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      addChatMessage(message.trim(), 'p1');
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/20">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 text-slate-500 gap-2">
            <MessageSquare className="w-8 h-8" />
            <span className="text-[9px] font-medium uppercase tracking-[0.2em]">No messages yet</span>
          </div>
        ) : (
          chatMessages.map(msg => {
            const isMe = msg.playerId === 'p1';
            const author = players[msg.playerId];
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[8px] font-medium text-slate-500 mb-1 px-2 uppercase tracking-widest">{author?.name || msg.playerId}</span>
                <div className={`px-4 py-2 rounded-xl max-w-[85%] text-[11px] shadow-sm ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      {!hideControls && (
        <form onSubmit={handleSend} className="p-4 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Πες κάτι..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 text-[10px] text-white focus:outline-none focus:ring-1 ring-primary/30"
          />
          <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-10 w-10 shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      )}
    </div>
  );
}

function HistoryLog() {
  const { currentTurnLog, players } = useCatanStore();
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentTurnLog]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
      {currentTurnLog.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center opacity-20 text-slate-500 gap-2">
          <History className="w-8 h-8" />
          <span className="text-[9px] font-medium uppercase tracking-[0.2em]">Game History</span>
        </div>
      ) : (
        currentTurnLog.map((entry, idx) => {
          const player = players[entry.playerId];
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3 group"
            >
              <div className="w-px bg-slate-800 group-hover:bg-primary transition-colors" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-semibold uppercase tracking-tight" style={{ color: player?.color }}>{player?.name}</span>
                  <span className="text-[8px] text-slate-600 font-mono">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed font-normal">
                  {entry.action}
                  {entry.details && (
                    <span className="block mt-1 text-[9px] text-slate-500 italic bg-slate-900/50 p-2 rounded-lg border border-slate-800/50">
                       {entry.details}
                    </span>
                  )}
                </p>
              </div>
            </motion.div>
          );
        })
      )}
      <div ref={logEndRef} />
    </div>
  );
}

function GameGuideModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md" onClick={onClose}>
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-white/5 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-light text-white uppercase tracking-[0.2em] mb-6">Catan Survival Guide</h2>
        <div className="space-y-8 text-slate-300 text-xs leading-relaxed">
          <section className="space-y-3">
            <h3 className="font-semibold text-primary flex items-center gap-2 uppercase tracking-widest text-[10px]">
               <Zap className="w-3.5 h-3.5" /> Στόχος
            </h3>
            <p className="opacity-80">Γίνετε ο πρώτος παίκτης που θα συγκεντρώσει 10 Πόντους Νίκης (ΠΝ).</p>
          </section>
          <section className="space-y-4 border-t border-white/5 pt-6">
            <h3 className="font-semibold text-primary flex items-center gap-2 uppercase tracking-widest text-[10px]">
               <Shield className="w-3.5 h-3.5" /> Χτίσιμο & Κόστος
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                <p className="font-semibold text-white/90 mb-1 uppercase tracking-wider text-[9px]">Δρόμος</p>
                <p className="opacity-60">1 Ξύλο, 1 Τούβλο</p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                <p className="font-semibold text-white/90 mb-1 uppercase tracking-wider text-[9px]">Οικισμός</p>
                <p className="opacity-60">1 Ξύλο, 1 Τούβλο, 1 Πρόβατο, 1 Σιτάρι</p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                <p className="font-semibold text-white/90 mb-1 uppercase tracking-wider text-[9px]">Πόλη</p>
                <p className="opacity-60">2 Σιτάρι, 3 Μετάλλευμα</p>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                <p className="font-semibold text-white/90 mb-1 uppercase tracking-wider text-[9px]">Κάρτα Ανάπτυξης</p>
                <p className="opacity-60">1 Πρόβατο, 1 Σιτάρι, 1 Μετάλλευμα</p>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
}
