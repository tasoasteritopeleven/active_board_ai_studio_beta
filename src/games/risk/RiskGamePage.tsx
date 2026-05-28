import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GameRoomProvider } from '@/components/multiplayer/GameRoomProvider';
import RiskBoard3D from './RiskBoard3D';
import { type GameState, type Territory, type Player } from './RiskEngine';
import { useRiskAI, AIPlayerConfig } from './ai/useRiskAI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sword, 
  Shield, 
  Users, 
  History, 
  Settings,
  ChevronLeft,
  MessageSquare,
  Menu,
  Plus,
  Minus,
  User,
  Zap,
  Crosshair,
  Check
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { DiceRollButton } from '@/components/game/DiceRollButton';
import { TableSessionBar } from '@/components/session/TableSessionBar';
import { VRSessionControls } from '@/components/xr/VRSessionControls';
import { useRiskGameActions } from './useRiskGameActions';
import { BoardGameTable } from '@/components/boardgame/BoardGameTable';

const AI_CONFIGS: AIPlayerConfig[] = [
  { id: 'p2', isAI: true, difficulty: 'Hard' },
];

const PLAYER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316'];
const PLAYER_NAMES = ['Διοικητής Άλφα', 'Στρατηγός Βήτα', 'Μάραρχος Γάμμα', 'Ναύαρχος Δέλτα', 'Λοχαγός Έψιλον', 'Ταγματάρχης Ζήτα'];

function generateInitialGameState(playerCount: number, baseTerritories: Territory[]): GameState {
  const players: Player[] = Array.from({ length: Math.min(6, Math.max(2, playerCount)) }, (_, i) => ({
    id: `p${i + 1}`,
    name: PLAYER_NAMES[i],
    color: PLAYER_COLORS[i],
    armiesToPlace: Math.max(20, 50 - playerCount * 5),
    isEliminated: false
  }));

  let territories = JSON.parse(JSON.stringify(baseTerritories)) as Territory[];
  territories.forEach(t => {
    t.ownerId = null;
    t.armies = 1;
  });

  const shuffledIds = territories.map(t => t.id).sort(() => Math.random() - 0.5);
  shuffledIds.forEach((id, index) => {
    const t = territories.find(x => x.id === id);
    if (t) {
      const p = players[index % players.length];
      t.ownerId = p.id;
      p.armiesToPlace--;
    }
  });

  players.forEach(p => {
    while (p.armiesToPlace > 0) {
      const myTerritories = territories.filter(t => t.ownerId === p.id);
      const randomT = myTerritories[Math.floor(Math.random() * myTerritories.length)];
      if (randomT) {
        randomT.armies++;
        p.armiesToPlace--;
      }
    }
    p.armiesToPlace = Math.max(3, Math.floor(territories.filter(t => t.ownerId === p.id).length / 3));
  });

  return {
    territories,
    players,
    currentPlayerId: players[0].id,
    phase: 'reinforce',
    turnNumber: 1,
    log: [`Το παιχνίδι ξεκίνησε με ${playerCount} παίκτες.`],
  };
}

function RiskGamePageInner() {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);

  // Mock Game State
  const [gameState, setGameState] = useState<GameState>({
    territories: [
      // North America
      { id: '1', name: 'Alaska', continent: 'north-america', ownerId: 'p1', armies: 3, position: { x: 50, y: 80 }, neighbors: ['2', '3', '32'] },
      { id: '2', name: 'NW Territory', continent: 'north-america', ownerId: 'p1', armies: 2, position: { x: 150, y: 80 }, neighbors: ['1', '3', '4', '38'] },
      { id: '3', name: 'Alberta', continent: 'north-america', ownerId: 'p2', armies: 5, position: { x: 120, y: 150 }, neighbors: ['1', '2', '4', '40'] },
      { id: '4', name: 'Ontario', continent: 'north-america', ownerId: 'p1', armies: 2, position: { x: 200, y: 150 }, neighbors: ['2', '3', '5', '6', '38', '40'] },
      { id: '5', name: 'Quebec', continent: 'north-america', ownerId: 'p1', armies: 1, position: { x: 280, y: 150 }, neighbors: ['4', '6', '38'] },
      { id: '6', name: 'Eastern US', continent: 'north-america', ownerId: 'p2', armies: 4, position: { x: 220, y: 220 }, neighbors: ['4', '5', '7', '40'] },
      { id: '40', name: 'Western US', continent: 'north-america', ownerId: 'p1', armies: 3, position: { x: 140, y: 220 }, neighbors: ['3', '4', '6', '7'] },
      { id: '7', name: 'Central America', continent: 'north-america', ownerId: 'p1', armies: 2, position: { x: 150, y: 280 }, neighbors: ['6', '8', '40'] },
      { id: '38', name: 'Greenland', continent: 'north-america', ownerId: 'p2', armies: 2, position: { x: 280, y: 50 }, neighbors: ['2', '4', '5', '12'] },
      
      // South America
      { id: '8', name: 'Venezuela', continent: 'south-america', ownerId: 'p1', armies: 2, position: { x: 200, y: 350 }, neighbors: ['7', '9', '10'] },
      { id: '9', name: 'Peru', continent: 'south-america', ownerId: 'p2', armies: 3, position: { x: 220, y: 420 }, neighbors: ['8', '10', '11'] },
      { id: '10', name: 'Brazil', continent: 'south-america', ownerId: 'p1', armies: 4, position: { x: 280, y: 400 }, neighbors: ['8', '9', '11', '20'] },
      { id: '11', name: 'Argentina', continent: 'south-america', ownerId: 'p1', armies: 2, position: { x: 240, y: 480 }, neighbors: ['9', '10'] },

      // Europe
      { id: '12', name: 'Iceland', continent: 'europe', ownerId: 'p2', armies: 3, position: { x: 350, y: 80 }, neighbors: ['13', '14', '38'] },
      { id: '13', name: 'Scandinavia', continent: 'europe', ownerId: 'p1', armies: 2, position: { x: 420, y: 80 }, neighbors: ['12', '14', '15', '41'] },
      { id: '14', name: 'Great Britain', continent: 'europe', ownerId: 'p2', armies: 4, position: { x: 350, y: 150 }, neighbors: ['12', '13', '15', '16'] },
      { id: '15', name: 'Northern Europe', continent: 'europe', ownerId: 'p1', armies: 3, position: { x: 420, y: 150 }, neighbors: ['13', '14', '16', '17', '41'] },
      { id: '16', name: 'Western Europe', continent: 'europe', ownerId: 'p2', armies: 2, position: { x: 380, y: 220 }, neighbors: ['14', '15', '17', '20'] },
      { id: '17', name: 'Southern Europe', continent: 'europe', ownerId: 'p1', armies: 5, position: { x: 450, y: 200 }, neighbors: ['15', '16', '20', '21', '26', '41'] },
      { id: '41', name: 'Ukraine', continent: 'europe', ownerId: 'p2', armies: 3, position: { x: 500, y: 120 }, neighbors: ['13', '15', '17', '26', '27', '30'] },

      // Africa
      { id: '20', name: 'North Africa', continent: 'africa', ownerId: 'p1', armies: 3, position: { x: 380, y: 350 }, neighbors: ['10', '16', '17', '21', '22'] },
      { id: '21', name: 'Egypt', continent: 'africa', ownerId: 'p2', armies: 2, position: { x: 450, y: 320 }, neighbors: ['17', '20', '22', '26'] },
      { id: '22', name: 'East Africa', continent: 'africa', ownerId: 'p1', armies: 1, position: { x: 480, y: 400 }, neighbors: ['20', '21', '23', '24', '26'] },
      { id: '23', name: 'Congo', continent: 'africa', ownerId: 'p2', armies: 2, position: { x: 420, y: 430 }, neighbors: ['20', '22', '24'] },
      { id: '24', name: 'South Africa', continent: 'africa', ownerId: 'p1', armies: 4, position: { x: 440, y: 480 }, neighbors: ['22', '23', '25'] },
      { id: '25', name: 'Madagascar', continent: 'africa', ownerId: 'p1', armies: 2, position: { x: 520, y: 480 }, neighbors: ['22', '24'] },

      // Asia
      { id: '26', name: 'Middle East', continent: 'asia', ownerId: 'p2', armies: 6, position: { x: 520, y: 300 }, neighbors: ['17', '21', '22', '27', '28', '41'] },
      { id: '27', name: 'Afghanistan', continent: 'asia', ownerId: 'p1', armies: 3, position: { x: 580, y: 200 }, neighbors: ['26', '28', '29', '30', '41'] },
      { id: '28', name: 'India', continent: 'asia', ownerId: 'p2', armies: 4, position: { x: 620, y: 320 }, neighbors: ['26', '27', '29', '39'] },
      { id: '29', name: 'China', continent: 'asia', ownerId: 'p1', armies: 5, position: { x: 680, y: 250 }, neighbors: ['27', '28', '30', '31', '39', '44'] },
      { id: '30', name: 'Ural', continent: 'asia', ownerId: 'p2', armies: 2, position: { x: 580, y: 100 }, neighbors: ['13', '15', '27', '29', '31', '41'] },
      { id: '31', name: 'Siberia', continent: 'asia', ownerId: 'p1', armies: 3, position: { x: 650, y: 80 }, neighbors: ['30', '29', '32', '42', '43', '44'] },
      { id: '42', name: 'Yakutsk', continent: 'asia', ownerId: 'p2', armies: 2, position: { x: 700, y: 50 }, neighbors: ['31', '32', '43'] },
      { id: '43', name: 'Irkutsk', continent: 'asia', ownerId: 'p1', armies: 3, position: { x: 700, y: 120 }, neighbors: ['31', '32', '42', '44'] },
      { id: '44', name: 'Mongolia', continent: 'asia', ownerId: 'p2', armies: 2, position: { x: 720, y: 180 }, neighbors: ['29', '31', '33', '43'] },
      { id: '32', name: 'Kamchatka', continent: 'asia', ownerId: 'p2', armies: 4, position: { x: 750, y: 80 }, neighbors: ['1', '31', '33', '42', '43'] },
      { id: '33', name: 'Japan', continent: 'asia', ownerId: 'p1', armies: 3, position: { x: 780, y: 180 }, neighbors: ['32', '29', '44'] },
      { id: '39', name: 'Siam', continent: 'asia', ownerId: 'p1', armies: 2, position: { x: 660, y: 350 }, neighbors: ['28', '29', '34'] },

      // Australia
      { id: '34', name: 'Indonesia', continent: 'australia', ownerId: 'p2', armies: 4, position: { x: 700, y: 400 }, neighbors: ['35', '36', '39'] },
      { id: '35', name: 'New Guinea', continent: 'australia', ownerId: 'p1', armies: 2, position: { x: 760, y: 380 }, neighbors: ['34', '36', '37'] },
      { id: '36', name: 'Western Australia', continent: 'australia', ownerId: 'p2', armies: 3, position: { x: 720, y: 480 }, neighbors: ['34', '35', '37'] },
      { id: '37', name: 'Eastern Australia', continent: 'australia', ownerId: 'p1', armies: 2, position: { x: 780, y: 460 }, neighbors: ['35', '36'] },
    ],
    players: [
      { id: 'p1', name: 'Commander Alpha', color: '#ef4444', armiesToPlace: 12, isEliminated: false },
      { id: 'p2', name: 'General Beta', color: '#3b82f6', armiesToPlace: 3, isEliminated: false },
      { id: 'p3', name: 'Marshal Gamma', color: '#22c55e', armiesToPlace: 3, isEliminated: false },
      { id: 'p4', name: 'Admiral Delta', color: '#eab308', armiesToPlace: 3, isEliminated: false },
      { id: 'p5', name: 'Captain Epsilon', color: '#a855f7', armiesToPlace: 3, isEliminated: false },
      { id: 'p6', name: 'Major Zeta', color: '#f97316', armiesToPlace: 3, isEliminated: false },
    ],
    currentPlayerId: 'p1',
    phase: 'reinforce',
    turnNumber: 5,
    log: ['Ο Διοικητής Άλφα επιτέθηκε στην Αλμπέρτα από την Αλάσκα', 'Ο Στρατηγός Βήτα ενίσχυσε τη ΒΔ Επικράτεια'],
  });

  const handleReinforce = useCallback((territoryId: string, amount: number) => {
    setGameState(prev => {
      const player = prev.players.find(p => p.id === prev.currentPlayerId);
      if (!player || player.armiesToPlace < amount) {
        toast.error("Δεν υπάρχουν αρκετά στρατεύματα!");
        return prev;
      }

      const territory = prev.territories.find(t => t.id === territoryId);
      if (!territory || territory.ownerId !== prev.currentPlayerId) {
        toast.error("Δεν σας ανήκει αυτή η περιοχή!");
        return prev;
      }

      const newTerritories = prev.territories.map(t => 
        t.id === territoryId ? { ...t, armies: t.armies + amount } : t
      );

      const newPlayers = prev.players.map(p => 
        p.id === prev.currentPlayerId ? { ...p, armiesToPlace: p.armiesToPlace - amount } : p
      );

      toast.success(`Αναπτύχθηκαν ${amount} στρατεύματα στο ${territory.name}`);

      return {
        ...prev,
        territories: newTerritories,
        players: newPlayers,
        log: [`Ο ${player.name} ανέπτυξε ${amount} στρατεύματα στο ${territory.name}`, ...prev.log]
      };
    });
  }, []);

  const { handleTerritoryClick, handleExecuteAttack, handleEndPhase } = useRiskGameActions(
    gameState,
    setGameState,
    selectedTerritory,
    setSelectedTerritory
  );

  useRiskAI(gameState, AI_CONFIGS, (action) => {
    console.log('AI Action:', action);
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
<header className="h-11 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="text-slate-400" onClick={() => navigate('/games')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest truncate max-w-[120px] sm:max-w-none">Risk</h1>
          <div className="hidden sm:flex bg-slate-800 rounded p-0.5 ml-2">
            {[2,3,4,5,6].map(num => (
                <button 
                  key={num}
                  onClick={() => setGameState(prev => generateInitialGameState(num, prev.territories))}
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${gameState.players.length === num ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {num}P
                </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Badge className="bg-primary/20 text-primary border-primary/20 uppercase text-[8px] sm:text-[10px]">
            {gameState.phase === 'reinforce' ? 'ΕΝΙΣΧΥΣΗ' : gameState.phase === 'attack' ? 'ΕΠΙΘΕΣΗ' : 'ΟΧΥΡΩΣΗ'}
          </Badge>
          <div className="flex -space-x-2">
            {gameState.players.map(p => (
              <div key={p.id} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-slate-900" style={{ backgroundColor: p.color }} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <VRSessionControls compact />
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger render={
              <Button variant="ghost" size="icon" className="text-slate-400">
                <Menu className="h-5 w-5" />
              </Button>
            } />
            <SheetContent side="right" className="w-80 p-0 bg-slate-900 border-slate-800">
              <RiskSidebarContent 
                gameState={gameState} 
                selectedTerritory={selectedTerritory} 
                onReinforce={handleReinforce}
                onAttack={handleExecuteAttack}
              />
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="icon" className="text-slate-400">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

            <BoardGameTable className="flex-1 relative">
        <div className="relative w-full h-full max-w-[96vw] max-h-full mx-auto risk-table-frame rounded-lg overflow-hidden border border-amber-950/50 shadow-2xl">
          <RiskBoard3D 
            gameState={gameState}
            selectedTerritory={selectedTerritory}
            onTerritoryClick={handleTerritoryClick}
            onReinforce={handleReinforce}
          />
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-3 pointer-events-none">
          <div className="pointer-events-auto">
            <TableSessionBar gameTitle="Risk Global Domination" playerCount={gameState.players.length} />
          </div>
        </div>

        <div className="hidden sm:block absolute top-4 left-4 z-20 space-y-3 pointer-events-none max-w-[240px]">
          <Card className="bg-board-paper/95 border-amber-900/40 text-amber-950 pointer-events-auto shadow-xl board-fold-shadow">
            <CardHeader className="p-3 pb-1">
              <CardTitle className="text-[10px] text-amber-800 uppercase tracking-widest font-bold">Τρέχων γύρος</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold border-2 border-amber-900/20" style={{ backgroundColor: gameState.players.find(p => p.id === gameState.currentPlayerId)?.color }}>
                  {gameState.players.find(p => p.id === gameState.currentPlayerId)?.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-950">{gameState.players.find(p => p.id === gameState.currentPlayerId)?.name}</p>
                  <p className="text-[9px] text-amber-800 font-bold uppercase">
                    {gameState.players.find(p => p.id === gameState.currentPlayerId)?.armiesToPlace} στρατιώτες
                  </p>
                </div>
              </div>
              {gameState.phase === 'reinforce' && (
                <Button 
                  className="w-full mt-3 bg-amber-800 hover:bg-amber-700 text-amber-50 font-bold text-xs h-9"
                  onClick={handleEndPhase}
                  disabled={(gameState.players.find(p => p.id === gameState.currentPlayerId)?.armiesToPlace || 0) > 0}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Τέλος τοποθέτησης
                </Button>
              )}
            </CardContent>
          </Card>

          <AnimatePresence>
            {selectedTerritory && (
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <Card className="bg-board-paper/95 border-amber-900/40 pointer-events-auto shadow-xl board-fold-shadow overflow-hidden">
                  <div className="h-1 bg-amber-700" />
                  <CardContent className="p-3 space-y-3 text-amber-950">
                    <div>
                      <h3 className="font-bold text-sm leading-tight">
                        {gameState.territories.find(t => t.id === selectedTerritory)?.name}
                      </h3>
                      <p className="text-[9px] uppercase text-amber-800/80 font-bold">
                        {gameState.territories.find(t => t.id === selectedTerritory)?.continent.replace('-', ' ')}
                      </p>
                    </div>
                    <p className="text-lg font-black">Στρατός: {gameState.territories.find(t => t.id === selectedTerritory)?.armies}</p>
                    {gameState.phase === 'attack' && (
                      <Button className="w-full bg-red-700 hover:bg-red-600 text-white font-bold" onClick={handleExecuteAttack} disabled={!gameState.attackingFrom}>
                        <Sword className="h-4 w-4 mr-1" /> Επίθεση
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 pointer-events-auto px-4 w-full max-w-lg">
          <div className="flex gap-2 justify-center">
            <Button variant="secondary" className="font-bold uppercase text-[10px] bg-board-paper text-amber-950 border-amber-900/30" onClick={handleEndPhase}>
              Επόμενη φάση
            </Button>
            {gameState.phase === 'attack' && (
              <Button className="font-bold uppercase text-[10px] bg-red-700" onClick={handleExecuteAttack}>
                <Sword className="h-3 w-3 mr-1" /> Επίθεση
              </Button>
            )}
          </div>
        </div>
      </BoardGameTable>
    </div>
  );
}


function RiskSidebarContent({ gameState, selectedTerritory, onReinforce, onAttack }: { gameState: GameState, selectedTerritory: string | null, onReinforce: (id: string, amount: number) => void, onAttack: () => void }) {
  const territory = gameState.territories.find(t => t.id === selectedTerritory);
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  
  return (
    <div className="flex flex-col h-full p-4 space-y-6">
      <div className="space-y-4">
        <h3 className="text-xs text-slate-500 uppercase tracking-widest font-bold">Τρεχων Γυρος</h3>
        <div className="flex items-center gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-lg" style={{ backgroundColor: currentPlayer?.color }}>
            {currentPlayer?.name[0]}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{currentPlayer?.name}</p>
            <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{currentPlayer?.armiesToPlace} Στρατεύματα για τοποθέτηση</p>
          </div>
        </div>
      </div>

      {selectedTerritory && territory && (
        <div className="space-y-4">
          <h3 className="text-xs text-slate-500 uppercase tracking-widest font-bold">Επιλεγμενη Περιοχη</h3>
          <Card className="bg-slate-950 border-slate-800 shadow-2xl overflow-hidden">
            <div className="h-1 w-full bg-primary" />
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">{territory.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                    {territory.continent.replace('-', ' ')}
                  </p>
                </div>
                <Badge variant="outline" className="border-slate-700 text-slate-500 font-mono">#{selectedTerritory}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/50">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Στρατος</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <p className="text-xl font-bold text-white">{territory.armies}</p>
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Κατοχος</p>
                  <p className="text-sm font-bold text-white truncate">
                    {gameState.players.find(p => p.id === territory.ownerId)?.name.split(' ')[1]}
                  </p>
                </div>
              </div>

              {gameState.phase === 'reinforce' && territory.ownerId === gameState.currentPlayerId && (
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest text-center">Αναπτυξη Στρατευματων</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      className="bg-slate-900 border-slate-800 hover:bg-primary/10 hover:border-primary/50 h-12 flex flex-col gap-1"
                      onClick={() => onReinforce(selectedTerritory, 1)}
                      disabled={(currentPlayer?.armiesToPlace || 0) < 1}
                    >
                      <User className="h-3 w-3" />
                      <span className="text-[10px] font-bold">+1</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-slate-900 border-slate-800 hover:bg-primary/10 hover:border-primary/50 h-12 flex flex-col gap-1"
                      onClick={() => onReinforce(selectedTerritory, 5)}
                      disabled={(currentPlayer?.armiesToPlace || 0) < 5}
                    >
                      <Zap className="h-3 w-3" />
                      <span className="text-[10px] font-bold">+5</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-slate-900 border-slate-800 hover:bg-primary/10 hover:border-primary/50 h-12 flex flex-col gap-1"
                      onClick={() => onReinforce(selectedTerritory, 10)}
                      disabled={(currentPlayer?.armiesToPlace || 0) < 10}
                    >
                      <Crosshair className="h-3 w-3" />
                      <span className="text-[10px] font-bold">+10</span>
                    </Button>
                  </div>
                </div>
              )}

              {gameState.phase === 'attack' && (
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 shadow-lg shadow-primary/20 uppercase tracking-widest"
                  onClick={onAttack}
                  disabled={!gameState.attackingFrom}
                >
                  <Sword className="h-4 w-4 mr-2" />
                  ΕΠΙΘΕΣΗ
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex-1">
        <h3 className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-4">Αρχειο Παιχνιδιου</h3>
        <div className="space-y-2 overflow-y-auto max-h-[30vh] pr-2 custom-scrollbar">
          {gameState.log.slice(-5).map((entry, i) => (
            <div key={i} className="text-[10px] text-slate-400 p-2 bg-slate-950/50 rounded border border-slate-800/50">
              {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default function RiskGamePage() {
  const [params] = useSearchParams();
  const room = params.get('room') ?? 'public';
  return (
    <GameRoomProvider roomId={`tableforge-risk-${room}`}>
      <RiskGamePageInner />
    </GameRoomProvider>
  );
}
