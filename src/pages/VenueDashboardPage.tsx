import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  Building2, 
  Monitor, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  Eye,
  Clock,
  Gamepad2,
  TrendingUp,
  DollarSign,
  UserCheck,
  Search,
  Save,
  Download,
  BookOpen,
  Library,
  History,
  Activity,
  SkipBack,
  SkipForward,
  FastForward,
  MessageSquare,
  Send,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Types
interface Table {
  id: string;
  name: string;
  status: 'available' | 'in-use' | 'maintenance' | 'reserved';
  currentGame: string | null;
  players: number;
  startTime: string | null;
  reservedBy: string | null;
  reservedUntil: string | null;
  recentActivity?: string[];
}

interface Reservation {
  id: string;
  tableId: string;
  tableName: string;
  customerName: string;
  customerEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  players: number;
  game: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes: string;
}

interface GameAction {
  id: string;
  timestamp: string;
  player: string;
  action: string;
  details: string;
}

interface GameSession {
  id: string;
  tableId: string;
  tableName: string;
  game: string;
  players: { name: string; type: 'local' | 'remote-pc' | 'remote-vr' }[];
  startTime: string;
  duration: number; // minutes
  status: 'active' | 'completed' | 'paused';
  actions?: GameAction[];
}

interface VenueStats {
  totalTables: number;
  activeTables: number;
  totalSessionsToday: number;
  totalPlayersToday: number;
  averageSessionDuration: number;
  remotePlayersPercent: number;
  revenueToday: number;
  popularGames: { name: string; sessions: number }[];
}

// Mock data
const mockTables: Table[] = [
  { id: '1', name: 'Table Alpha', status: 'in-use', currentGame: 'Settlers of Catan', players: 4, startTime: '14:30', reservedBy: null, reservedUntil: null, recentActivity: ['Alex rolled a 7', 'Sam built a settlement', 'Chris traded 2 sheep for 1 ore'] },
  { id: '2', name: 'Table Beta', status: 'available', currentGame: null, players: 0, startTime: null, reservedBy: null, reservedUntil: null, recentActivity: [] },
  { id: '3', name: 'Table Gamma', status: 'reserved', currentGame: null, players: 0, startTime: null, reservedBy: 'John D.', reservedUntil: '18:00', recentActivity: [] },
  { id: '4', name: 'Table Delta', status: 'in-use', currentGame: 'Ticket to Ride', players: 5, startTime: '13:00', reservedBy: null, reservedUntil: null, recentActivity: ['Morgan claimed route Atlanta-Miami', 'Taylor drew 2 train cards'] },
  { id: '5', name: 'Table Epsilon', status: 'maintenance', currentGame: null, players: 0, startTime: null, reservedBy: null, reservedUntil: null, recentActivity: [] },
];

const mockReservations: Reservation[] = [
  { id: '1', tableId: '3', tableName: 'Table Gamma', customerName: 'John Doe', customerEmail: 'john@example.com', date: '2024-01-15', startTime: '16:00', endTime: '20:00', players: 4, game: 'Settlers of Catan', status: 'confirmed', notes: 'Birthday party' },
  { id: '2', tableId: '1', tableName: 'Table Alpha', customerName: 'Jane Smith', customerEmail: 'jane@example.com', date: '2024-01-15', startTime: '20:00', endTime: '23:00', players: 5, game: 'Ticket to Ride', status: 'pending', notes: '' },
  { id: '3', tableId: '2', tableName: 'Table Beta', customerName: 'Bob Wilson', customerEmail: 'bob@example.com', date: '2024-01-16', startTime: '14:00', endTime: '18:00', players: 2, game: 'Carcassonne', status: 'confirmed', notes: 'First time players' },
];

const mockSessions: GameSession[] = [
  { 
    id: '1', 
    tableId: '1', 
    tableName: 'Table Alpha', 
    game: 'Settlers of Catan', 
    players: [{ name: 'Alex', type: 'local' }, { name: 'Sam', type: 'local' }, { name: 'Chris', type: 'remote-pc' }, { name: 'Jordan', type: 'remote-vr' }], 
    startTime: '14:30', 
    duration: 90, 
    status: 'active',
    actions: [
      { id: 'a1', timestamp: '14:30:00', player: 'System', action: 'Game Started', details: 'Initial placement phase' },
      { id: 'a2', timestamp: '14:35:12', player: 'Alex', action: 'Placed Settlement', details: 'Intersection (0, 1, -1)' },
      { id: 'a3', timestamp: '14:36:05', player: 'Sam', action: 'Placed Settlement', details: 'Intersection (1, 0, -1)' },
      { id: 'a4', timestamp: '14:40:22', player: 'Chris', action: 'Rolled Dice', details: 'Result: 7' },
      { id: 'a5', timestamp: '14:41:10', player: 'Chris', action: 'Moved Robber', details: 'Hex (0, 0, 0)' },
    ]
  },
  { 
    id: '2', 
    tableId: '4', 
    tableName: 'Table Delta', 
    game: 'Ticket to Ride', 
    players: [{ name: 'Morgan', type: 'local' }, { name: 'Taylor', type: 'local' }, { name: 'Casey', type: 'local' }, { name: 'Riley', type: 'remote-pc' }, { name: 'Drew', type: 'remote-vr' }], 
    startTime: '13:00', 
    duration: 180, 
    status: 'active',
    actions: [
      { id: 'b1', timestamp: '13:00:00', player: 'System', action: 'Game Started', details: 'Dealing initial cards' },
      { id: 'b2', timestamp: '13:05:30', player: 'Morgan', action: 'Claimed Route', details: 'Atlanta to Miami (5 trains)' },
    ]
  },
];

const mockStats: VenueStats = {
  totalTables: 5,
  activeTables: 2,
  totalSessionsToday: 8,
  totalPlayersToday: 32,
  averageSessionDuration: 145,
  remotePlayersPercent: 35,
  revenueToday: 480,
  popularGames: [
    { name: 'Settlers of Catan', sessions: 12 },
    { name: 'Ticket to Ride', sessions: 8 },
    { name: 'Carcassonne', sessions: 5 },
    { name: 'Pandemic', sessions: 3 },
  ],
};

const diceHistoryData = [
  { roll: '2', count: 4 },
  { roll: '3', count: 8 },
  { roll: '4', count: 15 },
  { roll: '5', count: 22 },
  { roll: '6', count: 30 },
  { roll: '7', count: 35 },
  { roll: '8', count: 28 },
  { roll: '9', count: 20 },
  { roll: '10', count: 12 },
  { roll: '11', count: 6 },
  { roll: '12', count: 2 },
];

const gameRules = [
  { id: 'catan', title: 'Settlers of Catan', category: 'Strategy', players: '3-4', time: '60-120 min', description: 'Players collect resources and use them to build roads, settlements and cities on their way to victory.' },
  { id: 'ttr', title: 'Ticket to Ride', category: 'Family', players: '2-5', time: '30-60 min', description: 'Players collect cards of various types of train cars they then use to claim railway routes in North America.' },
  { id: 'carcassonne', title: 'Carcassonne', category: 'Tile Placement', players: '2-5', time: '30-45 min', description: 'Players draw and place a tile with a piece of southern French landscape on it.' },
  { id: 'pandemic', title: 'Pandemic', category: 'Cooperative', players: '2-4', time: '45 min', description: 'Players must work together playing to their characters\' strengths to plan their strategy of eradication before the diseases overwhelm the world.' },
];

// Status badge component
function StatusBadge({ status }: { status: Table['status'] }) {
  const variants: Record<Table['status'], any> = {
    'available': 'secondary',
    'in-use': 'default',
    'reserved': 'outline',
    'maintenance': 'destructive',
  };
  
  const colors: Record<Table['status'], string> = {
    'available': 'bg-green-500/20 text-green-400 border-green-500/30',
    'in-use': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'reserved': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'maintenance': 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <Badge variant={variants[status]} className={colors[status]}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

// Table card component
function TableCard({ table, onViewSession }: { table: Table; onViewSession: (tableId: string) => void }) {
  const borderColors: Record<Table['status'], string> = {
    'available': 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]',
    'in-use': 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
    'reserved': 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]',
    'maintenance': 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
  };

  return (
    <Card className={`bg-slate-800/50 border-2 ${borderColors[table.status]} hover:brightness-125 transition-all cursor-pointer`} onClick={() => onViewSession(table.id)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Monitor className="h-5 w-5 text-purple-400" />
            {table.name}
          </CardTitle>
          <StatusBadge status={table.status} />
        </div>
      </CardHeader>
      <CardContent>
        {table.status === 'in-use' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Gamepad2 className="h-4 w-4" />
              {table.currentGame}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Users className="h-4 w-4" />
              {table.players} players
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Clock className="h-4 w-4" />
              Started at {table.startTime}
            </div>
          </div>
        )}
        
        {table.status === 'reserved' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <UserCheck className="h-4 w-4" />
              Reserved by {table.reservedBy}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Clock className="h-4 w-4" />
              Until {table.reservedUntil}
            </div>
          </div>
        )}
        
        {table.status === 'available' && (
          <div className="space-y-2">
            <p className="text-sm text-slate-400">Ready for new session</p>
          </div>
        )}
        
        {table.status === 'maintenance' && (
          <div className="space-y-2">
            <p className="text-sm text-red-400">Under maintenance</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Stats card component
function StatsCard({ title, value, icon: Icon, trend, trendUp }: { 
  title: string; 
  value: string | number; 
  icon: any;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {trend && (
              <p className={`text-xs ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
                {trendUp ? '↑' : '↓'} {trend}
              </p>
            )}
          </div>
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <Icon className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Session row component
function SessionRow({ session, onSave, onLoad, onReplay, onChat }: { session: GameSession, onSave: (id: string) => void, onLoad: (id: string) => void, onReplay: (id: string) => void, onChat: (id: string) => void }) {
  const localPlayers = session.players.filter(p => p.type === 'local').length;
  const remotePlayers = session.players.filter(p => p.type !== 'local').length;
  
  return (
    <tr className="border-b border-slate-700">
      <td className="py-3 px-4">{session.tableName}</td>
      <td className="py-3 px-4">{session.game}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-green-400">{localPlayers} local</span>
          <span className="text-slate-500">|</span>
          <span className="text-blue-400">{remotePlayers} remote</span>
        </div>
      </td>
      <td className="py-3 px-4">{session.startTime}</td>
      <td className="py-3 px-4">{session.duration} min</td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 text-xs rounded-full ${
          session.status === 'active' ? 'bg-green-500/20 text-green-400' :
          session.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-slate-500/20 text-slate-400'
        }`}>
          {session.status}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" title="Replay Session" onClick={() => onReplay(session.id)}>
            <Play className="h-4 w-4 text-purple-400" />
          </Button>
          {session.status === 'active' && (
            <Button size="sm" variant="ghost" title="Pause">
              <Pause className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm" variant="ghost" title="Save to Local Storage" onClick={() => onSave(session.id)}>
            <Save className="h-4 w-4 text-blue-400" />
          </Button>
          <Button size="sm" variant="ghost" title="Load from Local Storage" onClick={() => onLoad(session.id)}>
            <Download className="h-4 w-4 text-green-400" />
          </Button>
          <Button size="sm" variant="ghost" title="Chat" onClick={() => onChat(session.id)}>
            <MessageSquare className="h-4 w-4 text-orange-400" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Reservation row component
function ReservationRow({ reservation }: { reservation: Reservation }) {
  return (
    <tr className="border-b border-slate-700">
      <td className="py-3 px-4">{reservation.tableName}</td>
      <td className="py-3 px-4">{reservation.customerName}</td>
      <td className="py-3 px-4">{reservation.date}</td>
      <td className="py-3 px-4">{reservation.startTime} - {reservation.endTime}</td>
      <td className="py-3 px-4">{reservation.players}</td>
      <td className="py-3 px-4">{reservation.game}</td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 text-xs rounded-full ${
          reservation.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
          reservation.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-red-500/20 text-red-400'
        }`}>
          {reservation.status}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <Button size="sm" variant="ghost">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-red-400">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// Main Dashboard Component
export default function VenueDashboardPage() {
  const navigate = useNavigate();
  const [tables] = useState<Table[]>(mockTables);
  const [reservations] = useState<Reservation[]>(mockReservations);
  const [sessions, setSessions] = useState<GameSession[]>(mockSessions);
  const [stats] = useState<VenueStats>(mockStats);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedReplaySessionId, setSelectedReplaySessionId] = useState<string | null>(null);
  const [selectedChatSessionId, setSelectedChatSessionId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Replay state
  const [replayStep, setReplayStep] = useState(0);
  const [isPlayingReplay, setIsPlayingReplay] = useState(false);

  const filteredRules = gameRules.filter(rule => 
    rule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveSession = (id: string) => {
    const sessionToSave = sessions.find(s => s.id === id);
    if (sessionToSave) {
      localStorage.setItem(`game_session_${id}`, JSON.stringify(sessionToSave));
      toast.success(`Session ${id} saved to local storage!`);
    }
  };

  const handleLoadSession = (id: string) => {
    const savedSession = localStorage.getItem(`game_session_${id}`);
    if (savedSession) {
      const parsedSession = JSON.parse(savedSession);
      setSessions(prev => prev.map(s => s.id === id ? parsedSession : s));
      toast.success(`Session ${id} loaded from local storage!`);
    } else {
      toast.error(`No saved data found for session ${id}.`);
    }
  };

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const selectedReplaySession = sessions.find(s => s.id === selectedReplaySessionId);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingReplay && selectedReplaySession && selectedReplaySession.actions) {
      interval = setInterval(() => {
        setReplayStep(prev => {
          if (prev >= (selectedReplaySession.actions?.length || 0) - 1) {
            setIsPlayingReplay(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlayingReplay, selectedReplaySession]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white" onClick={() => navigate(-1)}>
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Building2 className="h-8 w-8 text-purple-400 shrink-0" />
              <div>
                <h1 className="text-xl font-bold text-white">TableForge Board Games</h1>
                <p className="text-sm text-slate-400">Board Game Platform Management</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => window.location.href = '/'}>
                <Library className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Game Library</span>
                <span className="xs:hidden">Library</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Settings</span>
              </Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex-1 sm:flex-none" onClick={() => setIsReservationDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">New Reservation</span>
                <span className="xs:hidden">New</span>
              </Button>
              <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle>New Reservation</DialogTitle>
                    <DialogDescription>
                      Create a new table reservation for a customer.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Customer Name</Label>
                        <Input placeholder="John Doe" className="bg-slate-700 border-slate-600" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="john@example.com" className="bg-slate-700 border-slate-600" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Table</Label>
                        <Select>
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue placeholder="Select table" />
                          </SelectTrigger>
                          <SelectContent>
                            {tables.filter(t => t.status === 'available').map(table => (
                              <SelectItem key={table.id} value={table.id}>{table.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Game</Label>
                        <Select>
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue placeholder="Select game" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="catan">Settlers of Catan</SelectItem>
                            <SelectItem value="ttr">Ticket to Ride</SelectItem>
                            <SelectItem value="carcassonne">Carcassonne</SelectItem>
                            <SelectItem value="pandemic">Pandemic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input type="date" className="bg-slate-700 border-slate-600" />
                      </div>
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input type="time" className="bg-slate-700 border-slate-600" />
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Input type="time" className="bg-slate-700 border-slate-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Number of Players</Label>
                      <Input type="number" min="2" max="10" defaultValue="4" className="bg-slate-700 border-slate-600" />
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setIsReservationDialogOpen(false)}>
                      Create Reservation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard 
            title="Active Tables" 
            value={`${stats.activeTables}/${stats.totalTables}`}
            icon={Monitor}
            trend="2 more than yesterday"
            trendUp={true}
          />
          <StatsCard 
            title="Sessions Today" 
            value={stats.totalSessionsToday}
            icon={Gamepad2}
            trend="+25% vs last week"
            trendUp={true}
          />
          <StatsCard 
            title="Players Today" 
            value={stats.totalPlayersToday}
            icon={Users}
            trend={`${stats.remotePlayersPercent}% remote`}
            trendUp={true}
          />
          <StatsCard 
            title="Revenue Today" 
            value={`€${stats.revenueToday}`}
            icon={DollarSign}
            trend="+12% vs yesterday"
            trendUp={true}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tables" className="space-y-4">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <TabsList className="bg-slate-800 border-slate-700 inline-flex w-auto min-w-full sm:w-full">
              <TabsTrigger value="tables" className="data-[state=active]:bg-purple-600 whitespace-nowrap">
                <Monitor className="h-4 w-4 mr-2" />
                Tables
              </TabsTrigger>
              <TabsTrigger value="sessions" className="data-[state=active]:bg-purple-600 whitespace-nowrap">
                <Play className="h-4 w-4 mr-2" />
                Active Sessions
              </TabsTrigger>
              <TabsTrigger value="reservations" className="data-[state=active]:bg-purple-600 whitespace-nowrap">
                <Calendar className="h-4 w-4 mr-2" />
                Reservations
              </TabsTrigger>
              <TabsTrigger value="rules" className="data-[state=active]:bg-purple-600 whitespace-nowrap">
                <BookOpen className="h-4 w-4 mr-2" />
                Rules Reference
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 whitespace-nowrap">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tables Tab */}
          <TabsContent value="tables">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.map(table => (
                <TableCard 
                  key={table.id} 
                  table={table} 
                  onViewSession={setSelectedTableId}
                />
              ))}
              <Card className="bg-slate-800/30 border-slate-700 border-dashed flex items-center justify-center min-h-[200px] cursor-pointer hover:bg-slate-800/50 transition-colors">
                <div className="text-center">
                  <Plus className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">Add New Table</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Active Game Sessions</CardTitle>
                <CardDescription>Monitor and manage ongoing games</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Mobile Card View */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {sessions.map(session => (
                    <Card key={session.id} className="bg-slate-900 border-slate-800">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white">{session.tableName}</h4>
                            <p className="text-xs text-slate-400">{session.game}</p>
                          </div>
                          <Badge className={
                            session.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            session.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-slate-500/20 text-slate-400'
                          }>
                            {session.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-slate-500">Players:</div>
                          <div className="text-slate-300">{session.players.length} ({session.players.filter(p => p.type === 'local').length}L / {session.players.filter(p => p.type !== 'local').length}R)</div>
                          <div className="text-slate-500">Started:</div>
                          <div className="text-slate-300">{session.startTime}</div>
                          <div className="text-slate-500">Duration:</div>
                          <div className="text-slate-300">{session.duration} min</div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSaveSession(session.id)}>
                            <Save className="h-4 w-4 mr-2" /> Save
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleLoadSession(session.id)}>
                            <Download className="h-4 w-4 mr-2" /> Load
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelectedChatSessionId(session.id)}>
                            <MessageSquare className="h-4 w-4 mr-2" /> Chat
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                        <th className="py-3 px-4">Table</th>
                        <th className="py-3 px-4">Game</th>
                        <th className="py-3 px-4">Players</th>
                        <th className="py-3 px-4">Started</th>
                        <th className="py-3 px-4">Duration</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {sessions.map(session => (
                        <SessionRow 
                          key={session.id} 
                          session={session} 
                          onSave={handleSaveSession}
                          onLoad={handleLoadSession}
                          onReplay={(id) => {
                            setSelectedReplaySessionId(id);
                            setReplayStep(0);
                            setIsPlayingReplay(false);
                          }}
                          onChat={setSelectedChatSessionId}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Reservations</CardTitle>
                    <CardDescription>Upcoming and pending reservations</CardDescription>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto" onClick={() => setIsReservationDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Reservation
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Mobile Card View */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                  {reservations.map(reservation => (
                    <Card key={reservation.id} className="bg-slate-900 border-slate-800">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-white">{reservation.customerName}</h4>
                            <p className="text-xs text-slate-400">{reservation.tableName} • {reservation.game}</p>
                          </div>
                          <Badge className={
                            reservation.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                            reservation.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {reservation.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-slate-500">Date:</div>
                          <div className="text-slate-300">{reservation.date}</div>
                          <div className="text-slate-500">Time:</div>
                          <div className="text-slate-300">{reservation.startTime} - {reservation.endTime}</div>
                          <div className="text-slate-500">Players:</div>
                          <div className="text-slate-300">{reservation.players}</div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-slate-800">
                          <Button size="sm" variant="ghost" className="flex-1">
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="flex-1 text-red-400">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                        <th className="py-3 px-4">Table</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Time</th>
                        <th className="py-3 px-4">Players</th>
                        <th className="py-3 px-4">Game</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {reservations.map(reservation => (
                        <ReservationRow key={reservation.id} reservation={reservation} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules Reference Tab */}
          <TabsContent value="rules">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle>Rules Reference</CardTitle>
                <CardDescription>Search and view rules for all available games</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search games or categories..." 
                    className="pl-10 bg-slate-900 border-slate-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRules.map(rule => (
                    <Card key={rule.id} className="bg-slate-900 border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-white">{rule.title}</h3>
                          <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                            {rule.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{rule.description}</p>
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {rule.players}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {rule.time}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredRules.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-slate-500">
                      No rules found matching your search.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dice History Chart */}
              <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    Global Dice Roll History
                  </CardTitle>
                  <CardDescription>Distribution of dice rolls across all active sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={diceHistoryData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                        <XAxis dataKey="roll" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                        <Tooltip 
                          cursor={{ fill: '#334155', opacity: 0.4 }}
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        />
                        <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Games */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    Popular Games
                  </CardTitle>
                  <CardDescription>Most played games this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.popularGames.map((game, i) => (
                      <div key={game.name} className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-slate-500 w-8">#{i + 1}</span>
                        <div className="flex-1">
                          <p className="font-medium text-white">{game.name}</p>
                          <Progress value={(game.sessions / stats.popularGames[0].sessions) * 100} className="h-2 mt-1" />
                        </div>
                        <span className="text-sm text-slate-400">{game.sessions} sessions</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Session Stats */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    Session Statistics
                  </CardTitle>
                  <CardDescription>Key metrics for your venue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Average Session Duration</span>
                        <span className="text-white font-medium">{stats.averageSessionDuration} min</span>
                      </div>
                      <Progress value={72} className="h-3" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Remote Players</span>
                        <span className="text-white font-medium">{stats.remotePlayersPercent}%</span>
                      </div>
                      <Progress value={stats.remotePlayersPercent} className="h-3" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Table Utilization</span>
                        <span className="text-white font-medium">{Math.round((stats.activeTables / stats.totalTables) * 100)}%</span>
                      </div>
                      <Progress value={(stats.activeTables / stats.totalTables) * 100} className="h-3" />
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                      <h4 className="text-sm font-medium text-slate-400 mb-3">Player Distribution</h4>
                      <div className="flex gap-4">
                        <div className="flex-1 text-center p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-2xl font-bold text-green-400">{Math.round(stats.totalPlayersToday * (1 - stats.remotePlayersPercent / 100))}</p>
                          <p className="text-xs text-slate-400">Local Players</p>
                        </div>
                        <div className="flex-1 text-center p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-400">{Math.round(stats.totalPlayersToday * (stats.remotePlayersPercent / 100) * 0.6)}</p>
                          <p className="text-xs text-slate-400">Remote PC</p>
                        </div>
                        <div className="flex-1 text-center p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-400">{Math.round(stats.totalPlayersToday * (stats.remotePlayersPercent / 100) * 0.4)}</p>
                          <p className="text-xs text-slate-400">Remote VR</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Table Details Sheet */}
      <Sheet open={!!selectedTableId} onOpenChange={(open) => !open && setSelectedTableId(null)}>
        <SheetContent className="bg-slate-900 border-slate-800 text-slate-200 sm:max-w-md overflow-y-auto">
          {selectedTable && (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <Monitor className="h-6 w-6 text-purple-400" />
                    {selectedTable.name}
                  </SheetTitle>
                  <StatusBadge status={selectedTable.status} />
                </div>
                <SheetDescription>
                  Detailed information and current status.
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {selectedTable.status === 'in-use' && (
                  <>
                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <Gamepad2 className="h-4 w-4 text-purple-400" />
                        Current Game
                      </h3>
                      <p className="text-lg text-slate-300">{selectedTable.currentGame}</p>
                      <div className="flex justify-between text-sm text-slate-400 pt-2 border-t border-slate-700">
                        <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {selectedTable.players} Players</span>
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Started {selectedTable.startTime}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <Activity className="h-4 w-4 text-purple-400" />
                        Recent Activity
                      </h3>
                      <div className="space-y-2">
                        {selectedTable.recentActivity && selectedTable.recentActivity.length > 0 ? (
                          selectedTable.recentActivity.map((activity, idx) => (
                            <div key={idx} className="p-3 bg-slate-800/30 rounded border border-slate-700/50 text-sm text-slate-300">
                              {activity}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500 italic">No recent activity recorded.</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {selectedTable.status === 'reserved' && (
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-3">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-yellow-400" />
                      Reservation Details
                    </h3>
                    <div className="space-y-2 text-sm text-slate-300">
                      <p><span className="text-slate-500">Reserved By:</span> {selectedTable.reservedBy}</p>
                      <p><span className="text-slate-500">Until:</span> {selectedTable.reservedUntil}</p>
                    </div>
                  </div>
                )}

                {selectedTable.status === 'available' && (
                  <div className="p-6 text-center bg-slate-800/30 rounded-lg border border-slate-700 border-dashed">
                    <Play className="h-12 w-12 text-green-400/50 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-white mb-1">Table is Available</h3>
                    <p className="text-sm text-slate-400 mb-4">Ready to host a new game session.</p>
                    <Button className="bg-green-600 hover:bg-green-700 w-full" onClick={() => navigate('/games')}>
                      Start New Session
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Replay System Dialog */}
      <Dialog open={!!selectedReplaySessionId} onOpenChange={(open) => {
        if (!open) {
          setSelectedReplaySessionId(null);
          setIsPlayingReplay(false);
        }
      }}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 max-w-3xl">
          {selectedReplaySession && selectedReplaySession.actions && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-400" />
                  Session Replay: {selectedReplaySession.tableName}
                </DialogTitle>
                <DialogDescription>
                  Reviewing game actions for {selectedReplaySession.game}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-6">
                {/* Replay Controls */}
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setReplayStep(0)}
                      disabled={replayStep === 0}
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setReplayStep(prev => Math.max(0, prev - 1))}
                      disabled={replayStep === 0}
                    >
                      <FastForward className="h-4 w-4 rotate-180" />
                    </Button>
                    <Button 
                      className={isPlayingReplay ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"}
                      onClick={() => setIsPlayingReplay(!isPlayingReplay)}
                    >
                      {isPlayingReplay ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isPlayingReplay ? 'Pause' : 'Play'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setReplayStep(prev => Math.min((selectedReplaySession.actions?.length || 1) - 1, prev + 1))}
                      disabled={replayStep === (selectedReplaySession.actions?.length || 1) - 1}
                    >
                      <FastForward className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setReplayStep((selectedReplaySession.actions?.length || 1) - 1)}
                      disabled={replayStep === (selectedReplaySession.actions?.length || 1) - 1}
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="text-sm font-mono text-slate-400">
                    Step {replayStep + 1} / {selectedReplaySession.actions.length}
                  </div>
                </div>

                {/* Progress Bar */}
                <Progress 
                  value={((replayStep + 1) / selectedReplaySession.actions.length) * 100} 
                  className="h-2 bg-slate-800"
                />

                {/* Action Log View */}
                <div className="h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {selectedReplaySession.actions.map((action, idx) => (
                    <div 
                      key={action.id}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        idx === replayStep 
                          ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                          : idx < replayStep
                            ? 'bg-slate-800/50 border-slate-700 opacity-70'
                            : 'bg-slate-900/50 border-slate-800 opacity-40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-slate-500">{action.timestamp}</span>
                        <Badge variant="outline" className={
                          action.player === 'System' ? 'text-yellow-400 border-yellow-400/30' : 'text-blue-400 border-blue-400/30'
                        }>
                          {action.player}
                        </Badge>
                      </div>
                      <p className="font-medium text-white">{action.action}</p>
                      <p className="text-sm text-slate-400">{action.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={!!selectedChatSessionId} onOpenChange={(open) => !open && setSelectedChatSessionId(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-400" />
              Session Chat
            </DialogTitle>
            <DialogDescription>
              In-game communication for session {selectedChatSessionId}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col h-[400px] mt-4">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 rounded-md border border-slate-800">
              {/* Mock Chat Messages */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">14:32 System</span>
                <div className="bg-slate-800 p-2 rounded-lg text-sm text-slate-300 self-start">
                  Game started. Good luck!
                </div>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-xs text-slate-500">14:35 You</span>
                <div className="bg-primary/20 border border-primary/30 p-2 rounded-lg text-sm text-white self-end">
                  Anyone want to trade sheep for wood?
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">14:36 Player 2</span>
                <div className="bg-slate-800 p-2 rounded-lg text-sm text-slate-300 self-start">
                  I have wood, but I need ore.
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Input 
                placeholder="Type a message..." 
                className="bg-slate-800 border-slate-700 text-white"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatMessage.trim()) {
                    toast.success('Message sent!');
                    setChatMessage('');
                  }
                }}
              />
              <Button 
                size="icon" 
                className="bg-orange-600 hover:bg-orange-700"
                onClick={() => {
                  if (chatMessage.trim()) {
                    toast.success('Message sent!');
                    setChatMessage('');
                  }
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
