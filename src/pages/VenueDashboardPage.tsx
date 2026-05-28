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

  const mockTables: Table[] = [
    { id: '1', name: 'Τραπέζι Alpha', status: 'in-use', currentGame: 'Catan', players: 4, startTime: '14:30', reservedBy: null, reservedUntil: null, recentActivity: ['Ο Άλεξ έφερε 7', 'Ο Σαμ έχτισε οικισμό', 'Ο Κρις αντάλλαξε 2 πρόβατα για 1 μετάλλευμα'] },
    { id: '2', name: 'Τραπέζι Beta', status: 'available', currentGame: null, players: 0, startTime: null, reservedBy: null, reservedUntil: null, recentActivity: [] },
    { id: '3', name: 'Τραπέζι Gamma', status: 'reserved', currentGame: null, players: 0, startTime: null, reservedBy: 'John D.', reservedUntil: '18:00', recentActivity: [] },
    { id: '4', name: 'Τραπέζι Delta', status: 'in-use', currentGame: 'Ticket to Ride', players: 5, startTime: '13:00', reservedBy: null, reservedUntil: null, recentActivity: ['Ο Μόργκαν κατέλαβε τη διαδρομή Ατλάντα-Μαϊάμι', 'Ο Τέιλορ τράβηξε 2 κάρτες βαγονιών'] },
    { id: '5', name: 'Τραπέζι Epsilon', status: 'maintenance', currentGame: null, players: 0, startTime: null, reservedBy: null, reservedUntil: null, recentActivity: [] },
  ];
  
  const mockReservations: Reservation[] = [
    { id: '1', tableId: '3', tableName: 'Τραπέζι Gamma', customerName: 'John Doe', customerEmail: 'john@example.com', date: '2024-01-15', startTime: '16:00', endTime: '20:00', players: 4, game: 'Catan', status: 'confirmed', notes: 'Πάρτι γενεθλίων' },
    { id: '2', tableId: '1', tableName: 'Τραπέζι Alpha', customerName: 'Jane Smith', customerEmail: 'jane@example.com', date: '2024-01-15', startTime: '20:00', endTime: '23:00', players: 5, game: 'Ticket to Ride', status: 'pending', notes: '' },
    { id: '3', tableId: '2', tableName: 'Τραπέζι Beta', customerName: 'Bob Wilson', customerEmail: 'bob@example.com', date: '2024-01-16', startTime: '14:00', endTime: '18:00', players: 2, game: 'Carcassonne', status: 'confirmed', notes: 'Πρώτη φορά' },
  ];
  
  const mockSessions: GameSession[] = [
    { 
      id: '1', 
      tableId: '1', 
      tableName: 'Τραπέζι Alpha', 
      game: 'Catan', 
      players: [{ name: 'Alex', type: 'local' }, { name: 'Sam', type: 'local' }, { name: 'Chris', type: 'remote-pc' }, { name: 'Jordan', type: 'remote-vr' }], 
      startTime: '14:30', 
      duration: 90, 
      status: 'active',
      actions: [
        { id: 'a1', timestamp: '14:30:00', player: 'System', action: 'Έναρξη Παιχνιδιού', details: 'Φάση αρχικής τοποθέτησης' },
        { id: 'a2', timestamp: '14:35:12', player: 'Alex', action: 'Τοποθέτηση Οικισμού', details: 'Εντοπισμός (0, 1, -1)' },
        { id: 'a3', timestamp: '14:36:05', player: 'Sam', action: 'Τοποθέτηση Οικισμού', details: 'Εντοπισμός (1, 0, -1)' },
        { id: 'a4', timestamp: '14:40:22', player: 'Chris', action: 'Ρίψη Ζαριών', details: 'Αποτέλεσμα: 7' },
        { id: 'a5', timestamp: '14:41:10', player: 'Chris', action: 'Μετακίνηση Κλέφτη', details: 'Εξάγωνο (0, 0, 0)' },
      ]
    },
    { 
      id: '2', 
      tableId: '4', 
      tableName: 'Τραπέζι Delta', 
      game: 'Ticket to Ride', 
      players: [{ name: 'Morgan', type: 'local' }, { name: 'Taylor', type: 'local' }, { name: 'Casey', type: 'local' }, { name: 'Riley', type: 'remote-pc' }, { name: 'Drew', type: 'remote-vr' }], 
      startTime: '13:00', 
      duration: 180, 
      status: 'active',
      actions: [
        { id: 'b1', timestamp: '13:00:00', player: 'System', action: 'Έναρξη Παιχνιδιού', details: 'Μοίρασμα αρχικών καρτών' },
        { id: 'b2', timestamp: '13:05:30', player: 'Morgan', action: 'Κατάκτηση Διαδρομής', details: 'Ατλάντα προς Μαϊάμι (5 τρένα)' },
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
    { id: 'catan', title: 'Catan', category: 'Στρατηγική', players: '3-4', time: '60-120 λεπτά', description: 'Οι παίκτες συλλέγουν πόρους για να χτίσουν δρόμους, οικισμούς και πόλεις στο δρόμο προς τη νίκη.' },
    { id: 'ttr', title: 'Ticket to Ride', category: 'Οικογενειακό', players: '2-5', time: '30-60 λεπτά', description: 'Οι παίκτες συλλέγουν κάρτες τρένων και διεκδικούν σιδηροδρομικές διαδρομές.' },
    { id: 'carcassonne', title: 'Carcassonne', category: 'Τοποθέτηση Πλακιδίων', players: '2-5', time: '30-45 λεπτά', description: 'Οι παίκτες τοποθετούν πλακίδια για να δημιουργήσουν πόλεις, δρόμους, μοναστήρια και χωράφια.' },
    { id: 'pandemic', title: 'Pandemic', category: 'Συνεργατικό', players: '2-4', time: '45 λεπτά', description: 'Οι παίκτες συνεργάζονται για να εξαλείψουν μεταδοτικές ασθένειες.' },
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
  
    const statusText: Record<Table['status'], string> = {
      'available': 'Διαθέσιμο',
      'in-use': 'Σε Χρήση',
      'reserved': 'Κρατημένο',
      'maintenance': 'Συντήρηση',
    };
  
    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {statusText[status]}
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
                {table.players} Παίκτες
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Clock className="h-4 w-4" />
                Έναρξη στις {table.startTime}
              </div>
            </div>
          )}
          
          {table.status === 'reserved' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <UserCheck className="h-4 w-4" />
                Κράτηση: {table.reservedBy}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Clock className="h-4 w-4" />
                Μέχρι {table.reservedUntil}
              </div>
            </div>
          )}
          
          {table.status === 'available' && (
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Έτοιμο για νέα συνεδρία</p>
            </div>
          )}
          
          {table.status === 'maintenance' && (
            <div className="space-y-2">
              <p className="text-sm text-red-400">Υπό συντήρηση</p>
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
          <span className="text-green-400">{localPlayers} τοπικοί</span>
          <span className="text-slate-500">|</span>
          <span className="text-blue-400">{remotePlayers} απομακρυσμένοι</span>
        </div>
      </td>
      <td className="py-3 px-4">{session.startTime}</td>
      <td className="py-3 px-4">{session.duration} λεπτά</td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 text-xs rounded-full ${
          session.status === 'active' ? 'bg-green-500/20 text-green-400' :
          session.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
          'bg-slate-500/20 text-slate-400'
        }`}>
          {session.status === 'active' ? 'Ενεργή' : session.status === 'paused' ? 'Σε παύση' : 'Ολοκληρώθηκε'}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" title="Επανάληψη Συνεδρίας" onClick={() => onReplay(session.id)}>
            <Play className="h-4 w-4 text-purple-400" />
          </Button>
          {session.status === 'active' && (
            <Button size="sm" variant="ghost" title="Παύση">
              <Pause className="h-4 w-4" />
            </Button>
          )}
          <Button size="sm" variant="ghost" title="Αποθήκευση Τοπικά" onClick={() => onSave(session.id)}>
            <Save className="h-4 w-4 text-blue-400" />
          </Button>
          <Button size="sm" variant="ghost" title="Φόρτωση από Τοπικά" onClick={() => onLoad(session.id)}>
            <Download className="h-4 w-4 text-green-400" />
          </Button>
          <Button size="sm" variant="ghost" title="Συνομιλία" onClick={() => onChat(session.id)}>
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
          {reservation.status === 'confirmed' ? 'Επιβεβαιωμένη' : reservation.status === 'pending' ? 'Σε εκκρεμότητα' : 'Ακυρωμένη'}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" title="Επεξεργασία">
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-red-400" title="Διαγραφή">
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
  const [selectedRule, setSelectedRule] = useState<typeof gameRules[0] | null>(null);
  
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
                <p className="text-sm text-slate-400">Διαχείριση Πλατφόρμας Επιτραπέζιων Παιχνιδιών</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => window.location.href = '/'}>
                <Library className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Βιβλιοθήκη Παιχνιδιών</span>
                <span className="xs:hidden">Βιβλιοθήκη</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                <Settings className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Ρυθμίσεις</span>
              </Button>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex-1 sm:flex-none" onClick={() => setIsReservationDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Νέα Κράτηση</span>
                <span className="xs:hidden">Νέα</span>
              </Button>
              <Dialog open={isReservationDialogOpen} onOpenChange={setIsReservationDialogOpen}>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle>Νέα Κράτηση</DialogTitle>
                    <DialogDescription>
                      Δημιουργήστε μια νέα κράτηση τραπεζιού για έναν πελάτη.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Όνομα Πελάτη</Label>
                        <Input placeholder="John Doe" className="bg-slate-700 border-slate-600" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="john@example.com" className="bg-slate-700 border-slate-600" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Τραπέζι</Label>
                        <Select>
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue placeholder="Επιλογή Τραπεζιού" />
                          </SelectTrigger>
                          <SelectContent>
                            {tables.filter(t => t.status === 'available').map(table => (
                              <SelectItem key={table.id} value={table.id}>{table.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Παιχνίδι</Label>
                        <Select>
                          <SelectTrigger className="bg-slate-700 border-slate-600">
                            <SelectValue placeholder="Επιλογή Παιχνιδιού" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="catan">Catan</SelectItem>
                            <SelectItem value="ttr">Ticket to Ride</SelectItem>
                            <SelectItem value="carcassonne">Carcassonne</SelectItem>
                            <SelectItem value="pandemic">Pandemic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Ημερομηνία</Label>
                        <Input type="date" className="bg-slate-700 border-slate-600" />
                      </div>
                      <div className="space-y-2">
                        <Label>Ώρα Έναρξης</Label>
                        <Input type="time" className="bg-slate-700 border-slate-600" />
                      </div>
                      <div className="space-y-2">
                        <Label>Ώρα Λήξης</Label>
                        <Input type="time" className="bg-slate-700 border-slate-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Αριθμός Παίκτων</Label>
                      <Input type="number" min="2" max="10" defaultValue="4" className="bg-slate-700 border-slate-600" />
                    </div>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setIsReservationDialogOpen(false)}>
                      Δημιουργία Κράτησης
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
            title="Ενεργά Τραπέζια" 
            value={`${stats.activeTables}/${stats.totalTables}`}
            icon={Monitor}
            trend="2 περισσότερα από χθες"
            trendUp={true}
          />
          <StatsCard 
            title="Συνεδρίες Σήμερα" 
            value={stats.totalSessionsToday}
            icon={Gamepad2}
            trend="+25% έναντι προηγ. εβδομάδας"
            trendUp={true}
          />
          <StatsCard 
            title="Παίκτες Σήμερα" 
            value={stats.totalPlayersToday}
            icon={Users}
            trend={`${stats.remotePlayersPercent}% απομακρυσμένοι`}
            trendUp={true}
          />
          <StatsCard 
            title="Έσοδα Σήμερα" 
            value={`€${stats.revenueToday}`}
            icon={DollarSign}
            trend="+12% έναντι χθες"
            trendUp={true}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tables" className="space-y-4">
          <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <TabsList className="bg-slate-800 border-slate-700 inline-flex w-auto min-w-full sm:w-full">
              <TabsTrigger value="tables" className="data-[state=active]:bg-purple-600 whitespace-nowrap">
                <Monitor className="h-4 w-4 mr-2" />
                Τραπέζια
              </TabsTrigger>
              <TabsTrigger value="sessions" className="data-[state=active]:bg-purple-600 whitespace-nowrap">
                <Play className="h-4 w-4 mr-2" />
                Ενεργές Συνεδρίες
              </TabsTrigger>
              <TabsTrigger value="reservations" className="data-[state=active]:bg-purple-600 whitespace-nowrap">
                <Calendar className="h-4 w-4 mr-2" />
                Κρατήσεις
              </TabsTrigger>
              <TabsTrigger value="rules" className="data-[state=active]:bg-purple-600 whitespace-nowrap">
                <BookOpen className="h-4 w-4 mr-2" />
                Κανόνες Παιχνιδιών
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 whitespace-nowrap">
                <BarChart3 className="h-4 w-4 mr-2" />
                Αναλυτικά Στοιχεία
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
                  <p className="text-slate-400">Προσθήκη Νέου Τραπεζιού</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">Ενεργές Συνεδρίες</CardTitle>
                  <CardDescription className="text-slate-500">Παρακολουθήστε και διαχειριστείτε τα παιχνίδια σε εξέλιξη</CardDescription>
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
                          <div className="text-slate-500">Παίκτες:</div>
                          <div className="text-slate-300">{session.players.length} ({session.players.filter(p => p.type === 'local').length}Τ / {session.players.filter(p => p.type !== 'local').length}Α)</div>
                          <div className="text-slate-500">Έναρξη:</div>
                          <div className="text-slate-300">{session.startTime}</div>
                          <div className="text-slate-500">Διάρκεια:</div>
                          <div className="text-slate-300">{session.duration} λεπτά</div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleSaveSession(session.id)}>
                            <Save className="h-4 w-4 mr-2" /> Αποθήκ.
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleLoadSession(session.id)}>
                            <Download className="h-4 w-4 mr-2" /> Φόρτωση
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => setSelectedChatSessionId(session.id)}>
                            <MessageSquare className="h-4 w-4 mr-2" /> Συνομ.
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
                        <th className="py-3 px-4">Τραπέζι</th>
                        <th className="py-3 px-4">Παιχνίδι</th>
                        <th className="py-3 px-4">Παίκτες</th>
                        <th className="py-3 px-4">Έναρξη</th>
                        <th className="py-3 px-4">Διάρκεια</th>
                        <th className="py-3 px-4">Κατάσταση</th>
                        <th className="py-3 px-4">Ενέργειες</th>
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
                    <CardTitle className="text-xl font-bold text-white">Κρατήσεις</CardTitle>
                    <CardDescription className="text-slate-500">Προγραμματισμένες και εκκρεμείς κρατήσεις</CardDescription>
                  </div>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto" onClick={() => setIsReservationDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Νέα Κράτηση
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
                          <div className="text-slate-500">Ημερομηνία:</div>
                          <div className="text-slate-300">{reservation.date}</div>
                          <div className="text-slate-500">Ώρα:</div>
                          <div className="text-slate-300">{reservation.startTime} - {reservation.endTime}</div>
                          <div className="text-slate-500">Παίκτες:</div>
                          <div className="text-slate-300">{reservation.players}</div>
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-slate-800">
                          <Button size="sm" variant="ghost" className="flex-1">
                            <Edit className="h-4 w-4 mr-2" /> Επεξεργασία
                          </Button>
                          <Button size="sm" variant="ghost" className="flex-1 text-red-400">
                            <Trash2 className="h-4 w-4 mr-2" /> Διαγραφή
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
                    <Card key={rule.id} className="bg-slate-900 border-slate-700 hover:border-purple-500/50 transition-colors cursor-pointer" onClick={() => setSelectedRule(rule)}>
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
                    Ιστορικό Ζαριών Συνολικά
                  </CardTitle>
                  <CardDescription>Κατανομή ρίψεων ζαριών σε όλες τις ενεργές συνεδρίες</CardDescription>
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
                    Δημοφιλή Παιχνίδια
                  </CardTitle>
                  <CardDescription>Παιχνίδια με τις περισσότερες συνεδρίες αυτή την εβδομάδα</CardDescription>
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
                        <span className="text-sm text-slate-400">{game.sessions} συνεδρίες</span>
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
                    Στατιστικά Συνεδριών
                  </CardTitle>
                  <CardDescription>Βασικές μετρήσεις του χώρου σας</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Μέση Διάρκεια Συνεδρίας</span>
                        <span className="text-white font-medium">{stats.averageSessionDuration} λεπτά</span>
                      </div>
                      <Progress value={72} className="h-3" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Απομακρυσμένοι Παίκτες</span>
                        <span className="text-white font-medium">{stats.remotePlayersPercent}%</span>
                      </div>
                      <Progress value={stats.remotePlayersPercent} className="h-3" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Χρήση Τραπεζιών</span>
                        <span className="text-white font-medium">{Math.round((stats.activeTables / stats.totalTables) * 100)}%</span>
                      </div>
                      <Progress value={(stats.activeTables / stats.totalTables) * 100} className="h-3" />
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                      <h4 className="text-sm font-medium text-slate-400 mb-3">Κατανομή Παίκτων</h4>
                      <div className="flex gap-4">
                        <div className="flex-1 text-center p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-2xl font-bold text-green-400">{Math.round(stats.totalPlayersToday * (1 - stats.remotePlayersPercent / 100))}</p>
                          <p className="text-xs text-slate-400">Τοπικοί Παίκτες</p>
                        </div>
                        <div className="flex-1 text-center p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-400">{Math.round(stats.totalPlayersToday * (stats.remotePlayersPercent / 100) * 0.6)}</p>
                          <p className="text-xs text-slate-400">Απομακρυσμένοι (PC)</p>
                        </div>
                        <div className="flex-1 text-center p-3 bg-slate-700/50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-400">{Math.round(stats.totalPlayersToday * (stats.remotePlayersPercent / 100) * 0.4)}</p>
                          <p className="text-xs text-slate-400">Απομακρυσμένοι (VR)</p>
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
      
      <Sheet open={!!selectedRule} onOpenChange={(open) => !open && setSelectedRule(null)}>
        <SheetContent className="bg-slate-900 border-slate-800 text-slate-200 overflow-y-auto w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="text-white text-2xl font-black">{selectedRule?.title}</SheetTitle>
            <SheetDescription className="text-slate-400">
              <Badge variant="outline" className="mt-2 bg-purple-500/10 text-purple-400 border-purple-500/20">{selectedRule?.category}</Badge>
            </SheetDescription>
          </SheetHeader>
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <span className="flex items-center gap-2 text-slate-400 mb-1"><Users className="h-4 w-4 text-primary" /> Αριθμός Παίκτων</span>
                <span className="font-medium text-white">{selectedRule?.players}</span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <span className="flex items-center gap-2 text-slate-400 mb-1"><Clock className="h-4 w-4 text-primary" /> Εκτιμώμενος Χρόνος</span>
                <span className="font-medium text-white">{selectedRule?.time}</span>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-800">
              <h4 className="text-xl font-bold text-white mb-4">Περιγραφή & Κανόνες</h4>
              <p className="text-slate-300 leading-relaxed text-base whitespace-pre-wrap">
                {selectedRule?.description}
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                  <h5 className="font-bold text-primary mb-2">Στόχος του παιχνιδιού</h5>
                  <p className="text-sm text-slate-300">
                    Οι παίκτες ανταγωνίζονται για να μαζέψουν πόντους νίκης χτίζοντας, κάνοντας εμπόριο και επεκτείνοντας την επιρροή τους.
                  </p>
                </div>
                
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <h5 className="font-bold text-white mb-2">Βασικές Φάσεις</h5>
                  <ol className="list-decimal list-inside text-sm text-slate-400 space-y-2">
                    <li><strong className="text-slate-200">Συλλογή πόρων:</strong> Риψη ζαριών και διανομή πρώτων υλών.</li>
                    <li><strong className="text-slate-200">Εμπόριο:</strong> Ανταλλαγή πόρων με άλλους παίκτες ή την τράπεζα.</li>
                    <li><strong className="text-slate-200">Κατασκευή:</strong> Χρήση πόρων για δρόμους, οικισμούς κλπ.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
